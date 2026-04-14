import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gezma.ezyindustries.my.id';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/berita/',
          '/agency/',
          '/verify/',
          '/help',
          '/share/',
        ],
        disallow: [
          '/dashboard/',
          '/api/',
          '/command-center/',
          '/pilgrim/',
          '/settings/',
          '/pilgrims/',
          '/packages/',
          '/trips/',
          '/reports/',
          '/activities/',
          '/notifications/',
          '/tasks/',
          '/gamification/',
          '/blockchain/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
