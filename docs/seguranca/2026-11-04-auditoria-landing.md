# Auditoria de segurança (AppSec): landing page "Loteamento Inteligente"

- **Data:** 2026-11-04 · **Autor:** dev-security (modo auditoria, sem edição de código)
- **Versões (lockfile):** next 16.4.5, react/react-dom 19.3.1, mysql2 3.24.6, nodemailer 10.3.1, Node >= 22.12
- **Estado:** relatório para aprovação. Nenhuma correção aplicada.

## 1. Escopo analisado

- **Lido:** `CLAUDE.md`, `README.md`, `TODO.md`, `docs/specs/001-landing-page.md`, `next.config.mjs`, `docker-compose.yml`, `.env.example` (só nomes), `app/actions.ts`, `lib/leads/*`, `lib/db.ts`, `lib/contact.ts`, `components/LeadForm.tsx`, `components/JsonLd.tsx`, `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`, `app/opengraph-image.tsx`, `migrations/*.sql`, `scripts/*.ts`; código do Next instalado (`base-server.js`, `action-handler.js`) e a documentação em `node_modules/next/dist/docs/`.
- **Rodado:** `yarn audit` (produção e completo); teste dinâmico **só em 127.0.0.1:3456** (`next dev`, variáveis fictícias no shell, banco apontado para porta fechada, sem SMTP; não existe `.env` no projeto). Servidor derrubado ao fim.
- **Fora do escopo:** hospedagem, proxy, TLS e DNS reais (PEND-06, ainda não existem), Cloudflare, build de produção (`next build` não foi rodado para não sobrescrever `.next`), testes do projeto (não executados, por regra), Semgrep e gitleaks (não instalados; o diretório não é repositório git, então não há histórico a varrer), texto da política (lgpd-specialist).
- **Limitação:** auditoria por IA não substitui pentest profissional. Para esta landing (dados de contato comercial, sem login nem pagamento) o risco é moderado; um teste dinâmico do ambiente real (dev-pentest) é recomendado depois do deploy.

## 2. Superfície de ataque

| Ponto de entrada | Acesso | Papéis | Dados |
|---|---|---|---|
| `GET /`, `GET /politica-de-privacidade` | Público | — | Conteúdo estático, contato `NEXT_PUBLIC_*` |
| Server Action `submitLead` (`app/actions.ts:8`), POST em `/` (com e sem JS) | Público | — | Nome, WhatsApp, e-mail, empresa, perfil, faixa, consentimento; IP (hash) |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image`, `/twitter-image`, `/icon.svg` | Público | — | Estáticos, sem entrada |
| `after(() => notifyLead(...))` (`lib/leads/submit.ts:62`) | Interno (saída SMTP) | — | Dados do lead para `LEAD_NOTIFY_TO` |
| `yarn migrate`, `yarn leads:export` (`scripts/`) | Local, operador | Dono/dev | Todos os leads (CSV) |
| MySQL (`docker-compose.yml`) | `127.0.0.1` | App e operador (mesmo usuário) | Leads, `rate_limit_hits` |

Sem Route Handlers, `proxy.ts`/middleware, uploads, webhooks, cron ou IA.

## 3. Modelagem de ameaças (resumo)

| Ativo | Ameaça | Entrada | Controle existente | Risco residual |
|---|---|---|---|---|
| Captura de leads (receita do cliente) | Formulário bloqueado para todos | IP compartilhado no limite | Limite por IP no MySQL | **Médio** (A-01) |
| Base de leads e caixa do dono | Spam de leads falsos, inundação de e-mail | Server Action | Honeypot + limite por IP | **Médio** (A-01, A-02) |
| Leads (dados pessoais) | Leitura/alteração via injeção | Server Action | SQL parametrizado, allowlist de campos | Baixo |
| Credencial SMTP e dados do lead em trânsito | Rebaixamento de STARTTLS | Conexão SMTP | `secure` opcional | Baixo (A-04) |
| Planilha do dono | Injeção de fórmula | CSV | Prefixo `'` | Baixo (sem achado) |
| Visitante | XSS | JSON-LD, valores devolvidos | Escape do React, `<` escapado, CSP | Baixo (A-06) |

## 4. Achados

Sem achados **Críticos** ou **Altos**.

### Médio

#### A-01 · Limite por IP: padrão de `CLIENT_IP_HEADER` e o preenchimento do Next divergem do README (bloqueio geral do formulário ou limite forjável)

