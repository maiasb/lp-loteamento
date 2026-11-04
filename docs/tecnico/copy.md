# Copy da landing page "Loteamento Inteligente"

Versão 0.1 · 2026-11-04 · Base: `docs/specs/001-landing-page.md` (seções 1 a 8).

## Diagnóstico

- **Público e consciência:** gestores de loteadoras, incorporadoras e imobiliárias. Consciência do problema (controlam lotes em planilha, mapa em PDF e mensagens), ainda não conhecem o produto. O herói diz o que é e para quem, e leva à demonstração.
- **Promessa:** controlar mapa, lotes e reservas num sistema só, implantado na hospedagem da própria empresa.
- **Mecanismo (real):** mapa do loteamento + status por lote + reserva com regra (só lote disponível reserva; só admin confirma a venda).
- **Objeções:** "é mais um SaaS?", "quanto custa?", "preciso refazer meus dados?", "quem me dá suporte?".
- **Framework:** StoryBrand enxuto (cliente é o herói, sistema é o guia, demonstração é a prova). Sem prova social por RN-03.
- **Compliance (CDC, LGPD):** nada de número, depoimento ou resultado. Só funcionalidades da coluna "Pode prometer" (RN-01). Sem preço, cadastro, teste grátis ou SaaS (RN-02). Texto de consentimento e política precisam de revisão do `lgpd-specialist`.

## Estrutura

1. Herói + CTA fixo
2. Demonstração (mapa fictício)
3. Funcionalidades por perfil
4. Benefícios
5. FAQ
6. Formulário final
7. Rodapé

Ordem: mostrar (herói), provar pelo uso (demo), reconhecer-se (perfis), justificar (benefícios), quebrar objeções (FAQ), converter (formulário). Sem seção de prova social nem preço.

Legenda: `[PEND-xx]` depende de pendência da spec. Tudo entre `{{ }}` é variável preenchida pelo código.

---

## Barra de navegação e CTA fixo

- Logo/nome: `Loteamento Inteligente`
- Links âncora: `Demonstração` · `Funcionalidades` · `Benefícios` · `Perguntas` (opcional; remover no mobile se pesar)
- CTA fixo (botão): `Falar com a gente`
- Alternativa curta para telas de 360 px: `Fale conosco`
- aria-label do CTA fixo: `Ir para o formulário de contato`

> nota: o CTA fixo leva ao formulário e coloca o foco no campo "Nome" (CA-02). Não pode cobrir o botão de envio nem campos em foco no celular (CA-03).

---

## Herói

**Eyebrow:** `Para loteadoras, incorporadoras e imobiliárias`

**Headline:** `Mapa, lotes e reservas do seu loteamento em um só sistema`

**Variações (para teste ou escolha do dono):**
- Benefício: `Saiba, lote a lote, o que está disponível, reservado e vendido`
- Dor: `Chega de planilha e PDF para controlar quais lotes ainda estão livres`
- Curiosidade: `E se a sua equipe visse o mapa do loteamento sempre atualizado?` (escolher só se o dono aceitar o tom de pergunta)
- Prova: não há (sem número ou cliente autorizado, RN-03). Não usar.

**Subheadline:** `O Loteamento Inteligente reúne o mapa, as quadras e os lotes num lugar só. O vendedor reserva, o administrador confirma a venda, e todo mundo vê o mesmo status. Implantado na hospedagem da sua empresa.`

**CTA primário:** `Falar com a gente`
**Microcopy do CTA:** `Sem cadastro e sem compromisso. Respondemos por WhatsApp ou e-mail.` `[PEND-07: confirmar se há prazo de resposta a prometer; não escrever prazo sem confirmação]`

**CTA secundário:** `Testar a demonstração`
**Microcopy do secundário:** `Mapa de exemplo, com dados fictícios.`

**Links de contato diretos (abaixo dos botões):**
- WhatsApp: `Chamar no WhatsApp` (abre `https://wa.me/{{NEXT_PUBLIC_WHATSAPP}}?text=` + mensagem padrão)
- E-mail: `{{NEXT_PUBLIC_EMAIL}}`
- Mensagem inicial do WhatsApp (CA-04): `Olá, quero conhecer o Loteamento Inteligente.`

