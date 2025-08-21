import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req) {
    try {
        const { action, taxIds } = await req.json()

        if (!action || !taxIds || !Array.isArray(taxIds)) {
            return NextResponse.json(
                { error: "Action and tax IDs are required" },
                { status: 400 }
            )
        }

        const db = await connectToDatabase()
        const objectIds = taxIds.map((id) => new ObjectId(id))

        let result

        switch (action) {
            case "approve":
                result = await db.collection("TaxRecord").updateMany(
                    { _id: { $in: objectIds } },
                    {
                        $set: {
                            status: "approved",
                            updatedAt: new Date(),
                        },
                    }
                )
                break

            case "reject":
                result = await db.collection("TaxRecord").updateMany(
                    { _id: { $in: objectIds } },
                    {
                        $set: {
                            status: "rejected",
                            updatedAt: new Date(),
                        },
                    }
                )
                break

            case "delete":
                result = await db.collection("TaxRecord").deleteMany({
                    _id: { $in: objectIds },
                })
                break

            default:
                return NextResponse.json(
                    { error: "Invalid action" },
                    { status: 400 }
                )
        }

        return NextResponse.json({
            success: true,
            modifiedCount: result.modifiedCount || result.deletedCount,
        })
    } catch (error) {
        console.error("Error performing bulk operation:", error)
        return NextResponse.json(
            { error: "Failed to perform bulk operation" },
            { status: 500 }
        )
    }
}