- `lib/leads/client-ip.ts:7-9`, `lib/leads/submit.ts:26-31`, `README.md:78` e `README.md:85`, `TODO.md:26`, `.env.example:22` · OWASP API4:2023 (consumo irrestrito de recursos), CWE-348 (uso de fonte menos confiável), CWE-770.
- **Descrição.** O README diz que, sem a variável, "o limite fica desligado". O código, porém, usa `x-forwarded-for` como padrão, e o Next 16.4.5 preenche esse cabeçalho com o endereço do socket quando ele não vem na requisição (`node_modules/next/dist/server/base-server.js:604`, `req.headers['x-forwarded-for'] ??= socket.remoteAddress`). **Confirmado no teste local:** POST sem `X-Forwarded-For` não registrou "IP do cliente indisponível" e foi direto para o limite no banco (log `ECONNREFUSED`). Disso saem três cenários reais:
  1. **Proxy que não envia `X-Forwarded-For`** (o nginx não envia sem `proxy_set_header`; alguns PaaS e túneis também não): o Next grava o IP do proxy (`127.0.0.1` ou IP interno), todos os visitantes caem no mesmo balde e, **depois de 5 leads válidos em 10 min, o formulário recusa todo mundo**. Um atacante pode provocar isso de propósito com 5 envios.
  2. **App exposto direto** (ou origem alcançável sem passar pelo proxy): o visitante manda o próprio `X-Forwarded-For`, e o `??=` preserva o valor dele; o último item é escolhido pelo atacante, que troca o valor a cada envio e ignora o limite. Qualquer texto de até 64 caracteres é aceito como IP.
  3. **`CLIENT_IP_HEADER=cf-connecting-ip` com origem aberta:** o atacante envia o cabeçalho com qualquer valor (limite forjável) ou não envia (caminho `ip === null`, **sem limite**).
- **Cenário conceitual.** Um concorrente ou um bot desliga a captação por horas (cenário 1) ou injeta milhares de leads falsos com notificação por e-mail para cada um (cenários 2 e 3).
- **Impacto.** Perda de leads (dinheiro do cliente), base poluída, caixa do dono inundada, risco de suspensão da conta SMTP por volume.
- **Correção sugerida (enxuta).**
  1. Exigir `CLIENT_IP_HEADER` explícito em produção, como já é feito com o sal (`next.config.mjs`, em `PHASE_PRODUCTION_SERVER`), e remover o padrão silencioso de `client-ip.ts`:
     ```ts
     export function getClientIp(headers: Pick<Headers, 'get'>): string | null {
       const name = process.env.CLIENT_IP_HEADER?.trim().toLowerCase()
         || (process.env.NODE_ENV === 'production' ? '' : 'x-forwarded-for');
       if (!name) return null;
       const last = headers.get(name)?.split(',').at(-1)?.trim();
       return last && isIP(last) ? last : null; // import { isIP } from 'node:net'
     }
     ```
  2. Corrigir o README (linhas 78 e 85) e o TODO (linha 26): sem proxy **não existe** configuração segura; o limite só protege atrás de um proxy que **sobrescreve** o cabeçalho, com a origem fechada para qualquer outro tráfego.
  3. Registrar no checklist de deploy (dev-devops/dev-infra) três itens: `proxy_set_header X-Forwarded-For $remote_addr;` no nginx; firewall da origem aceitando só o proxy ou as faixas da Cloudflare; regra de rate limiting na borda (Cloudflare) para o POST em `/` como segunda camada.
- **Teste que prova o fechamento** (`tests/leads/client-ip.test.ts`): em `NODE_ENV=production` sem `CLIENT_IP_HEADER`, `getClientIp` devolve `null` e o start falha; `X-Forwarded-For: lixo` devolve `null`; `X-Forwarded-For: 1.2.3.4, 10.0.0.1` devolve `10.0.0.1`.
- **Dono:** dev-react (código e README); dev-devops e dev-infra (proxy, firewall, borda).

#### A-02 · Limite por IP contornável com rotação de IPv6

