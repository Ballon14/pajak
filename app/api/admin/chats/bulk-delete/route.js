import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req) {
    try {
        const { chatIds } = await req.json()

        if (!chatIds || !Array.isArray(chatIds)) {
            return NextResponse.json(
                { error: "Chat IDs are required" },
                { status: 400 }
            )
        }

        const db = await connectToDatabase()
        const objectIds = chatIds.map((id) => new ObjectId(id))

        const result = await db.collection("chats").deleteMany({
            _id: { $in: objectIds },
        })

        return NextResponse.json({
            success: true,
            deletedCount: result.deletedCount,
        })
    } catch (error) {
        console.error("Error performing bulk chat delete:", error)
        return NextResponse.json(
            { error: "Failed to delete chats" },
            { status: 500 }
        )
    }
}
