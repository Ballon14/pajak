"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar, { Footer } from "../components/Navbar"
import { useNotification } from "../components/NotificationToast"

export default function InputDataPage() {
    const { data: session, status } = useSession()
    const { addNotification } = useNotification()
    const router = useRouter()
    const [form, setForm] = useState({
        name: "",
        address: "",
        total: "",
        year: "",
        status: "belum_lunas",
    })
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    if (status === "loading")
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <div className="flex-grow flex items-center justify-center" />
                <Footer />
            </div>
        )
    if (status === "unauthenticated") {
        if (typeof window !== "undefined") router.push("/login")
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <div className="flex-grow flex items-center justify-center" />
                <Footer />
            </div>
        )
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setSuccess("")

        // Validasi form
        if (!form.name.trim()) {
            addNotification("Nama wajib diisi", "error")
            return
        }
        if (!form.address.trim()) {
            addNotification("Alamat wajib diisi", "error")
            return
        }
        if (!form.total || parseFloat(form.total) <= 0) {
            addNotification("Total pajak harus lebih dari 0", "error")
            return
        }
        if (!form.year || parseInt(form.year) < 2000) {
            addNotification("Tahun pajak tidak valid", "error")
            return
        }

        try {
            const res = await fetch("/api/tax", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    userId: session.user.id,
                }),
            })
            const data = await res.json()

            if (!res.ok) {
                addNotification(
                    data.error || "Gagal menambah data pajak",
                    "error"
                )
                setError(data.error || "Gagal menambah data")
            } else {
                addNotification("Data pajak berhasil ditambahkan!", "success")
                setSuccess("Data pajak berhasil ditambah!")
                setForm({
                    name: "",
                    address: "",
                    total: "",
                    year: "",
                    status: "belum_lunas",
                })
            }
        } catch (error) {
            addNotification("Terjadi kesalahan jaringan", "error")
            setError("Gagal menambah data")
        }
    }

    console.log("userId:", session?.user?.id)

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow p-8 border border-blue-200">
                    <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
                        Input Data Pajak
                    </h2>
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4"
                    >
                        <input
                            type="text"
                            placeholder="Nama"
                            className="input text-black"
                            value={form.name}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, name: e.target.value }))
                            }
                            required
                        />
                        <input
                            type="text"
                            placeholder="Alamat"
                            className="input text-black"
                            value={form.address}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    address: e.target.value,
                                }))
                            }
                            required
                        />
                        <input
                            type="number"
                            placeholder="Total Pajak"
                            className="input text-black"
                            value={form.total}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    total: e.target.value,
                                }))
                            }
                            required
                            min="0"
                        />
                        <input
                            type="number"
                            placeholder="Tahun"
                            className="input text-black"
                            value={form.year}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, year: e.target.value }))
                            }
                            required
                            min="2000"
                            max="2100"
                        />
                        <select
                            className="input text-gray-500"
                            value={form.status}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    status: e.target.value,
                                }))
                            }
                            required
                        >
                            <option value="lunas">Lunas</option>
                            <option value="belum_lunas">Belum Lunas</option>
                            <option value="proses">Proses</option>
                        </select>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all duration-200"
                        >
                            Tambah Data
                        </button>
                    </form>
                    {error && (
                        <div className="mt-4 text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mt-4 text-green-600 text-sm text-center">
                            {success}
                        </div>
                    )}
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="mt-6 w-full bg-gray-200 text-blue-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                    >
                        Kembali ke Dashboard
                    </button>
                </div>
            </div>
            <Footer />
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
            `}</style>
        </div>
    )
}
