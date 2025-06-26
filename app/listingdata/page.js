"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar, { Footer } from "../components/Navbar"

const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "lunas", label: "Lunas" },
    { value: "belum_lunas", label: "Belum Lunas" },
    { value: "proses", label: "Proses" },
]

function getYearOptions(taxes) {
    const years = Array.from(new Set(taxes.map((t) => t.year))).sort(
        (a, b) => b - a
    )
    return [
        { value: "", label: "Semua Tahun" },
        ...years.map((y) => ({ value: y, label: y })),
    ]
}

export default function ListingDataPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [taxes, setTaxes] = useState([])
    const [loading, setLoading] = useState(false)
    const [pendingSearch, setPendingSearch] = useState("")
    const [pendingFilterStatus, setPendingFilterStatus] = useState("")
    const [pendingFilterYear, setPendingFilterYear] = useState("")
    const [search, setSearch] = useState("")
    const [filterStatus, setFilterStatus] = useState("")
    const [filterYear, setFilterYear] = useState("")
    const [page, setPage] = useState(1)
    const [modal, setModal] = useState({ type: null, data: null })
    const pageSize = 10

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login")
        if (status === "authenticated" && session?.user?.id) fetchTaxes()
        // eslint-disable-next-line
    }, [status, session])

    async function fetchTaxes() {
        setLoading(true)
        const res = await fetch(`/api/tax?userId=${session.user.id}`)
        const data = await res.json()
        setTaxes(Array.isArray(data) ? data : [])
        setLoading(false)
    }

    async function handleDelete(id) {
        if (!confirm("Yakin ingin menghapus data ini?")) return
        setLoading(true)
        await fetch(`/api/tax?id=${id}`, { method: "DELETE" })
        await fetchTaxes()
        setLoading(false)
    }

    // Filter & search
    const filtered = taxes.filter((t) => {
        const matchStatus = filterStatus ? t.status === filterStatus : true
        const matchYear = filterYear
            ? String(t.year) === String(filterYear)
            : true
        const matchSearch =
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.address.toLowerCase().includes(search.toLowerCase())
        return matchStatus && matchYear && matchSearch
    })

    // Pagination
    const totalPages = Math.ceil(filtered.length / pageSize)
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize)
    const yearOptions = getYearOptions(taxes)

    if (status === "loading" || loading)
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <div className="flex-grow flex justify-center items-center">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-blue-600 font-semibold">
                            Memuat data...
                        </span>
                    </div>
                </div>
                <Footer />
            </div>
        )

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="flex-grow p-4">
                <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-8 border mt-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div className="text-2xl font-bold text-blue-700">
                            Listing Data Pajak
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                            <input
                                type="text"
                                placeholder="Cari nama/alamat..."
                                className="input text-gray-800 border-gray-300 focus:border-blue-500"
                                value={pendingSearch}
                                onChange={(e) =>
                                    setPendingSearch(e.target.value)
                                }
                            />
                            <select
                                className="input text-gray-700 border-gray-300 focus:border-blue-500"
                                value={pendingFilterStatus}
                                onChange={(e) =>
                                    setPendingFilterStatus(e.target.value)
                                }
                            >
                                {statusOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="input text-gray-700 border-gray-300 focus:border-blue-500"
                                value={pendingFilterYear}
                                onChange={(e) =>
                                    setPendingFilterYear(e.target.value)
                                }
                            >
                                {yearOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-600 transition-all duration-200"
                                onClick={() => {
                                    setSearch(pendingSearch)
                                    setFilterStatus(pendingFilterStatus)
                                    setFilterYear(pendingFilterYear)
                                    setPage(1)
                                }}
                                type="button"
                            >
                                Filter
                            </button>
                        </div>
                    </div>
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center py-12 text-gray-400">
                            <svg
                                width="56"
                                height="56"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle cx="12" cy="12" r="10" fill="#f3f4f6" />
                                <path
                                    d="M8 12h8M12 8v8"
                                    stroke="#a1a1aa"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="mt-2">Tidak ada data ditemukan</div>
                        </div>
                    ) : (
                        <>
                            {/* Tabel untuk desktop */}
                            <div className="overflow-x-auto rounded-lg border border-gray-100 hidden md:block">
                                <table className="min-w-[700px] w-full text-sm align-middle">
                                    <thead>
                                        <tr className="bg-blue-50 text-blue-700">
                                            <th className="px-3 py-2 text-left whitespace-nowrap">
                                                Nama
                                            </th>
                                            <th className="px-3 py-2 text-left whitespace-nowrap">
                                                Alamat
                                            </th>
                                            <th className="px-3 py-2 text-center whitespace-nowrap">
                                                Tahun
                                            </th>
                                            <th className="px-3 py-2 text-right whitespace-nowrap">
                                                Total
                                            </th>
                                            <th className="px-3 py-2 text-center whitespace-nowrap">
                                                Status
                                            </th>
                                            <th className="px-3 py-2 text-center whitespace-nowrap">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paged.map((t, i) => (
                                            <tr
                                                key={i}
                                                className={`border-b last:border-0 hover:bg-blue-50 transition ${
                                                    i % 2 === 0
                                                        ? "bg-white"
                                                        : "bg-gray-50"
                                                }`}
                                            >
                                                <td className="px-3 py-2 font-semibold text-blue-900 whitespace-nowrap">
                                                    {t.name}
                                                </td>
                                                <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                                                    {t.address}
                                                </td>
                                                <td className="px-3 py-2 text-gray-700 text-center whitespace-nowrap">
                                                    {t.year}
                                                </td>
                                                <td className="px-3 py-2 text-right font-mono text-blue-700 whitespace-nowrap">
                                                    Rp{" "}
                                                    {Number(
                                                        t.total
                                                    ).toLocaleString("id-ID")}
                                                </td>
                                                <td className="px-3 py-2 text-center whitespace-nowrap">
                                                    {t.status === "lunas" && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                                            <svg
                                                                width="14"
                                                                height="14"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <circle
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                    fill="#dcfce7"
                                                                />
                                                                <path
                                                                    d="M8 12l2 2 4-4"
                                                                    stroke="#22c55e"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                />
                                                            </svg>
                                                            Lunas
                                                        </span>
                                                    )}
                                                    {t.status ===
                                                        "belum_lunas" && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                                                            <svg
                                                                width="14"
                                                                height="14"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <circle
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                    fill="#fee2e2"
                                                                />
                                                                <path
                                                                    d="M15 9l-6 6M9 9l6 6"
                                                                    stroke="#ef4444"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                />
                                                            </svg>
                                                            Belum Lunas
                                                        </span>
                                                    )}
                                                    {t.status === "proses" && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                                                            <svg
                                                                width="14"
                                                                height="14"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <circle
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                    fill="#fef9c3"
                                                                />
                                                                <path
                                                                    d="M12 8v4l2 2"
                                                                    stroke="#eab308"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                />
                                                            </svg>
                                                            Proses
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-center whitespace-nowrap flex flex-wrap gap-2 justify-center">
                                                    <button
                                                        className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200"
                                                        onClick={() =>
                                                            setModal({
                                                                type: "detail",
                                                                data: t,
                                                            })
                                                        }
                                                    >
                                                        Detail
                                                    </button>
                                                    <button
                                                        className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold hover:bg-yellow-200"
                                                        onClick={() =>
                                                            setModal({
                                                                type: "edit",
                                                                data: t,
                                                            })
                                                        }
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200"
                                                        onClick={() =>
                                                            handleDelete(t.id)
                                                        }
                                                    >
                                                        Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {/* Pagination */}
                                <div className="flex justify-between items-center mt-4 gap-2 flex-wrap">
                                    <div className="text-sm text-gray-500">
                                        Halaman {page} dari {totalPages}
                                    </div>
                                    <div className="flex gap-1 flex-wrap">
                                        <button
                                            className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-300"
                                            onClick={() => setPage(1)}
                                            disabled={page === 1}
                                        >
                                            Awal
                                        </button>
                                        <button
                                            className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-300"
                                            onClick={() =>
                                                setPage((p) =>
                                                    Math.max(1, p - 1)
                                                )
                                            }
                                            disabled={page === 1}
                                        >
                                            Sebelumnya
                                        </button>
                                        <button
                                            className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-300"
                                            onClick={() =>
                                                setPage((p) =>
                                                    Math.min(totalPages, p + 1)
                                                )
                                            }
                                            disabled={page === totalPages}
                                        >
                                            Berikutnya
                                        </button>
                                        <button
                                            className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-300"
                                            onClick={() => setPage(totalPages)}
                                            disabled={page === totalPages}
                                        >
                                            Akhir
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Card untuk mobile */}
                            <div className="flex flex-col gap-4 md:hidden">
                                {paged.map((t, i) => (
                                    <div
                                        key={i}
                                        className="rounded-xl border bg-white shadow p-4 flex flex-col gap-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="font-bold text-blue-700 text-lg">
                                                {t.name}
                                            </div>
                                            {t.status === "lunas" && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                                    <svg
                                                        width="14"
                                                        height="14"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            fill="#dcfce7"
                                                        />
                                                        <path
                                                            d="M8 12l2 2 4-4"
                                                            stroke="#22c55e"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                    Lunas
                                                </span>
                                            )}
                                            {t.status === "belum_lunas" && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                                                    <svg
                                                        width="14"
                                                        height="14"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            fill="#fee2e2"
                                                        />
                                                        <path
                                                            d="M15 9l-6 6M9 9l6 6"
                                                            stroke="#ef4444"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                    Belum Lunas
                                                </span>
                                            )}
                                            {t.status === "proses" && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                                                    <svg
                                                        width="14"
                                                        height="14"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            fill="#fef9c3"
                                                        />
                                                        <path
                                                            d="M12 8v4l2 2"
                                                            stroke="#eab308"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                    Proses
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-gray-700 text-sm">
                                            <span className="font-semibold">
                                                Alamat:
                                            </span>{" "}
                                            {t.address}
                                        </div>
                                        <div className="text-gray-700 text-sm">
                                            <span className="font-semibold">
                                                Tahun:
                                            </span>{" "}
                                            {t.year}
                                        </div>
                                        <div className="text-gray-700 text-sm">
                                            <span className="font-semibold">
                                                Total:
                                            </span>{" "}
                                            <span className="font-mono text-blue-700">
                                                Rp{" "}
                                                {Number(t.total).toLocaleString(
                                                    "id-ID"
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200"
                                                onClick={() =>
                                                    setModal({
                                                        type: "detail",
                                                        data: t,
                                                    })
                                                }
                                            >
                                                Detail
                                            </button>
                                            <button
                                                className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold hover:bg-yellow-200"
                                                onClick={() =>
                                                    setModal({
                                                        type: "edit",
                                                        data: t,
                                                    })
                                                }
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200"
                                                onClick={() =>
                                                    handleDelete(t.id)
                                                }
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {/* Pagination untuk mobile */}
                                <div className="flex justify-between items-center mt-4 gap-2 flex-wrap">
                                    <div className="text-sm text-gray-500">
                                        Halaman {page} dari {totalPages}
                                    </div>
                                    <div className="flex gap-1 flex-wrap">
                                        <button
                                            className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-300"
                                            onClick={() => setPage(1)}
                                            disabled={page === 1}
                                        >
                                            Awal
                                        </button>
                                        <button
                                            className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-300"
                                            onClick={() =>
                                                setPage((p) =>
                                                    Math.max(1, p - 1)
                                                )
                                            }
                                            disabled={page === 1}
                                        >
                                            Sebelumnya
                                        </button>
                                        <button
                                            className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-300"
                                            onClick={() =>
                                                setPage((p) =>
                                                    Math.min(totalPages, p + 1)
                                                )
                                            }
                                            disabled={page === totalPages}
                                        >
                                            Berikutnya
                                        </button>
                                        <button
                                            className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-300"
                                            onClick={() => setPage(totalPages)}
                                            disabled={page === totalPages}
                                        >
                                            Akhir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    {/* Modal Detail & Edit */}
                    {modal.type === "detail" && (
                        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
                            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative animate-fadeIn">
                                <button
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl font-bold"
                                    onClick={() =>
                                        setModal({ type: null, data: null })
                                    }
                                >
                                    ×
                                </button>
                                <div className="text-xl font-bold mb-4 text-blue-700">
                                    Detail Data Pajak
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div>
                                        <span className="font-semibold">
                                            Nama:
                                        </span>{" "}
                                        {modal.data.name}
                                    </div>
                                    <div>
                                        <span className="font-semibold">
                                            Alamat:
                                        </span>{" "}
                                        {modal.data.address}
                                    </div>
                                    <div>
                                        <span className="font-semibold">
                                            Tahun:
                                        </span>{" "}
                                        {modal.data.year}
                                    </div>
                                    <div>
                                        <span className="font-semibold">
                                            Total:
                                        </span>{" "}
                                        Rp{" "}
                                        {Number(
                                            modal.data.total
                                        ).toLocaleString("id-ID")}
                                    </div>
                                    <div>
                                        <span className="font-semibold">
                                            Status:
                                        </span>{" "}
                                        {modal.data.status === "lunas"
                                            ? "Lunas"
                                            : modal.data.status ===
                                              "belum_lunas"
                                            ? "Belum Lunas"
                                            : "Proses"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {modal.type === "edit" && (
                        <EditModal
                            data={modal.data}
                            onClose={() => {
                                setModal({ type: null, data: null })
                                fetchTaxes()
                            }}
                        />
                    )}
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
                    animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
                }
            `}</style>
        </div>
    )
}

function EditModal({ data, onClose }) {
    const [form, setForm] = useState({ ...data })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError("")
        const res = await fetch(`/api/tax?id=${data.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        })
        if (!res.ok) {
            const d = await res.json()
            setError(d.error || "Gagal update data")
            setLoading(false)
            return
        }
        setLoading(false)
        onClose()
    }
    return (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative animate-fadeIn flex flex-col gap-6"
            >
                <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl font-bold"
                    onClick={onClose}
                    type="button"
                >
                    ×
                </button>
                <div>
                    <div className="text-2xl font-bold mb-1 text-yellow-700">
                        Edit Data Pajak
                    </div>
                    <div className="text-gray-500 text-sm mb-2">
                        Perbarui data pajak sesuai kebutuhan Anda.
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <label className="font-semibold text-gray-700 flex flex-col gap-1">
                        Nama
                        <input
                            className="input bg-white border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                            value={form.name}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, name: e.target.value }))
                            }
                            required
                        />
                    </label>
                    <label className="font-semibold text-gray-700 flex flex-col gap-1">
                        Alamat
                        <input
                            className="input bg-white border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                            value={form.address}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    address: e.target.value,
                                }))
                            }
                            required
                        />
                    </label>
                    <label className="font-semibold text-gray-700 flex flex-col gap-1">
                        Total
                        <input
                            className="input bg-white border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                            type="number"
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
                    </label>
                    <label className="font-semibold text-gray-700 flex flex-col gap-1">
                        Tahun
                        <input
                            className="input bg-white border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                            type="number"
                            value={form.year}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, year: e.target.value }))
                            }
                            required
                            min="2000"
                            max="2100"
                        />
                    </label>
                    <label className="font-semibold text-gray-700 flex flex-col gap-1">
                        Status
                        <select
                            className="input bg-white border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
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
                    </label>
                </div>
                {error && (
                    <div className="text-red-500 text-sm text-center mt-2">
                        {error}
                    </div>
                )}
                <div className="flex gap-2 mt-2">
                    <button
                        type="button"
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold shadow hover:bg-gray-300 transition-all duration-200"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="flex-1 bg-yellow-500 text-white py-2 rounded-lg font-semibold shadow hover:bg-yellow-600 transition-all duration-200"
                        disabled={loading}
                    >
                        {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </div>
            </form>
        </div>
    )
}
