"use client"
import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import AdminSidebar from "@/app/components/AdminSidebar"
import LoadingSpinner from "@/app/components/LoadingSpinner"

export default function AdminChatPage() {
    const { data: session, status } = useSession()
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [isMobile, setIsMobile] = useState(false)
    const chatContainerRef = useRef(null)

    useEffect(() => {
        function handleResize() {
            setIsMobile(window.innerWidth < 768)
            if (window.innerWidth < 768) setSidebarOpen(false)
            else setSidebarOpen(true)
        }
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    const fetchMessages = async () => {
        setRefreshing(true)
        const res = await fetch("/api/chat")
        const data = await res.json()
        setMessages(data)
        setRefreshing(false)
    }

    useEffect(() => {
        fetchMessages()
        // Polling setiap 10 detik
        const interval = setInterval(fetchMessages, 10000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight
        }
    }, [messages.length, refreshing])

    // Dapatkan daftar user unik dari pesan
    const users = Array.from(
        messages
            .reduce((acc, msg) => {
                if (msg.email) {
                    acc.set(msg.email, { email: msg.email, userId: msg.userId })
                }
                return acc
            }, new Map())
            .values()
    )

    // Filter pesan untuk user yang dipilih
    const userMessages = selectedUser
        ? messages.filter(
              (msg) =>
                  msg.email === selectedUser.email ||
                  msg.userId === selectedUser.userId
          )
        : []

    const handleSend = async (e) => {
        e.preventDefault()
        if (input.trim() === "" || !selectedUser) return
        setLoading(true)
        await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: input,
                from: "admin",
                email: selectedUser.email,
                userId: selectedUser.userId,
            }),
        })
        setInput("")
        setLoading(false)
        fetchMessages()
    }

    const handleDeleteChat = async () => {
        if (!selectedUser) return
        if (!confirm(`Hapus semua chat dengan ${selectedUser.email}?`)) return
        await fetch("/api/chat", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: selectedUser.userId,
                email: selectedUser.email,
            }),
        })
        setSelectedUser(null)
        fetchMessages()
    }

    return (
        <>
            {status === "loading" ? (
                <LoadingSpinner text="Memuat data chat..." />
            ) : !session || session.user.role !== "admin" ? (
                <div
                    style={{ color: "red", textAlign: "center", marginTop: 40 }}
                >
                    Akses ditolak. Halaman ini hanya untuk admin.
                </div>
            ) : (
                <div style={{ display: "flex" }}>
                    <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
                    <main
                        style={{
                            marginLeft: isMobile ? 0 : sidebarOpen ? 230 : 60,
                            width: "100%",
                            minHeight: "100vh",
                            background: "#f7f8fa",
                            transition: "margin-left 1s",
                            paddingBottom: 0,
                        }}
                    >
                        <div
                            style={{
                                maxWidth: 900,
                                margin: "40px auto",
                                background: "#fff",
                                borderRadius: 12,
                                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                                minHeight: 500,
                                display: "flex",
                                flexDirection: "row",
                                height: "calc(100vh - 80px)",
                            }}
                        >
                            {/* Sidebar user chat */}
                            <div
                                style={{
                                    width: 220,
                                    borderRight: "1px solid #eee",
                                    padding: 0,
                                    background: "#f7f8fa",
                                    borderRadius: "12px 0 0 12px",
                                    minWidth: 180,
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight: 600,
                                        color: "#2563eb",
                                        fontSize: 17,
                                        padding: "18px 0 10px 24px",
                                    }}
                                >
                                    Daftar User
                                </div>
                                <div
                                    style={{
                                        maxHeight: 470,
                                        overflowY: "auto",
                                    }}
                                >
                                    {users.length === 0 ? (
                                        <div
                                            style={{
                                                color: "#888",
                                                textAlign: "center",
                                                marginTop: 40,
                                            }}
                                        >
                                            Belum ada user
                                        </div>
                                    ) : (
                                        users.map((user, idx) => (
                                            <div
                                                key={user.email || idx}
                                                onClick={() =>
                                                    setSelectedUser(user)
                                                }
                                                style={{
                                                    padding: "12px 24px",
                                                    cursor: "pointer",
                                                    background:
                                                        selectedUser &&
                                                        selectedUser.email ===
                                                            user.email
                                                            ? "#e0e7ff"
                                                            : "transparent",
                                                    color:
                                                        selectedUser &&
                                                        selectedUser.email ===
                                                            user.email
                                                            ? "#2563eb"
                                                            : "#222",
                                                    borderLeft:
                                                        selectedUser &&
                                                        selectedUser.email ===
                                                            user.email
                                                            ? "4px solid #2563eb"
                                                            : "4px solid transparent",
                                                    fontWeight:
                                                        selectedUser &&
                                                        selectedUser.email ===
                                                            user.email
                                                            ? 600
                                                            : 400,
                                                }}
                                            >
                                                {user.email}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            {/* Chat area */}
                            <div
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    padding: 0,
                                    minWidth: 200,
                                    height: "100%",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "18px 24px",
                                        borderBottom: "1px solid #eee",
                                        fontWeight: 600,
                                        color: "#2563eb",
                                        fontSize: 17,
                                    }}
                                >
                                    <span>
                                        {selectedUser
                                            ? `Chat dengan: ${selectedUser.email}`
                                            : "Pilih user untuk melihat chat"}
                                    </span>
                                    {selectedUser && (
                                        <button
                                            onClick={handleDeleteChat}
                                            style={{
                                                background: "#ef4444",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: 6,
                                                padding: "6px 16px",
                                                fontWeight: 600,
                                                fontSize: 14,
                                                cursor: "pointer",
                                                marginLeft: 12,
                                            }}
                                        >
                                            Hapus Chat
                                        </button>
                                    )}
                                </div>
                                <div
                                    ref={chatContainerRef}
                                    style={{
                                        flex: 1,
                                        overflowY: "auto",
                                        padding: 24,
                                        background: "#fafbfc",
                                        minHeight: 0,
                                    }}
                                >
                                    {refreshing ? (
                                        <div
                                            style={{
                                                color: "#888",
                                                textAlign: "center",
                                            }}
                                        >
                                            Memuat pesan...
                                        </div>
                                    ) : !selectedUser ? (
                                        <div
                                            style={{
                                                color: "#888",
                                                textAlign: "center",
                                                marginTop: 40,
                                            }}
                                        >
                                            Pilih user untuk melihat chat
                                        </div>
                                    ) : userMessages.length === 0 ? (
                                        <div
                                            style={{
                                                color: "#888",
                                                textAlign: "center",
                                                marginTop: 40,
                                            }}
                                        >
                                            Belum ada pesan
                                        </div>
                                    ) : (
                                        userMessages.map((msg, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    marginBottom: 14,
                                                    textAlign:
                                                        msg.from === "admin"
                                                            ? "right"
                                                            : "left",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        background:
                                                            msg.from === "admin"
                                                                ? "#2563eb"
                                                                : "#eee",
                                                        color:
                                                            msg.from === "admin"
                                                                ? "white"
                                                                : "#222",
                                                        borderRadius: 8,
                                                        padding: "8px 14px",
                                                        maxWidth: "80%",
                                                        fontSize: 15,
                                                    }}
                                                >
                                                    <b>
                                                        {msg.from === "admin"
                                                            ? "Admin"
                                                            : "User"}
                                                        :
                                                    </b>{" "}
                                                    {msg.message}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#888",
                                                        marginLeft: 8,
                                                    }}
                                                >
                                                    {msg.time
                                                        ? new Date(
                                                              msg.time
                                                          ).toLocaleString()
                                                        : ""}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {/* Form balasan */}
                                {selectedUser && (
                                    <form
                                        onSubmit={handleSend}
                                        style={{
                                            display: "flex",
                                            gap: 8,
                                            padding: 18,
                                            borderTop: "1px solid #eee",
                                            background: "#fff",
                                        }}
                                    >
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) =>
                                                setInput(e.target.value)
                                            }
                                            placeholder="Tulis balasan..."
                                            style={{
                                                flex: 1,
                                                padding: 10,
                                                borderRadius: 6,
                                                border: "1px solid #ccc",
                                                fontSize: 15,
                                                color: "#222",
                                            }}
                                            disabled={loading}
                                            className="chat-input-black-placeholder"
                                        />
                                        <button
                                            type="submit"
                                            style={{
                                                background: "#2563eb",
                                                color: "white",
                                                border: "none",
                                                borderRadius: 6,
                                                padding: "0 18px",
                                                cursor: loading
                                                    ? "not-allowed"
                                                    : "pointer",
                                                opacity: loading ? 0.7 : 1,
                                            }}
                                            disabled={loading}
                                        >
                                            {loading ? "..." : "Kirim"}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            )}
            <style>{`
                .chat-input-black-placeholder::placeholder { color: #222 !important; opacity: 1; }
                @media (max-width: 900px) {
                    main { margin-left: 60px !important; }
                }
                @media (max-width: 768px) {
                    main { margin-left: 0 !important; padding: 0 2vw !important; }
                    .sidebar { width: 0 !important; }
                    table { font-size: 13px !important; }
                    th, td { padding: 8px !important; }
                }
                @media (max-width: 500px) {
                    main { padding: 0 1vw !important; }
                    h1, h3 { font-size: 17px !important; }
                }
            `}</style>
        </>
    )
}
