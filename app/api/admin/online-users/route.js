import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
    try {
        const db = await connectToDatabase()

        // Get all active users (simplified online users implementation)
        const onlineUsers = await db
            .collection("User")
            .aggregate([
                {
                    $match: {
                        isActive: true,
                    },
                },
                {
                    $addFields: {
                        id: { $toString: "$_id" },
                        online: true, // Simplified - all active users considered online
                        lastSeen: new Date(),
                    },
                },
                {
                    $project: {
                        _id: 0,
                        password: 0,
                    },
                },
                {
                    $sort: { name: 1 },
                },
            ])
            .toArray()

        return NextResponse.json(onlineUsers)
    } catch (error) {
        console.error("Error fetching online users:", error)
        return NextResponse.json(
            { error: "Failed to fetch online users" },
            { status: 500 }
        )
    }
}
