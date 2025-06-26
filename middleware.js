import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        // Add custom headers to prevent caching issues
        const response = NextResponse.next()
        response.headers.set("Cache-Control", "no-store, max-age=0")
        return response
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
)

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/inputdata/:path*",
        "/listingdata/:path*",
        "/exportdata/:path*",
        "/api/tax/:path*",
        "/api/user/:path*",
    ],
}
