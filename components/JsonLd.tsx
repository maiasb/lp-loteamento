import { FAQ, SEO } from '@/lib/content';
import { SITE_URL, email } from '@/lib/contact';

/** JSON-LD (CA-31): sem preço, avaliação ou nota. Dados próprios; `<` escapado por segurança. */
export function JsonLd() {
  const data = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Loteamento Inteligente',
      description: SEO.softwareDescription,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: SITE_URL,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Loteamento Inteligente',
      url: SITE_URL,
      ...(email ? { email } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.items.map((i) => ({
        '@type': 'Question',
        name: i.q,
        acceptedAnswer: { '@type': 'Answer', text: i.a },
      })),
    },
  ];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
