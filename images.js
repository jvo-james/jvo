/*
 * Shared restaurant image library.
 *
 * Keep the files inside /images. Use the ids below in saved demos. URLs are
 * intentionally root-relative so they also work on clean /restaurant/:slug URLs.
 */
const JVO_IMAGE_FILE = file => `/images/${file}`;

window.JVO_REPO_IMAGES = {
  diningRoom: { id:'diningRoom', label:'Warm dining room', url:JVO_IMAGE_FILE('restaurant-hero.jpg') },
  diningRoomWide: { id:'diningRoomWide', label:'Dining room wide', url:JVO_IMAGE_FILE('restaurant-sunshine.jpg') },
  diningRoomBlue: { id:'diningRoomBlue', label:'Dining room evening', url:JVO_IMAGE_FILE('restaurant-reserve.jpg') },
  barInterior: { id:'barInterior', label:'Bar interior', url:JVO_IMAGE_FILE('restaurant-interior.jpg') },
  exterior: { id:'exterior', label:'Restaurant exterior', url:JVO_IMAGE_FILE('restaurant-exterior.jpg') },
  candlelight: { id:'candlelight', label:'Candlelit table', url:JVO_IMAGE_FILE('restaurant-blacklit.jpg') },
  platedSteak: { id:'platedSteak', label:'Steak plate', url:JVO_IMAGE_FILE('restaurant-ribeye.jpg') },
  tomahawk: { id:'tomahawk', label:'Tomahawk steak', url:JVO_IMAGE_FILE('restaurant-tomahawk.jpg') },
  filet: { id:'filet', label:'Filet plate', url:JVO_IMAGE_FILE('restaurant-filet.jpg') },
  salmon: { id:'salmon', label:'Fresh fish plate', url:JVO_IMAGE_FILE('restaurant-salmon.jpg') },
  scallops: { id:'scallops', label:'Seared scallops', url:JVO_IMAGE_FILE('restaurant-risotto.jpg') },
  shrimp: { id:'shrimp', label:'Charred prawns', url:JVO_IMAGE_FILE('restaurant-shrimp.jpg') },
  salad: { id:'salad', label:'Fresh salad', url:JVO_IMAGE_FILE('restaurant-salad.jpg') },
  seafood: { id:'seafood', label:'Seafood plate', url:JVO_IMAGE_FILE('restaurant-seafood.jpg') },
  smallBites: { id:'smallBites', label:'Small bites', url:JVO_IMAGE_FILE('restaurant-menusides.jpg') },
  baconBites: { id:'baconBites', label:'Bacon bites', url:JVO_IMAGE_FILE('restaurant-bacon.jpg') },
  dessert: { id:'dessert', label:'Dessert', url:JVO_IMAGE_FILE('restaurant-gallery4.jpg') },
  platedDetail: { id:'platedDetail', label:'Plated dish detail', url:JVO_IMAGE_FILE('restaurant-gallery3.jpg') },
  tableSetting: { id:'tableSetting', label:'Table setting', url:JVO_IMAGE_FILE('restaurant-plate.jpg') },
  kitchenDetail: { id:'kitchenDetail', label:'Kitchen detail', url:JVO_IMAGE_FILE('restaurant-gallery6.jpg') },
  cocktail: { id:'cocktail', label:'Signature cocktail', url:JVO_IMAGE_FILE('restaurant-cocktail1.jpg') },
  cocktails: { id:'cocktails', label:'Cocktail pair', url:JVO_IMAGE_FILE('restaurant-cocktail3.jpg') },
  cocktail3: { id:'cocktail3', label:'Fresh juice', url:JVO_IMAGE_FILE('restaurant-cocktail3.jpg') },
  champagne: { id:'champagne', label:'Champagne', url:JVO_IMAGE_FILE('restaurant-champagne.jpg') },
  wine: { id:'wine', label:'Wine at the table', url:JVO_IMAGE_FILE('restaurant-wine1.jpg') },
  bourbon: { id:'bourbon', label:'Whiskey selection', url:JVO_IMAGE_FILE('restaurant-bourbon1.jpg') },
  whiskey: { id:'whiskey', label:'Whiskey pour', url:JVO_IMAGE_FILE('restaurant-whiskey.jpg') },
  barShelf: { id:'barShelf', label:'Bottle shelf', url:JVO_IMAGE_FILE('restaurant-bourbon4.jpg') },
  privateRoom: { id:'privateRoom', label:'Private dining room', url:JVO_IMAGE_FILE('restaurant-reserve2.jpg') },
  tableConversation: { id:'tableConversation', label:'Dinner with friends', url:JVO_IMAGE_FILE('restaurant-c2.jpg') },
  gathering: { id:'gathering', label:'Restaurant gathering', url:JVO_IMAGE_FILE('restaurant-c.jpg') },
  wineWall: { id:'wineWall', label:'Wine wall', url:JVO_IMAGE_FILE('restaurant-wine2.jpg') },
  barTable: { id:'barTable', label:'Cocktails and conversation', url:JVO_IMAGE_FILE('restaurant-gallery7.jpg') },
  // Backwards-compatible names from older saved demos.
  diningTable: { id:'diningTable', label:'Dining table', url:JVO_IMAGE_FILE('restaurant-plate.jpg') },
  warmTerrace: { id:'warmTerrace', label:'Warm dining room', url:JVO_IMAGE_FILE('restaurant-sunshine.jpg') },
  kitchenHands: { id:'kitchenHands', label:'Kitchen detail', url:JVO_IMAGE_FILE('restaurant-gallery6.jpg') },
  baker: { id:'baker', label:'Dessert detail', url:JVO_IMAGE_FILE('restaurant-gallery4.jpg') },
  platedDish: { id:'platedDish', label:'Plated dish', url:JVO_IMAGE_FILE('restaurant-ribeye.jpg') },
  serviceWarm: { id:'serviceWarm', label:'Service scene', url:JVO_IMAGE_FILE('restaurant-gallery7.jpg') },
  nightStreet: { id:'nightStreet', label:'Restaurant exterior', url:JVO_IMAGE_FILE('restaurant-exterior.jpg') }
};

window.JVO_RESTAURANT_TEMPLATE = {
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
  heroImage:{source:'repo',id:'diningRoomWide',alt:'Warm restaurant dining room'},
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

// A polished, editable starting point for restaurant outreach.
window.JVO_RESTAURANT_EMAIL_TEMPLATE = {
  subject:'A website idea for {{restaurantName}}',
  body:`Hi {{recipientName}},

I came across {{restaurantName}} and spent a few minutes looking at how the restaurant comes across online.

I put together a short website concept using your restaurant as the starting point. It is not a generic mockup, I shaped the direction around your food, the atmosphere and the way someone would actually decide to visit:
{{demoLink}}

There is no obligation at all. I just thought it might be useful to see the idea before deciding whether it is something worth exploring.

If you like the direction, I can build the full site around your real menu, photography, reservations or ordering flow.

You can reply to this email, or reach me on WhatsApp at {{whatsappNumber}}.

Thanks,
{{yourName}}
CEO, {{businessName}}` 
};
