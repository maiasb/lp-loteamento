import { describe, expect, it } from 'vitest';
import { loadScript } from './load';

const s = loadScript({ console });
const rowAt = (ms: number, email = 'a@b.co', whatsapp = '11912345678', id = 'id-0000000') => {
  const r = new Array(12).fill('');
  r[s.COL.receivedAt] = new Date(ms);
  r[s.COL.email] = email;
  r[s.COL.whatsapp] = whatsapp;
  r[s.COL.submissionId] = id;
  return r;
};

describe('tabela de casos da validação (Tests.js)', () => {
  it('todos os casos passam', () => {
    expect(s.runCases()).toEqual([]);
  });
  it('testarLocalmente não lança', () => {
    expect(() => s.testarLocalmente()).not.toThrow();
  });
});

describe('readPayload', () => {
  it('corta campos longos e só aceita consent === true', () => {
    const p = s.readPayload({ name: 'a'.repeat(5000), consent: 'on', email: 123 });
    expect(p.name).toHaveLength(400);
    expect(p.consent).toBe(false);
    expect(p.email).toBe('');
  });
  it('aceita payload não objeto', () => {
    expect(s.readPayload(null).name).toBe('');
    expect(s.readPayload('x').name).toBe('');
  });
});

describe('honeypot (RN-06)', () => {
  it('detecta hp e site_url_2 preenchidos; espaços não contam', () => {
    expect(s.isHoneypotFilled(s.readPayload({ hp: 'http://spam' }))).toBe(true);
    expect(s.isHoneypotFilled(s.readPayload({ site_url_2: 'x' }))).toBe(true);
    expect(s.isHoneypotFilled(s.readPayload({ hp: '   ' }))).toBe(false);
    expect(s.isHoneypotFilled(s.readPayload({}))).toBe(false);
  });
});

describe('neutralizeFormula (RN-14)', () => {
  it.each(['=1+1', '+1', '-1', '@x', '\tx', '\rx'])('prefixa apóstrofo em %j', (v) => {
    expect(s.neutralizeFormula(v)).toBe("'" + v);
  });
  it('não mexe em texto comum', () => {
    expect(s.neutralizeFormula('Maria')).toBe('Maria');
    expect(s.neutralizeFormula('a=b')).toBe('a=b');
  });
});

describe('isDuplicate (RN-12)', () => {
  const now = Date.UTC(2026, 10, 4, 15, 0, 0);
  const data = { email: 'A@B.co', whatsapp: '11912345678', submissionId: 'novo-id-1' };
  it('mesmo submissionId, qualquer idade', () => {
    expect(
      s.isDuplicate(
        [rowAt(now - 3_600_000, 'x@y.co', '1133334444', 'novo-id-1')],
        data,
        now,
        120_000
      )
    ).toBe(true);
  });
  it('mesmo e-mail (sem diferenciar caixa) e WhatsApp dentro da janela', () => {
    expect(s.isDuplicate([rowAt(now - 119_000, 'a@b.co')], data, now, 120_000)).toBe(true);
  });
  it('fora da janela, não é duplicata', () => {
    expect(s.isDuplicate([rowAt(now - 121_000, 'a@b.co')], data, now, 120_000)).toBe(false);
  });
  it('só e-mail ou só WhatsApp iguais não bastam', () => {
    expect(s.isDuplicate([rowAt(now - 1000, 'a@b.co', '1133334444')], data, now, 120_000)).toBe(
      false
    );
    expect(s.isDuplicate([rowAt(now - 1000, 'z@b.co', '11912345678')], data, now, 120_000)).toBe(
      false
    );
  });
});

describe('countInWindow (RN-07)', () => {
  it('conta só as linhas dentro da janela', () => {
    const now = 10_000_000;
    const rows = [
      rowAt(now - 700_000),
      rowAt(now - 599_000),
      rowAt(now - 1000),
      ['', ''] as unknown[],
    ];
    expect(
      s.countInWindow(
        rows.map((r) => r.concat(new Array(12).fill(''))),
        now,
        600_000
      )
    ).toBe(2);
  });
});
