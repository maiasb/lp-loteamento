import { describe, expect, it } from 'vitest';
import { loadScript } from './load';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Opts = {
  lockOk?: boolean;
  mailFails?: boolean;
  ignoreTextFormat?: boolean; // simula o caso em que '@' NÃO impede a fórmula (aciona a salvaguarda)
  emptySheet?: boolean;
  props?: Record<string, string>;
};

const T0 = Date.UTC(2026, 10, 4, 15, 0, 0);

function makeEnv(opts: Opts = {}) {
  const clock = { now: T0 };
  const logs: string[] = [];
  const mails: any[] = [];
  const props: Record<string, string> = {
    SPREADSHEET_ID: 'sheet-id-fake',
    SHEET_NAME: 'Leads',
    POLICY_VERSIONS: '2026-11-04',
    NOTIFY_TO: 'dono@exemplo.test',
    ...opts.props,
  };
  const state = {
    rows: [] as any[][],
    formats: [] as string[][],
    maxRows: 1000,
    maxRead: 0,
    locks: 0,
    unlocks: 0,
  };
  if (!opts.emptySheet) state.rows.push([]); // linha 1 = cabeçalho (conteúdo irrelevante nos testes)

  const sheet = {
    getLastRow: () => state.rows.length,
    getMaxRows: () => state.maxRows,
    insertRowsAfter: (_p: number, n: number) => void (state.maxRows += n),
    deleteRow: (r: number) => void state.rows.splice(r - 1, 1),
    setFrozenRows: () => {},
    getRange(r: number, c: number, nr = 1, nc = 1) {
      const rng: any = {
        getValues: () => {
          state.maxRead = Math.max(state.maxRead, nr);
          return state.rows.slice(r - 1, r - 1 + nr).map((row) => {
            const out = row.slice(c - 1, c - 1 + nc);
            while (out.length < nc) out.push('');
            return out;
          });
        },
        setValues: (v: any[][]) => {
          v.forEach((vr, i) => {
            while (state.rows.length < r + i) state.rows.push([]);
            vr.forEach((x, j) => (state.rows[r - 1 + i]![c - 1 + j] = x));
          });
          return rng;
        },
        setValue: (x: any) => {
          while (state.rows.length < r) state.rows.push([]);
          state.rows[r - 1]![c - 1] = x;
          return rng;
        },
        setNumberFormats: (f: string[][]) => void (state.formats[r - 1] = f[0]!),
        setNumberFormat: () => rng,
        setFontWeight: () => rng,
        getFormulas: () => [
          (state.rows[r - 1] ?? []).slice(c - 1, c - 1 + nc).map((x, j) => {
            const fmt = state.formats[r - 1]?.[c - 1 + j];
            const isText = fmt === '@' && !opts.ignoreTextFormat;
            return typeof x === 'string' && x.startsWith('=') && !isText ? x : '';
          }),
        ],
      };
      return rng;
    },
  };
  const ss = {
    getSheetByName: (n: string) => (n === 'Leads' ? sheet : null),
    insertSheet: () => sheet,
    setSpreadsheetTimeZone: () => {},
    getUrl: () => 'https://docs.exemplo.test/planilha',
  };
  class FakeDate extends Date {
    constructor(...a: any[]) {
      if (a.length) super(...(a as [number]));
      else super(clock.now);
    }
    static now() {
      return clock.now;
    }
  }
  const globals = {
    Date: FakeDate,
    console: {
      log: (m: string) => logs.push(String(m)),
      warn: (m: string) => logs.push(String(m)),
      error: (m: string) => logs.push(String(m)),
    },
    SpreadsheetApp: { openById: () => ss, flush: () => {} },
    LockService: {
      getScriptLock: () => ({
        tryLock: () => opts.lockOk !== false,
        waitLock: () => {},
        releaseLock: () => void state.unlocks++,
      }),
    },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (k: string) => props[k] ?? null,
        setProperty: (k: string, v: string) => void (props[k] = v),
      }),
    },
    ContentService: {
      MimeType: { JSON: 'JSON' },
      createTextOutput: (s: string) => ({
        s,
        setMimeType() {
          return this;
        },
        getContent() {
          return this.s;
        },
      }),
    },
    MailApp: {
      sendEmail: (o: any) => {
        if (opts.mailFails) throw new Error('quota');
        mails.push(o);
      },
    },
    Utilities: { formatDate: (d: Date) => d.toISOString() },
  };
  const api = loadScript(globals);
  const post = (body: unknown) => {
    const contents = typeof body === 'string' ? body : JSON.stringify(body);
    return JSON.parse(api.doPost({ postData: { contents, type: 'text/plain' } }).getContent());
  };
  return { api, post, state, mails, logs, props, clock };
}

