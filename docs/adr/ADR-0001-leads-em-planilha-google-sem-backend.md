# ADR-0001: Landing sem backend próprio; leads gravados em planilha do Google por Apps Script

| Campo | Valor |
|---|---|
| Status | Aceito em parte: "sem backend, leads em Google Sheets" (decisão do dono, 2026-11-04). Mecanismo "Apps Script como aplicativo da web": **Proposto**, depende da T1 |
| Data | 2026-11-04 |
| Decisores | Dono do produto (desenvolvedor) |
| Projeto / spec | `docs/specs/001-landing-page.md` v0.3 · seções 5.7, 5.8 · RN-07, RN-12, RN-14..16 · CA-17, 22, 24, 34..41 |

## Contexto
A v0.2 gravava leads num MySQL próprio via Server Action, com limite por IP, SMTP próprio, Docker e exportação CSV. O dono quer evitar **qualquer backend próprio** na landing (nada de servidor, banco, contêiner ou credencial para manter) e consultar os leads numa planilha do Google. Volume esperado baixo (premissa: 200 leads/mês). Metas de CLS 0, teto de 150 KB de JS e WCAG AA já atingidas com o formulário próprio precisam ser mantidas. O envio precisa confirmar a gravação ("nada perdido em silêncio", CA-22).

## Opções consideradas

| Opção | Prós | Contras | Custo |
|---|---|---|---|
| A. Apps Script publicado como aplicativo da web, vinculado à planilha | Mantém o formulário próprio; validação, honeypot, deduplicação, proteção contra fórmula e aviso no script; recurso documentado | Sem IP nem cabeçalhos no script (sem limite por IP); leitura da resposta pelo navegador a confirmar (T1); regras de validação em dois lugares; cotas do Google | Implementação P/M; mensal ~zero |
| B. Google Forms embutido (iframe) | Zero código; aviso de resposta nativo | Visual e acessibilidade do Google; iframe pesado, tende a reprovar CLS 0 e o teto de JS; sem honeypot | Zero |
| C. Formulário próprio enviando ao endereço de respostas do Forms | Zero código no Google | Envio às cegas (não confirma gravação, reprova CA-22); endereço não documentado para esse uso; sem deduplicação nem honeypot | Zero |
| D. Manter backend (v0.2) | Limite por IP, controle total | Contraria a decisão do dono | Servidor + banco |

> Cotas e comportamento do Google consultados em 2026-11-04 na documentação oficial do Apps Script (cotas, aplicativos da web, Content Service, Cache Service); conferir antes de publicar.

## Decisão
Sem backend próprio e leads em Google Sheets (decisão do dono). Mecanismo recomendado: **opção A**, porque é a única que mantém as metas já atingidas (CLS, JS, acessibilidade) e confirma a gravação ao visitante. Se a T1 mostrar que o navegador não consegue ler a resposta do script, a decisão volta ao dono com B e C (ambas com perdas descritas na spec 5.7).

## Consequências
**Positivas:** nada de servidor, banco, Docker, sal ou SMTP; site estático barato; um dado pessoal a menos (IP).
**Negativas / custos aceitos:** fim do limite por IP e da verificação de origem (RA-01, RA-02); sem envio sem JavaScript (RA-04, se PEND-16 = A); cabeçalhos de segurança dependem da hospedagem (RA-03 se ela não permitir); dados no Google como operador, com possível transferência internacional; deduplicação "melhor esforço".
**Riscos e mitigação:** spam por envio direto ao endereço público (honeypot, marca de surto, desafio anti-robô opcional, PEND-17); injeção de fórmula (RN-14); divergência de validação (mesma tabela de testes); cota de e-mail (surto suspende avisos; leads continuam gravados).
**Impacto em outros agentes:** dev-integrations (script, T1, T5), dev-react (remoção do backend, build estático, cliente do formulário), dev-infra/dev-devops (hospedagem estática e cabeçalhos), dev-security (reauditoria), lgpd-specialist (política, operador, retenção), dev-tests, dev-database deixa o projeto.

## Quando revisitar
Spam recorrente na planilha; volume acima de ~1.000 leads/mês ou de 100 e-mails/dia; mudança de cota ou comportamento do Apps Script; exigência de dados no Brasil; integração com CRM.

## Referências
- Google Apps Script: Quotas for Google Services (developers.google.com/apps-script/guides/services/quotas)
- Google Apps Script: Web Apps (developers.google.com/apps-script/guides/web)
- Google Apps Script: Content Service (developers.google.com/apps-script/guides/content)
- Google Apps Script: Class Cache (developers.google.com/apps-script/reference/cache/cache)
