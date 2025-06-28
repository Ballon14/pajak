import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { signOut } from "next-auth/react"
import { useAdminChatNotification } from "./AdminChatNotification"

const menus = [
    { label: "Dashboard", href: "/dashboard/admin", icon: "🏠" },
    { label: "Listing User", href: "/dashboard/admin/user", icon: "👤" },
    { label: "Listing Pajak", href: "/dashboard/admin/tax", icon: "📄" },
    { label: "Listing Chat", href: "/dashboard/admin/chat", icon: "💬" },
]

export default function AdminSidebar({ open, setOpen }) {
    const pathname = usePathname()
    const router = useRouter()
    const [isMobile, setIsMobile] = useState(false)
    const { unreadCount } = useAdminChatNotification()
    const sidebarRef = useRef(null)

    // Responsif: auto collapse di mobile
    useEffect(() => {
        function handleResize() {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)
            if (mobile) {
                setOpen(false)
            } else {
                setOpen(true)
            }
        }
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [setOpen])

    // Close sidebar jika klik di luar (mobile)
    useEffect(() => {
        if (!open || !isMobile) return
        function handleClick(e) {
            if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [open, isMobile, setOpen])

    const handleLogout = async () => {
        // Optional: tambahkan konfirmasi
        await signOut({ callbackUrl: "/login" })
    }

    // Tombol expand (>) di luar sidebar saat sidebar tertutup
    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                style={{
                    position: "fixed",
                    top: 20,
                    left: 10,
                    zIndex: 201,
                    background: "#1e3a8a",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: 44,
                    height: 44,
                    fontSize: 20,
                    boxShadow: "0 4px 12px rgba(30,58,138,0.3)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                    e.target.style.transform = "scale(1.1)"
                    e.target.style.boxShadow = "0 6px 16px rgba(30,58,138,0.4)"
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)"
                    e.target.style.boxShadow = "0 4px 12px rgba(30,58,138,0.3)"
                }}
                aria-label="Buka menu"
            >
                ☰
            </button>
        )
    }

    return (
        <>
            {/* Overlay di mobile */}
            {isMobile && open && (
                <div
                    onClick={() => setOpen(false)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0,0,0,0.5)",
                        zIndex: 99,
                        transition: "opacity 0.3s ease",
                    }}
                />
            )}
            {/* Tombol collapse (X) di mobile */}
            {isMobile && (
                <button
                    onClick={() => setOpen(false)}
                    style={{
                        position: "fixed",
                        top: 20,
                        right: 20,
                        zIndex: 202,
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: 44,
                        height: 44,
                        fontSize: 20,
                        boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.1)"
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)"
                    }}
                    aria-label="Tutup menu"
                >
                    ✕
                </button>
            )}

            {/* Tombol collapse untuk desktop */}
            {!isMobile && open && (
                <button
                    onClick={() => setOpen(false)}
                    style={{
                        position: "fixed",
                        top: 32,
                        left: 230,
                        zIndex: 201,
                        background: "#1e3a8a",
                        color: "#fff",
                        border: "none",
                        borderRadius: "0 8px 8px 0",
                        width: 36,
                        height: 56,
                        fontSize: 28,
                        boxShadow: "2px 0 8px rgba(30,58,138,0.3)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.05)"
                        e.target.style.boxShadow =
                            "2px 0 12px rgba(30,58,138,0.4)"
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)"
                        e.target.style.boxShadow =
                            "2px 0 8px rgba(30,58,138,0.3)"
                    }}
                    aria-label="Tutup sidebar"
                >
                    &lt;
                </button>
            )}
            <aside
                ref={sidebarRef}
                style={{
                    width: isMobile ? "280px" : open ? 230 : 60,
                    minHeight: "100vh",
                    background: "#1e3a8a",
                    color: "#fff",
                    padding: isMobile
                        ? "32px 0 0 0"
                        : open
                        ? "32px 0 0 0"
                        : "18px 0 0 0",
                    position: "fixed",
                    left: 0,
                    top: 0,
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "2px 0 12px rgba(30,58,138,0.3)",
                    zIndex: 120,
                    justifyContent: "space-between",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    alignItems: isMobile
                        ? "stretch"
                        : open
                        ? "stretch"
                        : "center",
                    overflow: "hidden",
                    transform:
                        isMobile && !open
                            ? "translateX(-100%)"
                            : "translateX(0)",
                }}
            >
                <div>
                    <div
                        style={{
                            fontWeight: 800,
                            fontSize: isMobile ? 24 : 22,
                            textAlign: "center",
                            marginBottom: isMobile ? 40 : 36,
                            letterSpacing: 1,
                            display: isMobile
                                ? "block"
                                : open
                                ? "block"
                                : "none",
                            opacity: isMobile ? 1 : open ? 1 : 0,
                            transition: "opacity 0.3s ease",
                        }}
                    >
                        Admin Panel
                    </div>
                    <nav
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: isMobile ? 8 : 6,
                            alignItems: "stretch",
                        }}
                    >
                        {menus.map((menu, index) => {
                            const isActive = menu.href === pathname
                            const isChatMenu =
                                menu.href === "/dashboard/admin/chat"

                            return (
                                <div key={menu.href}>
                                    <Link
                                        href={menu.href}
                                        onClick={() =>
                                            isMobile && setOpen(false)
                                        }
                                        style={{
                                            ...navStyle,
                                            background: isActive
                                                ? "#2563eb"
                                                : "none",
                                            color: isActive
                                                ? "#fff"
                                                : "#c7d2fe",
                                            justifyContent: "flex-start",
                                            padding: isMobile
                                                ? "16px 24px"
                                                : open
                                                ? "14px 28px"
                                                : "14px 0",
                                            fontSize: isMobile
                                                ? 18
                                                : open
                                                ? 17
                                                : 22,
                                            width: "auto",
                                            minWidth: 0,
                                            position: "relative",
                                            transition: "all 0.2s ease",
                                            borderRadius: isMobile ? 12 : 10,
                                            margin: isMobile ? "0 12px" : "0",
                                        }}
                                        tabIndex={0}
                                    >
                                        <span
                                            style={{
                                                marginRight: isMobile
                                                    ? 16
                                                    : open
                                                    ? 12
                                                    : 0,
                                                fontSize: isMobile ? 24 : 22,
                                                transition: "margin 0.2s ease",
                                                position: "relative",
                                            }}
                                        >
                                            {menu.icon}
                                            {/* Badge notifikasi untuk chat */}
                                            {isChatMenu && unreadCount > 0 && (
                                                <span
                                                    style={{
                                                        position: "absolute",
                                                        top: -8,
                                                        right: -8,
                                                        background: "#ef4444",
                                                        color: "white",
                                                        borderRadius: "50%",
                                                        width: isMobile
                                                            ? 20
                                                            : 18,
                                                        height: isMobile
                                                            ? 20
                                                            : 18,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        fontSize: isMobile
                                                            ? 11
                                                            : 10,
                                                        fontWeight: "bold",
                                                        animation:
                                                            "pulse 2s infinite",
                                                    }}
                                                >
                                                    {unreadCount > 99
                                                        ? "99+"
                                                        : unreadCount}
                                                </span>
                                            )}
                                        </span>
                                        <span
                                            style={{
                                                opacity: isMobile
                                                    ? 1
                                                    : open
                                                    ? 1
                                                    : 0,
                                                maxWidth: isMobile
                                                    ? "none"
                                                    : open
                                                    ? 200
                                                    : 0,
                                                overflow: "hidden",
                                                whiteSpace: "nowrap",
                                                transition: "all 0.3s ease",
                                                pointerEvents: isMobile
                                                    ? "auto"
                                                    : open
                                                    ? "auto"
                                                    : "none",
                                                fontWeight: isMobile
                                                    ? 600
                                                    : 600,
                                            }}
                                        >
                                            {menu.label}
                                        </span>
                                    </Link>

                                    {/* Logout button after Listing Chat menu */}
                                    {isChatMenu && (
                                        <>
                                            <div
                                                style={{
                                                    height: "1px",
                                                    background: "#374151",
                                                    margin: isMobile
                                                        ? "16px 12px"
                                                        : open
                                                        ? "16px 28px"
                                                        : "16px 0",
                                                    opacity: 0.3,
                                                }}
                                            />
                                            <button
                                                onClick={handleLogout}
                                                style={{
                                                    ...navStyle,
                                                    background: "#ef4444",
                                                    color: "#fff",
                                                    border: "none",
                                                    margin: isMobile
                                                        ? "0 12px"
                                                        : open
                                                        ? "0 28px"
                                                        : "0",
                                                    cursor: "pointer",
                                                    fontWeight: 700,
                                                    fontSize: isMobile
                                                        ? 18
                                                        : open
                                                        ? 16
                                                        : 22,
                                                    boxShadow:
                                                        "0 2px 8px rgba(239,68,68,0.3)",
                                                    width: "auto",
                                                    minWidth: 0,
                                                    justifyContent:
                                                        "flex-start",
                                                    transition: "all 0.2s ease",
                                                    borderRadius: isMobile
                                                        ? 12
                                                        : 10,
                                                    padding: isMobile
                                                        ? "16px 24px"
                                                        : open
                                                        ? "14px 28px"
                                                        : "14px 0",
                                                }}
                                                aria-label="Logout"
                                            >
                                                <span
                                                    style={{
                                                        fontSize: isMobile
                                                            ? 24
                                                            : 22,
                                                        marginRight: isMobile
                                                            ? 16
                                                            : open
                                                            ? 12
                                                            : 0,
                                                        transition:
                                                            "margin 0.2s ease",
                                                    }}
                                                >
                                                    🚪
                                                </span>
                                                <span
                                                    style={{
                                                        opacity: isMobile
                                                            ? 1
                                                            : open
                                                            ? 1
                                                            : 0,
                                                        transition:
                                                            "opacity 0.3s ease",
                                                    }}
                                                >
                                                    {isMobile || open
                                                        ? "Logout"
                                                        : ""}
                                                </span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            )
                        })}
                    </nav>
                </div>
            </aside>

            <style jsx>{`
                @keyframes pulse {
                    0% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                    100% {
                        transform: scale(1);
                    }
                }

                @media (max-width: 768px) {
                    aside {
                        width: 280px !important;
                    }
                }
            `}</style>
        </>
    )
}

const navStyle = {
    borderRadius: 10,
    fontWeight: 600,
    color: "#c7d2fe",
    textDecoration: "none",
    background: "none",
    cursor: "pointer",
    margin: 0,
    textAlign: "left",
    outline: "none",
    display: "flex",
    alignItems: "center",
    gap: 8,
}
