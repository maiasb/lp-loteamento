import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Geist } from 'next/font/google';
import { SITE_URL } from '@/lib/contact';
import { SEO } from '@/lib/content';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: '700', // só o 700 é usado (títulos): evita baixar a fonte variável inteira
  variable: '--font-bricolage',
  display: 'swap',
});
const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SEO.title, template: '%s | Loteamento Inteligente' },
  description: SEO.description,
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Loteamento Inteligente',
    title: 'Loteamento Inteligente',
    description: SEO.ogDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loteamento Inteligente',
    description: SEO.ogDescription,
  },
};

export const viewport: Viewport = {
  themeColor: '#0B1B2B',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bricolage.variable} ${geist.variable}`}>
      <body>
        <a href="#conteudo" className="skip-link">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
