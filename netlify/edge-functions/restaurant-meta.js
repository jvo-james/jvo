function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function text(value) {
  return String(value ?? '').trim();
}

function metaTag(property, content) {
  return `<meta property="${property}" content="${esc(content)}">`;
}

export default async function handler(request, context) {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/restaurant\/([^/]+)\/?$/);

  // Let all other restaurant pages (menu, booking, gallery, etc.) continue normally.
  if (!match) return context.next();

  const slug = decodeURIComponent(match[1]);
  const apiUrl = new URL('/.netlify/functions/api', url.origin);
  apiUrl.searchParams.set('action', 'restaurantDemo');
  apiUrl.searchParams.set('slug', slug);

  try {
    const [demoResponse, pageResponse] = await Promise.all([
      fetch(apiUrl.toString(), {
        headers: { accept: 'application/json' },
        cache: 'no-store'
      }),
      context.next()
    ]);

    if (!demoResponse.ok) return pageResponse;

    const data = await demoResponse.json();
    const demo = data?.demo;
    if (!demo) return pageResponse;

    const name = text(demo.name) || 'Restaurant';
    const description = text(demo.intro) || text(demo.tagline) || 'Restaurant website concept.';
    const image = text(demo.heroImage?.url);
    const canonical = `${url.origin}/restaurant/${encodeURIComponent(demo.slug || slug)}`;

    let html = await pageResponse.text();

    // Replace the generic static title/description and add Open Graph/Twitter metadata
    // so link previews (including WhatsApp) use this restaurant's actual details.
    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${esc(name)}</title>`);
    html = html.replace(
      /<meta\s+name=["']description["'][^>]*>/i,
      `<meta name="description" content="${esc(description)}">`
    );

    const meta = [
      metaTag('og:title', name),
      metaTag('og:description', description),
      metaTag('og:url', canonical),
      metaTag('og:type', 'website'),
      metaTag('twitter:card', image ? 'summary_large_image' : 'summary'),
      metaTag('twitter:title', name),
      metaTag('twitter:description', description)
    ];
    if (image) {
      meta.push(metaTag('og:image', image));
      meta.push(metaTag('og:image:alt', name));
      meta.push(metaTag('twitter:image', image));
      meta.push(metaTag('twitter:image:alt', name));
    }

    html = html.replace(/<\/head>/i, `${meta.join('')}\n</head>`);

    const headers = new Headers(pageResponse.headers);
    headers.set('content-type', 'text/html; charset=UTF-8');
    headers.set('cache-control', 'no-store');

    return new Response(html, {
      status: pageResponse.status,
      statusText: pageResponse.statusText,
      headers
    });
  } catch {
    // Never break the actual demo page just because metadata fetching fails.
    return context.next();
  }
}

export const config = {
  path: '/restaurant/*'
};
