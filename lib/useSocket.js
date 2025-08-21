"use client"
import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import io from "socket.io-client"

export function useSocket() {
    const { data: session } = useSession()
    const socketRef = useRef(null)
    const [isConnected, setIsConnected] = useState(false)
    const [onlineUsers, setOnlineUsers] = useState([])
    const [messages, setMessages] = useState([])
    const [typingUsers, setTypingUsers] = useState([])
    const [adminStatus, setAdminStatus] = useState({
        status: "offline",
        message: "",
    })

    // Initialize socket connection
    useEffect(() => {
        if (!session?.user) return

        const socket = io(
            process.env.NODE_ENV === "production"
                ? process.env.NEXTAUTH_URL
                : "http://localhost:3000"
        )

        socketRef.current = socket

        // Connection events
        socket.on("connect", () => {
            setIsConnected(true)
            console.log("Connected to WebSocket server")

            // Join chat with user info
            socket.emit("user:join", {
                userId: session.user.id,
                userRole: session.user.role || "user",
                userName: session.user.name || session.user.email,
            })
        })

        socket.on("disconnect", () => {
            setIsConnected(false)
            console.log("Disconnected from WebSocket server")
        })

        // Message events
        socket.on("message:received", (messageData) => {
            setMessages((prev) => [...prev, messageData])
        })

        socket.on("message:delivered", ({ messageId, timestamp }) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === messageId
                        ? {
                              ...msg,
                              status: "delivered",
                              deliveredAt: timestamp,
                          }
                        : msg
                )
            )
        })

        socket.on("message:read:confirm", ({ messageId, readBy, readAt }) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === messageId
                        ? { ...msg, status: "read", readBy, readAt }
                        : msg
                )
            )
        })

        // Typing events
        socket.on("user:typing", ({ userName, userId }) => {
            setTypingUsers((prev) => {
                const exists = prev.find((u) => u.userId === userId)
                if (!exists) {
                    return [
                        ...prev,
                        { userName, userId, timestamp: new Date() },
                    ]
                }
                return prev
            })
        })

        socket.on("user:typing:stop", ({ userId }) => {
            setTypingUsers((prev) => prev.filter((u) => u.userId !== userId))
        })

        // Online users
        socket.on("users:online", (users) => {
            setOnlineUsers(users)
        })

        // Admin status
        socket.on("admin:online", ({ adminName, timestamp }) => {
            setAdminStatus({
                status: "online",
                message: `${adminName} is now available`,
                timestamp,
            })
        })

        socket.on("admin:offline", ({ adminName, timestamp }) => {
            setAdminStatus({
                status: "offline",
                message: `${adminName} went offline`,
                timestamp,
            })
        })

        socket.on(
            "admin:status:update",
            ({ adminName, status, message, timestamp }) => {
                setAdminStatus({
                    status,
                    message: message || `${adminName} is ${status}`,
                    timestamp,
                })
            }
        )

        // Cleanup on unmount
        return () => {
            socket.disconnect()
        }
    }, [session?.user])

    // Auto-clear typing indicators after 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date()
            setTypingUsers((prev) =>
                prev.filter((user) => now - new Date(user.timestamp) < 3000)
            )
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    // Send message function
    const sendMessage = (
        message,
        recipientId = null,
        chatRoomId = "general"
    ) => {
        if (!socketRef.current || !message.trim()) return

        const messageData = {
            message: message.trim(),
            recipientId,
            senderRole: session?.user?.role || "user",
            chatRoomId,
        }

        socketRef.current.emit("message:send", messageData)

        // Add message to local state with pending status
        const localMessage = {
            id: Date.now() + Math.random(),
            message: message.trim(),
            senderId: session.user.id,
            senderName: session.user.name || session.user.email,
            senderRole: session.user.role || "user",
            recipientId,
            timestamp: new Date(),
            status: "sending",
            chatRoomId,
        }

        setMessages((prev) => [...prev, localMessage])
    }

    // Typing indicators
    const startTyping = (chatRoomId = "general") => {
        if (!socketRef.current) return

        socketRef.current.emit("typing:start", {
            chatRoomId,
            userName: session?.user?.name || session?.user?.email,
        })
    }

    const stopTyping = (chatRoomId = "general") => {
        if (!socketRef.current) return

        socketRef.current.emit("typing:stop", { chatRoomId })
    }

    // Mark message as read
    const markAsRead = (messageId, chatRoomId = "general") => {
        if (!socketRef.current) return

        socketRef.current.emit("message:read", { messageId, chatRoomId })
    }

    // Update admin status (for admin users)
    const updateAdminStatus = (status, message = "") => {
        if (!socketRef.current || session?.user?.role !== "admin") return

        socketRef.current.emit("admin:status", { status, message })
    }

    // Get chat room for user
    const getChatRoomId = (userId1, userId2 = null) => {
        if (!userId2) return `user-${userId1}`
        return `chat-${[userId1, userId2].sort().join("-")}`
    }

    return {
        isConnected,
        onlineUsers,
        messages,
        typingUsers,
        adminStatus,
        sendMessage,
        startTyping,
        stopTyping,
        markAsRead,
        updateAdminStatus,
        getChatRoomId,
        socket: socketRef.current,
    }
}

// Hook for typing detection
export function useTypingDetection(onStartTyping, onStopTyping, delay = 1000) {
    const typingTimeoutRef = useRef(null)
    const isTypingRef = useRef(false)

    const handleTyping = () => {
        if (!isTypingRef.current) {
            isTypingRef.current = true
            onStartTyping?.()
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }

        // Set new timeout
        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false
            onStopTyping?.()
        }, delay)
    }

    const cleanup = () => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }
        if (isTypingRef.current) {
            isTypingRef.current = false
            onStopTyping?.()
        }
    }

    useEffect(() => {
        return cleanup
    }, [])

    return { handleTyping, cleanup }
}
