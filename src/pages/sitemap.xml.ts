import type { APIRoute } from 'astro';

const SITE_URL = 'https://vernon-actualites.fr';
const WORDPRESS_URL = 'https://vernon-actualites.fr';

/**
 * Récupère tous les posts WordPress (jusqu’à 100 pour commencer).
 * On pourra améliorer plus tard si besoin.
 */
async function fetchAllPosts() {
  const res = await fetch(
    `${WORDPRESS_URL}/wp-json/wp/v2/posts?per_page=100&_fields=slug,modified`
  );

  if (!res.ok) {
    console.error('Erreur lors de la récupération des posts pour le sitemap :', res.status);
    return [];
  }

  return (await res.json()) as Array<{ slug: string; modified: string }>;
}

export const GET: APIRoute = async () => {
  // Pages fixes du site Astro
  const staticPaths = [
    '/',
    '/actualites',
    '/a-propos',
    '/contact',
    '/secrets-de-vernon',
    '/au-coin-de-la-rue',
    '/on-pousse-la-porte',
    '/vernon-talk-show',
  ];

  const staticUrls = staticPaths.map((path) => {
    const loc = path === '/' ? SITE_URL : `${SITE_URL}${path}`;
    return {
      loc,
      lastmod: new Date().toISOString(),
    };
  });

  // Posts WordPress (épisodes)
  const posts = await fetchAllPosts();
  const postUrls = posts.map((post) => ({
    loc: `${SITE_URL}/episode/${post.slug}`,
    lastmod: new Date(post.modified).toISOString(),
  }));

  const allUrls = [...staticUrls, ...postUrls];

  // Construction XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map((url) => {
    return `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
  </url>`;
  })
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};