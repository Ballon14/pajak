"use client"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar, { Footer } from "../components/Navbar"

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const router = useRouter()
    const params = useSearchParams()
    const token = params.get("token")

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setSuccess("")
        if (!password || password.length < 6) {
            setError("Password minimal 6 karakter")
            return
        }
        if (password !== confirm) {
            setError("Konfirmasi password tidak cocok")
            return
        }
        setLoading(true)
        const res = await fetch("/api/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
        })
        const result = await res.json()
        if (!res.ok) {
            setError(result.error || "Gagal reset password")
            setLoading(false)
            return
        }
        setSuccess(
            "Password berhasil direset! Silakan login dengan password baru."
        )
        setLoading(false)
        setTimeout(() => router.push("/login"), 2000)
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow p-8 border border-blue-200">
                    <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
                        Reset Password
                    </h2>
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-5"
                    >
                        <label className="font-semibold text-gray-700 flex flex-col gap-2">
                            Password Baru
                            <input
                                className="input bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-base h-11 px-3 transition-all duration-200 shadow-sm"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Password baru"
                                minLength={6}
                            />
                        </label>
                        <label className="font-semibold text-gray-700 flex flex-col gap-2">
                            Konfirmasi Password
                            <input
                                className="input bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-base h-11 px-3 transition-all duration-200 shadow-sm"
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                                placeholder="Ulangi password baru"
                                minLength={6}
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
                            {loading ? "Menyimpan..." : "Reset Password"}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    )
}
