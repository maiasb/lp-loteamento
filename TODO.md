# TODO

## Em andamento

- Remoção do backend (spec 0.3, T3/T4/T6 feitas pelo dev-react em 2026-11-04) e script do Google entregue (`apps-script/`, não publicado). Falta: T1 (spike real do Apps Script, dev-integrations + dono), T7 (copywriter), T8 (lgpd-specialist), T9..T16.

## Bloqueios de publicação

- [ ] **Publicado em 2026-11-04** em https://loteamento.odevmaia.com.br/ (repo público `maiasb/lp-loteamento`, GitHub Pages por Actions, CNAME no Cloudflare sem proxy, HTTPS ativo, variáveis `NEXT_PUBLIC_*` no repo, card no portfólio em `maiasb.github.io`). Pendente depois do deploy:
  - [ ] **T1 (fechar)**: enviar o formulário uma vez pelo site real e conferir a linha na planilha e a mensagem de sucesso (o `curl` só provou o script e o `access-control-allow-origin: *`; leitura da resposta no navegador, tempo frio/quente, 10 envios simultâneos e Safari/iOS seguem sem teste)
  - [ ] Apagar da planilha as linhas de teste (ex.: "Teste Claude", `teste-claude@exemplo.test`)
  - [ ] Rodar `testarFormula` no editor do Apps Script se ainda não rodou (RN-14) e conferir `-> OK`
  - [ ] Riscos aceitos pelo dono: política provisória (BUG-07) e sem `_headers` no GitHub Pages (RA-03: sem CSP/HSTS; só com proxy do Cloudflare ou outra hospedagem); `POLICY_VERSIONS` do script precisa conter a versão do site (hoje `0.2`)
  - [ ] Atualizar o README com a hospedagem (GitHub Pages, workflow, variáveis do repo, domínio) e o item PEND-06 (hospedagem e domínio definidos; cabeçalhos e pipeline parcialmente atendidos)
  - [ ] Workflow usa actions em Node 20 (aviso de descontinuação): subir `checkout`, `setup-node`, `configure-pages`, `upload-pages-artifact`, `deploy-pages` para versões em Node 24 quando houver

- [ ] **T1 (BLOQUEIA PUBLICAÇÃO)**: o dono publica o script (`apps-script/`, ver `docs/integracoes/leads-apps-script.md`) e prova que o navegador **lê** a resposta (`{ok:true}` etc.) a partir de uma página estática; medir tempo frio/quente, 10 envios simultâneos, `=` no início, e confirmar os domínios da CSP. Até lá o cliente (`lib/leads/client.ts`) só foi provado contra o mock (`yarn leads:mock`). Se a resposta não for legível, a decisão volta ao dono (ADR-0001, opções B/C)
- [ ] BUG-07 (BLOQUEIA PUBLICAÇÃO): política com texto provisório ("nome ou razão social e CNPJ a serem informados", "O prazo definitivo será informado aqui"). Depende de PEND-09/PEND-11 (dados do dono) e da revisão do lgpd-specialist
- [ ] PEND-18: aceite por escrito do dono dos riscos RA-01, RA-02, RA-04 (e RA-03 se a hospedagem não permitir cabeçalhos)
- [ ] Trocar WhatsApp, e-mail, URL do site e endereço de envio (`NEXT_PUBLIC_*`) por valores reais no build de produção (o build falha sem eles)

## Pendente

Defaults adotados enquanto o dono não responde (usuário pediu "prossiga com o que tiver"):

