# Spec 001: Landing page de vendas do "Loteamento Inteligente"

| Campo | Valor |
|---|---|
| Cliente | Desenvolvedor (dono do produto "Loteamento Inteligente"); público: loteadoras, incorporadoras, imobiliárias, gestores comerciais |
| Versão | 0.3 |
| Status | Rascunho (aguarda respostas da seção 9 e o resultado da tarefa T1, seção 10) |
| Autor | arquiteto-specs · 2026-11-04 |
| Aprovada por / em | — |
| Fontes | Briefing do orquestrador (2026-11-04); produto lido em `/home/maiasb/codes/loteamento-inteligente` (`CLAUDE.md`, `TODO.md`, specs 002, 003, 004, 005, 011, 017, ADR 003); decisões do dono de 2026-11-04 (RNF-05, PEND-10, remoção do backend); relatórios `docs/qa/2026-11-04-landing-v0.1.md` e `docs/seguranca/2026-11-04-auditoria-landing.md`; ADR `docs/adr/ADR-0001-leads-em-planilha-google-sem-backend.md` |

Convenções: `CA-xx` critério de aceite, `RN-xx` regra de negócio, `RNF-xx` não funcional, `PEND-xx` pergunta em aberto, `RA-xx` risco aceito. `[PREMISSA: ...]` = assumido, a confirmar. IDs removidos não são reutilizados.

## 1. Objetivo

Gerar **leads qualificados** (contato de loteadora, imobiliária ou gestor comercial) para venda e implantação do sistema "Loteamento Inteligente", passando a imagem de um produto moderno e funcional para gestão e venda de loteamentos.

**Restrição de arquitetura (decisão do dono, 2026-11-04):** a landing **não tem backend próprio**. É um site estático; o formulário envia os dados direto para um serviço do Google, que grava numa **planilha do Google (Google Sheets)**. Sem banco de dados, sem rota ou função de servidor própria, sem Docker, sem SMTP próprio. Mecanismo presumido: Google Apps Script publicado como aplicativo da web, vinculado à planilha (ADR-0001; Google Forms avaliado como alternativa na seção 5.7).

| Indicador | Meta | Como medir |
|---|---|---|
| Leads recebidos | `[PENDENTE: PEND-01]` | Linhas da planilha de leads (desconsiderando as marcadas "suspeito", RN-07) |
| Taxa de conversão (leads / visitas) | `[PENDENTE: PEND-01]` | depende de ferramenta de medição (PEND-02) |
| Core Web Vitals | todos "bons" (RNF-01 a RNF-03) | Lighthouse e PageSpeed Insights |

**Modelo comercial que a página comunica:** o sistema é **implantado por cliente, sob demanda, na hospedagem do próprio cliente**. A página **não** é porta de entrada de um SaaS: sem cadastro, sem teste grátis automático, sem login, sem preço publicado (PEND-03).

## 2. Glossário

| Termo | Definição |
|---|---|
| Loteamento | Empreendimento com seu mapa (imagem, PDF ou desenho sobre o Google Maps), quadras e lotes. |
| Quadra / Lote | Lote tem número, quadra, área (m²), preço e status. |
| Status do lote | Disponível, Reservado, Vendido (e Bloqueado no sistema; ver RN-04). |
| Reserva | Vendedor separa um ou mais lotes para um cliente; admin confirma a venda ou cancela. |
| Lead | Contato enviado pelo formulário da landing; uma linha na planilha de leads. |
| Perfil do lead | Loteadora/incorporadora, Imobiliária ou Gestor comercial. |
| Dono da landing | Quem recebe o aviso por e-mail e consulta os leads na planilha. |
| Planilha de leads | Planilha do Google, numa conta Google do dono (PEND-13), onde cada lead vira uma linha. É a única forma de consulta. |
| Script de recebimento | Programa do Google Apps Script, vinculado à planilha, publicado como aplicativo da web, que recebe o envio do formulário, valida e grava. Código versionado neste repositório. |
| Endereço de envio | URL pública do script de recebimento, embutida no site por variável `NEXT_PUBLIC_*`. Qualquer pessoa que veja o código da página a conhece. |
| Lead suspeito | Lead gravado durante um surto de envios (RN-07); fica marcado na planilha para o dono conferir. |

## 3. Escopo

### 3.1 Incluído (MVP, fase única)

1. Página única com as seções: herói + CTA fixo; demonstração interativa; funcionalidades por perfil; benefícios; FAQ; formulário final.
2. Demonstração com mapa de lotes **fictício**, clicável, que imita a lógica do sistema.
3. Site **estático** (arquivos prontos, sem servidor de aplicação), publicado numa hospedagem estática (PEND-06).
4. Formulário de lead enviado direto ao script de recebimento do Google, que grava na planilha de leads, com honeypot, deduplicação, marcação de surto e consentimento LGPD (data/hora e versão da política).
5. Aviso por e-mail ao dono a cada lead novo, enviado pela conta Google dona do script (PEND-15).
6. Consulta dos leads **direto na planilha** (sem exportação; a planilha é a consulta).
7. Retenção automática (apagar leads mais antigos que o prazo da PEND-11) e cópia de segurança periódica da planilha (RNF-10).
8. Página de política de privacidade simples, citando o Google como operador.
9. SEO técnico: metadados, Open Graph, JSON-LD (`SoftwareApplication`, `Organization`, `FAQPage`), `sitemap.xml`, `robots.txt`, HTML semântico.
10. Contato (WhatsApp e e-mail) e endereço de envio configuráveis por variáveis `NEXT_PUBLIC_*`.

### 3.2 Fora de escopo

- **Backend próprio de qualquer tipo**: banco de dados, Server Action, rota de API, função serverless própria, contêiner, SMTP próprio, fila (decisão do dono).
- **Limite de envios por IP** (impossível sem backend próprio; ver seção 5.8 e RA-01).
- Exportação de leads por comando (`leads:export`) e arquivo CSV gerado pelo projeto (removidos na v0.3; o dono baixa da planilha se quiser).
- Login, painel de administração ou tela de leads (decisão do usuário); consulta só pela planilha.
- Qualquer integração com o sistema "Loteamento Inteligente" (sem API, sem banco compartilhado, sem SSO, sem mapa real).
- Cadastro de conta, teste grátis, demonstração automática em ambiente próprio, checkout, preço ou plano publicado.
- Envio de mensagem automática ao lead (e-mail de confirmação, WhatsApp, SMS) e integração com CRM.
- Ferramentas de analytics, pixel de anúncio e banner de cookies (entram só se PEND-02 decidir; mudam LGPD e desempenho).
- Verificação anti-robô com desafio (Cloudflare Turnstile, reCAPTCHA): só se PEND-17 decidir.
- Blog, várias páginas de conteúdo, versão em outro idioma, A/B test.
- Depoimentos, logos de clientes, números de clientes ou avaliações (RN-03) enquanto não houver material autorizado.
- Prints reais do sistema com dados de clientes (só com dados fictícios; PEND-05).
- Configuração da hospedagem, domínio, DNS e e-mail do domínio (dono: `dev-infra`; PEND-06).

