import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req, { params }) {
    try {
        const { id } = params
        
        if (!id) {
            return NextResponse.json({ error: "Chat ID required" }, { status: 400 })
        }
        
        const db = await connectToDatabase()
        
        const result = await db.collection("chats").updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    read: true,
                    readAt: new Date()
                } 
            }
        )
        
        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 })
        }
        
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error marking chat as read:", error)
        return NextResponse.json({ error: "Failed to mark chat as read" }, { status: 500 })
    }
} 