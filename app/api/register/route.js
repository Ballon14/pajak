import bcrypt from "bcryptjs"
import { connectToDatabase } from "../../../lib/mongodb"

export async function POST(req) {
    try {
        const { name, email, password } = await req.json()
        if (!name || !email || !password) {
            return new Response(
                JSON.stringify({ error: "Semua field wajib diisi" }),
                { status: 400 }
            )
        }

        const db = await connectToDatabase()
        const usersCollection = db.collection("User")

        // Check if user already exists with better error handling
        const existing = await usersCollection.findOne({ email })
        if (existing) {
            return new Response(
                JSON.stringify({
                    error: "Email sudah terdaftar",
                    code: "EMAIL_EXISTS",
                }),
                { status: 400 }
            )
        }

        const hashed = await bcrypt.hash(password, 10)

        // Create user with MongoDB native driver
        const result = await usersCollection.insertOne({
            name,
            email,
            password: hashed,
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        })

        const user = {
            id: result.insertedId.toString(),
            name,
            email,
            message: "Registrasi berhasil! Silakan login.",
        }

        console.log("User registered successfully:", { email, id: user.id })

        return new Response(JSON.stringify(user), {
            status: 201,
            headers: {
                "Content-Type": "application/json",
            },
        })
    } catch (error) {
        console.error("Register error:", error)

        // Handle specific MongoDB errors
        if (error.code === 11000) {
            return new Response(
                JSON.stringify({
                    error: "Email sudah terdaftar",
                    code: "EMAIL_EXISTS",
                }),
                { status: 400 }
            )
        }

        return new Response(
            JSON.stringify({
                error: "Gagal mendaftar user. Silakan coba lagi.",
                code: "REGISTRATION_FAILED",
            }),
            { status: 500 }
        )
    }
}