- `lib/leads/rate-limit.ts:19-21` e `:27-28` · CWE-770.
- **Descrição.** O hash é calculado sobre o endereço completo. Uma conexão IPv6 comum recebe um prefixo /64 inteiro (2^64 endereços), e trocar o endereço a cada envio é trivial; a Cloudflare repassa o IPv6 do cliente em `cf-connecting-ip`.
- **Cenário conceitual.** Um único atacante, com um único provedor doméstico, envia leads ilimitados sem tocar no limite de 5 a cada 10 min.
- **Impacto.** O mesmo do A-01 (spam de leads, e-mail ao dono, crescimento de `rate_limit_hits`), mesmo com o proxy correto.
- **Correção sugerida.** Agrupar IPv6 por /64 antes do hash:
  ```ts
  import { isIPv6 } from 'node:net';
  function bucket(ip: string): string {
    if (!isIPv6(ip) || ip.startsWith('::ffff:')) return ip.replace(/^::ffff:/, '');
    const [head = '', tail = ''] = ip.split('::');
    const h = head ? head.split(':') : [];
    const t = tail ? tail.split(':') : [];
    const full = [...h, ...Array(8 - h.length - t.length).fill('0'), ...t];
    return `${full.slice(0, 4).map((p) => p.padStart(4, '0')).join(':')}::/64`;
  }
  // hashIp(bucket(ip))
  ```
- **Teste:** `2001:db8:1:2::1` e `2001:db8:1:2:ffff::9` geram o mesmo hash; `2001:db8:1:3::1` gera outro; o sexto envio do mesmo /64 recebe `rate_limited`.
- **Dono:** dev-react (com dev-tests).

### Baixo

#### A-03 · Checagem e registro do limite não são atômicos (SELECT, depois INSERT)

- `lib/leads/rate-limit.ts:33-39` · CWE-362.
- **Descrição.** Envios simultâneos do mesmo IP leem a mesma contagem antes de qualquer INSERT. O excedente fica limitado pelo pool de 5 conexões (`lib/db.ts:22`), então o efeito é pequeno, mas a regra RN-07 não é exata. Além disso, o `DELETE` de retenção roda a cada envio.
- **Correção.** Inverter a ordem (inserir, depois contar, com a própria linha incluída), sem lock nem transação:
  ```ts
  await runStatement('INSERT INTO rate_limit_hits (ip_hash) VALUES (?)', [ipHash]);
  const rows = await selectRows(/* COUNT(*) ... created_at > UTC_TIMESTAMP() - INTERVAL ? MINUTE */);
  return Number(rows[0]?.total ?? 0) <= RATE_LIMIT.max;
  ```
  Envio recusado também conta, o que é aceitável (e até desejável) para abuso.
- **Teste:** 10 chamadas concorrentes de `consumeRateLimit` com o mesmo IP (`Promise.all`, teste de integração) resultam em exatamente 5 `true`.
- **Dono:** dev-react; dev-database confirma o índice `idx_rate_limit_ip_created`.

#### A-04 · SMTP aceita sessão sem TLS (STARTTLS oportunista)

- `lib/leads/notify.ts:41-51`, `.env.example` (`SMTP_SECURE=false`) · ASVS V9.2 (comunicação de saída), CWE-319.
- **Descrição.** Com `secure: false` e sem `requireTLS`, o nodemailer usa STARTTLS só quando o servidor o anuncia. Um intermediário na rede consegue remover o anúncio, e o login SMTP e os dados do lead seguem em texto claro. A probabilidade é baixa (exige posição na rede entre a hospedagem e o provedor); o impacto é a credencial SMTP (envio de e-mail em nome do cliente).
- **Correção.** Uma linha no transporte: `requireTLS: process.env.SMTP_SECURE !== 'true'` (a opção existe nos tipos instalados, `@types/nodemailer/lib/smtp-connection/index.d.ts:145`). O `.env.example` passa a explicar que a porta 587 exige STARTTLS.
- **Teste:** `createTransport` é chamado com `requireTLS: true` quando `SMTP_SECURE=false` (mock do nodemailer no teste unitário existente).
- **Dono:** dev-notifications (aplicação pelo dev-react).

#### A-05 · Valores brutos devolvidos sem limite e corpo de até 1 MB (amplificação)

