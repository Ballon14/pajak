"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar, { Footer } from "../components/Navbar"
import { useNotification } from "../components/NotificationToast"

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
    const { addNotification } = useNotification()
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
        try {
            const res = await fetch(`/api/tax?userId=${session.user.id}`)
            const data = await res.json()
            setTaxes(Array.isArray(data) ? data : [])

            // Notifikasi sukses saat data berhasil dimuat
            if (Array.isArray(data)) {
                addNotification(
                    `Berhasil memuat ${data.length} data pajak`,
                    "success"
                )
            }
        } catch (error) {
            addNotification("Gagal memuat data pajak", "error")
            console.error("Error fetching taxes:", error)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id) {
        if (!confirm("Yakin ingin menghapus data ini?")) return

        try {
            setLoading(true)
            const res = await fetch(`/api/tax?id=${id}`, { method: "DELETE" })

            if (res.ok) {
                addNotification("Data pajak berhasil dihapus!", "success")
                await fetchTaxes()
            } else {
                addNotification("Gagal menghapus data pajak", "error")
            }
        } catch (error) {
            addNotification("Terjadi kesalahan saat menghapus data", "error")
            console.error("Error deleting tax:", error)
        } finally {
            setLoading(false)
        }
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
            <div className="flex-grow p-2 sm:p-4">
                <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-4 sm:p-8 border mt-4 sm:mt-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div className="text-xl md:text-2xl font-bold text-blue-700">
                            Listing Data Pajak
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2 items-stretch">
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
                            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm mb-6">
                                <table className="min-w-[900px] w-full text-sm align-middle">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="bg-blue-100 text-blue-800">
                                            <th className="px-4 py-3 text-left font-bold whitespace-nowrap border-b border-blue-200">
                                                Nama UserId
                                            </th>
                                            <th className="px-4 py-3 text-left font-bold whitespace-nowrap border-b border-blue-200">
                                                Nama
                                            </th>
                                            <th className="px-4 py-3 text-left font-bold whitespace-nowrap border-b border-blue-200">
                                                Alamat
                                            </th>
                                            <th className="px-4 py-3 text-center font-bold whitespace-nowrap border-b border-blue-200">
                                                Tahun
                                            </th>
                                            <th className="px-4 py-3 text-center font-bold whitespace-nowrap border-b border-blue-200">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-right font-bold whitespace-nowrap border-b border-blue-200">
                                                Total
                                            </th>
                                            <th className="px-4 py-3 text-center font-bold whitespace-nowrap border-b border-blue-200">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paged.map((t, i) => (
                                            <tr
                                                key={i}
                                                className={`transition-colors duration-150 ${
                                                    i % 2 === 0
                                                        ? "bg-white"
                                                        : "bg-blue-50"
                                                } hover:bg-blue-100`}
                                            >
                                                <td className="px-4 py-3 font-semibold text-blue-900 whitespace-nowrap border-b border-gray-100 text-left">
                                                    {t.userid || "ADMIN"}
                                                </td>
                                                <td className="px-4 py-3 text-gray-900 whitespace-nowrap border-b border-gray-100 text-left">
                                                    {t.name}
                                                </td>
                                                <td className="px-4 py-3 text-gray-700 max-w-xs truncate border-b border-gray-100 text-left">
                                                    {t.address}
                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-700 border-b border-gray-100">
                                                    {t.year}
                                                </td>
                                                <td className="px-4 py-3 text-center border-b border-gray-100">
                                                    {t.status === "lunas" && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                                            Lunas
                                                        </span>
                                                    )}
                                                    {t.status ===
                                                        "belum_lunas" && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                                                            Belum Lunas
                                                        </span>
                                                    )}
                                                    {t.status === "proses" && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                                                            Proses
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-blue-700 border-b border-gray-100">
                                                    Rp{" "}
                                                    {Number(
                                                        t.total
                                                    ).toLocaleString("id-ID")}
                                                </td>
                                                <td className="px-4 py-3 text-center border-b border-gray-100">
                                                    <div className="flex flex-nowrap gap-1 justify-center">
                                                        <button
                                                            className="p-2 rounded-lg hover:bg-blue-100 text-blue-700 transition-all duration-200 group relative"
                                                            onClick={() =>
                                                                setModal({
                                                                    type: "detail",
                                                                    data: t,
                                                                })
                                                            }
                                                            aria-label="Detail"
                                                            title="Detail"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                                stroke="currentColor"
                                                                className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M2.25 12C2.25 12 5.25 5.25 12 5.25c6.75 0 9.75 6.75 9.75 6.75s-3 6.75-9.75 6.75c-6.75 0-9.75-6.75-9.75-6.75z"
                                                                />
                                                                <circle
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="3"
                                                                />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            className="p-2 rounded-lg hover:bg-yellow-100 text-yellow-700 transition-all duration-200 group relative"
                                                            onClick={() =>
                                                                setModal({
                                                                    type: "edit",
                                                                    data: t,
                                                                })
                                                            }
                                                            aria-label="Edit"
                                                            title="Edit"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                                stroke="currentColor"
                                                                className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.789l-4.243.707.707-4.243L16.862 4.487z"
                                                                />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            className="p-2 rounded-lg hover:bg-red-100 text-red-700 transition-all duration-200 group relative"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    t.id
                                                                )
                                                            }
                                                            aria-label="Hapus"
                                                            title="Hapus"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                                stroke="currentColor"
                                                                className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M6 18L18 6M6 6l12 12"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Card layout untuk mobile dan tablet */}
                            <div className="lg:hidden space-y-4">
                                {paged.map((t, i) => (
                                    <div
                                        key={i}
                                        className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-blue-900 text-lg mb-1">
                                                    {t.name}
                                                </h3>
                                                <p className="text-gray-600 text-sm mb-2">
                                                    {t.address}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-gray-500 mb-1">
                                                    Tahun {t.year}
                                                </div>
                                                <div className="font-mono text-blue-700 font-semibold">
                                                    Rp{" "}
                                                    {Number(
                                                        t.total
                                                    ).toLocaleString("id-ID")}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                {t.status === "lunas" && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
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
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
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
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
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
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                className="flex-1 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all duration-200 flex items-center justify-center gap-2 group"
                                                onClick={() =>
                                                    setModal({
                                                        type: "detail",
                                                        data: t,
                                                    })
                                                }
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="w-4 h-4 group-hover:scale-110 transition-transform duration-200"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M2.25 12C2.25 12 5.25 5.25 12 5.25c6.75 0 9.75 6.75 9.75 6.75s-3 6.75-9.75 6.75c-6.75 0-9.75-6.75-9.75-6.75z"
                                                    />
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="3"
                                                    />
                                                </svg>
                                                <span className="text-sm font-semibold">
                                                    Detail
                                                </span>
                                            </button>
                                            <button
                                                className="flex-1 px-3 py-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-all duration-200 flex items-center justify-center gap-2 group"
                                                onClick={() =>
                                                    setModal({
                                                        type: "edit",
                                                        data: t,
                                                    })
                                                }
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="w-4 h-4 group-hover:scale-110 transition-transform duration-200"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.789l-4.243.707.707-4.243L16.862 4.487z"
                                                    />
                                                </svg>
                                                <span className="text-sm font-semibold">
                                                    Edit
                                                </span>
                                            </button>
                                            <button
                                                className="flex-1 px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-200 flex items-center justify-center gap-2 group"
                                                onClick={() =>
                                                    handleDelete(t.id)
                                                }
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="w-4 h-4 group-hover:scale-110 transition-transform duration-200"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                                <span className="text-sm font-semibold">
                                                    Hapus
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                                <div className="text-sm text-gray-500 text-center sm:text-left">
                                    Halaman {page} dari {totalPages} (
                                    {filtered.length} data)
                                </div>
                                <div className="flex gap-2 flex-wrap justify-center">
                                    <button
                                        className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => setPage(1)}
                                        disabled={page === 1}
                                    >
                                        Awal
                                    </button>
                                    <button
                                        className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() =>
                                            setPage((p) => Math.max(1, p - 1))
                                        }
                                        disabled={page === 1}
                                    >
                                        Sebelumnya
                                    </button>
                                    <button
                                        className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() =>
                                            setPage((p) =>
                                                Math.min(totalPages, p + 1)
                                            )
                                        }
                                        disabled={page === totalPages}
                                    >
                                        Berikutnya
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                    {/* Modal Detail & Edit */}
                    {modal.type === "detail" && (
                        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
                            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn border border-blue-100">
                                <button
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl font-bold"
                                    onClick={() =>
                                        setModal({ type: null, data: null })
                                    }
                                >
                                    ×
                                </button>
                                <div className="flex items-center gap-3 mb-4">
                                    <svg
                                        width="32"
                                        height="32"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            fill="#2563eb"
                                        />
                                        <path
                                            d="M12 6v6l4 2"
                                            stroke="#fff"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <div className="text-2xl font-bold text-blue-700">
                                        Detail Data Pajak
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4 mt-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-600 w-24">
                                            Nama
                                        </span>
                                        <span className="text-gray-900">
                                            {modal.data.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-600 w-24">
                                            Alamat
                                        </span>
                                        <span className="text-gray-900">
                                            {modal.data.address}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-600 w-24">
                                            Tahun
                                        </span>
                                        <span className="text-gray-900">
                                            {modal.data.year}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-600 w-24">
                                            Total
                                        </span>
                                        <span className="text-gray-900">
                                            Rp{" "}
                                            {Number(
                                                modal.data.total
                                            ).toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-600 w-24">
                                            Status
                                        </span>
                                        {modal.data.status === "lunas" && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                                                <svg
                                                    width="16"
                                                    height="16"
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
                                        {modal.data.status ===
                                            "belum_lunas" && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
                                                <svg
                                                    width="16"
                                                    height="16"
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
                                        {modal.data.status === "proses" && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold">
                                                <svg
                                                    width="16"
                                                    height="16"
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
                                                        d="M12 8v4h4"
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
                                </div>
                            </div>
                        </div>
                    )}
                    {modal.type === "edit" && (
                        <EditModal
                            data={modal.data}
                            onClose={() => {
                                setModal({ type: null, data: null })
                                addNotification(
                                    "Data pajak berhasil diperbarui!",
                                    "success"
                                )
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

        // Validasi form
        if (!form.name.trim()) {
            setError("Nama wajib diisi")
            setLoading(false)
            return
        }
        if (!form.address.trim()) {
            setError("Alamat wajib diisi")
            setLoading(false)
            return
        }
        if (!form.total || parseFloat(form.total) <= 0) {
            setError("Total pajak harus lebih dari 0")
            setLoading(false)
            return
        }
        if (!form.year || parseInt(form.year) < 2000) {
            setError("Tahun pajak tidak valid")
            setLoading(false)
            return
        }

        try {
            const res = await fetch(`/api/tax?id=${data.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })

            if (!res.ok) {
                const d = await res.json()
                setError(d.error || "Gagal update data")
            } else {
                // Notifikasi sukses akan ditampilkan di parent component
                onClose()
            }
        } catch (error) {
            setError("Terjadi kesalahan jaringan")
            console.error("Error updating tax:", error)
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn flex flex-col gap-6 border border-blue-100"
            >
                <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl font-bold"
                    onClick={onClose}
                    type="button"
                >
                    ×
                </button>
                <div className="flex items-center gap-3 mb-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#eab308" />
                        <path
                            d="M12 6v6l4 2"
                            stroke="#fff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <div className="text-2xl font-bold text-yellow-700">
                        Edit Data Pajak
                    </div>
                </div>
                <div className="text-gray-500 text-sm mb-2">
                    Perbarui data pajak sesuai kebutuhan Anda.
                </div>
                <div className="flex flex-col gap-5 mt-2">
                    <label className="font-semibold text-gray-700 flex flex-col gap-2">
                        Nama
                        <input
                            className="input bg-white border-gray-300 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 focus:bg-yellow-50 placeholder-gray-400 text-base md:text-lg h-11 md:h-12 px-3 md:px-4 transition-all duration-200 shadow-sm"
                            value={form.name}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, name: e.target.value }))
                            }
                            required
                            placeholder="Masukkan nama wajib pajak"
                            tabIndex={1}
                        />
                    </label>
                    <label className="font-semibold text-gray-700 flex flex-col gap-2">
                        Alamat
                        <input
                            className="input bg-white border-gray-300 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 focus:bg-yellow-50 placeholder-gray-400 text-base md:text-lg h-11 md:h-12 px-3 md:px-4 transition-all duration-200 shadow-sm"
                            value={form.address}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    address: e.target.value,
                                }))
                            }
                            required
                            placeholder="Masukkan alamat lengkap"
                            tabIndex={2}
                        />
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="font-semibold text-gray-700 flex flex-col gap-2">
                            Total
                            <input
                                className="input bg-white border-gray-300 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 focus:bg-yellow-50 placeholder-gray-400 text-base md:text-lg h-11 md:h-12 px-3 md:px-4 transition-all duration-200 shadow-sm"
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
                                placeholder="Nominal"
                                tabIndex={3}
                            />
                        </label>
                        <label className="font-semibold text-gray-700 flex flex-col gap-2">
                            Tahun
                            <input
                                className="input bg-white border-gray-300 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 focus:bg-yellow-50 placeholder-gray-400 text-base md:text-lg h-11 md:h-12 px-3 md:px-4 transition-all duration-200 shadow-sm"
                                type="number"
                                value={form.year}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        year: e.target.value,
                                    }))
                                }
                                required
                                min="2000"
                                max="2100"
                                placeholder="Tahun"
                                tabIndex={4}
                            />
                        </label>
                    </div>
                    <label className="font-semibold text-gray-700 flex flex-col gap-2">
                        Status
                        <select
                            className="input bg-white border-gray-300 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 focus:bg-yellow-50 text-base md:text-lg h-11 md:h-12 px-3 md:px-4 transition-all duration-200 shadow-sm"
                            value={form.status}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    status: e.target.value,
                                }))
                            }
                            required
                            tabIndex={5}
                        >
                            <option value="lunas">Lunas</option>
                            <option value="belum_lunas">Belum Lunas</option>
                            <option value="proses">Proses</option>
                        </select>
                        <div className="mt-2">
                            {form.status === "lunas" && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                                    <svg
                                        width="16"
                                        height="16"
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
                            {form.status === "belum_lunas" && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
                                    <svg
                                        width="16"
                                        height="16"
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
                            {form.status === "proses" && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold">
                                    <svg
                                        width="16"
                                        height="16"
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
                                            d="M12 8v4h4"
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
                    </label>
                </div>
                {error && (
                    <div className="text-red-500 text-sm text-center mt-2">
                        {error}
                    </div>
                )}
                <div className="flex gap-2 mt-2">
                    <button
                        type="submit"
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading && (
                            <svg
                                className="animate-spin mr-2"
                                width="20"
                                height="20"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="#fff"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="#fff"
                                    d="M4 12a8 8 0 018-8v8z"
                                />
                            </svg>
                        )}
                        Simpan
                    </button>
                    <button
                        type="button"
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Batal
                    </button>
                </div>
            </form>
        </div>
    )
}
