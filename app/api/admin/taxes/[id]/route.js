import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req, { params }) {
    try {
        const { id } = params
        const db = await connectToDatabase()

        const tax = await db
            .collection("TaxRecord")
            .aggregate([
                {
                    $match: { _id: new ObjectId(id) },
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
            ])
            .toArray()

        if (tax.length === 0) {
            return NextResponse.json(
                { error: "Tax not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(tax[0])
    } catch (error) {
        console.error("Error fetching tax:", error)
        return NextResponse.json(
            { error: "Failed to fetch tax" },
            { status: 500 }
        )
    }
}

export async function PUT(req, { params }) {
    try {
        const { id } = params
        const body = await req.json()
        const { nama, alamat, tahun, jumlah, status } = body

        const db = await connectToDatabase()

        const result = await db.collection("TaxRecord").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    name: nama,
                    address: alamat,
                    year: Number(tahun),
                    total: Number(jumlah),
                    status: status,
                },
            }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: "Tax not found" },
                { status: 404 }
            )
        }

        // Return updated tax
        return GET(req, { params })
    } catch (error) {
        console.error("Error updating tax:", error)
        return NextResponse.json(
            { error: "Failed to update tax" },
            { status: 500 }
        )
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = params
        const db = await connectToDatabase()

        const result = await db.collection("TaxRecord").deleteOne({
            _id: new ObjectId(id),
        })

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: "Tax not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting tax:", error)
        return NextResponse.json(
            { error: "Failed to delete tax" },
            { status: 500 }
        )
    }
}
