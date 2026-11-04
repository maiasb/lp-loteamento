/**
 * Script de recebimento de leads da landing (web app do Google Apps Script).
 * Contrato: docs/integracoes/leads-apps-script.md. Regras: spec 001 (RN-06, 07, 09..12, 14..17).
 * Depende de Core.js (funções puras, sem serviços do Google).
 *
 * Configuração: só em Propriedades do script (Configurações do projeto > Propriedades do script):
 *   SPREADSHEET_ID   (obrigatória) ID da planilha de leads
 *   SHEET_NAME       (obrigatória) nome da aba, ex.: Leads
 *   POLICY_VERSIONS  (obrigatória) versões da política aceitas, separadas por vírgula (RN-10)
 *   NOTIFY_TO        (opcional)    e-mail(s) do aviso; vazio = sem aviso
 *   SURGE_MAX        (opcional)    padrão 20  (RN-07)
 *   SURGE_WINDOW_MIN (opcional)    padrão 10  (RN-07)
 *   RETENTION_DAYS   (opcional)    liga a função retencao(); mínimo 30 (CA-38, PEND-11)
 * Nunca registrar dados pessoais em log: só códigos e contagens.
 */

const TZ = 'America/Sao_Paulo';
const MAX_BODY_CHARS = 20000;
const LOCK_WAIT_MS = 5000;
const RECENT_ROWS = 200; // só as últimas N linhas são lidas para duplicata e surto
const DEDUPE_WINDOW_MS = 2 * 60 * 1000; // RN-12
const ALERT_PROP = 'LAST_SURGE_ALERT_MS';
const DATE_FORMAT = 'dd/MM/yyyy HH:mm:ss';
// Colunas de texto em formato "texto simples" ('@') para o Sheets não interpretar fórmulas (RN-14).
const FORMATS = [DATE_FORMAT, '@', '@', '@', '@', '@', '@', DATE_FORMAT, '@', '@', '@', '@'];

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function logError_(tag, err) {
  // Sem payload do lead: só o código e a mensagem do erro (limitada).
  console.error(
    tag + ': ' + String(err && err.name) + ' ' + String(err && err.message).slice(0, 160)
  );
}

/** GET nunca devolve dado da planilha (CA-37); serve só para conferir que a implantação responde. */
function doGet() {
  return json_({ ok: true, service: 'leads' });
}

function doPost(e) {
  try {
    const body = e && e.postData ? e.postData.contents : '';
    if (typeof body !== 'string' || body.length === 0 || body.length > MAX_BODY_CHARS) {
      return json_({ ok: false, code: 'invalid', fields: {} });
    }
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch (_) {
      return json_({ ok: false, code: 'invalid', fields: {} });
    }
    return json_(processLead_(readPayload(parsed)));
  } catch (err) {
    logError_('doPost', err);
    return json_({ ok: false, code: 'server' });
  }
}

function processLead_(payload) {
  // RN-06: honeypot responde igual a um sucesso, sem gravar e sem aviso.
  if (isHoneypotFilled(payload)) return { ok: true };

  const cfg = getConfig_();
  const checked = validateLead(payload, cfg.policyVersions);
  if (!checked.ok) return { ok: false, code: 'invalid', fields: checked.errors };

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(LOCK_WAIT_MS)) return { ok: false, code: 'busy' };
  let saved;
  try {
    saved = saveLead_(cfg, checked.data);
  } finally {
    SpreadsheetApp.flush(); // doc do Lock: flush antes de soltar a trava
    lock.releaseLock();
  }

  // RN-09: o lead já está gravado; falha de e-mail nunca muda a resposta.
  if (saved.saved) notify_(cfg, checked.data, saved);
  return { ok: true };
}