- [ ] PEND-01 Volume esperado de leads/mês e meta de conversão (default: 200 leads/mês, 10 mil visitas/mês)
- [ ] PEND-02 Analytics e banner de cookies (default: nenhum analytics)
- [ ] PEND-03 Preço/forma de cobrança na página (default: não publicar preço, "sob consulta")
- [ ] PEND-04 Anunciar funções condicionais: prazo de reserva com vencimento, sinal, histórico do lote, mapa público colorido (default: não anunciar)
- [ ] PEND-05 Logo, cores e prints com dados fictícios (default: identidade criada pelo dev-uiux, demo com dados fictícios)
- [ ] PEND-06 Hospedagem estática, domínio e **aplicar `public/_headers`** (CSP, HSTS curto etc.; a hospedagem precisa permitir cabeçalhos, senão RA-03) -> dev-infra / dev-devops. Pipeline: build estático + publicação, sem Docker
- [ ] PEND-07 Mensagem de implantação: prazo, suporte, atualizações (default: "na hospedagem do cliente", sem prazo numérico)
- [ ] PEND-09 Controlador dos dados (nome/razão social, CNPJ, e-mail do titular): a política e o rodapé estão sem esses dados
- [ ] PEND-11 Prazo de retenção dos leads (planilha, cópias, histórico, e-mails de aviso); a política diz apenas "pelo tempo necessário"
- [ ] PEND-12 Confirmar stack: Next.js App Router com exportação estática, TS estrito, yarn, sem banco e sem Docker (implementado assim)
- [ ] PEND-13 Conta Google dona da planilha e do script: Gmail ou Workspace (recomendado Workspace; verificação em duas etapas)
- [ ] PEND-14 Quem, além do dono, vê a planilha (leitura ou edição)
- [ ] PEND-15 E-mail que recebe o aviso de lead novo
- [ ] PEND-16 Sem JavaScript: **default adotado = opção A** (formulário escondido via `<noscript>`, mostra WhatsApp e e-mail; implementado em `LeadForm`). Dono confirma ou escolhe B (enviar mesmo assim e confirmar numa página do Google)
- [ ] PEND-17 Desafio anti-robô (Turnstile): default = não; ligar só se houver spam (RA-01)
- [ ] lgpd-specialist (T8): revisar o texto provisório de `app/politica-de-privacidade/page.tsx` (já cita o Google/Sheets/Apps Script como operador, possível transferência internacional e que o IP não é coletado, `POLICY_VERSION` 0.2), o texto de consentimento e o aviso do formulário; retenção em planilha/cópias/histórico/e-mail. **A lista de versões aceitas do script precisa conter a versão do site** (hoje `0.2`; subir os dois juntos)
- [ ] copywriter (T7): revisar textos novos do formulário em `components/LeadForm.tsx` (busy, falha de rede, tempo esgotado, aviso sem JavaScript); `docs/tecnico/copy.md` ainda tem a mensagem de "limite de envios", que saiu
- [ ] dev-security (T12): reauditar com endereço público, RN-14, permissões do script/planilha, CSP na hospedagem, RA-01..04. A-06: CSP com `'unsafe-inline'` em `script-src` (site estático sem nonce; reavaliar se entrar script de terceiros, PEND-02)
- [ ] dev-infra (A-07): HSTS em `public/_headers` está `max-age=300` sem `includeSubDomains`; subir só depois de conferir os subdomínios; enviar HSTS em um só lugar (hospedagem)
- [ ] `public/_headers` força `Content-Type: image/png` em `/opengraph-image` e `/twitter-image` (no export ficam sem extensão); conferir que a hospedagem respeita, senão os crawlers de redes sociais podem rejeitar a imagem
- [ ] dev-tests (T9): testes de componente do `LeadForm` (estados, faixa mantida, contraste) e CLS em 768 ficaram só com verificação manual em Chrome headless (puppeteer descartável, não está no projeto); a regra de paridade com o script já está em `tests/apps-script/`
- [ ] dev-qa (T15): aceite em 360/768/1280 com teclado e leitor de tela, forced-colors, zoom 200 %, contraste com ferramenta, Google fora do ar (`docs/qa/`)
- [ ] dev-performance-seo (T13): medição de campo após o deploy (PageSpeed Insights, Search Console); JS da primeira carga hoje ~149,1 kB gz -9 (145,6 KiB) sem o polyfill, teto 150 KB, alerta 160 KB
- [ ] Peso do DOM (~1.280 elementos, 157 KB de HTML): os dois mapas, `wide` e `narrow`, continuam no DOM (~77 KB de SVG). Se o TBT justificar, reintroduzir `content-visibility: auto` com `contain-intrinsic-size` medido por largura (dev-performance-seo)
- [ ] Bloqueio de indexação fora de produção: `app/robots.ts` sempre libera tudo. No export não há variável de runtime; usar build separado de staging com `noindex` ou cabeçalho `X-Robots-Tag` na hospedagem (dev-devops/dev-infra)
- [ ] Conferir visualmente (dev-uiux) os títulos com Bricolage Grotesque 700 estático
- [ ] Adicionar `lastModified` real ao `app/sitemap.ts` quando houver data de publicação (opcional)
- [ ] Desvios do design registrados: (1) Bricolage Grotesque e Geist existem no `next/font/google` (sem fallback Geist 700); (2) imagem OG gerada com a fonte padrão do `ImageResponse`; (3) painel do mapa ao lado só em >= 1024 px; (4) painel com altura reservada de 490/540 px; (5) FAQ usa `<details>` nativo; (6) benefícios: 6 dos 8 do copy.md; (7) nome do loteamento fictício "Residencial Exemplo" em vez de "Vista do Ipê" (D-1 aberta); (8) sem esqueleto de carregamento da demo; (9) mensagens de erro do copy.md passam de 34 caracteres: WhatsApp, e-mail e consentimento reservam 2 linhas; (10) rota `/politica-de-privacidade` em vez de `/privacidade`; (11) frase de apoio do FAQ é nossa; (12) sem `apple-icon` PNG
- [ ] Alerta do formulário (falha/busy/rede/tempo esgotado) passa do slot reservado de 72/96 px (D-4): o slot guarda a maior altura já vista (`min-height` no `LeadForm`) para não haver salto ao sumir; o primeiro aparecimento do alerta empurra o conteúdo abaixo (só após ação do usuário, aceito)
- [ ] BUG-11 (dev-uiux decide): em telas < 768 px o Enter/Espaço em um lote não rola mais até o painel; toque e clique continuam rolando
- [ ] Copy: o card "Menos reserva em duplicidade." (lib/content.ts, benefícios) ainda é frase de resultado; rever com o copywriter
- [ ] Alvo de toque dos links de texto longos e `@axe`/Lighthouse de acessibilidade não foram rodados