## 4. O que a página pode prometer (verificado no produto em 2026-11-04)

Regra geral: **só entra no texto o que está na coluna "Pode prometer"**. O que estiver em "Não prometer" não aparece, nem como "em breve", salvo decisão do dono.

| Pode prometer (implementado) | Condicional (PEND-04) | Não prometer (não existe ou não aprovado) |
|---|---|---|
| Cadastro do loteamento com mapa (imagem, PDF ou SVG sobre o Google Maps), quadras e lotes com número, área, preço, descrição e características | Prazo da reserva com vencimento automático e aviso "vencendo" (spec 017 fase 1: implementada, sem QA final e sem agendador em produção) | Limite de desconto, tabela de condições, simulador de parcelas (017 fase 2) |
| Status por lote: disponível, reservado, vendido, bloqueado; cores por status | Motivo de cancelamento, registro do sinal com comprovante, histórico do lote (017 fase 1, mesma ressalva) | WhatsApp do corretor, "tenho interesse" e captura de lead na página pública do mapa; link por corretor (017 fase 3) |
| Importação do loteamento completo por planilha Excel ou JSON | Mapa público com lotes coloridos e clicáveis (o TODO do produto registra que `/view/[mapId]` hoje mostra só o Google Maps; planta interativa = spec 016, não escrita) | Planta interativa sobre a imagem/SVG (016), endereço que centraliza o mapa (015) |
| Bloquear, desbloquear e excluir quadras em lote, com proteção de lotes reservados/vendidos | | Módulo de imóveis/casas |
| Reserva de um ou mais lotes pelo vendedor, com preço acordado, entrada e parcelas por lote; o sistema impede reservar lote que não está disponível | | Pagamento, contrato, nota fiscal, assinatura digital |
| Confirmação da venda ou cancelamento só por admin; vendedor vê apenas as próprias reservas | | E-mail/WhatsApp/push automáticos do sistema |
| Papéis dev, admin e vendedor, com login e permissões aplicadas no servidor | | Relatórios exportáveis, app nativo, SaaS multiempresa |
| Painel (dashboard) com totais de mapas, lotes e reservas (admin/dev) | | Integração com CRM, portais imobiliários ou ERP |
| Link público de visualização do mapa, sem login e sem preço, somente leitura | | |
| Tema claro e escuro; uso no celular | | |

## 5. Requisitos funcionais

### 5.1 Herói e CTA fixo

**HU-01** Como **gestor de loteadora ou imobiliária**, quero entender em poucos segundos o que o sistema faz e como falar com alguém, para decidir se vale meu tempo.

| ID | Critério de aceite |
|---|---|
| CA-01 | **Dado** a página carregada em 360 px e 1280 px, **quando** nada é rolado, **então** ficam visíveis na primeira dobra: nome "Loteamento Inteligente", título com a proposta de valor, um subtítulo e o botão principal de contato. |
| CA-02 | **Dado** qualquer posição de rolagem, **quando** o visitante olha a tela, **então** existe um CTA sempre visível (fixo) que leva ao formulário final; ao ativá-lo, a página rola até o formulário e o foco vai para o primeiro campo. |
| CA-03 | **Dado** o CTA fixo, **quando** ele aparece, some ou muda de estado durante a rolagem, **então** nenhum conteúdo da página se desloca (contribuição zero ao CLS) e ele não cobre o botão de envio do formulário nem campos em foco no celular. |
| CA-04 | **Dado** `NEXT_PUBLIC_*` de WhatsApp configurada, **quando** o visitante ativa o contato por WhatsApp, **então** abre conversa com o número configurado e mensagem inicial padrão `[PREMISSA: "Olá, quero conhecer o Loteamento Inteligente."]`. |

### 5.2 Demonstração interativa (dados fictícios)

**HU-02** Como **visitante**, quero mexer num mapa de lotes de exemplo, para sentir como a equipe usaria o sistema no dia a dia.

| ID | Critério de aceite |
|---|---|
| CA-05 | **Dado** a seção de demonstração, **quando** exibida, **então** mostra um loteamento fictício com ao menos 2 quadras e 20 lotes `[PREMISSA]`, com lotes nos quatro status (disponível, reservado, vendido, bloqueado), legenda com a contagem por status e o aviso visível "Dados fictícios, apenas demonstração". |
| CA-06 | **Dado** um lote qualquer, **quando** clicado ou ativado por teclado (Enter/Espaço), **então** abre um painel com quadra, número, área, preço e preço por m² fictícios e status. |
| CA-07 | **Dado** um lote **disponível**, **quando** o visitante escolhe "Reservar este lote" (ou adiciona vários à seleção e usa "Reservar (n)"), **então** o(s) lote(s) passa(m) a **reservado**, a legenda e as contagens se atualizam e aparece mensagem explicando que, no sistema, a reserva é confirmada ou cancelada por um admin. |
| CA-08 | **Dado** um lote **reservado** ou **vendido**, **quando** o visitante tenta reservá-lo, **então** a ação não está disponível e o detalhe explica o motivo (ex.: "Lote já reservado"), como no sistema (RN-04). |
| CA-09 | **Dado** a demonstração alterada, **quando** o visitante usa "Recomeçar" ou recarrega a página, **então** volta ao estado inicial; nada é enviado a nenhum servidor nem gravado. |
| CA-10 | **Dado** a demonstração ainda carregando, **quando** o visitante vê a seção, **então** ela ocupa exatamente o mesmo espaço do estado carregado (sem salto) e mostra um estado de carregamento sem bloquear o resto da página. |
| CA-11 | **Dado** um usuário de leitor de tela ou só teclado, **quando** usa a demonstração, **então** consegue percorrer os lotes, saber o status de cada um por texto (não só por cor) e fazer a reserva de demonstração. |
| CA-12 | **Dado** o visitante na demonstração, **quando** termina de interagir, **então** há um CTA ao lado/abaixo dela que leva ao formulário. |

### 5.3 Funcionalidades por perfil, benefícios e FAQ

**HU-03** Como **loteadora, imobiliária ou gestor comercial**, quero ver o que o sistema faz para o meu caso, para me reconhecer na oferta.

