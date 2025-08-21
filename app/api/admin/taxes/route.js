import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
    try {
        const db = await connectToDatabase()

        // Aggregate to join with user data (same as tax route)
        const taxes = await db
            .collection("TaxRecord")
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
                        nama: "$name",
                        alamat: "$address",
                        tahun: "$year",
                        jumlah: "$total",
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
                        name: 0,
                        address: 0,
                        year: 0,
                        total: 0,
                    },
                },
                {
                    $sort: { tahun: -1 },
                },
            ])
            .toArray()

        return NextResponse.json(taxes)
    } catch (error) {
        console.error("Error fetching admin taxes:", error)
        return NextResponse.json(
            { error: "Failed to fetch taxes" },
            { status: 500 }
        )
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json(
                { error: "ID wajib diisi" },
                { status: 400 }
            )
        }

        const db = await connectToDatabase()
        await db.collection("TaxRecord").deleteOne({ _id: new ObjectId(id) })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting tax:", error)
        return NextResponse.json(
            { error: "Gagal menghapus data" },
            { status: 500 }
        )
    }
}
