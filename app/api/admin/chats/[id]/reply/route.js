import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req, { params }) {
    try {
        const { id } = params
        const { message } = await req.json()

        if (!message || !message.trim()) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            )
        }

        const db = await connectToDatabase()

        // First, get the original chat to get user info
        const originalChat = await db.collection("chats").findOne({
            _id: new ObjectId(id),
        })

        if (!originalChat) {
            return NextResponse.json(
                { error: "Chat not found" },
                { status: 404 }
            )
        }

        // Create admin reply
        const adminReply = {
            message: message.trim(),
            from: "Admin",
            userId: originalChat.userId, // Keep same user context
            time: new Date(),
            isAdminReply: true,
            originalChatId: new ObjectId(id),
            read: false,
        }

        // Insert the admin reply
        const result = await db.collection("chats").insertOne(adminReply)

        // Update the original chat as read
        await db.collection("chats").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    read: true,
                    readAt: new Date(),
                    hasReply: true,
                },
            }
        )

        return NextResponse.json({
            success: true,
            replyId: result.insertedId.toString(),
        })
    } catch (error) {
        console.error("Error sending admin reply:", error)
        return NextResponse.json(
            { error: "Failed to send reply" },
            { status: 500 }
        )
    }
}
