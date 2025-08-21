"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import { parse } from "papaparse"

export default function ExportDataPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [exportLoading, setExportLoading] = useState(false)

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
            const response = await fetch("/api/data")
            if (response.ok) {
                const result = await response.json()
                setData(result.data || [])
            } else {
                setError("Gagal mengambil data")
            }
        } catch (error) {
            setError("Terjadi kesalahan koneksi")
        } finally {
            setLoading(false)
        }
    }

    const exportToExcel = () => {
        setExportLoading(true)
        try {
            const exportData = data.map((item, index) => ({
                No: index + 1,
                Nama: item.nama,
                Alamat: item.alamat,
                NPWP: item.npwp,
                "Jumlah Pajak": parseInt(item.jumlahPajak),
                "Tanggal Input": new Date(item.createdAt).toLocaleDateString(
                    "id-ID"
                ),
            }))

            const worksheet = XLSX.utils.json_to_sheet(exportData)
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pajak")

            // Auto-size columns
            const max_width = exportData.reduce(
                (w, r) => Math.max(w, r.Nama?.length || 0),
                10
            )
            worksheet["!cols"] = [
                { wch: 5 }, // No
                { wch: Math.max(max_width, 15) }, // Nama
                { wch: 30 }, // Alamat
                { wch: 20 }, // NPWP
                { wch: 15 }, // Jumlah Pajak
                { wch: 15 }, // Tanggal Input
            ]

            XLSX.writeFile(
                workbook,
                `data-pajak-${new Date().toISOString().split("T")[0]}.xlsx`
            )
        } catch (error) {
            setError("Gagal mengekspor ke Excel")
        } finally {
            setExportLoading(false)
        }
    }

    const exportToCSV = () => {
        setExportLoading(true)
        try {
            const exportData = data.map((item, index) => ({
                No: index + 1,
                Nama: item.nama,
                Alamat: item.alamat,
                NPWP: item.npwp,
                "Jumlah Pajak": parseInt(item.jumlahPajak),
                "Tanggal Input": new Date(item.createdAt).toLocaleDateString(
                    "id-ID"
                ),
            }))

            const csv = parse.unparse(exportData)
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
            const link = document.createElement("a")
            const url = URL.createObjectURL(blob)
            link.setAttribute("href", url)
            link.setAttribute(
                "download",
                `data-pajak-${new Date().toISOString().split("T")[0]}.csv`
            )
            link.style.visibility = "hidden"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            setError("Gagal mengekspor ke CSV")
        } finally {
            setExportLoading(false)
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
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Export Data
                    </h1>
                    <p className="text-slate-600">
                        Export data pajak ke berbagai format file
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">
                                    Total Data
                                </p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {data.length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-blue-600"
                                >
                                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">
                                    Total Pajak
                                </p>
                                <p className="text-2xl font-bold text-slate-900">
                                    Rp{" "}
                                    {data
                                        .reduce(
                                            (total, item) =>
                                                total +
                                                parseInt(item.jumlahPajak || 0),
                                            0
                                        )
                                        .toLocaleString("id-ID")}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-green-600"
                                >
                                    <line x1="12" y1="1" x2="12" y2="23" />
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">
                                    Format Export
                                </p>
                                <p className="text-2xl font-bold text-slate-900">
                                    2
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-purple-600"
                                >
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7,10 12,15 17,10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Export Options */}
                <div className="bg-white rounded-2xl shadow-premium border border-slate-200 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900">
                            Pilih Format Export
                        </h2>
                        <p className="text-slate-600 mt-1">
                            Pilih format file yang ingin Anda download
                        </p>
                    </div>

                    <div className="p-8">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-slate-600">Memuat data...</p>
                            </div>
                        ) : data.length === 0 ? (
                            <div className="text-center py-12">
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
                                    Tidak ada data yang dapat diekspor
                                </p>
                                <button
                                    onClick={() => router.push("/inputdata")}
                                    className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Tambah Data
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Excel Export */}
                                <div className="border border-slate-200 rounded-xl p-6 hover:border-slate-300 transition-colors">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                            <svg
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className="text-green-600"
                                            >
                                                <rect
                                                    x="3"
                                                    y="3"
                                                    width="18"
                                                    height="18"
                                                    rx="2"
                                                    ry="2"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                />
                                                <line
                                                    x1="9"
                                                    y1="9"
                                                    x2="15"
                                                    y2="15"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                />
                                                <line
                                                    x1="15"
                                                    y1="9"
                                                    x2="9"
                                                    y2="15"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">
                                                Microsoft Excel
                                            </h3>
                                            <p className="text-sm text-slate-600">
                                                Format .xlsx
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-4">
                                        Export data dalam format Excel yang
                                        dapat dibuka di Microsoft Excel, Google
                                        Sheets, atau aplikasi spreadsheet
                                        lainnya.
                                    </p>
                                    <button
                                        onClick={exportToExcel}
                                        disabled={exportLoading}
                                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7,10 12,15 17,10" />
                                            <line
                                                x1="12"
                                                y1="15"
                                                x2="12"
                                                y2="3"
                                            />
                                        </svg>
                                        {exportLoading
                                            ? "Mengekspor..."
                                            : "Download Excel"}
                                    </button>
                                </div>

                                {/* CSV Export */}
                                <div className="border border-slate-200 rounded-xl p-6 hover:border-slate-300 transition-colors">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <svg
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className="text-blue-600"
                                            >
                                                <rect
                                                    x="3"
                                                    y="3"
                                                    width="18"
                                                    height="18"
                                                    rx="2"
                                                    ry="2"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                />
                                                <path
                                                    d="M8 12h8M8 8h8M8 16h4"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">
                                                CSV File
                                            </h3>
                                            <p className="text-sm text-slate-600">
                                                Format .csv
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-4">
                                        Export data dalam format CSV (Comma
                                        Separated Values) yang kompatibel dengan
                                        hampir semua aplikasi database dan
                                        spreadsheet.
                                    </p>
                                    <button
                                        onClick={exportToCSV}
                                        disabled={exportLoading}
                                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7,10 12,15 17,10" />
                                            <line
                                                x1="12"
                                                y1="15"
                                                x2="12"
                                                y2="3"
                                            />
                                        </svg>
                                        {exportLoading
                                            ? "Mengekspor..."
                                            : "Download CSV"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Data Preview */}
                {data.length > 0 && (
                    <div className="mt-8 bg-white rounded-2xl shadow-premium border border-slate-200 overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900">
                                Preview Data
                            </h2>
                            <p className="text-slate-600 mt-1">
                                Tampilan data yang akan diekspor
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left py-4 px-6 font-semibold text-slate-700">
                                            No
                                        </th>
                                        <th className="text-left py-4 px-6 font-semibold text-slate-700">
                                            Nama
                                        </th>
                                        <th className="text-left py-4 px-6 font-semibold text-slate-700">
                                            Alamat
                                        </th>
                                        <th className="text-left py-4 px-6 font-semibold text-slate-700">
                                            NPWP
                                        </th>
                                        <th className="text-left py-4 px-6 font-semibold text-slate-700">
                                            Jumlah Pajak
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.slice(0, 5).map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="py-4 px-6 text-slate-700">
                                                {index + 1}
                                            </td>
                                            <td className="py-4 px-6 font-medium text-slate-900">
                                                {item.nama}
                                            </td>
                                            <td className="py-4 px-6 text-slate-700">
                                                {item.alamat}
                                            </td>
                                            <td className="py-4 px-6 text-slate-700 font-mono">
                                                {item.npwp}
                                            </td>
                                            <td className="py-4 px-6 text-slate-900 font-semibold">
                                                Rp{" "}
                                                {parseInt(
                                                    item.jumlahPajak
                                                ).toLocaleString("id-ID")}
                                            </td>
                                        </tr>
                                    ))}
                                    {data.length > 5 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="py-4 px-6 text-center text-slate-500 text-sm"
                                            >
                                                ... dan {data.length - 5} data
                                                lainnya
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
