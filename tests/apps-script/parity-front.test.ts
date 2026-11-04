// TEMPORÁRIO: confere que a validação do script (apps-script/Core.js) é equivalente à do front
// (lib/leads/validate.ts). Apagar este arquivo junto com lib/leads/validate.ts (spec 001, T3).
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { validateLead as validateFront } from '@/lib/leads/validate';
import { loadScript } from './load';

const s = loadScript();

describe('paridade com lib/leads/validate.ts', () => {
  // policyVersion e submissionId são regras só do script: ficam fora da paridade.
  const shared = s.CASES.filter(
    (c: { over: object }) => !('policyVersion' in c.over) && !('submissionId' in c.over)
  );
  for (const c of shared as any[])
    it(c.desc, () => {
      const payload = { ...s.BASE_PAYLOAD, ...c.over };
      // O front recebe FormData (strings; consent 'on'). Os campos exclusivos do script
      // (policyVersion, submissionId) não existem no front e são ignorados aqui.
      const front = validateFront({
        name: typeof payload.name === 'string' ? payload.name : undefined,
        whatsapp: typeof payload.whatsapp === 'string' ? payload.whatsapp : undefined,
        email: typeof payload.email === 'string' ? payload.email : undefined,
        company: payload.company,
        profile: payload.profile,
        lotsRange: payload.lotsRange,
        consent: payload.consent === true ? 'on' : undefined,
      });
      const script = s.validateLead(s.readPayload(payload), [s.BASE_PAYLOAD.policyVersion]);
      const onlyShared = (e: Record<string, string>) =>
        Object.fromEntries(
          Object.entries(e).filter(([k]) => !['policyVersion', 'submissionId'].includes(k))
        );
      if (front.ok) {
        expect(script.ok).toBe(true);
        expect(script.data.name).toBe(front.data.name);
        expect(script.data.whatsapp).toBe(front.data.whatsapp);
        expect(script.data.company).toBe(front.data.company);
      } else {
        expect(script.ok).toBe(false);
        expect(onlyShared(script.errors)).toEqual(front.errors);
      }
    });
});
