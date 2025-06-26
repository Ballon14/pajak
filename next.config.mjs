/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    // Base path untuk sub-path routing
    basePath: "/pajakapp",
    // Asset prefix untuk static files
    assetPrefix: process.env.NODE_ENV === "production" ? "/pajakapp" : "",
    // Trailing slash untuk konsistensi
    trailingSlash: false,
}

export default nextConfig
