import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(req) {
    const { message, from, email, userId } = await req.json()
    const db = await connectToDatabase()
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
