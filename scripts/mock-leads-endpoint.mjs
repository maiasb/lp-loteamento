// Endpoint simulado do Apps Script, só para desenvolvimento e QA (não é backend do produto).
// Uso: node scripts/mock-leads-endpoint.mjs [porta]   (padrão 8787, ou PORT)
// Fala o contrato: POST text/plain com JSON -> {ok:true} | {ok:false,code:'invalid',fields}
// | {ok:false,code:'busy'} | {ok:false,code:'server'}. CORS aberto (o Apps Script responde com
// Access-Control-Allow-Origin: *). Guarda os envios só em memória e nunca os imprime.
//
// Controle (GET): /_mode?m=ok|invalid|busy|server|html|http500|slow|hang|drop  muda o comportamento
//                 /_log      JSON com os envios recebidos (submissionId, contagem, campos)
//                 /_reset    zera log e volta ao modo ok
import http from 'node:http';

const port = Number(process.argv[2] ?? process.env.PORT ?? 8787);
const SLOW_MS = Number(process.env.MOCK_SLOW_MS ?? 4000);
const HANG_MS = Number(process.env.MOCK_HANG_MS ?? 60000);

let mode = 'ok';
/** @type {{ at: string; submissionId: string; email: string; accepted: boolean; payload: Record<string, unknown> }[]} */
let log = [];
const seen = new Set();

const PROFILES = ['loteadora', 'imobiliaria', 'gestor'];
const RANGES = ['ate-100', '101-300', '301-1000', 'mais-1000', 'nao-sei'];

// Cópia reduzida das regras de lib/leads/validate.ts (o script real replica a validação inteira).
function validate(p) {
  const f = {};
  const s = (v) => (typeof v === 'string' ? v.trim() : '');
  if (!s(p.name)) f.name = 'Informe seu nome.';
  if (!/^\d{10,11}$/.test(s(p.whatsapp)))
    f.whatsapp = 'Informe um número com DDD, por exemplo (11) 91234-5678.';
  if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/.test(s(p.email))) {
    f.email = 'Informe um e-mail válido, por exemplo voce@empresa.com.br.';
  }
  if (!PROFILES.includes(p.profile)) f.profile = 'Escolha o seu perfil.';
  if (!s(p.company) && p.profile !== 'gestor') f.company = 'Informe o nome da empresa.';
  if (!RANGES.includes(p.lotsRange)) f.lotsRange = 'Escolha uma faixa de lotes.';
  if (p.consent !== true) f.consent = 'É preciso aceitar a política de privacidade para enviar.';
  return f;
}

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
  });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

function respond(res, payload) {
  const wait = (ms, fn) => setTimeout(fn, ms);
  switch (mode) {
    case 'busy':
      return send(res, 200, { ok: false, code: 'busy' });
    case 'server':
      return send(res, 200, { ok: false, code: 'server' });
    case 'html':
      return send(res, 200, '<!doctype html><title>Erro</title>', 'text/html; charset=utf-8');
    case 'http500':
      return send(res, 500, { ok: false, code: 'server' });
    case 'invalid':
      return send(res, 200, {
        ok: false,
        code: 'invalid',
        fields: { email: 'Informe um e-mail válido, por exemplo voce@empresa.com.br.' },
      });
    case 'drop':
      return res.destroy();
    case 'hang':
      return void wait(HANG_MS, () => send(res, 200, { ok: true }));
    case 'slow':
      return void wait(SLOW_MS, () => finish(res, payload));
    default:
      return finish(res, payload);
  }
}

function finish(res, payload) {
  const fields = validate(payload);
  if (Object.keys(fields).length > 0) return send(res, 200, { ok: false, code: 'invalid', fields });
  const id = String(payload.submissionId ?? '');
  const accepted = !payload.site_url_2 && !seen.has(id);
  if (accepted) seen.add(id);
  log.push({
    at: new Date().toISOString(),
    submissionId: id,
    email: String(payload.email),
    accepted,
    payload,
  });
  return send(res, 200, { ok: true }); // honeypot e repetido respondem igual ao sucesso (RN-06, RN-12)
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }
  if (req.method === 'GET' && url.pathname === '/_mode') {
    mode = url.searchParams.get('m') ?? 'ok';
    return send(res, 200, { mode });
  }
  if (req.method === 'GET' && url.pathname === '/_log') return send(res, 200, log);
  if (req.method === 'GET' && url.pathname === '/_reset') {
    mode = 'ok';
    log = [];
    seen.clear();
    return send(res, 200, { mode });
  }
  if (req.method !== 'POST') return send(res, 200, { ok: false, code: 'server' }); // GET nunca devolve dados
  let raw = '';
  req.on('data', (c) => {
    raw += c;
    if (raw.length > 32_768) req.destroy();
  });
  req.on('end', () => {
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return send(res, 200, { ok: false, code: 'server' });
    }
    if (typeof payload !== 'object' || payload === null)
      return send(res, 200, { ok: false, code: 'server' });
    respond(res, payload);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(
    `mock de leads em http://127.0.0.1:${port}/leads (modo ${mode}; controle: /_mode?m=...)`
  );
});
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => server.close(() => process.exit(0)));