| ID | Critério de aceite |
|---|---|
| CA-13 | **Dado** a seção de funcionalidades, **quando** exibida, **então** apresenta três perfis (Loteadora/incorporadora, Imobiliária, Gestor comercial), cada um com funcionalidades tiradas **apenas** da coluna "Pode prometer" da seção 4. |
| CA-14 | **Dado** a seção de benefícios, **quando** exibida, **então** cada benefício está ligado a uma funcionalidade da seção 4 e não contém número, percentual ou resultado sem fonte (RN-03). |
| CA-15 | **Dado** o FAQ, **quando** exibido, **então** cada pergunta abre e fecha por clique e teclado, todas as respostas estão no HTML da página (indexáveis) e o conteúdo é o mesmo do JSON-LD `FAQPage`. O FAQ responde ao menos: como funciona a implantação (na hospedagem do cliente), se precisa instalar algo, se há mensalidade, prazo de implantação, se importa planilha existente, quem pode ver preços, suporte. Respostas dependem de PEND-03 e PEND-07. |

### 5.4 Formulário de lead

**HU-04** Como **interessado**, quero deixar meus dados em poucos passos, para ser chamado por alguém.

Fluxo do envio (com JavaScript):

```mermaid
sequenceDiagram
    actor V as Visitante
    participant P as Página estática (navegador)
    participant S as Script de recebimento (Google Apps Script)
    participant G as Planilha de leads (Google Sheets)
    participant E as E-mail do dono
    V->>P: Preenche e envia
    P->>P: Valida (RN-11) e trava o botão
    P->>S: Envia campos + versão da política
    S->>S: Honeypot, validação (RN-11), versão aceita (RN-10)
    S->>S: Trava de gravação, deduplicação (RN-12), surto (RN-07)
    S->>G: Grava 1 linha (texto protegido contra fórmula, RN-14)
    S-->>P: Resultado: sucesso / inválido / erro
    S->>E: Aviso (depois de gravar; falha não muda o resultado, RN-09)
    P->>V: Mensagem de sucesso, erros por campo ou erro com WhatsApp
```

| ID | Critério de aceite |
|---|---|
| CA-16 | **Dado** o formulário, **quando** exibido, **então** tem os campos: nome, WhatsApp, e-mail, empresa (opcional só para Gestor comercial, com o aviso "Opcional para gestor comercial."), perfil (Loteadora/incorporadora, Imobiliária, Gestor comercial), nº aproximado de lotes (faixas, RN-08) e caixa de consentimento LGPD **desmarcada**, com link para a política de privacidade. |
| CA-17 | **Dado** todos os campos válidos e o consentimento marcado, **quando** o visitante envia, **então** uma linha é gravada na planilha de leads com: data/hora do recebimento e do consentimento (relógio do script, America/Sao_Paulo), todos os campos e a versão da política aceita; o botão mostra estado de envio sem mudar de tamanho; e **somente depois** de o script confirmar a gravação aparece a mensagem de sucesso no lugar do formulário (mesma altura reservada) com o próximo passo e o link de WhatsApp legível. |
| CA-18 | **Dado** campo obrigatório vazio ou inválido (nome, WhatsApp, e-mail, perfil, faixa, empresa quando exigida), **quando** envia, **então** nada é gravado, cada erro aparece junto ao campo em português, o foco vai ao primeiro campo com erro e os erros são anunciados ao leitor de tela; tudo o que foi digitado ou escolhido é mantido (inclusive a faixa de lotes). A validação vale no navegador **e** no script de recebimento, com as mesmas regras (RN-11): um envio feito direto ao endereço de envio, sem passar pela página, com dado inválido não grava linha. |
| CA-19 | **Dado** o consentimento desmarcado, **quando** envia, **então** nada é gravado e aparece "É preciso aceitar a política de privacidade para enviar." O script também recusa envio sem consentimento. |
| CA-20 | **Dado** o campo honeypot preenchido, **quando** o envio chega ao script, **então** nada é gravado, nenhum e-mail sai e a resposta é idêntica à de um sucesso real com o mesmo nome (RN-06). |
| CA-21 | **Dado** um surto de envios (RN-07), **quando** chega mais um envio válido, **então** a linha é gravada com a marca "suspeito", o visitante vê sucesso normalmente, o aviso por lead é suspenso durante o surto e o dono recebe **um** e-mail de alerta de surto por janela. Nenhum envio válido é recusado por volume. *(Substitui o limite por IP da v0.2.)* |
| CA-22 | **Dado** o script indisponível, com erro, fora de cota, ou sem resposta em `[PREMISSA: 15 s]`, **quando** o visitante envia, **então** nada é perdido em silêncio: aparece mensagem de erro com o link de WhatsApp e o e-mail, legíveis; os dados digitados ficam no formulário; nenhum dado pessoal vai para o console do navegador. Se o resultado não puder ser confirmado (tempo esgotado), a mensagem não afirma que o envio falhou com certeza: pede para tentar de novo ou chamar no WhatsApp (o reenvio dentro da janela da RN-12 não duplica). |
| CA-23 | **Dado** o mesmo visitante, **quando** clica duas vezes (ou mais) em enviar, **então** é gravada uma única linha. |
| CA-24 | **Dado** o navegador com JavaScript desligado, **quando** o visitante chega ao formulário, **então** o comportamento segue a opção escolhida na PEND-16. Recomendada (opção A): o formulário não aparece e, no lugar dele, na mesma altura reservada, há o texto "Para enviar pelo formulário, ative o JavaScript, ou fale conosco:" com o link de WhatsApp e o e-mail. *(A v0.2 gravava sem JS via Server Action, que deixou de existir.)* |
| CA-34 | **Dado** o formulário em uso, **quando** o visitante tenta enviar, **então** a única requisição de rede com dados do formulário vai para o endereço de envio configurado (`NEXT_PUBLIC_*`), e não existe nenhuma rota de envio no próprio site. |

### 5.5 Aviso ao dono, planilha de leads, retenção e cópia de segurança

**HU-05** Como **dono da landing**, quero saber na hora que chegou um lead e consultar todos depois numa planilha, sem painel e sem servidor para manter.

