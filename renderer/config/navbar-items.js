/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/

import dektionary from '@config/dektionary';

const navbar_items = [];

navbar_items.push({
    href: '/play',
    text: "Play",
    desc: 'Play Palworld!',
    image: '/img/heap1.png',
});

navbar_items.push({
    href: '/mods',
    text: "Mods",
    desc: 'Check out the mods available for Palworld!',
    image: '/img/heap2.png',
});

// navbar_items.push({
//     href: '/servers',
//     text: "Servers",
//     desc: 'Find PalHUB Servers!',
//     image: '/img/heap2.png',
// });

navbar_items.push({
    href: '/about',
    text: "About",
    desc: 'About PalHUB!',
    image: '/img/heap2.png',
});

// navbar_items.push({
//     href: '/faq',
//     text: dektionary.navlinks.faq,
//     desc: "Got a query? Check our commonly asked questions to see if it's already been answered!",
//     image: '/img/heap3.png',
// });

// navbar_items.push({
//     href: '/privacy',
//     text: dektionary.navlinks.privacy,
//     desc: 'Find out what data we store and how we use it!',
//     image: '/img/heap2.png',
// });

// navbar_items.push({
//     href: '/terms',
//     text: dektionary.navlinks.tandc,
//     desc: 'The terms and conditions when using our service!',
//     image: '/img/heap2.png',
// });

export default navbar_items;
