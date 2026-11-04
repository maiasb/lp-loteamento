import type { Metadata } from 'next';
import { Faq } from '@/components/Faq';
import { HeroArt } from '@/components/HeroArt';
import { Icon } from '@/components/Icon';
import { JsonLd } from '@/components/JsonLd';
import { LeadForm } from '@/components/LeadForm';
import { LotDemo } from '@/components/LotDemo';
import { Footer, Header } from '@/components/SiteChrome';
import { StickyCta } from '@/components/StickyCta';
import { emailDisplay, emailHref, whatsappDisplay, whatsappHref } from '@/lib/contact';
import { BENEFITS, CONTACT, DEMO, FAQ, FEATURES, HERO, SEO } from '@/lib/content';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: { absolute: SEO.title },
  alternates: { canonical: '/' },
  openGraph: { url: '/' },
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="conteudo" tabIndex={-1}>
        <section className={`on-dark grid-bg ${styles.hero}`} aria-labelledby="hero-title">
          <div className={`container ${styles.heroInner}`}>
            <div className={styles.heroText}>
              <p className={styles.pill}>{HERO.eyebrow}</p>
              <h1 id="hero-title">{HERO.title}</h1>
              <p className={styles.lead}>{HERO.lead}</p>
              <div className={styles.heroActions}>
                <a href="#contato" className="btn btn-lg btn-primary">
                  {HERO.cta}
                </a>
                <p className={styles.small}>{HERO.ctaNote}</p>
                <a href="#demonstracao" className="link">
                  {HERO.secondary}
                </a>
                <p className={styles.small}>{HERO.secondaryNote}</p>
                <a href={whatsappHref} className="link">
                  Chamar no WhatsApp
                </a>
              </div>
            </div>
            <HeroArt />
          </div>
        </section>

        <section
          id="demonstracao"
          className={`${styles.section} grid-bg-light`}
          aria-labelledby="demo-title"
        >
          <div className="container">
            <div className={`${styles.head} ${styles.reveal}`}>
              <p className="eyebrow">01 · Demonstração</p>
              <h2 id="demo-title">{DEMO.title}</h2>
              <p className={styles.lead}>{DEMO.lead}</p>
              <ol className={styles.steps}>
                {DEMO.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <p className={styles.small}>{DEMO.disclaimer}</p>
              <p className={styles.small}>{DEMO.keyboard}</p>
            </div>
            <LotDemo>
              <div className={styles.demoCta}>
                <a href="#contato" className="btn btn-lg btn-primary">
                  {DEMO.cta}
                </a>
                <p className={styles.small}>{DEMO.ctaNote}</p>
                <a href={whatsappHref} className="link">
                  Chamar no WhatsApp
                </a>
              </div>
            </LotDemo>
          </div>
        </section>

        <section
          id="funcionalidades"
          className={`${styles.section} ${styles.white}`}
          aria-labelledby="feat-title"
        >
          <div className="container">
            <div className={`${styles.head} ${styles.reveal}`}>
              <p className="eyebrow">02 · Funcionalidades</p>
              <h2 id="feat-title">{FEATURES.title}</h2>
              <p className={styles.lead}>{FEATURES.lead}</p>
            </div>
            <div className={styles.cards3}>
              {FEATURES.profiles.map((p) => (
                <article key={p.name} className={`${styles.card} ${styles.reveal}`}>
                  <span className={styles.iconBox}>
                    <Icon name={p.icon} size={24} />
                  </span>
                  <p className="eyebrow">{p.name}</p>
                  <h3>{p.title}</h3>
                  <ul className={styles.checks}>
                    {p.items.map((it) => (
                      <li key={it}>
                        <Icon name="check" size={16} />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <p className={styles.sectionCta}>
              <a href="#contato" className="link">
                {FEATURES.cta}
              </a>
            </p>
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.mist}`}
          aria-labelledby="ben-title"
        >
          <div className="container">
            <div className={`${styles.head} ${styles.reveal}`}>
              <p className="eyebrow">03 · Benefícios</p>
              <h2 id="ben-title">{BENEFITS.title}</h2>
            </div>
            <div className={styles.cards2}>
              {BENEFITS.items.map((b) => (
                <article key={b.title} className={`${styles.card} ${styles.reveal}`}>
                  <span className={styles.iconBox}>
                    <Icon name={b.icon} size={24} />
                  </span>
                  <h3>{b.title}</h3>
                  <p>{b.text}</p>
                  <p className={styles.from}>Vem de: {b.from}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="perguntas"
          className={`${styles.section} grid-bg-light`}
          aria-labelledby="faq-title"
        >
          <div className={`container ${styles.faqGrid}`}>
            <div className={`${styles.head} ${styles.faqHead} ${styles.reveal}`}>
              <p className="eyebrow">04 · Perguntas</p>
              <h2 id="faq-title">{FAQ.title}</h2>
              <p className={styles.lead}>Ainda ficou alguma dúvida? Chame a gente.</p>
              <a href={whatsappHref} className="link">
                Chamar no WhatsApp
              </a>
            </div>
            <Faq />
          </div>
        </section>

        <section
          id="contato"
          className={`on-dark grid-bg ${styles.section} ${styles.contact}`}
          aria-labelledby="contact-title"
        >
          <div className={`container ${styles.contactGrid}`}>
            <div className={styles.contactText}>
              <p className="eyebrow">05 · Contato</p>
              <h2 id="contact-title">{CONTACT.title}</h2>
              <p className={styles.lead}>{CONTACT.lead}</p>
              <ol className={styles.steps3}>
                {CONTACT.steps.map((s) => (
                  <li key={s.t}>
                    <strong>{s.t}</strong> {s.d}
                  </li>
                ))}
              </ol>
              <div className={styles.direct}>
                <p>{CONTACT.direct}</p>
                <a href={whatsappHref} className="link">
                  {CONTACT.whatsapp} · {whatsappDisplay}
                </a>
                <a href={emailHref} className="link">
                  {emailDisplay}
                </a>
              </div>
            </div>
            <LeadForm />
          </div>
        </section>
      </main>
      <Footer />
      <StickyCta />
      <JsonLd />
    </>
  );
}
