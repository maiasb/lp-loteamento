import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SUBMIT_TIMEOUT_MS,
  buildPayload,
  createSubmissionIds,
  newSubmissionId,
  sendLead,
  type LeadPayload,
} from '@/lib/leads/client';
import { POLICY_VERSION } from '@/lib/policy';
import { validateLead, type Lead } from '@/lib/leads/validate';

const ENDPOINT = 'https://script.google.com/macros/s/FAKE/exec';

const lead: Lead = {
  name: 'Maria Souza',
  whatsapp: '11912345678',
  email: 'maria@empresa.com.br',
  company: 'Loteadora Exemplo',
  profile: 'loteadora',
  lotsRange: '101-300',
};
const payload = (): LeadPayload => buildPayload(lead, { submissionId: 'id-1' });

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(typeof body === 'string' ? body : JSON.stringify(body), { status: 200, ...init });
const fetchReturning = (res: Response | (() => Promise<Response>)) =>
  vi.fn(async () => (typeof res === 'function' ? res() : res));

describe('buildPayload', () => {
  it('serializa exatamente o contrato do endpoint', () => {
    expect(payload()).toEqual({
      name: 'Maria Souza',
      company: 'Loteadora Exemplo',
      whatsapp: '11912345678',
      email: 'maria@empresa.com.br',
      profile: 'loteadora',
      lotsRange: '101-300',
      consent: true,
      policyVersion: POLICY_VERSION,
      submissionId: 'id-1',
      site_url_2: '',
    });
  });
  it('empresa ausente (gestor) vai como string vazia e o WhatsApp só com dígitos', () => {
    const result = validateLead({
      name: 'Ana',
      whatsapp: '+55 (11) 91234-5678',
      email: 'ana@x.com.br',
      profile: 'gestor',
      lotsRange: 'nao-sei',
      consent: 'on',
    });
    if (!result.ok) throw new Error('esperava válido');
    const p = buildPayload(result.data, { submissionId: 'id-2' });
    expect(p.company).toBe('');
    expect(p.whatsapp).toBe('11912345678');
  });
  it('honeypot preenchido segue no corpo (o script descarta, RN-06)', () => {
    expect(buildPayload(lead, { submissionId: 'a', honeypot: 'http://spam' }).site_url_2).toBe(
      'http://spam'
    );
  });
});

describe('sendLead: requisição', () => {
  it('POST text/plain (sem preflight), redirect follow, corpo JSON do payload', async () => {
    const fetchImpl = fetchReturning(jsonResponse({ ok: true }));
    await sendLead(ENDPOINT, payload(), { fetchImpl });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(ENDPOINT);
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'text/plain;charset=utf-8' });
    expect(init.redirect).toBe('follow');
    expect(init.credentials).toBe('omit');
    expect(JSON.parse(init.body as string)).toEqual(payload());
  });
});

