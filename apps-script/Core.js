/**
 * Núcleo puro do script de recebimento de leads: validação, sanitização e regras de
 * deduplicação/surto. NÃO usa nenhum serviço do Google, por isso roda em Node nos testes
 * (tests/apps-script). Referência das regras: lib/leads/validate.ts (será removido; esta cópia
 * passa a ser a única) e spec 001 RN-07, RN-10, RN-11, RN-12, RN-14.
 *
 * No Apps Script, todos os arquivos do projeto compartilham o mesmo escopo global.
 */

const MAX_TEXT = 120;
const MAX_EMAIL = 254;

const PROFILES = [
  { value: 'loteadora', label: 'Loteadora / incorporadora' },
  { value: 'imobiliaria', label: 'Imobiliária' },
  { value: 'gestor', label: 'Gestor comercial' },
];

const LOT_RANGES = [
  { value: 'ate-100', label: 'Até 100' },
  { value: '101-300', label: 'De 101 a 300' },
  { value: '301-1000', label: 'De 301 a 1.000' },
  { value: 'mais-1000', label: 'Mais de 1.000' },
  { value: 'nao-sei', label: 'Ainda não sei' },
];

const MESSAGES = {
  name: 'Informe seu nome.',
  nameLong: 'Use até ' + MAX_TEXT + ' caracteres.',
  whatsappEmpty: 'Informe seu WhatsApp.',
  whatsapp: 'Informe um número com DDD, por exemplo (11) 91234-5678.',
  emailEmpty: 'Informe seu e-mail.',
  email: 'Informe um e-mail válido, por exemplo voce@empresa.com.br.',
  company: 'Informe o nome da empresa.',
  profile: 'Escolha o seu perfil.',
  lotsRange: 'Escolha uma faixa de lotes.',
  consent: 'É preciso aceitar a política de privacidade para enviar.',
  policyVersion: 'Versão da política não reconhecida. Recarregue a página e tente de novo.',
  submissionId: 'Envio inválido. Recarregue a página e tente de novo.',
};

// Corte de cada campo antes de validar (acima do máximo validado: nunca valida o que foi cortado).
const FIELD_LIMITS = {
  name: 400,
  whatsapp: 60,
  email: 320,
  company: 400,
  profile: 20,
  lotsRange: 20,
  policyVersion: 40,
  submissionId: 64,
  hp: 200,
};

// Só ASCII comum: recusa < > " , ; : ( ) e afins.
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;
const SUBMISSION_ID_RE = /^[A-Za-z0-9-]{8,64}$/;
// Largura zero, marcas e isolamentos bidi (U+200B-200F, U+202A-202E, U+2060-2069, U+FEFF).
const INVISIBLE_RE = /[​-‏‪-‮⁠-⁩﻿]/g;
const FORMULA_START_RE = /^[=+\-@\t\r]/;

// Ordem das colunas da planilha (spec seção 8 + status e ID do envio).
const HEADERS = [
  'Recebido em',
  'Nome',
  'WhatsApp',
  'E-mail',
  'Empresa',
  'Perfil',
  'Faixa de lotes',
  'Consentimento em',
  'Versão da política',
  'Suspeito',
  'Status',
  'ID do envio',
];
const COL = {
  receivedAt: 0,
  name: 1,
  whatsapp: 2,
  email: 3,
  company: 4,
  profile: 5,
  lotsRange: 6,
  consentAt: 7,
  policyVersion: 8,
  suspect: 9,
  status: 10,
  submissionId: 11,
};

/** Só aceita string; corta no limite. Qualquer outro tipo vira ''. */
function readString(value, limit) {
  return typeof value === 'string' ? value.slice(0, limit) : '';
}

/** Lê o JSON já parseado e devolve campos cortados e tipados (consent só true). */
function readPayload(obj) {
  const o = obj && typeof obj === 'object' ? obj : {};
  return {
    name: readString(o.name, FIELD_LIMITS.name),
    whatsapp: readString(o.whatsapp, FIELD_LIMITS.whatsapp),
    email: readString(o.email, FIELD_LIMITS.email),
    company: readString(o.company, FIELD_LIMITS.company),
    profile: readString(o.profile, FIELD_LIMITS.profile),
    lotsRange: readString(o.lotsRange, FIELD_LIMITS.lotsRange),
    consent: o.consent === true,
    policyVersion: readString(o.policyVersion, FIELD_LIMITS.policyVersion),
    submissionId: readString(o.submissionId, FIELD_LIMITS.submissionId),
    // Contrato: chave `hp`; aceita também o nome do campo HTML (site_url_2).
    hp: readString(o.hp, FIELD_LIMITS.hp) + readString(o.site_url_2, FIELD_LIMITS.hp),
  };
}

function isHoneypotFilled(payload) {
  return payload.hp.trim() !== '';
}

/** Troca caracteres de controle (inclui CR/LF) por espaço, remove invisíveis e apara. */
function cleanText(value) {
  return (value || '')
    .replace(INVISIBLE_RE, '')
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .trim();
}

