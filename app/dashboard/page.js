"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [stats, setStats] = useState({
        totalData: 0,
        totalPajak: 0,
        dataThisMonth: 0,
        recentData: [],
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, router])

    useEffect(() => {
        if (status === "authenticated") {
            // Add small delay to prioritize login completion
            const timer = setTimeout(() => {
                fetchDashboardData()
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [status])

    const fetchDashboardData = async () => {
        try {
            const response = await fetch("/api/dashboard", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (response.ok) {
                const data = await response.json()
                setStats(data)
            } else {
                console.error("Dashboard API error:", response.status)
                // Set default stats on error
                setStats({
                    totalData: 0,
                    totalPajak: 0,
                    dataThisMonth: 0,
                    recentData: [],
                })
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
            // Set default stats on error
            setStats({
                totalData: 0,
                totalPajak: 0,
                dataThisMonth: 0,
                recentData: [],
            })
        } finally {
            setLoading(false)
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
                        Welcome back, {session?.user?.name || "User"}!
                    </h1>
                    <p className="text-slate-600">
                        Here's what's happening with your tax data today.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">
                                    Total Data
                                </p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {loading ? "..." : stats.totalData}
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

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">
                                    Total Pajak
                                </p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {loading
                                        ? "..."
                                        : `Rp ${stats.totalPajak.toLocaleString(
                                              "id-ID"
                                          )}`}
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

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">
                                    Bulan Ini
                                </p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {loading ? "..." : stats.dataThisMonth}
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
                                    <rect
                                        x="3"
                                        y="4"
                                        width="18"
                                        height="18"
                                        rx="2"
                                        ry="2"
                                    />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">
                                    Rata-rata
                                </p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {loading
                                        ? "..."
                                        : stats.totalData > 0
                                        ? `Rp ${Math.round(
                                              stats.totalPajak / stats.totalData
                                          ).toLocaleString("id-ID")}`
                                        : "Rp 0"}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-orange-600"
                                >
                                    <line x1="18" y1="20" x2="18" y2="10" />
                                    <line x1="12" y1="20" x2="12" y2="4" />
                                    <line x1="6" y1="20" x2="6" y2="14" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link
                                href="/inputdata"
                                className="group bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-2xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14,2 14,8 20,8" />
                                            <line
                                                x1="16"
                                                y1="13"
                                                x2="8"
                                                y2="13"
                                            />
                                            <line
                                                x1="16"
                                                y1="17"
                                                x2="8"
                                                y2="17"
                                            />
                                            <polyline points="10,9 9,9 8,9" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            Input Data
                                        </h3>
                                        <p className="text-blue-100 text-sm">
                                            Tambah data pajak baru
                                        </p>
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href="/listingdata"
                                className="group bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-2xl hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            Kelola Data
                                        </h3>
                                        <p className="text-green-100 text-sm">
                                            Lihat dan edit data
                                        </p>
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href="/exportdata"
                                className="group bg-gradient-to-r from-purple-600 to-purple-500 text-white p-6 rounded-2xl hover:from-purple-700 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <svg
                                            width="24"
                                            height="24"
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
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            Export Data
                                        </h3>
                                        <p className="text-purple-100 text-sm">
                                            Download laporan
                                        </p>
                                    </div>
                                </div>
                            </Link>

                            <div className="group bg-gradient-to-r from-orange-600 to-orange-500 text-white p-6 rounded-2xl opacity-60 cursor-not-allowed">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <line
                                                x1="18"
                                                y1="20"
                                                x2="18"
                                                y2="10"
                                            />
                                            <line
                                                x1="12"
                                                y1="20"
                                                x2="12"
                                                y2="4"
                                            />
                                            <line
                                                x1="6"
                                                y1="20"
                                                x2="6"
                                                y2="14"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            Analytics
                                        </h3>
                                        <p className="text-orange-100 text-sm">
                                            Coming soon
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">
                            Profile Info
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                                    {session?.user?.name?.[0] ||
                                        session?.user?.email?.[0] ||
                                        "U"}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">
                                        {session?.user?.name || "User"}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                        {session?.user?.email}
                                    </p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-200">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Role</span>
                                    <span className="font-medium text-slate-900 capitalize">
                                        {session?.user?.role || "User"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-2">
                                    <span className="text-slate-600">
                                        Status
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Data */}
                {stats.recentData && stats.recentData.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-premium border border-slate-200 overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Recent Data
                                    </h2>
                                    <p className="text-slate-600 mt-1">
                                        Data terbaru yang ditambahkan
                                    </p>
                                </div>
                                <Link
                                    href="/listingdata"
                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                                >
                                    Lihat Semua →
                                </Link>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left py-3 px-6 font-medium text-slate-700 text-sm">
                                            Nama
                                        </th>
                                        <th className="text-left py-3 px-6 font-medium text-slate-700 text-sm">
                                            NPWP
                                        </th>
                                        <th className="text-left py-3 px-6 font-medium text-slate-700 text-sm">
                                            Jumlah Pajak
                                        </th>
                                        <th className="text-left py-3 px-6 font-medium text-slate-700 text-sm">
                                            Tanggal
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentData
                                        .slice(0, 5)
                                        .map((item, index) => (
                                            <tr
                                                key={item.id}
                                                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                            >
                                                <td className="py-4 px-6 font-medium text-slate-900">
                                                    {item.nama}
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
                                                <td className="py-4 px-6 text-slate-600 text-sm">
                                                    {new Date(
                                                        item.createdAt
                                                    ).toLocaleDateString(
                                                        "id-ID"
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
