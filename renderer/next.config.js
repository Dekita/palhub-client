/** @type {import('next').NextConfig} */
module.exports = {
    output: 'export',
    swcMinify: true,
    reactStrictMode: true,
    trailingSlash: true,
    distDir: process.env.NODE_ENV === 'production' ? '../app' : '.next',
    images: {unoptimized: true},
    webpack: (config) => {
        // Add support for importing SVG files using @svgr/webpack
        config.module.rules.push({
            test: /\.svg$/i,
            issuer: /\.[jt]sx?$/,
            use: ['@svgr/webpack'],
        });
        // Add support for importing Markdown files using raw-loader
        config.module.rules.push({
            test: /\.md$/,
            use: 'raw-loader',
        });
        return config
    },
    // ignore key checks blah blah blah
    eslint: {
        ignoreDuringBuilds: true,
    },
}