const lead = (i = 0, over: Record<string, unknown> = {}) => ({
  name: 'Maria Souza',
  company: 'Loteadora Exemplo',
  whatsapp: '11912345' + String(100 + i),
  email: `u${i}@empresa.com.br`,
  profile: 'loteadora',
  lotsRange: 'ate-100',
  consent: true,
  policyVersion: '2026-11-04',
  submissionId: `id-${i}-aaaaaaaa`,
  hp: '',
  ...over,
});

describe('doPost: caminho feliz', () => {
  it('grava uma linha completa e avisa por e-mail', () => {
    const env = makeEnv();
    expect(env.post(lead())).toEqual({ ok: true });
    expect(env.state.rows).toHaveLength(2);
    const row = env.state.rows[1]!;
    expect(row.slice(1, 7)).toEqual([
      'Maria Souza',
      '11912345100',
      'u0@empresa.com.br',
      'Loteadora Exemplo',
      'Loteadora / incorporadora',
      'Até 100',
    ]);
    expect(row[0]).toBeInstanceOf(Date);
    expect(row[7]).toBe(row[0]);
    expect(row.slice(8)).toEqual(['2026-11-04', 'não', 'novo', 'id-0-aaaaaaaa']);
    expect(env.mails).toHaveLength(1);
    expect(env.mails[0].subject).not.toContain('Maria');
    expect(env.state.unlocks).toBe(1);
  });

  it('sem NOTIFY_TO não envia e-mail', () => {
    const env = makeEnv({ props: { NOTIFY_TO: '' } });
    expect(env.post(lead())).toEqual({ ok: true });
    expect(env.mails).toHaveLength(0);
    expect(env.state.rows).toHaveLength(2);
  });

  it('GET não devolve dados', () => {
    const env = makeEnv();
    env.post(lead());
    const out = JSON.parse(env.api.doGet().getContent());
    expect(out).toEqual({ ok: true, service: 'leads' });
  });
});

describe('doPost: rejeições', () => {
  it('honeypot: responde ok sem gravar nem avisar (hp e site_url_2)', () => {
    const env = makeEnv();
    expect(env.post(lead(0, { hp: 'http://spam.test' }))).toEqual({ ok: true });
    expect(env.post(lead(1, { hp: '', site_url_2: 'x' }))).toEqual({ ok: true });
    expect(env.state.rows).toHaveLength(1);
    expect(env.mails).toHaveLength(0);
  });

  it('inválido: devolve erros por campo e não grava', () => {
    const env = makeEnv();
    const r = env.post(lead(0, { email: 'x', consent: false }));
    expect(r).toEqual({
      ok: false,
      code: 'invalid',
      fields: { email: env.api.MESSAGES.email, consent: env.api.MESSAGES.consent },
    });
    expect(env.state.rows).toHaveLength(1);
  });

  it('versão da política desconhecida é recusada', () => {
    const env = makeEnv();
    const r = env.post(lead(0, { policyVersion: 'velha' }));
    expect(r.code).toBe('invalid');
    expect(r.fields.policyVersion).toBeTruthy();
  });

  it.each([
    ['vazio', ''],
    ['JSON quebrado', '{"a":'],
    ['grande demais', JSON.stringify({ name: 'a'.repeat(30000) })],
  ])('corpo %s -> invalid', (_n, body) => {
    const env = makeEnv();
    expect(env.post(body)).toEqual({ ok: false, code: 'invalid', fields: {} });
  });

  it('corpo sem postData -> invalid', () => {
    const env = makeEnv();
    expect(JSON.parse(env.api.doPost({}).getContent()).code).toBe('invalid');
  });

  it('sem trava -> busy, nada gravado', () => {
    const env = makeEnv({ lockOk: false });
    expect(env.post(lead())).toEqual({ ok: false, code: 'busy' });
    expect(env.state.rows).toHaveLength(1);
  });

  it('configuração ausente -> server', () => {
    const env = makeEnv({ props: { SPREADSHEET_ID: '' } });
    expect(env.post(lead())).toEqual({ ok: false, code: 'server' });
  });
});

describe('doPost: deduplicação (RN-12)', () => {
  it('mesmo submissionId duas vezes -> uma linha, dois ok, um e-mail', () => {
    const env = makeEnv();
    expect(env.post(lead())).toEqual({ ok: true });
    env.clock.now += 20_000; // reenvio após timeout do cliente
    expect(env.post(lead(0, { email: 'outro@empresa.com.br' }))).toEqual({ ok: true });
    expect(env.state.rows).toHaveLength(2);
    expect(env.mails).toHaveLength(1);
  });

  it('mesmo e-mail+WhatsApp com outro submissionId: dedupa em 2 min, grava depois', () => {
    const env = makeEnv();
    env.post(lead());
    env.clock.now += 60_000;
    env.post(lead(0, { submissionId: 'id-novo-bbbbbbbb' }));
    expect(env.state.rows).toHaveLength(2);
    env.clock.now += 120_000;
    env.post(lead(0, { submissionId: 'id-novo-cccccccc' }));
    expect(env.state.rows).toHaveLength(3);
  });

  it('lê só as últimas linhas da planilha', () => {
    const env = makeEnv();
    for (let i = 0; i < 5000; i++)
      env.state.rows.push([new Date(T0 - 99_999_999), 'x', '1', 'x@y.co']);
    env.post(lead());
    expect(env.state.maxRead).toBeLessThanOrEqual(200);
  });
});

