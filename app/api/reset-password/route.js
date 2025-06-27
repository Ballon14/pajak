import { connectToDatabase } from "../../../lib/mongodb"
import bcrypt from "bcryptjs"

export async function POST(req) {
    try {
        const { token, password } = await req.json()
        if (!token || !password) {
            return new Response(
                JSON.stringify({ error: "Token dan password wajib diisi" }),
                { status: 400 }
            )
        }
        const db = await connectToDatabase()
        const usersCollection = db.collection("User")
        const user = await usersCollection.findOne({ resetToken: token })
        if (
            !user ||
            !user.resetTokenExpired ||
            new Date(user.resetTokenExpired) < new Date()
        ) {
            return new Response(
                JSON.stringify({
                    error: "Token tidak valid atau sudah expired",
                }),
                { status: 400 }
            )
        }
        const hashed = await bcrypt.hash(password, 10)
        await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: { password: hashed },
                $unset: { resetToken: "", resetTokenExpired: "" },
            }
        )
        return new Response(JSON.stringify({ success: true }), { status: 200 })
    } catch (error) {
        console.error("Reset password error:", error)
        return new Response(JSON.stringify({ error: "Gagal reset password" }), {
            status: 500,
        })
    }
}