- `lib/leads/validate.ts:117-123`, `lib/leads/submit.ts:23`, `:30` e `:68`; `next.config.mjs` (sem `serverActions.bodySizeLimit`).
- **Descrição.** `readForm` copia os campos sem truncar, e os estados `invalid`, `rate_limited` e `error` devolvem tudo ao cliente (input, payload RSC e HTML). **Medido localmente:** um `name` de 900 KB gerou uma resposta de 2,9 MB (cerca de 3,2x); acima de 1 MB o Next recusa (limite padrão). Não há XSS (o React escapa); o risco é consumo de banda e CPU barato para o atacante. O formulário real cabe em poucos KB.
- **Correção.**
  ```js
  // next.config.mjs, dentro do objeto retornado
  experimental: { serverActions: { bodySizeLimit: '32kb' } },
  ```
  e, em `readForm`, `raw[field] = value.slice(0, 1000);`. A documentação instalada (`serverActions.md`) confirma a chave em `experimental` e que o limite vale para o corpo multipart bruto, ou seja, também para o envio sem JS.
- **Teste:** `readForm` com valor de 5.000 caracteres devolve 1.000; no teste manual, um POST de 64 KB recebe erro.
- **Dono:** dev-react.

#### A-06 · CSP com `'unsafe-inline'` em `script-src`

- `next.config.mjs:43-55`.
- **Avaliação do risco real.** Baixo. Nenhum dado do visitante vira HTML: o React escapa os valores devolvidos e o único `dangerouslySetInnerHTML` (`components/JsonLd.tsx:36`) serializa conteúdo estático com `<` escapado. O `'unsafe-inline'` só pesa se surgir um XSS no futuro (por exemplo, um script de analytics, ver PEND-02). O restante da CSP é bom: `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'` e `connect-src 'self'`; `'unsafe-eval'` aparece só em desenvolvimento (confirmado no cabeçalho local).
- **Alternativas no Next estático.**
  1. **Nonce via `proxy.ts`:** obriga render dinâmico em todas as páginas (sem cache estático nem CDN), o que pesa nas metas de CWV e na hospedagem. **Não recomendado** para esta landing.
  2. **`experimental.sri`** (guia `content-security-policy.md`, "Subresource Integrity (Experimental)"): mantém o estático e a doc mostra a CSP sem `'unsafe-inline'`. **A confirmar:** se os scripts inline do payload RSC continuam bloqueados. Validar num build local com o cabeçalho `Content-Security-Policy-Report-Only` sem `'unsafe-inline'` e adotar só se o console ficar limpo, sabendo que é recurso experimental.
- **Recomendação.** Manter como está e registrar o risco aceito no README. Reavaliar se entrar script de terceiros (PEND-02).
- **Dono:** dev-react.

#### A-07 · HSTS com `includeSubDomains` antes de conhecer o domínio

- `next.config.mjs:62`.
- **Descrição.** Por 2 anos, o navegador força HTTPS em **todos os subdomínios** do host que serve a landing. Se ela ficar no domínio raiz do cliente e houver subdomínio só em HTTP (sistema legado, webmail, painel da hospedagem), ele deixa de abrir para quem visitou a landing. A Cloudflare ou o proxy também podem enviar HSTS, e o cabeçalho sai duplicado.
- **Correção.** Decidir na PEND-06: começar com `max-age=300` sem `includeSubDomains`, verificar os subdomínios e só então subir para `63072000; includeSubDomains`. HSTS em um único lugar (app **ou** borda).
- **Dono:** dev-infra (decisão), dev-react (valor).

#### A-08 · Regex de e-mail permissiva e caracteres de formatação Unicode no nome

- `lib/leads/validate.ts:60` e `:63-65`; uso em `lib/leads/notify.ts:56` (`replyTo`).
- **Descrição.** `EMAIL_RE` aceita `< > " , ; : ( )` (por exemplo `Fulano<a@b.com>`). O valor vai para o banco e o CSV e é interpretado pelo parser de endereços do nodemailer no `replyTo`, que já teve divergências publicadas (ver GHSA-g57g-f23g-4646 e GHSA-cc9r-2j5m-2m83; a versão instalada, 10.3.1, é posterior às correções citadas: conferir). **Não há** injeção de cabeçalho: CR/LF não passam pela regex (`\s`) nem por `oneLine`, e o nodemailer codifica os cabeçalhos. `cleanText` remove só C0/DEL, então caracteres bidi e de largura zero (U+202E, U+200B) passam no nome e na empresa e podem disfarçar o texto no assunto do e-mail e no CSV.
- **Correção.** E-mail: `^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$` (perde endereços com acento, raros no público B2B; confirmar com o dono). Nome e empresa: acrescentar `​-‏‪-‮⁦-⁩` à classe removida em `cleanText`.
- **Teste:** `validateLead` recusa `a<b@c.com` e `"x"@c.com`; `cleanText('A‮B')` devolve `A B`.
- **Dono:** dev-react.