describe('doPost: surto (RN-07)', () => {
  it('marca suspeito, suspende aviso por lead e manda um único alerta por janela', () => {
    const env = makeEnv({ props: { SURGE_MAX: '3', SURGE_WINDOW_MIN: '10' } });
    for (let i = 0; i < 3; i++) {
      env.post(lead(i));
      env.clock.now += 1000;
    }
    expect(env.mails).toHaveLength(3);
    for (let i = 3; i < 8; i++) {
      expect(env.post(lead(i))).toEqual({ ok: true }); // nenhum envio válido é recusado
      env.clock.now += 1000;
    }
    const suspects = env.state.rows.slice(1).map((r) => r[env.api.COL.suspect]);
    expect(suspects).toEqual(['não', 'não', 'não', 'sim', 'sim', 'sim', 'sim', 'sim']);
    expect(env.mails).toHaveLength(4); // 3 avisos + 1 alerta de surto
    expect(env.mails[3].subject).toContain('Surto');
    expect(env.mails[3].body).not.toContain('empresa.com.br'); // alerta sem dados pessoais

    env.clock.now += 11 * 60_000; // janela passou: volta ao normal
    env.post(lead(20));
    expect(env.state.rows.at(-1)![env.api.COL.suspect]).toBe('não');
    expect(env.mails).toHaveLength(5);
  });
});

describe('doPost: falha de e-mail (RN-09, CA-26)', () => {
  it('mantém a linha, responde ok e não loga dado pessoal', () => {
    const env = makeEnv({ mailFails: true });
    expect(env.post(lead())).toEqual({ ok: true });
    expect(env.state.rows).toHaveLength(2);
    const all = env.logs.join('\n');
    expect(all).toContain('notify');
    for (const pii of ['Maria', 'u0@empresa', '11912345', 'Loteadora Exemplo']) {
      expect(all).not.toContain(pii);
    }
  });
});

describe('proteção contra fórmula (RN-14, CA-36)', () => {
  const evil = '=HYPERLINK("http://exemplo.test";"x")';

  it('grava com formato de texto e o texto exato', () => {
    const env = makeEnv();
    env.post(lead(0, { name: evil, email: '+x@empresa.com.br' }));
    const row = env.state.rows[1]!;
    expect(row[env.api.COL.name]).toBe(evil);
    expect(row[env.api.COL.email]).toBe('+x@empresa.com.br');
    expect(env.state.formats[1]![env.api.COL.name]).toBe('@');
    expect(env.state.formats[1]![env.api.COL.whatsapp]).toBe('@');
  });

  it('salvaguarda: se o Sheets avaliar mesmo assim, regrava com apóstrofo', () => {
    const env = makeEnv({ ignoreTextFormat: true });
    env.post(lead(0, { name: evil }));
    expect(env.state.rows[1]![env.api.COL.name]).toBe("'" + evil);
    expect(env.logs.join('\n')).toContain('guarda_formula_acionada');
  });
});

describe('setup e retencao', () => {
  it('setup escreve o cabeçalho na aba vazia', () => {
    const env = makeEnv({ emptySheet: true });
    env.api.setup();
    expect(env.state.rows[0]).toEqual(env.api.HEADERS);
  });

  it('setup recusa cabeçalho diferente', () => {
    const env = makeEnv();
    env.state.rows[0] = ['outra', 'coisa'];
    expect(() => env.api.setup()).toThrow(/cabecalho_diferente/);
  });

  it('retencao desligada sem RETENTION_DAYS ou com menos de 30', () => {
    const env = makeEnv({ props: { RETENTION_DAYS: '7' } });
    env.state.rows.push([new Date(T0 - 400 * 86_400_000)]);
    env.api.retencao();
    expect(env.state.rows).toHaveLength(2);
  });

  it('retencao apaga só as linhas mais antigas que o prazo', () => {
    const env = makeEnv({ props: { RETENTION_DAYS: '90' } });
    env.state.rows.push(
      [new Date(T0 - 100 * 86_400_000)],
      [new Date(T0 - 10 * 86_400_000)],
      [new Date(T0 - 91 * 86_400_000)]
    );
    env.api.retencao();
    expect(env.state.rows).toHaveLength(2);
    expect(env.state.rows[1]![0].getTime()).toBe(T0 - 10 * 86_400_000);
  });
});
