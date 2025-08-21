"use client"
import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSocket, useTypingDetection } from "../../lib/useSocket"
import OnlinePresenceIndicator, {
    AdminStatusController,
} from "./OnlinePresenceIndicator"

export default function RealTimeChatSidebar() {
    const { data: session } = useSession()
    const [isOpen, setIsOpen] = useState(false)
    const [message, setMessage] = useState("")
    const [chatRoomId] = useState("general")
    const [activeTab, setActiveTab] = useState("chat") // 'chat' or 'users'
    const [messages, setMessages] = useState([])
    const [conversationId, setConversationId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [conversations, setConversations] = useState([])
    const [selectedConversation, setSelectedConversation] = useState(null)
    const [showConversationList, setShowConversationList] = useState(false)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)
    const sidebarRef = useRef(null)

    const {
        isConnected,
        onlineUsers,
        typingUsers,
        adminStatus,
        startTyping,
        stopTyping,
        markAsRead,
    } = useSocket()

    const { handleTyping } = useTypingDetection(
        () => startTyping(chatRoomId),
        () => stopTyping(chatRoomId),
        1500
    )

    // Fetch user's conversation and messages
    const fetchConversation = async () => {
        if (!session?.user?.id) return

        try {
            if (session?.user?.role === "admin") {
                // For admin, fetch all conversations
                const conversationsRes = await fetch("/api/chat?isAdmin=true")
                const conversationsData = await conversationsRes.json()
                setConversations(conversationsData)

                // If a conversation is selected, fetch its messages
                if (selectedConversation) {
                    const messagesRes = await fetch(
                        `/api/chat/${selectedConversation.id}`
                    )
                    const messagesData = await messagesRes.json()
                    if (messagesData.messages) {
                        setMessages(messagesData.messages)
                    }
                }
            } else {
                // For regular users, get their conversation
                const conversationRes = await fetch(
                    `/api/chat?userId=${session.user.id}`
                )
                const conversationData = await conversationRes.json()

                if (
                    Array.isArray(conversationData) &&
                    conversationData.length > 0
                ) {
                    const conversation = conversationData[0]
                    setConversationId(conversation.id)
                    setSelectedConversation(conversation)

                    // Get messages for this conversation
                    const messagesRes = await fetch(
                        `/api/chat/${conversation.id}`
                    )
                    const messagesData = await messagesRes.json()

                    if (messagesData.messages) {
                        setMessages(messagesData.messages)
                    }
                } else {
                    setConversationId(null)
                    setSelectedConversation(null)
                    setMessages([])
                }
            }
        } catch (error) {
            console.error("Error fetching conversation:", error)
        }
    }

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Fetch conversation when component mounts or session changes
    useEffect(() => {
        if (session?.user?.id) {
            fetchConversation()
        }
    }, [session?.user?.id])

    // Auto refresh messages when chat is open
    useEffect(() => {
        if (isOpen && session?.user?.id) {
            const interval = setInterval(() => {
                fetchConversation()
            }, 3000)
            return () => clearInterval(interval)
        }
    }, [isOpen, session?.user?.id])

    // Close sidebar when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target)
            ) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.body.style.overflow = ""
        }
    }, [isOpen])

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && activeTab === "chat" && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen, activeTab])

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!message.trim() || !session?.user?.id) return

        setLoading(true)
        try {
            let response
            if (selectedConversation) {
                // Send message to existing conversation
                response = await fetch(`/api/chat/${selectedConversation.id}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: message.trim(),
                        from: session.user.name,
                        isAdmin: session.user.role === "admin",
                    }),
                })
            } else {
                // Create new conversation
                response = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: message.trim(),
                        from: session.user.name,
                        email: session.user.email,
                        userId: session.user.id,
                        isAdmin: session.user.role === "admin",
                    }),
                })
            }

            if (response.ok) {
                setMessage("")
                // Refresh messages
                await fetchConversation()
            }
        } catch (error) {
            console.error("Error sending message:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        setMessage(e.target.value)
        handleTyping()
    }

    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation)
        setShowConversationList(false)
    }

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const formatDate = (timestamp) => {
        const date = new Date(timestamp)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) {
            return "Hari ini"
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Kemarin"
        } else {
            return date.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year:
                    date.getFullYear() !== today.getFullYear()
                        ? "numeric"
                        : undefined,
            })
        }
    }

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message) => {
        const date = new Date(message.time).toDateString()
        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(message)
        return groups
    }, {})

    const unreadCount = messages.filter(
        (msg) => msg.isAdmin !== (session?.user?.role === "admin") && !msg.read
    ).length

    if (!session) return null

    return (
        <>
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 group flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 text-white rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
                aria-label="Open chat"
            >
                <div className="relative">
                    <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="group-hover:scale-110 transition-transform duration-300"
                    >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>

                    {/* Animated pulse ring */}
                    <div className="absolute inset-0 rounded-2xl bg-blue-400 opacity-75 animate-ping"></div>
                </div>

                {/* Connection Status */}
                <div
                    className={`absolute -top-2 -right-2 w-5 h-5 rounded-full border-3 border-white shadow-lg ${
                        isConnected ? "bg-green-500" : "bg-red-500"
                    }`}
                >
                    <div
                        className={`absolute inset-0.5 rounded-full ${
                            isConnected
                                ? "bg-green-400 animate-pulse"
                                : "bg-red-400"
                        }`}
                    ></div>
                </div>

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <div className="absolute -top-3 -left-3 bg-red-500 text-white text-xs rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg border-2 border-white animate-bounce">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </div>
                )}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-all duration-300" />
            )}

            {/* Chat Sidebar */}
            <div
                ref={sidebarRef}
                className={`fixed top-0 right-0 h-full w-96 max-w-[90vw] bg-white border-l border-slate-200 z-50 flex flex-col transition-all duration-300 ease-out shadow-2xl ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-700/50">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                            </div>
                            <div
                                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900 ${
                                    adminStatus.status === "online"
                                        ? "bg-green-500"
                                        : adminStatus.status === "busy"
                                        ? "bg-yellow-500"
                                        : "bg-gray-400"
                                }`}
                            >
                                <div
                                    className={`absolute inset-0.5 rounded-full ${
                                        adminStatus.status === "online"
                                            ? "bg-green-400 animate-pulse"
                                            : ""
                                    }`}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="font-bold text-xl tracking-tight">
                                {session?.user?.role === "admin"
                                    ? "Admin Chat"
                                    : "Support Chat"}
                            </div>
                            <div className="text-sm text-slate-300">
                                {isConnected
                                    ? adminStatus.status === "online"
                                        ? "🟢 Admin Tersedia"
                                        : adminStatus.status === "busy"
                                        ? "🟡 Admin Sibuk"
                                        : "⚫ Admin Offline"
                                    : "🔄 Menghubungkan..."}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl group"
                        aria-label="Close chat"
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="group-hover:scale-110 transition-transform"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="bg-slate-50 border-b border-slate-200 flex">
                    <button
                        onClick={() => setActiveTab("chat")}
                        className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 relative ${
                            activeTab === "chat"
                                ? "text-blue-600 bg-white border-b-2 border-blue-600 shadow-sm"
                                : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                        }`}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            Chat
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab("users")}
                        className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 relative ${
                            activeTab === "users"
                                ? "text-blue-600 bg-white border-b-2 border-blue-600 shadow-sm"
                                : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                        }`}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            Online
                            <span className="bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg">
                                {onlineUsers.length}
                            </span>
                        </div>
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden bg-slate-50">
                    {activeTab === "chat" ? (
                        <>
                            {/* Admin Conversation Selector */}
                            {session?.user?.role === "admin" && (
                                <div className="bg-white border-b border-slate-200 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-slate-800">
                                            Percakapan
                                        </h3>
                                        <button
                                            onClick={() =>
                                                setShowConversationList(
                                                    !showConversationList
                                                )
                                            }
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                        >
                                            {showConversationList
                                                ? "Sembunyikan"
                                                : "Tampilkan"}
                                        </button>
                                    </div>

                                    {showConversationList && (
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {conversations.length === 0 ? (
                                                <div className="text-center text-slate-500 text-sm py-4">
                                                    Belum ada percakapan
                                                </div>
                                            ) : (
                                                conversations.map((conv) => (
                                                    <button
                                                        key={conv.id}
                                                        onClick={() =>
                                                            handleSelectConversation(
                                                                conv
                                                            )
                                                        }
                                                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                                            selectedConversation?.id ===
                                                            conv.id
                                                                ? "bg-blue-50 border-blue-200 text-blue-800"
                                                                : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="font-medium text-sm">
                                                                    {conv.user
                                                                        ?.name ||
                                                                        conv
                                                                            .user
                                                                            ?.email ||
                                                                        "User"}
                                                                </div>
                                                                <div className="text-xs text-slate-500">
                                                                    {conv
                                                                        .lastMessage
                                                                        ?.message ||
                                                                        "Belum ada pesan"}
                                                                </div>
                                                            </div>
                                                            {conv.unreadCount >
                                                                0 && (
                                                                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                                    {
                                                                        conv.unreadCount
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}

                                    {selectedConversation && (
                                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="text-sm font-medium text-blue-800">
                                                Chat dengan:{" "}
                                                {selectedConversation.user
                                                    ?.name ||
                                                    selectedConversation.user
                                                        ?.email ||
                                                    "User"}
                                            </div>
                                            <div className="text-xs text-blue-600 mt-1">
                                                {
                                                    selectedConversation.messageCount
                                                }{" "}
                                                pesan
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 h-full">
                                {Object.keys(groupedMessages).length === 0 && (
                                    <div className="text-center text-slate-500 py-16">
                                        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <svg
                                                width="32"
                                                height="32"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                className="text-slate-400"
                                            >
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                            </svg>
                                        </div>
                                        <div className="font-semibold text-lg mb-2">
                                            Belum ada percakapan
                                        </div>
                                        <div className="text-sm text-slate-400">
                                            {session?.user?.role === "admin"
                                                ? "Pilih user untuk mulai chat"
                                                : "Mulai chat dengan admin sekarang"}
                                        </div>
                                    </div>
                                )}

                                {Object.entries(groupedMessages).map(
                                    ([date, dayMessages]) => (
                                        <div key={date}>
                                            {/* Date Separator */}
                                            <div className="flex items-center justify-center my-6">
                                                <div className="bg-slate-200 text-slate-600 text-xs px-4 py-2 rounded-full font-medium shadow-sm">
                                                    {formatDate(new Date(date))}
                                                </div>
                                            </div>

                                            {/* Messages for this date */}
                                            <div className="space-y-4">
                                                {dayMessages.map((msg) => {
                                                    const isOwn =
                                                        msg.isAdmin ===
                                                        (session?.user?.role ===
                                                            "admin")
                                                    return (
                                                        <div
                                                            key={msg.id}
                                                            className={`flex ${
                                                                isOwn
                                                                    ? "justify-end"
                                                                    : "justify-start"
                                                            }`}
                                                        >
                                                            <div
                                                                className={`max-w-[80%] ${
                                                                    isOwn
                                                                        ? "order-2"
                                                                        : "order-1"
                                                                }`}
                                                            >
                                                                {!isOwn && (
                                                                    <div className="text-xs text-slate-500 mb-2 px-2 flex items-center gap-2">
                                                                        <span className="font-medium">
                                                                            {
                                                                                msg.from
                                                                            }
                                                                        </span>
                                                                        {msg.isAdmin && (
                                                                            <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                                                                                Admin
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                <div
                                                                    className={`px-5 py-3 rounded-2xl shadow-sm ${
                                                                        isOwn
                                                                            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-md"
                                                                            : "bg-white text-slate-800 rounded-bl-md border border-slate-200"
                                                                    }`}
                                                                >
                                                                    <div className="text-sm leading-relaxed">
                                                                        {
                                                                            msg.message
                                                                        }
                                                                    </div>
                                                                    <div
                                                                        className={`text-xs mt-2 flex items-center gap-1 ${
                                                                            isOwn
                                                                                ? "text-blue-100 justify-end"
                                                                                : "text-slate-500"
                                                                        }`}
                                                                    >
                                                                        <span>
                                                                            {formatTime(
                                                                                msg.time
                                                                            )}
                                                                        </span>
                                                                        {isOwn && (
                                                                            <span
                                                                                className={`ml-1 ${
                                                                                    msg.read
                                                                                        ? "text-green-300"
                                                                                        : "text-slate-300"
                                                                                }`}
                                                                            >
                                                                                {msg.read
                                                                                    ? "✓✓"
                                                                                    : "✓"}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                )}

                                {/* Typing Indicators */}
                                {typingUsers.length > 0 && (
                                    <div className="flex justify-start">
                                        <div className="bg-white rounded-2xl rounded-bl-md px-5 py-3 max-w-[80%] border border-slate-200 shadow-sm">
                                            <div className="flex items-center gap-3 text-slate-500 text-sm">
                                                <div className="flex gap-1">
                                                    <div
                                                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                                                        style={{
                                                            animationDelay:
                                                                "0ms",
                                                        }}
                                                    />
                                                    <div
                                                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                                                        style={{
                                                            animationDelay:
                                                                "150ms",
                                                        }}
                                                    />
                                                    <div
                                                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                                                        style={{
                                                            animationDelay:
                                                                "300ms",
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium">
                                                    {typingUsers
                                                        .map((u) => u.userName)
                                                        .join(", ")}{" "}
                                                    sedang mengetik...
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="border-t bg-white p-6">
                                <form
                                    onSubmit={handleSendMessage}
                                    className="space-y-4"
                                >
                                    <div className="flex gap-4 items-end">
                                        <div className="flex-1 relative">
                                            <textarea
                                                ref={inputRef}
                                                value={message}
                                                onChange={handleInputChange}
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === "Enter" &&
                                                        !e.shiftKey
                                                    ) {
                                                        e.preventDefault()
                                                        handleSendMessage(e)
                                                    }
                                                }}
                                                placeholder={
                                                    session?.user?.role ===
                                                        "admin" &&
                                                    !selectedConversation
                                                        ? "Pilih user untuk mulai chat..."
                                                        : "Ketik pesan... (Enter untuk kirim)"
                                                }
                                                className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[48px] max-h-32 bg-slate-50 hover:bg-white transition-colors"
                                                disabled={
                                                    loading ||
                                                    (session?.user?.role ===
                                                        "admin" &&
                                                        !selectedConversation)
                                                }
                                                rows={1}
                                                style={{ height: "auto" }}
                                                onInput={(e) => {
                                                    e.target.style.height =
                                                        "auto"
                                                    e.target.style.height =
                                                        e.target.scrollHeight +
                                                        "px"
                                                }}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={
                                                !message.trim() ||
                                                loading ||
                                                (session?.user?.role ===
                                                    "admin" &&
                                                    !selectedConversation)
                                            }
                                            className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl flex items-center justify-center hover:from-blue-700 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                                            aria-label="Send message"
                                        >
                                            {loading ? (
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                            ) : (
                                                <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <line
                                                        x1="22"
                                                        y1="2"
                                                        x2="11"
                                                        y2="13"
                                                    />
                                                    <polygon points="22,2 15,22 11,13 2,9" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    {!isConnected && (
                                        <div className="text-center text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                                            🔄 Koneksi terputus. Mencoba
                                            menyambung kembali...
                                        </div>
                                    )}
                                </form>
                            </div>
                        </>
                    ) : (
                        /* Users Tab */
                        <div className="p-6 space-y-6 overflow-y-auto h-full">
                            <OnlinePresenceIndicator showUserList={true} />

                            {/* Admin Status Controller for admin users */}
                            {session?.user?.role === "admin" && (
                                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                    <AdminStatusController />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