| ID | Critério de aceite |
|---|---|
| CA-25 | **Dado** o e-mail de aviso configurado no script (PEND-15), **quando** um lead é gravado fora de surto, **então** o dono recebe um e-mail, enviado pela conta Google dona do script, com os dados do lead, data/hora (America/Sao_Paulo) e o link da planilha. |
| CA-26 | **Dado** falha no envio do e-mail (cota diária esgotada, erro do Google), **quando** um lead é gravado, **então** a linha continua gravada, o visitante vê sucesso normalmente e a falha fica no registro de execuções do script sem dados pessoais (RN-09). |
| ~~CA-27~~ | Removido na v0.3 (exportação CSV por comando). A consulta é a planilha (CA-35). |
| ~~CA-28~~ | Removido na v0.3 (exportação sem leads). |
| CA-35 | **Dado** leads gravados, **quando** o dono abre a planilha de leads, **então** vê um lead por linha, do mais antigo para o mais novo, com as colunas fixas da seção 8 na primeira linha (cabeçalho), horários em America/Sao_Paulo e acentos corretos. |
| CA-36 | **Dado** um campo de texto que começa com `=`, `+`, `-`, `@`, tabulação ou quebra de linha (ex.: nome `=HYPERLINK("http://exemplo.test";"x")`), **quando** é gravado, **então** a célula mostra exatamente o texto digitado e **não** é executado como fórmula (RN-14). |
| CA-37 | **Dado** o endereço de envio, **quando** alguém faz uma requisição de leitura (GET) ou qualquer envio, **então** a resposta nunca contém dados de outros leads nem da planilha; e a planilha **não** abre para quem não está na lista de acesso da PEND-14 (sem compartilhamento por link). |
| CA-38 | **Dado** o prazo de retenção definido na PEND-11, **quando** a rotina diária de retenção roda, **então** as linhas com data de recebimento mais antiga que o prazo são apagadas da planilha, e as cópias de segurança mais antigas que o prazo também são apagadas (RN-17). Até a PEND-11 ser respondida, a rotina fica desligada `[PREMISSA]`. |
| CA-39 | **Dado** a rotina de cópia de segurança, **quando** ela roda `[PREMISSA: semanal]`, **então** uma cópia da planilha fica numa pasta do Drive da conta dona, acessível só às mesmas pessoas da planilha, mantendo `[PREMISSA: as 4 últimas]`; a falha da rotina gera e-mail ao dono. |

### 5.6 Política de privacidade, SEO, contato e build

| ID | Critério de aceite |
|---|---|
| CA-29 | **Dado** a rota da política de privacidade, **quando** aberta, **então** informa: quem é o controlador e o contato (PEND-09); quais dados o formulário coleta e para quê; que os dados ficam numa planilha do **Google**, que atua como operador; que pode haver **transferência internacional** (servidores do Google fora do Brasil); por quanto tempo são guardados (PEND-11), inclusive nas cópias; que o e-mail de aviso passa pelo Gmail/Google; e como pedir acesso, correção ou exclusão. Texto do `lgpd-specialist`. A página não mostra nenhum texto provisório ("a ser informado") quando publicada. |
| CA-30 | **Dado** a página principal e a política, **quando** inspecionadas, **então** cada uma tem `title` e `description` próprios, URL canônica, Open Graph e Twitter Card próprios com imagem 1200×630, `lang="pt-BR"` e um único `h1`. |
| CA-31 | **Dado** a página principal, **quando** validada no Rich Results Test / validador do schema.org, **então** os JSON-LD `SoftwareApplication`, `Organization` e `FAQPage` não têm erros, e não contêm preço, avaliação nem nota (RN-03). |
| CA-32 | **Dado** o site publicado, **quando** acessados `/sitemap.xml` e `/robots.txt`, **então** o sitemap lista a página principal e a política, e o robots permite indexação e aponta o sitemap. |
| CA-33 | **Dado** o build de produção, **quando** alguma variável `NEXT_PUBLIC_*` de contato (WhatsApp, e-mail, URL do site) ou o endereço de envio está ausente ou com placeholder, **então** o build falha com mensagem clara; em desenvolvimento, o placeholder aparece **visivelmente marcado** (ex.: "[CONFIGURAR WHATSAPP]") e o envio mostra o estado de erro. O endereço de envio só é aceito se for do domínio do Apps Script do Google (`https://script.google.com/...`). |
| CA-40 | **Dado** o build de produção, **quando** termina, **então** gera somente arquivos estáticos (HTML, CSS, JS, imagens, `sitemap.xml`, `robots.txt`), e o site servido por um servidor de arquivos comum, sem Node em execução, passa em CA-01 a CA-33. |
| CA-41 | **Dado** o site publicado, **quando** inspecionados os cabeçalhos da página principal, **então** a hospedagem envia os cabeçalhos de segurança da RNF-11, e a política de conteúdo (CSP) permite conexão e envio de formulário só para o próprio site e os domínios do Google exigidos pelo script de recebimento. |

### 5.7 Mecanismo de gravação: Apps Script × Google Forms

O dono pediu para avaliar o Google Forms como alternativa mais simples. Avaliação de 2026-11-04 (comportamento de serviços do Google pode mudar; conferir na documentação oficial):

| Critério | Apps Script como aplicativo da web (recomendado) | Google Forms embutido (iframe) | Google Forms com formulário próprio enviando para o endereço de respostas do Forms |
|---|---|---|---|
| Código a manter | Um script pequeno, versionado no repositório | Nenhum | Nenhum no Google; formulário próprio no site |
| Visual, CLS e peso (RNF-02/04/05) | Formulário próprio, já pronto e medido | Visual do Google, iframe pesado, altura difícil de reservar; tende a reprovar CLS 0 e o teto de JS | Formulário próprio |
| Acessibilidade e mensagens em pt-BR por campo (CA-18) | Controladas pelo projeto | Do Google, fora do nosso controle | Controladas pelo projeto |
| Saber se gravou (CA-17, CA-22) | Sim, se a resposta do script puder ser lida pelo navegador (**verificar na T1**) | Sim, dentro do iframe | **Não**: o envio é "às cegas", não dá para distinguir sucesso de falha; reprova CA-22 |
| Validação no servidor, honeypot, deduplicação, proteção contra fórmula, marca de surto | Sim, no script | Só a validação do próprio Forms; sem honeypot | Só a validação do Forms; sem honeypot nem deduplicação |
| Versão da política e data/hora do consentimento | Gravadas pelo script | Data/hora da resposta; versão só como pergunta fixa | Versão como campo enviado, sem conferência |
| Estabilidade | Recurso documentado pelo Google | Recurso documentado | Endereço de respostas **não documentado** para esse uso; pode quebrar sem aviso |
| Aviso por e-mail | Pelo script (cota da conta) | Nativo do Forms (aviso de nova resposta) | Nativo do Forms |

**Recomendação:** Apps Script. O iframe do Forms derruba as metas que já foram atingidas (CLS 0, teto de JS, acessibilidade, mensagens por campo) e o envio direto ao Forms não confirma a gravação, o que reprova CA-22 ("nada perdido em silêncio"). O Forms só vale como plano B se a T1 provar que o navegador não consegue ler a resposta do Apps Script; nesse caso a decisão volta ao dono com esta tabela.

### 5.8 O que se perde ao tirar o backend, compensações e riscos aceitos

