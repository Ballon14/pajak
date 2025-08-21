"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

export default function AdminTaxPage() {
    const { data: session, status } = useSession()
    const [taxes, setTaxes] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [selectedTaxes, setSelectedTaxes] = useState([])
    const [editModal, setEditModal] = useState({ open: false, tax: null })
    const [bulkAction, setBulkAction] = useState("")
    const pageSize = 10

    const filteredTaxes = taxes.filter((tax) => {
        const matchesSearch =
            tax.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tax.alamat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tax.tahun?.toString().includes(searchTerm) ||
            tax.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tax.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus =
            statusFilter === "all" || tax.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const pagedTaxes = filteredTaxes.slice(
        (page - 1) * pageSize,
        page * pageSize
    )
    const totalPages = Math.ceil(filteredTaxes.length / pageSize) || 1
    const totalNominal = filteredTaxes.reduce(
        (sum, tax) => sum + (parseFloat(tax.jumlah) || 0),
        0
    )

    // Statistics
    const stats = {
        total: taxes.length,
        pending: taxes.filter((t) => t.status === "pending").length,
        approved: taxes.filter((t) => t.status === "approved").length,
        rejected: taxes.filter((t) => t.status === "rejected").length,
    }

    useEffect(() => {
        if (status === "authenticated" && session?.user?.role === "admin") {
            fetchTaxes()
        }
    }, [status, session])

    const fetchTaxes = async () => {
        try {
            const response = await fetch("/api/admin/taxes")
            if (response.ok) {
                const data = await response.json()
                setTaxes(Array.isArray(data) ? data : [])
            }
        } catch (error) {
            console.error("Error fetching taxes:", error)
            setTaxes([])
        } finally {
            setLoading(false)
        }
    }

    const updateTaxStatus = async (taxId, newStatus) => {
        try {
            const response = await fetch(`/api/admin/taxes/${taxId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            })

            if (response.ok) {
                setTaxes((prev) =>
                    prev.map((tax) =>
                        tax.id === taxId ? { ...tax, status: newStatus } : tax
                    )
                )
            }
        } catch (error) {
            console.error("Error updating tax status:", error)
        }
    }

    const updateTax = async (taxData) => {
        try {
            const response = await fetch(`/api/admin/taxes/${taxData.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(taxData),
            })

            if (response.ok) {
                const updatedTax = await response.json()
                setTaxes((prev) =>
                    prev.map((tax) =>
                        tax.id === taxData.id ? updatedTax : tax
                    )
                )
                setEditModal({ open: false, tax: null })
            }
        } catch (error) {
            console.error("Error updating tax:", error)
        }
    }

    const deleteTax = async (taxId) => {
        if (!confirm("Apakah Anda yakin ingin menghapus data pajak ini?"))
            return

        try {
            const response = await fetch(`/api/admin/taxes/${taxId}`, {
                method: "DELETE",
            })

            if (response.ok) {
                setTaxes((prev) => prev.filter((tax) => tax.id !== taxId))
            }
        } catch (error) {
            console.error("Error deleting tax:", error)
        }
    }

    const handleBulkAction = async () => {
        if (!bulkAction || selectedTaxes.length === 0) return

        try {
            const response = await fetch("/api/admin/taxes/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: bulkAction,
                    taxIds: selectedTaxes,
                }),
            })

            if (response.ok) {
                fetchTaxes()
                setSelectedTaxes([])
                setBulkAction("")
            }
        } catch (error) {
            console.error("Error performing bulk action:", error)
        }
    }

    const selectAllTaxes = () => {
        if (selectedTaxes.length === pagedTaxes.length) {
            setSelectedTaxes([])
        } else {
            setSelectedTaxes(pagedTaxes.map((tax) => tax.id))
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
                        Tax Data Management
                    </h1>
                    <p className="text-slate-600">
                        Kelola dan review data pajak dari semua pengguna
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">
                                    Total Data
                                </p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {loading ? "..." : stats.total}
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
                                    Pending
                                </p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {loading ? "..." : stats.pending}
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
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">
                                    Approved
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {loading ? "..." : stats.approved}
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

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">
                                    Total Nominal
                                </p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {loading
                                        ? "..."
                                        : `Rp ${totalNominal.toLocaleString(
                                              "id-ID"
                                          )}`}
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
                                    <line x1="12" y1="1" x2="12" y2="23" />
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Actions */}
                <div className="mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Cari berdasarkan nama, alamat, tahun, atau user..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-4">
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedTaxes.length > 0 && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-blue-900">
                                    {selectedTaxes.length} items selected
                                </span>
                                <select
                                    value={bulkAction}
                                    onChange={(e) =>
                                        setBulkAction(e.target.value)
                                    }
                                    className="px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Choose action...</option>
                                    <option value="approve">
                                        Approve Selected
                                    </option>
                                    <option value="reject">
                                        Reject Selected
                                    </option>
                                    <option value="delete">
                                        Delete Selected
                                    </option>
                                </select>
                                <button
                                    onClick={handleBulkAction}
                                    disabled={!bulkAction}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Apply Action
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tax Data Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left py-4 px-6">
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedTaxes.length ===
                                                    pagedTaxes.length &&
                                                pagedTaxes.length > 0
                                            }
                                            onChange={selectAllTaxes}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
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
                                        User
                                    </th>
                                    <th className="text-left py-4 px-6 font-semibold text-slate-700">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="py-12 text-center"
                                        >
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                        </td>
                                    </tr>
                                ) : pagedTaxes.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="py-12 text-center text-slate-500"
                                        >
                                            No tax data found
                                        </td>
                                    </tr>
                                ) : (
                                    pagedTaxes.map((tax) => (
                                        <tr
                                            key={tax.id}
                                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="py-4 px-6">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTaxes.includes(
                                                        tax.id
                                                    )}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedTaxes([
                                                                ...selectedTaxes,
                                                                tax.id,
                                                            ])
                                                        } else {
                                                            setSelectedTaxes(
                                                                selectedTaxes.filter(
                                                                    (id) =>
                                                                        id !==
                                                                        tax.id
                                                                )
                                                            )
                                                        }
                                                    }}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="py-4 px-6 font-semibold text-slate-900">
                                                {tax.nama}
                                            </td>
                                            <td className="py-4 px-6 text-slate-700 text-sm max-w-xs truncate">
                                                {tax.alamat}
                                            </td>
                                            <td className="py-4 px-6 text-slate-700 font-medium">
                                                {tax.tahun}
                                            </td>
                                            <td className="py-4 px-6 font-semibold text-green-600">
                                                Rp{" "}
                                                {parseInt(
                                                    tax.jumlah || 0
                                                ).toLocaleString("id-ID")}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                        tax.status ===
                                                        "approved"
                                                            ? "bg-green-100 text-green-700"
                                                            : tax.status ===
                                                              "rejected"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-orange-100 text-orange-700"
                                                    }`}
                                                >
                                                    {tax.status || "pending"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-slate-700">
                                                    <div className="font-medium text-sm">
                                                        {tax.user?.name ||
                                                            "Unknown User"}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {tax.user?.email ||
                                                            "No email"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex gap-1">
                                                    {/* View Detail */}
                                                    <button
                                                        onClick={() =>
                                                            window.open(
                                                                `/dashboard/admin/tax/${tax.id}`,
                                                                "_blank"
                                                            )
                                                        }
                                                        className="p-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                                                        title="View Detail"
                                                    >
                                                        <svg
                                                            width="16"
                                                            height="16"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                        >
                                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                            <circle
                                                                cx="12"
                                                                cy="12"
                                                                r="3"
                                                            />
                                                        </svg>
                                                    </button>

                                                    {/* Edit */}
                                                    <button
                                                        onClick={() =>
                                                            setEditModal({
                                                                open: true,
                                                                tax,
                                                            })
                                                        }
                                                        className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <svg
                                                            width="16"
                                                            height="16"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                        >
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                        </svg>
                                                    </button>

                                                    {/* Approve */}
                                                    {tax.status !==
                                                        "approved" && (
                                                        <button
                                                            onClick={() =>
                                                                updateTaxStatus(
                                                                    tax.id,
                                                                    "approved"
                                                                )
                                                            }
                                                            className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                                                            title="Approve"
                                                        >
                                                            <svg
                                                                width="16"
                                                                height="16"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                            >
                                                                <path d="M9 12l2 2 4-4" />
                                                                <circle
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}

                                                    {/* Reject */}
                                                    {tax.status !==
                                                        "rejected" && (
                                                        <button
                                                            onClick={() =>
                                                                updateTaxStatus(
                                                                    tax.id,
                                                                    "rejected"
                                                                )
                                                            }
                                                            className="p-2 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                                                            title="Reject"
                                                        >
                                                            <svg
                                                                width="16"
                                                                height="16"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                            >
                                                                <circle
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                />
                                                                <line
                                                                    x1="15"
                                                                    y1="9"
                                                                    x2="9"
                                                                    y2="15"
                                                                />
                                                                <line
                                                                    x1="9"
                                                                    y1="9"
                                                                    x2="15"
                                                                    y2="15"
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() =>
                                                            deleteTax(tax.id)
                                                        }
                                                        className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <svg
                                                            width="16"
                                                            height="16"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                        >
                                                            <polyline points="3,6 5,6 21,6" />
                                                            <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
                                                            <line
                                                                x1="10"
                                                                y1="11"
                                                                x2="10"
                                                                y2="17"
                                                            />
                                                            <line
                                                                x1="14"
                                                                y1="11"
                                                                x2="14"
                                                                y2="17"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && filteredTaxes.length > 0 && (
                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-600">
                                    Showing {(page - 1) * pageSize + 1} to{" "}
                                    {Math.min(
                                        page * pageSize,
                                        filteredTaxes.length
                                    )}{" "}
                                    of {filteredTaxes.length} tax records
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            setPage((prev) =>
                                                Math.max(prev - 1, 1)
                                            )
                                        }
                                        disabled={page === 1}
                                        className="px-4 py-2 rounded-lg text-sm border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-4 py-2 text-sm text-slate-600">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setPage((prev) =>
                                                Math.min(prev + 1, totalPages)
                                            )
                                        }
                                        disabled={page === totalPages}
                                        className="px-4 py-2 rounded-lg text-sm border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Edit Modal */}
                {editModal.open && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">
                                Edit Tax Data
                            </h2>
                            {editModal.tax.user && (
                                <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="text-sm text-slate-600 mb-1">
                                        Input by:
                                    </div>
                                    <div className="font-medium text-slate-900">
                                        {editModal.tax.user.name}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {editModal.tax.user.email}
                                    </div>
                                </div>
                            )}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    const formData = new FormData(e.target)
                                    updateTax({
                                        id: editModal.tax.id,
                                        nama: formData.get("nama"),
                                        alamat: formData.get("alamat"),
                                        tahun: formData.get("tahun"),
                                        jumlah: formData.get("jumlah"),
                                        status: formData.get("status"),
                                    })
                                }}
                            >
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Nama
                                        </label>
                                        <input
                                            name="nama"
                                            type="text"
                                            defaultValue={editModal.tax.nama}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Tahun
                                        </label>
                                        <input
                                            name="tahun"
                                            type="number"
                                            defaultValue={editModal.tax.tahun}
                                            min="2000"
                                            max="2100"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Alamat
                                        </label>
                                        <textarea
                                            name="alamat"
                                            defaultValue={editModal.tax.alamat}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows="3"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Jumlah Pajak
                                        </label>
                                        <input
                                            name="jumlah"
                                            type="number"
                                            defaultValue={editModal.tax.jumlah}
                                            min="0"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            defaultValue={
                                                editModal.tax.status ||
                                                "pending"
                                            }
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="pending">
                                                Pending
                                            </option>
                                            <option value="approved">
                                                Approved
                                            </option>
                                            <option value="rejected">
                                                Rejected
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditModal({
                                                open: false,
                                                tax: null,
                                            })
                                        }
                                        className="flex-1 bg-slate-300 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
