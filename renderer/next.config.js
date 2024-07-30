/** @type {import('next').NextConfig} */
module.exports = {
    output: 'export',
    swcMinify: true,
    reactStrictMode: true,
    trailingSlash: true,
    distDir: process.env.NODE_ENV === 'production' ? '../app' : '.next',
    images: {unoptimized: true},
    webpack: (config) => {
        config.module.rules.push({
            test: /\.svg$/i,
            issuer: /\.[jt]sx?$/,
            use: ['@svgr/webpack'],
        });        
        return config
    },
    // ignore key checks blah blah blah
    eslint: {
        ignoreDuringBuilds: true,
    },
}