| # | O que existia (v0.2) | O que acontece agora | Compensação na v0.3 | Risco residual |
|---|---|---|---|---|
| 1 | Limite de 5 envios por IP a cada 10 min, persistido no MySQL | O script do Google **não recebe o IP nem os cabeçalhos** do visitante (o evento do `doPost` traz só o corpo e os parâmetros). Limite por IP deixa de existir. O endereço de envio é público. | Honeypot (RN-06), deduplicação (RN-12), marca de surto que suspende avisos (RN-07), trava de gravação. Opcional: desafio anti-robô verificado pelo script (PEND-17). | **RA-01**: um robô que ignore o honeypot pode encher a planilha de linhas falsas; o dono limpa manualmente. Nenhum lead real é recusado. |
| 2 | Verificação de origem do Next (envio de outro site recusado) | O script não vê a origem; qualquer site ou ferramenta pode enviar. | Validação completa no script (CA-18); marca de surto. | **RA-02**: envios forjados de fora da página são possíveis; viram lixo identificável, não vazamento. |
| 3 | Validação no servidor próprio (TypeScript) | Passa a ser a do script, em outra base de código. As regras existem em dois lugares. | Mesma tabela de casos de teste aplicada ao formulário e ao script (dev-tests). | Divergência entre as duas cópias das regras; mitigada pelos testes. |
| 4 | Corpo limitado a 32 KB e corte por campo | Sem controle do tamanho do corpo antes de chegar ao Google. | O script corta cada campo nos limites da RN-11 antes de gravar. | Baixo. |
| 5 | Gravação atômica e deduplicação por SQL | Planilha não tem transação. Execuções simultâneas podem disputar a última linha. | Trava de gravação do Apps Script (LockService) serializa as gravações; deduplicação conferida na própria planilha ou em cache (o cache do Apps Script dura no máximo 6 h e pode ser esvaziado antes; não serve como única fonte). | Deduplicação "melhor esforço": em caso raro, duas linhas iguais; aceitável (RN-12 já admite repetidos fora da janela). |
| 6 | Dados no servidor e banco escolhidos pelo dono | Dados na conta Google do dono; o Google é operador, possível transferência internacional. | Política (CA-29); recomendação de conta Google Workspace (PEND-13); acesso restrito à planilha (RN-15). | Decisão de LGPD com o `lgpd-specialist`; não é parecer jurídico. |
| 7 | Cabeçalhos de segurança (CSP, HSTS etc.) enviados pelo app | Site estático não envia cabeçalhos sozinho; quem envia é a hospedagem. | Requisito de hospedagem com cabeçalhos configuráveis (RNF-15, CA-41). | Se a hospedagem escolhida não permitir cabeçalhos, a CSP fica só por meta tag (sem `frame-ancestors` nem HSTS): **RA-03**, só com aceite do dono. |
| 8 | Envio sem JavaScript gravava o lead | Sem JS, o envio ao Google sairia do site para uma página do Google. | PEND-16 (recomendado: sem JS, mostrar WhatsApp e e-mail no lugar do formulário). | **RA-04**: quem navega sem JS não envia pelo formulário (usa WhatsApp/e-mail). |
| 9 | Resposta confiável da Server Action | A leitura da resposta pelo navegador depende do comportamento do Google (o conteúdo do script é servido por redirecionamento a `script.googleusercontent.com`). | **T1 (spike) verifica antes de qualquer remoção de código.** | Se a resposta não puder ser lida, CA-17 e CA-22 não são atendíveis com Apps Script e a decisão volta ao dono. |
| 10 | Logs do servidor próprio | Registro de execuções do Apps Script, visto no painel do Google pela conta dona. | Nada de dado pessoal nos registros (RNF-11). | Menor visibilidade de erros; alerta só por e-mail de falha das rotinas. |
| 11 | SMTP próprio com TLS obrigatório | E-mail sai pela conta Google dona do script. Cota: 100 destinatários/dia em conta pessoal, 1.500 em Workspace (documentação oficial, consultada em 2026-11-04). | Suficiente para RNF-09 (200 leads/mês). Surto suspende avisos (RN-07). | Se a cota estourar, os avisos param até o dia seguinte; os leads continuam gravados (CA-26). |
| 12 | Backup do banco (PEND-06) e CSV com permissão 600 | Planilha no Drive, com histórico de versões do Google; download da planilha cria arquivo local. | Cópia periódica (CA-39) e retenção que também limpa cópias (CA-38). | O histórico de versões do Google guarda conteúdo apagado; ver PEND-11 com o `lgpd-specialist`. Quem tem acesso de edição pode apagar ou baixar tudo (RN-15). |
| 13 | Hash do IP guardado 24 h | IP não é mais coletado. | — | Ganho de privacidade (um dado pessoal a menos). |

**Ganhos:** nenhum servidor, banco, contêiner, sal ou credencial SMTP para manter; custo de infraestrutura próximo de zero; superfície de ataque menor; hospedagem estática barata ou gratuita.

**Riscos aceitos do dono (precisam de aceite por escrito antes da publicação, PEND-18):** RA-01, RA-02, RA-04 e, se aplicável, RA-03.

## 6. Regras de negócio