/** Dentro da trava: duplicata, surto, gravação. */
function saveLead_(cfg, data) {
  const ss = SpreadsheetApp.openById(cfg.spreadsheetId);
  const sheet = ss.getSheetByName(cfg.sheetName);
  if (!sheet) throw new Error('aba_inexistente (rode setup)');

  const nowMs = Date.now();
  const windowMs = cfg.surgeWindowMin * 60 * 1000;
  const recent = readRecentRows_(sheet, Math.max(RECENT_ROWS, cfg.surgeMax * 2));

  if (isDuplicate(recent, data, nowMs, DEDUPE_WINDOW_MS)) return { saved: false };

  // Esta seria a (surgeMax + 1)-ésima na janela: surto (RN-07).
  const suspect = countInWindow(recent, nowMs, windowMs) >= cfg.surgeMax;
  writeRow_(sheet, buildRow(data, new Date(nowMs), suspect));

  let alertDue = false;
  if (suspect) {
    const props = PropertiesService.getScriptProperties();
    const last = Number(props.getProperty(ALERT_PROP)) || 0;
    if (nowMs - last > windowMs) {
      props.setProperty(ALERT_PROP, String(nowMs));
      alertDue = true;
    }
  }
  return {
    saved: true,
    suspect: suspect,
    alertDue: alertDue,
    at: new Date(nowMs),
    url: ss.getUrl(),
  };
}

function readRecentRows_(sheet, n) {
  const last = sheet.getLastRow();
  if (last < 2) return [];
  const first = Math.max(2, last - n + 1);
  return sheet.getRange(first, 1, last - first + 1, HEADERS.length).getValues();
}

/**
 * Grava uma linha com formato de texto. Salvaguarda: se mesmo assim alguma célula virar fórmula,
 * regrava com apóstrofo na frente (RN-14). Devolve { row, guardTriggered }.
 */
function writeRow_(sheet, values) {
  const row = sheet.getLastRow() + 1;
  if (row > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 100);
  const range = sheet.getRange(row, 1, 1, HEADERS.length);
  range.setNumberFormats([FORMATS]);
  range.setValues([values]);

  const formulas = range.getFormulas()[0];
  let guardTriggered = false;
  for (let i = 0; i < formulas.length; i++) {
    if (formulas[i] !== '' && typeof values[i] === 'string') {
      guardTriggered = true;
      sheet.getRange(row, i + 1).setValue("'" + values[i]);
    }
  }
  if (guardTriggered) console.warn('guarda_formula_acionada');
  return { row: row, guardTriggered: guardTriggered };
}

function notify_(cfg, data, saved) {
  try {
    if (saved.alertDue && cfg.notifyTo) {
      MailApp.sendEmail({
        to: cfg.notifyTo,
        subject: '[Landing] Surto de envios: leads marcados como suspeitos',
        body:
          'Mais de ' +
          cfg.surgeMax +
          ' envios em ' +
          cfg.surgeWindowMin +
          ' min.\n' +
          'Os leads seguem gravados, com "Suspeito = sim", e o aviso por lead fica suspenso ' +
          'durante o surto.\nPlanilha: ' +
          saved.url,
      });
    }
    if (!saved.suspect && cfg.notifyTo) {
      MailApp.sendEmail({
        to: cfg.notifyTo,
        subject: '[Landing] Novo lead: ' + data.profile.label,
        body:
          'Recebido em: ' +
          Utilities.formatDate(saved.at, TZ, 'dd/MM/yyyy HH:mm') +
          '\n' +
          'Nome: ' +
          data.name +
          '\n' +
          'WhatsApp: ' +
          data.whatsapp +
          '\n' +
          'E-mail: ' +
          data.email +
          '\n' +
          'Empresa: ' +
          (data.company || '-') +
          '\n' +
          'Perfil: ' +
          data.profile.label +
          '\n' +
          'Faixa de lotes: ' +
          data.lotsRange.label +
          '\n\n' +
          'Planilha: ' +
          saved.url,
      });
    }
  } catch (err) {
    logError_('notify', err); // CA-26: falha fica só no registro de execuções
  }
}

function getConfig_() {
  const p = PropertiesService.getScriptProperties();
  const text = function (key) {
    return String(p.getProperty(key) || '').trim();
  };
  const int = function (key, fallback) {
    const n = parseInt(text(key), 10);
    return n >= 1 ? n : fallback;
  };
  const policyVersions = text('POLICY_VERSIONS')
    .split(',')
    .map(function (v) {
      return v.trim();
    })
    .filter(Boolean);
  const cfg = {
    spreadsheetId: text('SPREADSHEET_ID'),
    sheetName: text('SHEET_NAME'),
    policyVersions: policyVersions,
    notifyTo: text('NOTIFY_TO'),
    surgeMax: int('SURGE_MAX', 20),
    surgeWindowMin: int('SURGE_WINDOW_MIN', 10),
  };
  if (!cfg.spreadsheetId || !cfg.sheetName || cfg.policyVersions.length === 0) {
    throw new Error('propriedades_ausentes (SPREADSHEET_ID, SHEET_NAME, POLICY_VERSIONS)');
  }
  return cfg;
}

