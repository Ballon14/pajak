import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(req) {
    try {
        const { message, type } = await req.json()

        if (!message || !message.trim()) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            )
        }

        if (!type || !["all", "active", "inactive"].includes(type)) {
            return NextResponse.json(
                { error: "Invalid broadcast type" },
                { status: 400 }
            )
        }

        const db = await connectToDatabase()

        // Get users based on broadcast type
        let userFilter = {}
        if (type === "active") {
            userFilter = { isActive: true }
        } else if (type === "inactive") {
            userFilter = { isActive: false }
        }

        const users = await db.collection("User").find(userFilter).toArray()

        // Create broadcast messages for each user
        const broadcastMessages = users.map((user) => ({
            message: message.trim(),
            from: "Admin",
            userId: user._id,
            time: new Date(),
            isBroadcast: true,
            broadcastType: type,
            read: false,
        }))

        // Insert broadcast messages
        if (broadcastMessages.length > 0) {
            await db.collection("chats").insertMany(broadcastMessages)
        }

        return NextResponse.json({
            success: true,
            sentTo: users.length,
            message: `Broadcast sent to ${users.length} users`,
        })
    } catch (error) {
        console.error("Error sending broadcast:", error)
        return NextResponse.json(
            { error: "Failed to send broadcast" },
            { status: 500 }
        )
    }
}
