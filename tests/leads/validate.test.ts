import { describe, expect, it } from 'vitest';
import {
  FIELD_LIMITS,
  MESSAGES,
  cleanText,
  normalizeWhatsapp,
  readForm,
  validateLead,
  type RawLead,
} from '@/lib/leads/validate';

const valid: RawLead = {
  name: ' Maria Souza ',
  whatsapp: '(11) 91234-5678',
  email: 'maria@empresa.com.br',
  company: 'Loteadora Exemplo',
  profile: 'loteadora',
  lotsRange: 'ate-100',
  consent: 'on',
};

describe('validateLead (RN-11)', () => {
  it('aceita lead válido e normaliza WhatsApp para dígitos', () => {
    const r = validateLead(valid);
    expect(r).toEqual({
      ok: true,
      data: {
        name: 'Maria Souza',
        whatsapp: '11912345678',
        email: 'maria@empresa.com.br',
        company: 'Loteadora Exemplo',
        profile: 'loteadora',
        lotsRange: 'ate-100',
      },
    });
  });

  it('sem consentimento não passa (CA-19)', () => {
    const r = validateLead({ ...valid, consent: undefined });
    expect(r).toEqual({ ok: false, errors: { consent: MESSAGES.consent } });
  });

  it('retorna um erro por campo obrigatório vazio', () => {
    const r = validateLead({ consent: 'on' });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(Object.keys(r.errors).sort()).toEqual(
        ['company', 'email', 'lotsRange', 'name', 'profile', 'whatsapp'].sort()
      );
    }
  });

  it.each([
    ['11912345678', '11912345678'],
    ['+55 (11) 91234-5678', '11912345678'],
    ['(11) 3456-7890', '1134567890'],
    ['551134567890', '1134567890'],
  ])('WhatsApp %s é aceito', (input, digits) => {
    expect(normalizeWhatsapp(input)).toBe(digits);
  });

  it.each(['', '1234', '01912345678', '11812345678', '119123456789', 'abc'])(
    'WhatsApp inválido: %s',
    (input) => {
      expect(normalizeWhatsapp(input)).toBeNull();
    }
  );

  it.each(['maria', 'maria@', '@empresa.com', 'maria@empresa', 'maria @empresa.com'])(
    'e-mail inválido: %s',
    (email) => {
      const r = validateLead({ ...valid, email });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errors.email).toBe(MESSAGES.email);
    }
  );

  it('nome acima de 120 caracteres é recusado', () => {
    const r = validateLead({ ...valid, name: 'a'.repeat(121) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.name).toBe(MESSAGES.nameLong);
  });

  it('perfil e faixa fora da lista são recusados', () => {
    const r = validateLead({ ...valid, profile: 'hacker', lotsRange: '999' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(['lotsRange', 'profile']);
  });

  it('empresa é opcional só para Gestor comercial (PEND-10, default do TODO)', () => {
    expect(validateLead({ ...valid, profile: 'gestor', company: '' }).ok).toBe(true);
    const r = validateLead({ ...valid, profile: 'imobiliaria', company: '' });
    expect(r.ok).toBe(false);
  });

  it('remove quebras de linha dos textos (injeção em cabeçalho de e-mail)', () => {
    const r = validateLead({ ...valid, name: 'Maria\r\nBcc: x@y.com' });
    expect(r.ok && r.data.name).toBe('Maria Bcc: x@y.com');
  });
});

describe('A-08: e-mail restrito e texto sem caracteres invisíveis', () => {
  it.each([
    'a<b@c.com',
    '"x"@c.com',
    'Fulano<a@b.com>',
    'a,b@c.com',
    'a b@c.com',
    'a@b',
    'a@@b.com',
  ])('recusa o e-mail %s', (email) => {
    const r = validateLead({ ...valid, email });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.email).toBe(MESSAGES.email);
  });
  it.each(['maria@empresa.com.br', 'a.b+tag@sub.empresa.com'])('aceita %s', (email) => {
    expect(validateLead({ ...valid, email }).ok).toBe(true);
  });
  it('cleanText remove bidi e largura zero e troca controle por espaço', () => {
    expect(cleanText('A\u202eB\u200bC\ufeff')).toBe('ABC');
    expect(cleanText('A\nB')).toBe('A B');
    const r = validateLead({ ...valid, name: 'Ma\u202eria\u200b' });
    expect(r.ok && r.data.name).toBe('Maria');
  });
  it('readForm corta cada campo no limite (nada gigante volta ao visitante)', () => {
    const form = new FormData();
    form.set('name', 'x'.repeat(5000));
    form.set('email', 'y'.repeat(5000));
    const raw = readForm(form);
    expect(raw.name).toHaveLength(FIELD_LIMITS.name);
    expect(raw.email).toHaveLength(FIELD_LIMITS.email);
  });
});
