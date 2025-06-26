"use client"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import * as XLSX from "xlsx"
import Papa from "papaparse"
import { useRouter } from "next/navigation"
import Navbar, { Footer } from "../components/Navbar"

export default function ExportDataPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="flex-grow">
                <ExportDataMain />
            </div>
            <Footer />
        </div>
    )
}

function ExportDataMain() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [dropdown, setDropdown] = useState(false)

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login")
        if (status === "authenticated" && session?.user?.id) fetchData()
        // eslint-disable-next-line
    }, [status, session])

    async function fetchData() {
        setLoading(true)
        const res = await fetch(`/api/tax?userId=${session.user.id}`)
        const d = await res.json()
        setData(Array.isArray(d) ? d : [])
        setLoading(false)
    }

    function handleExport(type) {
        if (data.length === 0) return alert("Tidak ada data untuk diekspor.")
        const exportData = data.map((row) => ({
            Nama: row.name,
            Alamat: row.address,
            Tahun: row.year,
            Total: `Rp ${row.total.toLocaleString("id-ID")}`,
            Status:
                row.status === "lunas"
                    ? "Lunas"
                    : row.status === "belum_lunas"
                    ? "Belum Lunas"
                    : "Proses",
        }))

        try {
            if (type === "CSV") {
                const csv = Papa.unparse(exportData)
                const blob = new Blob([csv], {
                    type: "text/csv;charset=utf-8;",
                })
                const url = URL.createObjectURL(blob)
                const link = document.createElement("a")
                link.href = url
                link.setAttribute("download", "data-pajak.csv")
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            } else if (type === "Excel") {
                const ws = XLSX.utils.json_to_sheet(exportData)
                const wb = XLSX.utils.book_new()
                XLSX.utils.book_append_sheet(wb, ws, "Data Pajak")
                const wbout = XLSX.write(wb, {
                    bookType: "xlsx",
                    type: "array",
                })
                const blob = new Blob([wbout], {
                    type: "application/octet-stream",
                })
                const url = URL.createObjectURL(blob)
                const link = document.createElement("a")
                link.href = url
                link.setAttribute("download", "data-pajak.xlsx")
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            }
        } catch (error) {
            console.error("Error saat ekspor:", error)
            alert("Terjadi kesalahan saat mengekspor data. Silakan coba lagi.")
        }
    }

    if (status === "loading" || loading)
        return (
            <div className="flex justify-center items-center py-16 min-h-[60vh]">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-blue-600 font-semibold">
                        Memuat data...
                    </span>
                </div>
            </div>
        )

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Ekspor Data Pajak
                        </h1>
                        <p className="text-gray-600">
                            Ekspor data pajak ke format CSV atau Excel dengan
                            sekali klik.
                        </p>
                    </div>

                    <div className="relative">
                        <button
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
                            onClick={() => setDropdown((d) => !d)}
                            type="button"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                                />
                            </svg>
                            Ekspor Data
                        </button>

                        {dropdown && (
                            <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 w-48 py-1 z-50">
                                <button
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm font-medium flex items-center gap-2"
                                    onClick={() => {
                                        setDropdown(false)
                                        handleExport("CSV")
                                    }}
                                >
                                    <svg
                                        className="w-4 h-4 text-blue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M8 16h8M8 12h8m-8-4h8M4 6h16M4 10h16M4 14h16M4 18h16"
                                        />
                                    </svg>
                                    Ekspor ke CSV
                                </button>
                                <button
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm font-medium flex items-center gap-2"
                                    onClick={() => {
                                        setDropdown(false)
                                        handleExport("Excel")
                                    }}
                                >
                                    <svg
                                        className="w-4 h-4 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M16 8v8M8 8v8m-4 4h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                    Ekspor ke Excel
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {data.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                        <svg
                            className="w-16 h-16 text-gray-400 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                            />
                        </svg>
                        <p className="text-gray-500 text-lg">
                            Tidak ada data untuk diekspor.
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                            Silakan tambahkan data pajak terlebih dahulu.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-y border-gray-200">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Nama
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Alamat
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Tahun
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {row.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {row.address}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {row.year}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            Rp{" "}
                                            {row.total.toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${
                                                    row.status === "lunas"
                                                        ? "bg-green-100 text-green-800"
                                                        : row.status ===
                                                          "belum_lunas"
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                }`}
                                            >
                                                {row.status === "lunas"
                                                    ? "Lunas"
                                                    : row.status ===
                                                      "belum_lunas"
                                                    ? "Belum Lunas"
                                                    : "Proses"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

// Tambahkan animasi slideIn
if (typeof window !== "undefined") {
    const style = document.createElement("style")
    style.innerHTML = `@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } .animate-slideIn { animation: slideIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }`
    if (!document.getElementById("slideInAnim")) {
        style.id = "slideInAnim"
        document.head.appendChild(style)
    }
}
