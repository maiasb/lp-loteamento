/**
 * Tabela de casos da validação (RN-11, RN-10, RN-14) e executor para o editor do Apps Script.
 * Opcional no projeto do Google: rode `testarLocalmente` no editor para conferir sem planilha.
 * A mesma tabela é usada pelo Vitest (tests/apps-script) com `yarn test`.
 * `errors`: campo -> mensagem esperada; null = deve passar; `data`: campos esperados no resultado.
 */

const TEST_POLICY_VERSIONS = ['2026-11-04'];

const BASE_PAYLOAD = {
  name: ' Maria Souza ',
  company: 'Loteadora Exemplo',
  whatsapp: '(11) 91234-5678',
  email: 'maria@empresa.com.br',
  profile: 'loteadora',
  lotsRange: 'ate-100',
  consent: true,
  policyVersion: '2026-11-04',
  submissionId: '3f1c9a52-7d0e-4b6a-9c1d-0a2b3c4d5e6f',
  hp: '',
};

const CASES = [
  {
    desc: 'lead válido normaliza nome e WhatsApp',
    over: {},
    errors: null,
    data: { name: 'Maria Souza', whatsapp: '11912345678', company: 'Loteadora Exemplo' },
  },
  {
    desc: 'WhatsApp com +55',
    over: { whatsapp: '+55 11 91234-5678' },
    errors: null,
    data: { whatsapp: '11912345678' },
  },
  {
    desc: 'fixo de 10 dígitos',
    over: { whatsapp: '(11) 3333-4444' },
    errors: null,
    data: { whatsapp: '1133334444' },
  },
  { desc: 'WhatsApp vazio', over: { whatsapp: '' }, errors: { whatsapp: MESSAGES.whatsappEmpty } },
  {
    desc: 'WhatsApp com 9 dígitos',
    over: { whatsapp: '912345678' },
    errors: { whatsapp: MESSAGES.whatsapp },
  },
  {
    desc: 'DDD começando em 0',
    over: { whatsapp: '01912345678' },
    errors: { whatsapp: MESSAGES.whatsapp },
  },
  {
    desc: 'celular de 11 dígitos sem 9',
    over: { whatsapp: '11812345678' },
    errors: { whatsapp: MESSAGES.whatsapp },
  },
  { desc: 'e-mail vazio', over: { email: '' }, errors: { email: MESSAGES.emailEmpty } },
  {
    desc: 'e-mail sem domínio com ponto',
    over: { email: 'a@b' },
    errors: { email: MESSAGES.email },
  },
  {
    desc: 'e-mail com Unicode',
    over: { email: 'maría@empresa.com.br' },
    errors: { email: MESSAGES.email },
  },
  {
    desc: 'e-mail com sinais de endereço',
    over: { email: '"a b"<x@y.com>' },
    errors: { email: MESSAGES.email },
  },
  {
    desc: 'e-mail com mais de 254 caracteres',
    over: { email: 'a'.repeat(250) + '@b.co' },
    errors: { email: MESSAGES.email },
  },
  { desc: 'nome vazio', over: { name: '' }, errors: { name: MESSAGES.name } },
  { desc: 'nome só com invisíveis', over: { name: '​‮﻿' }, errors: { name: MESSAGES.name } },
  {
    desc: 'nome com bidi/invisíveis removidos',
    over: { name: 'Ma‮ri​a' },
    errors: null,
    data: { name: 'Maria' },
  },
  {
    desc: 'nome com quebra de linha vira espaço',
    over: { name: 'Maria\nSouza' },
    errors: null,
    data: { name: 'Maria Souza' },
  },
  { desc: 'nome com 120 caracteres', over: { name: 'a'.repeat(120) }, errors: null },
  {
    desc: 'nome com 121 caracteres',
    over: { name: 'a'.repeat(121) },
    errors: { name: MESSAGES.nameLong },
  },
  {
    desc: 'nome que parece fórmula passa na validação (proteção é na gravação)',
    over: { name: '=HYPERLINK("http://x.test";"x")' },
    errors: null,
  },
  {
    desc: 'empresa vazia para loteadora',
    over: { company: '' },
    errors: { company: MESSAGES.company },
  },
  {
    desc: 'empresa vazia para imobiliária',
    over: { company: '', profile: 'imobiliaria' },
    errors: { company: MESSAGES.company },
  },
  {
    desc: 'empresa vazia para gestor é permitida',
    over: { company: '', profile: 'gestor' },
    errors: null,
    data: { company: null },
  },
  {
    desc: 'empresa com 121 caracteres',
    over: { company: 'a'.repeat(121) },
    errors: { company: MESSAGES.nameLong },
  },
  {
    desc: 'perfil fora da lista',
    over: { profile: 'outro' },
    errors: { profile: MESSAGES.profile },
  },
  {
    desc: 'perfil inválido e empresa vazia: exige empresa',
    over: { profile: 'outro', company: '' },
    errors: { profile: MESSAGES.profile, company: MESSAGES.company },
  },
  {
    desc: 'faixa fora da lista',
    over: { lotsRange: '999' },
    errors: { lotsRange: MESSAGES.lotsRange },
  },
  { desc: 'faixa "nao-sei" válida', over: { lotsRange: 'nao-sei' }, errors: null },
  { desc: 'consentimento false', over: { consent: false }, errors: { consent: MESSAGES.consent } },
  {
    desc: 'consentimento como string "true" é recusado',
    over: { consent: 'true' },
    errors: { consent: MESSAGES.consent },
  },
  {
    desc: 'consentimento ausente',
    over: { consent: undefined },
    errors: { consent: MESSAGES.consent },
  },
  {
    desc: 'versão da política desconhecida',
    over: { policyVersion: '1999-01-01' },
    errors: { policyVersion: MESSAGES.policyVersion },
  },
  {
    desc: 'versão da política ausente',
    over: { policyVersion: undefined },
    errors: { policyVersion: MESSAGES.policyVersion },
  },
  {
    desc: 'submissionId ausente',
    over: { submissionId: undefined },
    errors: { submissionId: MESSAGES.submissionId },
  },
  {
    desc: 'submissionId com caracteres inválidos',
    over: { submissionId: "x'; DROP" },
    errors: { submissionId: MESSAGES.submissionId },
  },
  {
    desc: 'campo com tipo errado (objeto) vira vazio',
    over: { name: { a: 1 } },
    errors: { name: MESSAGES.name },
  },
  {
    desc: 'WhatsApp numérico (não string) é recusado',
    over: { whatsapp: 11912345678 },
    errors: { whatsapp: MESSAGES.whatsappEmpty },
  },
  {
    desc: 'vários erros juntos',
    over: { name: '', whatsapp: '1', email: 'x', profile: '', lotsRange: '', consent: false },
    errors: {
      name: MESSAGES.name,
      whatsapp: MESSAGES.whatsapp,
      email: MESSAGES.email,
      profile: MESSAGES.profile,
      company: undefined, // preenchida na BASE, só vale se perfil for gestor
      lotsRange: MESSAGES.lotsRange,
      consent: MESSAGES.consent,
    },
  },
];

