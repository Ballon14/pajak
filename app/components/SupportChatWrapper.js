"use client"
import { useSession } from "next-auth/react"
import RealTimeChatSidebar from "./RealTimeChatSidebar"

export default function SupportChatWrapper() {
    const { data: session, status } = useSession()

    // Only show chat sidebar for authenticated users
    if (status !== "authenticated" || !session) {
        return null
    }

    // Hide chat for admin users
    if (session?.user?.role === "admin") {
        return null
    }

    return <RealTimeChatSidebar />
}