- [ ] arquiteto-specs: atualizar a seção 8 da spec 001 com as colunas que o script grava e a spec não lista (Status `novo` e ID do envio, necessário para o dedupe); perfil e faixa são gravados com rótulo legível
- [ ] CA-39 (backup automático) NÃO implementado: exigiria o escopo amplo do Drive. Decisão do dono: aceitar cópia manual semanal (sugestão no `apps-script/README.md`) ou autorizar o escopo
- [ ] `retencao()` do script fica desligada sem `RETENTION_DAYS` (mínimo 30 dias) e não limpa histórico de versões nem cópias; depende de PEND-11
- [ ] Script nunca rodou numa conta Google real: não verificado também o formato de texto `@` contra fórmulas (rode `testarFormula`), tempos a frio e a quente, 10 envios simultâneos, "Qualquer pessoa" em conta Workspace e o desligamento de implantações antigas
- [ ] Resposta de erro de negócio do Apps Script vem com HTTP 200 (limitação do Google): o cliente decide só pelo JSON; qualquer monitoramento futuro deve fazer o mesmo
- [ ] Cota de e-mail do aviso: 100 destinatários/dia (conta pessoal) ou 1.500 (Workspace); acima disso o aviso para, a gravação continua
- [ ] Margem do orçamento de JS é menos de 1 KB (149,1 kB de 150 KB): qualquer biblioteca nova estoura; checar o tamanho no CI (`size-limit` ou soma dos chunks, `warn` em 150 KB) (dev-devops)
- [ ] CI: typecheck, lint, test e build estático com variáveis fictícias; publicação do `out/` (dev-devops, junto com PEND-06)
- [ ] Repositório git criado em 2026-11-04 (commit inicial); remote e proteção de branch pendentes (dev-devops)

## Recomendações (ordem sugerida)

