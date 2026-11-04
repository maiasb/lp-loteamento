# Script de recebimento de leads (Google Apps Script)

Recebe o envio do formulário da landing, valida, deduplica e grava uma linha na planilha do
Google. Não há outro backend. Ficha técnica e contrato: `docs/integracoes/leads-apps-script.md`.
Spec: `docs/specs/001-landing-page.md` (v0.3) · ADR-0001.

Arquivos (no editor do Google, o `.js` vira `.gs`):

| Arquivo | Para quê | Colar no Google? |
|---|---|---|
| `Core.js` | Validação e regras puras (sem serviços do Google) | Sim |
| `Code.js` | `doPost`, `doGet`, gravação, aviso, `setup`, `retencao` | Sim |
| `Tests.js` | Tabela de casos e `testarLocalmente` | Opcional (o `yarn test` já usa) |
| `appsscript.json` | Manifest: fuso, V8, escopos, acesso do web app | Sim (ver passo 3) |

> Verificado nesta entrega: só os testes locais (`yarn test`, sem conta Google). **Nada foi
> executado numa conta Google real.** Os itens marcados "não verificado" precisam do teste da
> seção "Provar que funciona" antes de publicar (tarefa T1 da spec).

## Passo a passo (uma vez)

Use a conta Google definida na PEND-13 (com verificação em duas etapas).

1. **Planilha:** crie uma planilha vazia (ex.: "Leads Loteamento Inteligente"). Não compartilhe
   por link; dê acesso só às pessoas da PEND-14. Copie o ID (o trecho entre `/d/` e `/edit` na URL).
2. **Projeto do script:** na planilha, menu Extensões > Apps Script (ou script.google.com, projeto
   novo). Apague o `Código.gs` padrão e crie `Core.gs` e `Code.gs` colando `Core.js` e `Code.js`.
   (Opcional: `Tests.gs` com `Tests.js`.)
3. **Manifest:** em Configurações do projeto, marque "Mostrar arquivo de manifesto appsscript.json
   no editor", abra-o e substitua pelo conteúdo de `appsscript.json`. Ele fixa o fuso
   `America/Sao_Paulo`, o runtime V8, os dois escopos mínimos (planilhas e envio de e-mail) e o
   web app (`executeAs: USER_DEPLOYING`, `access: ANYONE_ANONYMOUS`).
4. **Propriedades do script** (Configurações do projeto > Propriedades do script):

   | Propriedade | Valor | Obrigatória |
   |---|---|---|
   | `SPREADSHEET_ID` | ID do passo 1 | Sim |
   | `SHEET_NAME` | `Leads` | Sim |
   | `POLICY_VERSIONS` | versões da política aceitas, separadas por vírgula (a página envia hoje `0.2`; ex.: `0.2`). Tem que bater com a versão que a página envia (RN-10); ao publicar uma política nova, acrescente a nova **antes** de subir o site | Sim |
   | `NOTIFY_TO` | e-mail do aviso (PEND-15). Vazio = sem aviso | Não |
   | `SURGE_MAX` / `SURGE_WINDOW_MIN` | padrão 20 envios em 10 min (RN-07) | Não |
   | `RETENTION_DAYS` | liga a `retencao()` (mínimo 30). Só depois da PEND-11 | Não |

5. **Rodar `setup`** (selecione a função no editor e clique em Executar). Na primeira vez o Google
   pede autorização (planilhas e envio de e-mail). Cria a aba, o cabeçalho, o fuso da planilha e o
   formato de texto das colunas. É seguro rodar de novo.
6. **Rodar `testarLocalmente`** (sem tocar na planilha) e **`testarFormula`** (grava uma linha com
   `=HYPERLINK(...)`, confere e apaga a linha). O log deve dizer `-> OK`. Se disser `CONFERIR`, avise
   o desenvolvedor (ver teste 4 abaixo).
7. **Implantar como app da web:** Implantar > Nova implantação > tipo "App da Web";
   "Executar como": você; "Quem pode acessar": Qualquer pessoa. Copie a URL que termina em `/exec`.
   (Se "Qualquer pessoa" não aparecer, uma conta Workspace pode ter essa opção bloqueada pelo
   administrador; não verificado.) Entregue a URL ao desenvolvedor para a variável
   `NEXT_PUBLIC_LEADS_ENDPOINT` da landing.

## Mudou o código? Reimplante a mesma implantação

