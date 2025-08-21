"use client"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ProfilePage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: session?.user?.name || "",
        email: session?.user?.email || "",
    })

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (status === "unauthenticated") {
        router.push("/login")
        return null
    }

    const handleSave = async () => {
        // TODO: Implement profile update API
        setIsEditing(false)
    }

    const handleSignOut = () => {
        signOut({ callbackUrl: "https://pajak.iqbaldev.site" })
    }

    return (
        <div className="p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Profile Settings
                    </h1>
                    <p className="text-slate-600">
                        Manage your account settings and preferences
                    </p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-premium border border-slate-200 overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-white">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl backdrop-blur-sm">
                                {session?.user?.name?.[0] ||
                                    session?.user?.email?.[0] ||
                                    "U"}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-2">
                                    {session?.user?.name || "User"}
                                </h2>
                                <p className="text-blue-100 mb-1">
                                    {session?.user?.email}
                                </p>
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    {session?.user?.role === "admin"
                                        ? "Administrator"
                                        : "User"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="p-8">
                        <div className="space-y-6">
                            {/* Personal Information */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-900">
                                        Personal Information
                                    </h3>
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                                    >
                                        {isEditing ? "Cancel" : "Edit"}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Full Name
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        name: e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        ) : (
                                            <div className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-900">
                                                {session?.user?.name ||
                                                    "Not set"}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-mono">
                                            {session?.user?.email}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Email cannot be changed
                                        </p>
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={handleSave}
                                            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Account Information */}
                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                    Account Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            User ID
                                        </label>
                                        <div className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-mono text-sm">
                                            {session?.user?.id || "N/A"}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Account Type
                                        </label>
                                        <div className="w-full px-4 py-3 bg-slate-50 rounded-xl">
                                            <span
                                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                                                    session?.user?.role ===
                                                    "admin"
                                                        ? "bg-purple-100 text-purple-700"
                                                        : "bg-blue-100 text-blue-700"
                                                }`}
                                            >
                                                {session?.user?.role ===
                                                "admin" ? (
                                                    <svg
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <path d="M12 1l3 6 6 1-3 6-6 1-3-6-6-1 3-6z" />
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
                                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                        <circle
                                                            cx="12"
                                                            cy="7"
                                                            r="4"
                                                        />
                                                    </svg>
                                                )}
                                                {session?.user?.role === "admin"
                                                    ? "Administrator"
                                                    : "Standard User"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Security Section */}
                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                    Security
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <div>
                                            <div className="font-medium text-slate-900">
                                                Password
                                            </div>
                                            <div className="text-sm text-slate-600">
                                                Last updated: Not available
                                            </div>
                                        </div>
                                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
                                            Change Password
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <div>
                                            <div className="font-medium text-slate-900">
                                                Two-Factor Authentication
                                            </div>
                                            <div className="text-sm text-slate-600">
                                                Add an extra layer of security
                                            </div>
                                        </div>
                                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
                                            Enable 2FA
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="pt-6 border-t border-red-200">
                                <h3 className="text-lg font-semibold text-red-900 mb-4">
                                    Danger Zone
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 border border-red-200 bg-red-50 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-red-900">
                                                    Sign Out
                                                </div>
                                                <div className="text-sm text-red-600">
                                                    Sign out from this account
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleSignOut}
                                                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 border border-red-200 bg-red-50 rounded-xl opacity-60">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-red-900">
                                                    Delete Account
                                                </div>
                                                <div className="text-sm text-red-600">
                                                    Permanently delete your
                                                    account and all data
                                                </div>
                                            </div>
                                            <button
                                                disabled
                                                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium opacity-50 cursor-not-allowed"
                                            >
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
