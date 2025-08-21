"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

export default function AdminUserPage() {
    const { data: session, status } = useSession()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [roleFilter, setRoleFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [selectedUsers, setSelectedUsers] = useState([])
    const [userModal, setUserModal] = useState({
        open: false,
        mode: "create",
        user: null,
    })
    const [bulkAction, setBulkAction] = useState("")
    const pageSize = 10

    const filteredUsers = Array.isArray(users)
        ? users.filter((user) => {
              const matchesSearch =
                  user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.email?.toLowerCase().includes(searchTerm.toLowerCase())
              const matchesRole =
                  roleFilter === "all" || user.role === roleFilter
              const matchesStatus =
                  statusFilter === "all" || user.status === statusFilter
              return matchesSearch && matchesRole && matchesStatus
          })
        : []

    const pagedUsers = filteredUsers.slice(
        (page - 1) * pageSize,
        page * pageSize
    )
    const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1

    // Statistics
    const stats = {
        total: users.length,
        active: users.filter((u) => u.status === "aktif").length,
        inactive: users.filter((u) => u.status === "nonaktif").length,
        admins: users.filter((u) => u.role === "admin").length,
    }

    useEffect(() => {
        if (status === "authenticated" && session?.user?.role === "admin") {
            fetchUsers()
        }
    }, [status, session])

    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/admin/users")
            if (response.ok) {
                const data = await response.json()
                setUsers(Array.isArray(data) ? data : [])
            } else {
                setUsers([])
            }
        } catch (error) {
            console.error("Error fetching users:", error)
            setUsers([])
        } finally {
            setLoading(false)
        }
    }

    const createUser = async (userData) => {
        try {
            const response = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            })

            if (response.ok) {
                const newUser = await response.json()
                setUsers((prev) => [...prev, newUser])
                setUserModal({ open: false, mode: "create", user: null })
            }
        } catch (error) {
            console.error("Error creating user:", error)
        }
    }

    const updateUser = async (userData) => {
        try {
            const response = await fetch(`/api/admin/users/${userData.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            })

            if (response.ok) {
                const updatedUser = await response.json()
                setUsers((prev) =>
                    prev.map((user) =>
                        user.id === userData.id ? updatedUser : user
                    )
                )
                setUserModal({ open: false, mode: "edit", user: null })
            }
        } catch (error) {
            console.error("Error updating user:", error)
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
            }
        } catch (error) {
            console.error("Error updating user status:", error)
        }
    }

    const deleteUser = async (userId) => {
        if (!confirm("Apakah Anda yakin ingin menghapus user ini?")) return

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
            })

            if (response.ok) {
                setUsers((prev) => prev.filter((user) => user.id !== userId))
            }
        } catch (error) {
            console.error("Error deleting user:", error)
        }
    }

    const handleBulkAction = async () => {
        if (!bulkAction || selectedUsers.length === 0) return

        try {
            const response = await fetch("/api/admin/users/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: bulkAction,
                    userIds: selectedUsers,
                }),
            })

            if (response.ok) {
                fetchUsers()
                setSelectedUsers([])
                setBulkAction("")
            }
        } catch (error) {
            console.error("Error performing bulk action:", error)
        }
    }

    const selectAllUsers = () => {
        if (selectedUsers.length === pagedUsers.length) {
            setSelectedUsers([])
        } else {
            setSelectedUsers(pagedUsers.map((user) => user.id))
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
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                            User Management
                        </h1>
                        <p className="text-slate-600">
                            Kelola pengguna dan status akun mereka
                        </p>
                    </div>
                    <button
                        onClick={() =>
                            setUserModal({
                                open: true,
                                mode: "create",
                                user: null,
                            })
                        }
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    >
                        Add New User
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">
                                    Total Users
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
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">
                                    Active Users
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {loading ? "..." : stats.active}
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
                                    Inactive Users
                                </p>
                                <p className="text-2xl font-bold text-red-600">
                                    {loading ? "..." : stats.inactive}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-red-600"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">
                                    Admins
                                </p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {loading ? "..." : stats.admins}
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
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
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
                                placeholder="Cari berdasarkan nama atau email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-4">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Roles</option>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="aktif">Active</option>
                                <option value="nonaktif">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedUsers.length > 0 && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-blue-900">
                                    {selectedUsers.length} users selected
                                </span>
                                <select
                                    value={bulkAction}
                                    onChange={(e) =>
                                        setBulkAction(e.target.value)
                                    }
                                    className="px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Choose action...</option>
                                    <option value="activate">
                                        Activate Selected
                                    </option>
                                    <option value="deactivate">
                                        Deactivate Selected
                                    </option>
                                    <option value="makeAdmin">
                                        Make Admin
                                    </option>
                                    <option value="makeUser">Make User</option>
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

                {/* Users Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left py-4 px-6">
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedUsers.length ===
                                                    pagedUsers.length &&
                                                pagedUsers.length > 0
                                            }
                                            onChange={selectAllUsers}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="text-left py-4 px-6 font-semibold text-slate-700">
                                        Name
                                    </th>
                                    <th className="text-left py-4 px-6 font-semibold text-slate-700">
                                        Email
                                    </th>
                                    <th className="text-left py-4 px-6 font-semibold text-slate-700">
                                        Role
                                    </th>
                                    <th className="text-left py-4 px-6 font-semibold text-slate-700">
                                        Status
                                    </th>
                                    <th className="text-left py-4 px-6 font-semibold text-slate-700">
                                        Created At
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
                                ) : pagedUsers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="py-12 text-center text-slate-500"
                                        >
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    pagedUsers.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="py-4 px-6">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.includes(
                                                        user.id
                                                    )}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedUsers([
                                                                ...selectedUsers,
                                                                user.id,
                                                            ])
                                                        } else {
                                                            setSelectedUsers(
                                                                selectedUsers.filter(
                                                                    (id) =>
                                                                        id !==
                                                                        user.id
                                                                )
                                                            )
                                                        }
                                                    }}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                                                        {user.name?.[0] || "U"}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900">
                                                            {user.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-slate-700">
                                                {user.email}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                        user.role === "admin"
                                                            ? "bg-purple-100 text-purple-700"
                                                            : "bg-blue-100 text-blue-700"
                                                    }`}
                                                >
                                                    {user.role || "user"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                        user.status === "aktif"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-slate-600 text-sm">
                                                {new Date(
                                                    user.createdAt
                                                ).toLocaleDateString("id-ID")}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex gap-1">
                                                    {/* Edit */}
                                                    <button
                                                        onClick={() =>
                                                            setUserModal({
                                                                open: true,
                                                                mode: "edit",
                                                                user,
                                                            })
                                                        }
                                                        className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                                        title="Edit User"
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

                                                    {/* Toggle Status */}
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
                                                            user.status ===
                                                            "aktif"
                                                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                                                : "bg-green-100 text-green-700 hover:bg-green-200"
                                                        }`}
                                                        title={
                                                            user.status ===
                                                            "aktif"
                                                                ? "Deactivate"
                                                                : "Activate"
                                                        }
                                                    >
                                                        {user.status ===
                                                        "aktif" ? (
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
                                                        ) : (
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
                                                        )}
                                                    </button>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() =>
                                                            deleteUser(user.id)
                                                        }
                                                        className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                                        title="Delete User"
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
                    {!loading && filteredUsers.length > 0 && (
                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-600">
                                    Showing {(page - 1) * pageSize + 1} to{" "}
                                    {Math.min(
                                        page * pageSize,
                                        filteredUsers.length
                                    )}{" "}
                                    of {filteredUsers.length} users
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

                {/* User Modal */}
                {userModal.open && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">
                                {userModal.mode === "create"
                                    ? "Create New User"
                                    : "Edit User"}
                            </h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    const formData = new FormData(e.target)
                                    const userData = {
                                        name: formData.get("name"),
                                        email: formData.get("email"),
                                        role: formData.get("role"),
                                        status: formData.get("status"),
                                    }

                                    if (userModal.mode === "create") {
                                        userData.password =
                                            formData.get("password")
                                        createUser(userData)
                                    } else {
                                        userData.id = userModal.user.id
                                        updateUser(userData)
                                    }
                                }}
                            >
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Name
                                        </label>
                                        <input
                                            name="name"
                                            type="text"
                                            defaultValue={
                                                userModal.user?.name || ""
                                            }
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            name="email"
                                            type="email"
                                            defaultValue={
                                                userModal.user?.email || ""
                                            }
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    {userModal.mode === "create" && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Password
                                            </label>
                                            <input
                                                name="password"
                                                type="password"
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                minLength="6"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Role
                                        </label>
                                        <select
                                            name="role"
                                            defaultValue={
                                                userModal.user?.role || "user"
                                            }
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            defaultValue={
                                                userModal.user?.status ||
                                                "aktif"
                                            }
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="aktif">
                                                Active
                                            </option>
                                            <option value="nonaktif">
                                                Inactive
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        {userModal.mode === "create"
                                            ? "Create User"
                                            : "Save Changes"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setUserModal({
                                                open: false,
                                                mode: "create",
                                                user: null,
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
