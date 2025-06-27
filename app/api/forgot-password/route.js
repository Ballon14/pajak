import { connectToDatabase } from "../../../lib/mongodb"
import nodemailer from "nodemailer"

export async function POST(req) {
    try {
        const { email } = await req.json()
        if (!email) {
            return new Response(
                JSON.stringify({ error: "Email wajib diisi" }),
                { status: 400 }
            )
        }
        const db = await connectToDatabase()
        const usersCollection = db.collection("User")
        const user = await usersCollection.findOne({ email })
        if (!user) {
            return new Response(
                JSON.stringify({ error: "Email tidak terdaftar" }),
                { status: 404 }
            )
        }
        // Generate token
        const token =
            Math.random().toString(36).substr(2) + Date.now().toString(36)
        const expired = new Date(Date.now() + 1000 * 60 * 30) // 30 menit
        await usersCollection.updateOne(
            { _id: user._id },
            { $set: { resetToken: token, resetTokenExpired: expired } }
        )
        // Kirim email
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_SERVER,
            port: process.env.EMAIL_PORT,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        })
        const resetUrl = `${
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/reset-password?token=${token}`
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Reset Password PajakApp",
            html: `<p>Klik link berikut untuk reset password Anda:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Link berlaku 30 menit.</p>`,
        })
        return new Response(JSON.stringify({ success: true }), { status: 200 })
    } catch (error) {
        console.error("Forgot password error:", error)
        return new Response(
            JSON.stringify({ error: "Gagal mengirim email reset password" }),
            { status: 500 }
        )
    }
}
