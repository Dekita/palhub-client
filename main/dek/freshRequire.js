
// requires a module, but also removes it from the cache first
// to ensure data returned is crispy fresh good <3
module.exports = function freshRequire(modulename) {
    delete require.cache[require.resolve(modulename)];
    return require(modulename);
}

