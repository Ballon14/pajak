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
    const [deleting, setDeleting] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [isMobile, setIsMobile] = useState(false)
    const [showNewChatModal, setShowNewChatModal] = useState(false)
    const [newChatMessage, setNewChatMessage] = useState("")
    const [sendingNewChat, setSendingNewChat] = useState(false)
    const [databaseUsers, setDatabaseUsers] = useState([])
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

    const fetchDatabaseUsers = async () => {
        try {
            const res = await fetch("/api/admin/users")
            const data = await res.json()
            if (data.success) {
                setDatabaseUsers(data.users)
            }
        } catch (error) {
            console.error("Error fetching database users:", error)
        }
    }

    useEffect(() => {
        fetchMessages()
        fetchDatabaseUsers()
        // Polling setiap 5 detik
        const interval = setInterval(() => {
            fetchMessages()
        }, 5000)
        return () => clearInterval(interval)
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
        if (!selectedUser) {
            console.log("No selected user")
            addNotification("Tidak ada user yang dipilih", "error")
            return
        }

        if (!selectedUser.email) {
            console.log("No email for selected user")
            addNotification("Data user tidak lengkap", "error")
            return
        }

        console.log("Attempting to delete chat for:", selectedUser)

        if (!confirm(`Hapus semua chat dengan ${selectedUser.email}?`)) {
            console.log("User cancelled deletion")
            return
        }

        setDeleting(true)
        try {
            const payload = {
                userId: selectedUser.userId || null,
                email: selectedUser.email,
            }
            console.log("Sending delete request with payload:", payload)

            const response = await fetch("/api/chat", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            console.log("Delete response status:", response.status)
            const result = await response.json()
            console.log("Delete response result:", result)

            if (!response.ok) {
                throw new Error(result.error || "Gagal menghapus chat")
            }

            if (result.success) {
                setSelectedUser(null)
                await fetchMessages()
                addNotification(
                    `Chat berhasil dihapus! (${result.deletedCount} pesan)`,
                    "success"
                )
            } else {
                throw new Error(result.error || "Gagal menghapus chat")
            }
        } catch (error) {
            console.error("Error deleting chat:", error)
            addNotification(error.message || "Gagal menghapus chat!", "error")
        } finally {
            setDeleting(false)
        }
    }

    const handleStartNewChat = async (user) => {
        if (user) {
            setSelectedUser(user)
        }
        setShowNewChatModal(true)
        setNewChatMessage("")
    }

    const handleSendNewChat = async (e) => {
        e.preventDefault()
        if (!newChatMessage.trim() || !selectedUser) return

        setSendingNewChat(true)
        try {
            if (selectedUser.email === "ALL_USERS") {
                await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: newChatMessage,
                        from: "admin",
                        broadcast: true,
                    }),
                })
            } else {
                await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: newChatMessage,
                        from: "admin",
                        email: selectedUser.email,
                        userId: selectedUser.id || selectedUser.userId,
                    }),
                })
            }
            setNewChatMessage("")
            setShowNewChatModal(false)
            await fetchMessages()
            addNotification("Pesan terkirim!", "success")
        } catch (error) {
            addNotification("Gagal mengirim pesan!", "error")
        } finally {
            setSendingNewChat(false)
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
                                margin: isMobile ? "10px 8px" : "40px auto",
                                background: "#fff",
                                borderRadius: isMobile ? 12 : 12,
                                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                                minHeight: isMobile
                                    ? "calc(100vh - 20px)"
                                    : 500,
                                display: "flex",
                                flexDirection: isMobile ? "column" : "row",
                                height: isMobile
                                    ? "calc(100vh - 20px)"
                                    : "calc(100vh - 80px)",
                                overflow: "hidden",
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
                                        ? "12px 12px 0 0"
                                        : "12px 0 0 12px",
                                    minWidth: isMobile ? "auto" : 180,
                                    maxHeight: isMobile ? "35vh" : "none",
                                    height: isMobile ? "35vh" : "auto",
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight: 600,
                                        color: "#2563eb",
                                        fontSize: isMobile ? 16 : 17,
                                        padding: isMobile
                                            ? "16px 16px 12px 16px"
                                            : "18px 0 10px 24px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        borderBottom: isMobile
                                            ? "1px solid #e5e7eb"
                                            : "none",
                                        background: isMobile
                                            ? "#fff"
                                            : "transparent",
                                        borderRadius: isMobile
                                            ? "12px 12px 0 0"
                                            : "0",
                                    }}
                                >
                                    <span>Daftar User</span>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                        }}
                                    >
                                        <button
                                            onClick={() => {
                                                setSelectedUser(null)
                                                setShowNewChatModal(true)
                                            }}
                                            style={{
                                                background: "#10b981",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "50%",
                                                width: isMobile ? 24 : 28,
                                                height: isMobile ? 24 : 28,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",
                                                fontSize: isMobile ? 12 : 14,
                                                transition: "all 0.2s ease",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background =
                                                    "#059669"
                                                e.target.style.transform =
                                                    "scale(1.05)"
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background =
                                                    "#10b981"
                                                e.target.style.transform =
                                                    "scale(1)"
                                            }}
                                            title="Tambah chat baru"
                                        >
                                            +
                                        </button>
                                        <button
                                            onClick={() => {
                                                fetchMessages()
                                                fetchDatabaseUsers()
                                            }}
                                            disabled={refreshing}
                                            style={{
                                                background: refreshing
                                                    ? "#9ca3af"
                                                    : "#2563eb",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "50%",
                                                width: isMobile ? 24 : 28,
                                                height: isMobile ? 24 : 28,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: refreshing
                                                    ? "not-allowed"
                                                    : "pointer",
                                                fontSize: isMobile ? 12 : 14,
                                                transition: "all 0.2s ease",
                                            }}
                                            title="Refresh chat"
                                        >
                                            {refreshing ? "..." : "↻"}
                                        </button>
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
                                                    fontSize: isMobile
                                                        ? 10
                                                        : 11,
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>
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
                                                    ? "20px 16px"
                                                    : "40px 24px",
                                                fontSize: isMobile ? 14 : 16,
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
                                            onStartNewChat={handleStartNewChat}
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
                                    height: isMobile ? "65vh" : "100%",
                                    minHeight: isMobile ? "400px" : "auto",
                                    background: "#fff",
                                    borderRadius: isMobile
                                        ? "0 0 12px 12px"
                                        : "0 12px 12px 0",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: isMobile
                                            ? "16px 16px 12px 16px"
                                            : "18px 24px",
                                        borderBottom: "1px solid #eee",
                                        fontWeight: 600,
                                        color: "#2563eb",
                                        fontSize: isMobile ? 16 : 17,
                                        background: "#fafbfc",
                                        borderRadius: isMobile
                                            ? "0 0 12px 12px"
                                            : "0 12px 0 0",
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
                                                    width: isMobile ? 36 : 36,
                                                    height: isMobile ? 36 : 36,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    cursor: "pointer",
                                                    fontSize: isMobile
                                                        ? 18
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
                                    <div style={{ display: "flex", gap: 8 }}>
                                        {selectedUser && (
                                            <button
                                                onClick={handleDeleteChat}
                                                disabled={deleting}
                                                style={{
                                                    background: deleting
                                                        ? "#9ca3af"
                                                        : "#ef4444",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: 6,
                                                    padding: isMobile
                                                        ? "8px 14px"
                                                        : "8px 18px",
                                                    fontWeight: 600,
                                                    fontSize: isMobile
                                                        ? 12
                                                        : 14,
                                                    cursor: deleting
                                                        ? "not-allowed"
                                                        : "pointer",
                                                    transition: "all 0.2s ease",
                                                    opacity: deleting ? 0.7 : 1,
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!deleting) {
                                                        e.target.style.background =
                                                            "#dc2626"
                                                        e.target.style.transform =
                                                            "scale(1.02)"
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!deleting) {
                                                        e.target.style.background =
                                                            "#ef4444"
                                                        e.target.style.transform =
                                                            "scale(1)"
                                                    }
                                                }}
                                            >
                                                {deleting
                                                    ? isMobile
                                                        ? "..."
                                                        : "Menghapus..."
                                                    : isMobile
                                                    ? "Hapus"
                                                    : "Hapus Chat"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div
                                    ref={chatContainerRef}
                                    style={{
                                        flex: 1,
                                        overflowY: "auto",
                                        padding: isMobile ? "16px 12px" : 24,
                                        background: "#fafbfc",
                                        minHeight: 0,
                                        maxHeight: isMobile
                                            ? "calc(65vh - 140px)"
                                            : "none",
                                    }}
                                >
                                    {refreshing ? (
                                        <div
                                            style={{
                                                color: "#888",
                                                textAlign: "center",
                                                padding: isMobile
                                                    ? "20px"
                                                    : "40px",
                                                fontSize: isMobile ? 14 : 16,
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
                                                padding: isMobile
                                                    ? "20px"
                                                    : "40px",
                                                fontSize: isMobile ? 14 : 16,
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
                                                padding: isMobile
                                                    ? "20px"
                                                    : "40px",
                                                fontSize: isMobile ? 14 : 16,
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
                                                        ? 12
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
                                                                : "#fff",
                                                        color:
                                                            msg.from === "admin"
                                                                ? "white"
                                                                : "#222",
                                                        borderRadius: isMobile
                                                            ? 12
                                                            : 8,
                                                        padding: isMobile
                                                            ? "10px 14px"
                                                            : "8px 14px",
                                                        maxWidth: isMobile
                                                            ? "90%"
                                                            : "80%",
                                                        fontSize: isMobile
                                                            ? 15
                                                            : 15,
                                                        boxShadow:
                                                            msg.from === "admin"
                                                                ? "0 2px 4px rgba(37, 99, 235, 0.2)"
                                                                : "0 1px 3px rgba(0,0,0,0.1)",
                                                        border:
                                                            msg.from === "admin"
                                                                ? "none"
                                                                : "1px solid #e5e7eb",
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
                                                <div
                                                    style={{
                                                        fontSize: isMobile
                                                            ? 11
                                                            : 11,
                                                        color: "#888",
                                                        marginTop: isMobile
                                                            ? 4
                                                            : 4,
                                                        textAlign:
                                                            msg.from === "admin"
                                                                ? "right"
                                                                : "left",
                                                    }}
                                                >
                                                    {msg.time
                                                        ? new Date(
                                                              msg.time
                                                          ).toLocaleString(
                                                              "id-ID",
                                                              {
                                                                  day: "2-digit",
                                                                  month: "2-digit",
                                                                  year: "numeric",
                                                                  hour: "2-digit",
                                                                  minute: "2-digit",
                                                              }
                                                          )
                                                        : ""}
                                                </div>
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
                                            gap: isMobile ? 8 : 8,
                                            padding: isMobile
                                                ? "16px 12px"
                                                : 18,
                                            borderTop: "1px solid #eee",
                                            background: "#fff",
                                            borderRadius: isMobile
                                                ? "0 0 12px 12px"
                                                : "0 0 12px 0",
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
                                                padding: isMobile
                                                    ? "12px 16px"
                                                    : 10,
                                                borderRadius: isMobile ? 20 : 6,
                                                border: "1px solid #e5e7eb",
                                                fontSize: isMobile ? 15 : 15,
                                                color: "#222",
                                                background: "#f9fafb",
                                                transition: "all 0.2s ease",
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
                                                borderRadius: isMobile ? 20 : 6,
                                                padding: isMobile
                                                    ? "12px 20px"
                                                    : "0 18px",
                                                cursor: loading
                                                    ? "not-allowed"
                                                    : "pointer",
                                                opacity: loading ? 0.7 : 1,
                                                fontSize: isMobile ? 14 : 15,
                                                fontWeight: 600,
                                                transition: "all 0.2s ease",
                                                minWidth: isMobile
                                                    ? "auto"
                                                    : "auto",
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
                .chat-input-black-placeholder::placeholder { 
                    color: #222 !important; 
                    opacity: 1; 
                }
                
                .chat-input-black-placeholder:focus {
                    outline: none !important;
                    border-color: #2563eb !important;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
                    background: #fff !important;
                }
                
                .new-chat-textarea:focus {
                    outline: none !important;
                    border-color: #10b981 !important;
                    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
                }
                
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
                        margin: 5px 4px !important;
                    }
                }
                
                @media (max-width: 360px) {
                    main {
                        margin: 2px !important;
                    }
                }
                
                /* Custom scrollbar for chat area */
                div[ref="chatContainerRef"]::-webkit-scrollbar {
                    width: 6px;
                }
                
                div[ref="chatContainerRef"]::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }
                
                div[ref="chatContainerRef"]::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 3px;
                }
                
                div[ref="chatContainerRef"]::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }

                select option[value=""] {
                    color: #000 !important;
                    font-weight: 500;
                }
            `}</style>

            {/* Modal untuk pesan baru */}
            {showNewChatModal && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0,0,0,0.5)",
                        zIndex: 1000,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: isMobile ? "20px" : "40px",
                    }}
                    onClick={() => setShowNewChatModal(false)}
                >
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 12,
                            padding: isMobile ? "20px" : "32px",
                            width: "100%",
                            maxWidth: 400,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 20,
                            }}
                        >
                            <h3
                                style={{
                                    color: "#2563eb",
                                    fontWeight: 700,
                                    fontSize: isMobile ? 18 : 20,
                                    margin: 0,
                                }}
                            >
                                {selectedUser
                                    ? "Kirim Pesan Pertama"
                                    : "Mulai Chat Baru"}
                            </h3>
                            <button
                                onClick={() => setShowNewChatModal(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: 24,
                                    color: "#6b7280",
                                    cursor: "pointer",
                                    padding: 0,
                                    width: 32,
                                    height: 32,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div
                            style={{
                                marginBottom: 16,
                                padding: 12,
                                background: "#f3f4f6",
                                borderRadius: 8,
                                fontSize: 14,
                                color: "#374151",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div>
                                <strong>Kepada:</strong>{" "}
                                {selectedUser
                                    ? selectedUser.email
                                    : "Pilih user"}
                                {selectedUser && (
                                    <span
                                        style={{
                                            marginLeft: 8,
                                            fontSize: 12,
                                            color:
                                                selectedUser.isActive !== false
                                                    ? "#10b981"
                                                    : "#ef4444",
                                            fontWeight: 600,
                                        }}
                                    >
                                        (
                                        {selectedUser.isActive !== false
                                            ? "Aktif"
                                            : "Tidak Aktif"}
                                        )
                                    </span>
                                )}
                            </div>
                            {selectedUser && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedUser(null)}
                                    style={{
                                        background: "#6b7280",
                                        color: "white",
                                        border: "none",
                                        borderRadius: 4,
                                        padding: "4px 8px",
                                        fontSize: 12,
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                    }}
                                    title="Ubah user"
                                >
                                    Ubah
                                </button>
                            )}
                        </div>

                        {!selectedUser && (
                            <div style={{ marginBottom: 16 }}>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: 8,
                                        fontWeight: 600,
                                        color: "#374151",
                                        fontSize: 14,
                                    }}
                                >
                                    Pilih User:
                                </label>
                                <select
                                    value={
                                        selectedUser ? selectedUser.email : ""
                                    }
                                    onChange={(e) => {
                                        if (e.target.value === "ALL_USERS") {
                                            setSelectedUser({
                                                email: "ALL_USERS",
                                                isActive: true,
                                            })
                                        } else {
                                            const selectedUserData =
                                                databaseUsers.find(
                                                    (u) =>
                                                        u.email ===
                                                        e.target.value
                                                )
                                            setSelectedUser(selectedUserData)
                                        }
                                    }}
                                    style={{
                                        width: "100%",
                                        padding: 10,
                                        borderRadius: 6,
                                        border: "1px solid #d1d5db",
                                        fontSize: 14,
                                        background: "#fff",
                                        color: !selectedUser ? "#000" : "#000",
                                    }}
                                >
                                    <option
                                        value=""
                                        style={{
                                            color: "#000",
                                            fontWeight: 500,
                                        }}
                                    >
                                        Pilih user untuk dikirimi pesan...
                                    </option>
                                    <option
                                        value="ALL_USERS"
                                        style={{ color: "#000" }}
                                    >
                                        Semua User
                                    </option>
                                    {databaseUsers.length === 0 ? (
                                        <option
                                            value=""
                                            disabled
                                            style={{ color: "#666" }}
                                        >
                                            Memuat daftar user...
                                        </option>
                                    ) : databaseUsers.filter(
                                          (user) => user.isActive !== false
                                      ).length === 0 ? (
                                        <option
                                            value=""
                                            disabled
                                            style={{ color: "#666" }}
                                        >
                                            Tidak ada user aktif
                                        </option>
                                    ) : (
                                        databaseUsers
                                            .filter(
                                                (user) =>
                                                    user.isActive !== false
                                            )
                                            .map((user) => (
                                                <option
                                                    key={user.email}
                                                    value={user.email}
                                                    style={{ color: "#000" }}
                                                >
                                                    {user.email}
                                                </option>
                                            ))
                                    )}
                                </select>
                            </div>
                        )}

                        <form onSubmit={handleSendNewChat}>
                            <textarea
                                value={newChatMessage}
                                onChange={(e) =>
                                    setNewChatMessage(e.target.value)
                                }
                                placeholder="Tulis pesan pertama Anda..."
                                className="new-chat-textarea text-black"
                                style={{
                                    width: "100%",
                                    minHeight: 100,
                                    padding: 12,
                                    borderRadius: 8,
                                    border: "1px solid #d1d5db",
                                    fontSize: 14,
                                    fontFamily: "inherit",
                                    resize: "vertical",
                                    marginBottom: 20,
                                }}
                                disabled={sendingNewChat}
                            />

                            <div
                                style={{
                                    display: "flex",
                                    gap: 12,
                                    justifyContent: "flex-end",
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setShowNewChatModal(false)}
                                    style={{
                                        background: "#6b7280",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 6,
                                        padding: "10px 16px",
                                        fontWeight: 600,
                                        fontSize: 14,
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                    }}
                                    disabled={sendingNewChat}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        !newChatMessage.trim() ||
                                        sendingNewChat ||
                                        !selectedUser ||
                                        selectedUser.isActive === false
                                    }
                                    style={{
                                        background:
                                            sendingNewChat ||
                                            !selectedUser ||
                                            selectedUser.isActive === false
                                                ? "#9ca3af"
                                                : "#10b981",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 6,
                                        padding: "10px 20px",
                                        fontWeight: 600,
                                        fontSize: 14,
                                        cursor:
                                            sendingNewChat ||
                                            !selectedUser ||
                                            selectedUser.isActive === false
                                                ? "not-allowed"
                                                : "pointer",
                                        transition: "all 0.2s ease",
                                        opacity:
                                            sendingNewChat ||
                                            !selectedUser ||
                                            selectedUser.isActive === false
                                                ? 0.7
                                                : 1,
                                    }}
                                >
                                    {sendingNewChat
                                        ? "Mengirim..."
                                        : !selectedUser
                                        ? "Pilih User Dulu"
                                        : selectedUser.isActive === false
                                        ? "User Tidak Aktif"
                                        : "Kirim Pesan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
