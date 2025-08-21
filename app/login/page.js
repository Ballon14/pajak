"use client"
import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
    const { data: session, status } = useSession()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [showContactAdmin, setShowContactAdmin] = useState(false)
    const [redirecting, setRedirecting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (session?.user?.role === "admin") {
            router.replace("/dashboard/admin")
        }
    }, [session, router])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setShowContactAdmin(false)
        setRedirecting(false)

        // Add loading state
        const submitButton = e.target.querySelector('button[type="submit"]')
        const originalText = submitButton.textContent
        submitButton.textContent = "Signing in..."
        submitButton.disabled = true

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (res.error) {
                if (res.error === "redirect-register") {
                    setError(
                        "Email belum terdaftar. Anda akan diarahkan ke halaman pendaftaran..."
                    )
                    setRedirecting(true)
                    setTimeout(() => {
                        router.push("/register")
                    }, 2000) // Reduced from 4s to 2s
                    return
                }
                if (res.error === "nonaktif") {
                    setError(
                        "Akun Anda nonaktif. Silakan hubungi admin atau kirim pesan ke admin."
                    )
                    setShowContactAdmin(true)
                    return
                }
                if (res.error === "wrong-credentials") {
                    setError("Email atau password salah.")
                    return
                }
                if (res.error.includes("timeout")) {
                    setError("Koneksi timeout. Silakan coba lagi.")
                    return
                }
                setError("Login gagal. Silakan coba lagi.")
            } else {
                // Immediate redirect without waiting
                router.replace("/dashboard")
            }
        } catch (error) {
            setError("Terjadi kesalahan koneksi. Silakan coba lagi.")
        } finally {
            // Reset button state
            submitButton.textContent = originalText
            submitButton.disabled = false
        }
    }

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (status === "authenticated") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">
                        Mengalihkan ke dashboard...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="white"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <path
                                d="M12 6v6l4 2"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-slate-600">
                        Sign in to access your tax management dashboard
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-semibold text-slate-700 mb-2"
                                >
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-semibold text-slate-700 mb-2"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                        className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line
                                                    x1="1"
                                                    y1="1"
                                                    x2="23"
                                                    y2="23"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            {redirecting && (
                                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
                                    Redirecting to registration...
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                            >
                                Sign In
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link
                                href="/forgot-password"
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                            >
                                Forgot your password?
                            </Link>
                        </div>

                        {showContactAdmin && (
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                <p className="text-yellow-800 text-sm text-center">
                                    Need help? Contact your administrator for
                                    account activation.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="px-8 py-6 bg-slate-50 border-t border-slate-200">
                        <p className="text-center text-sm text-slate-600">
                            Don't have an account?{" "}
                            <Link
                                href="/register"
                                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                            >
                                Sign up here
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-xs text-slate-500">
                        © 2024 PajakApp. Professional Tax Management System.
                    </p>
                </div>
            </div>
        </div>
    )
}
