(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clean = value => String(value ?? '').trim();

  const CATEGORY_META = [
    { key:'Main dishes', label:'Main dishes', anchor:'main-dishes', desc:'The plates people come for.' },
    { key:'Sides', label:'Sides', anchor:'sides', desc:'A little extra for the table.' },
    { key:'Fresh juices', label:'Fresh juices', anchor:'fresh-juices', desc:'Cold, bright and made for the table.' },
    { key:'Wine & spirits', label:'Wine & spirits', anchor:'wine-spirits', desc:'A good bottle or a proper pour.' },
    { key:'Dessert', label:'Dessert', anchor:'dessert', desc:'Leave room for something sweet.' }
  ];
  const CATEGORY_ALIASES = {
    'mains':'Main dishes','main':'Main dishes','main dish':'Main dishes','main dishes':'Main dishes',
    'sides':'Sides','side':'Sides','side dishes':'Sides',
    'drinks':'Wine & spirits','wine':'Wine & spirits','wine & spirits':'Wine & spirits','spirits':'Wine & spirits','bar':'Wine & spirits',
    'juice':'Fresh juices','juices':'Fresh juices','fresh juice':'Fresh juices','fresh juices':'Fresh juices',
    'dessert':'Dessert','desserts':'Dessert',
    'small plates':'Sides','lunch':'Main dishes'
  };

  const slugFromLocation = () => {
    const url = new URL(location.href);
    if (url.searchParams.get('slug')) return url.searchParams.get('slug');
    const parts = location.pathname.split('/').filter(Boolean);
    const i = parts.indexOf('restaurant');
    return i < 0 ? '' : parts[i + 1] || '';
  };
  const isLocal = () => ['localhost','127.0.0.1'].includes(location.hostname);
  const slug = slugFromLocation();
  const page = document.body.dataset.page || 'home';

  const pageUrl = (slugValue, target = 'home') => {
    const value = encodeURIComponent(slugValue || slug || 'restaurant');
    if (isLocal()) {
      const file = target === 'home' ? 'restaurant-demo.html' : `restaurant-${target}.html`;
      return `/${file}?slug=${value}`;
    }
    return target === 'home' ? `/restaurant/${value}` : `/restaurant/${value}/${target}`;
  };

  const normalizeCategory = value => {
    const raw = clean(value);
    return CATEGORY_ALIASES[raw.toLowerCase()] || raw || 'Main dishes';
  };

  const safeRemoteImage = value => {
    const raw = clean(value);
    return /^https:\/\//i.test(raw) ? raw : '';
  };

  const resolveImage = image => {
    if (!image) return '';
    if (typeof image === 'string') {
      if (/^https?:\/\//i.test(image)) return image;
      const raw = image.trim();
      return raw ? (raw.startsWith('/') ? raw : `/${raw.replace(/^\/+/, '')}`) : '';
    }
    if (image.source === 'cloudinary' && image.url) return image.url;
    if (image.source === 'url' && image.url) return safeRemoteImage(image.url);
    if (image.source === 'repo') {
      const mapped = window.JVO_REPO_IMAGES?.[image.id]?.url || image.url || '';
      if (!mapped) return '';
      if (/^https?:\/\//i.test(mapped)) return mapped;
      return mapped.startsWith('/') ? mapped : `/${mapped.replace(/^\/+/, '')}`;
    }
    if (image.url) {
      const raw = String(image.url).trim();
      if (/^https?:\/\//i.test(raw)) return raw;
      return raw.startsWith('/') ? raw : `/${raw.replace(/^\/+/, '')}`;
    }
    return '';
  };

  const safeExternal = value => {
    try {
      const url = new URL(String(value || ''), location.origin);
      return ['https:','http:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  };
  const telHref = phone => {
    const cleaned = String(phone || '').replace(/[^+\d]/g, '');
    return cleaned ? `tel:${cleaned}` : '#';
  };
  const whatsappHref = phone => {
    const digits = String(phone || '').replace(/\D/g, '');
    if (!digits) return '';
    const normalized = digits.startsWith('0') ? `233${digits.slice(1)}` : digits;
    return `https://wa.me/${normalized}`;
  };

  function deepMerge(base, source) {
    const output = JSON.parse(JSON.stringify(base || {}));
    Object.entries(source || {}).forEach(([key,value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value) && output[key] && typeof output[key] === 'object' && !Array.isArray(output[key])) output[key] = deepMerge(output[key], value);
      else output[key] = value;
    });
    return output;
  }

  async function fetchDemo() {
    if (!slug) throw new Error('No restaurant demo was specified.');
    const response = await fetch(`/.netlify/functions/api?action=restaurantDemo&slug=${encodeURIComponent(slug)}`, {headers:{accept:'application/json'}, cache:'no-store'});
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.demo) throw new Error(data.error || 'This restaurant demo could not be found.');
    return deepMerge(window.JVO_RESTAURANT_TEMPLATE || {}, data.demo);
  }

  const setText = (selector, value) => {
    const el = $(selector);
    if (el) el.textContent = clean(value);
  };
  const setHref = (selector, href, fallback = '#') => {
    const el = $(selector);
    if (el) el.href = href || fallback;
  };
  const setImage = (selector, image, alt = '') => {
    const el = $(selector);
    if (!el) return;
    const src = resolveImage(image);
    if (!src) {
      el.removeAttribute('src');
      el.parentElement?.classList.add('image-missing');
      return;
    }
    el.src = src;
    el.alt = image?.alt || alt || '';
    el.parentElement?.classList.remove('image-missing');
    el.onerror = () => {
      const fallback = resolveImage({source:'repo',id:'diningRoomWide',alt:alt || 'Restaurant image'});
      if (fallback && el.dataset.fallbackUsed !== '1' && fallback !== el.src) {
        el.dataset.fallbackUsed = '1';
        el.src = fallback;
        el.parentElement?.classList.remove('image-missing');
        return;
      }
      el.parentElement?.classList.add('image-missing');
    };
  };
  const setTitle = (selector, value) => {
    const el = $(selector);
    if (!el) return;
    const words = clean(value).split(/\s+/).filter(Boolean);
    if (!words.length) return;
    const pivot = Math.max(1, Math.ceil(words.length * .58));
    el.innerHTML = `${esc(words.slice(0,pivot).join(' '))}<br><em>${esc(words.slice(pivot).join(' '))}</em>`;
  };

  function setupLightbox() {
    const box = $('#lightbox');
    const image = $('#lightboxImage');
    const caption = $('#lightboxCaption');
    const close = $('#lightboxClose');
    if (!box || !image || !close) return {open:()=>{}};
    const setOpen = open => {
      box.classList.toggle('is-open', open);
      box.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('lightbox-open', open);
    };
    const open = (src, alt = '') => {
      if (!src) return;
      image.src = src;
      image.alt = alt;
      if (caption) caption.textContent = alt;
      setOpen(true);
      close.focus();
    };
    close.addEventListener('click', () => setOpen(false));
    box.addEventListener('click', e => { if (e.target === box) setOpen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
    return {open};
  }

  function bindNavigation(demo) {
    const nav = [
      ['Menu', pageUrl(demo.slug,'menu')],
      ['Private dining', pageUrl(demo.slug,'private')],
      ['Gallery', pageUrl(demo.slug,'gallery')],
      ['Visit', pageUrl(demo.slug,'contact')]
    ];
    const desktop = $('#desktopNav');
    const mobile = $('#mobileNav');
    if (desktop) desktop.innerHTML = nav.map(([label,href]) => `<a href="${esc(href)}">${esc(label)}</a>`).join('');
    setHref('#headerMenuLink', pageUrl(demo.slug,'menu'));
    const headerBook = pageUrl(demo.slug,'booking');
    setHref('#headerCta', headerBook);
    if (mobile) {
      mobile.innerHTML = `<div class="mobile-nav-head"><span>${esc(demo.name || 'Restaurant')}</span><button class="mobile-nav-close" id="mobileNavClose" type="button" aria-label="Close navigation">Close</button></div><div class="mobile-nav-links"><a href="${esc(pageUrl(demo.slug,'home'))}">Home</a>${nav.map(([label,href]) => `<a href="${esc(href)}">${esc(label)}</a>`).join('')}<a href="${esc(headerBook)}" class="mobile-cta">Book a table</a></div><div class="mobile-meta">${esc(demo.hours || '')}</div>`;
    }
    setHref('#brand', pageUrl(demo.slug,'home'));
    setText('#brandText', demo.name || 'Restaurant');

    const toggle = $('#menuToggle');
    if (!toggle || !mobile) return;
    const navCloseButton = $('#mobileNavClose');
    const close = () => {
      mobile.classList.remove('is-open');
      mobile.setAttribute('aria-hidden','true');
      toggle.setAttribute('aria-expanded','false');
      document.body.classList.remove('nav-open');
    };
    const open = () => {
      mobile.classList.add('is-open');
      mobile.setAttribute('aria-hidden','false');
      toggle.setAttribute('aria-expanded','true');
      document.body.classList.add('nav-open');
    };
    navCloseButton?.addEventListener('click', close);
    toggle.addEventListener('click', () => mobile.classList.contains('is-open') ? close() : open());
    mobile.addEventListener('click', e => { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  function renderFooter(demo) {
    setText('#footerBrand', demo.name || 'Restaurant');
    setText('#footerPitch', demo.intro || 'Good food, good company and a room worth staying in.');
    setText('#footerHours', demo.hours || 'See restaurant for current hours.');
    const foot = $('#footerNav');
    if (foot) foot.innerHTML = [
      ['Home',pageUrl(demo.slug,'home')],['Menu',pageUrl(demo.slug,'menu')],['Book a table',pageUrl(demo.slug,'booking')],['Private dining',pageUrl(demo.slug,'private')],['Gallery',pageUrl(demo.slug,'gallery')],['Visit',pageUrl(demo.slug,'contact')]
    ].map(([label,href]) => `<a href="${esc(href)}">${esc(label)}</a>`).join('');
    const instagram = $('#footerInstagram');
    if (instagram) {
      const url = safeExternal(demo.instagramUrl);
      instagram.hidden = !url;
      if (url) instagram.href = url;
    }
    const footerBrand = $('#footerBrand');
    if (footerBrand) footerBrand.href = pageUrl(demo.slug,'home');
  }

  function renderHome(demo) {
    document.title = demo.name || 'Restaurant';
    bindNavigation(demo); renderFooter(demo);
    setText('#heroEyebrow', demo.eyebrow || 'Kitchen · Bar · Table');
    setText('#heroName', demo.name || 'Restaurant');
    setText('#heroTagline', demo.tagline || 'Dinner worth lingering over.');
    setText('#heroIntro', demo.intro || 'Good food, proper drinks and an evening worth taking your time with.');
    setText('#popularIntro', demo.popularIntro || 'Five ways to start, share and finish the meal.');
    setHref('#menuLinkTop', pageUrl(demo.slug,'menu'));
    setHref('#heroPrimary', pageUrl(demo.slug,'booking'));
    setText('#heroPrimary', demo.primaryCta || 'Book a table');
    setHref('#heroSecondary', pageUrl(demo.slug,'menu'));
    setImage('#heroImage', demo.heroImage, `${demo.name || 'Restaurant'} dining room`);

    setImage('#introMainImage', demo.storyImage, 'Restaurant interior');
    setImage('#introDetailImage', demo.gallery?.[1]?.image || demo.menu?.[0]?.image, 'Restaurant detail');
    setHref('#introMainLink', pageUrl(demo.slug,'gallery'));
    setHref('#introDetailLink', pageUrl(demo.slug,'menu'));
    setTitle('#experienceTitle', demo.experienceTitle || 'Come for dinner. Stay for the evening.');
    setText('#experienceText', demo.experienceText || 'Start with something small, settle into a proper plate and let the night run a little longer than planned.');
    setText('#storyPreview', demo.storyText || 'We cook familiar things with a little edge and keep the room easy so the evening can take its own shape.');
    setHref('#storyLink', pageUrl(demo.slug,'gallery'));
    setText('#introNoteText', 'Food, drinks and a room you will want to stay in.');

    setImage('#storyImage', demo.storyImage, 'Restaurant story');
    setImage('#barImage', demo.gallery?.[2]?.image || demo.gallery?.[1]?.image, 'Restaurant bar');
    setHref('#storyButton', pageUrl(demo.slug,'gallery'));
    setHref('#barLink', pageUrl(demo.slug,'contact'));

    renderCategoryCarousel(demo);
    setImage('#eveningImage', demo.gallery?.[0]?.image || demo.heroImage, 'Restaurant evening');
    setText('#eveningIntro', demo.experienceText || 'Come early for a drink, take your time over supper and stay until you feel like leaving.');
    setHref('#eveningStep1', pageUrl(demo.slug,'menu') + '#wine-spirits');
    setHref('#eveningStep2', pageUrl(demo.slug,'menu') + '#main-dishes');
    setHref('#eveningStep3', pageUrl(demo.slug,'gallery'));
    setHref('#eveningCta', pageUrl(demo.slug,'menu'));

    setText('#privateTeaser', demo.privateDiningText || 'Long lunches, celebrations and team dinners with a little more privacy.');
    setImage('#privateFeatureImage', demo.gallery?.[5]?.image || demo.gallery?.[3]?.image || demo.heroImage, 'Private dining');
    setHref('#privateLink', pageUrl(demo.slug,'private'));

    setText('#dressCode', demo.dressCode || 'Smart casual.');
    setText('#reservationNote', demo.reservationNote || 'Reservations are recommended.');
    setText('#factHours', demo.hours || 'See restaurant for current hours.');
    setHref('#arrivalLink', pageUrl(demo.slug,'contact'));
    setText('#visitAddress', demo.address || demo.city || '');
    setText('#visitHours', demo.hours || '');
    setText('#visitPhone', demo.phone || '');
    setHref('#visitPhone', telHref(demo.phone));
    setHref('#visitPrimary', pageUrl(demo.slug,'booking'));
    setText('#visitPrimary', demo.primaryCta || 'Book a table');
    setHref('#visitSecondary', pageUrl(demo.slug,'menu'));
  }

  function renderCategoryCarousel(demo) {
    const carousel = $('#categoryCarousel');
    const dots = $('#categoryDots');
    if (!carousel) return;
    const items = Array.isArray(demo.menu) ? demo.menu : [];
    const cards = CATEGORY_META.map(meta => {
      const found = items.find(item => normalizeCategory(item.category) === meta.key);
      return {meta, item:found || {image:demo.heroImage,name:meta.label,description:meta.desc}};
    });
    carousel.innerHTML = cards.map(({meta,item}) => `<article class="category-card"><a class="category-card-link" href="${esc(pageUrl(demo.slug,'menu') + '#' + meta.anchor)}" aria-label="Open ${esc(meta.label)} in the menu"></a><img src="${esc(resolveImage(item.image) || resolveImage(demo.heroImage))}" alt="${esc(item.image?.alt || item.name || meta.label)}" loading="lazy"><div class="category-card-copy"><small>${esc(meta.label)}</small><h3>${esc(meta.label)}</h3><p>${esc(meta.desc)}</p></div></article>`).join('');
    if (dots) dots.innerHTML = cards.map((_,i) => `<button type="button" aria-label="Show category ${i+1}" data-dot="${i}"></button>`).join('');

    const updateDots = () => {
      if (!dots) return;
      const card = $('.category-card', carousel);
      if (!card) return;
      const index = Math.round(carousel.scrollLeft / Math.max(1, card.getBoundingClientRect().width + 12));
      $$('.carousel-dots button', dots).forEach((b,i) => b.classList.toggle('active', i === Math.min(cards.length-1,index)));
    };
    $$('.carousel-dots button', dots).forEach(button => button.addEventListener('click', () => {
      const index = Number(button.dataset.dot || 0);
      const card = $('.category-card', carousel);
      if (card) carousel.scrollTo({left:index*(card.getBoundingClientRect().width + 12),behavior:'smooth'});
    }));
    carousel.addEventListener('scroll', updateDots, {passive:true});
    const jump = direction => {
      const card = $('.category-card', carousel);
      if (!card) return;
      const stepWidth = card.getBoundingClientRect().width + 12;
      const max = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
      let next = carousel.scrollLeft + direction * stepWidth;
      if (next > max - 2) next = 0;
      if (next < 0) next = max;
      carousel.scrollTo({left:next,behavior:'smooth'});
    };
    $('#categoryPrev')?.addEventListener('click', () => jump(-1));
    $('#categoryNext')?.addEventListener('click', () => jump(1));
    updateDots();

    let timer = null;
    let paused = false;
    let lastUserAction = 0;
    const step = () => {
      if (paused || Date.now() - lastUserAction < 3500) return;
      const card = $('.category-card', carousel);
      if (!card) return;
      const stepWidth = card.getBoundingClientRect().width + 12;
      const max = carousel.scrollWidth - carousel.clientWidth;
      const next = carousel.scrollLeft + stepWidth >= max - 4 ? 0 : carousel.scrollLeft + stepWidth;
      carousel.scrollTo({left:next,behavior:'smooth'});
    };
    const start = () => { clearInterval(timer); timer = setInterval(step,4500); };
    carousel.addEventListener('mouseenter', () => paused = true);
    carousel.addEventListener('mouseleave', () => paused = false);
    carousel.addEventListener('touchstart', () => { lastUserAction = Date.now(); paused = true; }, {passive:true});
    carousel.addEventListener('touchend', () => { lastUserAction = Date.now(); setTimeout(() => paused = false,900); }, {passive:true});
    start();
  }

  function renderMenuPage(demo) {
    document.title = `${demo.name || 'Restaurant'} | Menu`;
    bindNavigation(demo); renderFooter(demo);
    setText('#pageEyebrow','The menu');
    setText('#pageIntro', demo.menuIntro || 'A generous menu of mains, sides, fresh juices and a well-stocked bar.');
    setHref('#pageCta', pageUrl(demo.slug,'booking'));
    setText('#pageCta', demo.primaryCta || 'Book a table');
    setText('#menuNote', demo.menuNote || 'Sample menu for concept presentation.');
    setText('#menuFooterNote', demo.menuFooterNote || 'Update the menu from the studio.');
    setHref('#menuVisitLink', pageUrl(demo.slug,'booking'));
    const list = $('#menuCategoryList');
    const filters = $('#menuFilters');
    const box = setupLightbox();
    if (!list) return;
    const items = (Array.isArray(demo.menu) ? demo.menu : []).map(item => ({...item,category:normalizeCategory(item.category)}));
    if (!items.length) { list.innerHTML = '<p class="menu-empty">The menu is being updated. Check back soon.</p>'; return; }
    const categorySections = CATEGORY_META.map(meta => ({meta,items:items.filter(item => item.category === meta.key)})).filter(group => group.items.length);
    const allMeta = categorySections.map(group => group.meta);
    if (filters) filters.innerHTML = allMeta.map(meta => `<button type="button" data-filter="${esc(meta.anchor)}">${esc(meta.label)}</button>`).join('');
    list.innerHTML = categorySections.map(group => `<section class="menu-category" id="${esc(group.meta.anchor)}"><div class="menu-category-header"><div><span class="eyebrow">${esc(group.meta.label)}</span><h2>${esc(group.meta.label)}</h2></div><span class="menu-category-count">${group.items.length} ${group.items.length === 1 ? 'item':'items'}</span></div><div class="menu-category-grid">${group.items.map((item,index) => `<article class="full-menu-card"><div class="full-menu-image"><button type="button" data-menu-image="${esc(resolveImage(item.image))}" data-menu-alt="${esc(item.image?.alt || item.name || 'Menu item')}" aria-label="View ${esc(item.name || 'dish')} photo"><img src="${esc(resolveImage(item.image) || resolveImage(demo.heroImage))}" alt="${esc(item.image?.alt || item.name || 'Menu item')}" loading="lazy"></button></div><div class="full-menu-copy"><div class="full-menu-top"><h3>${esc(item.name || 'Dish')}</h3><span class="full-menu-price">${esc(item.currency || '')}${item.currency && item.price ? ' ' : ''}${esc(item.price || '')}</span></div><p>${esc(item.description || '')}</p><span class="full-menu-category">${esc(item.category || '')}</span></div></article>`).join('')}</div></section>`).join('');
    $$('#menuCategoryList [data-menu-image]').forEach(button => button.addEventListener('click', () => box.open(button.dataset.menuImage, button.dataset.menuAlt)));
    $$('#menuFilters [data-filter]').forEach(button => button.addEventListener('click', () => $(`#${CSS.escape(button.dataset.filter)}`)?.scrollIntoView({behavior:'smooth',block:'start'})));
    requestAnimationFrame(() => {
      const hash = location.hash.replace(/^#/,'');
      if (hash && document.getElementById(hash)) setTimeout(() => document.getElementById(hash)?.scrollIntoView({behavior:'smooth',block:'start'}),120);
    });
  }

  function renderGalleryPage(demo) {
    document.title = `${demo.name || 'Restaurant'} | Gallery`;
    bindNavigation(demo); renderFooter(demo);
    setText('#pageEyebrow','Inside'); setTitle('#pageTitle','A room worth seeing.'); setText('#pageIntro', demo.galleryIntro || 'The room, the bar, the plates and the moments between them.');
    setText('#galleryTitle', demo.galleryTitle || 'A little closer.'); setText('#galleryIntro', demo.galleryIntro || 'Good restaurants are about more than the plate. Take a look around.');
    const grid = $('#galleryGrid'); const box = setupLightbox();
    const items = Array.isArray(demo.gallery) ? demo.gallery.filter(item => resolveImage(item.image)) : [];
    if (!grid) return;
    grid.innerHTML = items.map((item,i) => `<button type="button" aria-label="Open image ${i+1}" data-gallery-index="${i}"><img src="${esc(resolveImage(item.image))}" alt="${esc(item.image?.alt || `${demo.name || 'Restaurant'} image`)}" loading="lazy"><span class="gallery-caption">${esc(item.image?.alt || 'Restaurant moment')}</span></button>`).join('');
    $$('#galleryGrid button').forEach((button,i) => button.addEventListener('click', () => box.open(resolveImage(items[i].image), items[i].image?.alt || '')));
    setHref('#galleryCta', pageUrl(demo.slug,'booking'));
  }

  function renderPrivatePage(demo) {
    document.title = `${demo.name || 'Restaurant'} | Private dining`;
    bindNavigation(demo); renderFooter(demo);
    setText('#privateHeroIntro', demo.privateDiningText || 'Long lunches, celebrations, team dinners and nights worth keeping.');
    setText('#privateTitle', demo.privateDiningTitle || 'Private dinners, done properly.'); setText('#privateText', demo.privateDiningText || 'A more personal way to use the room, with space for the people you actually want around the table.');
    setText('#privateCapacity', demo.privateDiningCapacity || 'Up to 30 guests'); setText('#privateDetails', demo.privateDiningDetails || 'Tell us what you are planning, how many people you have in mind and when you would like to come.');
    const contact = demo.email ? `mailto:${demo.email}` : telHref(demo.phone);
    setHref('#privateHeroCta', contact); setHref('#privateCta', contact); setHref('#enquirePrimary', contact); setHref('#enquirePhone', telHref(demo.phone));
    setImage('#privateHeroImage', demo.gallery?.[5]?.image || demo.heroImage, `${demo.name || 'Restaurant'} private dining`); setImage('#privateStoryImage', demo.storyImage || demo.gallery?.[0]?.image, 'Private dining');
    const phoneLink = $('#enquirePhone'); if (phoneLink) phoneLink.innerHTML = 'Call the restaurant <span class="arrow-icon" aria-hidden="true"></span>';
  }

  function renderContactPage(demo) {
    document.title = `${demo.name || 'Restaurant'} | Visit`;
    bindNavigation(demo); renderFooter(demo);
    setText('#contactIntro', demo.contactIntro || 'Everything you need before you arrive.'); setText('#contactAddress', demo.address || demo.city || ''); setText('#contactHours', demo.hours || ''); setText('#contactPhone', demo.phone || ''); setHref('#contactPhone', telHref(demo.phone));
    setText('#contactDress', demo.dressCode || 'Smart casual.'); setText('#contactParking', demo.parking || 'Street parking nearby.'); setText('#contactReservation', demo.reservationNote || 'Reservations are recommended.');
    setHref('#contactPrimary', pageUrl(demo.slug,'booking')); setText('#contactPrimary', demo.primaryCta || 'Book a table');
    const directions = demo.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(demo.address)}` : '';
    setHref('#contactDirections', directions || '#'); setImage('#contactImage', demo.gallery?.[0]?.image || demo.heroImage, `${demo.name || 'Restaurant'} exterior`);
    const instagram = $('#contactInstagram'); const ig = safeExternal(demo.instagramUrl); if (instagram) { instagram.hidden = !ig; if (ig) instagram.href = ig; }
  }

  function renderBookingPage(demo) {
    document.title = `${demo.name || 'Restaurant'} | Book a table`;
    bindNavigation(demo); renderFooter(demo);
    setText('#bookingIntro', demo.reservationNote || 'Choose your date, time and party size. We will make the rest easy.');
    setImage('#bookingImage', demo.gallery?.[3]?.image || demo.heroImage, 'Restaurant table');
    setText('#bookingRestaurantNote', demo.reservationNote || 'Reservations are recommended.');
    setText('#bookingHours', demo.hours || 'See restaurant for current hours.'); setText('#bookingPhone', demo.phone || ''); setHref('#bookingPhone', telHref(demo.phone));
    const dateField = document.querySelector('input[name="date"]');
    if (dateField) {
      const today = new Date(); const local = new Date(today.getTime() - today.getTimezoneOffset()*60000).toISOString().slice(0,10); dateField.min = local;
    }
    const form = $('#bookingForm');
    if (!form) return;
    form.addEventListener('submit', event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const restaurantEmail = clean(demo.email);
      const message = [
        `Table request for ${demo.name || 'Restaurant'}`,'',
        `Date: ${data.date || ''}`,
        `Time: ${data.time || ''}`,
        `Guests: ${data.guests || ''}`,
        `Occasion: ${data.occasion || 'Not specified'}`,'',
        `Name: ${data.name || ''}`,
        `Email: ${data.email || ''}`,
        `Phone: ${data.phone || ''}`,
        `Notes: ${data.notes || 'None'}`
      ].join('\n');
      const reservation = safeExternal(demo.reservationUrl);
      const success = $('#bookingSuccess'); const successText = $('#bookingSuccessText');
      if (reservation) {
        if (success) success.hidden = false;
        if (successText) successText.textContent = 'Your details are ready. Continue to the restaurant reservation service to finish the booking.';
        setTimeout(() => window.open(reservation, '_blank', 'noopener,noreferrer'), 120);
        return;
      }
      if (restaurantEmail) {
        const subject = encodeURIComponent(`Table request for ${demo.name || 'Restaurant'} · ${data.date || ''}`);
        const body = encodeURIComponent(message);
        if (success) success.hidden = false;
        if (successText) successText.textContent = 'Your email app should open with the booking request ready to send.';
        setTimeout(() => { location.href = `mailto:${restaurantEmail}?subject=${subject}&body=${body}`; },120);
        return;
      }
      const wa = whatsappHref(demo.phone);
      if (wa) {
        const text = encodeURIComponent(message);
        if (success) success.hidden = false;
        if (successText) successText.textContent = 'WhatsApp is opening with your booking request ready to send.';
        setTimeout(() => window.open(`${wa}?text=${text}`,'_blank','noopener,noreferrer'),120);
        return;
      }
      if (success) success.hidden = false;
      if (successText) successText.textContent = 'Please call the restaurant to confirm this request.';
    });
  }

  function fail(error) {
    console.error(error);
    document.body.innerHTML = `<main style="min-height:100svh;display:grid;place-items:center;padding:28px;background:#efe9df;color:#151310;font-family:Arial,sans-serif"><div style="max-width:560px"><div style="font:500 9px monospace;letter-spacing:.15em;text-transform:uppercase;color:#746c62;margin-bottom:14px">Restaurant website</div><h1 style="font:400 54px/1 Georgia,serif;margin:0 0 17px">This page is not available.</h1><p style="font:15px/1.7 Arial,sans-serif;color:#655e55;margin:0 0 24px">The demo link may be incomplete or this saved restaurant could not be loaded.</p><a href="/" style="display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 17px;background:#151310;color:#fff;text-decoration:none;font:600 10px Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase">Back to home</a></div></main>`;
  }

  fetchDemo().then(demo => {
    if (page === 'menu') renderMenuPage(demo);
    else if (page === 'gallery') renderGalleryPage(demo);
    else if (page === 'private') renderPrivatePage(demo);
    else if (page === 'contact') renderContactPage(demo);
    else if (page === 'booking') renderBookingPage(demo);
    else renderHome(demo);
  }).catch(fail);
})();
