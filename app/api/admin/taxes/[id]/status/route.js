import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PATCH(req, { params }) {
    try {
        const { id } = params
        const { status } = await req.json()

        if (!status) {
            return NextResponse.json(
                { error: "Status is required" },
                { status: 400 }
            )
        }

        const db = await connectToDatabase()

        const result = await db.collection("TaxRecord").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status: status,
                    updatedAt: new Date(),
                },
            }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: "Tax not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error updating tax status:", error)
        return NextResponse.json(
            { error: "Failed to update tax status" },
            { status: 500 }
        )
    }
}
