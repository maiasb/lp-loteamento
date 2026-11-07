# Especificação visual: landing "Loteamento Inteligente"

| Campo | Valor |
|---|---|
| Versão | 0.1 (2026-11-04) |
| Autor | dev-uiux |
| Implementa | dev-react |
| Spec de origem | `docs/specs/001-landing-page.md` (CA-01..12, 13..15, 16..24, 30; RN-01..05; RNF-01..07) |
| Referência de produto | `loteamento-inteligente/docs/design-system.md` e `theme/tokens.ts` (MUI, azul 700/300, status verde/laranja/vermelho, tiles com ícone + borda + texto) |
| Status | Pronta para handoff. Copy é do `copywriter`: textos entre aspas aqui são **marcadores** de comprimento, não texto final. |

Decisões por default aplicadas: sem preço, sem analytics, sem funções "condicionais" (spec seção 4), identidade criada aqui.

---

## 1. Direção visual e tom

**Conceito: "planta de loteamento"**. A página parece uma prancha de topografia bem-feita: malha de levantamento sutil, quadras e lotes como unidade visual, numeração tipo "01 · Demonstração", marcador de lote selecionado em verde-limão (a cor de estaca de demarcação). Isso dá identidade própria ao assunto, em vez do kit genérico "gradiente roxo + cards com sombra".

- **Tom:** técnico e calmo, confiável. Frases curtas, números tabulares, bordas finas, poucos efeitos. Nada de 3D, nada de glassmorphism, nada de efeito de rastro: o público é gestor comercial e quer clareza (e o orçamento de JS é RNF-05: 120 KB na spec 0.1, revisão para 150 KB pendente do dono).
- **Coerência com o produto:** mesmo azul de ação (MUI blue 800/300), mesmos três status de lote (verde/âmbar/vermelho) e a mesma regra "status nunca só por cor" (cor + ícone + padrão/borda + texto). Diferença deliberada: fundos de tinta azul-petróleo e papel quente em vez do cinza neutro do MUI, e a fonte de títulos própria.
- **Ritmo de superfícies (de cima para baixo):** cabeçalho e herói em tinta escura; demonstração em papel; funcionalidades em branco; benefícios em névoa azulada; FAQ em papel; contato em tinta escura; rodapé em tinta mais escura. Alternância cria fim de seção sem divisórias pesadas.
- **Um objetivo por tela:** o primário (preenchido) é sempre "falar com a gente / ir ao formulário". Aparece no cabeçalho (desktop) ou barra inferior (celular), no herói, depois da demonstração e no formulário. Demais ações são link de texto. Rótulos diferentes por ponto de decisão, com `aria-label` contextual quando o rótulo visível for igual.
- **Alinhamento (preferência do dono):** celular (< 768 px): títulos, parágrafos, botões, cards e ícones **centralizados**, com respiro vertical generoso; exceções naturais **alinhadas à esquerda**: FAQ, formulário, política (texto corrido) e rótulos de dados do detalhe do lote. Desktop (≥ 1024 px): títulos de seção e cards alinhados à esquerda (composição assimétrica); herói em duas colunas. Exceção registrada: nenhuma além das acima.

### Identidade (logo e marca)

Não há logo; criar um **wordmark em texto + glifo SVG**.

- Glifo (32×32, `viewBox="0 0 32 32"`): quatro quadrados 13×13, raio 3, em (2,2), (17,2), (2,17), (17,17). Três com contorno 1,75 px (`currentColor`), o de (17,17) preenchido com `--color-lime-400` (o "lote selecionado"). Sobre fundo escuro, `currentColor` = `--color-paper-50`.
- Wordmark: "Loteamento Inteligente", texto real (não curvas), Bricolage Grotesque 700, 18 px/1 no cabeçalho (20 px no rodapé), cor `--color-paper-50` sobre escuro; espaço glifo-texto 8 px; área de respiro mínima = altura do glifo. Em 360 px cabe em uma linha (~215 px de largura).
- Favicon: o glifo 32×32 sobre tinta `#0B1B2B` com cantos arredondados (SVG + PNG 180 para Apple). Fora desta spec gerar arquivos; o dev-react usa o SVG acima.

---

## 2. Tokens

Nomes sugeridos como variáveis CSS (`--color-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--dur-*`, `--ease-*`). Sem valor fora desta tabela no CSS.

### 2.1 Cores (tema claro = padrão; faixas escuras são parte da identidade)

| Token | Hex | Uso | Contraste (calculado, WCAG) |
|---|---|---|---|
| `ink-950` | `#07131F` | rodapé | texto `paper-50`: ~17:1 |
| `ink-900` | `#0B1B2B` | cabeçalho, herói, contato, texto principal em claro | sobre `paper-50`: 15,8:1; sobre branco: 17,4:1 |
| `ink-800` | `#12273B` | cards sobre tinta | — |
| `ink-700` | `#1D3750` | bordas fortes, hover de borda | — |
| `line-dark` | `#2A4259` | divisórias sobre escuro (decorativas) | — |
| `paper-50` | `#F6F4EE` | fundo claro padrão | — |
| `white` | `#FFFFFF` | cards, campos | — |
| `mist-100` | `#EAF0F6` | seção benefícios, tela do mapa | — |
| `mist-200` | `#DCE5EE` | esqueletos | — |
| `line` | `#D5DCE4` | divisórias e bordas decorativas em claro | decorativa |
| `text-muted` | `#4A5B6C` | texto secundário em claro | `paper-50`: 6,4:1; branco: 7,0:1 |
| `text-muted-dark` | `#A9B8C6` | texto secundário sobre tinta | sobre `ink-900`: 8,6:1 |
| `blue-800` | `#1565C0` | ação primária e links em claro | branco: 5,75:1; `paper-50`: 5,2:1 |
| `blue-900` | `#0D47A1` | hover/ativo do primário em claro | branco: 8,6:1 |
| `blue-300` | `#64B5F6` | links sobre escuro | sobre `ink-900`: 7,9:1 |
| `lime-400` | `#C6F24E` | primário sobre escuro, marcador de lote, destaque | texto `ink-900` sobre ele: 13,4:1 |
| `lime-300` | `#D6F76F` | hover do primário sobre escuro | — |
| `lime-500` | `#B5E03A` | ativo do primário sobre escuro | — |
| `field-border` | `#6B7C8D` | borda de campo | vs branco: 4,3:1 (>= 3:1, 1.4.11) |
| `error-600` | `#B3261E` | texto/borda de erro | `paper-50`: 5,9:1; branco: 6,5:1 |
| `error-50` | `#FDECEA` | fundo de alerta de erro | — |
| `success-800` | `#1B5E20` | texto de sucesso | branco: 7,9:1 |
| `success-50` | `#E6F4EA` | fundo de sucesso | — |

