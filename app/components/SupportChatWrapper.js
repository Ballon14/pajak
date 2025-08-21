"use client"
import { useSession } from "next-auth/react"
import RealTimeChatSidebar from "./RealTimeChatSidebar"

export default function SupportChatWrapper() {
    const { data: session, status } = useSession()

    // Only show chat sidebar for authenticated users
    if (status !== "authenticated" || !session) {
        return null
    }

    // Show chat for both users and admins
    return <RealTimeChatSidebar />
}