#### A-09 · Usuário do banco com privilégio total e compartilhado com as migrations

- `docker-compose.yml:12-14`; `lib/db.ts:9-11`; `scripts/migrate.ts:14`.
- **Descrição.** `MYSQL_USER` recebe `ALL` no schema, e a aplicação usa esse mesmo usuário (com `DROP`, `ALTER`). Não há injeção hoje, então é endurecimento (menor privilégio): um bug futuro teria alcance total.
- **Correção.** Em produção, dois usuários: o da aplicação com `SELECT, INSERT, DELETE` em `rate_limit_hits` e `SELECT, INSERT` em `leads` (mais `DELETE` em `leads` se a exclusão a pedido do titular for feita por script); o de migração com DDL, usado só no `yarn migrate`. Imagem `mysql:8.4` fixada por digest (opcional).
- **Dono:** dev-database (grants), dev-devops (compose e deploy).

#### A-10 · Resposta do honeypot é distinguível do sucesso real

- `lib/leads/submit.ts:18`.
- **Descrição.** O honeypot devolve `firstName: null` ("Obrigado."), enquanto o envio real devolve "Obrigado, Fulano.". Um bot pode detectar a armadilha comparando as respostas. Impacto pequeno: o honeypot só filtra bots simples.
- **Correção.** No ramo do honeypot, devolver `firstName: cleanText(readForm(formData).name).split(' ')[0] || null`.
- **Teste:** com o honeypot preenchido, a resposta é idêntica à do sucesso para o mesmo nome e nada é gravado (o teste existente ganha o assert do `firstName`).
- **Dono:** dev-react.

#### A-11 · Módulos de servidor sem `server-only`

- `lib/db.ts:1`, `lib/leads/notify.ts:1`, `lib/leads/rate-limit.ts:1`.
- **Descrição.** Defesa em profundidade, recomendada no guia `data-security.md` instalado. Hoje nenhum client component importa esses módulos, e variáveis sem `NEXT_PUBLIC_` não entram no bundle (verificado: zero ocorrências de `mysql2`, `nodemailer` ou nomes de segredo em `.next/static`).
- **Correção.** `import 'server-only';` no topo dos três arquivos. **Atenção:** os scripts `tsx` (`scripts/*.ts`) importam `lib/db.ts`; colocar o import só em `notify.ts` e `rate-limit.ts`, ou confirmar antes que o pacote não quebra fora do Next.
- **Dono:** dev-react.

### A confirmar

- **AC-1 · Deduplicação de 10 s e bloqueios no InnoDB** (`lib/leads/submit.ts:37-58`). Além da corrida já registrada (`TODO.md:35`), `INSERT ... SELECT ... WHERE NOT EXISTS` sobre a mesma tabela em REPEATABLE READ pode pegar locks de intervalo e gerar deadlock (erro 1213) em envios simultâneos; o visitante veria "não conseguimos enviar". Verificar com dois envios concorrentes no MySQL de teste. Dono: dev-database.

### Sem achados (verificado)