/** Aceita "(11) 91234-5678", "+55 11 91234-5678"; devolve só dígitos (10 ou 11) ou null. */
function normalizeWhatsapp(value) {
  let digits = (value || '').replace(/\D/g, '');
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
    digits = digits.slice(2);
  }
  if (digits.length !== 10 && digits.length !== 11) return null;
  if (digits.startsWith('0') || digits[1] === '0') return null; // DDD 11..99
  if (digits.length === 11 && digits[2] !== '9') return null; // celular
  return digits;
}

function findByValue(list, value) {
  for (let i = 0; i < list.length; i++) if (list[i].value === value) return list[i];
  return null;
}

/**
 * Valida o payload (já passado por readPayload) e devolve
 * { ok: true, data } ou { ok: false, errors: { campo: mensagem } }.
 * policyVersion e submissionId são conferidos aqui; a lista de versões aceitas vem de fora.
 */
function validateLead(p, acceptedPolicyVersions) {
  const errors = {};

  const name = cleanText(p.name);
  if (!name) errors.name = MESSAGES.name;
  else if (name.length > MAX_TEXT) errors.name = MESSAGES.nameLong;

  const whatsappRaw = p.whatsapp.trim();
  const whatsapp = normalizeWhatsapp(whatsappRaw);
  if (!whatsappRaw) errors.whatsapp = MESSAGES.whatsappEmpty;
  else if (!whatsapp) errors.whatsapp = MESSAGES.whatsapp;

  const email = p.email.trim();
  if (!email) errors.email = MESSAGES.emailEmpty;
  else if (email.length > MAX_EMAIL || !EMAIL_RE.test(email)) errors.email = MESSAGES.email;

  const profile = findByValue(PROFILES, p.profile);
  if (!profile) errors.profile = MESSAGES.profile;

  // PEND-10 (decidido pelo dono): empresa opcional só para "Gestor comercial".
  const company = cleanText(p.company);
  if (company.length > MAX_TEXT) errors.company = MESSAGES.nameLong;
  else if (!company && (!profile || profile.value !== 'gestor')) errors.company = MESSAGES.company;

  const lotsRange = findByValue(LOT_RANGES, p.lotsRange);
  if (!lotsRange) errors.lotsRange = MESSAGES.lotsRange;

  if (p.consent !== true) errors.consent = MESSAGES.consent;

  // RN-10: versão da política precisa estar na lista aceita.
  if (acceptedPolicyVersions.indexOf(p.policyVersion) === -1) {
    errors.policyVersion = MESSAGES.policyVersion;
  }
  if (!SUBMISSION_ID_RE.test(p.submissionId)) errors.submissionId = MESSAGES.submissionId;

  if (Object.keys(errors).length > 0 || !whatsapp || !profile || !lotsRange) {
    return { ok: false, errors: errors };
  }
  return {
    ok: true,
    data: {
      name: name,
      whatsapp: whatsapp,
      email: email,
      company: company || null,
      profile: profile,
      lotsRange: lotsRange,
      policyVersion: p.policyVersion,
      submissionId: p.submissionId,
    },
  };
}

/** Prefixa apóstrofo em texto que o Sheets poderia interpretar como fórmula (RN-14). */
function neutralizeFormula(text) {
  return FORMULA_START_RE.test(text) ? "'" + text : text;
}

function toMs(cell) {
  return cell !== null && typeof cell === 'object' && typeof cell.getTime === 'function'
    ? cell.getTime()
    : NaN;
}

/**
 * Duplicata (RN-12): mesmo submissionId nas linhas recentes, OU mesmo e-mail + WhatsApp dentro
 * da janela. `rows` são só as últimas N linhas da planilha (arrays de células).
 */
function isDuplicate(rows, data, nowMs, windowMs) {
  const email = data.email.toLowerCase();
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (String(row[COL.submissionId]) === data.submissionId) return true;
    const t = toMs(row[COL.receivedAt]);
    if (
      !isNaN(t) &&
      nowMs - t <= windowMs &&
      String(row[COL.email]).toLowerCase() === email &&
      String(row[COL.whatsapp]) === data.whatsapp
    ) {
      return true;
    }
  }
  return false;
}

/** Quantas linhas recentes caem dentro da janela (RN-07). */
function countInWindow(rows, nowMs, windowMs) {
  let n = 0;
  for (let i = 0; i < rows.length; i++) {
    const t = toMs(rows[i][COL.receivedAt]);
    if (!isNaN(t) && nowMs - t <= windowMs) n++;
  }
  return n;
}

/** Linha a gravar, na ordem de HEADERS. `at` é Date (relógio do script). */
function buildRow(data, at, suspect) {
  return [
    at,
    data.name,
    data.whatsapp,
    data.email,
    data.company || '',
    data.profile.label,
    data.lotsRange.label,
    at,
    data.policyVersion,
    suspect ? 'sim' : 'não',
    'novo',
    data.submissionId,
  ];
}
