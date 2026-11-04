import Link from 'next/link';
import { NAV_LINKS, FOOTER, FOOTER_LINKS } from '@/lib/content';
import { email, emailDisplay, emailHref, whatsappDisplay, whatsappHref } from '@/lib/contact';
import { Glyph, Wordmark } from './Wordmark';
import styles from './SiteChrome.module.css';

export function Header({ home = true }: { home?: boolean }) {
  return (
    <header className={`on-dark ${styles.header}`}>
      <div className={`container ${styles.headerInner}`}>
        <Wordmark />
        {home ? (
          <nav aria-label="Principal" className={styles.nav}>
            <ul>
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
            <a
              href="#contato"
              className="btn btn-md btn-primary"
              aria-label="Falar com a gente: ir para o formulário de contato"
            >
              Falar com a gente
            </a>
          </nav>
        ) : (
          <nav aria-label="Principal" className={styles.nav}>
            <Link href="/" className="btn btn-md btn-outline">
              Voltar ao início
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className={`on-dark ${styles.footer}`}>
      <div className={`container ${styles.footerInner}`}>
        <div>
          <div className={styles.footBrand}>
            <Glyph size={28} />
            <span>Loteamento Inteligente</span>
          </div>
          <p className={styles.muted}>{FOOTER.description}</p>
        </div>
        <div>
          <h2 className={styles.footTitle}>Contato</h2>
          <ul>
            <li>
              <a href={whatsappHref} className={styles.footLink}>
                WhatsApp {whatsappDisplay}
              </a>
            </li>
            <li>
              <a href={emailHref} className={styles.footLink}>
                {email ? email : emailDisplay}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className={styles.footTitle}>Páginas</h2>
          <ul>
            {FOOTER_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className={styles.footLink}>
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/politica-de-privacidade" prefetch={false} className={styles.footLink}>
                Política de Privacidade
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className={`container ${styles.legal}`}>
        <p>© {new Date().getFullYear()} Loteamento Inteligente</p>
        <p>{FOOTER.fictional}</p>
      </div>
    </footer>
  );
}