Salvar não publica. Implantar > Gerenciar implantações > lápis (editar) na implantação ativa >
Versão: "Nova versão" > Implantar. A documentação do Google diz que isso mantém a mesma URL
(Apps Script, "Create and manage deployments"). **Não** crie "Nova implantação": gera outra URL e a
landing continuaria apontando para a antiga. A URL `/dev` roda sempre o último código salvo e só
funciona para quem tem acesso de edição: serve para testar, nunca para a landing.

## Provar que funciona (T1) — três testes

Substitua `URL` pela URL `/exec`. Use dados fictícios; o teste grava linhas reais na planilha
(apague depois).

**1. curl (prova o script, não o navegador).** Use `--data` e **não** `-X POST` (com `-X POST` o
curl repete POST após o redirecionamento; comportamento do curl, não verificado com o Google):

```bash
curl -sL -H 'Content-Type: text/plain;charset=utf-8' \
  --data '{"name":"Teste Um","company":"Empresa Teste","whatsapp":"11912345678","email":"teste1@exemplo.test","profile":"loteadora","lotsRange":"ate-100","consent":true,"policyVersion":"0.2","submissionId":"teste-0001-aaaa","hp":""}' \
  "$URL"
# esperado: {"ok":true}  (e uma linha nova na planilha, com e-mail de aviso se NOTIFY_TO)
# repetir o mesmo comando: {"ok":true} e NENHUMA linha nova (mesmo submissionId)
# trocar email por "x": {"ok":false,"code":"invalid","fields":{"email":"..."}}
```

A documentação do Google (Apps Script, "Content Service") diz que a resposta é redirecionada a uma URL
única em `script.googleusercontent.com` e que o cliente HTTP deve seguir redirecionamentos (`-L`).

**2. Navegador (o teste que decide a T1).** O Google não documenta CORS para web apps (a página
"Web Apps" e a de "Content Service" não falam de CORS): **não verificado**. Suba qualquer página em
`http://localhost` (ex.: `python3 -m http.server 8000` numa pasta vazia, abrir `http://localhost:8000/`),
abra o console (F12) e cole:

```js
const URL = 'COLE_A_URL_/exec_AQUI';
const body = { name: 'Teste Dois', company: 'Empresa Teste', whatsapp: '11912345679',
  email: 'teste2@exemplo.test', profile: 'imobiliaria', lotsRange: '101-300', consent: true,
  policyVersion: '0.2', submissionId: crypto.randomUUID(), hp: '' };
const t = performance.now();
const res = await fetch(URL, { method: 'POST', redirect: 'follow',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) });
console.log(res.status, res.type, Math.round(performance.now() - t) + ' ms', await res.json());
```

Passa se imprimir `200 cors <ms> {ok: true}`. Falha se aparecer `TypeError: Failed to fetch` com erro
de CORS: nesse caso o Apps Script **não serve** para a landing (CA-17/CA-22 não atendíveis) e a
decisão volta ao dono (spec 5.7, planos B/C). Repita: (a) Chrome, Firefox e Safari/iOS; (b) janela
anônima (sem sessão Google) e com duas contas Google logadas; (c) a primeira chamada depois de
alguns minutos parado (início a frio) e a seguinte (RNF-14: meta 3 s p75, limite 15 s). Anote os tempos.
Na aba Rede, anote os domínios envolvidos (para a CSP, CA-41); esperado `script.google.com` e
`script.googleusercontent.com`, não verificado.

**3. Concorrência e bordas.**

```js
// 10 envios simultâneos com dados diferentes: devem virar 10 linhas (ou "busy", que a landing trata)
const mk = (i) => ({ ...body, email: `par${i}@exemplo.test`, whatsapp: '119123451' + String(10 + i),
  submissionId: crypto.randomUUID() });
const rs = await Promise.all([...Array(10)].map((_, i) => fetch(URL, { method: 'POST',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(mk(i)) }).then(r => r.json())));
console.log(rs);
// duplo clique: mesmo submissionId duas vezes ao mesmo tempo -> 1 linha
const same = { ...body, submissionId: crypto.randomUUID(), email: 'dup@exemplo.test', whatsapp: '11912345680' };
console.log(await Promise.all([1, 2].map(() => fetch(URL, { method: 'POST',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(same) }).then(r => r.json()))));
// honeypot: {"ok":true} e nenhuma linha
fetch(URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  body: JSON.stringify({ ...body, hp: 'http://spam.test' }) }).then(r => r.json()).then(console.log);
```

