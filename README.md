# Landing page "Loteamento Inteligente"

Página única de vendas (site **estático**, sem backend próprio) que gera leads para o sistema
"Loteamento Inteligente". O formulário envia direto do navegador a um Google Apps Script publicado como
aplicativo da web, que grava numa planilha do Google ([ADR-0001](docs/adr/ADR-0001-leads-em-planilha-google-sem-backend.md)).
Spec: [docs/specs/001-landing-page.md](docs/specs/001-landing-page.md) · design:
[docs/tecnico/design.md](docs/tecnico/design.md) · textos: [docs/tecnico/copy.md](docs/tecnico/copy.md).

**Stack:** Next.js 16 (App Router, `output: 'export'`) · React 19 · TypeScript estrito · CSS próprio
(CSS Modules + tokens em variáveis CSS) · Vitest · yarn. Script de recebimento: `apps-script/`
(Google Apps Script; ficha em `docs/integracoes/leads-apps-script.md`).

## Como rodar

```bash
yarn install
cp .env.example .env.local    # preencha (ver tabela abaixo); nunca commitar valores reais
yarn leads:mock               # outro terminal: endpoint simulado em http://127.0.0.1:8787/leads
yarn dev                      # http://localhost:3000 (com NEXT_PUBLIC_LEADS_ENDPOINT=http://127.0.0.1:8787/leads)
```

Requer Node >= 22.12 (`.nvmrc`). Em `yarn dev`, WhatsApp/e-mail com placeholder aparecem marcados
("[CONFIGURAR WHATSAPP]") e, sem endereço de envio, o formulário mostra o estado de erro.
**`yarn build` falha** se `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_SITE_URL`
ou `NEXT_PUBLIC_LEADS_ENDPOINT` estiverem ausentes ou com placeholder, ou se o endereço de envio não for
`https://script.google.com/...` (CA-33). `NEXT_PUBLIC_*` é embutido no build: troque o valor e refaça o build.

## Comandos

| Comando | O que faz |
|---|---|
| `yarn dev` | Servidor de desenvolvimento |
| `yarn build` | Gera o site estático em `out/` (`output: 'export'`) |
| `yarn typecheck` / `yarn lint` | `tsc --noEmit` / ESLint |
| `yarn test` | Vitest (`tests/`): validação, cliente do formulário (payload, respostas, timeout, `submissionId`, honeypot), `next.config`, e os testes do script em `tests/apps-script/` |
| `yarn leads:mock [porta]` | Endpoint simulado do Apps Script (`scripts/mock-leads-endpoint.mjs`, porta 8787) |
| `yarn format <arquivos>` | Prettier nos arquivos informados |

Não há `start`: o `out/` é servido por qualquer servidor de arquivos (ex.: `npx serve out`).

## Variáveis de ambiente (`.env.example`)

Todas são `NEXT_PUBLIC_*` (públicas, vão para o navegador). Não há segredo no site.

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_WHATSAPP` | Dígitos com `55` + DDD + número (ex.: `5511912345678`) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | E-mail de contato exibido |
| `NEXT_PUBLIC_SITE_URL` | URL pública sem barra final (canonical, Open Graph, sitemap) |
| `NEXT_PUBLIC_LEADS_ENDPOINT` | URL do aplicativo da web do Apps Script (`https://script.google.com/macros/s/.../exec`). Público: qualquer um que veja o código da página o conhece |
| `LEADS_ALLOW_LOOPBACK=1` | **Só no shell, só para QA**: o build aceita `http://127.0.0.1`/`localhost` como endereço de envio, para gerar um `out/` apontando para o mock. Nunca em build de publicação |

## Como o formulário funciona

`components/LeadForm.tsx` valida no navegador (`lib/leads/validate.ts`, RN-11; o script do Google
replica as mesmas regras) e envia com `lib/leads/client.ts`:

- `POST` ao endereço de envio, `Content-Type: text/plain;charset=utf-8` (sem preflight CORS),
  `redirect: 'follow'`, corpo JSON: `name, company, whatsapp` (só dígitos), `email, profile, lotsRange,
  consent: true, policyVersion, submissionId, site_url_2` (honeypot, vazio).
