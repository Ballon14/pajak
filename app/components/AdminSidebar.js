import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { signOut } from "next-auth/react"

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
    const sidebarRef = useRef(null)

    // Responsif: auto collapse di mobile
    useEffect(() => {
        function handleResize() {
            setIsMobile(window.innerWidth < 768)
            if (window.innerWidth < 768) setOpen(false)
            else setOpen(true)
        }
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

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
    }, [open, isMobile])

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
                    top: 32,
                    left: 0,
                    zIndex: 201,
                    background: "#1e3a8a",
                    color: "#fff",
                    border: "none",
                    borderRadius: "0 8px 8px 0",
                    width: 36,
                    height: 56,
                    fontSize: 28,
                    boxShadow: "2px 0 8px #1e3a8a22",
                    cursor: "pointer",
                    transition: "background 0.2s, color 0.2s",
                }}
                aria-label="Buka menu"
            >
                &gt;
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
                        background: "#0007",
                        zIndex: 99,
                        transition: "opacity 0.2s",
                    }}
                />
            )}
            {/* Tombol collapse (<) di luar sidebar */}
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
                    boxShadow: "2px 0 8px #1e3a8a22",
                    cursor: "pointer",
                    transition: "background 0.2s, color 0.2s",
                    display: open ? "block" : "none",
                }}
                aria-label="Tutup menu"
            >
                &lt;
            </button>
            <aside
                ref={sidebarRef}
                style={{
                    width: open ? 230 : 60,
                    minHeight: "100vh",
                    background: "#1e3a8a",
                    color: "#fff",
                    padding: open ? "32px 0 0 0" : "18px 0 0 0",
                    position: "fixed",
                    left: 0,
                    top: 0,
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "2px 0 12px #1e3a8a22",
                    zIndex: 120,
                    justifyContent: "space-between",
                    transition:
                        "width 1s cubic-bezier(.4,1.2,.4,1), padding 0.18s",
                    alignItems: open ? "stretch" : "center",
                    overflow: "hidden",
                }}
            >
                <div>
                    <div
                        style={{
                            fontWeight: 800,
                            fontSize: 22,
                            textAlign: open ? "center" : "left",
                            marginBottom: open ? 36 : 0,
                            letterSpacing: 1,
                            display: open ? "block" : "none",
                            opacity: open ? 1 : 0,
                            transition: "opacity 1s",
                        }}
                    >
                        Admin Panel
                    </div>
                    <nav
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                            alignItems: open ? "stretch" : "center",
                        }}
                    >
                        {menus.map((menu) => {
                            const isActive = menu.href === pathname
                            return (
                                <Link
                                    key={menu.href}
                                    href={menu.href}
                                    style={{
                                        ...navStyle,
                                        background: isActive
                                            ? "#2563eb"
                                            : "none",
                                        color: isActive ? "#fff" : "#c7d2fe",
                                        justifyContent: open
                                            ? "flex-start"
                                            : "center",
                                        padding: open ? "14px 28px" : "14px 0",
                                        fontSize: open ? 17 : 22,
                                        width: open ? "auto" : 44,
                                        minWidth: open ? 0 : 44,
                                        position: "relative",
                                        transition:
                                            "background 0.18s, color 0.18s, padding 0.18s, font-size 0.18s, width 1s cubic-bezier(.4,1.2,.4,1)",
                                    }}
                                    tabIndex={0}
                                >
                                    <span
                                        style={{
                                            marginRight: open ? 12 : 0,
                                            fontSize: 22,
                                            transition: "margin 0.18s",
                                        }}
                                    >
                                        {menu.icon}
                                    </span>
                                    <span
                                        style={{
                                            opacity: open ? 1 : 0,
                                            maxWidth: open ? 200 : 0,
                                            overflow: "hidden",
                                            whiteSpace: "nowrap",
                                            transition:
                                                "opacity 1s, max-width 1s",
                                            pointerEvents: open
                                                ? "auto"
                                                : "none",
                                        }}
                                    >
                                        {menu.label}
                                    </span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        ...navStyle,
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        margin: open ? 24 : 0,
                        marginTop: 32,
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: open ? 16 : 22,
                        boxShadow: "0 2px 8px #ef444422",
                        width: open ? "auto" : 44,
                        minWidth: open ? 0 : 44,
                        justifyContent: open ? "flex-start" : "center",
                        transition:
                            "background 0.18s, color 0.18s, font-size 0.18s, width 1s cubic-bezier(.4,1.2,.4,1)",
                    }}
                    aria-label="Logout"
                >
                    <span
                        style={{
                            fontSize: 22,
                            marginRight: open ? 10 : 0,
                            transition: "margin 0.18s",
                        }}
                    >
                        🚪
                    </span>
                    <span
                        style={{
                            opacity: open ? 1 : 0,
                            transition: "opacity 1s",
                        }}
                    >
                        {open && "Logout"}
                    </span>
                </button>
            </aside>
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
