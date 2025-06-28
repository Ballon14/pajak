"use client"
import { usePathname } from "next/navigation"
import SupportChat from "./SupportChat"

export default function SupportChatWrapper() {
    const pathname = usePathname()

    // Sembunyikan chat di halaman login, register, dan semua halaman admin
    const hideChatPaths = [
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
    ]

    // Cek apakah path saat ini adalah halaman yang harus disembunyikan
    const shouldHideChat =
        hideChatPaths.includes(pathname) ||
        pathname.startsWith("/dashboard/admin")

    if (shouldHideChat) {
        return null
    }

    return <SupportChat />
}