**Alt da imagem/ilustração do herói:** `Mapa de um loteamento com quadras e lotes coloridos por status: disponível, reservado e vendido.` `[PEND-05: depende de imagem e identidade visual; ajustar o alt ao visual final]`

> nota: nome, título, subtítulo e CTA principal visíveis na primeira dobra em 360 e 1280 px (CA-01). A imagem do herói deve ser a prévia da demonstração, com dados fictícios (RN-05).

---

## Demonstração

**Título (h2):** `Experimente o mapa na prática`

**Subtítulo:** `Clique num lote, veja os detalhes e faça uma reserva de teste. É um exemplo com dados fictícios, para você sentir como a sua equipe usaria o sistema.`

**Aviso fixo (sempre visível, CA-05):** `Dados fictícios, apenas demonstração.`

**Nome do loteamento fictício:** `Residencial Exemplo` `[PREMISSA: nome genérico; trocar se o dono preferir]`
**Quadras:** `Quadra A`, `Quadra B` (mínimo 2 quadras, 20 lotes)

**Instruções do mapa (acima do mapa):**
1. `Clique em um lote para ver quadra, número, área, preço e status.`
2. `Em um lote disponível, use "Reservar (demonstração)".`
3. `Para voltar ao início, use "Recomeçar".`

**Aviso da demonstração (texto visível, abaixo dos passos):** `A demonstração ilustra a lógica de reserva do sistema e não reproduz a tela real.`

**Instrução para teclado e leitor de tela (texto visível ou de apoio):** `Use Tab para percorrer os lotes e Enter ou Espaço para abrir os detalhes.`

**Legenda de status (com contagem, atualizada a cada ação):**
- `Disponível: {{n}}`
- `Reservado: {{n}}`
- `Vendido: {{n}}`

> nota: status sempre por texto além da cor (CA-11, RNF-07). "Bloqueado" não aparece na demo (RN-04).

**Painel de detalhe do lote:**
- Rótulos: `Quadra` · `Lote` · `Área` (ex.: `300 m²`) · `Preço (fictício)` · `Status`
- Botão (lote disponível): `Reservar (demonstração)`
- Botão fechar: `Fechar detalhes`

**Mensagem após reservar (CA-07):** `Lote reservado na demonstração. No sistema, a reserva fica aguardando: só um administrador confirma a venda ou cancela a reserva.`

**Mensagem para lote reservado (CA-08):** `Lote já reservado. Só lotes disponíveis podem ser reservados. No sistema, o administrador decide se confirma a venda ou cancela a reserva.`

**Mensagem para lote vendido (CA-08):** `Lote já vendido. Lotes vendidos não podem ser reservados.`

**Botão de reinício:** `Recomeçar`
**Anúncio para leitor de tela ao recomeçar:** `Demonstração reiniciada. Todos os lotes voltaram ao estado inicial.`

**Estado de carregamento (CA-10):** `Carregando a demonstração…` (mesma altura do mapa carregado)

**CTA abaixo da demo (CA-12):** `Quero isso no meu loteamento`
**Microcopy:** `Fale com a gente por formulário, WhatsApp ou e-mail.`

**Alt / rótulos do mapa:**
- Região do mapa (aria-label): `Mapa de demonstração do Residencial Exemplo, com lotes por quadra`
- Cada lote (aria-label): `Quadra {{q}}, lote {{n}}, {{status}}` (ex.: `Quadra A, lote 3, disponível`)

---

## Funcionalidades por perfil

**Título (h2):** `O que o sistema faz pelo seu tipo de operação`

**Subtítulo:** `Três perfis, o mesmo sistema. Veja o que muda no seu dia a dia.`

> nota: abas ou três cartões. Todo item abaixo vem da coluna "Pode prometer" da seção 4 (RN-01). Itens condicionais ficam de fora até a PEND-04.

### Loteadora / incorporadora
Título do cartão: `Para quem lota e organiza o empreendimento`
- `Cadastre o loteamento com o mapa em imagem, PDF ou SVG sobre o Google Maps, com quadras e lotes.`
- `Cada lote com número, área, preço, descrição e características.`
- `Importe o loteamento completo por planilha Excel ou JSON, sem digitar lote por lote.`
- `Bloqueie, desbloqueie ou exclua quadras de uma vez, com proteção para lotes já reservados ou vendidos.`
- `Compartilhe um link público do mapa, somente leitura, sem login e sem preço.`

