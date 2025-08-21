"use client"
import { usePathname } from "next/navigation"
import MainLayout from "./MainLayout"
import SupportChatWrapper from "./SupportChatWrapper"

// Halaman yang tidak memerlukan sidebar navigation
const authPages = ["/login", "/register", "/forgot-password", "/reset-password"]

export default function ConditionalLayout({ children }) {
    const pathname = usePathname()

    // Check if current page is an auth page
    const isAuthPage = authPages.includes(pathname)

    if (isAuthPage) {
        // Render auth pages without MainLayout/Sidebar
        return children
    }

    // Render other pages with MainLayout/Sidebar
    return (
        <MainLayout>
            {children}
            <SupportChatWrapper />
        </MainLayout>
    )
}
