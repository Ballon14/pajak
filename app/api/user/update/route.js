import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "../../auth/[...nextauth]/route"
import { connectToDatabase } from "../../../../lib/mongodb"

export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (!session.user?.id) {
            return NextResponse.json(
                { error: "User ID tidak ditemukan" },
                { status: 400 }
            )
        }

        const data = await req.json()
        const { name, email, image } = data

        // Validasi input
        if (!name || !email) {
            return NextResponse.json(
                { error: "Nama dan email harus diisi" },
                { status: 400 }
            )
        }

        console.log("Updating user:", {
            userId: session.user.id,
            name,
            email,
            image,
        })

        const db = await connectToDatabase()
        const usersCollection = db.collection("User")

        // Convert string ID back to ObjectId
        const { ObjectId } = require("mongodb")
        const objectId = new ObjectId(session.user.id)

        // Check if email is already used by another user
        const existingUser = await usersCollection.findOne({
            email,
            _id: { $ne: objectId },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "Email sudah digunakan" },
                { status: 400 }
            )
        }

        // Update user in database
        const result = await usersCollection.updateOne(
            { _id: objectId },
            {
                $set: {
                    name,
                    email,
                    image: image || null, // Handle empty image string
                },
            }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: "User tidak ditemukan" },
                { status: 404 }
            )
        }

        const updatedUser = {
            id: session.user.id,
            name,
            email,
            image: image || null,
        }

        console.log("User updated successfully:", updatedUser)

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error("Error updating user:", error)

        return NextResponse.json(
            { error: "Terjadi kesalahan saat memperbarui profil" },
            { status: 500 }
        )
    }
}