Contrastes calculados à mão pela fórmula de luminância relativa; o `dev-qa` deve reconferir com ferramenta antes do aceite.

**Cores de status do lote (mapa de demonstração).** Espelham o produto (verde/âmbar/vermelho), mas com tokens próprios porque o produto usa MUI.

| Status | Claro: preenchimento | Claro: contorno | Padrão extra | Ícone (16 px) | Texto do número |
|---|---|---|---|---|---|
| Disponível | `#E4F3E6` | `#2E7D32` 1,5 px (4,5:1 vs `mist-100`) | nenhum (liso) | círculo com check | `ink-900` |
| Reservado | `#FFE7B8` | `#B26A00` 1,5 px (3,7:1) | hachura 45°, linhas `#B26A00` a 35 %, 1,5 px, passo 6 px | relógio | `ink-900` |
| Vendido | `#C62828` | `#8E1B1B` 2,5 px (preenchimento 4,9:1) | sólido escuro | cadeado | `#FFFFFF` (5,6:1) |
| Selecionado (sobreposto) | — | anel `#1565C0` 4 px (5,0:1) | marcador `lime-400` 10×10 no canto superior direito | — | — |

Sobre fundo escuro (arte do herói e do OG): disponível contorno `#81C784` preenchimento `#81C784` a 16 %; reservado contorno `#FFB74D` preenchimento `#FFB74D` a 18 % + hachura; vendido preenchimento `#EF5350` texto `ink-900` (5,0:1). Lê-se em escala de cinza: liso claro (livre), hachurado (reservado), cheio escuro (vendido).

**Tema escuro completo (opcional, fase 2, não entra no MVP).** Fundo `ink-900`, superfície `ink-800`, texto `paper-50`, secundário `text-muted-dark`, primário `lime-400`/texto `ink-900`, link `blue-300`, divisória `line-dark`, status "sobre escuro" acima. No MVP, só as faixas escuras fixas (cabeçalho, herói, contato, rodapé) usam esses valores; a página não troca de tema.

### 2.2 Tipografia (2 famílias)

| Função | Família | Pesos | Observação |
|---|---|---|---|
| Títulos, wordmark, números grandes | **Bricolage Grotesque** (OFL, Google Fonts) | 600–700 | caráter próprio sem ser extravagante |
| Texto, UI, formulário | **Geist** (já usada no produto) | 400, 500, 600 | `font-variant-numeric: tabular-nums` em contagens, áreas, preços |

Disponibilidade das duas no `next/font/google` e o recorte de eixos (Bricolage tem eixos extras): **não verificado**; o `dev-react` confirma na documentação do Next. Se Bricolage não servir, fallback aprovado: Geist 700 nos títulos (continua com 1 família, sem perda de spec).

Escala (rem, base 16 px; fluida entre 360 e 1280 px):

| Token | Valor | Entrelinha | Uso |
|---|---|---|---|
| `display` | `clamp(2.25rem, 1.5rem + 3.4vw, 4rem)` (36 px em 360; 64 px a partir de ~1180) | 1,05 | h1; Bricolage 700, tracking -0,02em |
| `h2` | `clamp(1.75rem, 1.3rem + 1.8vw, 2.75rem)` | 1,1 | títulos de seção |
| `h3` | `1.25rem` (20 px) | 1,3 | cards, perguntas do FAQ; Bricolage 600 |
| `lead` | `clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)` | 1,55 | subtítulos; Geist 400 |
| `body` | `1rem` | 1,6 | texto |
| `small` | `0.875rem` (14 px) | 1,5 | ajuda, erros, legendas |
| `eyebrow` | `0.8125rem` (13 px), caixa alta, tracking 0,08em, Geist 600 | 1,2 | "01 · Demonstração" (só rótulo curto) |
| `lot-label` | 15 px (unidade do SVG) Geist 600 | — | número do lote |

Largura de leitura: parágrafos ≤ 62ch. Política: 68ch, corpo 1,0625rem/1,7. Nada abaixo de 14 px, salvo `eyebrow` (13 px, decorativo/rótulo) e texto do lote no SVG.

**Estratégia anti-troca de fonte (CLS = 0 com fontes):**
1. Auto-hospedar via `next/font` (sem requisição a terceiros em runtime), subset `latin`, só os pesos listados; no máx. 2 arquivos variáveis de fonte.
2. `font-display: swap` com **fallback ajustado** (`size-adjust`, `ascent-override`, `descent-override`, `line-gap-override` casados com a métrica da fonte; o `next/font` gera isso para fontes do Google, comportamento a confirmar pelo `dev-react`). Fallback: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
3. Pré-carregar (`preload`) as duas fontes; o h1 (candidato a LCP) usa a fonte de título.
4. Texto do herói **sem animação de entrada** (não pode começar em `opacity: 0`, atrasaria o LCP).
5. Critério de aceite: CLS = 0,00 no Lighthouse com throttling em 360/768/1280. Se houver salto > 0 por fonte, trocar `swap` por `optional` na fonte de texto (aceita cair no fallback em rede lenta) e reavaliar.

### 2.3 Espaçamento, raios, sombras, breakpoints

| Token | Valor |
|---|---|
| `space-1..` | 1=4, 2=8, 3=12, 4=16, 5=20, 6=24, 8=32, 10=40, 12=48, 16=64, 20=80, 24=96, 32=128 (px) |
| Padding vertical de seção | 64 px (celular), 96 px (≥ 768 px) |
| Container | máx. 1200 px; padding lateral 20 px (<768), 32 px (≥768), 40 px (≥1280) |
| Breakpoints | base 360 (suporte mínimo 320), `md` 768, `lg` 1024, `xl` 1280 |
| `radius-sm` / `md` / `lg` / `full` | 6 / 10 / 16 / 999 px (chips e lotes / botões e campos / cards e painel / pílulas) |
| `shadow-sm` | `0 1px 2px rgba(11,27,43,.08)` |
| `shadow-md` | `0 6px 20px -6px rgba(11,27,43,.18)` |
| `shadow-lg` | `0 24px 48px -16px rgba(11,27,43,.28)` (card do formulário, painel) |
| Z-index | cabeçalho 40; barra inferior 30; nada acima disso |

