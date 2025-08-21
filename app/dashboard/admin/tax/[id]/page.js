"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useNotification } from "@/app/components/NotificationToast"

export default function AdminTaxDetailPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const params = useParams()
    const { addNotification } = useNotification()
    const [tax, setTax] = useState(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [formData, setFormData] = useState({
        nama: "",
        alamat: "",
        tahun: "",
        jumlah: "",
        status: "",
    })

    useEffect(() => {
        if (
            status === "authenticated" &&
            session?.user?.role === "admin" &&
            params.id
        ) {
            fetchTaxDetail()
        }
    }, [status, session, params.id])

    const fetchTaxDetail = async () => {
        try {
            const response = await fetch(`/api/admin/taxes/${params.id}`)
            if (response.ok) {
                const data = await response.json()
                setTax(data)
                setFormData({
                    nama: data.nama || "",
                    alamat: data.alamat || "",
                    tahun: data.tahun || "",
                    jumlah: data.jumlah || "",
                    status: data.status || "pending",
                })
            } else {
                addNotification("Gagal memuat detail pajak", "error")
                router.push("/dashboard/admin/tax")
            }
        } catch (error) {
            console.error("Error fetching tax detail:", error)
            addNotification("Error memuat detail pajak", "error")
            router.push("/dashboard/admin/tax")
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault()

        try {
            const response = await fetch(`/api/admin/taxes/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                const updatedTax = await response.json()
                setTax(updatedTax)
                setEditing(false)
                addNotification("Data pajak berhasil diupdate", "success")
            } else {
                addNotification("Gagal mengupdate data pajak", "error")
            }
        } catch (error) {
            console.error("Error updating tax:", error)
            addNotification("Error mengupdate data pajak", "error")
        }
    }

    const handleStatusUpdate = async (newStatus) => {
        try {
            const response = await fetch(
                `/api/admin/taxes/${params.id}/status`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: newStatus }),
                }
            )

            if (response.ok) {
                setTax((prev) => ({ ...prev, status: newStatus }))
                setFormData((prev) => ({ ...prev, status: newStatus }))
                addNotification(
                    `Status berhasil diubah menjadi ${newStatus}`,
                    "success"
                )
            } else {
                addNotification("Gagal mengubah status", "error")
            }
        } catch (error) {
            console.error("Error updating status:", error)
            addNotification("Error mengubah status", "error")
        }
    }

    const handleDelete = async () => {
        if (!confirm("Apakah Anda yakin ingin menghapus data pajak ini?"))
            return

        try {
            const response = await fetch(`/api/admin/taxes/${params.id}`, {
                method: "DELETE",
            })

            if (response.ok) {
                addNotification("Data pajak berhasil dihapus", "success")
                router.push("/dashboard/admin/tax")
            } else {
                addNotification("Gagal menghapus data pajak", "error")
            }
        } catch (error) {
            console.error("Error deleting tax:", error)
            addNotification("Error menghapus data pajak", "error")
        }
    }

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (status !== "authenticated" || session?.user?.role !== "admin") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">
                        Access Denied
                    </h1>
                    <p className="text-red-500">
                        You don't have permission to access this page.
                    </p>
                </div>
            </div>
        )
    }

    if (!tax) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-600 mb-2">
                        Data Tidak Ditemukan
                    </h1>
                    <p className="text-slate-500 mb-4">
                        Data pajak yang Anda cari tidak ditemukan.
                    </p>
                    <button
                        onClick={() => router.push("/dashboard/admin/tax")}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        Kembali ke Daftar Pajak
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button
                            onClick={() => router.push("/dashboard/admin/tax")}
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            Kembali ke Daftar Pajak
                        </button>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                            Detail Data Pajak
                        </h1>
                        <p className="text-slate-600">
                            Lihat dan kelola detail data pajak
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {!editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                            >
                                Edit Data
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                        >
                            Hapus Data
                        </button>
                    </div>
                </div>

                {/* Status Quick Actions */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                        Status Actions
                    </h2>
                    <div className="flex gap-3">
                        {tax.status !== "approved" && (
                            <button
                                onClick={() => handleStatusUpdate("approved")}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                                Approve
                            </button>
                        )}
                        {tax.status !== "rejected" && (
                            <button
                                onClick={() => handleStatusUpdate("rejected")}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Reject
                            </button>
                        )}
                        {tax.status !== "pending" && (
                            <button
                                onClick={() => handleStatusUpdate("pending")}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                            >
                                Set Pending
                            </button>
                        )}
                    </div>
                </div>

                {/* Tax Details */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                        <h2 className="text-lg font-semibold text-slate-900">
                            {editing
                                ? "Edit Data Pajak"
                                : "Informasi Data Pajak"}
                        </h2>
                    </div>

                    {editing ? (
                        <form onSubmit={handleUpdate} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Nama Wajib Pajak
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nama}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                nama: e.target.value,
                                            }))
                                        }
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Tahun
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.tahun}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                tahun: e.target.value,
                                            }))
                                        }
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="2000"
                                        max="2100"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Alamat
                                    </label>
                                    <textarea
                                        value={formData.alamat}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                alamat: e.target.value,
                                            }))
                                        }
                                        rows="3"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Jumlah Pajak
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.jumlah}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                jumlah: e.target.value,
                                            }))
                                        }
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="0"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                status: e.target.value,
                                            }))
                                        }
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="approved">
                                            Approved
                                        </option>
                                        <option value="rejected">
                                            Rejected
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Simpan Perubahan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditing(false)
                                        setFormData({
                                            nama: tax.nama || "",
                                            alamat: tax.alamat || "",
                                            tahun: tax.tahun || "",
                                            jumlah: tax.jumlah || "",
                                            status: tax.status || "pending",
                                        })
                                    }}
                                    className="flex-1 bg-slate-300 text-slate-700 py-3 px-6 rounded-xl hover:bg-slate-400 transition-colors font-medium"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-sm font-medium text-slate-600 mb-2">
                                        Nama Wajib Pajak
                                    </h3>
                                    <p className="text-lg font-semibold text-slate-900">
                                        {tax.nama}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-slate-600 mb-2">
                                        Tahun
                                    </h3>
                                    <p className="text-lg font-semibold text-slate-900">
                                        {tax.tahun}
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <h3 className="text-sm font-medium text-slate-600 mb-2">
                                        Alamat
                                    </h3>
                                    <p className="text-lg text-slate-900">
                                        {tax.alamat}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-slate-600 mb-2">
                                        Jumlah Pajak
                                    </h3>
                                    <p className="text-lg font-semibold text-green-600">
                                        Rp{" "}
                                        {parseInt(
                                            tax.jumlah || 0
                                        ).toLocaleString("id-ID")}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-slate-600 mb-2">
                                        Status
                                    </h3>
                                    <span
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                            tax.status === "approved"
                                                ? "bg-green-100 text-green-700"
                                                : tax.status === "rejected"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-orange-100 text-orange-700"
                                        }`}
                                    >
                                        {tax.status || "pending"}
                                    </span>
                                </div>

                                {tax.user && (
                                    <div className="md:col-span-2">
                                        <h3 className="text-sm font-medium text-slate-600 mb-2">
                                            Pemilik Data
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                                                {tax.user.name?.[0] || "U"}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">
                                                    {tax.user.name}
                                                </p>
                                                <p className="text-sm text-slate-600">
                                                    {tax.user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="md:col-span-2">
                                    <h3 className="text-sm font-medium text-slate-600 mb-2">
                                        Tanggal Dibuat
                                    </h3>
                                    <p className="text-lg text-slate-900">
                                        {new Date(
                                            tax.createdAt
                                        ).toLocaleDateString("id-ID", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
