"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import { useNotification } from "./NotificationToast"

export function useAdminChatNotification() {
    const { data: session } = useSession()
    const { addNotification } = useNotification()
    const [unreadCount, setUnreadCount] = useState(0)
    const [lastMessageIds, setLastMessageIds] = useState({})
    const [unreadUsers, setUnreadUsers] = useState(new Set())
    const pollingIntervalRef = useRef(null)

    // Cek pesan baru untuk admin
    const checkNewMessages = useCallback(async () => {
        if (session?.user?.role !== "admin") return

        try {
            const res = await fetch("/api/chat")
            const data = await res.json()

            const newUnreadUsers = new Set()
            let newUnreadCount = 0

            data.forEach((msg) => {
                if (msg.from === "user" && msg.email) {
                    const lastId = lastMessageIds[msg.email] || 0
                    if (msg.id && msg.id > lastId) {
                        newUnreadUsers.add(msg.email)
                        newUnreadCount++

                        // Admin tidak perlu notifikasi popup chat karena ada halaman chat khusus
                        // Notification chat popup dinonaktifkan untuk admin
                    }

                    // Update last message ID
                    setLastMessageIds((prev) => ({
                        ...prev,
                        [msg.email]: Math.max(
                            prev[msg.email] || 0,
                            msg.id || 0
                        ),
                    }))
                }
            })

            setUnreadUsers(newUnreadUsers)
            setUnreadCount(newUnreadCount)
        } catch (error) {
            console.error("Error checking new messages:", error)
        }
    }, [session?.user?.role, lastMessageIds])

    // Polling untuk cek pesan baru setiap 5 detik
    useEffect(() => {
        if (session?.user?.role === "admin") {
            // Clear existing interval first
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
            }

            // Initial check
            checkNewMessages()

            // Start polling
            pollingIntervalRef.current = setInterval(checkNewMessages, 5000)

            return () => {
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current)
                    pollingIntervalRef.current = null
                }
            }
        }
    }, [session?.user?.role, checkNewMessages])

    // Clear unread status untuk user tertentu
    const clearUnreadForUser = useCallback((email) => {
        setUnreadUsers((prev) => {
            const newSet = new Set(prev)
            newSet.delete(email)
            return newSet
        })
        setUnreadCount((prev) => Math.max(0, prev - 1))
    }, [])

    // Clear semua unread
    const clearAllUnread = useCallback(() => {
        setUnreadUsers(new Set())
        setUnreadCount(0)
    }, [])

    return {
        unreadCount,
        unreadUsers,
        clearUnreadForUser,
        clearAllUnread,
        checkNewMessages,
    }
}

// Komponen badge notifikasi untuk admin
export function AdminChatBadge({ unreadCount, onClick }) {
    if (unreadCount === 0) return null

    return (
        <div
            style={{
                position: "absolute",
                top: -8,
                right: -8,
                background: "#ef4444",
                color: "white",
                borderRadius: "50%",
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: "bold",
                animation: "pulse 2s infinite",
                cursor: "pointer",
                zIndex: 10,
            }}
            onClick={onClick}
        >
            {unreadCount > 99 ? "99+" : unreadCount}
        </div>
    )
}

// Komponen untuk menampilkan daftar user dengan notifikasi
export function AdminUserList({
    users,
    unreadUsers,
    onUserSelect,
    selectedUser,
    onStartNewChat,
}) {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        function handleResize() {
            setIsMobile(window.innerWidth < 768)
        }
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    return (
        <div>
            {users.map((user, idx) => {
                const hasUnread = unreadUsers.has(user.email)
                const hasExistingChat = user.lastMessage // Jika ada lastMessage, berarti sudah ada chat

                return (
                    <div
                        key={user.email || idx}
                        onClick={
                            hasExistingChat
                                ? () => onUserSelect(user)
                                : undefined
                        }
                        style={{
                            padding: isMobile ? "10px 16px" : "12px 24px",
                            cursor: hasExistingChat ? "pointer" : "default",
                            background:
                                selectedUser &&
                                selectedUser.email === user.email
                                    ? "#e0e7ff"
                                    : hasUnread
                                    ? "#fef3c7"
                                    : "transparent",
                            color:
                                selectedUser &&
                                selectedUser.email === user.email
                                    ? "#2563eb"
                                    : "#222",
                            borderLeft:
                                selectedUser &&
                                selectedUser.email === user.email
                                    ? "4px solid #2563eb"
                                    : hasUnread
                                    ? "4px solid #f59e0b"
                                    : "4px solid transparent",
                            fontWeight:
                                selectedUser &&
                                selectedUser.email === user.email
                                    ? 600
                                    : hasUnread
                                    ? 600
                                    : 400,
                            position: "relative",
                            transition: "all 0.2s ease",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: isMobile ? 13 : 14,
                                    maxWidth: isMobile ? "120px" : "160px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {user.email}
                            </span>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                }}
                            >
                                {hasUnread && (
                                    <span
                                        style={{
                                            background: "#ef4444",
                                            color: "white",
                                            borderRadius: "50%",
                                            width: isMobile ? 14 : 16,
                                            height: isMobile ? 14 : 16,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: isMobile ? 9 : 10,
                                            fontWeight: "bold",
                                            flexShrink: 0,
                                        }}
                                    >
                                        ●
                                    </span>
                                )}
                                {!hasExistingChat && onStartNewChat && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onStartNewChat(user)
                                        }}
                                        style={{
                                            background: "#10b981",
                                            color: "white",
                                            border: "none",
                                            borderRadius: 4,
                                            padding: isMobile
                                                ? "4px 8px"
                                                : "6px 10px",
                                            fontSize: isMobile ? 10 : 11,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                            flexShrink: 0,
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
                                        title="Mulai chat baru"
                                    >
                                        {isMobile ? "Chat" : "Mulai Chat"}
                                    </button>
                                )}
                            </div>
                        </div>
                        {hasExistingChat ? (
                            <>
                                {user.lastMessage && (
                                    <div
                                        style={{
                                            fontSize: isMobile ? 11 : 12,
                                            color: "#666",
                                            marginTop: isMobile ? 2 : 4,
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            maxWidth: isMobile
                                                ? "180px"
                                                : "100%",
                                        }}
                                    >
                                        <span style={{ fontWeight: 500 }}>
                                            {user.from === "user" ? "👤" : "👨‍💼"}
                                        </span>{" "}
                                        {user.lastMessage.substring(
                                            0,
                                            isMobile ? 20 : 30
                                        )}
                                        {user.lastMessage.length >
                                        (isMobile ? 20 : 30)
                                            ? "..."
                                            : ""}
                                    </div>
                                )}
                                {user.lastMessageTime && (
                                    <div
                                        style={{
                                            fontSize: isMobile ? 9 : 10,
                                            color: "#999",
                                            marginTop: isMobile ? 1 : 2,
                                        }}
                                    >
                                        {new Date(
                                            user.lastMessageTime
                                        ).toLocaleTimeString()}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div
                                style={{
                                    fontSize: isMobile ? 11 : 12,
                                    color: "#999",
                                    marginTop: isMobile ? 2 : 4,
                                    fontStyle: "italic",
                                }}
                            >
                                Belum ada chat
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
