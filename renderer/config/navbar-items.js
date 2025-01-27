/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

const navbar_items = [];

// text & desc use localization keys
navbar_items.push({
    href: '/play',
    text: "/play.name",
    desc: '/play.desc',
    image: '/img/heap1.png',
});

navbar_items.push({
    href: '/mods',
    text: "/mods.name",
    desc: '/mods.desc',
    image: '/img/heap2.png',
});

navbar_items.push({
    href: '/servers',
    text: "/servers.name",
    desc: '/servers.desc',
    image: '/img/heap2.png',
});

navbar_items.push({
    href: '/about',
    text: "/about.name",
    desc: '/about.tldr',
    image: '/img/heap2.png',
});

navbar_items.push({
    href: '/logs',
    text: "/logs.name",
    desc: '/logs.desc',
    image: '/img/heap2.png',
});

export default navbar_items;