### Imobiliária
Título do cartão: `Para quem vende e precisa de um estoque confiável`
- `Veja o status de cada lote: disponível, reservado, vendido ou bloqueado, com cores por status.`
- `Reserve um ou mais lotes para o mesmo cliente, com preço acordado, entrada e parcelas por lote.`
- `O sistema não deixa reservar um lote que não está disponível.`
- `Cada vendedor vê apenas as próprias reservas.`
- `Use no celular e escolha entre tema claro e escuro.`

### Gestor comercial
Título do cartão: `Para quem acompanha a operação e decide`
- `Painel com o total de mapas, lotes e reservas.`
- `A venda só é confirmada, ou a reserva cancelada, por um administrador.`
- `Três papéis de acesso (dev, admin e vendedor), com permissões aplicadas no servidor.`
- `Todos trabalham sobre o mesmo mapa e o mesmo status de cada lote.`

**CTA da seção:** `Ver como fica no meu caso` → leva ao formulário.

> nota: "Painel com totais" é recurso de admin/dev (seção 4). Se o design agrupar por papel, deixar claro "para administradores".

---

## Benefícios

**Título (h2):** `Reserva só de lote disponível, mais clareza para a equipe`

> nota: cada benefício liga a uma funcionalidade real (CA-14). Sem número, percentual ou resultado prometido (RN-03).

1. **Um estoque só, visível para todos.** `Cada lote tem um status único no sistema, visível para toda a equipe: disponível, reservado, vendido ou bloqueado.` (base: status por lote)
2. **Menos reserva em duplicidade.** `O sistema impede reservar um lote que não está disponível.` (base: regra de reserva)
3. **Controle sobre a venda.** `O vendedor reserva; só o administrador confirma a venda ou cancela. Cada vendedor vê apenas as próprias reservas.` (base: papéis e permissões)
4. **Cadastro mais rápido.** `Importe o loteamento por planilha Excel ou JSON em vez de cadastrar lote por lote.` (base: importação)
5. **Condições registradas por lote.** `Preço acordado, entrada e parcelas ficam na reserva de cada lote.` (base: reserva com condições)
6. **Visão geral rápida.** `O painel mostra o total de mapas, lotes e reservas.` (base: dashboard)
7. **Funciona onde a equipe estiver.** `Acesse pelo celular, com tema claro ou escuro.` (base: uso no celular)
8. **Dados na sua casa.** `O sistema é implantado na hospedagem da sua empresa.` `[PEND-07: confirmar a mensagem "na hospedagem do cliente" antes de publicar]`

---

## Como funciona o contato (3 passos)

> nota: seção curta opcional entre Benefícios e FAQ. Cortar se a página ficar longa. Não prometer prazo.

**Título (h2):** `Como é começar`
1. `Você fala com a gente.` `Pelo formulário, WhatsApp ou e-mail.`
2. `Conversamos sobre o seu loteamento.` `Entendemos o tamanho da operação e como você controla os lotes hoje.`
3. `Combinamos a implantação.` `O sistema é implantado na hospedagem da sua empresa, sob demanda.` `[PEND-07: detalhar quem configura a hospedagem, prazo e suporte]`

---

## FAQ

**Título (h2):** `Perguntas frequentes`

> nota: acordeão por clique e teclado; respostas no HTML; mesmo conteúdo no JSON-LD `FAQPage` (CA-15). Respostas marcadas dependem de PEND-03 e PEND-07; até serem respondidas, usar a versão provisória indicada.

**1. Como funciona a implantação?**
`O sistema é implantado sob demanda, na hospedagem da sua empresa. Você conversa com a gente, combinamos como será feito e entregamos o sistema funcionando com o seu loteamento.` `[PEND-07: detalhar quem configura a hospedagem do cliente]`

**2. Preciso instalar alguma coisa no computador da equipe?**
`Não. A equipe acessa o sistema pelo navegador, no computador ou no celular.` `[PEND-07: confirmar]`

**3. Tem mensalidade? Quanto custa?**
Versão provisória (RN-02, sem preço): `O valor depende do tamanho da operação e da forma de implantação. Fale com a gente e enviamos uma proposta.` `[PEND-03: se o dono decidir falar de forma de cobrança (implantação + mensalidade, licença única, "sob consulta"), substituir. Não publicar valor sem decisão.]`

