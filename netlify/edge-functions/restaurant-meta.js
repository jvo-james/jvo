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

    // WhatsApp is much more reliable when the OG image is an absolute, same-site
    // JPEG with a predictable size. Netlify Image CDN will fetch the current hero
    // image, crop it to 1200x630 and serve it from this domain.
    const imageUrl = (() => {
      if (!image) return '';
      try {
        const parsed = new URL(image, url.origin);
        const sameSite = parsed.origin === url.origin;
        const allowedRemote = /^https:\/\/(?:images\.unsplash\.com|res\.cloudinary\.com)\//i.test(parsed.href);
        if (sameSite || allowedRemote) {
          return `${url.origin}/.netlify/images?url=${encodeURIComponent(parsed.href)}&w=1200&h=630&fit=cover&fm=jpg&q=80`;
        }
        return /^https:\/\//i.test(parsed.href) ? parsed.href : '';
      } catch {
        return '';
      }
    })();

    const meta = [
      metaTag('og:title', name),
      metaTag('og:description', description),
      metaTag('og:url', canonical),
      metaTag('og:type', 'website'),
      metaTag('og:locale', 'en_GB'),
      metaTag('twitter:card', imageUrl ? 'summary_large_image' : 'summary'),
      metaTag('twitter:title', name),
      metaTag('twitter:description', description)
    ];
    if (imageUrl) {
      meta.push(metaTag('og:image', imageUrl));
      meta.push(metaTag('og:image:secure_url', imageUrl));
      meta.push(metaTag('og:image:type', 'image/jpeg'));
      meta.push(metaTag('og:image:width', '1200'));
      meta.push(metaTag('og:image:height', '630'));
      meta.push(metaTag('og:image:alt', name));
      meta.push(metaTag('twitter:image', imageUrl));
      meta.push(metaTag('twitter:image:alt', name));
    }

    // A few WhatsApp clients still look for image_src in addition to og:image.
    const imageLink = imageUrl ? `<link rel=\"image_src\" href=\"${esc(imageUrl)}\">` : '';
    const canonicalLink = `<link rel=\"canonical\" href=\"${esc(canonical)}\">`;
    html = html.replace(/<\/head>/i, `${canonicalLink}${imageLink}${meta.join('')}\n</head>`);

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
