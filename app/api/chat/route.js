import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req) {
    try {
        const body = await req.json()
        const {
            message,
            from,
            email,
            userId,
            broadcast,
            isAdmin = false,
            targetUserId = null,
        } = body

        if (!message || !message.trim()) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            )
        }

        const db = await connectToDatabase()

        if (broadcast) {
            await db.collection("Broadcast").insertOne({
                message: message.trim(),
                from,
                time: new Date(),
            })
            return NextResponse.json({ success: true, broadcast: true })
        }

        // Create or get conversation thread
        let conversationId = null

        if (isAdmin && targetUserId) {
            // Admin starting a private chat with specific user
            const existingConversation = await db
                .collection("conversations")
                .findOne({
                    userId: new ObjectId(targetUserId),
                })

            if (existingConversation) {
                conversationId = existingConversation._id
            } else {
                // Create new conversation for admin-initiated chat
                const targetUser = await db.collection("User").findOne({
                    _id: new ObjectId(targetUserId),
                })

                if (!targetUser) {
                    return NextResponse.json(
                        { error: "Target user not found" },
                        { status: 404 }
                    )
                }

                const newConversation = await db
                    .collection("conversations")
                    .insertOne({
                        userId: new ObjectId(targetUserId),
                        email: targetUser.email,
                        createdAt: new Date(),
                        lastMessage: new Date(),
                        unreadCount: 1, // Admin message counts as unread for user
                        adminInitiated: true,
                    })
                conversationId = newConversation.insertedId
            }
        } else if (userId) {
            // Regular user sending message
            const existingConversation = await db
                .collection("conversations")
                .findOne({
                    userId: new ObjectId(userId),
                })

            if (existingConversation) {
                conversationId = existingConversation._id
            } else {
                // Create new conversation
                const newConversation = await db
                    .collection("conversations")
                    .insertOne({
                        userId: new ObjectId(userId),
                        email: email || null,
                        createdAt: new Date(),
                        lastMessage: new Date(),
                        unreadCount: 0,
                    })
                conversationId = newConversation.insertedId
            }
        }

        // Insert the message
        const chatMessage = {
            message: message.trim(),
            from,
            email: email || null,
            userId: userId ? new ObjectId(userId) : null,
            conversationId: conversationId,
            isAdmin: isAdmin,
            time: new Date(),
            read: false,
        }

        const result = await db.collection("chats").insertOne(chatMessage)

        // Update conversation last message time and unread count
        if (conversationId) {
            await db.collection("conversations").updateOne(
                { _id: conversationId },
                {
                    $set: {
                        lastMessage: new Date(),
                        unreadCount: isAdmin ? 1 : 0, // Admin message increases unread count for user
                    },
                }
            )
        }

        return NextResponse.json({
            success: true,
            messageId: result.insertedId.toString(),
            conversationId: conversationId?.toString(),
        })
    } catch (error) {
        console.error("Error sending message:", error)
        return NextResponse.json(
            { error: "Failed to send message" },
            { status: 500 }
        )
    }
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get("userId")
        const email = searchParams.get("email")
        const isAdmin = searchParams.get("isAdmin") === "true"
        const conversationId = searchParams.get("conversationId")

        const db = await connectToDatabase()

        if (isAdmin) {
            if (conversationId) {
                // Get specific conversation messages for admin
                const conversation = await db
                    .collection("conversations")
                    .findOne({
                        _id: new ObjectId(conversationId),
                    })

                if (!conversation) {
                    return NextResponse.json(
                        { error: "Conversation not found" },
                        { status: 404 }
                    )
                }

                const messages = await db
                    .collection("chats")
                    .find({ conversationId: new ObjectId(conversationId) })
                    .sort({ time: 1 })
                    .toArray()

                // Mark messages as read for admin
                await db.collection("chats").updateMany(
                    {
                        conversationId: new ObjectId(conversationId),
                        isAdmin: false,
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

                return NextResponse.json(
                    messages.map((msg) => ({
                        id: msg._id.toString(),
                        message: msg.message,
                        from: msg.from,
                        time: msg.time,
                        isAdmin: msg.isAdmin,
                        read: msg.read,
                    }))
                )
            } else {
                // Admin view: get all conversations with latest messages
                const conversations = await db
                    .collection("conversations")
                    .aggregate([
                        {
                            $lookup: {
                                from: "chats",
                                localField: "_id",
                                foreignField: "conversationId",
                                as: "messages",
                            },
                        },
                        {
                            $lookup: {
                                from: "User",
                                localField: "userId",
                                foreignField: "_id",
                                as: "user",
                            },
                        },
                        {
                            $unwind: {
                                path: "$user",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $addFields: {
                                id: { $toString: "$_id" },
                                userId: { $toString: "$userId" },
                                user: {
                                    id: { $toString: "$user._id" },
                                    name: "$user.name",
                                    email: "$user.email",
                                },
                                lastMessage: {
                                    $arrayElemAt: ["$messages", -1],
                                },
                                messageCount: { $size: "$messages" },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                messages: 0,
                            },
                        },
                        {
                            $sort: { lastMessage: -1 },
                        },
                    ])
                    .toArray()

                return NextResponse.json(conversations)
            }
        } else {
            // User view: get their conversation
            let query = {}
            if (userId) {
                query.userId = new ObjectId(userId)
            } else if (email) {
                query.email = email
            } else {
                return NextResponse.json(
                    { error: "userId or email required" },
                    { status: 400 }
                )
            }

            // Get conversation for this user
            const conversation = await db
                .collection("conversations")
                .findOne(query)

            if (!conversation) {
                return NextResponse.json([])
            }

            // Return conversation data (not messages)
            return NextResponse.json([
                {
                    id: conversation._id.toString(),
                    userId: conversation.userId?.toString(),
                    email: conversation.email,
                    createdAt: conversation.createdAt,
                    lastMessage: conversation.lastMessage,
                    unreadCount: conversation.unreadCount,
                    adminInitiated: conversation.adminInitiated || false,
                },
            ])
        }
    } catch (error) {
        console.error("Error fetching messages:", error)
        return NextResponse.json(
            { error: "Failed to fetch messages" },
            { status: 500 }
        )
    }
}

export async function DELETE(req) {
    try {
        const body = await req.json()
        const { userId, email, conversationId } = body

        console.log("DELETE request received with:", {
            userId,
            email,
            conversationId,
        })

        const db = await connectToDatabase()

        if (conversationId) {
            // Delete specific conversation and all its messages
            await db
                .collection("conversations")
                .deleteOne({ _id: new ObjectId(conversationId) })
            await db
                .collection("chats")
                .deleteMany({ conversationId: new ObjectId(conversationId) })
        } else {
            // Validasi input
            if (!email && !userId) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Email, userId, atau conversationId diperlukan",
                    },
                    { status: 400 }
                )
            }

            // Buat query berdasarkan data yang tersedia
            let query = {}
            if (email && userId) {
                query = {
                    $or: [{ userId: new ObjectId(userId) }, { email: email }],
                }
            } else if (email) {
                query = { email: email }
            } else if (userId) {
                query = { userId: new ObjectId(userId) }
            }

            console.log("Delete query:", query)

            // Hapus semua chat yang terkait dengan user tersebut
            const result = await db.collection("chats").deleteMany(query)

            // Also delete conversations
            await db.collection("conversations").deleteMany(query)

            console.log("Delete result:", result)

            return NextResponse.json({
                success: true,
                deletedCount: result.deletedCount,
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting chat:", error)
        return NextResponse.json(
            { success: false, error: "Gagal menghapus chat" },
            { status: 500 }
        )
    }
}
