import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req, { params }) {
    try {
        const { conversationId } = params
        const { searchParams } = new URL(req.url)
        const isAdmin = searchParams.get("isAdmin") === "true"

        if (!conversationId) {
            return NextResponse.json(
                { error: "Conversation ID required" },
                { status: 400 }
            )
        }

        const db = await connectToDatabase()

        // Get conversation details
        const conversation = await db.collection("conversations").findOne({
            _id: new ObjectId(conversationId),
        })

        if (!conversation) {
            return NextResponse.json(
                { error: "Conversation not found" },
                { status: 404 }
            )
        }

        // Get all messages for this conversation
        const messages = await db
            .collection("chats")
            .find({ conversationId: new ObjectId(conversationId) })
            .sort({ time: 1 })
            .toArray()

        // Mark messages as read if not admin
        if (!isAdmin) {
            await db.collection("chats").updateMany(
                {
                    conversationId: new ObjectId(conversationId),
                    isAdmin: true,
                    read: false,
                },
                { $set: { read: true, readAt: new Date() } }
            )

            // Reset unread count
            await db
                .collection("conversations")
                .updateOne(
                    { _id: new ObjectId(conversationId) },
                    { $set: { unreadCount: 0 } }
                )
        }

        // Get user info if admin
        let userInfo = null
        if (isAdmin && conversation.userId) {
            const user = await db.collection("User").findOne({
                _id: new ObjectId(conversation.userId),
            })
            if (user) {
                userInfo = {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                }
            }
        }

        return NextResponse.json({
            conversation: {
                id: conversation._id.toString(),
                userId: conversation.userId?.toString(),
                email: conversation.email,
                createdAt: conversation.createdAt,
                lastMessage: conversation.lastMessage,
                unreadCount: conversation.unreadCount,
                user: userInfo,
            },
            messages: messages.map((msg) => ({
                id: msg._id.toString(),
                message: msg.message,
                from: msg.from,
                time: msg.time,
                isAdmin: msg.isAdmin,
                read: msg.read,
            })),
        })
    } catch (error) {
        console.error("Error fetching conversation:", error)
        return NextResponse.json(
            { error: "Failed to fetch conversation" },
            { status: 500 }
        )
    }
}

export async function POST(req, { params }) {
    try {
        const { conversationId } = params
        const { message, from, isAdmin = false } = await req.json()

        if (!message || !message.trim()) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            )
        }

        if (!conversationId) {
            return NextResponse.json(
                { error: "Conversation ID required" },
                { status: 400 }
            )
        }

        const db = await connectToDatabase()

        // Verify conversation exists
        const conversation = await db.collection("conversations").findOne({
            _id: new ObjectId(conversationId),
        })

        if (!conversation) {
            return NextResponse.json(
                { error: "Conversation not found" },
                { status: 404 }
            )
        }

        // Insert the message
        const chatMessage = {
            message: message.trim(),
            from,
            email: conversation.email,
            userId: conversation.userId,
            conversationId: new ObjectId(conversationId),
            isAdmin: isAdmin,
            time: new Date(),
            read: false,
        }

        const result = await db.collection("chats").insertOne(chatMessage)

        // Update conversation last message time and unread count
        await db.collection("conversations").updateOne(
            { _id: new ObjectId(conversationId) },
            {
                $set: {
                    lastMessage: new Date(),
                    unreadCount: isAdmin ? 0 : 1, // Reset unread count if admin replies
                },
            }
        )

        return NextResponse.json({
            success: true,
            messageId: result.insertedId.toString(),
        })
    } catch (error) {
        console.error("Error sending message:", error)
        return NextResponse.json(
            { error: "Failed to send message" },
            { status: 500 }
        )
    }
}
