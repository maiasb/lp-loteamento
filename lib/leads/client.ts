import { POLICY_VERSION } from '@/lib/policy';
import { FIELDS, HONEYPOT_FIELD, type Lead, type LeadErrors } from './validate';

/** Tempo máximo à espera do Apps Script (CA-22, RNF-14). */
export const SUBMIT_TIMEOUT_MS = 15_000;

/** Corpo enviado ao Apps Script (contrato fixo; o script replica a validação de `validate.ts`). */
export type LeadPayload = {
  name: string;
  company: string;
  whatsapp: string;
  email: string;
  profile: Lead['profile'];
  lotsRange: Lead['lotsRange'];
  consent: true;
  policyVersion: string;
  submissionId: string;
  [HONEYPOT_FIELD]: string;
};

export type SubmitResult =
  | { status: 'success' }
  | { status: 'invalid'; errors: LeadErrors }
  | { status: 'busy' }
  | { status: 'server' }
  | { status: 'network' }
  | { status: 'timeout' };

export function buildPayload(
  data: Lead,
  meta: { submissionId: string; honeypot?: string }
): LeadPayload {
  return {
    name: data.name,
    company: data.company ?? '',
    whatsapp: data.whatsapp,
    email: data.email,
    profile: data.profile,
    lotsRange: data.lotsRange,
    consent: true,
    policyVersion: POLICY_VERSION,
    submissionId: meta.submissionId,
    [HONEYPOT_FIELD]: meta.honeypot ?? '',
  };
}

export function newSubmissionId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  // randomUUID só existe em contexto seguro (https/localhost); fallback com getRandomValues.
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6]! & 0x0f) | 0x40;
  b[8] = (b[8]! & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/**
 * Mantém o mesmo submissionId nas retentativas do mesmo envio (mesmos dados). Dados diferentes
 * ou `reset()` (após o sucesso) geram um id novo.
 */
export function createSubmissionIds(generate: () => string = newSubmissionId) {
  let current: { id: string; key: string } | null = null;
  return {
    idFor(data: Lead): string {
      const key = JSON.stringify(data);
      if (!current || current.key !== key) current = { id: generate(), key };
      return current.id;
    },
    reset() {
      current = null;
    },
  };
}

function parseResponse(body: unknown): SubmitResult {
  if (typeof body !== 'object' || body === null) return { status: 'server' };
  const r = body as { ok?: unknown; code?: unknown; fields?: unknown };
  if (r.ok === true) return { status: 'success' };
  if (r.ok !== false) return { status: 'server' };
  if (r.code === 'busy') return { status: 'busy' };
  if (r.code === 'invalid' && typeof r.fields === 'object' && r.fields !== null) {
    const errors: LeadErrors = {};
    for (const f of FIELDS) {
      const msg = (r.fields as Record<string, unknown>)[f];
      if (typeof msg === 'string' && msg) errors[f] = msg;
    }
    // "invalid" sem nenhum campo conhecido não dá o que mostrar: trata como falha do servidor.
    return Object.keys(errors).length > 0 ? { status: 'invalid', errors } : { status: 'server' };
  }
  return { status: 'server' };
}

/**
 * Envia o lead e devolve o resultado lido da resposta. `success` só com `{ok:true}` no corpo.
 * Content-Type text/plain evita o preflight CORS; `redirect: 'follow'` segue o redirecionamento do
 * Apps Script até a resposta. Nunca registra dados no console.
 */
export async function sendLead(
  endpoint: string,
  payload: LeadPayload,
  options: { timeoutMs?: number; fetchImpl?: typeof fetch } = {}
): Promise<SubmitResult> {
  const { timeoutMs = SUBMIT_TIMEOUT_MS, fetchImpl = fetch } = options;
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    const res = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      credentials: 'omit',
      signal: controller.signal,
    });
    // O Apps Script devolve erros de negócio com HTTP 200: decide só o JSON, nunca o status.
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      // Corpo que não é JSON (página de erro/login do Google) é falha do servidor; abort é tempo esgotado.
      return timedOut ? { status: 'timeout' } : { status: 'server' };
    }
    return parseResponse(body);
  } catch {
    return timedOut ? { status: 'timeout' } : { status: 'network' };
  } finally {
    clearTimeout(timer);
  }
}
