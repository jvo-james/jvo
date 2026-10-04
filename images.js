/*
 * Restaurant demo image library.
 *
 * The files live in the existing /images folder so the public demo never needs a
 * second asset directory. Saved demos that use source: "repo" refer to these ids.
 * You can change a URL here later and every repo-image demo will use the new file.
 */
window.JVO_REPO_IMAGES = {
  diningRoom: { id:'diningRoom', label:'Warm dining room', url:'images/restaurant-hero.jpg' },
  diningRoomWide: { id:'diningRoomWide', label:'Dining room wide', url:'images/restaurant-sunshine.jpg' },
  diningRoomBlue: { id:'diningRoomBlue', label:'Dining room evening', url:'images/restaurant-reserve.jpg' },
  barInterior: { id:'barInterior', label:'Bar interior', url:'images/restaurant-interior.jpg' },
  exterior: { id:'exterior', label:'Restaurant exterior', url:'images/restaurant-exterior.jpg' },
  candlelight: { id:'candlelight', label:'Candlelit table', url:'images/restaurant-blacklit.jpg' },
  platedSteak: { id:'platedSteak', label:'Steak plate', url:'images/restaurant-ribeye.jpg' },
  tomahawk: { id:'tomahawk', label:'Tomahawk steak', url:'images/restaurant-tomahawk.jpg' },
  filet: { id:'filet', label:'Filet plate', url:'images/restaurant-filet.jpg' },
  salmon: { id:'salmon', label:'Salmon plate', url:'images/restaurant-salmon.jpg' },
  scallops: { id:'scallops', label:'Scallops', url:'images/restaurant-risotto.jpg' },
  shrimp: { id:'shrimp', label:'Shrimp plate', url:'images/restaurant-shrimp.jpg' },
  salad: { id:'salad', label:'Fresh salad', url:'images/restaurant-salad.jpg' },
  seafood: { id:'seafood', label:'Seafood plate', url:'images/restaurant-seafood.jpg' },
  smallBites: { id:'smallBites', label:'Small bites', url:'images/restaurant-menusides.jpg' },
  baconBites: { id:'baconBites', label:'Bacon bites', url:'images/restaurant-bacon.jpg' },
  dessert: { id:'dessert', label:'Dessert', url:'images/restaurant-gallery4.jpg' },
  platedDetail: { id:'platedDetail', label:'Plated dish detail', url:'images/restaurant-gallery3.jpg' },
  tableSetting: { id:'tableSetting', label:'Table setting', url:'images/restaurant-plate.jpg' },
  kitchenDetail: { id:'kitchenDetail', label:'Kitchen plate detail', url:'images/restaurant-gallery6.jpg' },
  cocktail: { id:'cocktail', label:'Signature cocktail', url:'images/restaurant-cocktail1.jpg' },
  cocktails: { id:'cocktails', label:'Cocktail pair', url:'images/restaurant-cocktail3.jpg' },
  champagne: { id:'champagne', label:'Champagne', url:'images/restaurant-champagne.jpg' },
  wine: { id:'wine', label:'Wine at the table', url:'images/restaurant-wine1.jpg' },
  bourbon: { id:'bourbon', label:'Whiskey selection', url:'images/restaurant-bourbon1.jpg' },
  whiskey: { id:'whiskey', label:'Whiskey pour', url:'images/restaurant-whiskey.jpg' },
  barShelf: { id:'barShelf', label:'Bottle shelf', url:'images/restaurant-bourbon4.jpg' },
  privateRoom: { id:'privateRoom', label:'Private dining room', url:'images/restaurant-reserve2.jpg' },
  tableConversation: { id:'tableConversation', label:'Dinner with friends', url:'images/restaurant-c2.jpg' },
  gathering: { id:'gathering', label:'Restaurant gathering', url:'images/restaurant-c.jpg' },
  wineWall: { id:'wineWall', label:'Wine wall', url:'images/restaurant-wine2.jpg' },
  barTable: { id:'barTable', label:'Cocktails and conversation', url:'images/restaurant-gallery7.jpg' },
  // Legacy names kept so existing saved demos continue to render after the visual refresh.
  diningTable: { id:'diningTable', label:'Dining table', url:'images/restaurant-plate.jpg' },
  warmTerrace: { id:'warmTerrace', label:'Warm dining room', url:'images/restaurant-sunshine.jpg' },
  kitchenHands: { id:'kitchenHands', label:'Kitchen detail', url:'images/restaurant-gallery6.jpg' },
  baker: { id:'baker', label:'Dessert detail', url:'images/restaurant-gallery4.jpg' },
  platedDish: { id:'platedDish', label:'Plated dish', url:'images/restaurant-ribeye.jpg' },
  serviceWarm: { id:'serviceWarm', label:'Service scene', url:'images/restaurant-gallery7.jpg' },
  nightStreet: { id:'nightStreet', label:'Restaurant exterior', url:'images/restaurant-exterior.jpg' }
};