describe('sendLead: respostas', () => {
  const run = (res: Response) => sendLead(ENDPOINT, payload(), { fetchImpl: fetchReturning(res) });

  it('sucesso só com {ok:true}', async () => {
    expect(await run(jsonResponse({ ok: true }))).toEqual({ status: 'success' });
  });
  it.each([{}, { ok: 'true' }, { success: true }, [], null, 'texto'])(
    'resposta sem ok:true (%j) não é sucesso',
    async (body) => {
      expect((await run(jsonResponse(body))).status).toBe('server');
    }
  );
  it('invalid devolve as mensagens por campo e ignora campos desconhecidos', async () => {
    const result = await run(
      jsonResponse({
        ok: false,
        code: 'invalid',
        fields: { email: 'E-mail inválido.', whatsapp: 'Número inválido.', outro: 'x', name: 1 },
      })
    );
    expect(result).toEqual({
      status: 'invalid',
      errors: { email: 'E-mail inválido.', whatsapp: 'Número inválido.' },
    });
  });
  it('invalid sem campo conhecido vira falha do servidor', async () => {
    expect((await run(jsonResponse({ ok: false, code: 'invalid', fields: {} }))).status).toBe(
      'server'
    );
    expect((await run(jsonResponse({ ok: false, code: 'invalid' }))).status).toBe('server');
  });
  it('invalid só com policyVersion/submissionId (campos invisíveis) é falha geral', async () => {
    const res = jsonResponse({
      ok: false,
      code: 'invalid',
      fields: { policyVersion: 'x', submissionId: 'y' },
    });
    expect((await run(res)).status).toBe('server');
  });
  it('busy e server', async () => {
    expect(await run(jsonResponse({ ok: false, code: 'busy' }))).toEqual({ status: 'busy' });
    expect(await run(jsonResponse({ ok: false, code: 'server' }))).toEqual({ status: 'server' });
    expect((await run(jsonResponse({ ok: false, code: 'novo' }))).status).toBe('server');
  });
  it('decide só pelo JSON, não pelo status HTTP; corpo que não é JSON (página do Google) é falha do servidor', async () => {
    expect((await run(jsonResponse({ ok: true }, { status: 500 }))).status).toBe('success');
    expect((await run(jsonResponse({ ok: false, code: 'busy' }, { status: 500 }))).status).toBe(
      'busy'
    );
    expect((await run(jsonResponse('erro', { status: 500 }))).status).toBe('server');
    expect((await run(jsonResponse('<html>login</html>'))).status).toBe('server');
  });
  it('falha de rede (fetch rejeita) é network, sem sucesso', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    expect(await sendLead(ENDPOINT, payload(), { fetchImpl })).toEqual({ status: 'network' });
  });
  it('não escreve no console (sem dado pessoal em log)', async () => {
    const spies = (['log', 'warn', 'error', 'info'] as const).map((m) =>
      vi.spyOn(console, m).mockImplementation(() => {})
    );
    await run(jsonResponse({ ok: false, code: 'server' }));
    await sendLead(ENDPOINT, payload(), {
      fetchImpl: vi.fn(async () => {
        throw new TypeError('x');
      }),
    });
    for (const s of spies) expect(s).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});

describe('sendLead: tempo esgotado', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const hangingFetch = () =>
    vi.fn(
      (_url: unknown, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError'))
          );
        })
    );

  it('aborta em 15 s e devolve timeout (não network)', async () => {
    expect(SUBMIT_TIMEOUT_MS).toBe(15_000);
    const fetchImpl = hangingFetch();
    const pending = sendLead(ENDPOINT, payload(), { fetchImpl });
    await vi.advanceTimersByTimeAsync(14_999);
    let settled = false;
    void pending.then(() => (settled = true));
    await Promise.resolve();
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(await pending).toEqual({ status: 'timeout' });
  });
  it('resposta dentro do prazo cancela o temporizador', async () => {
    const fetchImpl = fetchReturning(jsonResponse({ ok: true }));
    expect(await sendLead(ENDPOINT, payload(), { fetchImpl })).toEqual({ status: 'success' });
    expect(vi.getTimerCount()).toBe(0);
  });
  it('corpo que trava depois do cabeçalho também é timeout', async () => {
    const fetchImpl = vi.fn(async (_url: unknown, init?: RequestInit) => {
      const res = {
        ok: true,
        json: () =>
          new Promise((_r, reject) =>
            init?.signal?.addEventListener('abort', () =>
              reject(new DOMException('a', 'AbortError'))
            )
          ),
      };
      return res as unknown as Response;
    });
    const pending = sendLead(ENDPOINT, payload(), { fetchImpl, timeoutMs: 1000 });
    await vi.advanceTimersByTimeAsync(1000);
    expect(await pending).toEqual({ status: 'timeout' });
  });
});

describe('submissionId', () => {
  it('gera UUID v4', () => {
    expect(newSubmissionId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });
  it('fallback sem randomUUID (contexto inseguro) mantém o formato', () => {
    vi.stubGlobal('crypto', { getRandomValues: crypto.getRandomValues.bind(crypto) });
    try {
      expect(newSubmissionId()).toMatch(/^[0-9a-f-]{36}$/);
      expect(newSubmissionId()).toMatch(/-4[0-9a-f]{3}-[89ab]/);
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it('reaproveita o id nas retentativas dos mesmos dados e troca com dados novos ou após reset', () => {
    let n = 0;
    const ids = createSubmissionIds(() => `id-${++n}`);
    expect(ids.idFor(lead)).toBe('id-1');
    expect(ids.idFor({ ...lead })).toBe('id-1'); // retentativa (timeout/rede/busy)
    expect(ids.idFor({ ...lead, name: 'Maria S.' })).toBe('id-2'); // dados mudaram
    expect(ids.idFor({ ...lead, name: 'Maria S.' })).toBe('id-2');
    ids.reset(); // após sucesso
    expect(ids.idFor({ ...lead, name: 'Maria S.' })).toBe('id-3');
  });
  it('o mesmo id vai no corpo das duas tentativas', async () => {
    const ids = createSubmissionIds(() => 'fixo');
    const sent: string[] = [];
    const fetchImpl = vi.fn(async (_u: unknown, init?: RequestInit) => {
      sent.push((JSON.parse(init?.body as string) as LeadPayload).submissionId);
      return sent.length === 1 ? Promise.reject(new TypeError('x')) : jsonResponse({ ok: true });
    });
    for (let i = 0; i < 2; i++) {
      await sendLead(ENDPOINT, buildPayload(lead, { submissionId: ids.idFor(lead) }), {
        fetchImpl,
      });
    }
    expect(sent).toEqual(['fixo', 'fixo']);
  });
});
