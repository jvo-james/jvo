const admin = require('firebase-admin');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();
const SITE = process.env.SITE_URL || 'https://jvo.me';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'senujames23@gmail.com').toLowerCase();
const TERMS_VERSION = '2026-09-v2';
const AGREEMENT_VERSION = '2.0';
const RESTAURANT_LEAD_STATUSES = ['New', 'Contacted', 'Replied', 'Interested', 'Won', 'Not now'];
const RESTAURANT_CATEGORIES = ['Main dishes', 'Sides', 'Fresh juices', 'Wine & spirits', 'Dessert'];
const RESTAURANT_CATEGORY_ALIASES = { mains:'Main dishes', main:'Main dishes', 'main dish':'Main dishes', 'main dishes':'Main dishes', sides:'Sides', side:'Sides', 'side dishes':'Sides', drinks:'Wine & spirits', wine:'Wine & spirits', 'wine & spirits':'Wine & spirits', spirits:'Wine & spirits', juice:'Fresh juices', juices:'Fresh juices', 'fresh juice':'Fresh juices', 'fresh juices':'Fresh juices', dessert:'Dessert', desserts:'Dessert', 'small plates':'Sides', lunch:'Main dishes' };
const normalizeRestaurantCategory = value => { const raw = text(value); return RESTAURANT_CATEGORY_ALIASES[raw.toLowerCase()] || (RESTAURANT_CATEGORIES.includes(raw) ? raw : 'Main dishes'); };
const DEFAULT_RESTAURANT_TEMPLATE = {
  name:'The Common Table',
  eyebrow:'Kitchen · Bar · Table',
  tagline:'Dinner worth lingering over.',
  intro:'A neighbourhood restaurant for long lunches, proper dinners and evenings that deserve a little more time.',
  city:'Accra, Ghana',
  address:'18 Olive Street, Osu',
  phone:'+233 20 123 4567',
  email:'hello@restaurant.com',
  hours:'Mon–Thu 12:00–22:00 · Fri–Sat 12:00–23:00 · Sun 13:00–21:00',
  reservationUrl:'',
  orderUrl:'',
  instagramUrl:'',
  logoText:'Common Table',
  primaryCta:'Book a table',
  secondaryCta:'See the menu',
  heroImage:{source:'repo',id:'heroUnsplash',alt:'Elegant restaurant dining room'},
  storyTitle:'Good food. Properly served.',
  storyText:'We cook familiar things with a little edge, pour good drinks and keep the room easy so the evening can take its own shape.',
  storyImage:{source:'repo',id:'diningRoom',alt:'Warm dining room before service'},
  experienceTitle:'Come for dinner. Stay for the evening.',
  experienceText:'Start with something small, settle into a proper plate and let the night run a little longer than planned.',
  popularIntro:'Five parts of the menu that give you a feel for the table.',
  menuIntro:'A considered menu of generous plates, bright sides, fresh juices and a well-stocked bar.',
  menuNote:'Sample menu for concept presentation.',
  menuFooterNote:'The menu can change with the season. Update dishes, descriptions, prices and photos from the studio.',
  galleryTitle:'A room worth seeing.',
  galleryIntro:'The room, the bar, the plates and the little moments between them.',
  privateDiningTitle:'Private dinners, done properly.',
  privateDiningText:'A more personal way to use the room, with space for the people you actually want around the table.',
  privateDiningDetails:'Tell us what you are planning, how many people you have in mind and when you would like to come. We can take it from there.',
  privateDiningCapacity:'Up to 30 guests',
  contactIntro:'Everything you need before you arrive, from hours and directions to the little house notes.',
  dressCode:'Smart casual.',
  parking:'Street parking nearby.',
  reservationNote:'Reservations are recommended.',
  menu:[
    {name:'Charred prawns',category:'Main dishes',description:'Garlic, chilli, lime and warm flatbread.',price:'95',currency:'GHS',featured:true,image:{source:'repo',id:'shrimp',alt:'Charred prawns on a plate'}},
    {name:'House ribeye',category:'Main dishes',description:'Fire-grilled beef, herb butter and a rich pan sauce.',price:'235',currency:'GHS',featured:true,image:{source:'repo',id:'platedSteak',alt:'Ribeye steak'}},
    {name:'Market fish',category:'Main dishes',description:'Fresh catch, bright sauce, seasonal vegetables and steamed rice.',price:'165',currency:'GHS',featured:true,image:{source:'repo',id:'salmon',alt:'Fresh fish plate'}},
    {name:'Chicken supreme',category:'Main dishes',description:'Crisp skin, roast jus, greens and potatoes.',price:'145',currency:'GHS',image:{source:'repo',id:'filet',alt:'Chicken-style plated main'}},
    {name:'Creamy scallops',category:'Main dishes',description:'Seared scallops, parmesan risotto and house vegetables.',price:'175',currency:'GHS',image:{source:'repo',id:'scallops',alt:'Seared scallops'}},
    {name:'Cedar salmon',category:'Main dishes',description:'Roasted salmon, citrus butter and charred greens.',price:'155',currency:'GHS',image:{source:'repo',id:'seafood',alt:'Seafood plate'}},
    {name:'Mushroom risotto',category:'Main dishes',description:'Wild mushrooms, parmesan, herbs and a little truffle oil.',price:'125',currency:'GHS',image:{source:'repo',id:'kitchenDetail',alt:'Mushroom risotto'}},
    {name:'Tomahawk for two',category:'Main dishes',description:'A shareable cut with grilled onions, jus and house potatoes.',price:'420',currency:'GHS',image:{source:'repo',id:'tomahawk',alt:'Tomahawk steak'}},
    {name:'Crispy potatoes',category:'Sides',description:'Roasted garlic, parsley and a light dusting of sea salt.',price:'45',currency:'GHS',image:{source:'repo',id:'baconBites',alt:'Crispy potatoes'}},
    {name:'Charred broccolini',category:'Sides',description:'Lemon, toasted almonds and parmesan.',price:'42',currency:'GHS',image:{source:'repo',id:'smallBites',alt:'Vegetable side'}},
    {name:'Truffle mac',category:'Sides',description:'Creamy macaroni, mature cheese and black pepper.',price:'55',currency:'GHS',image:{source:'repo',id:'smallBites',alt:'Creamy side dish'}},
    {name:'House salad',category:'Sides',description:'Crisp greens, roast vegetables, herbs and citrus dressing.',price:'50',currency:'GHS',image:{source:'repo',id:'salad',alt:'Fresh restaurant salad'}},
    {name:'Warm flatbread',category:'Sides',description:'Olive oil, sea salt and a whipped herb butter.',price:'35',currency:'GHS',image:{source:'repo',id:'tableSetting',alt:'Warm flatbread'}},
    {name:'Creamed spinach',category:'Sides',description:'Silky spinach, parmesan and nutmeg.',price:'48',currency:'GHS',image:{source:'repo',id:'platedDetail',alt:'Creamed spinach side'}},
    {name:'Corn ribs',category:'Sides',description:'Charred sweetcorn, lime butter and smoked chilli.',price:'40',currency:'GHS',image:{source:'repo',id:'candlelight',alt:'Corn side'}},
    {name:'Pineapple ginger press',category:'Fresh juices',description:'Fresh pineapple, ginger and lime served ice-cold.',price:'32',currency:'GHS',image:{source:'repo',id:'cocktails',alt:'Fresh pineapple drink'}},
    {name:'Passion fruit cooler',category:'Fresh juices',description:'Passion fruit, orange and a little mint.',price:'32',currency:'GHS',image:{source:'repo',id:'cocktail',alt:'Passion fruit drink'}},
    {name:'Watermelon lime',category:'Fresh juices',description:'Pressed watermelon, lime and a touch of sea salt.',price:'30',currency:'GHS',image:{source:'repo',id:'cocktails',alt:'Watermelon drink'}},
    {name:'Mango citrus',category:'Fresh juices',description:'Ripe mango, orange and a squeeze of lemon.',price:'35',currency:'GHS',image:{source:'repo',id:'cocktail',alt:'Mango drink'}},
    {name:'Green garden juice',category:'Fresh juices',description:'Apple, cucumber, mint and lemon.',price:'30',currency:'GHS',image:{source:'repo',id:'cocktail3',alt:'Green juice'}},
    {name:'House red',category:'Wine & spirits',description:'A soft, fruit-forward red chosen for steak and slow dinners.',price:'78',currency:'GHS',image:{source:'repo',id:'wine',alt:'Red wine at the table'}},
    {name:'House white',category:'Wine & spirits',description:'Crisp and bright with citrus notes.',price:'78',currency:'GHS',image:{source:'repo',id:'wineWall',alt:'Wine selection'}},
    {name:'Sparkling brut',category:'Wine & spirits',description:'Dry bubbles for the beginning or the celebration.',price:'110',currency:'GHS',image:{source:'repo',id:'champagne',alt:'Champagne'}},
    {name:'Old fashioned',category:'Wine & spirits',description:'Bourbon, orange bitters and a slow finish.',price:'75',currency:'GHS',image:{source:'repo',id:'whiskey',alt:'Whiskey cocktail'}},
    {name:'Reserve whiskey',category:'Wine & spirits',description:'A measured pour from the back bar.',price:'95',currency:'GHS',image:{source:'repo',id:'bourbon',alt:'Whiskey selection'}},
    {name:'Burnt cheesecake',category:'Dessert',description:'Soft centre, caramelised top and sea salt.',price:'55',currency:'GHS',featured:true,image:{source:'repo',id:'dessert',alt:'Burnt cheesecake'}},
    {name:'Chocolate tart',category:'Dessert',description:'Dark chocolate, whipped cream and cocoa nibs.',price:'60',currency:'GHS',image:{source:'repo',id:'platedDetail',alt:'Chocolate dessert'}},
    {name:'Lemon posset',category:'Dessert',description:'Silky citrus cream with shortbread and berries.',price:'50',currency:'GHS',image:{source:'repo',id:'dessert',alt:'Lemon dessert'}},
    {name:'Warm bread pudding',category:'Dessert',description:'Brioche, vanilla custard and a warm caramel sauce.',price:'58',currency:'GHS',image:{source:'repo',id:'platedDetail',alt:'Warm dessert'}},
    {name:'Fruit and cream',category:'Dessert',description:'Seasonal fruit, softly whipped cream and mint.',price:'48',currency:'GHS',image:{source:'repo',id:'diningRoomWide',alt:'Fresh fruit dessert'}}
  ],
  gallery:[
    {image:{source:'repo',id:'diningRoomWide',alt:'Warm dining room'}},
    {image:{source:'repo',id:'barInterior',alt:'Restaurant bar'}},
    {image:{source:'repo',id:'platedSteak',alt:'Steak from the kitchen'}},
    {image:{source:'repo',id:'candlelight',alt:'Candlelit table'}},
    {image:{source:'repo',id:'cocktail',alt:'Signature drink'}},
    {image:{source:'repo',id:'privateRoom',alt:'Private dining room'}},
    {image:{source:'repo',id:'tableConversation',alt:'Dinner with friends'}},
    {image:{source:'repo',id:'wine',alt:'Wine at the table'}},
    {image:{source:'repo',id:'exterior',alt:'Restaurant exterior'}}
  ],
  leadStatus:'New',notes:'',recipientName:'',recipientEmail:''
};
const DEFAULT_RESTAURANT_EMAIL = {
  subject:'A website idea for {{restaurantName}}',
  body:'Hi {{recipientName}},\n\nI came across {{restaurantName}} and spent a few minutes looking at how the restaurant comes across online.\n\nI put together a short website concept using your restaurant as the starting point. It is not a generic mockup, I shaped the direction around your food, the atmosphere and the way someone would actually decide to visit:\n{{demoLink}}\n\nThere is no obligation at all. I just thought it might be useful to see the idea before deciding whether it is something worth exploring.\n\nIf you like the direction, I can build the full site around your real menu, photography, reservations or ordering flow.\n\nYou can reply to this email, or reach me on WhatsApp at {{whatsappNumber}}.\n\nThanks,\n{{yourName}}\nCEO, {{businessName}}'
};
function slugify(value) {
  return text(value).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'restaurant';
}
async function uniqueRestaurantSlug(base, ignoreId = '') {
  let slug = slugify(base), n = 2;
  while (true) {
    const q = await db.collection('restaurantDemos').where('slug', '==', slug).limit(2).get();
    const conflict = q.docs.some(d => d.id !== ignoreId);
    if (!conflict) return slug;
    slug = `${slugify(base)}-${n++}`;
  }
}
function cleanImageObject(image, fallback = {}) {
  const source = image?.source === 'cloudinary' ? 'cloudinary' : image?.source === 'url' ? 'url' : 'repo';
  const out = { source, id: text(image?.id), url: (source === 'cloudinary' || source === 'url') ? safeUrl(image?.url) : '', publicId: source === 'cloudinary' ? text(image?.publicId) : '', alt: text(image?.alt) };
  if (source === 'repo' && !out.id && fallback.id) out.id = fallback.id;
  return out;
}
function cleanRestaurantDemoPayload(body, old = {}) {
  const base = { ...DEFAULT_RESTAURANT_TEMPLATE, ...old };
  const menu = Array.isArray(body.menu) ? body.menu.slice(0, 30).map((item, i) => ({
    name: text(item?.name).slice(0, 100) || `Menu item ${i + 1}`,
    category: normalizeRestaurantCategory(item?.category),
    description: text(item?.description).slice(0, 300), price: text(item?.price).slice(0, 32), currency: text(item?.currency).slice(0, 8), featured: Boolean(item?.featured),
    image: cleanImageObject(item?.image, { id: 'platedSteak' })
  })) : (old.menu || DEFAULT_RESTAURANT_TEMPLATE.menu);
  const gallery = Array.isArray(body.gallery) ? body.gallery.slice(0, 12).map(entry => ({ image: cleanImageObject(entry?.image, { id: 'warmTerrace' }) })).filter(entry => entry.image.id || entry.image.url) : (old.gallery || DEFAULT_RESTAURANT_TEMPLATE.gallery);
  const allowedStatus = RESTAURANT_LEAD_STATUSES.includes(body.leadStatus) ? body.leadStatus : (old.leadStatus || 'New');
  return {
    name: text(body.name).slice(0, 100) || base.name, eyebrow: text(body.eyebrow).slice(0, 80) || base.eyebrow, tagline: text(body.tagline).slice(0, 180) || base.tagline,
    intro: text(body.intro).slice(0, 500), city: text(body.city).slice(0, 100), address: text(body.address).slice(0, 200), phone: text(body.phone).slice(0, 60), email: text(body.email).toLowerCase().slice(0, 140),
    hours: text(body.hours).slice(0, 260), reservationUrl: safeUrl(body.reservationUrl), orderUrl: safeUrl(body.orderUrl), instagramUrl: safeUrl(body.instagramUrl), logoText: text(body.logoText).slice(0, 80),
    primaryCta: text(body.primaryCta).slice(0, 40) || 'Book a table', secondaryCta: text(body.secondaryCta).slice(0, 40) || 'See the menu',
    heroImage: cleanImageObject(body.heroImage, { id: 'warmTerrace' }), storyTitle: text(body.storyTitle).slice(0, 120), storyText: text(body.storyText).slice(0, 1000), storyImage: cleanImageObject(body.storyImage, { id: 'kitchenHands' }),
    experienceTitle: text(body.experienceTitle).slice(0, 120), experienceText: text(body.experienceText).slice(0, 500),
    popularIntro: text(body.popularIntro).slice(0, 320), menuIntro: text(body.menuIntro).slice(0, 500), menuNote: text(body.menuNote).slice(0, 320), menuFooterNote: text(body.menuFooterNote).slice(0, 500),
    galleryTitle: text(body.galleryTitle).slice(0, 140), galleryIntro: text(body.galleryIntro).slice(0, 320),
    privateDiningTitle: text(body.privateDiningTitle).slice(0, 140), privateDiningText: text(body.privateDiningText).slice(0, 700), privateDiningDetails: text(body.privateDiningDetails).slice(0, 900), privateDiningCapacity: text(body.privateDiningCapacity).slice(0, 80),
    contactIntro: text(body.contactIntro).slice(0, 400), dressCode: text(body.dressCode).slice(0, 160), parking: text(body.parking).slice(0, 200), reservationNote: text(body.reservationNote).slice(0, 240),
    menu, gallery, leadStatus: allowedStatus, notes: text(body.notes).slice(0, 1200),
    recipientName: text(body.recipientName).slice(0, 100), recipientEmail: text(body.recipientEmail).toLowerCase().slice(0, 140)
  };
}
function decorateRestaurantImage(image) {
  const value = image && typeof image === 'object' ? { ...image } : image;
  const url = resolveRestaurantImageUrl(value);
  if (!value || typeof value !== 'object') return value || {};
  return url ? { ...value, url } : value;
}
function publicRestaurantDemo(d) {
  const menu = Array.isArray(d.menu) ? d.menu.map(item => ({ ...item, image: decorateRestaurantImage(item.image) })) : [];
  const gallery = Array.isArray(d.gallery) ? d.gallery.map(entry => ({ ...entry, image: decorateRestaurantImage(entry.image) })) : [];
  return { id:d.id, slug:d.slug, name:d.name, eyebrow:d.eyebrow, tagline:d.tagline, intro:d.intro, city:d.city, address:d.address, phone:d.phone, email:d.email, hours:d.hours,
    reservationUrl:d.reservationUrl||'', orderUrl:d.orderUrl||'', instagramUrl:d.instagramUrl||'', logoText:d.logoText||d.name, primaryCta:d.primaryCta||'Book a table', secondaryCta:d.secondaryCta||'See the menu',
    heroImage:decorateRestaurantImage(d.heroImage), storyTitle:d.storyTitle, storyText:d.storyText, storyImage:decorateRestaurantImage(d.storyImage), experienceTitle:d.experienceTitle, experienceText:d.experienceText,
    popularIntro:d.popularIntro||'', menuIntro:d.menuIntro||'', menuNote:d.menuNote||'', menuFooterNote:d.menuFooterNote||'', galleryTitle:d.galleryTitle||'', galleryIntro:d.galleryIntro||'',
    privateDiningTitle:d.privateDiningTitle||'', privateDiningText:d.privateDiningText||'', privateDiningDetails:d.privateDiningDetails||'', privateDiningCapacity:d.privateDiningCapacity||'', contactIntro:d.contactIntro||'', dressCode:d.dressCode||'', parking:d.parking||'', reservationNote:d.reservationNote||'',
    menu, gallery, createdAt:d.createdAt, updatedAt:d.updatedAt, leadStatus:d.leadStatus||'New' };
}
function restaurantDemoLink(slug) { return `${SITE}/restaurant/${encodeURIComponent(slug)}`; }
function resolveRestaurantImageUrl(image) {
  if (image?.source === 'cloudinary' && image.url) return image.url;
  if (image?.source === 'url' && image.url) return /^https:\/\//i.test(text(image.url)) ? text(image.url) : '';
  if (image?.source === 'repo' && image.url) {
    const raw = text(image.url);
    if (/^https?:\/\//i.test(raw)) return raw;
    return raw.startsWith('/') ? `${SITE}${raw}` : `${SITE}/${raw.replace(/^\/+/, '')}`;
  }
  const map = {
    heroUnsplash:'https://images.unsplash.com/photo-1766832255363-c9f060ade8b0?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=88&w=3200', heroUnsplashWarm:'https://images.unsplash.com/photo-1743793056164-67c6ce029d34?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=88&w=2600', eveningUnsplash:'https://images.unsplash.com/photo-1774509619298-5ee42287b75b?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=88&w=2400', platedUnsplash:'https://images.unsplash.com/photo-1753722421529-478a04442baf?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=88&w=2200',
    diningRoom:'restaurant-hero.jpg', diningRoomWide:'restaurant-sunshine.jpg', diningRoomBlue:'restaurant-reserve.jpg', barInterior:'restaurant-interior.jpg', exterior:'restaurant-exterior.jpg', candlelight:'restaurant-blacklit.jpg',
    platedSteak:'restaurant-ribeye.jpg', tomahawk:'restaurant-tomahawk.jpg', filet:'restaurant-filet.jpg', salmon:'restaurant-salmon.jpg', scallops:'restaurant-risotto.jpg', shrimp:'restaurant-shrimp.jpg', salad:'restaurant-salad.jpg', seafood:'restaurant-seafood.jpg', smallBites:'restaurant-menusides.jpg', baconBites:'restaurant-bacon.jpg',
    dessert:'restaurant-gallery4.jpg', platedDetail:'restaurant-gallery3.jpg', tableSetting:'restaurant-plate.jpg', kitchenDetail:'restaurant-gallery6.jpg', cocktail:'restaurant-cocktail1.jpg', cocktails:'restaurant-cocktail3.jpg', cocktail3:'restaurant-cocktail3.jpg', champagne:'restaurant-champagne.jpg', wine:'restaurant-wine1.jpg', bourbon:'restaurant-bourbon1.jpg', whiskey:'restaurant-whiskey.jpg', barShelf:'restaurant-bourbon4.jpg', privateRoom:'restaurant-reserve2.jpg', tableConversation:'restaurant-c2.jpg', gathering:'restaurant-c.jpg', wineWall:'restaurant-wine2.jpg', barTable:'restaurant-gallery7.jpg',
    diningTable:'restaurant-plate.jpg', warmTerrace:'restaurant-sunshine.jpg', kitchenHands:'restaurant-gallery6.jpg', baker:'restaurant-gallery4.jpg', platedDish:'restaurant-ribeye.jpg', serviceWarm:'restaurant-gallery7.jpg', nightStreet:'restaurant-exterior.jpg'
  };
  if (image?.source === 'repo' && map[image.id]) { const mapped = map[image.id]; return /^https:\/\//i.test(mapped) ? mapped : `${SITE}/images/${mapped}`; }
  return '';
}
function renderOutreachEmailHtml({ demo, recipientName, body, subject, link, settings }) {
  const ownerName = text(settings.ownerName || 'James Senu');
  const brandName = 'JVO WEB';
  const replyEmail = text(settings.email || 'senujames23@gmail.com');
  const whatsapp = text(settings.whatsapp || '0594121246');
  const whatsappDigits = whatsapp.replace(/\D/g,'');
  const whatsappIntl = whatsappDigits.startsWith('0') ? `233${whatsappDigits.slice(1)}` : whatsappDigits;
  const whatsappUrl = whatsappIntl ? `https://wa.me/${whatsappIntl}` : '';
  const image = resolveRestaurantImageUrl(demo.heroImage);
  const restaurantName = esc(demo.name || 'your restaurant');
  const recipient = esc(recipientName || 'there');
  const cleanSubject = esc(subject || `A website idea for ${demo.name || 'your restaurant'}`);
  const paragraphs = String(body || '')
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<tr><td style="padding:0 0 16px;font:400 15px/1.75 Arial,Helvetica,sans-serif;color:#4a463f">${esc(p).replace(/\n/g,'<br>')}</td></tr>`)
    .join('');
  const whatsappCell = whatsappUrl ? `<a href="${esc(whatsappUrl)}" style="text-decoration:none;color:#31523b;font:600 12px/1.2 Arial,Helvetica,sans-serif"><img src="${SITE}/images/whatsapp-mark.png" width="18" height="18" alt="WhatsApp" style="display:inline-block;vertical-align:middle;border:0;margin:0 8px 0 0">WhatsApp · ${esc(whatsapp)}</a>` : '';
  const imageRow = image ? `<tr><td style="padding:0"><img src="${esc(image)}" width="620" alt="${restaurantName}" style="display:block;width:100%;height:260px;object-fit:cover;border:0"></td></tr>` : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="x-apple-disable-message-reformatting"><title>${cleanSubject}</title></head><body style="margin:0;padding:0;background:#f3efe8;color:#171512;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">A website concept prepared for ${restaurantName} by ${esc(ownerName)} at ${brandName}.</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#f3efe8"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:620px;background:#fffdf9;border:1px solid #ddd6cc"><tr><td style="padding:20px 26px;border-bottom:1px solid #e5ded4"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font:700 19px/1 Arial,Helvetica,sans-serif;color:#171512;letter-spacing:-.02em">${brandName}</td><td align="right" style="font:500 9px/1 Arial,Helvetica,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#887f74">James Senu</td></tr></table></td></tr>${imageRow}<tr><td style="padding:32px 28px 0"><div style="font:600 9px/1 Arial,Helvetica,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#7d6658;margin:0 0 13px">A note for ${restaurantName}</div><h1 style="margin:0 0 10px;font:400 34px/1.08 Georgia,'Times New Roman',serif;letter-spacing:-.025em;color:#171512">A website idea for ${restaurantName}.</h1><p style="margin:0 0 24px;font:400 13px/1.7 Arial,Helvetica,sans-serif;color:#8a8176">Prepared by ${esc(ownerName)}, CEO of ${brandName}.</p></td></tr><tr><td style="padding:0 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${paragraphs}<tr><td style="padding:2px 0 22px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#171512" style="background:#171512"><a href="${esc(link)}" style="display:block;color:#ffffff;text-decoration:none;padding:14px 19px;font:700 11px/1 Arial,Helvetica,sans-serif;letter-spacing:.08em;text-transform:uppercase">View the concept</a></td></tr></table></td></tr><tr><td style="padding:16px 0 0;border-top:1px solid #e5ded4"><p style="margin:0 0 10px;font:400 12px/1.6 Arial,Helvetica,sans-serif;color:#777067">You can reply to this email or reach me directly on WhatsApp.</p><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td>${whatsappCell}</td></tr></table></td></tr></table></td></tr><tr><td style="padding:26px 28px 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-top:20px;border-top:1px solid #e5ded4;font:400 13px/1.65 Arial,Helvetica,sans-serif;color:#5b554e">Thanks,<br><strong style="color:#171512">${esc(ownerName)}</strong><br>CEO, ${brandName}</td><td align="right" valign="bottom" style="padding-top:20px;border-top:1px solid #e5ded4;font:400 10px/1.6 Arial,Helvetica,sans-serif;color:#8b837a">${esc(replyEmail)}</td></tr></table></td></tr><tr><td style="padding:15px 28px;background:#171512"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font:700 10px/1 Arial,Helvetica,sans-serif;letter-spacing:.08em;color:#eee8df">JVO WEB</td><td align="right" style="font:400 9px/1.4 Arial,Helvetica,sans-serif;color:#aaa197">Web design · development · digital experiences</td></tr></table></td></tr></table></td></tr></table></body></html>`;
}
const ALLOWED_CURRENCIES = ['GHS', 'USD', 'GBP', 'EUR'];
const STATUSES = ['Draft', 'Agreement Sent', 'Agreement Signed', 'Awaiting Deposit', 'Deposit Received', 'Development', 'Client Review', 'Approved', 'Awaiting Final Payment', 'Fully Paid', 'Launched', 'Completed', 'On Hold', 'Cancelled'];

const now = () => new Date().toISOString();
const json = (statusCode, body, extra = {}) => ({
  statusCode,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...extra
  },
  body: JSON.stringify(body)
});
const text = value => String(value == null ? '' : value).trim();
const safeUrl = value => {
  const v = text(value);
  if (!v) return '';
  try {
    const u = new URL(v);
    return u.protocol === 'https:' ? u.toString() : '';
  } catch { return ''; }
};
const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cleanProject = (id, d) => ({ id, ...d });
const currency = value => ALLOWED_CURRENCIES.includes(value) ? value : 'GHS';
const amount = value => Math.round(Number(value || 0) * 100) / 100;
const money = (value, code = 'GHS') => {
  try { return new Intl.NumberFormat('en-GH', { style: 'currency', currency: code, maximumFractionDigits: 2 }).format(Number(value || 0)); }
  catch { return `${code} ${Number(value || 0).toFixed(2)}`; }
};
const formatDate = value => value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '';
const shortDate = value => value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '';

async function authUser(event) {
  const h = event.headers.authorization || event.headers.Authorization || '';
  if (!h.startsWith('Bearer ')) throw new Error('AUTH');
  return admin.auth().verifyIdToken(h.slice(7));
}
async function adminOnly(event) {
  const u = await authUser(event);
  if ((u.email || '').toLowerCase() !== ADMIN_EMAIL) throw new Error('FORBIDDEN');
  return u;
}
async function activity(projectId, textValue, kind = 'note', meta = {}) {
  await db.collection('activities').add({ projectId, text: textValue, kind, meta, createdAt: now() });
}
async function nextNumber(key) {
  const ref = db.collection('meta').doc('counter');
  return db.runTransaction(async t => {
    const d = await t.get(ref);
    const n = (d.exists ? Number(d.data()[key] || 0) : 0) + 1;
    t.set(ref, { [key]: n }, { merge: true });
    return n;
  });
}
async function getSettings() {
  const d = await db.collection('settings').doc('business').get();
  return {
    businessName: 'JVO WEB', ownerName: 'James Senu', email: 'senujames23@gmail.com', phone: '0594121246', whatsapp: '0594121246', snapchat: 'jvo_james', address: 'Accra, Ghana', defaultCurrency: 'GHS', supportDays: 30, paymentInstructions: '', paymentLink: '', logoUrl: '', emailSenderName: 'James Senu | JVO WEB',
    ...(d.exists ? d.data() : {})
  };
}
function agreementTerms(supportDays) {
  const days = Number(supportDays || 30);
  return [
    { id: 'payment', title: 'Payment', body: 'The agreed upfront payment must be received before work starts. Any remaining balance is due after the client approves the finished website.' },
    { id: 'start', title: 'When work starts', body: 'Work officially starts only after this agreement is signed and the required upfront payment is received.' },
    { id: 'deposit', title: 'Upfront payment', body: 'The upfront payment is not refundable once development has officially started.' },
    { id: 'scope', title: 'Extra work', body: 'The price covers the scope written in this agreement. New pages, features, integrations or other additions may be priced separately before they are added.' },
    { id: 'support', title: 'Bug support', body: `For ${days} days after launch, JVO will fix broken layouts or broken code caused by the original setup at no extra cost.` },
    { id: 'thirdparty', title: 'Third-party issues', body: 'Free support does not cover hosting problems, external APIs, payment gateway changes, plugin updates or expired domains.' },
    { id: 'handover', title: 'Final payment and handover', body: 'The site will only be launched, transferred or handed over after all agreed payments have been received.' },
    { id: 'ownership', title: 'Ownership', body: 'Ownership of the finished work moves to the client after full payment. JVO may show the finished website in its portfolio and promotional work.' },
    { id: 'content', title: 'Client content', body: 'The client is responsible for the text, images, logos and other content they provide and confirms that they have permission to use it.' },
    { id: 'delays', title: 'Delays', body: 'If content, access details, feedback or approvals are delayed, delivery dates may also move.' },
    { id: 'late', title: 'Late final payment', body: 'A final payment that remains unpaid for more than 7 days may cause JVO-managed access or services to be paused until payment is made.' },
    { id: 'cancel', title: 'Cancellation', body: 'If the client cancels after work starts, the upfront payment is kept. Any completed work above that value must also be paid before files are handed over. If JVO cancels, unearned fees are refunded.' }
  ];
}
function paymentPlanFromBody(body, totalValue) {
  const type = ['50-50', '60-40', '100', 'custom'].includes(body.paymentPlanType) ? body.paymentPlanType : '50-50';
  let milestones = [];
  if (type === 'custom' && Array.isArray(body.milestones)) {
    milestones = body.milestones.map((m, i) => ({ id: `m${i + 1}`, label: text(m.label) || `Milestone ${i + 1}`, percent: Number(m.percent || 0) })).filter(m => m.percent > 0);
  } else {
    const map = { '50-50': [50, 50], '60-40': [60, 40], '100': [100] };
    milestones = map[type].map((p, i, arr) => ({ id: `m${i + 1}`, label: i === 0 ? 'Upfront payment' : (i === arr.length - 1 ? 'Final payment' : `Milestone ${i + 1}`), percent: p }));
  }
  const percentTotal = milestones.reduce((s, m) => s + Number(m.percent || 0), 0);
  if (!milestones.length || Math.abs(percentTotal - 100) > 0.01) throw new Error('Payment milestones must add up to 100%.');
  milestones = milestones.map(m => ({ ...m, amount: amount(totalValue * m.percent / 100) }));
  const diff = amount(totalValue - milestones.reduce((s, m) => s + m.amount, 0));
  if (diff) milestones[milestones.length - 1].amount = amount(milestones[milestones.length - 1].amount + diff);
  return { type, milestones };
}
async function projectPayments(projectId) {
  const q = await db.collection('payments').where('projectId', '==', projectId).get();
  return q.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
}
async function projectChanges(projectId) {
  const q = await db.collection('changeRequests').where('projectId', '==', projectId).get();
  return q.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
}
function ledgerTotals(project, payments, changes = []) {
  const contract = amount(project.total || 0);
  const extras = amount(changes.filter(x => ['Approved', 'Paid', 'Done'].includes(x.status)).reduce((s, x) => s + Number(x.amount || 0), 0));
  const paid = amount(payments.filter(x => x.status !== 'Voided').reduce((s, x) => s + (x.direction === 'out' ? -Number(x.amount || 0) : Number(x.amount || 0)), 0));
  const totalDue = amount(contract + extras);
  return { contract, extras, totalDue, paid, outstanding: Math.max(0, amount(totalDue - paid)), credit: Math.max(0, amount(paid - totalDue)) };
}
function publicSettings(settings) {
  return { businessName: settings.businessName, ownerName: settings.ownerName, email: settings.email, phone: settings.phone, whatsapp: settings.whatsapp, address: settings.address, logoUrl: settings.logoUrl || '' };
}
function clientLink(project) { return `${SITE}/form.html?id=${project.publicToken}`; }

function emailFrame({ preheader = '', eyebrow = 'JVO', title, intro = '', content = '', buttonLabel = '', buttonUrl = '', settings }) {
  const brand = esc(settings.businessName || 'JVO');
  const owner = esc(settings.ownerName || 'James Senu');
  const email = esc(settings.email || 'senujames23@gmail.com');
  const phone = esc(settings.phone || '');
  const button = buttonLabel && buttonUrl ? `<tr><td style="padding:10px 0 28px"><a href="${esc(buttonUrl)}" style="display:inline-block;background:#171512;color:#fff;text-decoration:none;padding:14px 20px;font:600 13px Arial,sans-serif">${esc(buttonLabel)}</a></td></tr>` : '';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title></head><body style="margin:0;background:#ebe5dc;color:#171512"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ebe5dc;padding:26px 12px"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#fffdf8;border:1px solid #d8d0c4"><tr><td style="padding:22px 26px;border-bottom:1px solid #d8d0c4"><table width="100%" role="presentation"><tr><td style="font:700 25px Georgia,serif">${brand}</td><td align="right" style="font:500 10px monospace;letter-spacing:.12em;text-transform:uppercase;color:#756f65">PROJECT DESK</td></tr></table></td></tr><tr><td style="padding:42px 26px 10px"><div style="font:600 10px monospace;letter-spacing:.14em;text-transform:uppercase;color:#c74e34;margin-bottom:14px">${esc(eyebrow)}</div><h1 style="margin:0;font:600 42px/1.02 Georgia,serif;letter-spacing:-1px">${esc(title)}</h1>${intro ? `<p style="margin:18px 0 0;font:400 15px/1.7 Arial,sans-serif;color:#5f594f">${esc(intro)}</p>` : ''}</td></tr><tr><td style="padding:12px 26px 4px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${content}${button}</table></td></tr><tr><td style="padding:25px 26px 34px"><p style="margin:0;font:400 14px/1.7 Arial,sans-serif">Thanks,<br><strong>${owner}</strong><br>${brand}</p></td></tr><tr><td style="background:#171512;color:#e8e0d5;padding:20px 26px"><table width="100%" role="presentation"><tr><td style="font:600 11px Arial,sans-serif">jvo.me</td><td align="right" style="font:400 10px Arial,sans-serif;color:#aaa196">${email}${phone ? ` &nbsp; ${phone}` : ''}</td></tr></table></td></tr></table></td></tr></table></body></html>`;
}
const infoRow = (label, value, strong = false) => `<tr><td style="padding:13px 0;border-bottom:1px solid #e6dfd5;font:500 10px monospace;text-transform:uppercase;color:#756f65">${esc(label)}</td><td align="right" style="padding:13px 0;border-bottom:1px solid #e6dfd5;font:${strong ? '700 18px Georgia,serif' : '600 13px Arial,sans-serif'}">${esc(value)}</td></tr>`;
async function sendMail({ to, subject, textMessage, html, projectId = '', projectName = '', template = 'custom', idempotencyKey = '', demoId = '', restaurantName = '', demoLink = '' }) {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is missing.');
  if (idempotencyKey) {
    const seen = await db.collection('emailKeys').doc(idempotencyKey).get();
    if (seen.exists) return { id: seen.data().resendId || '', duplicate: true };
  }
  const settings = await getSettings();
  const from = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || `James Senu | JVO WEB <projects@jvo.me>`;
  const replyTo = process.env.RESEND_REPLY_TO || process.env.REPLY_TO || 'senujames23@gmail.com';
  const payload = { from, to: [to], subject, html, text: textMessage, reply_to: replyTo };
  const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  const d = await r.json();
  if (!r.ok) throw new Error(d.message || 'Email could not be sent.');
  const emailRecord = { to, subject, message: textMessage, html, template, projectId, projectName, demoId, restaurantName, demoLink, resendId: d.id || '', createdAt: now() };
  await db.collection('emails').add(emailRecord);
  if (idempotencyKey) await db.collection('emailKeys').doc(idempotencyKey).set({ resendId: d.id || '', createdAt: now() });
  return d;
}
async function sendTemplate(template, project, data = {}) {
  const settings = await getSettings();
  const to = data.to || project.clientEmail;
  if (!to) return null;
  const link = clientLink(project);
  const c = project.currency || 'GHS';
  let title = '', subject = '', intro = '', rows = '', buttonLabel = 'View project', buttonUrl = link, textMessage = '';
  if (template === 'agreement_ready') {
    title = 'Your project agreement is ready'; subject = `${project.projectName}: agreement ready`; intro = 'Please check the project details and sign when everything looks right.';
    rows = infoRow('Project', project.projectName) + infoRow('Project value', money(project.total, c), true) + infoRow('Reference', project.ref);
  } else if (template === 'agreement_signed') {
    title = 'Agreement signed'; subject = `${project.projectName}: agreement signed`; intro = 'Your agreement has been saved. The next step is the upfront payment.';
    rows = infoRow('Project', project.projectName) + infoRow('Upfront payment', money(data.depositDue || 0, c), true) + infoRow('Reference', project.ref);
  } else if (template === 'payment_received') {
    title = data.fullyPaid ? 'Payment received in full' : 'Payment received'; subject = `${project.projectName}: payment received`; intro = data.fullyPaid ? 'Your project is fully paid. Thank you.' : 'Your payment has been recorded successfully.';
    rows = infoRow('Payment received', money(data.paymentAmount, c), true) + infoRow('Receipt', data.receiptNo || '') + infoRow('Total paid', money(data.paid, c)) + infoRow('Outstanding', money(data.outstanding, c), true);
  } else if (template === 'deposit_reminder') {
    title = 'Your upfront payment is due'; subject = `${project.projectName}: payment reminder`; intro = 'Development starts after the upfront payment is received.';
    rows = infoRow('Amount due', money(data.amountDue || 0, c), true) + infoRow('Reference', project.ref);
  } else if (template === 'review_ready') {
    title = 'Your website is ready to review'; subject = `${project.projectName}: ready for review`; intro = 'Have a look and tell me if you approve it or if you want changes.';
    rows = infoRow('Project', project.projectName) + infoRow('Reference', project.ref);
  } else if (template === 'payment_reminder') {
    title = 'There is a balance on your project'; subject = `${project.projectName}: payment reminder`; intro = 'The amount below is still outstanding.';
    rows = infoRow('Outstanding', money(data.outstanding || 0, c), true) + infoRow('Reference', project.ref);
  } else if (template === 'launched') {
    title = 'Your website is live'; subject = `${project.projectName}: website launched`; intro = 'Your website has been launched successfully.';
    rows = infoRow('Project', project.projectName) + (project.liveUrl ? infoRow('Website', project.liveUrl) : '') + infoRow('Reference', project.ref);
    if (project.liveUrl) { buttonLabel = 'Open website'; buttonUrl = project.liveUrl; }
  } else if (template === 'change_order') {
    title = 'Additional work to approve'; subject = `${project.projectName}: additional work`; intro = 'I have added the extra work we discussed. Please review it before I start.';
    rows = infoRow('Additional work', data.description || '') + infoRow('Price', money(data.amount, c), true) + infoRow('Reference', project.ref);
  } else {
    title = data.title || subject || 'Message from JVO'; subject = data.subject || `${project.projectName}: message`; intro = data.intro || data.message || '';
  }
  textMessage = `${title}\n\n${intro}\n\nProject: ${project.projectName}\nReference: ${project.ref}\n\n${link}`;
  const html = emailFrame({ preheader: intro, eyebrow: project.ref, title, intro, content: rows, buttonLabel, buttonUrl, settings });
  return sendMail({ to, subject, textMessage, html, projectId: project.id, projectName: project.projectName, template, idempotencyKey: data.idempotencyKey || '' });
}
async function rateLimit(event, token, action, limit = 20) {
  const ip = event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'] || 'unknown';
  const bucket = Math.floor(Date.now() / 60000);
  const key = crypto.createHash('sha256').update(`${ip}|${token}|${action}|${bucket}`).digest('hex');
  const ref = db.collection('rateLimits').doc(key);
  await db.runTransaction(async t => {
    const d = await t.get(ref); const count = d.exists ? Number(d.data().count || 0) : 0;
    if (count >= limit) throw new Error('RATE');
    t.set(ref, { count: count + 1, createdAt: now() }, { merge: true });
  });
}
async function getProjectByToken(token) {
  const q = await db.collection('projects').where('publicToken', '==', token).limit(1).get();
  if (q.empty) return null;
  return cleanProject(q.docs[0].id, q.docs[0].data());
}
async function pdfBuffer(builder) {
  const doc = new PDFDocument({ size: 'A4', margin: 54, info: { Creator: 'JVO Desk' } });
  const chunks = [];
  doc.on('data', c => chunks.push(c));
  const done = new Promise((resolve, reject) => { doc.on('end', () => resolve(Buffer.concat(chunks))); doc.on('error', reject); });
  builder(doc); doc.end(); return done;
}
function pdfHeader(doc, settings, label) {
  doc.font('Helvetica-Bold').fontSize(20).text(settings.businessName || 'JVO');
  doc.font('Helvetica').fontSize(8).fillColor('#77716a').text(label.toUpperCase(), { align: 'right' });
  doc.moveDown(1.2).strokeColor('#d6cec1').moveTo(54, doc.y).lineTo(541, doc.y).stroke().fillColor('#171512').moveDown(1.2);
}
function pdfSection(doc, heading, body) {
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#171512').text(heading);
  doc.moveDown(.35).font('Helvetica').fontSize(9.5).fillColor('#4f4a43').text(body, { lineGap: 3 }); doc.moveDown(.9);
}
async function agreementPdf(project, agreement, settings) {
  return pdfBuffer(doc => {
    pdfHeader(doc, settings, 'Signed project agreement');
    doc.font('Helvetica-Bold').fontSize(28).fillColor('#171512').text(agreement.projectName || project.projectName);
    doc.moveDown(.35).font('Helvetica').fontSize(9).fillColor('#77716a').text(`Reference: ${agreement.ref || project.ref}`);
    doc.moveDown(1.3);
    const facts = [
      ['Client', agreement.clientName], ['Email', agreement.clientEmail], ['Phone', agreement.clientPhone], ['Company', agreement.clientCompany || 'Not provided'],
      ['Project value', money(agreement.total, agreement.currency)], ['Signed', `${formatDate(agreement.serverSignedAt)} UTC`], ['Terms version', agreement.termsVersion]
    ];
    facts.forEach(([k,v]) => { doc.font('Helvetica-Bold').fontSize(8).fillColor('#77716a').text(k.toUpperCase()); doc.font('Helvetica').fontSize(10).fillColor('#171512').text(String(v || '')); doc.moveDown(.5); });
    doc.moveDown(.5); pdfSection(doc, 'Project scope', agreement.scope || '');
    if (agreement.features?.length) pdfSection(doc, 'Included features', agreement.features.join(' • '));
    pdfSection(doc, 'Payment plan', (agreement.paymentPlan?.milestones || []).map(m => `${m.label}: ${m.percent}% (${money(m.amount, agreement.currency)})`).join('\n'));
    doc.addPage(); pdfHeader(doc, settings, 'Terms');
    (agreement.terms || []).forEach(t => pdfSection(doc, t.title, t.body));
    doc.moveDown(.7).strokeColor('#d6cec1').moveTo(54, doc.y).lineTo(541, doc.y).stroke().moveDown(1);
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#171512').text('Accepted by');
    doc.font('Helvetica').fontSize(11).text(agreement.signature || agreement.clientName || '');
    doc.fontSize(8.5).fillColor('#77716a').text(`Signed ${agreement.serverSignedAt || ''}`);
  });
}
async function receiptPdf(project, payment, totals, settings) {
  return pdfBuffer(doc => {
    pdfHeader(doc, settings, 'Payment receipt');
    doc.font('Helvetica-Bold').fontSize(30).fillColor('#171512').text('Payment received');
    doc.moveDown(.3).font('Helvetica').fontSize(9).fillColor('#77716a').text(`Receipt ${payment.receiptNo || payment.id}`);
    doc.moveDown(1.5);
    pdfSection(doc, 'Client', `${project.clientName || ''}\n${project.clientEmail || ''}\n${project.clientCompany || ''}`);
    pdfSection(doc, 'Project', `${project.projectName}\n${project.ref}`);
    pdfSection(doc, 'Payment', `${money(payment.amount, payment.currency)}\n${payment.type || 'Payment'}\n${payment.method || 'Method not recorded'}\n${shortDate(payment.date || payment.createdAt)}`);
    if (payment.reference) pdfSection(doc, 'Transaction reference', payment.reference);
    doc.moveDown(.4).strokeColor('#d6cec1').moveTo(54, doc.y).lineTo(541, doc.y).stroke().moveDown(1);
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#171512').text(`Total paid: ${money(totals.paid, project.currency)}`);
    doc.moveDown(.4).text(`Outstanding: ${money(totals.outstanding, project.currency)}`);
    doc.moveDown(2).font('Helvetica').fontSize(8.5).fillColor('#77716a').text(`Issued by ${settings.businessName || 'JVO'} • ${settings.email || ''} • ${settings.phone || ''}`);
  });
}

exports.handler = async event => {
  try {
    const action = event.queryStringParameters?.action || '';
    const body = event.body ? JSON.parse(event.body) : {};

    if (['publicProject', 'sign', 'changeOrderDecision', 'clientDecision'].includes(action)) {
      const token = event.headers['x-project-token'] || event.queryStringParameters?.id || '';
      if (!token) return json(400, { error: 'Project ID is missing.' });
      await rateLimit(event, token, action, action === 'publicProject' ? 60 : 12);
      const project = await getProjectByToken(token);
      if (!project) return json(404, { error: 'This project link was not found.' });
      if (action === 'publicProject') {
        const [settings, agreementDoc, payments, changes, updatesQ] = await Promise.all([
          getSettings(), db.collection('agreements').doc(project.id).get(), projectPayments(project.id), projectChanges(project.id), db.collection('clientUpdates').where('projectId', '==', project.id).get()
        ]);
        const signed = agreementDoc.exists;
        const agreement = signed ? agreementDoc.data() : null;
        const totals = ledgerTotals(project, payments, changes);
        const firstMilestone = (project.paymentPlan?.milestones || [])[0];
        const publicProject = {
          id: project.id, ref: signed ? agreement.ref : project.ref, projectName: signed ? agreement.projectName : project.projectName, total: signed ? agreement.total : project.total, currency: signed ? agreement.currency : project.currency, timeline: signed ? agreement.timeline : project.timeline, supportDays: signed ? agreement.supportDays : project.supportDays,
          scope: signed ? agreement.scope : project.scope, features: signed ? agreement.features : (project.features || []), paymentPlan: signed ? agreement.paymentPlan : project.paymentPlan,
          status: project.status, signedAt: agreement?.serverSignedAt || null, liveUrl: project.liveUrl || '', dates: project.dates || {}, clientName: signed ? agreement.clientName : '', clientCompany: signed ? agreement.clientCompany : '',
          terms: signed ? agreement.terms : agreementTerms(project.supportDays), termsVersion: signed ? agreement.termsVersion : TERMS_VERSION,
          depositDue: firstMilestone?.amount || 0, financials: totals,
          payments: signed ? payments.filter(x => x.status !== 'Voided').map(x => ({ id: x.id, receiptNo: x.receiptNo, type: x.type, amount: x.amount, currency: x.currency, method: x.method, date: x.date, direction: x.direction })) : [],
          changeOrders: signed ? changes.map(x => ({ id: x.id, description: x.description, amount: x.amount, currency: x.currency, status: x.status, decidedAt: x.decidedAt || null })) : [],
          updates: signed ? updatesQ.docs.map(d => d.data()).sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0,20) : [],
          paymentInstructions: signed ? (settings.paymentInstructions || '') : '', paymentLink: signed ? (safeUrl(settings.paymentLink) || '') : ''
        };
        return json(200, { project: publicProject, business: publicSettings(settings) });
      }
      if (action === 'sign') {
        const required = ['fullName', 'email', 'phone', 'signature'];
        for (const k of required) if (!text(body[k])) return json(400, { error: 'Please complete all required fields.' });
        if (text(body.fullName).toLowerCase() !== text(body.signature).toLowerCase()) return json(400, { error: 'Your signature must match your full name.' });
        const accepted = Array.isArray(body.acceptedCheckboxes) ? body.acceptedCheckboxes : [];
        if (accepted.length < 4) return json(400, { error: 'Please accept all agreement confirmations.' });
        const agreementRef = db.collection('agreements').doc(project.id);
        const signedAt = now();
        const snapshot = {
          agreementVersion: AGREEMENT_VERSION, termsVersion: TERMS_VERSION, ref: project.ref, projectId: project.id, projectName: project.projectName, total: project.total, currency: project.currency,
          paymentPlan: project.paymentPlan, timeline: project.timeline, supportDays: project.supportDays, scope: project.scope, features: project.features || [], terms: agreementTerms(project.supportDays),
          clientName: text(body.fullName), clientEmail: text(body.email).toLowerCase(), clientPhone: text(body.phone), clientCompany: text(body.company), signature: text(body.signature), acceptedCheckboxes: accepted,
          serverSignedAt: signedAt, createdAt: signedAt
        };
        await db.runTransaction(async t => {
          const existing = await t.get(agreementRef);
          if (existing.exists) throw new Error('ALREADY_SIGNED');
          const projectRef = db.collection('projects').doc(project.id);
          t.create(agreementRef, snapshot);
          t.update(projectRef, { clientName: snapshot.clientName, clientEmail: snapshot.clientEmail, clientPhone: snapshot.clientPhone, clientCompany: snapshot.clientCompany, signedAt, status: 'Awaiting Deposit', updatedAt: signedAt });
        });
        await activity(project.id, `Agreement signed by ${snapshot.clientName}`, 'agreement');
        const freshProject = { ...project, ...snapshot, clientEmail: snapshot.clientEmail, clientName: snapshot.clientName, signedAt, status: 'Awaiting Deposit' };
        const firstMilestone = project.paymentPlan?.milestones?.[0];
        await Promise.allSettled([
          sendTemplate('agreement_signed', freshProject, { depositDue: firstMilestone?.amount || 0, idempotencyKey: `signed-client-${project.id}` }),
          sendMail({ to: ADMIN_EMAIL, subject: `${project.projectName}: agreement signed`, textMessage: `${snapshot.clientName} signed ${project.projectName}.`, html: emailFrame({ eyebrow: project.ref, title: 'Agreement signed', intro: `${snapshot.clientName} signed the project agreement.`, content: infoRow('Project', project.projectName) + infoRow('Client', snapshot.clientName) + infoRow('Email', snapshot.clientEmail), buttonLabel: 'Open JVO Desk', buttonUrl: `${SITE}/admin.html#project/${project.id}`, settings: await getSettings() }), projectId: project.id, projectName: project.projectName, template: 'admin_signed', idempotencyKey: `signed-admin-${project.id}` })
        ]);
        return json(200, { ok: true, signedAt });
      }
      if (action === 'changeOrderDecision') {
        const id = text(body.changeId); const decision = body.decision === 'Approved' ? 'Approved' : body.decision === 'Declined' ? 'Declined' : '';
        if (!id || !decision) return json(400, { error: 'Choose approve or decline.' });
        const ref = db.collection('changeRequests').doc(id); const d = await ref.get();
        if (!d.exists || d.data().projectId !== project.id) return json(404, { error: 'Additional work item not found.' });
        if (d.data().status !== 'Quoted') return json(409, { error: 'This item has already been decided.' });
        await ref.update({ status: decision, decidedAt: now(), clientDecision: true });
        await activity(project.id, `Additional work ${decision.toLowerCase()}: ${d.data().description}`, 'change');
        return json(200, { ok: true });
      }
      if (action === 'clientDecision') {
        if (!project.signedAt) return json(403, { error: 'The agreement must be signed first.' });
        const decision = body.decision === 'approve' ? 'Approved' : body.decision === 'changes' ? 'Changes Requested' : '';
        if (!decision) return json(400, { error: 'Choose an option.' });
        const createdAt = now();
        await db.collection('reviews').add({ projectId: project.id, decision, message: text(body.message), createdAt });
        await db.collection('projects').doc(project.id).update({ status: decision === 'Approved' ? 'Approved' : 'Client Review', reviewDate: createdAt, approvedDate: decision === 'Approved' ? createdAt : (project.approvedDate || null), updatedAt: createdAt });
        await activity(project.id, decision === 'Approved' ? 'Client approved the website' : 'Client requested changes', 'review', { message: text(body.message) });
        return json(200, { ok: true });
      }
    }

    if (action === 'restaurantDemo') {
      const slug = slugify(event.queryStringParameters?.slug || '');
      if (!slug) return json(400, { error: 'Restaurant slug is missing.' });
      await rateLimit(event, slug, action, 120);
      const q = await db.collection('restaurantDemos').where('slug', '==', slug).limit(1).get();
      if (q.empty || q.docs[0].data().archivedAt) return json(404, { error: 'This restaurant demo was not found.' });
      return json(200, { demo: publicRestaurantDemo(cleanProject(q.docs[0].id, q.docs[0].data())) });
    }

    if (action === 'agreementPdf') {
      const token = event.queryStringParameters?.id || '';
      const project = await getProjectByToken(token);
      if (!project) return json(404, { error: 'Project not found.' });
      const agreement = await db.collection('agreements').doc(project.id).get();
      if (!agreement.exists) return json(404, { error: 'This agreement has not been signed yet.' });
      const buffer = await agreementPdf(project, agreement.data(), await getSettings());
      return { statusCode: 200, isBase64Encoded: true, headers: { 'content-type': 'application/pdf', 'content-disposition': `attachment; filename="${project.ref}-agreement.pdf"`, 'cache-control': 'private, no-store' }, body: buffer.toString('base64') };
    }
    if (action === 'receiptPdf') {
      const token = event.queryStringParameters?.id || ''; const paymentId = event.queryStringParameters?.payment || '';
      const project = await getProjectByToken(token); if (!project) return json(404, { error: 'Project not found.' });
      const paymentDoc = await db.collection('payments').doc(paymentId).get();
      if (!paymentDoc.exists || paymentDoc.data().projectId !== project.id) return json(404, { error: 'Receipt not found.' });
      const [payments, changes, settings] = await Promise.all([projectPayments(project.id), projectChanges(project.id), getSettings()]);
      const payment = { id: paymentDoc.id, ...paymentDoc.data() };
      const buffer = await receiptPdf(project, payment, ledgerTotals(project, payments, changes), settings);
      return { statusCode: 200, isBase64Encoded: true, headers: { 'content-type': 'application/pdf', 'content-disposition': `attachment; filename="${payment.receiptNo || 'JVO-receipt'}.pdf"`, 'cache-control': 'private, no-store' }, body: buffer.toString('base64') };
    }

    await adminOnly(event);

    if (action === 'adminData') {
      const [pq, payq, eq, aq, cq, rq, dq, s] = await Promise.all([
        db.collection('projects').orderBy('createdAt', 'desc').limit(300).get(), db.collection('payments').orderBy('createdAt', 'desc').limit(500).get(), db.collection('emails').orderBy('createdAt', 'desc').limit(250).get(), db.collection('activities').orderBy('createdAt', 'desc').limit(800).get(), db.collection('changeRequests').orderBy('createdAt', 'desc').limit(500).get(), db.collection('reviews').orderBy('createdAt', 'desc').limit(300).get(), db.collection('restaurantDemos').orderBy('createdAt', 'desc').limit(300).get(), getSettings()
      ]);
      return json(200, { projects: pq.docs.map(d => cleanProject(d.id, d.data())), payments: payq.docs.map(d => cleanProject(d.id, d.data())), emails: eq.docs.map(d => cleanProject(d.id, d.data())), activities: aq.docs.map(d => cleanProject(d.id, d.data())), changeRequests: cq.docs.map(d => cleanProject(d.id, d.data())), reviews: rq.docs.map(d => cleanProject(d.id, d.data())), restaurantDemos: dq.docs.filter(d => !d.data().archivedAt).map(d => cleanProject(d.id, d.data())), settings: s });
    }

    if (action === 'createRestaurantDemo') {
      const payload = cleanRestaurantDemoPayload(body);
      if (!payload.name) return json(400, { error: 'Restaurant name is required.' });
      const slug = await uniqueRestaurantSlug(body.slug || payload.name);
      const createdAt = now();
      const d = { ...payload, slug, leadStatus: 'New', createdAt, updatedAt: createdAt };
      const doc = await db.collection('restaurantDemos').add(d);
      await db.collection('activities').add({ projectId: `restaurant:${doc.id}`, text: `Restaurant demo created: ${payload.name}`, kind: 'restaurantDemo', meta: { demoId: doc.id, slug }, createdAt });
      return json(200, { demo: cleanProject(doc.id, d), link: restaurantDemoLink(slug) });
    }

    if (action === 'updateRestaurantDemo') {
      const ref = db.collection('restaurantDemos').doc(text(body.demoId)); const d = await ref.get();
      if (!d.exists) return json(404, { error: 'Restaurant demo not found.' });
      const payload = cleanRestaurantDemoPayload(body, d.data());
      const slug = await uniqueRestaurantSlug(body.slug || payload.name, d.id);
      const stamp = now(); const patch = { ...payload, slug, updatedAt: stamp };
      await ref.update(patch);
      await db.collection('activities').add({ projectId: `restaurant:${d.id}`, text: `Restaurant demo updated: ${payload.name}`, kind: 'restaurantDemo', meta: { demoId: d.id, slug }, createdAt: stamp });
      return json(200, { demo: cleanProject(d.id, { ...d.data(), ...patch }), link: restaurantDemoLink(slug) });
    }

    if (action === 'duplicateRestaurantDemo') {
      const src = await db.collection('restaurantDemos').doc(text(body.demoId)).get();
      if (!src.exists) return json(404, { error: 'Restaurant demo not found.' });
      const original = src.data(); const stamp = now(); const name = `${text(original.name) || 'Restaurant'} copy`; const slug = await uniqueRestaurantSlug(name);
      const copy = { ...JSON.parse(JSON.stringify(original)), name, slug, leadStatus: 'New', recipientName: '', recipientEmail: '', lastSentAt: '', lastSentTo: '', createdAt: stamp, updatedAt: stamp };
      const doc = await db.collection('restaurantDemos').add(copy);
      await db.collection('activities').add({ projectId: `restaurant:${doc.id}`, text: `Restaurant demo duplicated from ${src.id}`, kind: 'restaurantDemo', meta: { demoId: doc.id, sourceDemoId: src.id, slug }, createdAt: stamp });
      return json(200, { demo: cleanProject(doc.id, copy), link: restaurantDemoLink(slug) });
    }

    if (action === 'archiveRestaurantDemo') {
      const ref = db.collection('restaurantDemos').doc(text(body.demoId)); const d = await ref.get(); if (!d.exists) return json(404, { error: 'Restaurant demo not found.' });
      const stamp = now(); await ref.update({ archivedAt: stamp, updatedAt: stamp });
      await db.collection('activities').add({ projectId: `restaurant:${d.id}`, text: `Restaurant demo archived: ${text(d.data().name)}`, kind: 'restaurantDemo', meta: { demoId: d.id }, createdAt: stamp });
      return json(200, { ok: true });
    }

    if (action === 'saveRestaurantEmailTemplate') {
      const subject = text(body.subject).slice(0, 220), message = text(body.body).slice(0, 12000);
      if (!subject || !message) return json(400, { error: 'Subject and body are required.' });
      await db.collection('settings').doc('business').set({ restaurantOutreachTemplate: { subject, body: message, updatedAt: now() } }, { merge: true });
      return json(200, { ok: true });
    }

    if (action === 'sendDemoEmail') {
      const demoDoc = await db.collection('restaurantDemos').doc(text(body.demoId)).get(); if (!demoDoc.exists) return json(404, { error: 'Restaurant demo not found.' });
      const demo = cleanProject(demoDoc.id, demoDoc.data()); const to = text(body.to).toLowerCase(); const subjectTemplate = text(body.subject); const messageTemplate = text(body.message);
      if (!to || !subjectTemplate || !messageTemplate) return json(400, { error: 'Email, subject and message are required.' });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return json(400, { error: 'Enter a valid email address.' });
      const settings = await getSettings(); const link = restaurantDemoLink(demo.slug); const recipientName = text(body.recipientName) || 'there';
      const whatsappNumber = settings.whatsapp || '0594121246'; const whatsappDigits = String(whatsappNumber).replace(/\D/g,''); const whatsappUrl = whatsappDigits ? `https://wa.me/${whatsappDigits.startsWith('0') ? `233${whatsappDigits.slice(1)}` : whatsappDigits}` : '';
      const vars = { recipientName, restaurantName: demo.name, intro: demo.intro || '', email: demo.email || '', logoText: demo.logoText || '', city: demo.city || '', address: demo.address || '', phone: demo.phone || '', hours: demo.hours || '', tagline: demo.tagline || '', eyebrow: demo.eyebrow || '', primaryCta: demo.primaryCta || '', secondaryCta: demo.secondaryCta || '', storyTitle: demo.storyTitle || '', experienceTitle: demo.experienceTitle || '', reservationUrl: demo.reservationUrl || '', orderUrl: demo.orderUrl || '', instagramUrl: demo.instagramUrl || '', demoLink: link, menuLink: `${SITE}/restaurant/${encodeURIComponent(demo.slug)}/menu`, bookingLink: `${SITE}/restaurant/${encodeURIComponent(demo.slug)}/booking`, yourName: settings.ownerName || 'James Senu', businessName: 'JVO WEB', whatsappNumber, whatsappUrl };
      const interpolate = template => Object.entries(vars).reduce((out, [key, value]) => out.replaceAll(`{{${key}}}`, value), template);
      const subject = interpolate(subjectTemplate); const message = interpolate(messageTemplate); const html = renderOutreachEmailHtml({ demo, recipientName, body: message, subject, link, settings });
      const sent = await sendMail({ to, subject, textMessage: `${message}\n\n${link}`, html, projectId: '', projectName: demo.name, template: 'restaurant_outreach', idempotencyKey: text(body.idempotencyKey), demoId: demo.id, restaurantName: demo.name, demoLink: link });
      const stamp = now(); await db.collection('restaurantDemos').doc(demo.id).update({ recipientName, recipientEmail: to, leadStatus: demo.leadStatus === 'New' ? 'Contacted' : demo.leadStatus, lastSentAt: stamp, lastSentTo: to, updatedAt: stamp });
      await db.collection('activities').add({ projectId: `restaurant:${demo.id}`, text: `Outreach email sent to ${to}`, kind: 'restaurantEmail', meta: { demoId: demo.id, subject }, createdAt: stamp });
      return json(200, { ok: true, resendId: sent.id || '', link });
    }

    if (action === 'cloudinarySignature') {
      const cloudName = text(process.env.CLOUDINARY_CLOUD_NAME), apiKey = text(process.env.CLOUDINARY_API_KEY), apiSecret = text(process.env.CLOUDINARY_API_SECRET);
      if (!cloudName || !apiKey || !apiSecret) return json(503, { error: 'Cloudinary is not configured yet. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in Netlify.' });
      const timestamp = Math.floor(Date.now() / 1000); const folder = 'jvo-restaurant-demos'; const toSign = `folder=${folder}&timestamp=${timestamp}`; const signature = crypto.createHash('sha1').update(toSign + apiSecret).digest('hex');
      return json(200, { cloudName, apiKey, timestamp, signature, folder });
    }

    if (action === 'createProject') {
      if (!text(body.projectName) || !Number(body.total) || !text(body.scope)) return json(400, { error: 'Project name, price and scope are required.' });
      const total = amount(body.total); if (total <= 0 || total > 100000000) return json(400, { error: 'Enter a valid project price.' });
      const settings = await getSettings(); const n = await nextNumber('projects'); const createdAt = now(); const year = new Date().getFullYear(); const ref = `JVO-${year}-${String(n).padStart(4, '0')}`;
      const paymentPlan = paymentPlanFromBody(body, total); const token = crypto.randomBytes(18).toString('hex');
      const p = {
        ref, publicToken: token, projectName: text(body.projectName), total, currency: currency(body.currency || settings.defaultCurrency), paymentPlan,
        timeline: text(body.timeline) || 'To be agreed', supportDays: Math.min(365, Math.max(0, Number(body.supportDays ?? settings.supportDays ?? 30))), scope: text(body.scope), features: Array.isArray(body.features) ? body.features.map(text).filter(Boolean).slice(0, 30) : [], notes: text(body.notes), liveUrl: safeUrl(body.liveUrl), status: 'Draft',
        dates: { estimatedStartDate: text(body.estimatedStartDate), startDate: '', targetDeliveryDate: text(body.targetDeliveryDate), reviewDate: '', approvedDate: '', paymentDueDate: text(body.paymentDueDate), launchDate: '', completedDate: '' }, createdAt, updatedAt: createdAt
      };
      const doc = await db.collection('projects').add(p); await activity(doc.id, 'Project created as draft', 'project');
      return json(200, { project: cleanProject(doc.id, p), link: clientLink(p) });
    }

    if (action === 'editProject') {
      const ref = db.collection('projects').doc(text(body.projectId)); const d = await ref.get(); if (!d.exists) return json(404, { error: 'Project not found.' });
      const old = d.data(); const total = amount(body.total); if (!text(body.projectName) || total <= 0 || !text(body.scope)) return json(400, { error: 'Project name, price and scope are required.' });
      const paymentPlan = paymentPlanFromBody(body, total);
      const dates = { ...(old.dates || {}), estimatedStartDate: text(body.estimatedStartDate), targetDeliveryDate: text(body.targetDeliveryDate), paymentDueDate: text(body.paymentDueDate) };
      const patch = { projectName: text(body.projectName), total, currency: currency(body.currency || old.currency), paymentPlan, timeline: text(body.timeline) || 'To be agreed', supportDays: Math.min(365, Math.max(0, Number(body.supportDays || 30))), scope: text(body.scope), features: Array.isArray(body.features) ? body.features.map(text).filter(Boolean).slice(0, 30) : [], liveUrl: safeUrl(body.liveUrl), notes: text(body.notes), dates, updatedAt: now() };
      await ref.update(patch); await activity(d.id, old.signedAt ? 'Project details updated after signing. Signed agreement remains unchanged.' : 'Project details updated', 'project');
      return json(200, { project: cleanProject(d.id, { ...old, ...patch }) });
    }

    if (action === 'sendAgreement') {
      const ref = db.collection('projects').doc(text(body.projectId)); const d = await ref.get(); if (!d.exists) return json(404, { error: 'Project not found.' });
      const p = cleanProject(d.id, d.data());
      let to = text(body.email).toLowerCase();
      if (to) await ref.update({ prefillClientEmail: to, status: p.status === 'Draft' ? 'Agreement Sent' : p.status, agreementSentAt: now(), updatedAt: now() });
      else await ref.update({ status: p.status === 'Draft' ? 'Agreement Sent' : p.status, agreementSentAt: now(), updatedAt: now() });
      if (to) await sendTemplate('agreement_ready', { ...p, clientEmail: to }, { to, idempotencyKey: body.idempotencyKey || '' });
      await activity(p.id, to ? `Agreement sent to ${to}` : 'Agreement marked as sent', 'agreement');
      return json(200, { ok: true, link: clientLink(p) });
    }

    if (action === 'recordPayment') {
      const projectRef = db.collection('projects').doc(text(body.projectId)); const projectDoc = await projectRef.get(); if (!projectDoc.exists) return json(404, { error: 'Project not found.' });
      const p = cleanProject(projectDoc.id, projectDoc.data()); const paymentAmount = amount(body.amount); if (paymentAmount <= 0) return json(400, { error: 'Enter a valid amount.' });
      const direction = body.direction === 'out' ? 'out' : 'in'; const key = text(body.idempotencyKey);
      if (key) { const k = await db.collection('paymentKeys').doc(key).get(); if (k.exists) return json(200, { ok: true, duplicate: true, paymentId: k.data().paymentId }); }
      const receiptNo = `JVO-R-${String(await nextNumber('receipts')).padStart(5, '0')}`; const createdAt = now();
      const payment = { projectId: p.id, projectName: p.projectName, clientName: p.clientName || '', clientEmail: p.clientEmail || '', type: text(body.type) || 'Payment', amount: paymentAmount, currency: p.currency || 'GHS', direction, method: text(body.method), reference: text(body.reference), date: text(body.date) || createdAt.slice(0, 10), notes: text(body.notes), receiptNo, status: 'Posted', createdAt };
      const payRef = await db.collection('payments').add(payment); if (key) await db.collection('paymentKeys').doc(key).set({ paymentId: payRef.id, createdAt });
      const [payments, changes] = await Promise.all([projectPayments(p.id), projectChanges(p.id)]); const totals = ledgerTotals(p, payments, changes);
      let status = p.status;
      const first = p.paymentPlan?.milestones?.[0]?.amount || p.total * .5;
      if (totals.paid >= totals.totalDue && totals.totalDue > 0) status = 'Fully Paid'; else if (totals.paid >= first && ['Awaiting Deposit', 'Agreement Signed', 'Agreement Sent'].includes(status)) status = 'Deposit Received';
      await projectRef.update({ status, lastPaymentAt: createdAt, updatedAt: createdAt });
      await activity(p.id, `${direction === 'out' ? 'Refund' : payment.type} recorded: ${money(paymentAmount, p.currency)} (${receiptNo})`, 'payment');
      if (p.clientEmail && direction === 'in') await sendTemplate('payment_received', { ...p, status }, { paymentAmount, receiptNo, paid: totals.paid, outstanding: totals.outstanding, fullyPaid: totals.outstanding <= 0, idempotencyKey: `payment-email-${payRef.id}` });
      return json(200, { ok: true, paymentId: payRef.id, receiptNo, financials: totals, status });
    }

    if (action === 'voidPayment') {
      const d = await db.collection('payments').doc(text(body.paymentId)).get(); if (!d.exists) return json(404, { error: 'Payment not found.' });
      await d.ref.update({ status: 'Voided', voidReason: text(body.reason), voidedAt: now() }); await activity(d.data().projectId, `Payment ${d.data().receiptNo || d.id} voided`, 'payment'); return json(200, { ok: true });
    }

    if (action === 'updateProject') {
      if (!STATUSES.includes(body.status)) return json(400, { error: 'Invalid project status.' });
      const ref = db.collection('projects').doc(text(body.projectId)); const d = await ref.get(); if (!d.exists) return json(404, { error: 'Project not found.' });
      const p = cleanProject(d.id, d.data()); const stamp = now(); const patch = { status: body.status, updatedAt: stamp, dates: { ...(p.dates || {}) } };
      if (body.status === 'Development' && !patch.dates.startDate) patch.dates.startDate = stamp.slice(0, 10);
      if (body.status === 'Client Review') patch.dates.reviewDate = stamp.slice(0, 10);
      if (body.status === 'Approved') patch.dates.approvedDate = stamp.slice(0, 10);
      if (body.status === 'Launched') patch.dates.launchDate = stamp.slice(0, 10);
      if (body.status === 'Completed') patch.dates.completedDate = stamp.slice(0, 10);
      await ref.update(patch); await activity(p.id, `Project status changed to ${body.status}`, 'status');
      if (body.status === 'Client Review' && p.clientEmail) await sendTemplate('review_ready', p, { idempotencyKey: `review-${p.id}-${stamp.slice(0,13)}` });
      if (body.status === 'Launched' && p.clientEmail) await sendTemplate('launched', { ...p, ...patch }, { idempotencyKey: `launched-${p.id}` });
      return json(200, { ok: true });
    }

    if (action === 'changeRequest') {
      const pDoc = await db.collection('projects').doc(text(body.projectId)).get(); if (!pDoc.exists) return json(404, { error: 'Project not found.' });
      const p = cleanProject(pDoc.id, pDoc.data()); const a = amount(body.amount); if (!text(body.description) || a <= 0) return json(400, { error: 'Description and price are required.' });
      const item = { projectId: p.id, projectName: p.projectName, description: text(body.description), amount: a, currency: p.currency || 'GHS', status: 'Quoted', createdAt: now(), decisionToken: crypto.randomBytes(12).toString('hex') };
      const doc = await db.collection('changeRequests').add(item); await activity(p.id, `Additional work quoted: ${item.description} (${money(a, item.currency)})`, 'change');
      if (body.sendToClient && p.clientEmail) await sendTemplate('change_order', p, { description: item.description, amount: a, idempotencyKey: `change-${doc.id}` });
      return json(200, { ok: true, changeId: doc.id });
    }

    if (action === 'updateChangeRequest') {
      const status = ['Quoted', 'Approved', 'Declined', 'Paid', 'Done'].includes(body.status) ? body.status : '';
      const ref = db.collection('changeRequests').doc(text(body.changeId)); const d = await ref.get(); if (!d.exists || !status) return json(400, { error: 'Invalid additional work update.' });
      const current = d.data().status; const allowed = current === 'Quoted' ? ['Quoted','Approved','Declined'] : current === 'Approved' ? ['Approved','Paid','Done'] : current === 'Paid' ? ['Paid','Done'] : [current]; if (!allowed.includes(status)) return json(409, { error: 'That change order decision is already locked.' });
      await ref.update({ status, updatedAt: now() }); await activity(d.data().projectId, `Additional work marked ${status.toLowerCase()}: ${d.data().description}`, 'change'); return json(200, { ok: true });
    }

    if (action === 'addUpdate') {
      const p = await db.collection('projects').doc(text(body.projectId)).get(); if (!p.exists) return json(404, { error: 'Project not found.' });
      if (!text(body.message)) return json(400, { error: 'Write an update first.' });
      await db.collection('clientUpdates').add({ projectId: p.id, message: text(body.message), createdAt: now() }); await activity(p.id, `Client update posted: ${text(body.message)}`, 'update'); return json(200, { ok: true });
    }

    if (action === 'saveSettings') {
      const patch = { businessName: text(body.businessName) || 'JVO', ownerName: text(body.ownerName), email: text(body.email).toLowerCase(), phone: text(body.phone), whatsapp: text(body.whatsapp), snapchat: text(body.snapchat), address: text(body.address), defaultCurrency: currency(body.defaultCurrency), supportDays: Math.min(365, Math.max(0, Number(body.supportDays || 30))), paymentInstructions: text(body.paymentInstructions), paymentLink: safeUrl(body.paymentLink), logoUrl: safeUrl(body.logoUrl), emailSenderName: text(body.emailSenderName) || 'JVO', updatedAt: now() };
      await db.collection('settings').doc('business').set(patch, { merge: true }); return json(200, { ok: true });
    }

    if (action === 'sendEmail') {
      const to = text(body.to).toLowerCase(); const subject = text(body.subject); const message = text(body.message);
      if (!to || !subject || !message) return json(400, { error: 'Email, subject and message are required.' });
      let project = { id: '', projectName: 'JVO', ref: 'JVO', publicToken: '' };
      if (body.projectId) { const p = await db.collection('projects').doc(text(body.projectId)).get(); if (p.exists) project = cleanProject(p.id, p.data()); }
      const settings = await getSettings(); const link = project.publicToken ? clientLink(project) : SITE;
      const html = emailFrame({ eyebrow: project.ref || 'JVO', title: subject, intro: message, content: project.id ? infoRow('Project', project.projectName) + infoRow('Reference', project.ref) : '', buttonLabel: project.id ? 'View project' : 'Visit JVO', buttonUrl: link, settings });
      await sendMail({ to, subject, textMessage: `${message}\n\n${link}`, html, projectId: project.id, projectName: project.projectName, template: 'custom', idempotencyKey: text(body.idempotencyKey) });
      if (project.id) await activity(project.id, `Email sent: ${subject}`, 'email'); return json(200, { ok: true });
    }

    if (action === 'sendTemplate') {
      const p = await db.collection('projects').doc(text(body.projectId)).get(); if (!p.exists) return json(404, { error: 'Project not found.' });
      const project = cleanProject(p.id, p.data()); const [payments, changes] = await Promise.all([projectPayments(project.id), projectChanges(project.id)]); const totals = ledgerTotals(project, payments, changes);
      const first = project.paymentPlan?.milestones?.[0]?.amount || 0;
      await sendTemplate(body.template, project, { amountDue: first, outstanding: totals.outstanding, idempotencyKey: text(body.idempotencyKey) }); await activity(project.id, `Email sent: ${body.template}`, 'email'); return json(200, { ok: true });
    }

    if (action === 'adminReceiptPdf') {
      const p = await db.collection('payments').doc(text(body.paymentId)).get(); if (!p.exists) return json(404, { error: 'Payment not found.' });
      return json(200, { url: `${SITE}/.netlify/functions/api?action=receiptPdf&id=${body.publicToken}&payment=${p.id}` });
    }

    return json(404, { error: 'Unknown action.' });
  } catch (e) {
    console.error(e);
    if (e.message === 'AUTH' || e.message === 'FORBIDDEN') return json(401, { error: 'You are not allowed to do that.' });
    if (e.message === 'RATE') return json(429, { error: 'Too many requests. Please wait a minute and try again.' });
    if (e.message === 'ALREADY_SIGNED') return json(409, { error: 'This agreement has already been signed.' });
    return json(500, { error: e.message || 'Server error.' });
  }
};
