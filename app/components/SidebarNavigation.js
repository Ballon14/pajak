"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useState, useRef, useEffect } from "react"
import { NavbarOnlineIndicator } from "./OnlinePresenceIndicator"
import { CompactThemeToggle } from "./ThemeToggle"

// Navigation items untuk user biasa
const userNavigationItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
            </svg>
        ),
        description: "Overview & Analytics",
    },
    {
        label: "Input Data",
        href: "/inputdata",
        icon: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
            </svg>
        ),
        description: "Add New Records",
    },
    {
        label: "Data Management",
        href: "/listingdata",
        icon: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
        ),
        description: "View & Edit Records",
    },
    {
        label: "Export & Reports",
        href: "/exportdata",
        icon: (
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
                <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
        ),
        description: "Export Data & Analytics",
    },
]

// Navigation items untuk admin
const adminNavigationItems = [
    {
        label: "Admin Dashboard",
        href: "/dashboard/admin",
        icon: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
            </svg>
        ),
        description: "Admin Overview",
    },
    {
        label: "User Management",
        href: "/dashboard/admin/user",
        icon: (
            <svg
                width="20"
                height="20"
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
        ),
        description: "Manage Users",
    },
    {
        label: "Tax Data",
        href: "/dashboard/admin/tax",
        icon: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
        ),
        description: "Tax Records",
    },
    {
        label: "Chat Management",
        href: "/dashboard/admin/chat",
        icon: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        description: "User Messages",
    },
]

