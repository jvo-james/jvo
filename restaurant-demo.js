(() => {
  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const slugFromLocation = () => {
    const url = new URL(location.href);
    if (url.searchParams.get('slug')) return url.searchParams.get('slug');
    const parts = location.pathname.split('/').filter(Boolean);
    const index = parts.indexOf('restaurant');
    return index >= 0 ? parts[index + 1] || '' : '';
  };
  const resolveImage = image => {
    const item = image || {};
    if (item.source === 'cloudinary' && item.url) return item.url;
    if (item.source === 'repo') return window.JVO_REPO_IMAGES?.[item.id]?.url || '';
    if (typeof item === 'string') return item.startsWith('http') || item.startsWith('/') ? item : `/${item}`;
    return '';
  };
  const safeUrl = value => {
    try { const u = new URL(String(value || ''), location.origin); return ['http:', 'https:'].includes(u.protocol) ? u.href : ''; } catch { return ''; }
  };
  const telHref = value => {
    const s = String(value || '').replace(/[^+\d]/g, '');
    return s ? `tel:${s}` : '#';
  };
  const fetchDemo = async slug => {
    if (!slug) throw new Error('No restaurant demo was specified.');
    const r = await fetch(`/.netlify/functions/api?action=restaurantDemo&slug=${encodeURIComponent(slug)}`, { headers: { accept: 'application/json' } });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.demo) throw new Error(d.error || 'This restaurant demo could not be found.');
    return d.demo;
  };
  const setLink = (el, href, show = true) => {
    if (!el) return;
    const ok = !!href;
    el.href = href || '#';
    el.hidden = show ? !ok : true;
  };
  const render = demo => {
    document.title = `${demo.name || 'Restaurant'} · Restaurant concept`;
    const meta = qs('meta[name="description"]');
    if (meta) meta.content = demo.intro || `${demo.name || 'Restaurant'} restaurant website concept.`;
    qs('#brandText').textContent = demo.logoText || demo.name || 'Restaurant';
    qs('#footerBrand').textContent = demo.logoText || demo.name || 'Restaurant';
    qs('#heroEyebrow').textContent = demo.eyebrow || 'Kitchen · Bar · Table';
    qs('#heroTitle').textContent = demo.tagline || 'Good food, warm light and nowhere to rush.';
    qs('#heroIntro').textContent = demo.intro || '';
    qs('#heroCity').textContent = demo.city || '';
    qs('#heroHours').textContent = (demo.hours || '').split('·')[0].trim();
    qs('#experienceTitle').innerHTML = `${esc(demo.experienceTitle || 'Come hungry. Leave happy.').replace(/\s+([^\s]+)$/, ' <em>$1</em>')}`;
    qs('#experienceText').textContent = demo.experienceText || '';
    qs('#storyTitle').textContent = demo.storyTitle || 'A table worth coming back to.';
    qs('#storyText').textContent = demo.storyText || '';
    qs('#storyLocation').textContent = demo.city || '';
    qs('#visitAddress').textContent = demo.address || demo.city || '';
    qs('#visitHours').textContent = demo.hours || '';
    qs('#visitPhone').textContent = demo.phone || '';
    qs('#visitPhone').href = telHref(demo.phone);
    qs('#footerCity').textContent = demo.city || '';
    const hero = qs('#heroImage'); hero.src = resolveImage(demo.heroImage); hero.alt = demo.heroImage?.alt || `${demo.name || 'Restaurant'} dining room`;
    const story = qs('#storyImage'); story.src = resolveImage(demo.storyImage); story.alt = demo.storyImage?.alt || 'Restaurant story';
    const mainLink = safeUrl(demo.reservationUrl) || '#visit';
    qs('#headerCta').href = mainLink; qs('#headerCta').textContent = demo.primaryCta || 'Book a table';
    qs('#heroPrimary').href = mainLink; qs('#heroPrimary').textContent = demo.primaryCta || 'Book a table';
    qs('#mobileCta').href = mainLink; qs('#mobileCta').textContent = demo.primaryCta || 'Book a table';
    qs('#visitPrimary').href = mainLink; qs('#visitPrimary').textContent = demo.primaryCta || 'Book a table';
    qs('#mobileBottomPrimary').href = mainLink; qs('#mobileBottomPrimary').textContent = demo.primaryCta || 'Book a table';
    const order = safeUrl(demo.orderUrl);
    setLink(qs('#headerOrder'), order, true);
    setLink(qs('#visitOrder'), order, true);
    qs('#heroSecondary').textContent = `${demo.secondaryCta || 'See the menu'} ↘`;
    qs('#mobileBottomSecondary').textContent = demo.secondaryCta || 'See the menu';
    const ig = safeUrl(demo.instagramUrl); setLink(qs('#footerInstagram'), ig, true);
    renderMenu(demo.menu || []);
    renderGallery(demo.gallery || []);
  };
  const renderMenu = items => {
    const tabs = qs('#menuTabs'), grid = qs('#menuGrid');
    const categories = ['All', ...new Set(items.map(item => item.category).filter(Boolean))];
    let current = 'All';
    const draw = () => {
      tabs.innerHTML = categories.map((cat, i) => `<button type="button" role="tab" aria-selected="${current===cat}" data-category="${esc(cat)}">${esc(cat)}</button>`).join('');
      const visible = current === 'All' ? items : items.filter(item => item.category === current);
      grid.innerHTML = visible.map((item, i) => `<article class="menu-card"><div class="menu-card-image"><img src="${esc(resolveImage(item.image))}" alt="${esc(item.image?.alt || item.name || 'Menu item')}" loading="lazy" decoding="async"></div><div class="menu-card-body"><h3>${esc(item.name || 'Dish')}</h3><div class="menu-card-price">${esc(item.price ? `${item.currency || ''}${item.currency ? ' ' : ''}${item.price}` : '')}</div><p>${esc(item.description || '')}</p></div></article>`).join('');
      qsa('[data-category]', tabs).forEach(btn => btn.addEventListener('click', () => { current = btn.dataset.category; draw(); }));
    };
    draw();
  };
  const renderGallery = gallery => {
    const grid = qs('#galleryGrid');
    grid.innerHTML = gallery.filter(x => x?.image).map((entry, i) => `<button type="button" class="gallery-item" data-full="${esc(resolveImage(entry.image))}" data-alt="${esc(entry.image?.alt || 'Restaurant image')}"><img src="${esc(resolveImage(entry.image))}" alt="${esc(entry.image?.alt || 'Restaurant image')}" loading="lazy"><span class="gallery-number">0${i+1}</span></button>`).join('');
    qsa('.gallery-item', grid).forEach(btn => btn.addEventListener('click', () => openLightbox(btn.dataset.full, btn.dataset.alt)));
  };
  const openLightbox = (src, alt) => { const box = qs('#lightbox'); qs('#lightboxImage').src = src; qs('#lightboxImage').alt = alt || ''; box.classList.add('is-open'); box.setAttribute('aria-hidden','false'); document.body.classList.add('menu-open'); qs('#lightboxClose').focus(); };
  const closeLightbox = () => { const box = qs('#lightbox'); box.classList.remove('is-open'); box.setAttribute('aria-hidden','true'); document.body.classList.remove('menu-open'); };
  qs('#lightboxClose').addEventListener('click', closeLightbox); qs('#lightbox').addEventListener('click', e => { if (e.target.id === 'lightbox') closeLightbox(); });
  const toggleMenu = () => { const btn = qs('#menuToggle'), nav = qs('#mobileNav'); const open = !nav.classList.contains('is-open'); nav.classList.toggle('is-open', open); nav.setAttribute('aria-hidden', String(!open)); btn.setAttribute('aria-expanded', String(open)); btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); document.body.classList.toggle('menu-open', open); };
  qs('#menuToggle').addEventListener('click', toggleMenu); qsa('#mobileNav a').forEach(a => a.addEventListener('click', () => { if (qs('#mobileNav').classList.contains('is-open')) toggleMenu(); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (qs('#lightbox').classList.contains('is-open')) closeLightbox(); if (qs('#mobileNav').classList.contains('is-open')) toggleMenu(); } });
  (async () => { try { render(await fetchDemo(slugFromLocation())); } catch (err) { document.body.innerHTML = `<main style="min-height:100svh;display:grid;place-items:center;padding:24px;background:#f2eee6;color:#171511;font-family:Arial,sans-serif"><div style="max-width:520px"><p style="font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#766f64">Restaurant concept</p><h1 style="font:600 52px/1 Georgia,serif;margin:12px 0 16px">This demo isn’t available.</h1><p style="line-height:1.7;color:#5d574e">The link may be incomplete or the demo may have been archived. Please ask for a fresh link.</p></div></main>`; console.error(err); } })();
})();