**4. Qual o prazo de implantação?**
Versão provisória: `O prazo depende do tamanho do loteamento e da hospedagem da sua empresa. Informamos na conversa, antes de qualquer compromisso.` `[PEND-07: sem prazo numérico até o dono informar]`

**5. Já tenho meus lotes em planilha. Preciso digitar tudo de novo?**
`Não. O sistema importa o loteamento completo por planilha Excel ou JSON.`

**6. Quem pode ver os preços?**
`Quem abre o link público do mapa não vê preço; o link é somente leitura e não pede login. Dentro do sistema, o acesso é por login, com permissões por papel (dev, admin e vendedor) aplicadas no servidor.`

**7. Quem confirma uma venda?**
`O vendedor reserva o lote. Só um administrador confirma a venda ou cancela a reserva.`

**8. Isso é um serviço por assinatura, com cadastro e teste grátis?**
`Não. O Loteamento Inteligente não é um serviço de cadastro automático nem tem teste grátis. Você experimenta a demonstração nesta página e, se fizer sentido, fala com a gente para combinar a implantação.`

**9. Como funciona o suporte?**
`Você fala diretamente com a gente por WhatsApp ou e-mail.` `[PEND-07: confirmar canais, horários, o que o suporte cobre e como funcionam as atualizações. Não prometer SLA.]`

**10. Funciona no celular?**
`Sim. O sistema pode ser usado no celular e tem tema claro e escuro.`

---

## Formulário final

**Título (h2):** `Fale com a gente sobre o seu loteamento`

**Subtítulo:** `Deixe seus dados e entraremos em contato por WhatsApp ou e-mail. Sem cadastro e sem compromisso.` `[PEND-07: acrescentar prazo de retorno só se o dono confirmar]`

**Ao lado do formulário (contato direto):**
- `Prefere falar agora?`
- Botão: `Chamar no WhatsApp`
- E-mail: `{{NEXT_PUBLIC_EMAIL}}`

### Campos (CA-16)

| Campo | Rótulo | Placeholder | Obrigatório | Dica de apoio |
|---|---|---|---|---|
| nome | `Nome` | `Seu nome completo` | Sim | — |
| whatsapp | `WhatsApp` | `(11) 91234-5678` | Sim | `Com DDD.` |
| email | `E-mail` | `voce@empresa.com.br` | Sim | — |
| empresa | `Empresa` | `Nome da sua empresa` | Sim, exceto Gestor comercial (dica "Opcional para gestor comercial.") | — |
| perfil | `Seu perfil` | `Selecione` | Sim | — |
| faixa_lotes | `Nº aproximado de lotes` | `Selecione` | Sim | `Uma estimativa já ajuda.` |

**Opções de perfil:** `Loteadora / incorporadora` · `Imobiliária` · `Gestor comercial`

**Opções de nº de lotes** `[PREMISSA RN-08]`: `Até 100` · `De 101 a 300` · `De 301 a 1.000` · `Mais de 1.000` · `Ainda não sei`

**Campo honeypot:** oculto por CSS e `aria-hidden`/`tabindex="-1"`; rótulo interno `Não preencha este campo`. Não aparece para usuários.

### Consentimento LGPD (CA-16, CA-19; caixa desmarcada)

**Texto da caixa:** `Li e concordo com a [Política de Privacidade](/politica-de-privacidade) e autorizo o uso dos meus dados para que entrem em contato comigo sobre o Loteamento Inteligente.`

**Aviso curto abaixo do botão (finalidade):** `Usamos seus dados só para responder ao seu contato. Veja prazos e como pedir exclusão na Política de Privacidade.` `[PEND-09 e PEND-11: controlador e retenção; texto final do lgpd-specialist. Não afirmar prazo de guarda até lá.]`

> nota: texto da base legal e da política é do `lgpd-specialist`. Este texto é proposta, para revisão antes de publicar.

### Botão

- Padrão: `Enviar contato`
- Enviando: `Enviando…` (mesmo tamanho do botão padrão, CA-17)

### Mensagens de erro (junto ao campo, CA-18/19)

