"use client"
import { useSession, signIn } from "next-auth/react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Navbar, { Footer } from "../../components/Navbar"

export default function ProfilePage() {
    const { data: session, status, update } = useSession()
    const router = useRouter()
    const [form, setForm] = useState({
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        image: session?.user?.image || "",
    })
    const [avatar, setAvatar] = useState(null)
    const [preview, setPreview] = useState(form.image || "")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [pwLoading, setPwLoading] = useState(false)
    const [pwError, setPwError] = useState("")
    const [pwSuccess, setPwSuccess] = useState("")
    const fileInputRef = useRef()

    const avatarOptions = Array.from(
        { length: 10 },
        (_, i) => `/avatar/avatar${i + 1}.svg`
    )

    if (status === "loading") {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-blue-700 font-bold text-lg">
                        Memuat data...
                    </div>
                </div>
                <Footer />
            </div>
        )
    }
    if (status === "unauthenticated") {
        if (typeof window !== "undefined") router.push("/login")
        return null
    }

    const handleChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setAvatar(file)
        setPreview(URL.createObjectURL(file))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setSuccess("")
        setLoading(true)
        if (newPassword || confirmPassword) {
            if (newPassword.length < 6) {
                setError("Password minimal 6 karakter")
                setLoading(false)
                return
            }
            if (newPassword !== confirmPassword) {
                setError("Konfirmasi password tidak cocok")
                setLoading(false)
                return
            }
        }
        let imageUrl = form.image
        // Upload avatar jika ada file baru
        if (avatar) {
            const data = new FormData()
            data.append("file", avatar)
            const res = await fetch("/api/upload-avatar", {
                method: "POST",
                body: data,
            })
            const result = await res.json()
            if (!res.ok) {
                setError(result.error || "Gagal upload avatar")
                setLoading(false)
                return
            }
            imageUrl = result.url
        }
        // Update profile
        const res = await fetch("/api/user/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...form,
                image: imageUrl,
                password: newPassword || undefined,
            }),
        })
        const result = await res.json()
        if (!res.ok) {
            setError(result.error || "Gagal update profile")
            setLoading(false)
            return
        }
        setSuccess("Profile berhasil diperbarui!")
        setLoading(false)
        setForm((f) => ({ ...f, image: imageUrl }))
        setEditMode(false)
        update({ user: { ...form, image: imageUrl } })
    }

    async function handlePasswordChange(e) {
        e.preventDefault()
        setPwError("")
        setPwSuccess("")
        setPwLoading(true)
        if (!newPassword || !confirmPassword) {
            setPwError("Password baru dan konfirmasi wajib diisi")
            setPwLoading(false)
            return
        }
        if (newPassword.length < 6) {
            setPwError("Password minimal 6 karakter")
            setPwLoading(false)
            return
        }
        if (newPassword !== confirmPassword) {
            setPwError("Konfirmasi password tidak cocok")
            setPwLoading(false)
            return
        }
        // Kirim ke endpoint khusus ganti password
        const res = await fetch("/api/user/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: newPassword }),
        })
        const result = await res.json()
        if (!res.ok) {
            setPwError(result.error || "Gagal ganti password")
            setPwLoading(false)
            return
        }
        setPwSuccess("Password berhasil diganti!")
        setPwLoading(false)
        setNewPassword("")
        setConfirmPassword("")
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow p-8 border border-blue-200">
                    <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
                        Profile
                    </h2>
                    {!editMode ? (
                        <div className="flex flex-col items-center gap-4 p-6 rounded-xl border border-blue-100 shadow bg-white">
                            <div className="text-lg font-semibold text-gray-500 mb-1">
                                Avatar
                            </div>
                            <div className="relative mb-2">
                                <img
                                    src={form.image || "/window.svg"}
                                    alt="Avatar"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 shadow"
                                />
                                {!form.image && (
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full mt-1">
                                        Belum upload avatar
                                    </span>
                                )}
                            </div>
                            <div className="w-full flex flex-col items-center gap-2">
                                <div className="text-xs text-gray-400 uppercase tracking-wider">
                                    Nama
                                </div>
                                <div className="text-lg font-bold text-blue-700">
                                    {form.name}
                                </div>
                            </div>
                            <div className="w-full flex flex-col items-center gap-2">
                                <div className="text-xs text-gray-400 uppercase tracking-wider">
                                    Email
                                </div>
                                <div className="text-base text-gray-700">
                                    {form.email}
                                </div>
                            </div>
                            <div className="w-full border-t border-gray-200 my-4"></div>
                            <button
                                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                                onClick={() => setEditMode(true)}
                            >
                                Edit Profile
                            </button>
                            <a
                                href="/forgot-password"
                                className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-center"
                            >
                                Reset Password
                            </a>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-5"
                        >
                            <div className="flex flex-col items-center gap-2 mb-2">
                                <div className="relative mb-4">
                                    <img
                                        src={preview || "/window.svg"}
                                        alt="Avatar"
                                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 shadow"
                                    />
                                </div>
                                <div className="grid grid-cols-5 gap-3 mb-3">
                                    {avatarOptions.map((url, idx) => (
                                        <button
                                            type="button"
                                            key={url}
                                            className={`rounded-full border-2 p-0.5 transition-all ${
                                                preview === url
                                                    ? "border-blue-600 ring-2 ring-blue-200"
                                                    : "border-transparent"
                                            }`}
                                            onClick={() => {
                                                setPreview(url)
                                                setAvatar(null)
                                                setForm((f) => ({
                                                    ...f,
                                                    image: url,
                                                }))
                                            }}
                                            aria-label={`Pilih avatar ${
                                                idx + 1
                                            }`}
                                        >
                                            <img
                                                src={url}
                                                alt={`Avatar ${idx + 1}`}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                                <span className="text-xs text-gray-400 mb-2">
                                    Pilih salah satu avatar di bawah.
                                </span>
                            </div>
                            <label className="font-semibold text-gray-700 flex flex-col gap-2">
                                Nama
                                <input
                                    className="input bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-base h-11 px-3 transition-all duration-200 shadow-sm"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nama lengkap"
                                />
                            </label>
                            <label className="font-semibold text-gray-700 flex flex-col gap-2">
                                Email
                                <input
                                    className="input bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-base h-11 px-3 transition-all duration-200 shadow-sm"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Email"
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
                            <div className="flex gap-2 mt-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Menyimpan..."
                                        : "Simpan Profile"}
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                                    onClick={() => {
                                        setEditMode(false)
                                        setForm({
                                            name: session?.user?.name || "",
                                            email: session?.user?.email || "",
                                            image: session?.user?.image || "",
                                        })
                                        setPreview(session?.user?.image || "")
                                        setAvatar(null)
                                        setError("")
                                        setSuccess("")
                                    }}
                                    disabled={loading}
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    )
}