| ID | Regra | Origem | Exceções |
|---|---|---|---|
| RN-01 | A página só descreve funcionalidades da coluna "Pode prometer" da seção 4. Itens condicionais só entram após PEND-04. | Orquestrador | Nenhuma |
| RN-02 | A página não oferece cadastro, login, teste grátis automático, SaaS nem preço. O próximo passo é sempre falar com o dono (formulário, WhatsApp ou e-mail). | Orquestrador | Preço só se PEND-03 decidir |
| RN-03 | Proibido depoimento, logo de cliente, número de clientes, avaliação, nota ou resultado ("venda 30% mais") sem fonte e autorização por escrito. | `[PREMISSA]` (honestidade e CDC) | Material fornecido e autorizado pelo dono |
| RN-04 | Demonstração segue a lógica do sistema: só lote disponível pode ser reservado; reservado e vendido não podem; o detalhe explica por quê. A demonstração não mostra "vendido" a partir de ação do visitante (no sistema, só admin confirma venda). | Produto (spec 004 RN2, RN4) | Bloqueado aparece na demo, como no sistema, e não abre (visão do vendedor); decisão de 2026-11-07 `[PREMISSA]` |
| RN-05 | Todos os dados da demonstração são fictícios (nomes de loteamento, quadras, preços) e rotulados como tal; nenhum dado de cliente real ou print com dados reais. | Orquestrador | — |
| RN-06 | Envio com honeypot preenchido é descartado **pelo script** sem aviso ao remetente (resposta idêntica à de sucesso). | Orquestrador | — |
| RN-07 | **Surto:** mais de `[PREMISSA: 20]` leads gravados em `[PREMISSA: 10 min]` (contagem global, sem IP). Durante o surto, os leads continuam sendo gravados, com a marca "suspeito"; o aviso por lead é suspenso e o dono recebe um único e-mail de alerta por janela. Nenhum envio válido é recusado por volume. *(Substitui o limite por IP.)* | Dono (sem backend) + `[PREMISSA]` nos números | — |
| RN-08 | Nº aproximado de lotes em faixas: `[PREMISSA: até 100 · 101 a 300 · 301 a 1.000 · mais de 1.000 · ainda não sei]`. | `[PREMISSA]` | — |
| RN-09 | O lead é gravado **antes** de qualquer aviso; falha de e-mail nunca descarta o lead nem muda a resposta ao visitante. | Orquestrador | — |
| RN-10 | Sem consentimento marcado não há gravação. O script grava a data/hora do consentimento com o próprio relógio (nunca o do navegador) e a versão da política informada pela página, **somente** se ela estiver na lista de versões aceitas do script; versão desconhecida é recusada como erro. | Orquestrador / LGPD | — |
| RN-11 | WhatsApp: número brasileiro com DDD (10 ou 11 dígitos, guardado só com dígitos). E-mail: formato válido. Nome obrigatório; empresa obrigatória, exceto para o perfil Gestor comercial (PEND-10, decidida); textos até `[PREMISSA: 120]` caracteres. Perfil e faixa só dos valores da lista. Regras idênticas no formulário e no script. | `[PREMISSA]` nos limites; PEND-10 pelo dono | — |
| RN-12 | Mesmo e-mail **e** mesmo WhatsApp dentro de `[PREMISSA: 2 min]` contam como o mesmo envio: não grava nova linha e responde sucesso. Fora dessa janela, repetidos são gravados de novo, cada um com sua data; o dono vê todos na planilha. *(Janela ampliada de 10 s para 2 min por causa do reenvio após tempo esgotado, CA-22.)* | `[PREMISSA]` | — |
| RN-13 | Horários exibidos ao dono (e-mail, planilha) em America/Sao_Paulo; o fuso do script e da planilha é configurado assim. | `[PREMISSA]` | — |
| RN-14 | Todo texto gravado na planilha que comece com `=`, `+`, `-`, `@`, tabulação ou quebra de linha é gravado como texto literal, nunca como fórmula. WhatsApp é gravado só com dígitos. | `dev-security` (injeção em planilha) | — |
| RN-15 | A planilha de leads e as cópias ficam na conta Google definida na PEND-13 e só as pessoas da PEND-14 têm acesso; nunca "qualquer pessoa com o link". O script roda com a identidade do dono e nunca devolve dados da planilha a quem envia. | Dono + `[PREMISSA]` | — |
| RN-16 | A landing não tem backend próprio. Toda lógica que precisa de servidor (validação final, deduplicação, gravação, aviso, retenção, cópia) fica no script de recebimento. | Dono (2026-11-04) | — |
| RN-17 | Retenção: leads mais antigos que o prazo da PEND-11 são apagados da planilha e das cópias. Pedido de exclusão do titular é atendido pelo dono apagando a linha (e as cópias que a contenham) `[PREMISSA]`. | Dono + `lgpd-specialist` | — |

## 7. Requisitos não funcionais

Medidos no **percentil 75**, celular, rede 4G (perfil "Slow 4G" do Lighthouse para laboratório; dados de campo do CrUX/PageSpeed quando houver tráfego).

| ID | Categoria | Requisito | Observação |
|---|---|---|---|
| RNF-01 | LCP | Meta ≤ 2,0 s; limite 2,5 s (página principal e política). | Limite = "bom" do Google |
| RNF-02 | CLS | Meta **0,00** em laboratório em todas as larguras (360, 768, 1280 px), inclusive durante carregamento de fontes, imagens, demonstração, CTA fixo e mensagens do formulário; limite de campo 0,05. | "Zero layout shift" do briefing; "bom" do Google é ≤ 0,1 |
| RNF-03 | INP | Meta ≤ 100 ms; limite 200 ms (clique em lote, FAQ, envio do formulário). A espera pela resposta do Google não conta como INP: o botão muda para "Enviando…" imediatamente. | |
| RNF-04 | Lighthouse | ≥ 95 em Desempenho, Acessibilidade, Boas práticas e SEO no celular. | `[PREMISSA]` |
| RNF-05 | Peso | JavaScript enviado na primeira carga ≤ **150 KB gzip -9**, sem o polyfill nomodule; **alerta em 160 KB** (confirmado pelo dono em 2026-11-04). Demonstração carregada sem atrasar o LCP. Nenhuma tela de carregamento de página inteira (splash) que esconda o conteúdo. | Carregamento "bem implementado" = estados locais com espaço reservado (CA-10, CA-17) |
| RNF-06 | Movimento | Animações suaves (sem travar a rolagem); com `prefers-reduced-motion`, animações não essenciais desligadas. | |
| RNF-07 | Acessibilidade | WCAG 2.2 nível AA: contraste, foco visível, navegação completa por teclado, status de lote não só por cor, rótulos em todos os campos, erros anunciados, alvos de toque ≥ 24×24 px (recomendado 44×44). Vale para todos os estados do formulário (sucesso, erro, sem JS). | |
| RNF-08 | Dispositivos | Funciona de 320 px a 1920 px; últimas 2 versões de Chrome, Safari (iOS), Edge, Firefox e Samsung Internet. | `[PREMISSA]` |
| RNF-09 | Volume e cotas | `[PREMISSA: até 200 leads/mês e 10 mil visitas/mês]`. Cotas do Apps Script (documentação oficial, consultada em 2026-11-04; podem mudar): 6 min por execução; 30 execuções simultâneas por usuário; e-mail: 100 destinatários/dia (conta pessoal) ou 1.500 (Workspace). | PEND-01; conferir as cotas na fonte oficial antes de publicar |
| RNF-10 | Disponibilidade e cópia | Site: disponibilidade da hospedagem estática (PEND-06). Envio: depende do Google, sem meta própria; falha cai em CA-22. Cópia da planilha: RPO `[PREMISSA: 7 dias]` pela cópia semanal (CA-39), além do histórico de versões do Google. | `dev-infra` / `dev-integrations` |
| RNF-11 | Segurança | HTTPS obrigatório (site e endereço de envio). Validação completa no script. Nenhum dado pessoal em registros (console do navegador, registro de execuções do script). Nenhum segredo no site: só valores públicos em `NEXT_PUBLIC_*`; segredos do script (se houver, PEND-17) só nas propriedades do script. Cabeçalhos pela hospedagem: CSP (`connect-src` e `form-action` restritos ao site e aos domínios do Google necessários), HSTS (começar curto, sem `includeSubDomains`, até conferir os subdomínios), `nosniff`, `frame-ancestors 'none'`/`X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`. | `dev-security` |
| RNF-12 | Idioma/fuso | pt-BR; America/Sao_Paulo. | |
| ~~RNF-13~~ | ~~Banco~~ | Removido na v0.3: sem banco. Armazenamento = planilha do Google (RN-16). | |
| RNF-14 | Tempo do envio | Do clique em enviar até a mensagem de sucesso: meta ≤ `[PREMISSA: 3 s]` p75; tempo esgotado em `[PREMISSA: 15 s]` (CA-22). | Apps Script pode demorar na primeira execução após inatividade; medir na T1 |
| RNF-15 | Hospedagem estática | Serve arquivos estáticos por HTTPS com domínio próprio, permite configurar cabeçalhos de resposta (RNF-11) e redirecionamentos, e publica a partir do build do repositório. | PEND-06; `dev-infra` |

