import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function GET() {
    try {
        const db = await connectToDatabase()

        const users = await db
            .collection("User")
            .aggregate([
                {
                    $addFields: {
                        id: { $toString: "$_id" },
                        status: {
                            $cond: {
                                if: "$isActive",
                                then: "aktif",
                                else: "nonaktif",
                            },
                        },
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

        return NextResponse.json(users)
    } catch (error) {
        console.error("Error fetching admin users:", error)
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        )
    }
}

export async function POST(req) {
    try {
        const { name, email, password, role = "user" } = await req.json()

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Name, email, and password are required" },
                { status: 400 }
            )
        }

        const db = await connectToDatabase()

        // Check if user already exists
        const existingUser = await db.collection("User").findOne({ email })
        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create new user
        const newUser = {
            name,
            email,
            password: hashedPassword,
            role,
            isActive: true,
            createdAt: new Date(),
        }

        const result = await db.collection("User").insertOne(newUser)

        // Return user without password
        const createdUser = {
            id: result.insertedId.toString(),
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            status: "aktif",
            createdAt: newUser.createdAt,
        }

        return NextResponse.json(createdUser, { status: 201 })
    } catch (error) {
        console.error("Error creating user:", error)
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        )
    }
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
