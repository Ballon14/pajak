import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

export async function GET(req, { params }) {
    try {
        const { id } = params
        const db = await connectToDatabase()

        const user = await db
            .collection("User")
            .aggregate([
                {
                    $match: { _id: new ObjectId(id) },
                },
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
            ])
            .toArray()

        if (user.length === 0) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(user[0])
    } catch (error) {
        console.error("Error fetching user:", error)
        return NextResponse.json(
            { error: "Failed to fetch user" },
            { status: 500 }
        )
    }
}

export async function PUT(req, { params }) {
    try {
        const { id } = params
        const { name, email, role, password } = await req.json()

        const db = await connectToDatabase()

        const updateData = {}
        if (name) updateData.name = name
        if (email) updateData.email = email
        if (role) updateData.role = role
        if (password) {
            updateData.password = await bcrypt.hash(password, 12)
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: "No fields to update" },
                { status: 400 }
            )
        }

        // Check if email already exists (if updating email)
        if (email) {
            const existingUser = await db.collection("User").findOne({
                email,
                _id: { $ne: new ObjectId(id) },
            })
            if (existingUser) {
                return NextResponse.json(
                    { error: "Email already exists" },
                    { status: 400 }
                )
            }
        }

        const result = await db
            .collection("User")
            .updateOne({ _id: new ObjectId(id) }, { $set: updateData })

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // Return updated user
        return GET(req, { params })
    } catch (error) {
        console.error("Error updating user:", error)
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        )
    }
}

export async function PATCH(req, { params }) {
    try {
        const { id } = params
        const { status } = await req.json()

        if (!status || !["aktif", "nonaktif"].includes(status)) {
            return NextResponse.json(
                { error: "Invalid status" },
                { status: 400 }
            )
        }

        const db = await connectToDatabase()

        const result = await db.collection("User").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    isActive: status === "aktif",
                    updatedAt: new Date(),
                },
            }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error updating user status:", error)
        return NextResponse.json(
            { error: "Failed to update user status" },
            { status: 500 }
        )
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = params
        const db = await connectToDatabase()

        const result = await db.collection("User").deleteOne({
            _id: new ObjectId(id),
        })

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting user:", error)
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
        )
    }
}