## 8. Dados pessoais

| Dado | Categoria | Finalidade | Quem acessa | Onde fica | Retenção |
|---|---|---|---|---|---|
| Nome, WhatsApp, e-mail, empresa, perfil, faixa de lotes | Pessoal (contato profissional) | Retornar o contato comercial | Pessoas da PEND-14; Google como operador | Planilha de leads, cópias (CA-39), e-mail de aviso, histórico de versões do Google | `[PENDENTE: PEND-11]` |
| Data/hora do recebimento e do consentimento, versão da política | Pessoal | Prova do consentimento | Idem | Idem | Igual ao lead |
| Marca "suspeito" | Controle | Separar envios de surto | Idem | Planilha | Igual ao lead |
| IP do remetente | — | **Não coletado** na v0.3 | — | — | — |

Colunas da planilha (estrutura, sem dados reais): data/hora do recebimento · nome · WhatsApp · e-mail · empresa · perfil · faixa de lotes · data/hora do consentimento · versão da política · suspeito (sim/não).

Sinalizações ao `lgpd-specialist`: base legal (consentimento × legítimo interesse); Google como operador e transferência internacional (conferir se a conta pessoal Gmail oferece termo de tratamento de dados equivalente ao do Google Workspace; hipótese não verificada, decidir com a PEND-13); texto da política e do aviso do formulário; retenção na planilha, nas cópias, no histórico de versões e na caixa de e-mail do dono; arquivos baixados da planilha; atendimento ao pedido de exclusão (RN-17). Ao `dev-security`: injeção de fórmula (RN-14), endereço de envio público, ausência de limite por IP (RA-01/02), permissões do script e da planilha (RN-15), cabeçalhos na hospedagem (CA-41).

## 9. Perguntas em aberto

| ID | Pergunta | Quem responde | Bloqueia |
|---|---|---|---|
| PEND-01 | Quantos leads por mês você espera e qual meta de conversão? | Dono | Indicadores, RNF-09, números da RN-07 |
| PEND-02 | Quer medir visitas e conversão (Google Analytics, Plausible, pixel)? Se sim, entra banner de cookies e custo de desempenho. | Dono | Escopo, LGPD, RNF-05 |
| PEND-03 | A página fala de preço ou de forma de cobrança (implantação + mensalidade, licença única, "sob consulta")? | Dono | FAQ, RN-02, JSON-LD |
| PEND-04 | As funções da coluna "Condicional" podem ser anunciadas já? Hoje estão sem QA final ou não existem no link público. | Dono | RN-01, CA-13 |
| PEND-05 | Há logo, cores e prints do sistema com dados fictícios para usar? | Dono / `dev-uiux` | Identidade visual, Open Graph |
| PEND-06 | Em qual domínio e em qual hospedagem estática a landing fica? Ela precisa permitir cabeçalhos de segurança (RNF-15). | Dono / `dev-infra` | Deploy, CA-32, CA-41, RA-03 |
| PEND-07 | O que dizer sobre implantação: prazo típico, quem configura a hospedagem do cliente, suporte e atualizações? | Dono | FAQ, textos |
| ~~PEND-08~~ | Obsoleta na v0.3 (não há mais exportação; filtro por data é feito na própria planilha). | — | — |
| PEND-09 | Quem é o controlador dos dados (nome/razão social, CNPJ, e-mail de contato do titular)? | Dono | CA-29, publicação |
| PEND-10 | ~~"Empresa" é obrigatória para todos os perfis?~~ Decidido: opcional só para Gestor comercial. | Dono | — |
| PEND-11 | Por quanto tempo guardar leads que não viraram cliente (planilha, cópias e e-mails de aviso)? | Dono + `lgpd-specialist` | CA-38, seção 8, publicação |
| PEND-12 | Stack: Next.js App Router com **exportação estática**, TypeScript estrito, yarn, sem banco e sem Docker. Confirmar. | Dono / `dev-arquitetura` | Plano |
| PEND-13 | Qual conta Google é dona da planilha e do script: conta pessoal (Gmail) ou conta Google Workspace da empresa? (Recomendação: Workspace, por cota de e-mail maior e termos de tratamento de dados; confirmar com o `lgpd-specialist`.) A conta precisa de verificação em duas etapas. | Dono | T2, CA-25, CA-29, RNF-09 |
| PEND-14 | Quem, além de você, pode ver a planilha de leads? Só leitura ou edição? | Dono | RN-15, CA-37 |
| PEND-15 | Para qual e-mail vai o aviso de lead novo? (Sai da conta Google dona do script.) | Dono | CA-25 |
| PEND-16 | Sem JavaScript: (A) esconder o formulário e mostrar WhatsApp e e-mail no lugar (recomendado); ou (B) enviar mesmo assim e mostrar a confirmação numa página do Google, fora do site, com um link de volta. | Dono | CA-24 |
| PEND-17 | Quer um desafio anti-robô (ex.: Cloudflare Turnstile) verificado pelo script? Reduz spam (RA-01), mas acrescenta script de terceiro (peso, CSP, LGPD) e um segredo nas propriedades do script. Recomendação: começar sem e ligar só se houver spam. | Dono | RA-01, RNF-05 |
| PEND-18 | Você aceita por escrito os riscos RA-01, RA-02, RA-04 (e RA-03, se a hospedagem não permitir cabeçalhos)? | Dono | Publicação |

## 10. Plano (fase única, arquitetura estática v0.3)

Ordem: T1 é o portão. Nenhuma remoção de código antes de a T1 confirmar que o navegador lê a resposta do script (seção 5.8, item 9).

