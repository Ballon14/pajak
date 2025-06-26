import { connectToDatabase } from "../../../lib/mongodb"

export async function POST(req) {
    try {
        const body = await req.json()
        console.log("DATA MASUK:", body)
        const { name, address, total, year, userId, status } = body
        if (!name || !address || !total || !year || !userId || !status) {
            return new Response(
                JSON.stringify({ error: "Semua field wajib diisi" }),
                { status: 400 }
            )
        }

        const db = await connectToDatabase()
        const taxRecordsCollection = db.collection("TaxRecord")

        const record = await taxRecordsCollection.insertOne({
            name,
            address,
            total: Number(total),
            year: Number(year),
            userId: userId,
            status,
        })

        const createdRecord = {
            id: record.insertedId.toString(),
            name,
            address,
            total: Number(total),
            year: Number(year),
            userId,
            status,
        }

        return new Response(JSON.stringify(createdRecord), { status: 201 })
    } catch (error) {
        console.error("Tax creation error:", error)
        return new Response(
            JSON.stringify({ error: "Gagal membuat record pajak" }),
            { status: 500 }
        )
    }
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get("userId")
        if (!userId) {
            return new Response(
                JSON.stringify({ error: "userId wajib diisi" }),
                {
                    status: 400,
                }
            )
        }

        const db = await connectToDatabase()
        const taxRecordsCollection = db.collection("TaxRecord")

        const records = await taxRecordsCollection
            .find({ userId: userId })
            .sort({ year: -1 })
            .toArray()

        // Convert ObjectId to string for frontend
        const formattedRecords = records.map((record) => ({
            ...record,
            id: record._id.toString(),
            _id: undefined,
        }))

        return new Response(JSON.stringify(formattedRecords), { status: 200 })
    } catch (error) {
        console.error("Tax fetch error:", error)
        return new Response(
            JSON.stringify({ error: "Gagal mengambil data pajak" }),
            { status: 500 }
        )
    }
}

export async function PUT(req) {
    try {
        const body = await req.json()
        const { id, name, address, total, year, userId, status } = body
        if (!id || !name || !address || !total || !year || !userId || !status) {
            return new Response(
                JSON.stringify({ error: "Semua field wajib diisi" }),
                { status: 400 }
            )
        }

        const db = await connectToDatabase()
        const taxRecordsCollection = db.collection("TaxRecord")

        // Convert string ID back to ObjectId
        const { ObjectId } = require("mongodb")
        const objectId = new ObjectId(id)

        const result = await taxRecordsCollection.updateOne(
            { _id: objectId },
            {
                $set: {
                    name,
                    address,
                    total: Number(total),
                    year: Number(year),
                    userId: userId,
                    status,
                },
            }
        )

        if (result.matchedCount === 0) {
            return new Response(
                JSON.stringify({ error: "Data tidak ditemukan" }),
                { status: 404 }
            )
        }

        const updatedRecord = {
            id,
            name,
            address,
            total: Number(total),
            year: Number(year),
            userId,
            status,
        }

        return new Response(JSON.stringify(updatedRecord), { status: 200 })
    } catch (error) {
        console.error("Tax update error:", error)
        return new Response(
            JSON.stringify({ error: "Gagal update data pajak" }),
            { status: 500 }
        )
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")
        if (!id) {
            return new Response(JSON.stringify({ error: "ID wajib diisi" }), {
                status: 400,
            })
        }

        const db = await connectToDatabase()
        const taxRecordsCollection = db.collection("TaxRecord")

        // Convert string ID back to ObjectId
        const { ObjectId } = require("mongodb")
        const objectId = new ObjectId(id)

        const result = await taxRecordsCollection.deleteOne({ _id: objectId })

        if (result.deletedCount === 0) {
            return new Response(
                JSON.stringify({ error: "Data tidak ditemukan" }),
                { status: 404 }
            )
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 })
    } catch (error) {
        console.error("Tax delete error:", error)
        return new Response(
            JSON.stringify({ error: "Gagal hapus data pajak" }),
            { status: 500 }
        )
    }
}
