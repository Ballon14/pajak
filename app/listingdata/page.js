"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function ListingDataPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState({})

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, router])

    useEffect(() => {
        if (status === "authenticated") {
            fetchData()
        }
    }, [status])

    const fetchData = async () => {
        try {
            const response = await fetch(`/api/tax?userId=${session.user.id}`)
            if (response.ok) {
                const result = await response.json()
                setData(Array.isArray(result) ? result : [])
            } else {
                setError("Gagal mengambil data")
            }
        } catch (error) {
            setError("Terjadi kesalahan koneksi")
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (item) => {
        setEditingId(item.id)
        setEditForm({
            name: item.name,
            address: item.address,
            total: item.total,
            year: item.year,
            status: item.status,
        })
    }

    const handleSave = async () => {
        try {
            const updateData = {
                id: editingId,
                ...editForm,
                userId: session.user.id,
            }

            const response = await fetch("/api/tax", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
            })

            if (response.ok) {
                await fetchData()
                setEditingId(null)
                setEditForm({})
            } else {
                setError("Gagal menyimpan perubahan")
            }
        } catch (error) {
            setError("Terjadi kesalahan saat menyimpan")
        }
    }

    const handleDelete = async (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
            try {
                const response = await fetch(`/api/tax?id=${id}`, {
                    method: "DELETE",
                })

                if (response.ok) {
                    await fetchData()
                } else {
                    setError("Gagal menghapus data")
                }
            } catch (error) {
                setError("Terjadi kesalahan saat menghapus")
            }
        }
    }

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (status === "unauthenticated") {
        return null
    }

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Data Management
                    </h1>
                    <p className="text-slate-600">
                        Kelola dan edit data pajak yang telah diinput
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                {/* Data Table */}
                <div className="bg-white rounded-2xl shadow-premium border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-slate-600">Memuat data...</p>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-slate-400"
                                >
                                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                Belum ada data
                            </h3>
                            <p className="text-slate-500 mb-4">
                                Mulai dengan menambahkan data pajak baru
                            </p>
                            <button
                                onClick={() => router.push("/inputdata")}
                                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Tambah Data
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left py-4 px-6 font-semibold text-slate-700">
                                            Nama
                                        </th>
                                        <th className="text-left py-4 px-6 font-semibold text-slate-700">
                                            Alamat
                                        </th>
                                        <th className="text-left py-4 px-6 font-semibold text-slate-700">
                                            Tahun
                                        </th>
                                        <th className="text-left py-4 px-6 font-semibold text-slate-700">
                                            Jumlah Pajak
                                        </th>
                                        <th className="text-left py-4 px-6 font-semibold text-slate-700">
                                            Status
                                        </th>
                                        <th className="text-left py-4 px-6 font-semibold text-slate-700">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                                                index % 2 === 0
                                                    ? "bg-white"
                                                    : "bg-slate-25"
                                            }`}
                                        >
                                            <td className="py-4 px-6">
                                                {editingId === item.id ? (
                                                    <input
                                                        type="text"
                                                        value={editForm.name}
                                                        onChange={(e) =>
                                                            setEditForm({
                                                                ...editForm,
                                                                name: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <span className="font-medium text-slate-900">
                                                        {item.name}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                {editingId === item.id ? (
                                                    <input
                                                        type="text"
                                                        value={editForm.address}
                                                        onChange={(e) =>
                                                            setEditForm({
                                                                ...editForm,
                                                                address:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <span className="text-slate-700">
                                                        {item.address}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                {editingId === item.id ? (
                                                    <input
                                                        type="number"
                                                        value={editForm.year}
                                                        onChange={(e) =>
                                                            setEditForm({
                                                                ...editForm,
                                                                year: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        min="2000"
                                                        max="2030"
                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <span className="text-slate-700 font-semibold">
                                                        {item.year}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                {editingId === item.id ? (
                                                    <input
                                                        type="number"
                                                        value={editForm.total}
                                                        onChange={(e) =>
                                                            setEditForm({
                                                                ...editForm,
                                                                total: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        min="0"
                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <span className="text-slate-900 font-semibold">
                                                        Rp{" "}
                                                        {parseInt(
                                                            item.total
                                                        ).toLocaleString(
                                                            "id-ID"
                                                        )}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                {editingId === item.id ? (
                                                    <select
                                                        value={editForm.status}
                                                        onChange={(e) =>
                                                            setEditForm({
                                                                ...editForm,
                                                                status: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="belum_lunas">
                                                            Belum Lunas
                                                        </option>
                                                        <option value="proses">
                                                            Proses
                                                        </option>
                                                        <option value="lunas">
                                                            Lunas
                                                        </option>
                                                    </select>
                                                ) : (
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            item.status ===
                                                            "lunas"
                                                                ? "bg-green-100 text-green-800"
                                                                : item.status ===
                                                                  "proses"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                    >
                                                        {item.status === "lunas"
                                                            ? "Lunas"
                                                            : item.status ===
                                                              "proses"
                                                            ? "Proses"
                                                            : "Belum Lunas"}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                {editingId === item.id ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={handleSave}
                                                            className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                                        >
                                                            Simpan
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingId(
                                                                    null
                                                                )
                                                                setEditForm({})
                                                            }}
                                                            className="bg-gray-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                                                        >
                                                            Batal
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleEdit(item)
                                                            }
                                                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    item.id
                                                                )
                                                            }
                                                            className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
