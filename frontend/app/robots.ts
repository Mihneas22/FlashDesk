import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard/',
        '/public-decks/',
        '/privacy/',
        '/pricing/',
        '/user/',
        '/test/',
        '/admin/',
        '/login/',
        '/register/'
      ],
    },
    sitemap: 'https://learnqhub.com/sitemap.xml',
  };
}