// @ts-check
import { PHASE_PRODUCTION_BUILD } from 'next/constants.js';

/** Valores de exemplo do .env.example: o build de produção não pode sair com eles (CA-33). */
function isPlaceholder(value) {
  return !value || /CONFIGURAR|^0+$|^55(0+)$|@example\.(com|org|net)$/i.test(value.trim());
}

/**
 * Endereço de envio dos leads (CA-33): em produção só o aplicativo da web do Apps Script.
 * `allowLoopback` (variável `LEADS_ALLOW_LOOPBACK=1`, só no shell, não é NEXT_PUBLIC) libera
 * http://127.0.0.1 ou localhost para gerar um `out/` que aponta para o mock de QA
 * (scripts/mock-leads-endpoint.mjs). Nunca use em build de publicação.
 */
export function leadsEndpointProblem(value, allowLoopback = false) {
  const v = (value ?? '').trim();
  if (!v || /CONFIGURAR/i.test(v)) return 'NEXT_PUBLIC_LEADS_ENDPOINT ausente ou com placeholder';
  let url;
  try {
    url = new URL(v);
  } catch {
    return 'NEXT_PUBLIC_LEADS_ENDPOINT não é uma URL válida';
  }
  if (url.protocol === 'https:' && url.hostname === 'script.google.com') return null;
  if (
    allowLoopback &&
    url.protocol === 'http:' &&
    ['127.0.0.1', 'localhost'].includes(url.hostname)
  ) {
    return null;
  }
  return 'NEXT_PUBLIC_LEADS_ENDPOINT deve ser https://script.google.com/... (aplicativo da web do Apps Script)';
}

export function assertBuildConfig(env = process.env) {
  const problems = [];
  const whatsapp = env.NEXT_PUBLIC_WHATSAPP ?? '';
  const email = env.NEXT_PUBLIC_CONTACT_EMAIL ?? '';
  const site = env.NEXT_PUBLIC_SITE_URL ?? '';
  if (isPlaceholder(whatsapp) || !/^55\d{10,11}$/.test(whatsapp)) {
    problems.push('NEXT_PUBLIC_WHATSAPP ausente, com placeholder ou fora do formato 55DDDNÚMERO');
  }
  if (isPlaceholder(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    problems.push('NEXT_PUBLIC_CONTACT_EMAIL ausente, com placeholder ou inválido');
  }
  if (!/^https?:\/\/[^\s/]+/.test(site)) {
    problems.push('NEXT_PUBLIC_SITE_URL ausente ou inválida (ex.: https://dominio.com.br)');
  }
  const endpoint = leadsEndpointProblem(
    env.NEXT_PUBLIC_LEADS_ENDPOINT,
    env.LEADS_ALLOW_LOOPBACK === '1'
  );
  if (endpoint) problems.push(endpoint);
  if (problems.length > 0) {
    throw new Error(`Build de produção bloqueado (CA-33):\n- ${problems.join('\n- ')}`);
  }
}

/**
 * Site estático (RN-16): `out/` sem servidor. `headers()` não existe em export; os cabeçalhos de
 * segurança estão em public/_headers e a hospedagem precisa aplicá-los (README, PEND-06).
 * @type {(phase: string) => import('next').NextConfig}
 */
const config = (phase) => {
  if (phase === PHASE_PRODUCTION_BUILD) assertBuildConfig();
  return {
    output: 'export',
    poweredByHeader: false,
    reactStrictMode: true,
  };
};

export default config;
