import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
    try {
        const db = await connectToDatabase()

        // Get all chats with user information
        const chats = await db
            .collection("chats")
            .aggregate([
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
                        user: {
                            id: { $toString: "$user._id" },
                            name: "$user.name",
                            email: "$user.email",
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        userId: 0,
                    },
                },
                {
                    $sort: { time: -1 },
                },
            ])
            .toArray()

        return NextResponse.json(chats)
    } catch (error) {
        console.error("Error fetching admin chats:", error)
        return NextResponse.json(
            { error: "Failed to fetch chats" },
            { status: 500 }
        )
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url)
        const chatId = searchParams.get("id")

        if (!chatId) {
            return NextResponse.json(
                { error: "Chat ID required" },
                { status: 400 }
            )
        }

        const db = await connectToDatabase()
        const { ObjectId } = await import("mongodb")

        const result = await db.collection("chats").deleteOne({
            _id: new ObjectId(chatId),
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
