# Ficha da integração: leads por Google Apps Script + Google Sheets

**Projeto:** lp-loteamento · **Atualizado em:** 2026-11-04 · **Responsável técnico:** dev-integrations
**Spec:** `docs/specs/001-landing-page.md` v0.3 (CA-17..26, 33..41; RN-06, 07, 09..12, 14..17) · **ADR:** `docs/adr/ADR-0001-leads-em-planilha-google-sem-backend.md`
**Código:** `apps-script/` (README com o passo a passo do dono). **Status:** implementado e testado só com simuladores; **não executado numa conta Google real** (T1 pendente).

## 1. O que faz
O formulário da landing envia os dados direto ao web app do Apps Script. O script valida de novo, descarta robôs (honeypot), deduplica, grava uma linha na planilha do dono e (opcional) avisa por e-mail. Não há outro backend. A planilha é a única forma de consulta.

## 2. Resumo técnico
| Item | Valor |
|---|---|
| Fornecedor | Google Apps Script (web app) + Google Sheets + MailApp |
| Autenticação | Nenhuma do chamador (`access: ANYONE_ANONYMOUS`); o script roda como o dono (`executeAs: USER_DEPLOYING`) |
| Autenticidade da origem | Não existe (script não vê origem nem IP). Defesa: validação, honeypot, dedupe, surto (RA-01, RA-02) |
| Padrões do catálogo | Nenhum aplicável diretamente. Usa a ideia de consumidor idempotente (dedupe por `submissionId`) e trava com lease curto (LockService); adaptados a uma planilha sem transação |
| Escopos OAuth | `spreadsheets`, `script.send_mail` (mínimos para `openById` + MailApp) |
| Cotas (consultadas 2026-11-04; podem mudar) | e-mail 100/dia (pessoal) ou 1.500/dia (Workspace); 6 min por execução; 30 execuções simultâneas por usuário |

## 3. Contrato (fixo; cliente em `dev-react`)
Requisição: `POST <URL /exec>`, `Content-Type: text/plain;charset=utf-8` (sem preflight), corpo JSON:
`name, company, whatsapp (dígitos), email, profile ('loteadora'|'imobiliaria'|'gestor'), lotsRange ('ate-100'|'101-300'|'301-1000'|'mais-1000'|'nao-sei'), consent (true), policyVersion, submissionId (uuid do cliente), hp ('')`.

| Resposta (sempre HTTP 200, JSON) | Quando |
|---|---|
| `{"ok":true}` | Gravado, duplicata (já gravado) ou honeypot |
| `{"ok":false,"code":"invalid","fields":{campo:msg}}` | Validação falhou (campos: os do formulário, mais `policyVersion` e `submissionId`); `fields` vazio se o corpo for ilegível ou maior que 20.000 caracteres |
| `{"ok":false,"code":"busy"}` | Não obteve a trava em 5 s; reenviar com o mesmo `submissionId` é seguro |
| `{"ok":false,"code":"server"}` | Erro interno ou configuração ausente (detalhe só no log, sem dado pessoal) |

`GET` devolve `{"ok":true,"service":"leads"}` e nunca dados da planilha (CA-37).

**Pontos do contrato para o dev-react (não alterados):**
1. Honeypot: o contrato diz chave `hp` e campo HTML `site_url_2`. O script aceita **as duas chaves** no JSON; envie `hp`.
2. `invalid` pode trazer `fields.policyVersion` ou `fields.submissionId`, que não são campos visíveis: mostrar mensagem geral ("Recarregue a página e tente de novo") em vez de erro por campo.
3. `consent` só vale se for o booleano `true` (a string `"on"` é recusada).
4. O Apps Script não permite escolher o status HTTP: erro de negócio vem com 200. Rede/Google fora do ar chegam como falha de `fetch` ou resposta não JSON: tratar como erro/tempo esgotado (CA-22).
5. `submissionId`: 8 a 64 caracteres `[A-Za-z0-9-]`; `crypto.randomUUID()` serve. Reenvio após tempo esgotado deve **reusar o mesmo** `submissionId`.
6. A leitura da resposta pelo navegador (CORS + redirecionamento) **não está verificada**: é a T1.

