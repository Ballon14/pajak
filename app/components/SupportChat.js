import React, { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useNotification } from "./NotificationToast"
import { useChatNotification, ChatNotificationBadge } from "./ChatNotification"

const SupportChat = () => {
    const { data: session, status } = useSession()
    const { addNotification } = useNotification()
    const {
        unreadCount,
        resetUnreadCount,
        requestNotificationPermission,
        setChatOpen,
        checkNewMessages,
    } = useChatNotification()
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [connectionStatus, setConnectionStatus] = useState("connected")
    const messagesEndRef = useRef(null)

    // Request notification permission on mount
    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            requestNotificationPermission()
        }
    }, [requestNotificationPermission])

    // Update chat open state in notification hook
    useEffect(() => {
        setChatOpen(open)
    }, [open, setChatOpen])

    // Fetch messages for this user's conversation
    const fetchMessages = useCallback(async () => {
        if (!session?.user?.id) return
        setRefreshing(true)
        setConnectionStatus("connecting")
        try {
            // First get user's conversation
            const conversationRes = await fetch(
                `/api/chat?userId=${session.user.id}`
            )
            const conversationData = await conversationRes.json()

            if (
                Array.isArray(conversationData) &&
                conversationData.length > 0
            ) {
                // User has conversation, get messages
                const conversation = conversationData[0]
                const messagesRes = await fetch(`/api/chat/${conversation.id}`)
                const messagesData = await messagesRes.json()
                setMessages(
                    Array.isArray(messagesData.messages)
                        ? messagesData.messages
                        : []
                )
            } else {
                // No conversation yet
                setMessages([])
            }
            setConnectionStatus("connected")
        } catch (error) {
            console.error("Error fetching messages:", error)
            setConnectionStatus("disconnected")
            addNotification("Gagal memuat pesan chat", "error")
        } finally {
            setRefreshing(false)
        }
    }, [session?.user?.id, addNotification])

    // Fetch pesan saat pop-up dibuka
    useEffect(() => {
        if (open && session?.user?.id) {
            fetchMessages()
            // Reset unread count saat chat dibuka
            resetUnreadCount()
            // Check for new messages immediately
            checkNewMessages()
        }
    }, [
        open,
        session?.user?.id,
        fetchMessages,
        resetUnreadCount,
        checkNewMessages,
    ])

    // Auto refresh messages every 3 seconds when chat is open for better responsiveness
    useEffect(() => {
        if (open && session?.user?.id) {
            const interval = setInterval(() => {
                fetchMessages()
            }, 3000)
            return () => clearInterval(interval)
        }
    }, [open, session?.user?.id, fetchMessages])

    useEffect(() => {
        // Auto scroll ke bawah saat pesan bertambah
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages, open])

    const handleSend = async (e) => {
        e.preventDefault()
        if (input.trim() === "" || !session?.user?.id) return
        setLoading(true)
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: input,
                    from: session.user.name,
                    email: session.user.email,
                    userId: session.user.id,
                    isAdmin: false,
                }),
            })

            if (response.ok) {
                setInput("")
                // Fetch messages immediately after sending
                await fetchMessages()
                addNotification("Pesan terkirim!", "success")
            } else {
                addNotification("Gagal mengirim pesan!", "error")
            }
        } catch (err) {
            console.error("Error sending message:", err)
            addNotification("Gagal mengirim pesan!", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleOpenChat = useCallback(() => {
        setOpen(true)
    }, [])

    const handleCloseChat = useCallback(() => {
        setOpen(false)
    }, [])

    const formatTime = (time) => {
        const date = new Date(time)
        const now = new Date()
        const diffInHours = (now - date) / (1000 * 60 * 60)

        if (diffInHours < 24) {
            return date.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
            })
        } else {
            return date.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            })
        }
    }

    const formatDate = (time) => {
        const date = new Date(time)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) {
            return "Hari ini"
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Kemarin"
        } else {
            return date.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            })
        }
    }

    const getReadStatusText = (message) => {
        if (message.isAdmin) return null // Admin tidak perlu status read

        if (message.read) {
            return "Dibaca"
        } else {
            return "Terkirim"
        }
    }

    if (status === "loading") {
        return null
    }

    if (!session) {
        return null
    }

    return (
        <>
            {/* Chat Toggle Button */}
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={handleOpenChat}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-colors relative"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                    <ChatNotificationBadge />
                </button>
            </div>

            {/* Chat Modal */}
            {open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-96 flex flex-col">
                        {/* Header */}
                        <div className="bg-blue-500 text-white p-4 rounded-t-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold">
                                        Support Chat
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`w-2 h-2 rounded-full ${
                                                connectionStatus === "connected"
                                                    ? "bg-green-400"
                                                    : connectionStatus ===
                                                      "connecting"
                                                    ? "bg-yellow-400"
                                                    : "bg-red-400"
                                            }`}
                                        ></div>
                                        <p className="text-sm opacity-90">
                                            {connectionStatus === "connected"
                                                ? "Terhubung"
                                                : connectionStatus ===
                                                  "connecting"
                                                ? "Menghubungkan..."
                                                : "Terputus"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseChat}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {refreshing ? (
                                <div className="text-center text-gray-500">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                                    <p className="mt-2">Memuat pesan...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-gray-500 mt-8">
                                    <div className="text-4xl mb-2">💬</div>
                                    <p>Mulai percakapan dengan support kami</p>
                                    <p className="text-sm mt-1">
                                        Kami akan merespons secepatnya
                                    </p>
                                </div>
                            ) : (
                                messages.map((message, index) => {
                                    const showDate =
                                        index === 0 ||
                                        formatDate(message.time) !==
                                            formatDate(
                                                messages[index - 1]?.time
                                            )

                                    return (
                                        <div key={message.id}>
                                            {/* Date Separator */}
                                            {showDate && (
                                                <div className="flex justify-center mb-4">
                                                    <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                                                        {formatDate(
                                                            message.time
                                                        )}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Message */}
                                            <div
                                                className={`flex ${
                                                    message.isAdmin
                                                        ? "justify-start"
                                                        : "justify-end"
                                                }`}
                                            >
                                                <div
                                                    className={`max-w-xs ${
                                                        message.isAdmin
                                                            ? "order-1"
                                                            : "order-2"
                                                    }`}
                                                >
                                                    {/* Sender Name */}
                                                    {message.isAdmin && (
                                                        <div className="text-xs text-gray-500 mb-1 ml-1">
                                                            {message.from}
                                                        </div>
                                                    )}

                                                    {/* Message Bubble */}
                                                    <div
                                                        className={`px-3 py-2 rounded-lg ${
                                                            message.isAdmin
                                                                ? "bg-gray-200 text-gray-900"
                                                                : "bg-blue-500 text-white"
                                                        }`}
                                                    >
                                                        <p className="text-sm">
                                                            {message.message}
                                                        </p>
                                                    </div>

                                                    {/* Time and Status */}
                                                    <div
                                                        className={`flex items-center justify-between mt-1 ${
                                                            message.isAdmin
                                                                ? "justify-start ml-1"
                                                                : "justify-end mr-1"
                                                        }`}
                                                    >
                                                        <div
                                                            className={`text-xs ${
                                                                message.isAdmin
                                                                    ? "text-gray-500"
                                                                    : "text-blue-500"
                                                            }`}
                                                        >
                                                            {formatTime(
                                                                message.time
                                                            )}
                                                        </div>

                                                        {/* Read Status for User Messages */}
                                                        {!message.isAdmin && (
                                                            <div className="flex items-center gap-1 ml-2">
                                                                <span
                                                                    className={`text-xs ${
                                                                        message.read
                                                                            ? "text-blue-500"
                                                                            : "text-gray-400"
                                                                    }`}
                                                                >
                                                                    {getReadStatusText(
                                                                        message
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-200">
                            <form onSubmit={handleSend} className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ketik pesan..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || loading}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default SupportChat
