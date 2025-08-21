"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useNotification } from "./NotificationToast"

export function useChatNotification() {
    const { data: session } = useSession()
    const { addNotification } = useNotification()
    const [unreadCount, setUnreadCount] = useState(0)
    const [lastMessageId, setLastMessageId] = useState(null)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const pollingIntervalRef = useRef(null)

    // Fetch messages untuk cek pesan baru
    const checkNewMessages = useCallback(async () => {
        if (!session?.user?.id || isChatOpen) return

        try {
            // Get user's conversation first
            const conversationRes = await fetch(
                `/api/chat?userId=${session.user.id}`
            )
            const conversationData = await conversationRes.json()

            if (
                Array.isArray(conversationData) &&
                conversationData.length > 0
            ) {
                const conversation = conversationData[0]

                // Get messages for this conversation
                const messagesRes = await fetch(`/api/chat/${conversation.id}`)
                const messagesData = await messagesRes.json()

                if (
                    messagesData.messages &&
                    Array.isArray(messagesData.messages)
                ) {
                    const messages = messagesData.messages

                    // Filter admin messages only
                    const adminMessages = messages.filter((msg) => msg.isAdmin)

                    // Check for new admin messages
                    if (adminMessages.length > 0) {
                        const latestMessage =
                            adminMessages[adminMessages.length - 1]
                        const latestMessageId = parseInt(latestMessage.id) || 0

                        // If this is the first time checking or we have a new message
                        if (!lastMessageId || latestMessageId > lastMessageId) {
                            // Calculate new messages count
                            let newMessagesCount = 0
                            if (!lastMessageId) {
                                // First time, count all unread admin messages
                                newMessagesCount = adminMessages.filter(
                                    (msg) => !msg.read
                                ).length
                            } else {
                                // Count messages newer than lastMessageId
                                newMessagesCount = adminMessages.filter(
                                    (msg) => {
                                        const messageId = parseInt(msg.id) || 0
                                        return messageId > lastMessageId
                                    }
                                ).length
                            }

                            if (newMessagesCount > 0) {
                                // Update unread count
                                setUnreadCount(
                                    (prev) => prev + newMessagesCount
                                )

                                // Show toast notification
                                addNotification(
                                    `💬 Pesan baru dari Admin: ${latestMessage.message}`,
                                    "info"
                                )

                                // Show browser notification
                                if (
                                    "Notification" in window &&
                                    Notification.permission === "granted"
                                ) {
                                    new Notification("Pesan Baru dari Admin", {
                                        body: latestMessage.message,
                                        icon: "/favicon.ico",
                                        tag: "chat-notification",
                                        requireInteraction: false,
                                    })
                                }
                            }
                        }

                        // Update last message ID
                        setLastMessageId(latestMessageId)
                    }
                }
            } else {
                // No conversation yet, reset unread count
                setUnreadCount(0)
                setLastMessageId(null)
            }
        } catch (error) {
            console.error("Error checking new messages:", error)
        }
    }, [session?.user?.id, lastMessageId, addNotification, isChatOpen])

    // Start polling untuk pesan baru
    useEffect(() => {
        if (session?.user?.id && !isChatOpen) {
            // Clear existing interval first
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
            }

            // Poll setiap 5 detik
            pollingIntervalRef.current = setInterval(() => {
                checkNewMessages()
            }, 5000)

            // Initial check
            checkNewMessages()
        } else {
            // Stop polling if chat is open
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
                pollingIntervalRef.current = null
            }
        }

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
            }
        }
    }, [session?.user?.id, checkNewMessages, isChatOpen])

    // Reset unread count
    const resetUnreadCount = useCallback(() => {
        setUnreadCount(0)
    }, [])

    // Set chat open state
    const setChatOpen = useCallback((open) => {
        setIsChatOpen(open)
    }, [])

    // Request notification permission
    const requestNotificationPermission = useCallback(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    addNotification("Notifikasi chat diaktifkan!", "success")
                } else {
                    addNotification("Notifikasi chat ditolak", "warning")
                }
            })
        }
    }, [addNotification])

    return {
        unreadCount,
        resetUnreadCount,
        requestNotificationPermission,
        checkNewMessages,
        setChatOpen,
    }
}

// Komponen untuk menampilkan notifikasi chat
export function ChatNotificationBadge({ unreadCount, onClick }) {
    if (unreadCount === 0) return null

    return (
        <div
            style={{
                position: "absolute",
                top: -5,
                right: -5,
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
            }}
            onClick={onClick}
        >
            {unreadCount > 99 ? "99+" : unreadCount}
        </div>
    )
}

// Komponen untuk menampilkan notifikasi toast chat
export function ChatToastNotification({ message, onClose }) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setIsVisible(true)
        const timer = setTimeout(() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
        }, 4000)

        return () => clearTimeout(timer)
    }, [onClose])

    return (
        <div
            style={{
                position: "fixed",
                bottom: 100,
                right: 24,
                background: "#2563eb",
                color: "white",
                padding: "12px 16px",
                borderRadius: "12px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
                zIndex: 1002,
                maxWidth: 300,
                transform: isVisible ? "translateY(0)" : "translateY(100px)",
                opacity: isVisible ? 1 : 0,
                transition: "all 0.3s ease",
                cursor: "pointer",
            }}
            onClick={onClose}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                }}
            >
                <span style={{ fontSize: 16 }}>💬</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                    Pesan Baru
                </span>
            </div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>{message}</div>
        </div>
    )
}
