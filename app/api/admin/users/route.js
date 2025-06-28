import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

export async function GET() {
    const db = await connectToDatabase()
    const users = await db.collection("User").find({}).toArray()
    return NextResponse.json({ success: true, users })
}

export async function POST(req) {
    const { email, name, role } = await req.json()
    if (!email || !name)
        return NextResponse.json(
            { error: "Email dan nama wajib diisi" },
            { status: 400 }
        )
    const db = await connectToDatabase()
    const result = await db
        .collection("User")
        .insertOne({ email, name, role: role === "admin" ? "admin" : "user" })
    return NextResponse.json({ success: true, insertedId: result.insertedId })
}

export async function PUT(req) {
    const { _id, email, name, role, password, isActive } = await req.json()
    if (!_id)
        return NextResponse.json({ error: "_id wajib diisi" }, { status: 400 })
    const db = await connectToDatabase()
    const updateFields = {
        email,
        name,
        role: role === "admin" ? "admin" : "user",
    }
    if (typeof isActive === "boolean") updateFields.isActive = isActive
    if (password) {
        updateFields.password = await bcrypt.hash(password, 10)
    }
    await db
        .collection("User")
        .updateOne({ _id: new ObjectId(_id) }, { $set: updateFields })
    return NextResponse.json({ success: true })
}

export async function DELETE(req) {
    const { _id } = await req.json()
    if (!_id)
        return NextResponse.json({ error: "_id wajib diisi" }, { status: 400 })
    const db = await connectToDatabase()
    await db.collection("User").deleteOne({ _id: new ObjectId(_id) })
    return NextResponse.json({ success: true })
}
