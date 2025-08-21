"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useNotification } from "../components/NotificationToast"

export default function InputDataPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const { addNotification } = useNotification()
    const [form, setForm] = useState({
        name: "",
        address: "",
        total: "",
        year: new Date().getFullYear(),
        status: "belum_lunas",
    })
    const [loading, setLoading] = useState(false)

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (status === "unauthenticated") {
        router.push("/login")
        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Validasi form
            if (!form.name.trim()) {
                addNotification("Nama tidak boleh kosong", "error")
                return
            }
            if (!form.address.trim()) {
                addNotification("Alamat tidak boleh kosong", "error")
                return
            }
            if (!form.total || form.total <= 0) {
                addNotification("Jumlah pajak harus lebih dari 0", "error")
                return
            }
            if (!form.year || form.year < 2000 || form.year > 2030) {
                addNotification("Tahun pajak harus antara 2000-2030", "error")
                return
            }

            const formData = {
                ...form,
                userId: session.user.id,
            }

            const response = await fetch("/api/tax", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                addNotification("Data berhasil disimpan!", "success")
                setForm({
                    name: "",
                    address: "",
                    total: "",
                    year: new Date().getFullYear(),
                    status: "belum_lunas",
                })
                // Redirect ke listing data setelah 1.5 detik
                setTimeout(() => {
                    router.push("/listingdata")
                }, 1500)
            } else {
                const error = await response.json()
                addNotification(error.error || "Gagal menyimpan data", "error")
            }
        } catch (error) {
            addNotification("Terjadi kesalahan koneksi", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleNumberInput = (e) => {
        const { name, value } = e.target
        // Hanya izinkan angka positif
        if (
            value === "" ||
            (parseFloat(value) >= 0 && /^\d*\.?\d*$/.test(value))
        ) {
            setForm((prev) => ({
                ...prev,
                [name]: value,
            }))
        }
    }

    return (
        <div className="p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Input Data Pajak
                    </h1>
                    <p className="text-slate-600">
                        Tambahkan data pajak baru ke dalam sistem
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-premium border border-slate-200 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nama */}
                            <div className="md:col-span-2">
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-semibold text-slate-700 mb-2"
                                >
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>

                            {/* Alamat */}
                            <div className="md:col-span-2">
                                <label
                                    htmlFor="address"
                                    className="block text-sm font-semibold text-slate-700 mb-2"
                                >
                                    Alamat
                                </label>
                                <textarea
                                    id="address"
                                    name="address"
                                    value={form.address}
                                    onChange={handleInputChange}
                                    required
                                    rows={3}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                    placeholder="Masukkan alamat lengkap"
                                />
                            </div>

                            {/* Tahun */}
                            <div>
                                <label
                                    htmlFor="year"
                                    className="block text-sm font-semibold text-slate-700 mb-2"
                                >
                                    Tahun Pajak
                                </label>
                                <input
                                    type="number"
                                    id="year"
                                    name="year"
                                    value={form.year}
                                    onChange={handleNumberInput}
                                    required
                                    min="2000"
                                    max="2030"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="2024"
                                />
                            </div>

                            {/* Jumlah Pajak */}
                            <div>
                                <label
                                    htmlFor="total"
                                    className="block text-sm font-semibold text-slate-700 mb-2"
                                >
                                    Jumlah Pajak
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                                        Rp
                                    </span>
                                    <input
                                        type="number"
                                        id="total"
                                        name="total"
                                        value={form.total}
                                        onChange={handleNumberInput}
                                        required
                                        min="0"
                                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label
                                    htmlFor="status"
                                    className="block text-sm font-semibold text-slate-700 mb-2"
                                >
                                    Status Pembayaran
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={form.status}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="belum_lunas">
                                        Belum Lunas
                                    </option>
                                    <option value="proses">Proses</option>
                                    <option value="lunas">Lunas</option>
                                </select>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() =>
                                    setForm({
                                        name: "",
                                        address: "",
                                        total: "",
                                        year: new Date().getFullYear(),
                                        status: "belum_lunas",
                                    })
                                }
                                className="sm:order-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200"
                                disabled={loading}
                            >
                                Reset Form
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="sm:order-2 flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                            <polyline points="17,21 17,13 7,13 7,21" />
                                            <polyline points="7,3 7,8 15,8" />
                                        </svg>
                                        Simpan Data
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Card */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4M12 8h.01" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-2">
                                Tips Pengisian Data
                            </h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>
                                    • Pastikan nama lengkap sesuai dengan
                                    identitas resmi
                                </li>
                                <li>• Alamat harus lengkap dan akurat</li>
                                <li>
                                    • Pilih tahun pajak yang sesuai (2000-2030)
                                </li>
                                <li>
                                    • Jumlah pajak dalam rupiah (tanpa titik
                                    atau koma)
                                </li>
                                <li>• Pilih status pembayaran yang sesuai</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
