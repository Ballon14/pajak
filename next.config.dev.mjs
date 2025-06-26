/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    experimental: {
        outputFileTracingRoot: undefined,
    },
    // Development configuration - no base path
    // basePath: '', // Tidak ada base path untuk development
    // assetPrefix: '', // Tidak ada asset prefix untuk development
    // Trailing slash untuk konsistensi
    trailingSlash: false,
}

export default nextConfig
