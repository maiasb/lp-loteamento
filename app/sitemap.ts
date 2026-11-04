import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/contact';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/politica-de-privacidade`, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