Sobre fundos escuros, separar camadas por borda `line-dark`, não por sombra. Textura "malha de levantamento": linhas de 1 px `rgba(255,255,255,.04)` a cada 32 px (`linear-gradient` estático em pseudo-elemento; sem animação) nos fundos de tinta; nos de papel, `rgba(11,27,43,.04)`.

### 2.4 Componentes primitivos (visuais, sem regra de negócio)

| Componente | Especificação |
|---|---|
| Botão `lg` (herói, formulário) | altura 52 px; `md` (cabeçalho, demais) 44 px; raio 10; padding horizontal 24; Geist 600 16 px |
| Botão primário em claro | fundo `blue-800`, texto branco; hover `blue-900`; ativo `blue-900` + `translateY(1px)` |
| Botão primário sobre escuro | fundo `lime-400`, texto `ink-900`; hover `lime-300`; ativo `lime-500` |
| Botão secundário | contorno 1,5 px (`ink-900` em claro; `paper-50` sobre escuro), fundo transparente |
| Botão desabilitado | fundo `line`, texto `#5C6B7A`; usar `aria-disabled` com **motivo visível em texto**, nunca só `title` |
| Botão carregando | texto trocado por spinner 18 px + "Enviando…"; **largura fixa** (`min-width` do estado normal), sem mudar altura |
| Link de texto | sublinhado 2 px, offset 3 px; `blue-800` em claro, `blue-300` sobre escuro; hover: espessura 3 px |
| Foco (todos) | `outline: 3px solid ink-900; outline-offset: 2px` em claro; `3px solid lime-400` sobre escuro. Nunca remover |
| Campo (input/select) | altura 48 px, fonte 16 px (evita zoom no iOS), raio 10, borda 1,5 px `field-border`, fundo branco; hover borda `ink-700`; foco = regra de foco + borda `blue-800` 2 px; erro = borda `error-600` 2 px + ícone + texto |
| Rótulo | sempre visível acima do campo, 14 px/600, `ink-900`; placeholder só para exemplo (`#5C6B7A`) |
| Chip de status | altura 28, raio full, ícone 16 + texto 14 px; contorno na cor do status |
| Card | fundo branco, borda 1 px `line`, raio 16, padding 24 (celular 20); sem sombra por padrão |

**Primitivos × específicos:** são primitivos Botão, Link, Campo, Rótulo, Chip, Card, Ícone, Container, Eyebrow. Carregam regra: `LotMap` (geometria e estados dos lotes), `LotPanel` (reserva de demonstração), `LeadForm` (validação, envio e estados), `Faq`, `StickyCta` (visibilidade por posição de rolagem).

---

## 3. Layout por seção

Mobile primeiro. Cabeçalho tem altura fixa (64 px celular, 72 px desktop); `scroll-padding-top: 88px` e `scroll-padding-bottom: 96px` no `html` para que foco e âncoras nunca fiquem sob o cabeçalho ou a barra (WCAG 2.2, 2.4.11 Focus Not Obscured, AA). Primeiro elemento focável: link "Pular para o conteúdo".

### 3.1 Cabeçalho + CTA fixo (CA-02, CA-03)

