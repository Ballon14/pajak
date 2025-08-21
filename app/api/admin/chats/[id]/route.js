import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(req, { params }) {
    try {
        const { id } = params

        if (!id) {
            return NextResponse.json(
                { error: "Chat ID required" },
                { status: 400 }
            )
        }

        const db = await connectToDatabase()

        const result = await db.collection("chats").deleteOne({
            _id: new ObjectId(id),
        })

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: "Chat not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting chat:", error)
        return NextResponse.json(
            { error: "Failed to delete chat" },
            { status: 500 }
        )
    }
}
