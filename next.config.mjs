/** @type {import('next').NextConfig} */
const nextConfig = {
    // Base path hanya untuk production
    basePath:
        process.env.NODE_ENV === "production" && process.env.BASE_PATH
            ? process.env.BASE_PATH
            : "",
    // Asset prefix hanya untuk production
    assetPrefix:
        process.env.NODE_ENV === "production" && process.env.BASE_PATH
            ? process.env.BASE_PATH
            : "",
    // Trailing slash untuk konsistensi
    trailingSlash: false,
    // Experimental features jika diperlukan
}

export default nextConfig