| # | Tarefa | Agente | CA / RN | Depende de | Tam. |
|---|---|---|---|---|---|
| T1 | **Prova de conceito (spike)**: script mínimo numa planilha de teste com dados fictícios; envio a partir de uma página estática local; confirmar (a) que o navegador lê a resposta (sucesso/inválido/erro), (b) tempo de resposta frio e quente (RNF-14), (c) trava de gravação com 10 envios simultâneos (CA-23), (d) gravação de texto que começa com `=` (CA-36), (e) domínios que a CSP precisa liberar (CA-41). Resultado registrado no ADR-0001. | dev-integrations | CA-17, 22, 23, 36, 41; RNF-14 | — | P |
| T2 | Aceite do ADR-0001 e da stack estática (PEND-12); revisar o perfil "Agentes deste projeto" do `CLAUDE.md` (entra `dev-integrations` e `dev-infra`; sai `dev-database`) | dev-arquitetura (+ dono) | — | T1 | P |
| T3 | **Remover o backend do projeto**: Server Action (`app/actions.ts`), `lib/db.ts`, envio/limite/IP/aviso do servidor em `lib/leads/*` (manter só a validação usada pelo formulário), `migrations/`, `docker-compose.yml`, `scripts/migrate.ts` e `scripts/export-leads.ts` (e o gerador de CSV), testes de integração (`tests/integration/`, `vitest.integration.config.ts`) e testes unitários do que sair (limite por IP, IP do cliente, TLS do SMTP, envio, CSV, travas de `RATE_LIMIT_SALT`/`CLIENT_IP_HEADER` no `next.config`); dependências `mysql2` e `nodemailer` (e outras que só os scripts usavam); scripts `migrate`, `leads:export`, `test:integration` do `package.json`; variáveis `DB_*`, `SMTP_*`, `LEAD_NOTIFY_TO`, `RATE_LIMIT_SALT`, `CLIENT_IP_HEADER` do `.env.example` | dev-react | RN-16, CA-34 | T2 | M |
| T4 | Build estático: exportação estática do Next, conferindo que OG, ícone, sitemap e robots continuam gerados (CA-30, 32) | dev-react | CA-40 | T3 | P |
| T5 | Script de recebimento versionado no repositório (pasta própria, ex.: `apps-script/`): validação RN-11, honeypot RN-06, versão aceita RN-10, trava + deduplicação RN-12, surto RN-07, proteção contra fórmula RN-14, gravação, aviso por e-mail RN-09, rotinas de retenção (CA-38) e cópia (CA-39); procedimento de publicação e de troca de versão mantendo o mesmo endereço; ficha em `docs/integracoes/` | dev-integrations | CA-17..21, 23, 25, 26, 35..39 | T1, PEND-13/15 | M |
| T6 | Cliente do formulário: envio ao endereço `NEXT_PUBLIC_*` (nome sugerido `NEXT_PUBLIC_LEADS_ENDPOINT`), tempo esgotado, estados sucesso/inválido/erro (o estado "limite" sai), sem JS conforme PEND-16, falha do build sem o endereço (CA-33) | dev-react | CA-16..24, 33, 34 | T3, T5 | M |
| T7 | Ajuste de textos: mensagem de erro/tempo esgotado (CA-22), texto sem JS (CA-24), remoção da mensagem de "limite" | copywriter | CA-22, 24 | T6 | P |
| T8 | Política de privacidade (Google operador, transferência internacional, retenção nas cópias e no histórico) e texto de consentimento; subir a versão da política no site **e** na lista de versões aceitas do script | lgpd-specialist | CA-29, RN-10, RN-17 | PEND-09/11/13 | P |
| T9 | Testes: mesma tabela de casos de validação para o formulário e o script; estados do formulário (incl. faixa mantida e contraste); proteção contra fórmula; deduplicação; build falha sem endereço | dev-tests | CA-16..24, 33, 36 | T5, T6 | M |
| T10 | Hospedagem estática, domínio, cabeçalhos de segurança (CSP com domínios do Google da T1, HSTS curto) e `noindex` fora de produção | dev-infra / dev-devops | CA-40, 41; RNF-11, 15 | T4, PEND-06 | M |
| T11 | Pipeline: build estático + publicação (sem imagem Docker, sem serviço MySQL no CI) | dev-devops | CA-40 | T4, T10 | P |
| T12 | Reauditoria: endereço público, RN-14, permissões do script e da planilha, CSP na hospedagem, riscos RA-01..04 | dev-security | CA-20, 36, 37, 41 | T5, T6, T10 | P |
| T13 | Medição CWV e peso de JS após a troca (RNF-05 confirmado: 150 KB, alerta 160) | dev-performance-seo | RNF-01..05, 14 | T6 | P |
| T14 | Revisão das mudanças | dev-reviewer | todos | T3..T9 | P |
| T15 | Aceite no navegador (360/768/1280, teclado, leitor de tela, sem JS, Google fora do ar) e reverificação dos BUG-01..06 que sobrevivem | dev-qa | todos | T6..T13 | M |
| T16 | README, CLAUDE.md e runbook (publicar o script, trocar o endereço, restaurar cópia, atender pedido de exclusão) | docs-handoff | — | T5, T10 | P |

Itens do `TODO.md` que ficam obsoletos com a v0.3 (backend removido): A-01, A-02, A-03, A-04, A-05, A-09, A-10, A-11, AC-1 (deadlock), PEND-08, "Trocar ... no `.env` de produção" passa a valer só para `NEXT_PUBLIC_*`, e a pendência de RNF-05 (confirmada). A-06 e A-07 mudam de dono (cabeçalhos passam à hospedagem, T10).

## 11. Histórico de alterações

| Versão | Data | Alteração | Tipo | Seções | Aprovado por |
|---|---|---|---|---|---|
| 0.1 | 2026-11-04 | Rascunho inicial | — | todas | — |
| 0.2 | 2026-11-04 | RNF-05: teto de JS de 120 KB para 150 KB gzip, com base em medição (React DOM 71,6 KB + cliente do Next 46,2 KB + runtime/rotas 21,5 KB = ~135 KB de framework; código da página ~12 KB). | Revisão de premissa | 7 (RNF-05) | Dono, 2026-11-04 (confirmado na v0.3) |
| 0.3 | 2026-11-04 | (1) RNF-05 confirmado: 150 KB gzip, alerta 160 KB. (2) PEND-10 registrada como decidida em CA-16/RN-11. (3) **Remoção do backend**: sem MySQL, Server Action, Docker, SMTP próprio e limite por IP; site estático; leads gravados em planilha do Google por Apps Script (ADR-0001). Reescritos: objetivo, glossário, escopo, CA-09, 17..26, 29, 32, 33, RN-06, 07, 10..15, RNF-03, 07, 09..11; removidos CA-27, 28, RNF-13, PEND-08; novos CA-34..41, RN-14..17, RNF-14, 15, PEND-13..18, seções 5.7 e 5.8 (riscos RA-01..04); seção 8 sem IP; plano refeito. | Mudança de escopo (arquitetura) | 1, 2, 3, 5, 6, 7, 8, 9, 10 | Dono (decisão de remover o backend, 2026-11-04); spec segue rascunho |