## 4. Fluxo e estados
```mermaid
sequenceDiagram
    participant P as Página
    participant S as doPost
    participant L as LockService
    participant G as Planilha
    participant M as MailApp
    P->>S: POST text/plain (JSON)
    S->>S: corpo ok? JSON ok?
    alt honeypot preenchido
        S-->>P: {"ok":true} (nada gravado)
    else inválido
        S-->>P: {"ok":false,"code":"invalid","fields":{...}}
    else válido
        S->>L: tryLock(5 s)
        alt sem trava
            S-->>P: {"ok":false,"code":"busy"}
        else com trava
            S->>G: lê só as últimas >=200 linhas
            alt duplicata (submissionId, ou e-mail+WhatsApp em 2 min)
                S-->>P: {"ok":true}
            else novo
                S->>G: grava linha (texto; suspeito se surto)
                S->>L: releaseLock
                S->>M: aviso (try/catch; falha só no log)
                S-->>P: {"ok":true}
            end
        end
    end
    Note over S,P: Exceção em qualquer ponto: {"ok":false,"code":"server"} (trava liberada no finally)
```
Falhas e quem avisa: o script só tem o registro de execuções; não há alerta automático (RA, spec 5.8 item 10). Sem fila, DLQ nem retentativa no servidor: a retentativa é do usuário/cliente, e a duplicata é absorvida pelo `submissionId` (CA-22, RN-12).

## 5. Regras implementadas
| Regra | Onde | Observação |
|---|---|---|
| Validação RN-11 (WhatsApp BR 10/11 dígitos, e-mail ASCII, 120 caracteres, listas, empresa exceto gestor, invisíveis/bidi removidos do nome e da empresa) | `Core.js` | Cópia de `lib/leads/validate.ts`; paridade testada |
| RN-10 versão da política | `POLICY_VERSIONS` | Desconhecida = `invalid` |
| RN-06 honeypot | `isHoneypotFilled` | Antes de tudo, inclusive antes da configuração |
| RN-12 dedupe | `isDuplicate` | `submissionId` nas últimas linhas; e-mail (sem caixa) + WhatsApp em 2 min |
| RN-07 surto | `countInWindow` | `>= SURGE_MAX` linhas na janela => `Suspeito = sim`, sem aviso por lead, 1 alerta por janela (`LAST_SURGE_ALERT_MS` em propriedade, sem dado pessoal). Padrão 20 em 10 min |
| RN-14 fórmula | formato `@` + salvaguarda | Ver teste 4 do README; a premissa do formato `@` não está verificada |
| RN-09/CA-26 | `notify_` | E-mail depois de soltar a trava; falha não muda a resposta |
| CA-38 | `retencao()` | Desligada sem `RETENTION_DAYS`; mínimo 30 dias |
| CA-39 | **não implementado** | Exigiria escopo amplo do Drive; ver README |

Colunas (spec seção 8 + duas): Recebido em, Nome, WhatsApp, E-mail, Empresa, Perfil, Faixa de lotes, Consentimento em, Versão da política, Suspeito, **Status** (`novo`), **ID do envio**. Perfil e faixa são gravados com o rótulo legível. A spec não lista Status nem ID do envio: atualizar a seção 8 (arquiteto-specs).

Limites conhecidos: a dedupe e o surto dependem da ordem de gravação (não ordenar a aba); a dedupe é "melhor esforço" se alguém editar a planilha à mão; a trava é do script inteiro (serializa todas as gravações); não há limite por IP (RA-01).

## 6. Configuração (Propriedades do script; sem valores aqui)
`SPREADSHEET_ID`, `SHEET_NAME`, `POLICY_VERSIONS` (obrigatórias); `NOTIFY_TO`, `SURGE_MAX`, `SURGE_WINDOW_MIN`, `RETENTION_DAYS` (opcionais). Variável do site: `NEXT_PUBLIC_LEADS_ENDPOINT` (URL `/exec`, pública por natureza). Ambientes: usar **uma planilha, um projeto de script e uma implantação por ambiente** (teste/produção), cada um com sua URL; nunca dados reais no de teste.

