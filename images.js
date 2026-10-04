/*
 * JVO restaurant demo assets.
 * Change the repo image URLs here later and every saved demo that points to
 * a repo image will automatically use the new image.
 */
window.JVO_REPO_IMAGES = {
  diningTable: { id: 'diningTable', label: 'Shared dining table', url: 'images/a11.webp' },
  warmTerrace: { id: 'warmTerrace', label: 'Warm restaurant terrace', url: 'images/a2.webp' },
  kitchenHands: { id: 'kitchenHands', label: 'Kitchen detail', url: 'images/a10.webp' },
  baker: { id: 'baker', label: 'Baker at work', url: 'images/a4.webp' },
  platedDish: { id: 'platedDish', label: 'Plated dish', url: 'images/a8.webp' },
  serviceWarm: { id: 'serviceWarm', label: 'Warm service scene', url: 'images/a3.webp' },
  nightStreet: { id: 'nightStreet', label: 'Night street', url: 'images/a12.webp' }
};

window.JVO_RESTAURANT_TEMPLATE = {
  name: 'The Common Table',
  eyebrow: 'Kitchen · Bar · Table',
  tagline: 'Good food, warm light and nowhere to rush.',
  intro: 'A neighbourhood restaurant built around honest cooking, generous plates and the kind of evenings you want to stretch out a little longer.',
  city: 'Accra, Ghana',
  address: '18 Olive Street, Osu',
  phone: '+233 20 123 4567',
  email: 'hello@restaurant.com',
  hours: 'Mon–Thu 12:00–22:00 · Fri–Sat 12:00–23:00 · Sun 13:00–21:00',
  reservationUrl: '',
  orderUrl: '',
  instagramUrl: '',
  logoText: 'Common Table',
  primaryCta: 'Book a table',
  secondaryCta: 'See the menu',
  heroImage: { source: 'repo', id: 'warmTerrace', alt: 'A warmly lit restaurant terrace at night' },
  storyTitle: 'A table worth coming back to.',
  storyText: 'We cook food that feels familiar but never flat. The menu moves with the season, the room stays easy and the bar is always ready for one more round. Come for dinner, stay because the night got good.',
  storyImage: { source: 'repo', id: 'kitchenHands', alt: 'Hands plating a dish in the kitchen' },
  experienceTitle: 'Come hungry. Leave happy.',
  experienceText: 'Good food, a proper drink and enough room to talk. That is really the whole point.',
  menu: [
    { name: 'Charred prawns', category: 'Small plates', description: 'Garlic, chilli, lime and warm flatbread.', price: '95', currency: 'GHS', image: { source: 'repo', id: 'platedDish', alt: 'A beautifully plated dish' } },
    { name: 'Market salad', category: 'Small plates', description: 'Crisp greens, roasted vegetables, herbs and citrus dressing.', price: '65', currency: 'GHS', image: { source: 'repo', id: 'diningTable', alt: 'Fresh food shared around a table' } },
    { name: 'Ember chicken', category: 'Mains', description: 'Slow-roasted chicken, smoky jus and crispy potatoes.', price: '140', currency: 'GHS', image: { source: 'repo', id: 'kitchenHands', alt: 'Chef preparing a dish' } },
    { name: 'Coconut fish', category: 'Mains', description: 'Market fish, coconut sauce, herbs and steamed rice.', price: '155', currency: 'GHS', image: { source: 'repo', id: 'serviceWarm', alt: 'A warm restaurant scene' } },
    { name: 'House burger', category: 'Mains', description: 'Dry-aged beef, smoked cheddar, pickles and house fries.', price: '125', currency: 'GHS', image: { source: 'repo', id: 'warmTerrace', alt: 'Warmly lit restaurant dining room' } },
    { name: 'Burnt cheesecake', category: 'Dessert', description: 'Soft centre, caramelised top and a little sea salt.', price: '55', currency: 'GHS', image: { source: 'repo', id: 'baker', alt: 'Freshly baked food from the kitchen' } }
  ],
  gallery: [
    { image: { source: 'repo', id: 'warmTerrace', alt: 'Warmly lit restaurant terrace' } },
    { image: { source: 'repo', id: 'kitchenHands', alt: 'Chef plating a dish' } },
    { image: { source: 'repo', id: 'diningTable', alt: 'Shared dining table' } },
    { image: { source: 'repo', id: 'platedDish', alt: 'Plated dish' } },
    { image: { source: 'repo', id: 'serviceWarm', alt: 'Restaurant service scene' } }
  ]
};

window.JVO_RESTAURANT_EMAIL_TEMPLATE = {
  subject: 'A website idea for {{restaurantName}}',
  body: `Hi {{recipientName}},

I came across {{restaurantName}} and liked what you’re doing in {{city}}.

I spent a little time thinking about how the restaurant could come across online, especially the menu, atmosphere and booking experience.

So I put together a quick website concept using {{restaurantName}} as the starting point:
{{demoLink}}

It is only a concept for now, but the page is built around your restaurant rather than a generic portfolio.

If you like the direction, I can build the full site around your real photos, menu and booking or ordering setup.

No pressure either way. I just thought it was worth showing you.

Best,
{{yourName}}
{{businessName}}`
};
