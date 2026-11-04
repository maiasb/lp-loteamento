import type { Metadata } from 'next';
import { Footer, Header } from '@/components/SiteChrome';
import { emailDisplay, emailHref } from '@/lib/contact';
import { SEO } from '@/lib/content';
import { POLICY_UPDATED, POLICY_VERSION } from '@/lib/policy';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: { absolute: `${SEO.privacyTitle} | Loteamento Inteligente` },
  description: SEO.privacyDescription,
  alternates: { canonical: '/politica-de-privacidade' },
  // O openGraph/twitter da página substitui o do layout (não mescla): título, descrição e imagem próprios.
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Loteamento Inteligente',
    url: '/politica-de-privacidade',
    title: `${SEO.privacyTitle} | Loteamento Inteligente`,
    description: SEO.privacyDescription,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: SEO.ogAlt }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SEO.privacyTitle} | Loteamento Inteligente`,
    description: SEO.privacyDescription,
    images: [{ url: '/twitter-image', width: 1200, height: 630, alt: SEO.ogAlt }],
  },
};

// TEXTO PROVISÓRIO: precisa de revisão do lgpd-specialist (Google como operador, transferência
// internacional, retenção na planilha/cópias/histórico) e dos dados do controlador (PEND-09) e da
// retenção (PEND-11) antes de publicar (BUG-07). Ver TODO.md.
export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <Header home={false} />
      <main id="conteudo" tabIndex={-1} className={styles.main}>
        <article className={styles.article}>
          <h1>Política de Privacidade</h1>
          <p className={styles.version}>
            Versão {POLICY_VERSION} · atualizada em {POLICY_UPDATED}
          </p>

          <h2>Quem é o responsável</h2>
          <p>
            O controlador dos dados é o titular do Loteamento Inteligente (nome ou razão social e
            CNPJ a serem informados). Para falar sobre seus dados, escreva para{' '}
            <a href={emailHref}>{emailDisplay}</a>.
          </p>

          <h2>Quais dados coletamos</h2>
          <p>Pelo formulário de contato, coletamos os dados que você informa:</p>
          <ul>
            <li>nome, WhatsApp, e-mail e empresa;</li>
            <li>seu perfil (loteadora/incorporadora, imobiliária ou gestor comercial);</li>
            <li>a faixa aproximada de lotes;</li>
            <li>
              a data, a hora e a versão desta política no momento em que você deu o consentimento.
            </li>
          </ul>
          <p>
            Não coletamos o seu endereço IP. A página não usa cookies de publicidade nem ferramentas
            de análise de visitas.
          </p>

          <h2>Para que usamos</h2>
          <p>
            Usamos os dados apenas para responder ao seu contato e conversar sobre o Loteamento
            Inteligente. Não vendemos seus dados nem os usamos para outra finalidade sem novo
            consentimento.
          </p>

          <h2>Base legal</h2>
          <p>
            Seu consentimento, que você dá ao marcar a caixa do formulário e pode retirar quando
            quiser.
          </p>

          <h2>Com quem compartilhamos</h2>
          <p>
            Os dados enviados pelo formulário ficam numa planilha do Google (Google Sheets), gravada
            por um script do Google Apps Script. O Google atua como operador, tratando os dados em
            nosso nome, e o aviso à equipe de que chegou um contato passa pelo Gmail. Os servidores
            do Google podem ficar fora do Brasil, o que pode envolver transferência internacional
            de dados. Também podem tratar os dados prestadores que operam a página, como a
            hospedagem.
          </p>

          <h2>Por quanto tempo guardamos</h2>
          <p>
            Guardamos seus dados pelo tempo necessário para o contato comercial. O prazo definitivo
            será informado aqui.
          </p>

          <h2>Seus direitos</h2>
          <p>
            Você pode pedir acesso, correção, anonimização ou exclusão dos seus dados, retirar o
            consentimento e pedir informações sobre o tratamento (LGPD, Lei 13.709/2018). Escreva
            para <a href={emailHref}>{emailDisplay}</a>.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
