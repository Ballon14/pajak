/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    // Base path hanya untuk production
    basePath: process.env.NODE_ENV === "production" ? "/pajakapp" : "",
    // Asset prefix hanya untuk production
    assetPrefix: process.env.NODE_ENV === "production" ? "/pajakapp" : "",
    // Trailing slash untuk konsistensi
    trailingSlash: false,
    // Experimental features jika diperlukan
    experimental: {
        // Enable jika menggunakan app router
        appDir: true,
    },
}

export default nextConfig