| Situação | Mensagem |
|---|---|
| Nome vazio | `Informe seu nome.` |
| Nome acima do limite | `Use até 120 caracteres.` `[PREMISSA RN-11]` |
| WhatsApp vazio | `Informe seu WhatsApp.` |
| WhatsApp inválido | `Informe um número com DDD, por exemplo (11) 91234-5678.` |
| E-mail vazio | `Informe seu e-mail.` |
| E-mail inválido | `Informe um e-mail válido, por exemplo voce@empresa.com.br.` |
| Empresa vazia | `Informe o nome da empresa.` |
| Perfil não escolhido | `Escolha o seu perfil.` |
| Faixa não escolhida | `Escolha uma faixa de lotes.` |
| Consentimento desmarcado | `É preciso aceitar a política de privacidade para enviar.` (texto fixo, CA-19) |

**Resumo de erros (anunciado ao leitor de tela, foco no primeiro campo com erro):** `Revise {{n}} campo(s) antes de enviar.`

### Mensagem de limite de envios (CA-21)

`Recebemos muitos envios deste endereço em pouco tempo. Tente novamente mais tarde ou fale com a gente pelo WhatsApp.` + botão `Chamar no WhatsApp`

### Mensagem de falha do servidor (CA-22)

`Não conseguimos enviar seu contato agora. Seus dados continuam aqui no formulário. Tente de novo em alguns minutos ou fale com a gente pelo WhatsApp ou pelo e-mail {{NEXT_PUBLIC_EMAIL}}.` + botão `Tentar de novo` + botão `Chamar no WhatsApp`

### Mensagem de sucesso (CA-17; também exibida no honeypot, CA-20)

**Título:** `Contato recebido`
**Texto:** `Obrigado, {{primeiro_nome}}. Recebemos seus dados e entraremos em contato por WhatsApp ou e-mail.` `[PEND-07: prazo de retorno só se confirmado]`
**Próximo passo:** `Se preferir, já pode falar com a gente agora:` + botão `Chamar no WhatsApp`

> nota: sucesso ocupa a mesma altura reservada do formulário (CA-17). Com JavaScript desligado, a página de confirmação traz o mesmo texto (CA-24). No honeypot, o texto do `primeiro_nome` pode ficar genérico (`Obrigado.`).

---

## Rodapé

- Nome: `Loteamento Inteligente`
- Descrição curta: `Sistema para gestão e venda de loteamentos, implantado na hospedagem do cliente.`
- Links: `Demonstração` · `Funcionalidades` · `Perguntas` · `Fale conosco` · `Política de Privacidade`
- Contato: WhatsApp `{{NEXT_PUBLIC_WHATSAPP_FORMATADO}}` · E-mail `{{NEXT_PUBLIC_EMAIL}}`
- Linha legal: `© {{ano}} {{RAZÃO SOCIAL}} · CNPJ {{CNPJ}}` `[PEND-09: razão social, CNPJ e contato do titular]`
- Aviso: `As imagens e valores da demonstração são fictícios.`

---

## SEO

**Página principal**
- Title (50 caracteres): `Loteamento Inteligente: gestão de lotes e reservas`
- Meta description (135 caracteres): `Sistema para loteadoras e imobiliárias: mapa de lotes, quadras, status e reservas por vendedor. Veja a demonstração e fale com a gente.`
- H1: o headline do herói (único h1 da página).

**Política de privacidade**
- Title (46 caracteres): `Política de Privacidade | Loteamento Inteligente`
- Meta description (111 caracteres): `Como o Loteamento Inteligente trata os dados enviados pelo formulário de contato e como pedir acesso ou exclusão.`

**JSON-LD (sem preço, avaliação ou nota; CA-31)**
- `SoftwareApplication`: name `Loteamento Inteligente`; description `Sistema web para gestão e venda de loteamentos: mapa, quadras, lotes e reservas.`; applicationCategory `BusinessApplication`; operatingSystem `Web`.
- `Organization`: nome e contato `[PEND-09]`.
- `FAQPage`: as 10 perguntas e respostas acima, texto idêntico ao visível (sem os marcadores `[PEND]`).

## Open Graph e Twitter Card

