"use client"
import { usePathname } from "next/navigation"
import SupportChat from "./SupportChat"

export default function SupportChatWrapper() {
    const pathname = usePathname()
    if (pathname === "/login" || pathname === "/register") return null
    return <SupportChat />
}
