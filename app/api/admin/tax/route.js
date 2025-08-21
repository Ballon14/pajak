import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
    const db = await connectToDatabase()

    // Aggregate to join with user data
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
}

export async function POST(req) {
    const { userId, name, address, year, status, total } = await req.json()
    if (!userId || !name || !address || !year || !status || !total)
        return NextResponse.json(
            { error: "Field wajib diisi" },
            { status: 400 }
        )
    const db = await connectToDatabase()
    const result = await db.collection("TaxRecord").insertOne({
        userId,
        name,
        address,
        year: Number(year),
        status,
        total: Number(total),
    })
    return NextResponse.json({ success: true, insertedId: result.insertedId })
}

export async function PUT(req) {
    const { _id, userId, name, address, year, status, total } = await req.json()
    if (!_id)
        return NextResponse.json({ error: "_id wajib diisi" }, { status: 400 })
    const db = await connectToDatabase()
    await db.collection("TaxRecord").updateOne(
        { _id: new ObjectId(_id) },
        {
            $set: {
                userId,
                name,
                address,
                year: year ? Number(year) : undefined,
                status,
                total: total ? Number(total) : undefined,
            },
        }
    )
    return NextResponse.json({ success: true })
}

export async function DELETE(req) {
    const { _id } = await req.json()
    if (!_id)
        return NextResponse.json({ error: "_id wajib diisi" }, { status: 400 })
    const db = await connectToDatabase()
    await db.collection("TaxRecord").deleteOne({ _id: new ObjectId(_id) })
    return NextResponse.json({ success: true })
}