- `og:title` (22): `Loteamento Inteligente`
- `og:description` (106): `Mapa, lotes e reservas do seu loteamento num só sistema. Experimente a demonstração com dados fictícios.`
- `og:type`: `website` · `og:locale`: `pt_BR`
- `og:site_name`: `Loteamento Inteligente`
- `twitter:card`: `summary_large_image` (mesmos título e descrição)
- `og:image` (1200x630) — alt: `Loteamento Inteligente: mapa de lotes com quadras coloridas por status e o texto "Mapa, lotes e reservas em um só sistema".` `[PEND-05: imagem e identidade visual]`

---

## Texto alternativo dos elementos visuais

| Elemento | Alt / rótulo |
|---|---|
| Logo | `Loteamento Inteligente` `[PEND-05]` |
| Imagem do herói | `Mapa de um loteamento com quadras e lotes coloridos por status: disponível, reservado e vendido.` `[PEND-05]` |
| Mapa da demonstração | `Mapa de demonstração do Residencial Exemplo, com lotes por quadra` (aria-label da região) |
| Lote no mapa | `Quadra {{q}}, lote {{n}}, {{status}}` |
| Ícones de legenda de status | Decorativos (`alt=""`); o texto da legenda já informa o status |
| Ícones dos perfis e benefícios | Decorativos (`alt=""`, `aria-hidden="true"`) |
| Prints do sistema (se houver) | `Tela do Loteamento Inteligente: {{o que a tela mostra}}. Dados fictícios.` `[PEND-05]` |
| Ícone do WhatsApp (botão) | Botão com texto visível `Chamar no WhatsApp`; ícone `aria-hidden="true"` |
| Imagem Open Graph | Ver seção Open Graph |

---

## Textos fora do escopo (não escrever)

Não usar em nenhum ponto: preço, "teste grátis", "crie sua conta", "assine", "SaaS", depoimentos, logos de clientes, números de clientes, percentuais de resultado, "em breve", "alertas automáticos", "simulador de parcelas", "link por corretor", "captura de lead na página do mapa", "planta interativa", relatórios exportáveis, integração com CRM ou portais, e-mail/WhatsApp automático do sistema. Itens condicionais (prazo de reserva com vencimento automático, sinal com comprovante, histórico do lote, mapa público com lotes coloridos e clicáveis) só entram após a PEND-04.

## Testes A/B (só com tráfego suficiente; sem A/B no escopo da v1, spec 3.2)

1. Se o CTA do herói trocar `Falar com a gente` por `Quero ver no meu loteamento`, então a taxa de clique no CTA sobe, porque o texto liga o clique ao caso do visitante. Prioridade média.
2. Se o herói mostrar a demonstração já no topo (em vez de ilustração), então a taxa de interação com a demo e de envio do formulário sobe, porque o visitante vê o produto em segundos. Prioridade alta.
3. Se o formulário reduzir campos (tirar "Nº de lotes"), então a taxa de envio sobe, com custo na qualificação do lead. Prioridade baixa. Com pouco volume, priorize melhorias qualitativas.

## Checklist de placeholders pendentes

- [ ] PEND-03: falar de forma de cobrança ou "sob consulta" (FAQ 3). Quem: dono.
- [ ] PEND-04: liberar funções condicionais (prazo de reserva, sinal, histórico, mapa público colorido). Quem: dono.
- [ ] PEND-05: logo, cores, imagem do herói, Open Graph, prints fictícios. Quem: dono / dev-uiux.
- [ ] PEND-07: confirmar "na hospedagem do cliente", quem configura, prazo, suporte e atualizações; prazo de resposta ao lead (herói, formulário, sucesso, FAQ 1, 2, 4, 9, benefício 8). Quem: dono.
- [ ] PEND-09: razão social, CNPJ, contato do titular (rodapé, JSON-LD, política). Quem: dono.
- [x] PEND-10: decidido, Empresa opcional só para Gestor comercial.
- [ ] PEND-11: retenção de leads (aviso do formulário). Quem: dono + lgpd-specialist.
- [ ] Texto final do consentimento e da política: revisão do `lgpd-specialist`.
- [ ] Variáveis `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_EMAIL` (e formatado). Quem: dono (CA-33).
- [ ] Nome do loteamento fictício e confirmação de 2 quadras e 20 lotes (premissas). Quem: dev-uiux / dono.
- [ ] Faixas de lotes (RN-08) e limite de 120 caracteres (RN-11): premissas a confirmar. Quem: dono.
