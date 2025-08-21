"use client"
import { useSocket } from "../../lib/useSocket"
import { useSession } from "next-auth/react"

export default function OnlinePresenceIndicator({
    showUserList = false,
    className = "",
}) {
    const { data: session } = useSession()
    const { isConnected, onlineUsers, adminStatus } = useSocket()

    if (!session) return null

    const admins = onlineUsers.filter((user) => user.userRole === "admin")
    const regularUsers = onlineUsers.filter((user) => user.userRole !== "admin")

    return (
        <div className={`${className}`}>
            {/* Connection Status */}
            <div className="flex items-center gap-2 mb-3">
                <div
                    className={`w-3 h-3 rounded-full ${
                        isConnected
                            ? "bg-green-500 animate-pulse"
                            : "bg-red-500"
                    }`}
                />
                <span className="text-sm text-gray-600">
                    {isConnected ? "Terhubung" : "Terputus"}
                </span>
            </div>

            {/* Admin Status */}
            {session.user.role !== "admin" && (
                <div className="bg-white rounded-lg border p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span className="font-semibold text-sm text-gray-700">
                            Status Admin
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div
                            className={`w-2 h-2 rounded-full ${
                                adminStatus.status === "online"
                                    ? "bg-green-500"
                                    : adminStatus.status === "busy"
                                    ? "bg-yellow-500"
                                    : adminStatus.status === "away"
                                    ? "bg-orange-500"
                                    : "bg-gray-400"
                            }`}
                        />
                        <span className="text-xs text-gray-600">
                            {adminStatus.status === "online"
                                ? "Tersedia"
                                : adminStatus.status === "busy"
                                ? "Sibuk"
                                : adminStatus.status === "away"
                                ? "Tidak di tempat"
                                : "Offline"}
                        </span>
                    </div>

                    {adminStatus.message && (
                        <div className="text-xs text-gray-500 mt-1 italic">
                            {adminStatus.message}
                        </div>
                    )}
                </div>
            )}

            {/* Online Users List */}
            {showUserList && (
                <div className="bg-white rounded-lg border p-3">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="font-semibold text-sm text-gray-700">
                            Online ({onlineUsers.length})
                        </span>
                    </div>

                    {/* Admins */}
                    {admins.length > 0 && (
                        <div className="mb-3">
                            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                                Admin
                            </div>
                            <div className="space-y-2">
                                {admins.map((admin) => (
                                    <div
                                        key={admin.socketId}
                                        className="flex items-center gap-2"
                                    >
                                        <div className="relative">
                                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-xs font-semibold text-blue-700">
                                                    {admin.userName
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                {admin.userName}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(
                                                    admin.joinedAt
                                                ).toLocaleTimeString("id-ID", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                        </div>
                                        <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                                            Admin
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Regular Users */}
                    {regularUsers.length > 0 && (
                        <div>
                            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                                Users ({regularUsers.length})
                            </div>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {regularUsers.map((user) => (
                                    <div
                                        key={user.socketId}
                                        className="flex items-center gap-2"
                                    >
                                        <div className="relative">
                                            <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                                                <span className="text-xs font-medium text-gray-600">
                                                    {user.userName
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-gray-700 truncate">
                                                {user.userName}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {new Date(
                                                user.joinedAt
                                            ).toLocaleTimeString("id-ID", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {onlineUsers.length === 0 && (
                        <div className="text-center text-gray-500 text-sm py-4">
                            Tidak ada user online
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// Simple online indicator for navbar
export function NavbarOnlineIndicator() {
    const { isConnected, onlineUsers } = useSocket()

    return (
        <div className="flex items-center gap-2 text-white/80 text-sm">
            <div
                className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
                }`}
            />
            <span className="hidden sm:inline">
                {isConnected ? `${onlineUsers.length} online` : "Offline"}
            </span>
        </div>
    )
}

// Admin status controller for admin users
export function AdminStatusController() {
    const { data: session } = useSession()
    const { updateAdminStatus, adminStatus } = useSocket()

    if (session?.user?.role !== "admin") return null

    const statusOptions = [
        { value: "online", label: "Available", color: "bg-green-500" },
        { value: "busy", label: "Busy", color: "bg-yellow-500" },
        { value: "away", label: "Away", color: "bg-orange-500" },
    ]

    return (
        <div className="bg-white rounded-lg border p-3">
            <div className="text-sm font-semibold text-gray-700 mb-2">
                Admin Status
            </div>
            <div className="space-y-2">
                {statusOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => updateAdminStatus(option.value)}
                        className={`flex items-center gap-2 w-full p-2 rounded-lg text-left transition-colors ${
                            adminStatus.status === option.value
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "hover:bg-gray-50 text-gray-700"
                        }`}
                    >
                        <div
                            className={`w-3 h-3 rounded-full ${option.color}`}
                        />
                        <span className="text-sm">{option.label}</span>
                        {adminStatus.status === option.value && (
                            <div className="ml-auto">
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <polyline points="20,6 9,17 4,12" />
                                </svg>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}
