import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ScriptApi = Record<string, any>;

const dir = path.resolve(__dirname, '../../apps-script');

const EXPORTS = [
  'readPayload',
  'isHoneypotFilled',
  'validateLead',
  'cleanText',
  'normalizeWhatsapp',
  'neutralizeFormula',
  'isDuplicate',
  'countInWindow',
  'buildRow',
  'doGet',
  'doPost',
  'setup',
  'testarFormula',
  'retencao',
  'runCases',
  'testarLocalmente',
  'MESSAGES',
  'HEADERS',
  'COL',
  'CASES',
  'BASE_PAYLOAD',
].join(', ');

/** Carrega Core.js + Code.js + Tests.js num contexto isolado (como o escopo global do Apps Script). */
export function loadScript(globals: Record<string, unknown> = {}): ScriptApi {
  const src = ['Core.js', 'Code.js', 'Tests.js']
    .map((f) => fs.readFileSync(path.join(dir, f), 'utf8'))
    .join('\n');
  const ctx = vm.createContext({ JSON, Object, Number, String, Math, Array, ...globals });
  return vm.runInContext(`${src}\n;({ ${EXPORTS} })`, ctx) as ScriptApi;
}