1. **Publicar o script e provar a T1 primeiro**: é o único risco que pode derrubar a arquitetura (leitura da resposta no navegador). Tudo o mais depende dele; se falhar, voltar à decisão do ADR-0001 (Google Forms como plano B).
2. **Responder PEND-09 e PEND-11** e chamar o lgpd-specialist: desbloqueia a política (BUG-07), que é bloqueio legal de publicação.
3. **Definir hospedagem estática que aplique `public/_headers`** (PEND-06; ex.: Cloudflare Pages ou Netlify): sem os cabeçalhos a segurança cai (RA-03).
4. **Usar conta Google Workspace** (PEND-13) com verificação em duas etapas, e planilha compartilhada só com quem precisa (PEND-14); desligar implantações antigas do script ao reimplantar.
5. **Começar sem analytics** (PEND-02) e medir conversão contando linhas da planilha por dia; só adicionar analytics se a meta (PEND-01) exigir, porque custa JS e traz banner de cookies.
6. **Ligar o desafio anti-robô (Turnstile, PEND-17) só se o spam aparecer** (RA-01); o script já marca surtos como "suspeito" e para os avisos.
7. **Reauditar com dev-security e refazer o QA (dev-qa) contra o script real** depois da T1, e um pentest leve (dev-pentest) em staging.
8. **Medir de verdade após o deploy** (PageSpeed Insights e Search Console, ~28 dias): os números atuais são de laboratório. Só então decidir sobre reduzir o DOM (dois mapas) ou reintroduzir `content-visibility`.
9. **Antes de divulgar em anúncios**: PEND-04 (anunciar prazo/sinal/histórico do lote só após o QA final do produto) e PEND-03 (preço/forma de cobrança), que costumam elevar a conversão.
10. **Substituir "Residencial Exemplo" e conferir a identidade visual** (PEND-05, D-1) e criar prints reais com dados fictícios para a OG e para a demonstração.

## Obsoletos com a spec 0.3 (backend removido)

A-01, A-02, A-03, A-04, A-05, A-09, A-10, A-11, AC-1 (deadlock), PEND-08 (exportação por data), RNF-05 (confirmado em 150 KB) e o item "CLIENT_IP_HEADER/RATE_LIMIT_SALT": o código correspondente foi removido. A-06 e A-07 seguem (ver Pendente).

## Feito

- 2026-11-04 `app/layout.tsx`: `suppressHydrationWarning` no `<body>` (aviso de hidratação causado pela extensão ColorZilla, `cz-shortcut-listen`; só dev). Não verificado no navegador.

- 2026-11-04 Remoção do backend (dev-react, spec 0.3 T3/T4/T6): removidos MySQL, `mysql2`, `nodemailer`, `tsx`, migrations, docker-compose, Server Action, rate limit, IP, envio no servidor, `leads:export`, testes de integração e variáveis DB_*/SMTP_*/RATE_LIMIT_SALT/CLIENT_IP_HEADER/LEAD_NOTIFY_TO. Site estático (`output: 'export'`); sitemap, robots, OG, ícone, JSON-LD e metadados confirmados no `out/`. Cabeçalhos em `public/_headers`. Cliente do formulário (`lib/leads/client.ts`) com todos os estados, `submissionId` reaproveitado, honeypot `site_url_2`, `<noscript>` (PEND-16 A, default), `NEXT_PUBLIC_LEADS_ENDPOINT` validado no build, mock `scripts/mock-leads-endpoint.mjs`, testes Vitest do cliente, política atualizada (Google operador, IP não coletado, versão 0.2). Verificado em Chrome headless contra o mock: feliz, campo, busy, servidor, rede, timeout 15 s, duplo clique, honeypot, sem JS, CLS 0 em 360/768/1280. **Não verificado: leitura real da resposta do Apps Script (T1)**

