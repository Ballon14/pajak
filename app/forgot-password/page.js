"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar, { Footer } from "../components/Navbar"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const router = useRouter()

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setSuccess("")
        setLoading(true)
        const res = await fetch("/api/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        })
        const result = await res.json()
        if (!res.ok) {
            setError(result.error || "Gagal mengirim email reset password")
            setLoading(false)
            return
        }
        setSuccess(
            "Link reset password telah dikirim ke email Anda. Silakan cek inbox/spam."
        )
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow p-8 border border-blue-200">
                    <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
                        Lupa Password
                    </h2>
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-5"
                    >
                        <label className="font-semibold text-gray-700 flex flex-col gap-2">
                            Email
                            <input
                                className="input bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-base h-11 px-3 transition-all duration-200 shadow-sm"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Masukkan email Anda"
                            />
                        </label>
                        {error && (
                            <div className="text-red-500 text-center text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="text-green-600 text-center text-sm">
                                {success}
                            </div>
                        )}
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? "Mengirim..." : "Kirim Link Reset"}
                        </button>
                        <Link
                            href="/login"
                            className="text-blue-600 text-center text-sm hover:underline mt-2"
                        >
                            Kembali ke Login
                        </Link>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    )
}