export default function SidebarNavigation({ isCollapsed, setIsCollapsed }) {
    const pathname = usePathname()
    const { data: session, status } = useSession()
    const [profileOpen, setProfileOpen] = useState(false)
    const [hoverItem, setHoverItem] = useState(null)
    const profileRef = useRef(null)

    // Close profile dropdown on click outside
    useEffect(() => {
        function handleClick(e) {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false)
            }
        }
        if (profileOpen) document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [profileOpen])

    if (status === "loading") {
        return (
            <div
                className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700/50 transition-all duration-300 ${
                    isCollapsed ? "w-20" : "w-72"
                } z-40`}
            >
                <div className="p-6">
                    <div className="animate-pulse">
                        <div className="h-8 bg-slate-700 rounded mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-12 bg-slate-700 rounded"></div>
                            <div className="h-12 bg-slate-700 rounded"></div>
                            <div className="h-12 bg-slate-700 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 backdrop-blur-xl transition-all duration-300 ${
                isCollapsed ? "w-20" : "w-72"
            } z-40 shadow-2xl`}
        >
            {/* Header */}
            <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="white"
                                    >
                                        <circle cx="12" cy="12" r="10" />
                                        <path
                                            d="M12 6v6l4 2"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
                            </div>
                            <div>
                                <h1 className="text-white font-bold text-xl tracking-tight">
                                    PajakApp
                                </h1>
                                <p className="text-slate-400 text-xs">
                                    Tax Management System
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        {/* Theme Toggle */}
                        <CompactThemeToggle />

                        {/* Collapse/Expand Button */}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center transition-all duration-200 hover:scale-105"
                            aria-label={
                                isCollapsed
                                    ? "Expand sidebar"
                                    : "Collapse sidebar"
                            }
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className={`text-slate-400 transition-transform duration-300 ${
                                    isCollapsed ? "rotate-180" : ""
                                }`}
                            >
                                <polyline points="11,17 6,12 11,7" />
                                <polyline points="18,17 13,12 18,7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                {(session?.user?.role === "admin"
                    ? adminNavigationItems
                    : userNavigationItems
                ).map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                                isActive
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                            }`}
                            onMouseEnter={() => setHoverItem(item.href)}
                            onMouseLeave={() => setHoverItem(null)}
                        >
                            {/* Icon */}
                            <div
                                className={`flex-shrink-0 transition-transform duration-200 ${
                                    isActive
                                        ? "scale-110"
                                        : "group-hover:scale-105"
                                }`}
                            >
                                {item.icon}
                            </div>

                            {/* Label and Description */}
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">
                                        {item.label}
                                    </div>
                                    <div
                                        className={`text-xs truncate transition-colors duration-200 ${
                                            isActive
                                                ? "text-blue-100"
                                                : "text-slate-500 group-hover:text-slate-400"
                                        }`}
                                    >
                                        {item.description}
                                    </div>
                                </div>
                            )}

                            {/* Active Indicator */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                            )}

                            {/* Hover Effect */}
                            {hoverItem === item.href && !isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl"></div>
                            )}

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-slate-700">
                                    <div className="font-medium">
                                        {item.label}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {item.description}
                                    </div>
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-700"></div>
                                </div>
                            )}
                        </Link>
                    )
                })}
            </div>

            {/* Online Status */}
            {status === "authenticated" && (
                <div
                    className={`px-4 py-3 border-t border-slate-700/50 ${
                        isCollapsed ? "text-center" : ""
                    }`}
                >
                    <NavbarOnlineIndicator />
                </div>
            )}

            {/* User Profile Section */}
            {status === "authenticated" && session && (
                <div
                    className="p-4 border-t border-slate-700/50"
                    ref={profileRef}
                >
                    <div className="relative">
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all duration-200 group ${
                                isCollapsed ? "justify-center" : ""
                            }`}
                            aria-haspopup="menu"
                            aria-expanded={profileOpen}
                        >
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                {session.user.image ? (
                                    <img
                                        src={session.user.image}
                                        alt="Profile"
                                        className="w-10 h-10 rounded-xl object-cover border-2 border-slate-600 group-hover:border-slate-500 transition-colors"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                        {session.user.name?.[0] ||
                                            session.user.email?.[0] ||
                                            "U"}
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
                            </div>

                            {!isCollapsed && (
                                <>
                                    {/* User Info */}
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="text-white font-medium text-sm truncate">
                                            {session.user.name ||
                                                session.user.email}
                                        </div>
                                        <div className="text-slate-400 text-xs truncate">
                                            {session.user.role === "admin"
                                                ? "Administrator"
                                                : "User"}
                                        </div>
                                    </div>

                                    {/* Dropdown Arrow */}
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className={`text-slate-400 transition-transform duration-200 ${
                                            profileOpen ? "rotate-180" : ""
                                        }`}
                                    >
                                        <polyline points="6,9 12,15 18,9" />
                                    </svg>
                                </>
                            )}
                        </button>

                        {/* Profile Dropdown */}
                        {profileOpen && (
                            <div
                                className={`absolute bottom-full mb-2 ${
                                    isCollapsed
                                        ? "left-full ml-2"
                                        : "left-0 right-0"
                                } bg-slate-800 rounded-xl shadow-2xl border border-slate-700 py-2 z-50 animate-fadeIn`}
                            >
                                <div className="px-4 py-2 border-b border-slate-700">
                                    <div className="text-white font-medium text-sm">
                                        {session.user.name || "User"}
                                    </div>
                                    <div className="text-slate-400 text-xs">
                                        {session.user.email}
                                    </div>
                                </div>

                                <Link
                                    href="/dashboard/profile"
                                    className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors text-sm"
                                    onClick={() => setProfileOpen(false)}
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    Profile Settings
                                </Link>

                                <button
                                    onClick={() => {
                                        setProfileOpen(false)
                                        signOut({
                                            callbackUrl:
                                                "https://pajak.iqbaldev.site",
                                        })
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-sm"
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16,17 21,12 16,7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    Sign Out
                                </button>
                            </div>
                        )}

                        {/* Tooltip for collapsed profile */}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-slate-700">
                                <div className="font-medium">
                                    {session.user.name || "User"}
                                </div>
                                <div className="text-xs text-slate-400">
                                    {session.user.email}
                                </div>
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-700"></div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Not Authenticated State */}
            {status === "unauthenticated" && (
                <div className="p-4 border-t border-slate-700/50">
                    <Link
                        href="/login"
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg ${
                            isCollapsed ? "px-2" : ""
                        }`}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                            <polyline points="10,17 15,12 10,7" />
                            <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                        {!isCollapsed && "Sign In"}
                    </Link>
                </div>
            )}
        </div>
    )
}