- **SQL injection:** todas as consultas usam `execute` com `?` (`lib/db.ts:32` e `:41`); o `WHERE` do export é montado só com textos fixos (`scripts/export-leads.ts:22-36`); `multipleStatements` só no script de migração, com arquivos do repositório.
- **Mass assignment:** `readForm` usa a allowlist `FIELDS`; colunas fixas no INSERT; `created_at`, `consent_at` e `policy_version` vêm do servidor; `profile` e `lotsRange` são validados por allowlist e ENUM no banco.
- **Origem/CSRF:** a checagem de origem do Next está ativa (**teste local:** `Origin: http://evil.example` resultou em 500; mesma origem, 200). Requisição sem `Origin` passa com aviso, comportamento documentado do Next. Como não há sessão nem cookie, CSRF não traz ganho ao atacante além do POST direto. `allowedOrigins` **não deve** ser configurado, salvo se o proxy reescrever o host sem `X-Forwarded-Host` (aí entra só o domínio público, sem curinga).
- **E-mail:** só texto (`text`), sem HTML, portanto sem HTML não escapado; assunto e campos passam por `cleanText` e `oneLine`; `to` vem do ambiente. **E-mail bombing contra terceiros é impossível:** a aplicação nunca envia e-mail ao endereço digitado.
- **CSV:** prefixo `'` para `= + - @`, tab e CR no início (também depois de espaços), aspas e `;` escapados; BOM UTF-8 correto (bytes `EF BB BF`, `lib/leads/csv.ts:44`); arquivo com permissão 600 e `exports/` no `.gitignore`.
- **JSON-LD/XSS:** conteúdo estático com `<` escapado; nenhum outro `dangerouslySetInnerHTML`, `innerHTML` ou `href` vindo do usuário.
- **Segredos e vazamento:** `NEXT_PUBLIC_*` só com contato público; `.env*` no `.gitignore`; nenhum `.env` no projeto; zero sourcemaps em `.next/static` (`productionBrowserSourceMaps` desligado por padrão); logs só com código de erro; mensagens ao visitante genéricas; `poweredByHeader: false`.
- **Docker:** MySQL publicado só em `127.0.0.1`; `MYSQL_RANDOM_ROOT_PASSWORD`; `DB_PASSWORD` obrigatório. A senha `lp_it_senha_fake` do README é do banco de teste, fictícia.
- **Sal do hash do IP:** obrigatório em produção (build, start e `hashIp`); sal fixo só em desenvolvimento.
- **Demais cabeçalhos:** `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` presentes (confirmados na resposta local). `Cross-Origin-Opener-Policy: same-origin` é opcional e de baixo ganho aqui.

## 5. Encaminhamentos

| Agente | O que fazer |
|---|---|
| dev-react | A-01 (código, README, TODO), A-02, A-03, A-05, A-06 (registrar risco aceito), A-08, A-10, A-11; aplicar A-04 |
| dev-notifications | A-04 (`requireTLS`) |
| dev-devops / dev-infra | A-01 (proxy sobrescrevendo o cabeçalho, origem fechada, rate limit na borda), A-07 (HSTS e subdomínios), A-09 (compose e usuário de migração) |
| dev-database | A-09 (grants), AC-1 (deadlock e dedupe), índice do A-03 |
| dev-tests | Testes de fechamento listados em cada achado |
| dev-pentest | Após o deploy (PEND-06): matriz de cabeçalho de IP contra o ambiente real, borda e TLS |

## 6. Ferramentas automáticas

- `yarn audit --groups dependencies`: **0** vulnerabilidades (65 pacotes de produção).
- `yarn audit` (completo): 6 moderadas, todas `minimatch < 11.0.1` (GHSA-g3hv-75wg-m249) via `eslint` e `eslint-config-next`. **Descartadas para produção:** só ferramentas de lint, fora do runtime (o `dev=false` do relatório do yarn é impreciso; o caminho começa em devDependencies). Atualizar quando sair versão do eslint que resolva.
- **Next 16.4.5:** segundo fontes de terceiros, os avisos de outubro de 2026 (GHSA-673q-mjm6-r5xr, GHSA-2464-fhr4-w9xw, GHSA-p3m5-59mp-jv5r) afetam até 16.4.0 e foram corrigidos em 16.4.1. **Conferir** na página de segurança do Next.js e no GitHub Advisory Database. **nodemailer 10.3.1:** posterior às correções de 2026 do parser de endereços (até 10.0.9). Essas informações podem estar desatualizadas.
- Semgrep e gitleaks: não instalados. Comandos sugeridos: `semgrep scan --config p/typescript --config p/nextjs` e, quando houver repositório git, `gitleaks git --redact`.
- Teste dinâmico local (127.0.0.1:3456, dados fictícios): cabeçalhos conferidos; origem cruzada recusada; `X-Forwarded-For` preenchido pelo Next a partir do socket (A-01); amplificação de 3,2x e corte em 1 MB (A-05).

## 7. Checklist final

- **Corrigido:** nada (modo auditoria).
- **Pendente:** A-01 e A-02 (antes do deploy em produção), A-03 a A-11, AC-1.
- **Segredos a rotacionar:** nenhum encontrado.
- **Nova auditoria:** depois da definição da PEND-06 (proxy, domínio, borda), com dev-pentest no ambiente de staging; e sempre que entrar analytics ou script de terceiros (PEND-02), por causa da CSP.
- **Limitação:** este relatório não substitui um pentest profissional; não cobre a infraestrutura de produção, que ainda não existe.
- **Testes:** nenhum teste do projeto foi executado (não verificado por testes). Recomendado depois das correções: `yarn test` e `yarn test:integration` (com o MySQL de teste do README).
