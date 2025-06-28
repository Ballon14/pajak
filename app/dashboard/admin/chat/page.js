"use client"
import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import AdminSidebar from "@/app/components/AdminSidebar"
import LoadingSpinner from "@/app/components/LoadingSpinner"
import { useNotification } from "@/app/components/NotificationToast"
import {
    useAdminChatNotification,
    AdminUserList,
} from "@/app/components/AdminChatNotification"

export default function AdminChatPage() {
    const { data: session, status } = useSession()
    const { addNotification } = useNotification()
    const { unreadCount, unreadUsers, clearUnreadForUser } =
        useAdminChatNotification()
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
        try {
            const res = await fetch("/api/chat")
            const data = await res.json()
            setMessages(data)
        } catch (error) {
            console.error("Error fetching messages:", error)
            addNotification("Gagal memuat pesan chat", "error")
        } finally {
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchMessages()
        // Hanya fetch sekali saat komponen mount, tidak perlu polling
        // karena AdminChatNotification sudah handle polling
    }, [])

    useEffect(() => {
        if (chatContainerRef.current) {
            // Auto scroll ke bawah dengan smooth animation
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: "smooth",
            })
        }
    }, [messages, selectedUser, refreshing])

    // Dapatkan daftar user unik dari pesan
    const users = Array.from(
        messages
            .reduce((acc, msg) => {
                if (msg.email) {
                    acc.set(msg.email, {
                        email: msg.email,
                        userId: msg.userId,
                        lastMessage: msg.message,
                        lastMessageTime: msg.time,
                        from: msg.from,
                    })
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

    // Clear unread status ketika user dipilih
    const handleUserSelect = (user) => {
        setSelectedUser(user)
        clearUnreadForUser(user.email)

        // Auto scroll ke pesan terakhir setelah user dipilih
        setTimeout(() => {
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop =
                    chatContainerRef.current.scrollHeight
            }
        }, 100)
    }

    const handleSend = async (e) => {
        e.preventDefault()
        if (input.trim() === "" || !selectedUser) return
        setLoading(true)
        try {
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
            await fetchMessages()
            addNotification("Pesan terkirim!", "success")

            // Auto scroll ke pesan terakhir setelah kirim pesan
            setTimeout(() => {
                if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTop =
                        chatContainerRef.current.scrollHeight
                }
            }, 100)
        } catch (error) {
            addNotification("Gagal mengirim pesan!", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteChat = async () => {
        if (!selectedUser) return
        if (!confirm(`Hapus semua chat dengan ${selectedUser.email}?`)) return
        try {
            await fetch("/api/chat", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: selectedUser.userId,
                    email: selectedUser.email,
                }),
            })
            setSelectedUser(null)
            await fetchMessages()
            addNotification("Chat berhasil dihapus!", "success")
        } catch (error) {
            addNotification("Gagal menghapus chat!", "error")
        }
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
                            transition: "margin-left 0.3s ease",
                            paddingBottom: 0,
                        }}
                    >
                        <div
                            style={{
                                maxWidth: isMobile ? "100%" : 900,
                                margin: isMobile ? "20px 10px" : "40px auto",
                                background: "#fff",
                                borderRadius: isMobile ? 8 : 12,
                                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                                minHeight: isMobile
                                    ? "calc(100vh - 40px)"
                                    : 500,
                                display: "flex",
                                flexDirection: isMobile ? "column" : "row",
                                height: isMobile
                                    ? "auto"
                                    : "calc(100vh - 80px)",
                            }}
                        >
                            {/* Sidebar user chat */}
                            <div
                                style={{
                                    width: isMobile ? "100%" : 220,
                                    borderRight: isMobile
                                        ? "none"
                                        : "1px solid #eee",
                                    borderBottom: isMobile
                                        ? "1px solid #eee"
                                        : "none",
                                    padding: 0,
                                    background: "#f7f8fa",
                                    borderRadius: isMobile
                                        ? "8px 8px 0 0"
                                        : "12px 0 0 12px",
                                    minWidth: isMobile ? "auto" : 180,
                                    maxHeight: isMobile ? "200px" : "none",
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight: 600,
                                        color: "#2563eb",
                                        fontSize: isMobile ? 16 : 17,
                                        padding: isMobile
                                            ? "16px 16px 8px 16px"
                                            : "18px 0 10px 24px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <span>Daftar User</span>
                                    {unreadCount > 0 && (
                                        <span
                                            style={{
                                                background: "#ef4444",
                                                color: "white",
                                                borderRadius: "50%",
                                                width: isMobile ? 18 : 20,
                                                height: isMobile ? 18 : 20,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: isMobile ? 10 : 11,
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div
                                    style={{
                                        maxHeight: isMobile ? "140px" : 470,
                                        overflowY: "auto",
                                    }}
                                >
                                    {users.length === 0 ? (
                                        <div
                                            style={{
                                                color: "#888",
                                                textAlign: "center",
                                                marginTop: isMobile ? 20 : 40,
                                                padding: isMobile
                                                    ? "0 16px"
                                                    : 0,
                                            }}
                                        >
                                            Belum ada user
                                        </div>
                                    ) : (
                                        <AdminUserList
                                            users={users}
                                            unreadUsers={unreadUsers}
                                            onUserSelect={handleUserSelect}
                                            selectedUser={selectedUser}
                                        />
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
                                    minWidth: isMobile ? "auto" : 200,
                                    height: isMobile ? "auto" : "100%",
                                    minHeight: isMobile ? "400px" : "auto",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: isMobile
                                            ? "16px 16px"
                                            : "18px 24px",
                                        borderBottom: "1px solid #eee",
                                        fontWeight: 600,
                                        color: "#2563eb",
                                        fontSize: isMobile ? 16 : 17,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: isMobile ? 8 : 12,
                                        }}
                                    >
                                        {selectedUser && (
                                            <button
                                                onClick={() =>
                                                    setSelectedUser(null)
                                                }
                                                style={{
                                                    background: "#f3f4f6",
                                                    color: "#6b7280",
                                                    border: "none",
                                                    borderRadius: "50%",
                                                    width: isMobile ? 32 : 36,
                                                    height: isMobile ? 32 : 36,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    cursor: "pointer",
                                                    fontSize: isMobile
                                                        ? 16
                                                        : 18,
                                                    transition: "all 0.2s",
                                                    boxShadow:
                                                        "0 1px 3px rgba(0,0,0,0.1)",
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.background =
                                                        "#e5e7eb"
                                                    e.target.style.transform =
                                                        "scale(1.05)"
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.background =
                                                        "#f3f4f6"
                                                    e.target.style.transform =
                                                        "scale(1)"
                                                }}
                                                title="Kembali ke daftar user"
                                            >
                                                ←
                                            </button>
                                        )}
                                        <span
                                            style={{
                                                fontSize: isMobile ? 14 : 17,
                                                maxWidth: isMobile
                                                    ? "200px"
                                                    : "none",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {selectedUser
                                                ? `Chat dengan: ${selectedUser.email}`
                                                : "Pilih user untuk melihat chat"}
                                        </span>
                                    </div>
                                    {selectedUser && (
                                        <button
                                            onClick={handleDeleteChat}
                                            style={{
                                                background: "#ef4444",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: 6,
                                                padding: isMobile
                                                    ? "6px 12px"
                                                    : "6px 16px",
                                                fontWeight: 600,
                                                fontSize: isMobile ? 12 : 14,
                                                cursor: "pointer",
                                                marginLeft: isMobile ? 8 : 12,
                                            }}
                                        >
                                            {isMobile ? "Hapus" : "Hapus Chat"}
                                        </button>
                                    )}
                                </div>
                                <div
                                    ref={chatContainerRef}
                                    style={{
                                        flex: 1,
                                        overflowY: "auto",
                                        padding: isMobile ? 16 : 24,
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
                                                marginTop: isMobile ? 20 : 40,
                                            }}
                                        >
                                            Pilih user untuk melihat chat
                                        </div>
                                    ) : userMessages.length === 0 ? (
                                        <div
                                            style={{
                                                color: "#888",
                                                textAlign: "center",
                                                marginTop: isMobile ? 20 : 40,
                                            }}
                                        >
                                            Belum ada pesan
                                        </div>
                                    ) : (
                                        userMessages.map((msg, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    marginBottom: isMobile
                                                        ? 10
                                                        : 14,
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
                                                        borderRadius: isMobile
                                                            ? 6
                                                            : 8,
                                                        padding: isMobile
                                                            ? "6px 12px"
                                                            : "8px 14px",
                                                        maxWidth: isMobile
                                                            ? "85%"
                                                            : "80%",
                                                        fontSize: isMobile
                                                            ? 14
                                                            : 15,
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
                                                        fontSize: isMobile
                                                            ? 10
                                                            : 11,
                                                        color: "#888",
                                                        marginLeft: isMobile
                                                            ? 4
                                                            : 8,
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
                                            gap: isMobile ? 6 : 8,
                                            padding: isMobile ? 12 : 18,
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
                                                padding: isMobile ? 8 : 10,
                                                borderRadius: isMobile ? 4 : 6,
                                                border: "1px solid #ccc",
                                                fontSize: isMobile ? 14 : 15,
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
                                                borderRadius: isMobile ? 4 : 6,
                                                padding: isMobile
                                                    ? "0 12px"
                                                    : "0 18px",
                                                cursor: loading
                                                    ? "not-allowed"
                                                    : "pointer",
                                                opacity: loading ? 0.7 : 1,
                                                fontSize: isMobile ? 13 : 15,
                                                fontWeight: 600,
                                            }}
                                            disabled={loading}
                                        >
                                            {loading
                                                ? "..."
                                                : isMobile
                                                ? "Kirim"
                                                : "Kirim"}
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
                
                @media (max-width: 768px) {
                    main { 
                        margin-left: 0 !important; 
                        padding: 0 !important;
                    }
                    .sidebar { 
                        width: 0 !important; 
                    }
                }
                
                @media (max-width: 480px) {
                    main {
                        margin: 10px 5px !important;
                    }
                }
            `}</style>
        </>
    )
}
