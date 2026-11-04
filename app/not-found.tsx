import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer, Header } from '@/components/SiteChrome';
import { NOT_FOUND } from '@/lib/content';
import styles from './politica-de-privacidade/page.module.css';

export const metadata: Metadata = { title: NOT_FOUND.title };

export default function NotFound() {
  return (
    <div className={styles.page}>
      <Header home={false} />
      <main id="conteudo" tabIndex={-1} className={styles.main}>
        <article className={styles.article}>
          <h1>{NOT_FOUND.title}</h1>
          <p>{NOT_FOUND.text}</p>
          <p>
            <Link href="/" className="btn btn-md btn-primary">
              {NOT_FOUND.cta}
            </Link>
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