- **Desktop (≥ 768):** cabeçalho `ink-900` fixo no topo (sticky), 72 px: wordmark à esquerda; links âncora "Demonstração", "Funcionalidades", "Perguntas" (14 px, `paper-50`, alvo 44 px de altura) ao centro-direita; botão primário sobre escuro `md` ("Falar com a gente", rótulo é marcador) à direita. É o CTA fixo no desktop: sempre visível e sem ocupar espaço extra.
- **Celular (< 768):** cabeçalho 64 px só com wordmark centralizado (sem menu hambúrguer: página curta, âncoras desnecessárias). **Barra inferior fixa** `ink-900`, altura 72 px + `env(safe-area-inset-bottom)`, com o botão primário sobre escuro em largura total (máx. 520 px, centralizado), padding 10 px 20 px, borda superior `line-dark`.
- **Zero CLS:** barra e cabeçalho são `position: fixed/sticky`; o `body` reserva sempre `padding-bottom: 72px + safe-area` no celular (espaço fica dentro do fundo do rodapé, que o absorve). Aparecer/sumir só muda `transform`/`opacity`.
- **Quando some (celular):** enquanto a seção de contato (#contato) ocupa ≥ 30 % da tela, a barra sai (`translateY(100%)`, 200 ms) e recebe `inert` + `visibility:hidden` após a transição; reaparece ao sair. Assim nunca cobre o botão "Enviar" nem campo em foco. Com teclado virtual aberto, a barra permanece oculta (campo em foco dentro de #contato).
- Ativar o CTA: rola até #contato e move o foco para o primeiro campo (Nome) (CA-02). Rolagem suave só sem `prefers-reduced-motion`.

### 3.2 Herói (CA-01)

Fundo `ink-900` + malha de levantamento. `min-height: min(100svh, 760px)` (usar `svh`, não `dvh`/`vh`, para não variar com a barra do navegador).

- **Celular 360 px (centralizado):** padding-top 40. Eyebrow (chip pílula, 28 px, contorno `line-dark`, texto `text-muted-dark`, p.ex. "Gestão e venda de loteamentos") → h1 `display` 36 px/1,05, até 4 linhas, `paper-50`, máx. 22ch → `lead` em `text-muted-dark`, máx. 34ch, 4–5 linhas → botão primário `lg` largura total (52 px, máx. 360) → link de texto "Ver a demonstração" (alvo 44 px) → link "Falar no WhatsApp" (alvo 44 px) → arte do herói (abaixo da dobra). Soma estimada até o botão: ~560 px, cabe numa tela de 360×640 com cabeçalho de 64 px (CA-01: nome na wordmark do cabeçalho, título, subtítulo e CTA na primeira dobra). O `dev-qa` confere em 360×640.
- **Desktop (≥ 1024):** duas colunas 7/5 (texto à esquerda, alinhado à esquerda; arte à direita). h1 até 64 px, 3 linhas, máx. 16ch; `lead` 20 px máx. 52ch; botões lado a lado: primário `lg` + link de texto "Ver a demonstração"; "Falar no WhatsApp" como link menor abaixo.
- **Arte do herói:** SVG inline estático decorativo (`aria-hidden`), recorte de uma planta (2 quadras de lotes nos 3 estados "sobre escuro", uma rua, um lote com marcador `lime-400`). `aspect-ratio: 6 / 5`, largura 100 % até 560 px, com `width`/`height` no SVG. Sem imagem raster no herói (nada concorre com o LCP; o LCP é o h1).
- Entrada da arte: lotes aparecem em `opacity` 0→1 escalonados 30 ms, total ≤ 600 ms, após o primeiro paint; texto do herói não anima.

### 3.3 Demonstração (CA-05..12) — seção "01 · Demonstração"

Fundo `paper-50`. Cabeçalho da seção: eyebrow, h2, 1 frase (celular centralizado; desktop à esquerda). Abaixo, **card da demonstração** (branco, raio 16, borda `line`, `shadow-md`, padding 24; 20 no celular).

Estrutura do card, de cima para baixo:
1. **Barra superior** (altura 44 px): à esquerda chip informativo fixo com ícone "i": **"Dados fictícios, apenas demonstração"** (texto visível sempre, 14 px, fundo `mist-100`); à direita botão de texto "Recomeçar" (alvo 44 px). Celular: empilha e centraliza (chip em cima, "Recomeçar" embaixo, 44 px cada).
2. **Legenda** (CA-05): três itens em linha — amostra do lote (20×20, mesma forma/padrão do mapa) + rótulo + contagem em negrito tabular, p.ex. "Disponível 14". Celular: centralizada, quebra em linhas se preciso, cada item com 44 px de altura de toque (é informativa, mas mantém ritmo).
3. **Área do mapa + painel**:
   - Desktop (≥ 768): grade `1fr / 320 px`, gap 24; mapa à esquerda, painel à direita, mesma altura.
   - Celular: mapa, depois painel (empilhados). Painel sempre logo abaixo do mapa.
4. **Rodapé do card:** CTA depois da demonstração (CA-12): botão primário claro `lg` ("Quero isso no meu loteamento", marcador) e abaixo/ao lado link "Falar no WhatsApp". Celular centralizado, botão largura total.

Loteamento fictício: **"Residencial Vista do Ipê"** (nome inventado; `copywriter`/dono confirmam que não colide com empreendimento real). 24 lotes em 2 quadras (A e B) de 12.

### 3.4 Funcionalidades por perfil (CA-13) — "02 · Funcionalidades"

Fundo branco. Três cards (Loteadora/incorporadora, Imobiliária, Gestor comercial).
- **Desktop:** 3 colunas iguais, gap 24, alinhados à esquerda. Card: ícone 40 px em quadrado `mist-100` raio 10, h3, lista de 4 itens (checks de 16 px, texto 16 px).
- **Celular:** 1 coluna, tudo visível (sem abas; SEO e CA-13), conteúdo centralizado: ícone, h3, lista com texto centralizado (itens de 1–2 linhas). Espaço entre cards 20 px.
- Conteúdo permitido (somente "Pode prometer" da spec seção 4; RN-01), sugestão de distribuição:
  - **Loteadora/incorporadora:** cadastro do loteamento com mapa (imagem, PDF ou SVG sobre o Google Maps), quadras e lotes com número, área, preço, descrição e características; importação por planilha Excel ou JSON; bloquear, desbloquear e excluir quadras em lote com proteção de lotes reservados/vendidos; painel com totais de mapas, lotes e reservas.
  - **Imobiliária:** link público de visualização do mapa, sem login e sem preço, somente leitura; status por lote com cores (disponível, reservado, vendido, bloqueado); uso no celular; papéis (dev, admin e vendedor) com permissões aplicadas no servidor.
  - **Gestor comercial:** reserva de um ou mais lotes com preço acordado, entrada e parcelas por lote; o sistema impede reservar lote que não está disponível; confirmação da venda ou cancelamento só por admin; vendedor vê só as próprias reservas; painel com totais.
- Não usar "em breve", prazo automático de reserva, sinal, histórico do lote, mapa público colorido, simulador, WhatsApp do corretor (colunas "Condicional" e "Não prometer").

### 3.5 Benefícios (CA-14) — "03 · Benefícios"

Fundo `mist-100`. 4 benefícios (sem número, percentual ou resultado; RN-03), cada um com ícone, título curto (h3), 1 frase e linha pequena "Vem de: <funcionalidade da seção 4>" (rastreabilidade, 14 px `text-muted`).
- **Desktop:** grade 2×2, gap 24, cards brancos sem sombra, alinhados à esquerda.
- **Celular:** 1 coluna, centralizados, gap 20.
- Sem contadores numéricos animados (não há número verificável para exibir).

### 3.6 FAQ (CA-15) — "04 · Perguntas"

Fundo `paper-50`.
- **Desktop:** duas colunas: título + frase + link "Falar no WhatsApp" à esquerda (`position: sticky; top: 96px`, ~360 px), lista de perguntas à direita (máx. 720 px).
- **Celular:** título e frase centralizados; lista abaixo **alinhada à esquerda** (exceção de leitura), largura total.
- **Item:** botão de largura total com `min-height: 64px`, padding 20 px 0, borda inferior 1 px `line`; texto da pergunta em h3 (20 px→18 px no celular) dentro do botão (padrão botão dentro de heading); chevron 20 px à direita que gira 180° (`transform`, 200 ms). Estados: hover = texto `blue-800`; foco = regra global; aberto = chevron girado, `aria-expanded="true"`.
- **Resposta:** todas no HTML (indexáveis, mesmo conteúdo do JSON-LD). Painel com `padding-bottom` 24, 16 px/1,6, máx. 62ch.
- Perguntas mínimas (CA-15): implantação na hospedagem do cliente, precisa instalar algo, mensalidade, prazo, importar planilha, quem vê preços, suporte (respostas pendentes de PEND-03/07).

### 3.7 Formulário final (CA-16..24) — "05 · Contato" (`id="contato"`)

Fundo `ink-900` + malha. Foco inicial do CTA do cabeçalho cai no campo Nome.
- **Desktop (≥ 1024):** duas colunas 5/7: à esquerda h2 em `paper-50`, frase de reforço, lista curta de "o que acontece depois" (3 passos, 14 px; sem prazo prometido), e contatos alternativos (WhatsApp, e-mail) como links `blue-300`; à direita o **card do formulário** (branco, raio 16, `shadow-lg`, padding 32, largura máx. 560).
- **Tablet/celular:** coluna única: título centralizado, card embaixo (padding 20, largura total), contatos alternativos centralizados depois do card. Campos e rótulos do formulário alinhados à esquerda.
- **Campos (ordem):** Nome; WhatsApp (`inputmode="tel"`, `autocomplete="tel-national"`); E-mail (`type="email"`, `autocomplete="email"`); Empresa; Perfil (3 opções, ver abaixo); Nº aproximado de lotes (select nativo, 5 faixas da RN-08); Consentimento; Botão "Enviar".
  - Desktop ≥ 1024: pares Nome|Empresa e WhatsApp|E-mail em 2 colunas (gap 16); demais em largura total. Abaixo: 1 coluna.
  - **Perfil:** `fieldset` + `legend`; 3 "cartões de rádio" 48 px (rádio nativo visualmente oculto mas focável); selecionado: borda `blue-800` 2 px, fundo `#E8F0FB`, check 16 px. Celular: empilhados; desktop: em linha.
  - **Consentimento:** caixa 24×24 (raio 6, borda 2 px `ink-700`) com área de toque de linha inteira (min 44 px), desmarcada, texto 14 px com link "política de privacidade" (abre `/privacidade`, mesma aba).
  - **Honeypot:** campo fora da tela (`position:absolute; left:-9999px`), `aria-hidden`, `tabindex=-1`, `autocomplete=off`, não altera layout.
  - **Botão Enviar:** `lg` 52 px, primário em claro, largura total no celular, `min-width` 220 px no desktop.

### 3.8 Rodapé

Fundo `ink-950`, borda superior `line-dark`, padding 64 / 48 px. Conteúdo: wordmark + 1 linha de descrição (`text-muted-dark`); contatos (WhatsApp, e-mail; texto do link = o contato, alvo 44 px); link "Política de privacidade"; linha de direitos "© 2026 <controlador>" (placeholder PEND-09). Desktop: 3 colunas alinhadas à esquerda. Celular: empilhado e centralizado; `padding-bottom` inclui os 72 px da barra fixa. Os contatos ficam na mesma posição relativa (rodapé) na home e na política (WCAG 3.2.6 Consistent Help, A).

### 3.9 Política de privacidade (`/privacidade`)

Mesmo cabeçalho (sem barra inferior de CTA; o botão do cabeçalho vira link "Voltar ao início") e rodapé. Fundo `paper-50`. Bloco de texto: máx. 68ch, centralizado na página, **alinhado à esquerda** (texto corrido); h1 `h2`-escala (36→44 px), linha "Versão X · atualizada em <data>" (a versão é a gravada no consentimento, CA-17); h2 de 24 px com 48 px de espaço acima; listas e tabelas simples com borda `line`, tabelas rolam horizontalmente dentro do próprio container (sem estourar a viewport em 320 px). Layout em coluna flex com `min-height: 100svh` para o rodapé nunca subir.

---

## 4. Mapa de lotes interativo (demonstração)

> Revisado em 2026-11-07 para espelhar `/maps` do sistema (planta com lotes numerados, painel do lote, seleção múltipla). Substitui a grade de retângulos com abas por quadra, as duas variantes de SVG e o roving tabindex.

### 4.1 Dados e planta (fictícios; RN-05)

- 24 lotes: **Quadra A** A-01..A-12 e **Quadra B** B-01..B-12. **Vendido (4):** A-03, A-04, A-09, B-06. **Reservado (6):** A-07, A-12, B-02, B-08, B-09, B-11. **Bloqueado (2):** A-06, B-05. **Disponível (12):** os demais.
- Área e preço calculados: lotes de canto (colunas 1 e 6) 360 m², demais 300 m²; R$ 420,00/m² (A) ou R$ 450,00/m² (B). Formato pt-BR; o painel mostra também o preço por m².
- **Seleção pelas formas do SVG, como `PlantaFormas` do sistema** (`components/LotPlan.tsx`). Desenho de fundo 800 x 500 (`aspect-ratio` fixo, CLS 0) com rua e rótulos de quadra; cada lote é um `<polygon>` retangular alinhado à grade (6 x 2 por quadra) gerado em `lib/demo-lots.ts`. **Sem número escrito no lote**: quem identifica é a dica, o painel e o `aria-label`.
- Visual por status (mesmos tokens do sistema): disponível verde a 10 %, reservado laranja a 20 % com pontos, vendido vermelho a 32 % com hachura e borda 2 px, bloqueado cinza com hachura cruzada e borda tracejada. Ícone do status no centro da forma, **só se a menor dimensão na tela for >= 24 px**; texturas em px de tela (dividem por `k`); borda `non-scaling-stroke`.
- Dica ao passar o mouse ou focar por teclado: "Lote 5 · Quadra A · 300 m² · Disponível". Selecionados: contorno `ink-900` com halo branco e **selo com a ordem de adição** (1, 2, 3) no canto da forma; lote aberto: contorno tracejado; foco: anel azul/branco.
- **Limitações herdadas do sistema:** zoom de 1x a 8x (botões +, − e ajustar) e arraste só com a planta ampliada; sem zoom por roda (não prender a rolagem da página) e, no zoom 1, `touch-action: pan-y` para a página rolar; em tela estreita as formas ficam pequenas e o zoom é o caminho; lote bloqueado é `role="img"`, sem foco nem clique (visão do vendedor).
- Estado só no cliente (CA-09).

### 4.2 Teclado e leitor de tela

- Um Tab entra na planta (lote com tabindex 0); **setas** vão ao vizinho mais próximo na direção (entre os que reagem); Enter/Espaço abre o painel; Esc fecha. Sem armadilha de teclado.
- Toque: um toque abre; abaixo de 1024 px o painel rola até a vista (suave só sem redução de movimento).
- `role=status` anuncia reservas e o reinício, com as quatro contagens. Botões de zoom: 44 px, fora da planta no celular e sobre ela a partir de 768 px.

### 4.3 Painel do lote e seleção

- Painel (altura mínima 480 px, nunca cresce): título "Lote 05", "Quadra A · Residencial Exemplo", botão fechar 44 px, chip de status, `dl` Área / Preço (fictício) / Preço por m², ações e "Valores fictícios.".
- Ações (como `acoesDoPainel` do sistema): disponível sem seleção: "Reservar este lote" + "Adicionar à seleção"; já na seleção: "Reservar (n)" + "Remover da seleção"; há outros na seleção: "Adicionar à seleção" + "Reservar só este lote". Reservado/vendido/bloqueado: só o motivo em texto. Após reservar, aviso `success-50` (RN-04: nunca gera "vendido").
- Barra de seleção sempre presente no rodapé do card, com altura fixa (232 px celular, 176 px ≥ 768): vazia mostra a dica; com lotes mostra "n lotes · área · valor", chips removíveis (rolagem horizontal), "Reservar (n)" e "Limpar seleção". O sistema real usa barra fixa na tela; aqui fica no card para não cobrir o CTA fixo da página.

### 4.4 Reiniciar

Botão de texto "Recomeçar" na barra do card: restaura dados, limpa seleção e painel, anuncia no `role=status`.

---

## 5. Carregamento (pré-loader e esqueletos)

**Decisão registrada:** **não haverá tela de carregamento de página inteira (splash)**. Ela esconderia o h1 (candidato a LCP) e o RNF-05 a proíbe. O que a spec do dono pediu como "pré-loader curto" é atendido assim:

1. **Pré-loader de marca (curto, não bloqueante):** apenas no cabeçalho, o glifo do logo se desenha uma vez: os 3 quadrados de contorno aparecem em `opacity` 0→1 escalonados (60 ms de intervalo) e o preenchido `lime-400` por último, total ≤ 500 ms, executado depois do primeiro paint. Nenhum conteúdo espera por ele. Sem JS ou com `prefers-reduced-motion`, o glifo já aparece completo.
2. **Demonstração:** a melhor "tela de carregamento" é não precisar dela. O SVG do mapa com o estado inicial é **renderizado no servidor** (é determinístico) e já fica visível e indexável; a hidratação só liga a interatividade, sem mudança visual. Se o `dev-react` carregar a demo de forma preguiçosa (RNF-05), o fallback é um **esqueleto com as mesmas dimensões do card**: barra superior de 44 px, legenda 3 blocos, mapa como retângulo `mist-200` com o mesmo `aspect-ratio` da variante, painel com o mesmo `min-height` e 3 linhas de texto; pulso de `opacity` 0,6↔1 em 1,4 s `ease-in-out` (sem deslocamento de gradiente por posição). Com redução de movimento: estático em 0,8.
3. Botão enviando e demais estados locais: ver seção 7. Não há outro carregamento.

---

## 6. Regras anti-layout-shift (meta CLS 0,00 em 360/768/1280)

| Componente | Regra |
|---|---|
| Cabeçalho | altura fixa 64/72 px; `scroll-padding` global (3.1) |
| Barra inferior (celular) | `position: fixed`; `body` reserva 72 px + safe-area permanentemente; só `transform`/`opacity` |
| Fontes | seção 2.2 (fallback ajustado, preload, sem animar o h1) |
| Herói | `min-height: min(100svh, 760px)`; arte com `aspect-ratio: 6/5` e `width/height` no SVG |
| Qualquer imagem/SVG | `width`/`height` ou `aspect-ratio` obrigatórios; sem imagem acima da dobra além da arte SVG |
| Card da demonstração | variante larga: mapa `aspect-ratio: 820/488`; estreita: `aspect-ratio: 336/232`; painel: altura = mapa (desktop) / `min-height` 304 px (celular); legenda com altura fixa 44 px; as duas variantes de SVG estão no DOM e o CSS decide, sem JS de medição |
| Troca de quadra (estreita) | troca de conteúdo dentro do mesmo `aspect-ratio`; só `opacity` |
| Contagens da legenda | `tabular-nums`; largura mínima 2ch por número |
| FAQ | ver abaixo |
| Formulário | ver abaixo |
| Reveal de seção | só `transform`/`opacity` (nunca `margin`/`height`); elementos já na dobra inicial não animam |
| Conteúdo dependente de variável `NEXT_PUBLIC_*` (WhatsApp/e-mail) | texto do link com tamanho estável; em dev, placeholder visível mas sem mudar a altura da linha |

**FAQ (expande sem empurrar abruptamente):** o clique do usuário isenta o deslocamento do cálculo de CLS (entrada recente do usuário; confirmar no Lighthouse), mas o movimento deve ser suave de qualquer forma: o painel de resposta anima `grid-template-rows: 0fr → 1fr` em 240 ms `ease-out` + `opacity` 0→1 em 160 ms (exceção deliberada à regra "só transform/opacity", por ser iniciada pelo usuário e pequena). Âncoras de rolagem do navegador mantêm a posição visível. Fechar é o inverso. Com `prefers-reduced-motion`: instantâneo. Apenas a pergunta clicada se move; nenhuma outra anima. Várias abertas ao mesmo tempo são permitidas (evita fechar a que o usuário lê).

**Formulário (erros em espaço reservado):**
- Cada campo é um bloco com altura fixa: rótulo 20 px + gap 6 + campo 48 + **linha de ajuda/erro reservada de 20 px** (+ 4 de gap) — vazia quando sem erro. As mensagens de erro de campo devem caber em uma linha em 320 px (**limite de ~34 caracteres**; combinar com o `copywriter`). O erro entra só com `opacity`.
- Consentimento: linha de erro reservada de **40 px** (a frase da CA-19 tem 2 linhas em 320 px).
- **Faixa de alerta do formulário** (erro geral, limite de IP, falha de banco): slot reservado de **72 px** (96 px no celular) logo abaixo do botão, vazio por padrão; o alerta entra por `opacity`. Isso consome altura mas garante CLS 0 quando a resposta do servidor chega depois de 500 ms.
- O card tem altura mínima igual ao estado "formulário completo"; o estado de sucesso preenche exatamente essa altura (CA-17).

---

## 7. Estados do formulário

| Estado | Visual e comportamento |
|---|---|
| **Vazio** | Campos brancos com borda `field-border`, rótulos visíveis, placeholders só como exemplo (ex. "(11) 91234-5678"), consentimento desmarcado, botão primário habilitado (não desabilitar o botão: erro explícito é melhor que botão morto) |
| **Foco** | Regra global de foco + borda `blue-800` 2 px; rótulo não muda |
| **Erro de validação** (CA-18, 19) | Valida ao enviar e, depois, ao sair do campo já tocado; some ao corrigir. Campo: borda `error-600` 2 px + ícone 16 px + texto na linha reservada (`error-600`, 14 px) ligado por `aria-describedby`, `aria-invalid="true"`. Foco vai ao **primeiro campo com erro**; na faixa de alerta, `role="alert"`: "Corrija N campos para enviar." Valores digitados são mantidos. Mensagens em português, dizem o que corrigir ("Informe um WhatsApp com DDD") |
| **Enviando** | Botão com spinner + "Enviando…", mesma largura e altura, `aria-busy`, `aria-disabled` (não reenviar: CA-23); campos somente leitura com opacidade 100 % (sem esmaecer o texto); spinner gira por `transform: rotate`, estático com redução de movimento (texto "Enviando…" basta) |
| **Sucesso** (CA-17) | O conteúdo do card é substituído, na mesma altura: círculo `success-50` com check 32 px, h3 "Recebemos seus dados" (marcador), próxima etapa em 1–2 linhas, botão secundário "Falar agora pelo WhatsApp" (mesmo número configurado) e link do e-mail. O foco vai ao h3 (`tabindex=-1`); `role=status` anuncia. Honeypot preenchido mostra **este mesmo estado** (CA-20) |
| **Falha** (CA-21, 22) | Faixa de alerta (`error-50`, borda `error-600`, ícone): "Não foi possível enviar agora. Seus dados foram mantidos." + links de WhatsApp e e-mail + botão "Tentar de novo". Limite por IP: mesma faixa com mensagem "Muitas tentativas. Tente de novo em alguns minutos ou chame no WhatsApp." Dados digitados permanecem; foco no alerta (`role="alert"`) |
| **Sem JavaScript** (CA-24) | Envio nativo `POST` com `<form>`; resposta é uma página/estado de confirmação com o mesmo visual do sucesso; validação mínima nativa (`required`, `type`, `inputmode`) |

---

## 8. Motion

**Princípios:** funcional, curto, silencioso. Anima só `transform` e `opacity` (+ exceções listadas). Não são usados GSAP nem tilt 3D/echo: CSS + (se preciso) Web Animations bastam, preservando o orçamento de JS (RNF-05). Decisão do dev-react como integrar; nenhuma animação pode atrasar LCP ou INP.

| Tokens | Valor |
|---|---|
| `dur-fast` | 120 ms (hover, foco, troca de aba) |
| `dur-base` | 200 ms (barra fixa, chevron, anel de seleção) |
| `dur-slow` | 320 ms (reveal de seção) |
| `dur-brand` | ≤ 500 ms total (glifo do logo), ≤ 600 ms total (arte do herói) |
| `ease-out` | `cubic-bezier(0.2, 0.7, 0.2, 1)` (entradas) |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` (saídas/trocas) |

| Elemento | Gatilho | Efeito |
|---|---|---|
| Reveal de seções abaixo da dobra | entra na viewport (uma vez, IntersectionObserver) | filhos diretos: `translateY(16px)→0` + `opacity 0→1`, 320 ms `ease-out`, escalonado 60 ms, máx. 6 itens por seção. Estado inicial só aplicado depois de o JS estar ativo (sem JS, tudo visível) |
| Botão | hover/ativo | mudança de cor 120 ms (exceção: cor); ativo `translateY(1px)` |
| Barra inferior (celular) | entra/sai de #contato | `translateY(100%)↔0`, 200 ms `ease-in-out` |
| Chevron do FAQ | abrir/fechar | `rotate(180deg)`, 200 ms |
| Resposta do FAQ | abrir/fechar | exceção documentada (seção 6), 240 ms |
| Lote | seleção | anel entra com `opacity`, 120 ms |
| Lote | reservado | cross-fade de camadas, 240 ms |
| Painel de detalhe | troca de lote | conteúdo `opacity` 0→1, 120 ms (altura nunca muda) |
| Erro de campo | aparece | `opacity` 0→1, 120 ms |
| Glifo do logo / arte do herói | após o primeiro paint | seção 3.2 e 5 |
| Esqueleto | enquanto carrega | pulso de `opacity`, 1,4 s |
| Rolagem até o formulário | ativar CTA | `scroll-behavior: smooth` |

**`prefers-reduced-motion: reduce`:** sem `transform` animado, sem escalonamento, sem pulso, sem rolagem suave, sem rotação do spinner. Elementos aparecem já no estado final; o chevron troca direto; a barra inferior alterna só `opacity` instantâneo; FAQ abre instantâneo; cross-fade do lote vira troca direta. Informação nunca depende de movimento.

---

## 9. Acessibilidade (WCAG 2.2 AA)

Critérios novos da 2.2 conferidos em w3.org/WAI/standards-guidelines/wcag/new-in-22 (2.4.11 Foco não obscurecido AA; 2.5.7 Arrastar AA; 2.5.8 Tamanho do alvo mínimo AA, 24×24 px; 3.2.6 Ajuda consistente A; 3.3.7 Entrada redundante A).

- **Contraste:** texto >= 4,5:1 (valores na seção 2.1; mínimo da página: `blue-800` sobre `paper-50` 5,2:1); componentes e gráficos (bordas de campo, contornos de lote, anel de foco, anel de seleção) >= 3:1; calculados à mão, a reconferir com ferramenta no aceite.
- **Foco:** visível em todos os elementos interativos (3 px + offset 2); `scroll-padding` evita foco escondido sob cabeçalho/barra (2.4.11); ordem de Tab = ordem visual; "Pular para o conteúdo" como 1º item.
- **Alvos:** padrão 44×44 px (botões, links isolados, abas, linhas de FAQ, lotes >= 44 px); mínimo absoluto 24×24 px (2.5.8) só em links dentro de texto corrido. Nenhuma ação exige arrastar (2.5.7).
- **Estrutura:** `header`, `nav`, `main`, `footer`; um único h1; h2 por seção com `aria-labelledby`; h3 nos cards/perguntas; `lang="pt-BR"`.
- **Cor nunca sozinha:** status do lote por ícone, padrão (liso/hachurado/cheio), contorno e texto no `aria-label`; erro por ícone + texto, não só vermelho; link por sublinhado.
- **Formulário:** `label` associado a cada campo; `fieldset/legend` no perfil; `autocomplete` adequado; erros ligados por `aria-describedby` e `aria-invalid`; foco no primeiro erro; mensagens anunciadas por `role="alert"`/`status`; sem exigir redigitar dados já informados (3.3.7).
- **Reflow e zoom:** sem rolagem horizontal em 320 px e com zoom 200 %/400 %; texto redimensionável sem perda; nada com altura fixa que corte texto ampliado (usar `min-height`).
- **Movimento:** seção 8; nada pisca; nenhum conteúdo some por tempo.
- **Ajuda consistente (3.2.6):** WhatsApp/e-mail no mesmo lugar (rodapé e seção de contato) na home e na política.
- **Teste obrigatório do `dev-qa`:** teclado completo em 360/768/1280; leitor de tela (NVDA ou VoiceOver) na demo e no formulário; modo de alto contraste (forced colors); zoom 200 %.

---

## 10. Imagem Open Graph (CA-30)

- Arquivo estático `1200×630` PNG (ou JPG), alvo < 300 KB (limite prático de alguns apps de mensagem, **não verificado**), `og:image:width/height` e `og:image:alt` preenchidos; mesma imagem no Twitter Card `summary_large_image`.
- **Composição** (fundo `ink-900` + malha de levantamento a 4 %; margem de segurança 80 px):
  - Topo esquerdo (80, 72): glifo 56 px + wordmark "Loteamento Inteligente" 36 px Bricolage 700, `paper-50`.
  - Esquerda (x 80–620, centro vertical): headline de até 8 palavras (marcador do copywriter), Bricolage 700, **76 px**, entrelinha 1,05, `paper-50`, até 3 linhas; sublinhado/realce `lime-400` em 1 palavra-chave. Linha de apoio 30 px `text-muted-dark` (opcional, 1 linha).
  - Direita (x 660–1120, y 110–520): recorte da planta com 2 quadras × 6 lotes nos 3 estados "sobre escuro" (a mesma arte do herói), com o lote selecionado em `lime-400`.
  - Rodapé esquerdo (80, 560): domínio em 26 px `text-muted-dark` (domínio pendente PEND-06).
- Texto legível em miniatura de 300 px de largura (headline >= 76 px garante isso). Sem preço, sem número de clientes, sem logos de terceiros, sem foto, sem depoimento (RN-03). Contraste texto/fundo >= 7:1.
- Gerar uma vez e versionar em `public/`; se o `dev-react` preferir gerar com a API de imagens do Next, manter esta composição. Variante da política: reutilizar a mesma imagem.

---

## 11. Critérios de aceite visuais (para dev-qa e revisão)

1. 360×640: wordmark, h1, subtítulo e botão primário visíveis sem rolar (CA-01); sem rolagem horizontal em 320 px.
2. CLS = 0,00 em 360/768/1280 no Lighthouse com throttling, incluindo troca de fonte, hidratação da demo, aparição da barra, mensagens de erro e resposta do envio.
3. Mapa: 24 lotes, contagem inicial 14/6/4 na legenda; os 3 estados distinguíveis em escala de cinza; selecionar, reservar e recomeçar funcionam por mouse, toque e teclado; nenhum lote < 44×44 px de área de toque em 320–1920 px.
4. Barra inferior nunca cobre o botão "Enviar" nem campo em foco; foco nunca fica sob cabeçalho ou barra.
5. Todo estado listado nas seções 4.2, 4.4 e 7 existe e está visualmente distinto.
6. `prefers-reduced-motion` desliga o que a seção 8 lista; sem JS a página, o FAQ (respostas visíveis) e o envio nativo funcionam.
7. Conteúdo de funcionalidades e benefícios usa somente itens "Pode prometer" (RN-01), sem número ou resultado sem fonte (RN-03).
8. Contraste e foco reconferidos com ferramenta; relatório em `docs/qa/`.

## 12. Pontos em aberto e riscos de design

| # | Item | Dono | Efeito |
|---|---|---|---|
| D-1 | Nome do loteamento fictício "Residencial Vista do Ipê" não colide com empreendimento real | dono / copywriter | RN-05 |
| D-2 | Textos finais (h1, subtítulo, CTAs, mensagens de erro <= 34 caracteres) | copywriter | comprimentos de 3.2, 6 e 7 |
| D-3 | Disponibilidade de Bricolage Grotesque no `next/font` e métrica do fallback | dev-react | seção 2.2 (fallback aprovado: Geist 700) |
| D-4 | Reservar 72–96 px de slot de alerta deixa espaço vazio no formulário; alternativa é aceitar CLS pequeno após resposta tardia | dono (trade-off) | seção 6 |
| D-5 | Tema escuro completo adiado para fase 2 | dono | seção 2.1 |
| D-6 | Hipótese não testada: o CTA no herói + após a demonstração + formulário converte melhor que só no cabeçalho. Sem dados; sugerir teste A/B só depois de haver tráfego (PEND-01/02) | dono | — |
| D-7 | Uso de comprimentos de "caixa alta" só em eyebrow; sem a tipografia condensada do estilo de motion pesado: decisão deliberada pelo perfil B2B | — | seção 1 |
| D-8 | Arquivos de logo/favicon/OG precisam ser gerados a partir desta spec | dev-uiux/dev-react | — |

Catálogo `~/.claude/patterns/uiux/` está vazio: nenhum padrão aplicado. Padrões validados aqui que valem registrar após o aceite (a confirmar com o usuário): "mapa de lotes acessível com roving tabindex" e "formulário de lead com espaço de erro reservado".
