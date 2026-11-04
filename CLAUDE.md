# CLAUDE.md

Landing page de vendas do "Loteamento Inteligente" (página única + política de privacidade), **site
estático sem backend próprio**: o formulário envia do navegador a um Google Apps Script (aplicativo da
web) que grava numa planilha do Google (ADR-0001). Sem login, sem painel; consulta dos leads na planilha.
Spec: `docs/specs/001-landing-page.md` · ADR: `docs/adr/` · design: `docs/tecnico/design.md` · textos: `docs/tecnico/copy.md`.

**Stack:** Next.js 16 (App Router, `output: 'export'`) · React 19 · TypeScript estrito
(`noUncheckedIndexedAccess`) · CSS próprio (CSS Modules + variáveis CSS; **sem** Material UI nem lib de
animação) · Vitest · yarn (Node >= 22.12). Script de recebimento em `apps-script/` (dev-integrations).

## Comandos

```bash
yarn dev | build                # build gera out/ (estático); falha com WhatsApp/e-mail/URL/NEXT_PUBLIC_LEADS_ENDPOINT em placeholder (next.config.mjs)
yarn typecheck && yarn lint && yarn test
yarn leads:mock                 # endpoint simulado do Apps Script em 127.0.0.1:8787 (dev e QA)
LEADS_ALLOW_LOOPBACK=1 yarn build   # só QA: aceita o endpoint do mock no build; nunca em publicação
```

Nunca ler, copiar ou expor valores de `.env*`; nomes das variáveis em `.env.example` (todas `NEXT_PUBLIC_*`).

## Convenções

- Prettier: aspas simples, ponto e vírgula, 2 espaços, `printWidth` 100, vírgula final `es5`. Alias `@/`.
- Server Components por padrão. Client components só: `LotDemo`, `LeadForm`, `StickyCta`.
- Textos de UI em `lib/content.ts` (vêm do `copy.md`, sem marcadores `[PEND-xx]`). Só funcionalidades
  da coluna "Pode prometer" da spec (RN-01); sem preço, depoimento, número de cliente (RN-02/03).
- Sem backend próprio (RN-16): nada de Server Action, Route Handler de envio, `headers()`/`redirects()`
  do Next ou rota de mock (não funcionam em `output: 'export'`). Rotas de metadados (`sitemap`, `robots`,
  OG) levam `export const dynamic = 'force-static'`. Cabeçalhos de segurança: `public/_headers`, aplicados pela hospedagem.
- Formulário: `lib/leads/validate.ts` é a referência das regras (o script do Google as replica; mudou
  uma, mudou a outra e os testes). Envio em `lib/leads/client.ts`: contrato fixo (text/plain, JSON,
  `submissionId` reaproveitado nas retentativas); sucesso só com `{ok:true}` lido da resposta. Nenhum dado pessoal em log/console.
- `POLICY_VERSION` (`lib/policy.ts`) sobe a cada mudança do texto da política e precisa constar na lista de versões aceitas do script.
- Estilo: tokens em `app/globals.css`; animar só `transform`/`opacity`; respeitar `prefers-reduced-motion`.
  Toda área que muda de estado (painel do mapa, erros do formulário, sucesso, aviso sem JS) tem altura reservada (CLS 0). Sem `content-visibility` nas seções (a altura varia com a largura e causava salto de rolagem). O card do formulário é branco: redefine `--c-text/--c-link/--c-focus` (contraste >= 4,5:1, conferido com axe).
- Mudou a spec, o design ou o copy? Atualize o documento e o código juntos.

## Agentes deste projeto

- **Stack:** Next.js 16 (App Router, export estático) + React 19 + TypeScript + CSS Modules; Node 22; Google Apps Script + Google Sheets para os leads.
- **Banco:** nenhum (sem backend; leads na planilha do Google).
- **Usa:** dev-react, dev-uiux, copywriter, dev-integrations, dev-infra, dev-performance-seo, dev-tests,
  dev-qa, dev-reviewer, dev-security, lgpd-specialist, dev-devops, docs-handoff.
- **Não usa:** dev-database, dev-auth, dev-dotnet, dev-python, dev-mobile, dev-ai-agents, dev-llm, dev-langchain.
- **Fluxo:** spec (arquiteto-specs) -> T1 spike do Apps Script (dev-integrations) -> design (dev-uiux) e copy
  (copywriter) -> implementação (dev-react; script: dev-integrations) -> dev-tests -> dev-security e
  lgpd-specialist (formulário, política, endereço público) -> dev-reviewer -> dev-performance-seo (CWV, SEO)
  -> dev-qa (aceite em 360/768/1280, teclado, leitor de tela, sem JS) -> dev-infra e dev-devops
  (hospedagem estática, cabeçalhos, pipeline) -> docs-handoff.
- **Pendências:** PEND-06 hospedagem estática, domínio e cabeçalhos -> dev-infra (e dev-devops para o pipeline).
