"use client"
import { useEffect, useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useNotification } from "@/app/components/NotificationToast"

export default function AdminDashboardPage() {
    const { data: session, status } = useSession()
    const { addNotification } = useNotification()
    const [users, setUsers] = useState([])
    const [taxes, setTaxes] = useState([])
    const [loading, setLoading] = useState(true)
    const [userPage, setUserPage] = useState(1)
    const [taxPage, setTaxPage] = useState(1)
    const pageSize = 10

    const pagedUsers = Array.isArray(users)
        ? users.slice((userPage - 1) * pageSize, userPage * pageSize)
        : []
    const pagedTaxes = Array.isArray(taxes)
        ? taxes.slice((taxPage - 1) * pageSize, taxPage * pageSize)
        : []
    const userTotalPages = Array.isArray(users)
        ? Math.ceil(users.length / pageSize) || 1
        : 1
    const taxTotalPages = Array.isArray(taxes)
        ? Math.ceil(taxes.length / pageSize) || 1
        : 1

    // Hitung total nominal pajak dan statistik status
    const totalNominal = Array.isArray(taxes)
        ? taxes.reduce((sum, t) => sum + (parseFloat(t.jumlah) || 0), 0)
        : 0

    const statusCounts = useMemo(() => {
        const counts = { aktif: 0, nonaktif: 0 }
        if (Array.isArray(users)) {
            users.forEach((user) => {
                if (user.status === "aktif") counts.aktif++
                else counts.nonaktif++
            })
        }
        return counts
    }, [users])

    useEffect(() => {
        if (status === "authenticated" && session?.user?.role === "admin") {
            fetchUsers()
            fetchTaxes()
        }
    }, [status, session])

    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/admin/users")
            if (response.ok) {
                const data = await response.json()
                setUsers(Array.isArray(data) ? data : [])
            } else {
                addNotification("Gagal memuat data users", "error")
                setUsers([])
            }
        } catch (error) {
            console.error("Error fetching users:", error)
            addNotification("Error memuat data users", "error")
            setUsers([])
        }
    }

    const fetchTaxes = async () => {
        try {
            const response = await fetch("/api/admin/taxes")
            if (response.ok) {
                const data = await response.json()
                setTaxes(Array.isArray(data) ? data : [])
            } else {
                addNotification("Gagal memuat data pajak", "error")
                setTaxes([])
            }
        } catch (error) {
            console.error("Error fetching taxes:", error)
            addNotification("Error memuat data pajak", "error")
            setTaxes([])
        } finally {
            setLoading(false)
        }
    }

    const updateUserStatus = async (userId, newStatus) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            })

            if (response.ok) {
                setUsers((prev) =>
                    prev.map((user) =>
                        user.id === userId
                            ? { ...user, status: newStatus }
                            : user
                    )
                )
                addNotification(
                    `Status user berhasil diubah menjadi ${newStatus}`,
                    "success"
                )
            } else {
                addNotification("Gagal mengubah status user", "error")
            }
        } catch (error) {
            console.error("Error updating user status:", error)
            addNotification("Error mengubah status user", "error")
        }
    }

    const deleteTax = async (taxId) => {
        if (!confirm("Apakah Anda yakin ingin menghapus data pajak ini?"))
            return

        try {
            const response = await fetch(`/api/admin/taxes?id=${taxId}`, {
                method: "DELETE",
            })

            if (response.ok) {
                setTaxes((prev) => prev.filter((tax) => tax.id !== taxId))
                addNotification("Data pajak berhasil dihapus", "success")
            } else {
                addNotification("Gagal menghapus data pajak", "error")
            }
        } catch (error) {
            console.error("Error deleting tax:", error)
            addNotification("Error menghapus data pajak", "error")
        }
    }

    if (status === "loading") {
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

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-slate-600">
                        Kelola pengguna dan data pajak sistem
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">
                                    Total Users
                                </p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {loading ? "..." : users.length}
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
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">
                                    Active Users
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {loading ? "..." : statusCounts.aktif}
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
                                    <path d="M9 12l2 2 4-4" />
                                    <circle cx="12" cy="12" r="10" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">
                                    Total Data Pajak
                                </p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {loading ? "..." : taxes.length}
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
                                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">
                                    Total Nominal
                                </p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {loading
                                        ? "..."
                                        : `Rp ${totalNominal.toLocaleString(
                                              "id-ID"
                                          )}`}
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
                                    <line x1="12" y1="1" x2="12" y2="23" />
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Users */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Recent Users
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">
                                            Name
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">
                                            Email
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">
                                            Status
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedUsers.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="py-3 px-4 font-medium text-slate-900">
                                                {user.name}
                                            </td>
                                            <td className="py-3 px-4 text-slate-700 text-sm">
                                                {user.email}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        user.status === "aktif"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={() =>
                                                        updateUserStatus(
                                                            user.id,
                                                            user.status ===
                                                                "aktif"
                                                                ? "nonaktif"
                                                                : "aktif"
                                                        )
                                                    }
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        user.status === "aktif"
                                                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                                                            : "bg-green-100 text-green-700 hover:bg-green-200"
                                                    }`}
                                                    title={user.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
                                                >
                                                    {user.status === "aktif" ? (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="10"/>
                                                            <line x1="15" y1="9" x2="9" y2="15"/>
                                                            <line x1="9" y1="9" x2="15" y2="15"/>
                                                        </svg>
                                                    ) : (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M9 12l2 2 4-4"/>
                                                            <circle cx="12" cy="12" r="10"/>
                                                        </svg>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination for Users */}
                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">
                                    Page {userPage} of {userTotalPages}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() =>
                                            setUserPage((prev) =>
                                                Math.max(prev - 1, 1)
                                            )
                                        }
                                        disabled={userPage === 1}
                                        className="px-3 py-1 rounded-lg text-sm border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() =>
                                            setUserPage((prev) =>
                                                Math.min(
                                                    prev + 1,
                                                    userTotalPages
                                                )
                                            )
                                        }
                                        disabled={userPage === userTotalPages}
                                        className="px-3 py-1 rounded-lg text-sm border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Tax Data */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Recent Tax Data
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">
                                            Name
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">
                                            Amount
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedTaxes.map((tax) => (
                                        <tr
                                            key={tax.id}
                                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="py-3 px-4 font-medium text-slate-900">
                                                {tax.nama}
                                            </td>
                                            <td className="py-3 px-4 text-slate-700 font-semibold">
                                                Rp{" "}
                                                {parseInt(
                                                    tax.jumlah
                                                ).toLocaleString("id-ID")}
                                            </td>
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={() =>
                                                        deleteTax(tax.id)
                                                    }
                                                    className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                                    title="Delete Tax"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3,6 5,6 21,6"/>
                                                        <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                                                        <line x1="10" y1="11" x2="10" y2="17"/>
                                                        <line x1="14" y1="11" x2="14" y2="17"/>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination for Taxes */}
                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">
                                    Page {taxPage} of {taxTotalPages}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() =>
                                            setTaxPage((prev) =>
                                                Math.max(prev - 1, 1)
                                            )
                                        }
                                        disabled={taxPage === 1}
                                        className="px-3 py-1 rounded-lg text-sm border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() =>
                                            setTaxPage((prev) =>
                                                Math.min(
                                                    prev + 1,
                                                    taxTotalPages
                                                )
                                            )
                                        }
                                        disabled={taxPage === taxTotalPages}
                                        className="px-3 py-1 rounded-lg text-sm border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
