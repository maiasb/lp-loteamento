export const PROFILES = [
  { value: 'loteadora', label: 'Loteadora / incorporadora' },
  { value: 'imobiliaria', label: 'Imobiliária' },
  { value: 'gestor', label: 'Gestor comercial' },
] as const;

export const LOT_RANGES = [
  { value: 'ate-100', label: 'Até 100' },
  { value: '101-300', label: 'De 101 a 300' },
  { value: '301-1000', label: 'De 301 a 1.000' },
  { value: 'mais-1000', label: 'Mais de 1.000' },
  { value: 'nao-sei', label: 'Ainda não sei' },
] as const;

export type Profile = (typeof PROFILES)[number]['value'];
export type LotsRange = (typeof LOT_RANGES)[number]['value'];

export const MAX_TEXT = 120;
export const MAX_EMAIL = 254;
export const HONEYPOT_FIELD = 'site_url_2';

export const FIELDS = [
  'name',
  'whatsapp',
  'email',
  'company',
  'profile',
  'lotsRange',
  'consent',
] as const;
export type LeadField = (typeof FIELDS)[number];

export type RawLead = Partial<Record<LeadField, string>>;
export type LeadErrors = Partial<Record<LeadField, string>>;

export type Lead = {
  name: string;
  whatsapp: string;
  email: string;
  company: string | null;
  profile: Profile;
  lotsRange: LotsRange;
};

export type ValidationResult = { ok: true; data: Lead } | { ok: false; errors: LeadErrors };

export const MESSAGES = {
  name: 'Informe seu nome.',
  nameLong: `Use até ${MAX_TEXT} caracteres.`,
  whatsappEmpty: 'Informe seu WhatsApp.',
  whatsapp: 'Informe um número com DDD, por exemplo (11) 91234-5678.',
  emailEmpty: 'Informe seu e-mail.',
  email: 'Informe um e-mail válido, por exemplo voce@empresa.com.br.',
  company: 'Informe o nome da empresa.',
  profile: 'Escolha o seu perfil.',
  lotsRange: 'Escolha uma faixa de lotes.',
  consent: 'É preciso aceitar a política de privacidade para enviar.',
} as const;

// Só ASCII comum: recusa < > " , ; : ( ) e afins, que o parser de endereços do e-mail interpretaria.
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;

// Largura zero, marcas e isolamentos bidi (U+200B-200F, U+202A-202E, U+2060-2069, U+FEFF).
const INVISIBLE_RE = /[\u200b-\u200f\u202a-\u202e\u2060-\u2069\ufeff]/g;

/** Limite do que o servidor lê e devolve por campo (acima do máximo validado: nunca valida o que foi cortado). */
export const FIELD_LIMITS: Record<LeadField, number> = {
  name: 400,
  whatsapp: 60,
  email: 320,
  company: 400,
  profile: 20,
  lotsRange: 20,
  consent: 10,
};

/** Troca caracteres de controle (inclui CR/LF) por espaço, remove os invisíveis de formatação e apara. */
export function cleanText(value: string | undefined): string {
  return (value ?? '')
    .replace(INVISIBLE_RE, '')
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .trim();
}

/** Aceita "(11) 91234-5678", "+55 11 91234-5678" etc.; devolve só dígitos (10 ou 11) ou null. */
export function normalizeWhatsapp(value: string | undefined): string | null {
  let digits = (value ?? '').replace(/\D/g, '');
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
    digits = digits.slice(2);
  }
  if (digits.length !== 10 && digits.length !== 11) return null;
  if (digits.startsWith('0') || digits[1] === '0') return null; // DDD 11..99
  if (digits.length === 11 && digits[2] !== '9') return null; // celular
  return digits;
}

export function validateLead(raw: RawLead): ValidationResult {
  const errors: LeadErrors = {};

  const name = cleanText(raw.name);
  if (!name) errors.name = MESSAGES.name;
  else if (name.length > MAX_TEXT) errors.name = MESSAGES.nameLong;

  const whatsappRaw = (raw.whatsapp ?? '').trim();
  const whatsapp = normalizeWhatsapp(whatsappRaw);
  if (!whatsappRaw) errors.whatsapp = MESSAGES.whatsappEmpty;
  else if (!whatsapp) errors.whatsapp = MESSAGES.whatsapp;

  const email = (raw.email ?? '').trim();
  if (!email) errors.email = MESSAGES.emailEmpty;
  else if (email.length > MAX_EMAIL || !EMAIL_RE.test(email)) errors.email = MESSAGES.email;

  const profile = PROFILES.find((p) => p.value === raw.profile)?.value;
  if (!profile) errors.profile = MESSAGES.profile;

  // PEND-10 (decidido pelo dono): empresa opcional só para "Gestor comercial".
  const company = cleanText(raw.company);
  if (company.length > MAX_TEXT) errors.company = MESSAGES.nameLong;
  else if (!company && profile !== 'gestor') errors.company = MESSAGES.company;

  const lotsRange = LOT_RANGES.find((r) => r.value === raw.lotsRange)?.value;
  if (!lotsRange) errors.lotsRange = MESSAGES.lotsRange;

  if (raw.consent !== 'on') errors.consent = MESSAGES.consent;

  if (Object.keys(errors).length > 0 || !whatsapp || !profile || !lotsRange) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    data: { name, whatsapp, email, company: company || null, profile, lotsRange },
  };
}

export function readForm(formData: FormData): RawLead {
  const raw: RawLead = {};
  for (const field of FIELDS) {
    const value = formData.get(field);
    if (typeof value === 'string') raw[field] = value.slice(0, FIELD_LIMITS[field]);
  }
  return raw;
}
