"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useState, useRef, useEffect } from "react"

const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Input Data", href: "/inputdata" },
    { label: "Listing Data", href: "/listingdata" },
    { label: "Export Data", href: "/exportdata" },
]

export default function Navbar() {
    const pathname = usePathname()
    const { data: session, status } = useSession()
    const [open, setOpen] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const menuRef = useRef(null)
    const mobileMenuRef = useRef(null)

    // Close profile dropdown on click outside
    useEffect(() => {
        function handleClick(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        if (open) document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [open])

    // Close mobile menu on click outside
    useEffect(() => {
        function handleClick(e) {
            if (
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(e.target)
            ) {
                setMobileOpen(false)
            }
        }
        if (mobileOpen) document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [mobileOpen])

    // Scroll lock saat mobile menu terbuka
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => {
            document.body.style.overflow = ""
        }
    }, [mobileOpen])

    // Fokus otomatis ke menu saat terbuka
    useEffect(() => {
        if (mobileOpen && mobileMenuRef.current) {
            mobileMenuRef.current.focus()
        }
    }, [mobileOpen])

    return (
        <header className="bg-gradient-to-r from-blue-800 to-blue-500 shadow-lg sticky top-0 z-50">
            <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#fff" />
                        <path
                            d="M12 6v6l4 2"
                            stroke="#2563eb"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <span className="text-white text-xl font-bold tracking-wide drop-shadow">
                        PajakApp
                    </span>
                </div>
                {/* Desktop Nav Items */}
                <nav className="hidden sm:flex gap-2 sm:gap-6 items-center">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base
                                    ${
                                        isActive
                                            ? "bg-white text-blue-700 shadow-md"
                                            : "text-white hover:bg-blue-600 hover:text-yellow-300"
                                    }
                                `}
                                style={{
                                    boxShadow: isActive
                                        ? "0 2px 8px rgba(0,0,0,0.08)"
                                        : undefined,
                                }}
                            >
                                {item.label}
                                {isActive && (
                                    <span className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-2 h-2 bg-yellow-300 rounded-full animate-bounce" />
                                )}
                            </Link>
                        )
                    })}
                    {/* Profile & Logout */}
                    {status === "authenticated" ? (
                        <div className="relative ml-4" ref={menuRef}>
                            <button
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white text-blue-700 font-semibold shadow-md hover:bg-blue-100 transition-all focus:outline-none"
                                onClick={() => setOpen((v) => !v)}
                            >
                                {session.user.image ? (
                                    <img
                                        src={session.user.image}
                                        alt="Avatar"
                                        className="w-8 h-8 rounded-full object-cover border-2 border-blue-600"
                                    />
                                ) : (
                                    <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg uppercase">
                                        {session.user.name?.[0] ||
                                            session.user.email?.[0] ||
                                            "U"}
                                    </span>
                                )}
                                <span className="hidden sm:block max-w-[120px] truncate">
                                    {session.user.name || session.user.email}
                                </span>
                                <svg
                                    width="18"
                                    height="18"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M7 10l5 5 5-5"
                                        stroke="#2563eb"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                            {open && (
                                <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg py-2 z-50 animate-fadeIn">
                                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                                        {session.user.email}
                                    </div>
                                    <Link
                                        href="/dashboard/profile"
                                        className="block px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        onClick={() => {
                                            setOpen(false)
                                            signOut()
                                        }}
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="ml-4 px-4 py-1.5 rounded-lg bg-white text-blue-700 font-semibold shadow hover:bg-blue-100 transition-all"
                        >
                            Login
                        </Link>
                    )}
                </nav>
                {/* Burger menu for mobile */}
                <button
                    className="sm:hidden flex flex-col justify-center items-center w-10 h-10 rounded hover:bg-blue-600 transition relative z-50"
                    onClick={() => setMobileOpen((v) => !v)}
                    aria-label="Open menu"
                >
                    <span
                        className={`block w-6 h-0.5 bg-white rounded transition-all duration-300 ${
                            mobileOpen ? "rotate-45 translate-y-1.5" : ""
                        }`}
                    ></span>
                    <span
                        className={`block w-6 h-0.5 bg-white rounded my-1 transition-all duration-300 ${
                            mobileOpen ? "opacity-0" : ""
                        }`}
                    ></span>
                    <span
                        className={`block w-6 h-0.5 bg-white rounded transition-all duration-300 ${
                            mobileOpen ? "-rotate-45 -translate-y-1.5" : ""
                        }`}
                    ></span>
                </button>
                {/* Mobile menu dropdown */}
                {mobileOpen && (
                    <div
                        ref={mobileMenuRef}
                        className="fixed inset-0 bg-black/40 z-[9999]"
                        tabIndex={-1}
                    >
                        <div
                            className="absolute top-0 right-0 w-64 max-w-full h-full bg-white shadow-lg p-6 animate-slideIn flex flex-col gap-4 focus:outline-none"
                            style={{
                                transition:
                                    "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
                            }}
                        >
                            {/* Tombol close */}
                            <button
                                className="absolute top-3 right-3 text-blue-700 hover:text-red-500 text-2xl font-bold focus:outline-none"
                                onClick={() => setMobileOpen(false)}
                                aria-label="Close menu"
                            >
                                ×
                            </button>
                            <div className="flex items-center gap-2 mb-4 mt-2">
                                <svg
                                    width="28"
                                    height="28"
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
                                <span className="text-blue-700 text-lg font-bold tracking-wide">
                                    PajakApp
                                </span>
                            </div>
                            {navItems.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`block px-3 py-2 rounded-lg font-semibold transition-all duration-200 text-base
                                            ${
                                                isActive
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "text-blue-700 hover:bg-blue-50"
                                            }
                                        `}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                )
                            })}
                            <div className="border-t my-2" />
                            {status === "authenticated" ? (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg uppercase">
                                            {session.user.name?.[0] ||
                                                session.user.email?.[0] ||
                                                "U"}
                                        </span>
                                        <span className="font-semibold text-blue-700 truncate">
                                            {session.user.name ||
                                                session.user.email}
                                        </span>
                                    </div>
                                    <Link
                                        href="/dashboard/profile"
                                        className="block px-3 py-2 rounded-lg text-blue-700 hover:bg-blue-50"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        className="block w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
                                        onClick={() => {
                                            setMobileOpen(false)
                                            signOut()
                                        }}
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="block px-3 py-2 rounded-lg bg-blue-600 text-white font-semibold text-center hover:bg-blue-700 transition-all"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
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

// Footer Component
export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 mt-12">
            <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#2563eb" />
                        <path
                            d="M12 6v6l4 2"
                            stroke="#fff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <span className="text-blue-700 font-bold text-lg">
                        PajakApp
                    </span>
                </div>
                <div className="text-gray-500 text-sm text-center md:text-right">
                    &copy; {new Date().getFullYear()} PajakApp. All rights
                    reserved.
                </div>
                <div className="flex gap-3">
                    <a
                        href="https://github.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 transition-colors"
                        aria-label="GitHub"
                    >
                        <svg
                            width="22"
                            height="22"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.38-2.03 1-2.75-.1-.26-.44-1.3.1-2.7 0 0 .83-.27 2.75 1.03A9.38 9.38 0 0 1 12 6.84c.84.004 1.68.11 2.47.32 1.92-1.3 2.75-1.03 2.75-1.03.54 1.4.2 2.44.1 2.7.62.72 1 1.63 1 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .26.18.57.69.47C19.13 20.57 22 16.75 22 12.26 22 6.58 17.52 2 12 2Z"
                                fill="currentColor"
                            />
                        </svg>
                    </a>
                    <a
                        href="mailto:support@pajakapp.com"
                        className="hover:text-blue-600 transition-colors"
                        aria-label="Email"
                    >
                        <svg
                            width="22"
                            height="22"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M2.25 6.75A2.25 2.25 0 0 1 4.5 4.5h15a2.25 2.25 0 0 1 2.25 2.25v10.5A2.25 2.25 0 0 1 19.5 19.5h-15A2.25 2.25 0 0 1 2.25 17.25V6.75Zm1.5.188v10.312c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75V6.938l-8.25 5.156-8.25-5.156Zm.88-1.438 7.62 4.77a.75.75 0 0 0 .8 0l7.62-4.77a.75.75 0 0 0-.67-.438h-15a.75.75 0 0 0-.67.438Z"
                                fill="currentColor"
                            />
                        </svg>
                    </a>
                </div>
            </div>
        </footer>
    )
}
