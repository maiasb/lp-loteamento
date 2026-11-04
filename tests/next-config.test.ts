import { PHASE_PRODUCTION_BUILD } from 'next/constants.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
// @ts-expect-error módulo .mjs sem tipos
import createConfig, { assertBuildConfig, leadsEndpointProblem } from '../next.config.mjs';

const GOOGLE = 'https://script.google.com/macros/s/AKfycbFAKE/exec';
const env = {
  NEXT_PUBLIC_WHATSAPP: '5511912345678',
  NEXT_PUBLIC_CONTACT_EMAIL: 'contato@empresa.com.br',
  NEXT_PUBLIC_SITE_URL: 'https://empresa.com.br',
  NEXT_PUBLIC_LEADS_ENDPOINT: GOOGLE,
};

afterEach(() => vi.unstubAllEnvs());

describe('leadsEndpointProblem (CA-33)', () => {
  it('aceita só o aplicativo da web do Apps Script', () => {
    expect(leadsEndpointProblem(GOOGLE)).toBeNull();
  });
  it.each([
    '',
    undefined,
    'CONFIGURAR',
    'não é url',
    'http://script.google.com/x',
    'https://exemplo.com/x',
  ])('recusa %s', (value) => {
    expect(leadsEndpointProblem(value)).toMatch(/NEXT_PUBLIC_LEADS_ENDPOINT/);
  });
  it('loopback só com a liberação explícita (mock de QA)', () => {
    const mock = 'http://127.0.0.1:8787/leads';
    expect(leadsEndpointProblem(mock)).not.toBeNull();
    expect(leadsEndpointProblem(mock, true)).toBeNull();
    expect(leadsEndpointProblem('https://exemplo.com/x', true)).not.toBeNull();
  });
});

describe('next.config', () => {
  it('é export estático e o build falha sem o endereço de envio', () => {
    vi.stubEnv('NEXT_PUBLIC_WHATSAPP', env.NEXT_PUBLIC_WHATSAPP);
    vi.stubEnv('NEXT_PUBLIC_CONTACT_EMAIL', env.NEXT_PUBLIC_CONTACT_EMAIL);
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', env.NEXT_PUBLIC_SITE_URL);
    vi.stubEnv('NEXT_PUBLIC_LEADS_ENDPOINT', '');
    expect(() => createConfig(PHASE_PRODUCTION_BUILD)).toThrow(/NEXT_PUBLIC_LEADS_ENDPOINT/);
    vi.stubEnv('NEXT_PUBLIC_LEADS_ENDPOINT', GOOGLE);
    expect(createConfig(PHASE_PRODUCTION_BUILD).output).toBe('export');
  });
  it('falha com contato em placeholder, listando o que falta', () => {
    expect(() => assertBuildConfig({ ...env, NEXT_PUBLIC_WHATSAPP: 'CONFIGURAR' })).toThrow(
      /WHATSAPP/
    );
    expect(() => assertBuildConfig({ ...env, NEXT_PUBLIC_CONTACT_EMAIL: 'x@example.com' })).toThrow(
      /EMAIL/
    );
    expect(() => assertBuildConfig(env)).not.toThrow();
  });
});