/** Roda a tabela e devolve a lista de falhas (vazia = tudo certo). Usada também pelo Vitest. */
function runCases() {
  const failures = [];
  CASES.forEach(function (c) {
    const payload = Object.assign({}, BASE_PAYLOAD, c.over);
    const r = validateLead(readPayload(payload), TEST_POLICY_VERSIONS);
    if (c.errors === null) {
      if (!r.ok)
        return failures.push(c.desc + ': esperava passar, erros=' + JSON.stringify(r.errors));
      const d = c.data || {};
      Object.keys(d).forEach(function (k) {
        if (r.data[k] !== d[k]) failures.push(c.desc + ': campo ' + k + ' = ' + r.data[k]);
      });
    } else {
      if (r.ok) return failures.push(c.desc + ': esperava erro e passou');
      const want = {};
      Object.keys(c.errors).forEach(function (k) {
        if (c.errors[k] !== undefined) want[k] = c.errors[k];
      });
      if (JSON.stringify(sortKeys(r.errors)) !== JSON.stringify(sortKeys(want))) {
        failures.push(c.desc + ': erros=' + JSON.stringify(r.errors));
      }
    }
  });
  return failures;
}

function sortKeys(obj) {
  const out = {};
  Object.keys(obj)
    .sort()
    .forEach(function (k) {
      out[k] = obj[k];
    });
  return out;
}

/** Rodar no editor do Apps Script: lança erro se algum caso falhar. Não toca em planilha. */
function testarLocalmente() {
  const failures = runCases();
  if (failures.length) throw new Error('Falhas:\n' + failures.join('\n'));
  console.log('testarLocalmente OK: ' + CASES.length + ' casos');
}