// ---------------------------------------------------------------------------
// Funções para rodar à mão no editor (Executar).
// ---------------------------------------------------------------------------

/** Cria a aba e o cabeçalho (idempotente), fixa o fuso e os formatos de texto. */
function setup() {
  const cfg = getConfig_();
  const ss = SpreadsheetApp.openById(cfg.spreadsheetId);
  const sheet = ss.getSheetByName(cfg.sheetName) || ss.insertSheet(cfg.sheetName);
  ss.setSpreadsheetTimeZone(TZ);

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  } else {
    const current = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
    if (current.join('|') !== HEADERS.join('|')) {
      throw new Error(
        'cabecalho_diferente: a linha 1 da aba não é a esperada; confira antes de seguir'
      );
    }
  }
  const rows = sheet.getMaxRows() - 1;
  if (rows > 0) {
    for (let i = 0; i < HEADERS.length; i++) {
      sheet.getRange(2, i + 1, rows, 1).setNumberFormat(FORMATS[i]);
    }
  }
  console.log('setup ok');
}

/** Prova a RN-14 na planilha real: grava uma linha com fórmula, confere e apaga a linha. */
function testarFormula() {
  const cfg = getConfig_();
  const sheet = SpreadsheetApp.openById(cfg.spreadsheetId).getSheetByName(cfg.sheetName);
  if (!sheet) throw new Error('aba_inexistente (rode setup)');
  const evil = '=HYPERLINK("http://exemplo.test";"x")';
  const data = {
    name: evil,
    whatsapp: '11912345678',
    email: '+teste@exemplo.test',
    company: '+SUM(1)',
    profile: PROFILES[0],
    lotsRange: LOT_RANGES[0],
    policyVersion: 'teste',
    submissionId: 'teste-formula',
  };
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const res = writeRow_(sheet, buildRow(data, new Date(), true));
    const stored = sheet.getRange(res.row, 1, 1, HEADERS.length).getValues()[0];
    const exact = stored[COL.name] === evil && stored[COL.company] === '+SUM(1)';
    sheet.deleteRow(res.row);
    console.log(
      'testarFormula: texto_exato=' +
        exact +
        ' guarda_acionada=' +
        res.guardTriggered +
        (exact && !res.guardTriggered ? ' -> OK' : ' -> CONFERIR (ver README, teste 4)')
    );
  } finally {
    SpreadsheetApp.flush();
    lock.releaseLock();
  }
}

/**
 * Retenção (CA-38): apaga linhas mais antigas que RETENTION_DAYS. Desligada sem a propriedade.
 * Não limpa o histórico de versões do Google nem cópias de segurança (PEND-11). Crie o gatilho
 * diário à mão só depois da decisão do prazo.
 */
function retencao() {
  const days = parseInt(PropertiesService.getScriptProperties().getProperty('RETENTION_DAYS'), 10);
  if (!(days >= 30)) {
    console.log('retencao desligada (RETENTION_DAYS ausente ou < 30)');
    return;
  }
  const cfg = getConfig_();
  const sheet = SpreadsheetApp.openById(cfg.spreadsheetId).getSheetByName(cfg.sheetName);
  if (!sheet) throw new Error('aba_inexistente (rode setup)');
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const last = sheet.getLastRow();
    if (last < 2) return;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const dates = sheet.getRange(2, 1, last - 1, 1).getValues();
    let removed = 0;
    for (let i = dates.length - 1; i >= 0; i--) {
      const t = toMs(dates[i][0]);
      if (!isNaN(t) && t < cutoff) {
        sheet.deleteRow(i + 2);
        removed++;
      }
    }
    console.log('retencao: linhas removidas=' + removed);
  } finally {
    SpreadsheetApp.flush();
    lock.releaseLock();
  }
}
