/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",

    // Development: tidak ada basePath
    basePath: "",
    assetPrefix: "",

    // Trailing slash untuk konsistensi
    trailingSlash: false,

    // Experimental features
    experimental: {
        appDir: true,
    },
}

export default nextConfig