- 2026-11-04 PEND-10 decidida pelo dono: Empresa opcional só para Gestor comercial; aviso "Opcional para gestor comercial." no campo
- 2026-11-04 Correções do QA e da auditoria (dev-react). QA: BUG-01 (card do formulário redefine `--c-text/--c-link/--c-focus`; axe `color-contrast` sem violação em sucesso, limite e falha), BUG-02 (select recriado com `key` do valor devolvido), BUG-03 (CLS 0 em 360/768/1280 em 3 rodadas com rede 150 ms/1,6 Mbps e CPU 4x; `content-visibility` removido das 3 seções porque a altura muda com a largura e `scrollHeight` mudava ao rolar; ganho do `content-visibility` nunca foi medido), BUG-04 (`useActionState` com permalink `/#lead-form`; verificado com envio nativo: card visível no sucesso e nos erros), BUG-05 (`aria-label` começa com "A-01"; axe `label-content-name-mismatch` sem violação), BUG-06 (`og:image`/Twitter próprios na política), BUG-08 (links do cabeçalho só >= 900 px; marca sem encolher), BUG-09 (`not-found.tsx` em português), BUG-10 (links do rodapé conforme copy.md), BUG-11 (ver Pendente). Segurança: A-01 (`CLIENT_IP_HEADER` obrigatório em produção, IP validado com `isIP`, `none` explícito; README/CLAUDE.md/.env.example corrigidos: o padrão antigo não desligava o limite), A-02 (IPv6 por /64), A-03 (INSERT e depois contagem por `id <= insertId`: 10 chamadas simultâneas = exatamente 5 passam, teste de integração), A-04 (`requireTLS` com `SMTP_SECURE=false`; `SMTP_REQUIRE_TLS=false` libera para SMTP local de teste), A-05 (`bodySizeLimit` 32kb e `FIELD_LIMITS` por campo), A-08 (regex de e-mail ASCII; remove bidi/largura zero), A-10 (honeypot responde igual ao sucesso real). Testes novos: client-ip, rate-limit /64, next-config, notify TLS, validate, submit, integração

- 2026-11-04 ER-016 (dev-tests): `yarn test:integration` (`vitest.integration.config.ts`, `tests/integration/*.itest.ts`) contra MySQL 8.4 real: gravação com consentimento/versão da política, dedupe de 10 s, rate limit 5/10 min por IP, honeypot, lead gravado antes e apesar da falha do e-mail, `leads:export` com escape de fórmula. Pula com aviso sem banco; fora do `yarn test`. Nenhum bug encontrado. Falta rodar no CI (dev-devops: serviço MySQL 8.4 + `yarn test:integration`)

- 2026-11-04 Correções da revisão (dev-react): (1) `getClientIp` sem fallback `x-real-ip` nem balde 'unknown'; sem IP o limite não se aplica e há log sem dado pessoal; README com tabela por topologia; (2) `RATE_LIMIT_SALT` obrigatório em produção (build e start falham, `next.config.mjs`; trava também em `hashIp`), sal fixo em dev; (3) honeypot renomeado para `site_url_2` (`autoComplete="new-password"`, fora da tela, log só da ocorrência); (4) copy: título "Reserva só de lote disponível...", benefício do status único e aviso visível na demonstração (copy.md atualizado); (5) h2 do FAQ usa `FAQ.title`; (6) `content-visibility: auto` com `contain-intrinsic-size` por largura em benefícios, FAQ e contato; CLS 0 em 360 e 1280 px antes e depois (Chrome headless). PEND-10 intocado

- 2026-11-04 Medição e otimização (dev-performance-seo), build de produção, `next start`, Lighthouse 13.6 mobile (4G lenta, CPU 4x), mediana de 3. Antes: perf 87, LCP 1,13 s, CLS 0, TBT 503 ms, 264 KB transferidos, JS 147,5 KB gz. Depois: perf 86-91 (variação alta), LCP 1,09 s, CLS 0, TBT ~490-550 ms (ruído), 246 KB transferidos (-18 KB: fonte Bricolage só no peso 700, 41 para 22 KB; sem prefetch da política). JS inalterado: 147,5 KB (React DOM 71,6 + cliente Next 46,2 + runtime/rotas 21,5 + app 12,2). `next/dynamic`, `--webpack` e `browserslist` mais novo foram testados e não reduziram JS nem TBT. Teto proposto 150 KB (spec 0.2, pendente do dono)
- 2026-11-04 Spec 001 v0.1 (arquiteto-specs)
- 2026-11-04 Implementação v0.1 (dev-react): página única (herói, demo interativa, funcionalidades, benefícios, FAQ, formulário), política provisória, leads em MySQL com rate limit persistido, aviso por e-mail opcional, `yarn migrate`, `yarn leads:export`, SEO (metadata, OG gerada, JSON-LD, sitemap, robots), CSP e cabeçalhos de segurança, testes Vitest, README e CLAUDE.md
