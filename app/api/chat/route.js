import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(req) {
    const body = await req.json()
    const { message, from, email, userId, broadcast } = body
    const db = await connectToDatabase()
    if (broadcast) {
        await db.collection("Broadcast").insertOne({
            message,
            from,
            time: new Date(),
        })
        return NextResponse.json({ success: true, broadcast: true })
    }
    await db.collection("chats").insertOne({
        message,
        from,
        email: email || null,
        userId: userId || null,
        time: new Date(),
    })
    return NextResponse.json({ success: true })
}

export async function GET() {
    const db = await connectToDatabase()
    const chats = await db
        .collection("chats")
        .find({})
        .sort({ time: 1 })
        .toArray()
    return NextResponse.json(chats)
}

export async function DELETE(req) {
    try {
        const body = await req.json()
        const { userId, email } = body

        console.log("DELETE request received with:", { userId, email })

        // Validasi input
        if (!email && !userId) {
            return NextResponse.json(
                { success: false, error: "Email atau userId diperlukan" },
                { status: 400 }
            )
        }

        const db = await connectToDatabase()

        // Buat query berdasarkan data yang tersedia
        let query = {}
        if (email && userId) {
            query = {
                $or: [{ userId: userId }, { email: email }],
            }
        } else if (email) {
            query = { email: email }
        } else if (userId) {
            query = { userId: userId }
        }

        console.log("Delete query:", query)

        // Hapus semua chat yang terkait dengan user tersebut
        const result = await db.collection("chats").deleteMany(query)

        console.log("Delete result:", result)

        return NextResponse.json({
            success: true,
            deletedCount: result.deletedCount,
        })
    } catch (error) {
        console.error("Error deleting chat:", error)
        return NextResponse.json(
            { success: false, error: "Gagal menghapus chat" },
            { status: 500 }
        )
    }
}
