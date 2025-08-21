"use client"
import { useEffect, useState } from "react"

export default function ThemeToggle({ className = "" }) {
    const [isDark, setIsDark] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        try {
            const stored = localStorage.getItem("theme")
            const prefersDark =
                window.matchMedia &&
                window.matchMedia("(prefers-color-scheme: dark)").matches
            const shouldDark = stored ? stored === "dark" : prefersDark
            setIsDark(shouldDark)
            document.documentElement.classList.toggle("theme-dark", shouldDark)
        } catch {}
    }, [])

    function toggleTheme() {
        const next = !isDark
        setIsDark(next)
        document.documentElement.classList.toggle("theme-dark", next)
        try {
            localStorage.setItem("theme", next ? "dark" : "light")
        } catch {}
    }

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <button
                className={`flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 transition-all duration-300 ${className}`}
                disabled
            >
                <div className="w-5 h-5 bg-slate-300 rounded-full animate-pulse" />
            </button>
        )
    }

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`group flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                isDark
                    ? "bg-slate-800 border border-slate-700 text-yellow-400 hover:bg-slate-700 shadow-lg shadow-slate-900/20"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-lg shadow-slate-900/10"
            } ${className}`}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light Mode" : "Dark Mode"}
        >
            <div className="relative w-5 h-5 overflow-hidden">
                {/* Sun Icon */}
                <div
                    className={`absolute inset-0 transition-all duration-500 transform ${
                        isDark
                            ? "rotate-90 scale-0 opacity-0"
                            : "rotate-0 scale-100 opacity-100"
                    }`}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-yellow-500"
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="4"
                            fill="currentColor"
                            className="animate-pulse"
                        />
                        <path
                            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="group-hover:stroke-yellow-400 transition-colors duration-300"
                        />
                    </svg>
                </div>

                {/* Moon Icon */}
                <div
                    className={`absolute inset-0 transition-all duration-500 transform ${
                        isDark
                            ? "rotate-0 scale-100 opacity-100"
                            : "-rotate-90 scale-0 opacity-0"
                    }`}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-blue-400"
                    >
                        <path
                            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                            fill="currentColor"
                            className="group-hover:fill-blue-300 transition-colors duration-300"
                        />
                        <circle
                            cx="16"
                            cy="8"
                            r="1"
                            fill="white"
                            className="animate-pulse"
                            style={{ animationDelay: "0.5s" }}
                        />
                        <circle
                            cx="18"
                            cy="12"
                            r="0.5"
                            fill="white"
                            className="animate-pulse"
                            style={{ animationDelay: "1s" }}
                        />
                        <circle
                            cx="15"
                            cy="14"
                            r="0.5"
                            fill="white"
                            className="animate-pulse"
                            style={{ animationDelay: "1.5s" }}
                        />
                    </svg>
                </div>
            </div>

            {/* Ripple effect */}
            <div
                className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                    isDark
                        ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100"
                        : "bg-gradient-to-r from-yellow-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100"
                }`}
            />
        </button>
    )
}

// Compact version for sidebar
export function CompactThemeToggle({ className = "" }) {
    const [isDark, setIsDark] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        try {
            const stored = localStorage.getItem("theme")
            const prefersDark =
                window.matchMedia &&
                window.matchMedia("(prefers-color-scheme: dark)").matches
            const shouldDark = stored ? stored === "dark" : prefersDark
            setIsDark(shouldDark)
            document.documentElement.classList.toggle("theme-dark", shouldDark)
        } catch {}
    }, [])

    function toggleTheme() {
        const next = !isDark
        setIsDark(next)
        document.documentElement.classList.toggle("theme-dark", next)
        try {
            localStorage.setItem("theme", next ? "dark" : "light")
        } catch {}
    }

    if (!mounted) {
        return (
            <button
                className={`w-8 h-8 rounded-lg bg-slate-700 animate-pulse ${className}`}
                disabled
            />
        )
    }

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`group w-8 h-8 rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center ${
                isDark
                    ? "bg-slate-700 hover:bg-slate-600 text-yellow-400"
                    : "bg-slate-600 hover:bg-slate-500 text-yellow-300"
            } ${className}`}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="4" fill="currentColor" />
                    <path
                        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                        fill="currentColor"
                    />
                </svg>
            )}
        </button>
    )
}
