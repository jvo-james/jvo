/*
 * Shared restaurant image library.
 * The restaurant demo uses remote image sources so the visual identity is reusable across prospects.
 * Change any URL here or replace it from the dashboard with a Cloudinary upload or direct image URL.
 */
const JVO_REMOTE = (id, width = 1800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=88&w=${width}`;
window.JVO_REPO_IMAGES = {
  heroDining: { id:'heroDining', label:"warmly lit dining room with guests at dinner", url:"https://images.unsplash.com/photo-1767510533362-4d5dbdaaf8c7?auto=format&fit=crop&q=88&w=2400", external:true, credit:'Unsplash' },
  heroDiningAlt: { id:'heroDiningAlt', label:"warm restaurant dining room set for dinner", url:"https://images.unsplash.com/photo-1740759546556-ff8aaf35ecf9?auto=format&fit=crop&q=88&w=2200", external:true, credit:'Unsplash' },
  storyPasta: { id:'storyPasta', label:"plated seafood pasta dish", url:"https://images.unsplash.com/photo-1779094543025-01eab72dd60a?auto=format&fit=crop&q=88&w=1800", external:true, credit:'Unsplash' },
  eveningTable: { id:'eveningTable', label:"restaurant table set with dinner plates", url:"https://images.unsplash.com/photo-1769733340965-11a667dd592b?auto=format&fit=crop&q=88&w=2200", external:true, credit:'Unsplash' },
  privateRoom: { id:'privateRoom', label:"refined restaurant interior", url:"https://images.unsplash.com/photo-1770359667806-02d769e93e40?auto=format&fit=crop&q=88&w=2000", external:true, credit:'Unsplash' },
  galleryInterior: { id:'galleryInterior', label:"An elegant restaurant interior", url:"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=88&w=2200", external:true, credit:'Unsplash' },
  galleryInterior2: { id:'galleryInterior2', label:"Restaurant tables ready for service", url:"https://images.unsplash.com/photo-1468912637438-582f3f543cba?auto=format&fit=crop&q=88&w=2000", external:true, credit:'Unsplash' },
  galleryInterior3: { id:'galleryInterior3', label:"Warm contemporary restaurant interior", url:"https://images.unsplash.com/photo-1743793056164-67c6ce029d34?auto=format&fit=crop&q=88&w=2000", external:true, credit:'Unsplash' },
  galleryInterior4: { id:'galleryInterior4', label:"table set for two", url:"https://images.unsplash.com/photo-1774509619298-5ee42287b75b?auto=format&fit=crop&q=88&w=2000", external:true, credit:'Unsplash' },
  galleryInterior5: { id:'galleryInterior5', label:"An elegant evening dining room", url:"https://images.unsplash.com/photo-1766832255363-c9f060ade8b0?auto=format&fit=crop&q=88&w=2000", external:true, credit:'Unsplash' },
  galleryTable: { id:'galleryTable', label:"plated dinner on restaurant table", url:"https://images.unsplash.com/photo-1753722421529-478a04442baf?auto=format&fit=crop&q=88&w=1800", external:true, credit:'Unsplash' },
  galleryPeople: { id:'galleryPeople', label:"Fresh broccoli prepared for the kitchen", url:"https://images.unsplash.com/photo-1770351927282-41f6c54f1ac6?auto=format&fit=crop&q=88&w=1800", external:true, credit:'Unsplash' },
  galleryWhiteTable: { id:'galleryWhiteTable', label:"Roasted potatoes plated for service", url:"https://images.unsplash.com/photo-1748716455348-67490d04d54f?auto=format&fit=crop&q=88&w=1800", external:true, credit:'Unsplash' },
  galleryWine: { id:'galleryWine', label:"White wine being poured", url:"https://images.unsplash.com/photo-1776191707344-851c3fc614ce?auto=format&fit=crop&q=88&w=1600", external:true, credit:'Unsplash' },
  galleryCocktail: { id:'galleryCocktail', label:"bartender pouring whiskey drink", url:"https://images.unsplash.com/photo-1666632814910-daebf04b69b8?auto=format&fit=crop&q=88&w=1600", external:true, credit:'Unsplash' },
  mainShrimp: { id:'mainShrimp', label:"Charred prawns with lemon", url:"https://images.unsplash.com/photo-1684253188376-16c7875d04bc?auto=format&fit=crop&q=88&w=1400", external:true, credit:'Unsplash' },
  mainSteak: { id:'mainSteak', label:"grilled steak on plate", url:"https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=88&w=1400", external:true, credit:'Unsplash' },
  mainFish: { id:'mainFish', label:"Roasted salmon with lemon", url:"https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=88&w=1400", external:true, credit:'Unsplash' },
  mainChicken: { id:'mainChicken', label:"Herb roasted chicken", url:"https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&q=88&w=1400", external:true, credit:'Unsplash' },
  mainCarbonara: { id:'mainCarbonara', label:"plate of carbonara", url:"https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&q=88&w=1400", external:true, credit:'Unsplash' },
  mainSeafoodPasta: { id:'mainSeafoodPasta', label:"Seafood pasta with herbs", url:"https://images.unsplash.com/photo-1669109230787-71bdd4699af4?auto=format&fit=crop&q=88&w=1400", external:true, credit:'Unsplash' },
  mainScallops: { id:'mainScallops', label:"Seared scallops on plate", url:"https://images.unsplash.com/photo-1750874694082-bebded5234c6?auto=format&fit=crop&q=88&w=1400", external:true, credit:'Unsplash' },
  mainBolognese: { id:'mainBolognese', label:"Bolognese pasta", url:"https://images.unsplash.com/photo-1785031802363-53893745aad1?auto=format&fit=crop&q=88&w=1400", external:true, credit:'Unsplash' },
  sideFries: { id:'sideFries', label:"Crisp fries in bowl", url:"https://images.unsplash.com/photo-1658853576987-23d2ca596e47?auto=format&fit=crop&q=88&w=1000", external:true, credit:'Unsplash' },
  sidePotatoes: { id:'sidePotatoes', label:"Roasted potatoes with herbs", url:"https://images.unsplash.com/photo-1748716455348-67490d04d54f?auto=format&fit=crop&q=88&w=1000", external:true, credit:'Unsplash' },
  sideBroccoli: { id:'sideBroccoli', label:"Fresh broccoli florets", url:"https://images.unsplash.com/photo-1770351927282-41f6c54f1ac6?auto=format&fit=crop&q=88&w=1000", external:true, credit:'Unsplash' },
  sideCaesar: { id:'sideCaesar', label:"Caesar salad with vegetables", url:"https://images.unsplash.com/photo-1556386734-4227a180d19e?auto=format&fit=crop&q=88&w=1000", external:true, credit:'Unsplash' },
  sideVegetables: { id:'sideVegetables', label:"plate of grilled vegetables", url:"https://images.unsplash.com/photo-1692742246345-c6e7f28ae345?auto=format&fit=crop&q=88&w=1000", external:true, credit:'Unsplash' },
  sideSweetPotato: { id:'sideSweetPotato', label:"Sweet potato fries with dipping sauce", url:"https://images.unsplash.com/photo-1745792714512-77cffdb16020?auto=format&fit=crop&q=88&w=1000", external:true, credit:'Unsplash' },
  sideFlatbread: { id:'sideFlatbread', label:"Warm rustic bread for the table", url:"https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=88&w=1000", external:true, credit:'Unsplash' },
  juiceOrange: { id:'juiceOrange', label:"Fresh orange juice", url:"https://images.unsplash.com/photo-1628200487311-7bdfd5e6ace3?auto=format&fit=crop&q=88&w=1000", external:true, credit:'Unsplash' },
  juiceOrangePour: { id:'juiceOrangePour', label:"Fresh orange juice being poured", url:"https://images.unsplash.com/photo-1678124620671-a30ed6463834?auto=format&fit=crop&q=88&w=1000", external:true, credit:'Unsplash' },
  juicePineapple: { id:'juicePineapple', label:"Fresh pineapple juice", url:"https://images.unsplash.com/photo-1614285180495-ca39bc046b5e?auto=format&fit=crop&q=88&w=1000", external:true, credit:'Unsplash' },
  juiceGreen: { id:'juiceGreen', label:"Fresh green juice", url:"https://images.unsplash.com/photo-1562419814-c1c56a1109eb?auto=format&fit=crop&q=88&w=1000", external:true, credit:'Unsplash' },
  juicePassion: { id:'juicePassion', label:"Passion fruit juice", url:"https://images.unsplash.com/photo-1571161473325-1594dece4499?auto=format&fit=crop&q=88&w=1000", external:true, credit:'Unsplash' },
  barRed: { id:'barRed', label:"glass of red wine", url:"https://images.unsplash.com/photo-1780675520350-917559e364c0?auto=format&fit=crop&q=88&w=1000", external:true, credit:'Unsplash' },
  barWhite: { id:'barWhite', label:"White wine being poured", url:"https://images.unsplash.com/photo-1776191707344-851c3fc614ce?auto=format&fit=crop&q=88&w=1000", external:true, credit:'Unsplash' },
  barSparkling: { id:'barSparkling', label:"bottle and glass of wine", url:"https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=88&w=1000", external:true, credit:'Unsplash' },
  barOldFashioned: { id:'barOldFashioned', label:"bartender pouring whiskey cocktail", url:"https://images.unsplash.com/photo-1666632814910-daebf04b69b8?auto=format&fit=crop&q=88&w=1000", external:true, credit:'Unsplash' },
  barWhiskey: { id:'barWhiskey', label:"glass of whiskey", url:"https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=88&w=1000", external:true, credit:'Unsplash' },
  dessertCheesecake: { id:'dessertCheesecake', label:"Burnt cheesecake with berries", url:"https://images.unsplash.com/photo-1744037247704-fbb21bad0903?auto=format&fit=crop&q=88&w=1000", external:true, credit:'Unsplash' },
  dessertTiramisu: { id:'dessertTiramisu', label:"tiramisu dessert", url:"https://images.unsplash.com/photo-1773418264113-4206f83e4aa7?auto=format&fit=crop&q=88&w=1000", external:true, credit:'Unsplash' },
  dessertIceCream: { id:'dessertIceCream', label:"Ice cream dessert", url:"https://images.unsplash.com/photo-1566626066191-8ca5c69d0876?auto=format&fit=crop&q=88&w=1000", external:true, credit:'Unsplash' },
  dessertChocolate: { id:'dessertChocolate', label:"dark chocolate dessert", url:"https://images.unsplash.com/photo-1545020714-64789c4894a8?auto=format&fit=crop&q=88&w=1000", external:true, credit:'Unsplash' },
  dessertCake: { id:'dessertCake', label:"Chocolate cake", url:"https://images.unsplash.com/photo-1564645218026-797631447574?auto=format&fit=crop&q=88&w=1000", external:true, credit:'Unsplash' },
};

window.JVO_LEGACY_IMAGE_ALIASES = {
  heroUnsplash:'heroDining', heroUnsplashWarm:'heroDiningAlt', eveningUnsplash:'eveningTable', platedUnsplash:'galleryTable',
  diningRoom:'heroDiningAlt', diningRoomWide:'galleryInterior2', diningRoomBlue:'galleryInterior5', barInterior:'galleryInterior3',
  exterior:'galleryInterior', candlelight:'galleryInterior4', platedSteak:'mainSteak', tomahawk:'mainSteak', filet:'mainChicken', salmon:'mainFish',
  scallops:'mainScallops', shrimp:'mainShrimp', salad:'sideCaesar', seafood:'mainSeafoodPasta', smallBites:'sideVegetables', baconBites:'sidePotatoes',
  dessert:'dessertCheesecake', platedDetail:'galleryTable', tableSetting:'sideFlatbread', kitchenDetail:'galleryInterior3', cocktail:'barOldFashioned',
  cocktails:'juicePineapple', cocktail3:'juiceGreen', champagne:'barSparkling', wine:'barRed', bourbon:'barWhiskey', whiskey:'barOldFashioned',
  barShelf:'barWhiskey', privateRoom:'privateRoom', tableConversation:'galleryInterior4', gathering:'galleryInterior2', wineWall:'barWhite',
  barTable:'galleryCocktail', diningTable:'galleryInterior4', warmTerrace:'galleryInterior5', kitchenHands:'galleryInterior3', baker:'dessertCheesecake',
  platedDish:'mainFish', serviceWarm:'galleryInterior2', nightStreet:'galleryInterior'
};

window.JVO_RESTAURANT_TEMPLATE = {
  name:"The Common Table",
  eyebrow:"Kitchen · Bar · Table",
  tagline:"Dinner worth lingering over.",
  intro:"A neighbourhood restaurant for long lunches, proper dinners and evenings that deserve a little more time.",
  city:"Accra, Ghana",
  address:"18 Olive Street, Osu",
  phone:"+233 20 123 4567",
  email:"hello@restaurant.com",
  hours:"Mon–Thu 12:00–22:00 · Fri–Sat 12:00–23:00 · Sun 13:00–21:00",
  reservationUrl:"",
  orderUrl:"",
  instagramUrl:"",
  logoText:"The Common Table",
  primaryCta:"Make a reservation",
  secondaryCta:"View the menu",
  heroImage:{source:'repo',id:'heroDining',alt:'A warmly lit dining room with guests at dinner'},
  storyTitle:'Good food. Properly served.',
  storyText:'Familiar food, carefully cooked and served without fuss. The kind of meal that makes you want to stay a little longer.',
  storyImage:{source:'repo',id:'storyPasta',alt:'A plated seafood pasta dish'},
  experienceTitle:'Come for dinner. Stay for the evening.',
  experienceText:'Start with a drink, take your time with dinner and let the evening unfold without rushing it.',
  popularIntro:'Five corners of the menu, from the first plate to the last sweet thing.',
  menuIntro:'A generous menu of mains, sides, fresh juices, wine and spirits, then something sweet to finish.',
  menuNote:'Sample menu for concept presentation.',
  menuFooterNote:'The menu can change with the season. Update dishes, descriptions, prices and photos from the studio.',
  galleryTitle:'A room worth seeing.',
  galleryIntro:'A little look at the room, the table and the details that shape the evening.',
  privateDiningTitle:'Private dinners, done properly.',
  privateDiningText:'A more personal way to use the room for celebrations, team dinners, birthdays and evenings worth marking.',
  privateDiningDetails:'Tell us what you are planning, how many people you have in mind and when you would like to come. We can take it from there.',
  privateDiningCapacity:'Up to 30 guests',
  contactIntro:'Find the restaurant, check the hours and get the practical details before you arrive.',
  dressCode:'Smart casual.', parking:'Street parking nearby.', reservationNote:'Reservations are recommended.',
  menu:[
    {name:"Charred prawns",category:"Main dishes",description:"Garlic, chilli, lime and warm flatbread.",price:"95",currency:'GHS',featured:true,image:{source:'repo',id:'mainShrimp',alt:"Charred prawns with lemon"}},
    {name:"House ribeye",category:"Main dishes",description:"Fire-grilled beef, herb butter and a rich pan sauce.",price:"235",currency:'GHS',featured:true,image:{source:'repo',id:'mainSteak',alt:"A grilled steak on a plate"}},
    {name:"Roasted salmon",category:"Main dishes",description:"Citrus butter, charred greens and roast potatoes.",price:"165",currency:'GHS',featured:true,image:{source:'repo',id:'mainFish',alt:"Roasted salmon with lemon"}},
    {name:"Herb roasted chicken",category:"Main dishes",description:"Crisp skin, roast jus and a little lemon.",price:"145",currency:'GHS',featured:false,image:{source:'repo',id:'mainChicken',alt:"Herb roasted chicken"}},
    {name:"Classic carbonara",category:"Main dishes",description:"Parmesan, black pepper and silky cured pork.",price:"125",currency:'GHS',featured:false,image:{source:'repo',id:'mainCarbonara',alt:"A plate of carbonara"}},
    {name:"Seafood linguine",category:"Main dishes",description:"Prawns, mussels, herbs and a bright tomato broth.",price:"175",currency:'GHS',featured:false,image:{source:'repo',id:'mainSeafoodPasta',alt:"Seafood pasta with herbs"}},
    {name:"Seared scallops",category:"Main dishes",description:"Sweet scallops, parmesan risotto and greens.",price:"185",currency:'GHS',featured:false,image:{source:'repo',id:'mainScallops',alt:"Seared scallops on a plate"}},
    {name:"Slow-cooked bolognese",category:"Main dishes",description:"Beef, tomato, herbs and fresh pasta.",price:"145",currency:'GHS',featured:false,image:{source:'repo',id:'mainBolognese',alt:"Bolognese pasta"}},
    {name:"Crisp fries",category:"Sides",description:"Sea salt and our house dipping sauce.",price:"35",currency:'GHS',featured:false,image:{source:'repo',id:'sideFries',alt:"Crisp fries in a bowl"}},
    {name:"Rosemary potatoes",category:"Sides",description:"Roasted garlic, rosemary and flaky salt.",price:"42",currency:'GHS',featured:false,image:{source:'repo',id:'sidePotatoes',alt:"Roasted potatoes with herbs"}},
    {name:"Charred broccolini",category:"Sides",description:"Lemon, parmesan and toasted almonds.",price:"42",currency:'GHS',featured:false,image:{source:'repo',id:'sideBroccoli',alt:"Fresh broccoli florets"}},
    {name:"Caesar salad",category:"Sides",description:"Crisp leaves, parmesan, croutons and dressing.",price:"50",currency:'GHS',featured:false,image:{source:'repo',id:'sideCaesar',alt:"Caesar salad with vegetables"}},
    {name:"Grilled market vegetables",category:"Sides",description:"Zucchini, peppers, herbs and olive oil.",price:"45",currency:'GHS',featured:false,image:{source:'repo',id:'sideVegetables',alt:"A plate of grilled vegetables"}},
    {name:"Sweet potato fries",category:"Sides",description:"Warm spices and a cool dipping sauce.",price:"45",currency:'GHS',featured:false,image:{source:'repo',id:'sideSweetPotato',alt:"Sweet potato fries with dipping sauce"}},
    {name:"Warm flatbread",category:"Sides",description:"Olive oil, sea salt and whipped herb butter.",price:"35",currency:'GHS',featured:false,image:{source:'repo',id:'sideFlatbread',alt:"Warm rustic bread for the table"}},
    {name:"Fresh orange",category:"Fresh juices",description:"Cold-pressed orange, bright and clean.",price:"30",currency:'GHS',featured:false,image:{source:'repo',id:'juiceOrange',alt:"Fresh orange juice"}},
    {name:"Citrus press",category:"Fresh juices",description:"Orange, lemon and a touch of ginger.",price:"32",currency:'GHS',featured:false,image:{source:'repo',id:'juiceOrangePour',alt:"Fresh orange juice being poured"}},
    {name:"Pineapple ginger",category:"Fresh juices",description:"Fresh pineapple, ginger and lime.",price:"32",currency:'GHS',featured:false,image:{source:'repo',id:'juicePineapple',alt:"Fresh pineapple juice"}},
    {name:"Green garden",category:"Fresh juices",description:"Apple, cucumber, mint and lemon.",price:"30",currency:'GHS',featured:false,image:{source:'repo',id:'juiceGreen',alt:"Fresh green juice"}},
    {name:"Passion fruit cooler",category:"Fresh juices",description:"Passion fruit, orange and fresh mint.",price:"32",currency:'GHS',featured:false,image:{source:'repo',id:'juicePassion',alt:"Passion fruit juice"}},
    {name:"House red",category:"Wine & spirits",description:"Soft fruit, gentle spice and easy with dinner.",price:"78",currency:'GHS',featured:false,image:{source:'repo',id:'barRed',alt:"A glass of red wine"}},
    {name:"House white",category:"Wine & spirits",description:"Crisp, dry and made for seafood and starters.",price:"78",currency:'GHS',featured:false,image:{source:'repo',id:'barWhite',alt:"White wine being poured"}},
    {name:"Sparkling brut",category:"Wine & spirits",description:"Dry bubbles for a first toast or a proper celebration.",price:"110",currency:'GHS',featured:false,image:{source:'repo',id:'barSparkling',alt:"A bottle and glass of wine"}},
    {name:"Old fashioned",category:"Wine & spirits",description:"Bourbon, orange and bitters over ice.",price:"75",currency:'GHS',featured:false,image:{source:'repo',id:'barOldFashioned',alt:"A bartender pouring a whiskey cocktail"}},
    {name:"Reserve whiskey",category:"Wine & spirits",description:"A slow pour from the back bar.",price:"95",currency:'GHS',featured:false,image:{source:'repo',id:'barWhiskey',alt:"A glass of whiskey"}},
    {name:"Burnt cheesecake",category:"Dessert",description:"Caramelised top, soft centre and sea salt.",price:"55",currency:'GHS',featured:false,image:{source:'repo',id:'dessertCheesecake',alt:"Burnt cheesecake with berries"}},
    {name:"Tiramisu",category:"Dessert",description:"Espresso, mascarpone and cocoa.",price:"58",currency:'GHS',featured:false,image:{source:'repo',id:'dessertTiramisu',alt:"A tiramisu dessert"}},
    {name:"Vanilla ice cream",category:"Dessert",description:"Three scoops with warm chocolate sauce.",price:"45",currency:'GHS',featured:false,image:{source:'repo',id:'dessertIceCream',alt:"Ice cream dessert"}},
    {name:"Dark chocolate pot",category:"Dessert",description:"Silky dark chocolate, cream and cocoa nibs.",price:"52",currency:'GHS',featured:false,image:{source:'repo',id:'dessertChocolate',alt:"A dark chocolate dessert"}},
    {name:"Chocolate cake",category:"Dessert",description:"Warm chocolate cake with vanilla cream.",price:"55",currency:'GHS',featured:false,image:{source:'repo',id:'dessertCake',alt:"Chocolate cake"}},
  ],
  gallery:[
    {image:{source:'repo',id:'galleryInterior',alt:"Dining room before service"}},
    {image:{source:'repo',id:'galleryInterior2',alt:"Tables ready for dinner"}},
    {image:{source:'repo',id:'galleryInterior3',alt:"Warm contemporary dining room"}},
    {image:{source:'repo',id:'galleryInterior4',alt:"Table for two"}},
    {image:{source:'repo',id:'galleryInterior5',alt:"Evening dining room"}},
    {image:{source:'repo',id:'galleryTable',alt:"Dinner on the table"}},
    {image:{source:'repo',id:'galleryWine',alt:"White wine at the table"}},
    {image:{source:'repo',id:'galleryCocktail',alt:"Cocktail service"}},
    {image:{source:'repo',id:'galleryPeople',alt:"Kitchen detail"}},
    {image:{source:'repo',id:'galleryWhiteTable',alt:"Roasted potatoes from the kitchen"}},
  ],
  leadStatus:'New',notes:'',recipientName:'',recipientEmail:''
};

window.JVO_RESTAURANT_EMAIL_TEMPLATE = {
  subject:'I put together an idea for {{restaurantName}}',
  body:`Hi {{recipientName}},

I came across {{restaurantName}} and liked what you are building.

I put together a private website concept for {{restaurantName}} because I thought the restaurant could be presented online in a way that feels as considered as the experience in the room.

Here is the concept:
{{demoLink}}

There is nothing to commit to. I wanted you to see the idea first rather than send you a generic portfolio link.

If you like the direction, I can build the full site around your real menu, photography, reservations and ordering flow.

You can simply reply to this email or reach me on WhatsApp at {{whatsappNumber}}.

Thanks,
{{yourName}}
CEO, {{businessName}}`
};
