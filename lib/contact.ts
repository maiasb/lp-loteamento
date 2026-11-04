// Acesso literal a process.env.NEXT_PUBLIC_*: o Next só substitui o valor assim.
const whatsappRaw = process.env.NEXT_PUBLIC_WHATSAPP ?? '';
const emailRaw = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? '';
const endpointRaw = (process.env.NEXT_PUBLIC_LEADS_ENDPOINT ?? '').trim();

const isPlaceholder = (v: string) =>
  !v || /CONFIGURAR|^0+$|^550+$|@example\.(com|org|net)$/i.test(v);

export const WHATSAPP_MISSING = isPlaceholder(whatsappRaw) || !/^55\d{10,11}$/.test(whatsappRaw);
export const EMAIL_MISSING = isPlaceholder(emailRaw);

/** Endereço de envio dos leads (Apps Script). Vazio/placeholder: em produção o build já falhou (CA-33). */
export const LEADS_ENDPOINT = /^https?:\/\//.test(endpointRaw) ? endpointRaw : '';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  ''
);

export const WHATSAPP_MESSAGE = 'Olá, quero conhecer o Loteamento Inteligente.';

/** Em desenvolvimento, o placeholder aparece marcado; em produção o build já falhou (CA-33). */
export const whatsappHref = WHATSAPP_MISSING
  ? '#contato'
  : `https://wa.me/${whatsappRaw}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export const whatsappDisplay = WHATSAPP_MISSING
  ? '[CONFIGURAR WHATSAPP]'
  : formatPhone(whatsappRaw);

export const email = EMAIL_MISSING ? '' : emailRaw;
export const emailDisplay = EMAIL_MISSING ? '[CONFIGURAR E-MAIL]' : emailRaw;
export const emailHref = EMAIL_MISSING ? '#contato' : `mailto:${emailRaw}`;

/** 5511912345678 -> +55 (11) 91234-5678 */
export function formatPhone(digits: string): string {
  const m = /^55(\d{2})(\d{4,5})(\d{4})$/.exec(digits);
  return m ? `+55 (${m[1]}) ${m[2]}-${m[3]}` : digits;
}
