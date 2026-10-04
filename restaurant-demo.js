(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  const slugFromLocation = () => {
    const url = new URL(location.href);
    if (url.searchParams.get('slug')) return url.searchParams.get('slug');
    const parts = location.pathname.split('/').filter(Boolean);
    const i = parts.indexOf('restaurant');
    if (i < 0) return '';
    return parts[i + 1] || '';
  };

  const isLocal = () => ['localhost', '127.0.0.1'].includes(location.hostname);
  const slug = slugFromLocation();
  const page = document.body.dataset.page || 'home';

  const pageUrl = (slugValue, target = 'home') => {
    const encoded = encodeURIComponent(slugValue || slug || 'restaurant');
    if (isLocal()) {
      const file = target === 'home' ? 'restaurant-demo.html' : `restaurant-${target}.html`;
      return `/${file}?slug=${encoded}`;
    }
    return target === 'home' ? `/restaurant/${encoded}` : `/restaurant/${encoded}/${target}`;
  };

  const resolveImage = image => {
    if (!image) return '';
    if (typeof image === 'string') {
      if (/^https?:\/\//i.test(image) || image.startsWith('/')) return image;
      return `/${image.replace(/^\/+/, '')}`;
    }
    if (image.source === 'cloudinary' && image.url) return image.url;
    if (image.source === 'repo' && image.id) return window.JVO_REPO_IMAGES?.[image.id]?.url || '';
    return '';
  };

  const telHref = phone => {
    const cleaned = String(phone || '').replace(/[^+\d]/g, '');
    return cleaned ? `tel:${cleaned}` : '#';
  };

  const safeExternal = value => {
    try {
      const url = new URL(String(value || ''), location.origin);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  };

  const cleanFileText = value => String(value || '').trim();

  function merge(base, source) {
    const out = JSON.parse(JSON.stringify(base || {}));
    Object.entries(source || {}).forEach(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value) && out[key] && typeof out[key] === 'object' && !Array.isArray(out[key])) {
        out[key] = merge(out[key], value);
      } else {
        out[key] = value;
      }
    });
    return out;
  }

  async function fetchDemo() {
    if (!slug) throw new Error('No restaurant demo was specified.');
    const response = await fetch(`/.netlify/functions/api?action=restaurantDemo&slug=${encodeURIComponent(slug)}`, { headers: { accept: 'application/json' } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.demo) throw new Error(data.error || 'This restaurant demo could not be found.');
    return merge(window.JVO_RESTAURANT_TEMPLATE || {}, data.demo);
  }

  function initials(name) {
    const parts = cleanFileText(name).split(/\s+/).filter(Boolean);
    return (parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : (parts[0]?.slice(0, 2) || 'RT')).toUpperCase();
  }

  function setText(selector, value) {
    const el = $(selector);
    if (el) el.textContent = cleanFileText(value);
  }

  function setDisplayTitle(selector, value) {
    const el = $(selector);
    if (!el) return;
    const words = cleanFileText(value).split(/\s+/).filter(Boolean);
    if (!words.length) { el.textContent = ''; return; }
    const split = Math.max(1, Math.ceil(words.length * 0.62));
    el.innerHTML = `${esc(words.slice(0, split).join(' '))}<br><em>${esc(words.slice(split).join(' '))}</em>`;
  }

  function setHref(selector, value, fallback = '#') {
    const el = $(selector);
    if (!el) return;
    el.href = value || fallback;
  }

  function show(el, visible = true) {
    if (el) el.hidden = !visible;
  }

  function arrowLink(label, href, light = false) {
    return `<a class="text-link${light ? ' line-link-light' : ''}" href="${esc(href)}">${esc(label)} <span class="arrow-icon" aria-hidden="true"></span></a>`;
  }

  function buildHeader(demo) {
    const nav = [
      ['Menu', pageUrl(demo.slug, 'menu')],
      ['Private dining', pageUrl(demo.slug, 'private')],
      ['Gallery', pageUrl(demo.slug, 'gallery')],
      ['Visit', pageUrl(demo.slug, 'contact')]
    ];
    const desktop = $('.desktop-nav');
    const mobile = $('#mobileNav');
    if (desktop) desktop.innerHTML = nav.map(([label, href]) => `<a href="${esc(href)}">${esc(label)}</a>`).join('');
    const contactTarget = pageUrl(demo.slug, 'contact');
    const fallbackCta = page === 'home' ? '#visit' : (page === 'private' ? '#enquire' : contactTarget);
    if (mobile) {
      mobile.innerHTML = `<a href="${esc(pageUrl(demo.slug, 'home'))}">Home</a>${nav.map(([label, href]) => `<a href="${esc(href)}">${esc(label)}</a>`).join('')}<a class="mobile-cta" href="${esc(safeExternal(demo.reservationUrl) || fallbackCta)}">${esc(demo.primaryCta || 'Book a table')}</a>`;
    }

    const brand = $('#brand');
    if (brand) brand.href = pageUrl(demo.slug, 'home');
    setText('#brandText', demo.logoText || demo.name || 'Restaurant');
    setText('#brandMark', initials(demo.logoText || demo.name));
    const cta = $('#headerCta');
    if (cta) {
      cta.textContent = demo.primaryCta || 'Book a table';
      cta.href = safeExternal(demo.reservationUrl) || fallbackCta;
    }
    const header = $('.site-header');
    if (header && !header.classList.contains('site-header-dark')) {
      const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 28);
      updateHeader();
      window.addEventListener('scroll', updateHeader, {passive:true});
    }
  }

  function bindMenu() {
    const toggle = $('#menuToggle');
    const nav = $('#mobileNav');
    if (!toggle || !nav) return;
    const setOpen = open => {
      nav.classList.toggle('is-open', open);
      nav.setAttribute('aria-hidden', String(!open));
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      document.body.classList.toggle('nav-open', open);
    };
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.addEventListener('click', event => { if (event.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') setOpen(false); });
  }

  function setImage(selector, image, fallbackAlt = '') {
    const el = $(selector);
    if (!el) return;
    const src = resolveImage(image);
    if (!src) { el.removeAttribute('src'); return; }
    el.src = src;
    el.alt = image?.alt || fallbackAlt || '';
  }

  function featuredMenu(demo) {
    const all = Array.isArray(demo.menu) ? demo.menu : [];
    const explicit = all.filter(item => item.featured);
    return (explicit.length ? explicit : all.slice(0, 3)).slice(0, 3);
  }

  function renderSharedFooter(demo) {
    setText('#footerBrand', demo.logoText || demo.name || 'Restaurant');
    setText('#footerName', demo.name || 'Restaurant');
    setText('#footerPitch', demo.intro || 'Good food. Good people. Come as you are.');
    setText('#footerCity', demo.city || '');
    const nav = $('#footerNav');
    if (nav) nav.innerHTML = [
      ['Menu', 'menu'], ['Private dining', 'private'], ['Gallery', 'gallery'], ['Visit', 'contact']
    ].map(([label, target]) => `<a href="${esc(pageUrl(demo.slug, target))}">${label}</a>`).join('');
    const instagram = $('#footerInstagram');
    if (instagram) {
      const href = safeExternal(demo.instagramUrl);
      show(instagram, !!href);
      if (href) instagram.href = href;
    }
  }

  function setupLightbox() {
    const box = $('#lightbox');
    const close = $('#lightboxClose');
    const image = $('#lightboxImage');
    if (!box || !close || !image) return;
    const hide = () => { box.classList.remove('is-open'); box.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lightbox-open'); };
    const open = (src, alt) => { image.src = src; image.alt = alt || ''; box.classList.add('is-open'); box.setAttribute('aria-hidden', 'false'); document.body.classList.add('lightbox-open'); close.focus(); };
    close.addEventListener('click', hide);
    box.addEventListener('click', event => { if (event.target === box) hide(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && box.classList.contains('is-open')) hide(); });
    return open;
  }

  function renderPopular(demo) {
    const grid = $('#popularGrid');
    if (!grid) return;
    const items = featuredMenu(demo);
    grid.innerHTML = items.map((item, index) => `<article class="popular-card">
      <div class="popular-card-image"><img src="${esc(resolveImage(item.image))}" alt="${esc(item.image?.alt || item.name || 'Dish')}" loading="lazy"></div>
      <div class="popular-card-meta"><h3>${esc(item.name || 'Dish')}</h3><span class="popular-card-price">${esc(item.currency || '')}${item.currency && item.price ? ' ' : ''}${esc(item.price || '')}</span></div>
      <p>${esc(item.description || '')}</p><small>${esc(item.category || 'From the kitchen')}</small>
    </article>`).join('');
    setText('#popularIntro', 'A few plates to give you a feel for the table. The full menu has more.');
  }

  function renderHome(demo) {
    document.title = `${demo.name || 'Restaurant'} | ${demo.city || 'Restaurant'}`;
    const meta = $('meta[name="description"]');
    if (meta) meta.content = demo.intro || `${demo.name || 'Restaurant'} restaurant website concept.`;
    buildHeader(demo);
    bindMenu();

    setText('#heroEyebrow', demo.eyebrow || 'Kitchen · Bar · Table');
    setText('#heroCity', demo.city || '');
    setText('#heroMini', demo.intro || 'A restaurant made for good food and long evenings.');
    const title = $('#heroTitle');
    if (title) {
      const raw = demo.tagline || 'Supper, properly done.';
      const words = raw.trim().split(/\s+/);
      const splitAt = Math.max(1, Math.ceil(words.length * .62));
      title.innerHTML = `${esc(words.slice(0, splitAt).join(' '))}<br><em>${esc(words.slice(splitAt).join(' ') || '')}</em>`;
    }
    setText('#heroIntro', demo.experienceText || demo.intro || 'Good food and a room that makes you want to stay.');
    const reservation = safeExternal(demo.reservationUrl);
    setHref('#heroPrimary', reservation, '#visit');
    setText('#heroPrimary', demo.primaryCta || 'Book a table');
    setHref('#heroSecondary', pageUrl(demo.slug, 'menu'));
    const heroSecondary = $('#heroSecondary'); if (heroSecondary) heroSecondary.innerHTML = `${esc(demo.secondaryCta || 'See the menu')} <span class="arrow-icon" aria-hidden="true"></span>`;

    setImage('#heroImage', demo.heroImage, `${demo.name || 'Restaurant'} dining room`);
    setImage('#introMainImage', demo.storyImage, 'Restaurant interior');
    setImage('#introDetailImage', demo.gallery?.[1]?.image || demo.menu?.[0]?.image, 'Restaurant detail');
    setImage('#storyImage', demo.storyImage, 'Restaurant story');
    setImage('#barImage', demo.gallery?.[2]?.image || demo.menu?.[1]?.image, 'Restaurant atmosphere');
    setImage('#eveningImage', demo.gallery?.[0]?.image || demo.heroImage, 'Restaurant evening');

    setText('#stampCity', demo.city || '');
    setDisplayTitle('#experienceTitle', demo.experienceTitle || 'Not just dinner. A whole evening.');
    const storyPreview = $('#storyPreview');
    if (storyPreview) storyPreview.textContent = demo.storyText || '';
    setText('#factHours', (demo.hours || '').split('·')[0] || 'Evenings');
    setText('#factReservations', demo.reservationUrl ? 'Recommended' : 'By phone');
    setText('#factArrival', demo.parking || 'Come as you are');
    setText('#storyTitle', demo.storyTitle || 'A table worth coming back to.');
    setText('#storyText', demo.storyText || 'Come for dinner, stay because the night got good.');
    setHref('#storyLink', pageUrl(demo.slug, 'gallery'));
    setText('#eveningIntro', demo.experienceText || demo.storyText || 'Take your time and let the evening decide what happens next.');
    setHref('#eveningCta', reservation || '#visit');
    setText('#dressCode', demo.dressCode || 'Smart casual.');
    setText('#parkingNote', demo.parking || 'Street parking nearby.');
    setText('#reservationNote', demo.reservationNote || 'Reservations are recommended.');
    setHref('#arrivalCard', pageUrl(demo.slug, 'contact'));
    setText('#visitAddress', demo.address || demo.city || '');
    setText('#visitHours', demo.hours || '');
    setText('#visitPhone', demo.phone || '');
    setHref('#visitPhone', telHref(demo.phone));
    setHref('#visitPrimary', reservation || '#visit');
    setText('#visitPrimary', demo.primaryCta || 'Book a table');
    setHref('#visitSecondary', pageUrl(demo.slug, 'menu'));
    renderPopular(demo);
    renderSharedFooter(demo);
  }

  function renderMenuPage(demo) {
    document.title = `${demo.name || 'Restaurant'} | Menu`;
    buildHeader(demo); bindMenu(); renderSharedFooter(demo);
    setText('#pageEyebrow', demo.eyebrow || 'The menu');
    setDisplayTitle('#pageTitle', 'Come hungry. Leave happy.');
    setText('#pageIntro', demo.menuIntro || 'A menu built around good ingredients, generous plates and the things people actually want to eat.');
    const reservation = safeExternal(demo.reservationUrl);
    setHref('#pageCta', reservation || pageUrl(demo.slug, 'contact'));
    setText('#pageCta', demo.primaryCta || 'Book a table');
    setText('#menuNote', demo.menuNote || 'Sample menu for concept presentation.');
    setText('#menuFooterNote', demo.menuFooterNote || 'Dish names, prices and descriptions are easy to update in the demo dashboard.');
    setHref('#menuVisitLink', reservation || pageUrl(demo.slug, 'contact'));

    const grid = $('#menuGrid');
    const filters = $('#menuFilters');
    if (!grid || !filters) return;
    const items = Array.isArray(demo.menu) ? demo.menu : [];
    const categories = ['All', ...new Set(items.map(item => item.category).filter(Boolean))];
    let active = 'All';
    const draw = () => {
      filters.innerHTML = categories.map(category => `<button type="button" class="${active === category ? 'active' : ''}" data-category="${esc(category)}">${esc(category)}</button>`).join('');
      const visible = active === 'All' ? items : items.filter(item => item.category === active);
      grid.innerHTML = visible.length ? visible.map(item => `<article class="full-menu-card"><div class="full-menu-image"><img src="${esc(resolveImage(item.image))}" alt="${esc(item.image?.alt || item.name || 'Dish')}" loading="lazy"></div><div class="full-menu-copy"><div class="full-menu-top"><h3>${esc(item.name || 'Dish')}</h3><span class="full-menu-price">${esc(item.currency || '')}${item.currency && item.price ? ' ' : ''}${esc(item.price || '')}</span></div><p>${esc(item.description || '')}</p><span class="full-menu-category">${esc(item.category || 'Menu')}</span></div></article>`).join('') : '<p class="body-copy">The menu is being updated. Check back soon.</p>';
      $$('#menuFilters button').forEach(button => button.addEventListener('click', () => { active = button.dataset.category; draw(); }));
    };
    draw();
  }

  function renderGalleryPage(demo) {
    document.title = `${demo.name || 'Restaurant'} | Gallery`;
    buildHeader(demo); bindMenu(); renderSharedFooter(demo);
    setText('#pageEyebrow', 'Inside');
    setDisplayTitle('#pageTitle', 'A good room matters.');
    setText('#pageIntro', demo.galleryIntro || 'Warm light, a little texture and enough space to settle in.');
    setText('#galleryTitle', demo.galleryTitle || 'Take a little look inside.');
    setText('#galleryIntro', demo.galleryIntro || 'A mix of the room, the kitchen and the plates that set the tone.');
    const openLightbox = setupLightbox();
    const grid = $('#galleryGrid');
    const items = Array.isArray(demo.gallery) ? demo.gallery.filter(item => resolveImage(item.image)) : [];
    if (!grid) return;
    grid.innerHTML = items.map((item, i) => `<button type="button" aria-label="Open image ${i + 1}" data-gallery-index="${i}"><img src="${esc(resolveImage(item.image))}" alt="${esc(item.image?.alt || `${demo.name || 'Restaurant'} image`)}" loading="lazy"><span class="gallery-caption">${esc(item.image?.alt || 'Restaurant moment')}</span></button>`).join('');
    $$('#galleryGrid button').forEach((button, i) => button.addEventListener('click', () => openLightbox?.(resolveImage(items[i].image), items[i].image?.alt || '')));
    const reservation = safeExternal(demo.reservationUrl);
    setHref('#galleryCta', reservation || pageUrl(demo.slug, 'contact'));
    setText('#galleryCta', demo.primaryCta || 'Book a table');
  }

  function renderPrivatePage(demo) {
    document.title = `${demo.name || 'Restaurant'} | Private dining`;
    buildHeader(demo); bindMenu(); renderSharedFooter(demo);
    setText('#privateHeroIntro', demo.privateDiningText || 'Long lunches, celebrations, team dinners and nights worth keeping.');
    setDisplayTitle('#privateTitle', demo.privateDiningTitle || 'Private dinners, done properly.');
    setText('#privateText', demo.privateDiningText || 'A more personal way to use the room, with space for the people you actually want around the table.');
    setText('#privateCapacity', demo.privateDiningCapacity || 'Up to 30 guests');
    setText('#privateDetails', demo.privateDiningDetails || 'Tell us what you are planning, how many people you have in mind and when you would like to come.');
    const reservation = safeExternal(demo.reservationUrl);
    const contact = demo.email ? `mailto:${demo.email}` : telHref(demo.phone);
    setHref('#privateHeroCta', contact);
    setHref('#privateCta', contact);
    setHref('#enquirePrimary', contact);
    setText('#enquirePrimary', 'Make an enquiry');
    setText('#enquireText', demo.privateDiningDetails || 'Get in touch and we will work out the details with you.');
    setHref('#enquirePhone', telHref(demo.phone));
    const phoneLink = $('#enquirePhone'); if (phoneLink) phoneLink.innerHTML = 'Call the restaurant <span class="arrow-icon" aria-hidden="true"></span>';
    setImage('#privateHeroImage', demo.gallery?.[4]?.image || demo.heroImage, `${demo.name || 'Restaurant'} private dining`);
    setImage('#privateStoryImage', demo.storyImage || demo.gallery?.[0]?.image, 'Private dining');
  }

  function renderContactPage(demo) {
    document.title = `${demo.name || 'Restaurant'} | Visit`;
    buildHeader(demo); bindMenu(); renderSharedFooter(demo);
    setText('#contactIntro', demo.contactIntro || 'Everything you need before you arrive.');
    setText('#contactAddress', demo.address || demo.city || '');
    setText('#contactHours', demo.hours || '');
    setText('#contactPhone', demo.phone || '');
    setHref('#contactPhone', telHref(demo.phone));
    setText('#contactDress', demo.dressCode || 'Smart casual.');
    setText('#contactParking', demo.parking || 'Street parking nearby.');
    setText('#contactReservation', demo.reservationNote || 'Reservations are recommended.');
    const reservation = safeExternal(demo.reservationUrl);
    setHref('#contactPrimary', reservation || (demo.email ? `mailto:${demo.email}` : telHref(demo.phone)));
    setText('#contactPrimary', demo.primaryCta || 'Book a table');
    const directions = demo.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(demo.address)}` : '';
    setHref('#contactDirections', directions || '#');
    const instagram = safeExternal(demo.instagramUrl);
    const instagramLink = $('#contactInstagram');
    if (instagramLink) {
      show(instagramLink, !!instagram);
      if (instagram) instagramLink.href = instagram;
    }
    setImage('#contactImage', demo.gallery?.[0]?.image || demo.heroImage, `${demo.name || 'Restaurant'} exterior`);
  }

  function render(demo) {
    if (page === 'menu') renderMenuPage(demo);
    else if (page === 'gallery') renderGalleryPage(demo);
    else if (page === 'private') renderPrivatePage(demo);
    else if (page === 'contact') renderContactPage(demo);
    else renderHome(demo);
  }

  function fail(error) {
    console.error(error);
    document.body.innerHTML = `<main style="min-height:100svh;display:grid;place-items:center;padding:28px;background:#f3eee6;color:#181713;font-family:Arial,sans-serif"><div style="max-width:560px"><div style="font:500 10px monospace;letter-spacing:.14em;text-transform:uppercase;color:#8a8175;margin-bottom:13px">Restaurant concept</div><h1 style="font:600 52px/1 Georgia,serif;margin:0 0 16px">This page is not available.</h1><p style="font:15px/1.7 Arial,sans-serif;color:#655f56;margin:0 0 25px">The demo link may be incomplete or the saved restaurant could not be loaded.</p><a href="/" style="display:inline-flex;min-height:45px;align-items:center;padding:0 16px;background:#181713;color:#fff;text-decoration:none;font:600 11px Arial,sans-serif">Back to home</a></div></main>`;
  }

  fetchDemo().then(render).catch(fail);
})();
