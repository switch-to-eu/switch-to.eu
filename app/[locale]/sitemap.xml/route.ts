import { getAlternativesCategories } from '@/lib/content/services/alternatives';
import { getGuideCategories, getGuidesByCategory } from '@/lib/content/services/guides';
import { getAllServices } from '@/lib/content/services/services';

export async function GET(): Promise<Response> {
    const baseUrl = 'https://switch-to.eu';

    // Format current date for lastModified
    const date = new Date().toISOString();

    let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    const staticPages = [
        '/',
        '/about',
        '/contribute',
        '/guides',
        '/services',
    ];

    for (const page of staticPages) {
        sitemapXml += `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '/' ? '1.0' : '0.8'}</priority>
  </url>`;
    }

    // Add service category pages
    const alternativesCategories = getAlternativesCategories();
    for (const category of alternativesCategories) {
        sitemapXml += `
  <url>
    <loc>${baseUrl}/services/${category}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }

    // Add guide categories
    const guideCategories = await getGuideCategories();
    for (const category of guideCategories) {
        sitemapXml += `
  <url>
    <loc>${baseUrl}/guides/${category}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;

        // Add individual guides
        const guides = await getGuidesByCategory(category);
        for (const guide of guides) {
            sitemapXml += `
  <url>
    <loc>${baseUrl}/guides/${category}/${guide.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
        }
    }

    // Add service detail pages
    const services = await getAllServices();
    for (const service of services) {
        const region = service.region || (service.location.includes('EU') ? 'eu' : 'non-eu');
        const slug = service.name.toLowerCase().replace(/\s+/g, '-');

        sitemapXml += `
  <url>
    <loc>${baseUrl}/services/${region}/${slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }

    sitemapXml += `
</urlset>`;

    return new Response(sitemapXml, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}