window.JVO_RESTAURANT_TEMPLATE = {
  name:'The Common Table',
  eyebrow:'Kitchen · Bar · Table',
  tagline:'Supper, properly done.',
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
  heroImage:{source:'repo',id:'platedSteak',alt:'Steak plate on a restaurant table'},
  storyTitle:'Old rooms. New rituals.',
  storyText:'Good food, a proper drink and enough room to talk. We cook familiar things with a little edge and keep the room easy so the evening can take its own shape.',
  storyImage:{source:'repo',id:'diningRoom',alt:'Warm dining room before service'},
  experienceTitle:'Not just dinner. A whole evening.',
  experienceText:'Come early for a drink, stay for supper and leave when you are ready. The best nights usually take longer than planned.',
  popularIntro:'A few plates to give you a feel for the table. The full menu has more.',
  menuIntro:'A generous menu of small plates, mains, sides and something sweet to finish.',
  menuNote:'Prices and dishes are sample content for this concept.',
  menuFooterNote:'The menu can change with the season. Update dishes, descriptions and prices in the dashboard in a few minutes.',
  galleryTitle:'Take a little look inside.',
  galleryIntro:'A mix of the room, the kitchen, the bar and the plates that set the tone.',
  privateDiningTitle:'Private dinners, done properly.',
  privateDiningText:'A more personal way to use the room, with space for the people you actually want around the table.',
  privateDiningDetails:'Tell us what you are planning, how many people you have in mind and when you would like to come. We can take it from there.',
  privateDiningCapacity:'Up to 30 guests',
  contactIntro:'Everything you need before you arrive, from hours and directions to the little house notes.',
  dressCode:'Smart casual.',
  parking:'Street parking nearby.',
  reservationNote:'Reservations are recommended.',
  menu:[
    {name:'Charred prawns',category:'Small plates',description:'Garlic, chilli, lime and warm flatbread.',price:'95',currency:'GHS',featured:true,image:{source:'repo',id:'shrimp',alt:'Charred prawns on a plate'}},
    {name:'House salad',category:'Small plates',description:'Crisp greens, roasted vegetables, herbs and a sharp citrus dressing.',price:'65',currency:'GHS',featured:true,image:{source:'repo',id:'salad',alt:'Fresh restaurant salad'}},
    {name:'Carolina tomahawk',category:'Mains',description:'Charred steak, herb tallow and a rich house sauce.',price:'240',currency:'GHS',featured:true,image:{source:'repo',id:'tomahawk',alt:'Tomahawk steak'}},
    {name:'Market fish',category:'Mains',description:'Fresh catch, bright sauce, seasonal vegetables and steamed rice.',price:'165',currency:'GHS',image:{source:'repo',id:'salmon',alt:'Fresh fish plate'}},
    {name:'Filet & greens',category:'Mains',description:'Tender beef, pan jus, greens and a simple side.',price:'215',currency:'GHS',image:{source:'repo',id:'filet',alt:'Filet steak plate'}},
    {name:'Creamy scallops',category:'Mains',description:'Seared scallops, parmesan risotto and house vegetables.',price:'175',currency:'GHS',image:{source:'repo',id:'scallops',alt:'Seared scallops'}},
    {name:'Crispy bacon bites',category:'Sides',description:'Sweet heat glaze, fresh herbs and a little crunch.',price:'55',currency:'GHS',image:{source:'repo',id:'baconBites',alt:'Crispy bacon bites'}},
    {name:'Burnt cheesecake',category:'Dessert',description:'Soft centre, caramelised top and a little sea salt.',price:'55',currency:'GHS',image:{source:'repo',id:'dessert',alt:'Dessert plate'}},
    {name:'House old fashioned',category:'Drinks',description:'Whiskey, orange, bitters and a long finish.',price:'75',currency:'GHS',image:{source:'repo',id:'whiskey',alt:'Whiskey cocktail'}},
    {name:'Espresso martini',category:'Drinks',description:'Fresh espresso, vodka and a clean bitter finish.',price:'75',currency:'GHS',image:{source:'repo',id:'cocktail',alt:'Signature cocktail'}}
  ],
  gallery:[
    {image:{source:'repo',id:'diningRoomWide',alt:'Warm dining room'}},
    {image:{source:'repo',id:'barInterior',alt:'Restaurant bar'}},
    {image:{source:'repo',id:'platedSteak',alt:'Steak from the kitchen'}},
    {image:{source:'repo',id:'candlelight',alt:'Candlelit table'}},
    {image:{source:'repo',id:'cocktail',alt:'Signature cocktail'}},
    {image:{source:'repo',id:'privateRoom',alt:'Private dining room'}},
    {image:{source:'repo',id:'wine',alt:'Wine at the table'}},
    {image:{source:'repo',id:'bourbon',alt:'Whiskey collection'}},
    {image:{source:'repo',id:'seafood',alt:'Seafood from the kitchen'}}
  ],
  leadStatus:'New',notes:'',recipientName:'',recipientEmail:''
};

window.JVO_RESTAURANT_EMAIL_TEMPLATE = {
  subject:'A quick website idea for {{restaurantName}}',
  body:`Hi {{recipientName}},

I came across {{restaurantName}} and liked what you are doing in {{city}}.

You already have the part that matters most, the food and the atmosphere. I put together a quick website concept to show how that could come across online with a cleaner menu, stronger photography and a simpler booking path.

I made it around {{restaurantName}} rather than sending you a generic portfolio link:
{{demoLink}}

Have a look when you have a minute. There is no pressure at all.

If you like the direction, I can build the full site around your real menu, photos and booking or ordering setup.

Best,
{{yourName}}
{{businessName}}`
};