Conferir na planilha: linhas certas, WhatsApp como texto, horário em Brasília. Com `NOTIFY_TO`
definido, conferir que chegou um aviso por lead novo. Teste de surto: defina `SURGE_MAX=3`, envie 5
leads distintos, veja `Suspeito = sim` a partir do 4º e um único e-mail de alerta; depois volte
`SURGE_MAX` ao padrão (apague a propriedade) e apague as linhas de teste.

**4. Fórmula (CA-36).** A função `testarFormula` faz o teste. O script grava as colunas de texto
com formato "texto simples" para o Sheets não executar `=`, `+`, `-`, `@`. Se o Sheets ignorar o
formato, uma salvaguarda regrava com apóstrofo e o log mostra `guarda_formula_acionada`. Que o
formato de texto sozinho bloqueia fórmula: **não verificado** na documentação; é o que o teste prova.

## Ver os leads

Abra a planilha: uma linha por lead, do mais antigo ao mais novo. Colunas: Recebido em, Nome,
WhatsApp, E-mail, Empresa, Perfil, Faixa de lotes, Consentimento em, Versão da política, Suspeito,
Status (começa em `novo`; o dono atualiza à mão), ID do envio.

- **Não ordene a aba** (a deduplicação e o surto leem as últimas linhas, na ordem de gravação). Para
  ordenar ou filtrar, use "Criar um filtro" ou uma visualização de filtro, ou copie para outra aba.
- Linhas "Suspeito = sim" chegaram durante um surto; confira antes de ligar para o contato.
- Quem tem acesso de edição pode apagar ou baixar tudo: mantenha a lista curta (RN-15).
- Pedido de exclusão do titular (RN-17): apague a linha (e avise o desenvolvedor para tratar cópias).

## Logs e cotas

Painel do projeto > Execuções mostra falhas; o script não registra dado pessoal, só códigos
(`doPost`, `notify`, `guarda_formula_acionada`). Cotas (Apps Script, "Quotas for Google Services",
consultado em 2026-11-04, podem mudar): e-mail 100 destinatários/dia em conta pessoal e 1.500 em
Workspace; 6 min por execução; 30 execuções simultâneas por usuário.

## Retenção e backup

- **Retenção:** `retencao()` fica desligada até `RETENTION_DAYS` existir (PEND-11). Depois, crie um
  gatilho diário (relógio) para ela no editor. Apaga linhas da aba; **não** apaga o histórico de
  versões do Google nem cópias de segurança.
- **Backup semanal (sugestão, não automatizado aqui):** o script não faz cópia porque isso exigiria
  o escopo amplo do Drive. Opção simples: lembrete semanal para o dono fazer "Arquivo > Fazer uma
  cópia" para uma pasta do Drive restrita às mesmas pessoas, mantendo as 4 últimas. Automatizar com
  gatilho e `DriveApp` é possível, mas amplia a permissão do script: decisão do dono (CA-39 pendente).

## Revogar acesso / trocar a URL

- **Parar de receber leads:** Implantar > Gerenciar implantações > arquivar a implantação (o nome do
  botão pode variar; não verificado). A landing passa a mostrar o erro com WhatsApp (CA-22).
- **Vazou ou há spam pela URL:** crie uma **nova implantação** (nova URL), atualize
  `NEXT_PUBLIC_LEADS_ENDPOINT`, publique o site de novo e arquive a antiga. Como a URL fica no
  código da página, qualquer pessoa a vê: a defesa é a validação do script, não o segredo da URL.
- **Remover a autorização do script:** em myaccount.google.com, "Segurança", acesso de terceiros /
  apps com acesso à conta (nomes de menu mudam; não verificado).
- **Quando alguém sai da equipe:** remover o acesso à planilha e conferir quem é editor do projeto do
  script (editores do script alteram o código que roda com a identidade do dono).

## Testes locais (sem conta Google)

`yarn test` roda `tests/apps-script/` com o código real de `Core.js`/`Code.js` num contexto isolado,
com planilha, trava, propriedades e e-mail simulados: validação (tabela de casos), honeypot,
duplicata, surto, trava ocupada, falha de e-mail, fórmula, leitura limitada das últimas linhas,
`setup` e `retencao`. `parity-front.test.ts` compara com `lib/leads/validate.ts`; apague-o junto com
esse arquivo (spec, T3). Os simuladores seguem a documentação, mas **não provam** o comportamento
real do Google: por isso o teste manual acima.

## Fontes oficiais consultadas (2026-11-04)

developers.google.com/apps-script: guides/web (web apps), guides/content (Content Service),
concepts/deployments, guides/services/quotas, concepts/scopes, reference/lock/lock,
reference/mail/mail-app, manifest/web-app-api-executable.
