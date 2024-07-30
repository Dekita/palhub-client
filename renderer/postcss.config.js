module.exports = {
    plugins: {
        'postcss-import': {},
        'tailwindcss/nesting': {},
        tailwindcss: {config: './renderer/tailwind.config.js'},
        autoprefixer: {},
    },
}