- Resposta lida do corpo: `{ok:true}` | `{ok:false,code:'invalid',fields}` | `{ok:false,code:'busy'}` |
  `{ok:false,code:'server'}`. **O sucesso só aparece após `ok:true`**; qualquer outra coisa é erro.
- Estados: enviando (botão travado, clique duplo ignorado), sucesso, erro por campo (mensagens do
  servidor), `busy`, falha de rede e tempo esgotado (15 s, `AbortController`). No tempo esgotado a
  mensagem pede para conferir antes de reenviar. O `submissionId` (UUID) é gerado no cliente e
  **reaproveitado** nas retentativas dos mesmos dados.
- Sem JavaScript o formulário não grava: um `<noscript>` esconde o formulário e mostra WhatsApp e
  e-mail (opção A da PEND-16, default).
- Nenhum dado pessoal vai para o console.

Contrato e comportamento do script: `docs/integracoes/leads-apps-script.md`. Mudou a lista de versões da
política (`lib/policy.ts`, `POLICY_VERSION`)? Atualize também a lista de versões aceitas no script.

### Mock do endpoint (dev e QA)

`yarn leads:mock` fala o contrato, com CORS aberto, validação reduzida e deduplicação por
`submissionId`. Controle por GET: `/_mode?m=ok|invalid|busy|server|html|http500|slow|hang|drop`,
`/_log` (envios recebidos, em memória) e `/_reset`. Não existe rota de mock no site (o `out/` só tem
arquivos estáticos). Para testar o `out/`: `LEADS_ALLOW_LOOPBACK=1 NEXT_PUBLIC_LEADS_ENDPOINT=http://127.0.0.1:8787/leads yarn build`
(com as outras três variáveis) e sirva `out/` com um servidor estático.

## Hospedagem estática e cabeçalhos de segurança (PEND-06, RNF-15)

O Next em modo `export` **não envia cabeçalhos**. Eles estão em [`public/_headers`](public/_headers)
(copiado para `out/_headers`; formato Cloudflare Pages e Netlify) e **a hospedagem precisa aplicá-los**:
CSP (`connect-src` só para o próprio site, `script.google.com` e `script.googleusercontent.com`; a lista
exata sai da T1), `nosniff`, `X-Frame-Options`/`frame-ancestors 'none'`, `Referrer-Policy`,
`Permissions-Policy` e HSTS curto (`max-age=300`, sem `includeSubDomains`; subir depois de conferir os
subdomínios). Em outra hospedagem, traduza o arquivo para o formato dela. Se a hospedagem não permitir
cabeçalhos, vale o risco aceito RA-03 (só com aceite do dono). `noindex` fora de produção também é da
hospedagem/pipeline (`robots.txt` sempre libera tudo).

O que continua no export (verificado no build): `sitemap.xml`, `robots.txt`, imagens Open Graph e
Twitter, ícone, JSON-LD e metadados. Rotas de metadados têm `export const dynamic = 'force-static'`.

## Estrutura

```
app/                 páginas (/, /politica-de-privacidade, 404), sitemap, robots, OG, ícone
components/          LotDemo (mapa interativo), LeadForm, StickyCta (únicos client components) + seções
lib/                 contact, content (textos do copy.md), demo-lots (dados do mapa), policy, leads/validate, leads/client
public/_headers      cabeçalhos de segurança para a hospedagem estática
scripts/             mock-leads-endpoint.mjs
apps-script/         script de recebimento (Google Apps Script), versionado aqui
tests/               Vitest (leads/, next-config, apps-script/)
docs/                spec, ADR, design, copy, integrações, QA, segurança
```

## Pendências e decisões

Ver [TODO.md](TODO.md). Hospedagem, domínio e cabeçalhos: PEND-06 (`dev-infra`). **Não publicar** antes de
a T1 provar a leitura da resposta do Apps Script (ADR-0001) e de resolver o BUG-07 (política provisória).
