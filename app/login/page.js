"use client"
import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const { data: session, status } = useSession()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [showContactAdmin, setShowContactAdmin] = useState(false)
    const [redirecting, setRedirecting] = useState(false)
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
                }, 4000)
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
                setError("Email atau password salah")
                return
            }
            setError(res.error)
        } else {
            router.push("/dashboard")
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
                <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center animate-fadeIn">
                    <div className="mb-6 flex flex-col items-center">
                        <div className="bg-blue-600 rounded-full p-3 mb-2 shadow-lg">
                            <svg
                                width="32"
                                height="32"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="#fff"
                                    d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm0 14.2a7.2 7.2 0 0 1-6-3.2c.03-2 4-3.1 6-3.1 2 0 5.97 1.1 6 3.1a7.2 7.2 0 0 1-6 3.2Z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-extrabold text-blue-700 mb-1 tracking-tight">
                            Login Pajak
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Masuk untuk mengelola rekap pajak tahunan Anda
                        </p>
                    </div>
                    <form
                        onSubmit={handleSubmit}
                        className="w-full flex flex-col gap-4"
                    >
                        {error && (
                            <div
                                className={`text-center text-sm mb-2 ${
                                    redirecting
                                        ? "text-blue-600"
                                        : "text-red-500"
                                }`}
                            >
                                {error}
                                {showContactAdmin && (
                                    <div className="mt-2">
                                        <a
                                            href="mailto:iqbaldev.site@gmail.com"
                                            className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 font-semibold text-xs mt-1"
                                        >
                                            Kirim Pesan ke Admin
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="Email"
                                className="input text-black"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Password"
                                className="input text-black"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all duration-200"
                        >
                            Login
                        </button>
                        <a
                            href="/forgot-password"
                            className="text-blue-600 text-center text-sm hover:underline mt-2"
                        >
                            Lupa Password?
                        </a>
                    </form>
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Belum punya akun?{" "}
                        <a
                            href="/register"
                            className="text-blue-600 hover:underline font-medium"
                        >
                            Daftar
                        </a>
                    </p>
                </div>
            </div>
            <style jsx>{`
                .input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    outline: none;
                    font-size: 1rem;
                    background: #f9fafb;
                    transition: border 0.2s;
                }
                .input:focus {
                    border-color: #2563eb;
                    background: #fff;
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.7s cubic-bezier(0.4, 0, 0.2, 1) both;
                }
            `}</style>
        </div>
    )
}
