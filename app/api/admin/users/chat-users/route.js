import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
    try {
        const db = await connectToDatabase()
        
        // Get all active users that admin can chat with
        const users = await db.collection("User").aggregate([
            {
                $match: {
                    isActive: true,
                    role: { $ne: "admin" } // Exclude other admins
                }
            },
            {
                $addFields: {
                    id: { $toString: "$_id" },
                    hasConversation: false // Will be updated in next step
                }
            },
            {
                $project: {
                    _id: 0,
                    password: 0
                }
            },
            {
                $sort: { name: 1 }
            }
        ]).toArray()
        
        // Check which users already have conversations
        const conversations = await db.collection("conversations").find({}).toArray()
        const conversationUserIds = conversations.map(conv => conv.userId.toString())
        
        // Update hasConversation field
        const usersWithConversationStatus = users.map(user => ({
            ...user,
            hasConversation: conversationUserIds.includes(user.id)
        }))
        
        return NextResponse.json(usersWithConversationStatus)
    } catch (error) {
        console.error("Error fetching chat users:", error)
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }
} 