## 7. Reprocessar, trocar, reverter
- Não há fila: lead perdido (ex.: Google fora do ar) não é reprocessado pelo servidor; o visitante vê o erro com WhatsApp e reenvia.
- Nova versão do código: reimplantar a **mesma** implantação (README). Reverter: editar a implantação e escolher a versão anterior.
- Trocar a URL: nova implantação, atualizar `NEXT_PUBLIC_LEADS_ENDPOINT`, republicar o site, arquivar a antiga.
- Subir nova versão da política: acrescentar a versão em `POLICY_VERSIONS` **antes** de publicar o site; remover a antiga depois que o cache do site novo expirar.

## 8. Dados pessoais enviados ao Google (para o lgpd-specialist)
| Dado | Finalidade | Onde fica |
|---|---|---|
| Nome, WhatsApp, e-mail, empresa, perfil, faixa de lotes | Retornar o contato comercial | Planilha (e histórico de versões do Google), e-mail de aviso (caixa do dono) |
| Data/hora do consentimento e versão da política | Prova do consentimento | Planilha |
| IP e cabeçalhos | Não recebidos pelo script | — |
Registro de execuções: só códigos de erro, sem dado do lead (testado). O e-mail de aviso carrega nome, WhatsApp, e-mail e empresa; o assunto não tem nome.

## 9. Checklist de produção
- [ ] T1 executada (README, 3 testes) e resultado anotado no ADR-0001; **se o teste 2 falhar, parar** (decisão volta ao dono)
- [ ] Conta Google definida (PEND-13), verificação em duas etapas, planilha sem link público, acesso só da PEND-14
- [ ] `setup`, `testarLocalmente` e `testarFormula` rodados na conta real
- [ ] Propriedades definidas; `POLICY_VERSIONS` igual à versão do site
- [ ] Implantação com `executeAs: USER_DEPLOYING`, acesso anônimo; URL `/exec` no `NEXT_PUBLIC_LEADS_ENDPOINT`
- [ ] CSP da hospedagem libera só os domínios vistos na T1(e) (dev-infra/dev-devops)
- [ ] Revisão do dev-security (URL pública, RN-14, escopos, editores do script) e avaliação do lgpd-specialist
- [ ] Aceite por escrito de RA-01, RA-02, RA-04 (PEND-18)
- [ ] Retenção (PEND-11) e backup (CA-39) decididos; gatilho de `retencao` criado se aplicável
- [ ] Linhas de teste apagadas da planilha

## 10. Depende do cliente
Conta Google e planilha (PEND-13/14), e-mail do aviso (PEND-15), prazo de retenção (PEND-11), aceite dos riscos (PEND-18), decisão sobre backup automático. Custo recorrente: nenhum cobrado pelo Google nas cotas gratuitas previstas (conferir plano da conta; não verificado para Workspace).

## 11. Pendências para outros agentes
- **dev-react:** cliente conforme a seção 3, pontos 1 a 6; remover `lib/leads/validate.ts` e o teste `tests/apps-script/parity-front.test.ts` juntos.
- **dev-security:** URL pública sem limite por IP; escopos; quem edita o script; fórmula; revisão antes de ir ao ar.
- **dev-tests:** completar com teste no navegador real (T9/T15); a tabela `CASES` em `apps-script/Tests.js` é a base compartilhada.
- **dev-observability:** não há como alertar de dentro do Google além do e-mail de falha de gatilho; sinais possíveis: planilha sem linha nova por X dias com tráfego, ou o aviso de surto.
- **dev-infra/dev-devops:** CSP (`connect-src`) com os domínios do Google confirmados na T1.
- **arquiteto-specs:** seção 8 (colunas Status e ID do envio), CA-39 (backup) e o comportamento de `busy`.
- **lgpd-specialist:** política, operador/transferência internacional, e-mail de aviso, histórico de versões.

## 12. Links oficiais (conferidos em 2026-11-04)
developers.google.com/apps-script/guides/web · /guides/content · /concepts/deployments · /guides/services/quotas · /concepts/scopes · /reference/lock/lock · /reference/mail/mail-app · /manifest/web-app-api-executable

## 13. Histórico
| Data | Mudança | Por quem |
|---|---|---|
| 2026-11-04 | Primeira versão do script, testes locais e ficha | dev-integrations |
