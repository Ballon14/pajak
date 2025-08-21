"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

export default function AdminChatPage() {
    const { data: session, status } = useSession()
    const [conversations, setConversations] = useState([])
    const [selectedConversation, setSelectedConversation] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [messageLoading, setMessageLoading] = useState(false)
    const [onlineUsers, setOnlineUsers] = useState([])
    const [chatUsers, setChatUsers] = useState([])
    const [broadcastModal, setBroadcastModal] = useState({
        open: false,
        type: "all",
    })
    const [broadcastMessage, setBroadcastMessage] = useState("")
    const [startChatModal, setStartChatModal] = useState({
        open: false,
        selectedUser: null,
        message: "",
    })

    useEffect(() => {
        if (status === "authenticated" && session?.user?.role === "admin") {
            fetchConversations()
            fetchOnlineUsers()
            fetchChatUsers()
            // Poll for new data every 10 seconds
            const interval = setInterval(() => {
                fetchConversations()
                if (selectedConversation) {
                    fetchMessages(selectedConversation.id)
                }
            }, 10000)
            return () => clearInterval(interval)
        }
    }, [status, session, selectedConversation])

    const fetchConversations = async () => {
        try {
            const response = await fetch("/api/chat?isAdmin=true")
            if (response.ok) {
                const data = await response.json()
                setConversations(Array.isArray(data) ? data : [])
            }
        } catch (error) {
            console.error("Error fetching conversations:", error)
            setConversations([])
        } finally {
            setLoading(false)
        }
    }

    const fetchMessages = async (conversationId) => {
        try {
            const response = await fetch(
                `/api/chat?isAdmin=true&conversationId=${conversationId}`
            )
            if (response.ok) {
                const data = await response.json()
                setMessages(Array.isArray(data) ? data : [])
            }
        } catch (error) {
            console.error("Error fetching messages:", error)
            setMessages([])
        }
    }

    const fetchOnlineUsers = async () => {
        try {
            const response = await fetch("/api/admin/online-users")
            if (response.ok) {
                const data = await response.json()
                setOnlineUsers(Array.isArray(data) ? data : [])
            }
        } catch (error) {
            console.error("Error fetching online users:", error)
            setOnlineUsers([])
        }
    }

    const fetchChatUsers = async () => {
        try {
            const response = await fetch("/api/admin/users/chat-users")
            if (response.ok) {
                const data = await response.json()
                setChatUsers(Array.isArray(data) ? data : [])
            }
        } catch (error) {
            console.error("Error fetching chat users:", error)
            setChatUsers([])
        }
    }

    const selectConversation = async (conversation) => {
        setSelectedConversation(conversation)
        setMessages([])
        await fetchMessages(conversation.id)
    }

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return

        setMessageLoading(true)
        try {
            const response = await fetch(
                `/api/chat/${selectedConversation.id}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: newMessage.trim(),
                        from: session.user.name,
                        isAdmin: true,
                    }),
                }
            )

            if (response.ok) {
                setNewMessage("")
                // Refresh messages
                await fetchMessages(selectedConversation.id)
                // Refresh conversations to update last message
                await fetchConversations()
            }
        } catch (error) {
            console.error("Error sending message:", error)
        } finally {
            setMessageLoading(false)
        }
    }

    const startPrivateChat = async () => {
        if (!startChatModal.selectedUser || !startChatModal.message.trim())
            return

        setMessageLoading(true)
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: startChatModal.message.trim(),
                    from: session.user.name,
                    isAdmin: true,
                    targetUserId: startChatModal.selectedUser.id,
                }),
            })

            if (response.ok) {
                setStartChatModal({
                    open: false,
                    selectedUser: null,
                    message: "",
                })
                // Refresh conversations to show new chat
                await fetchConversations()
                // Refresh chat users
                await fetchChatUsers()
                alert("Chat pribadi berhasil dimulai!")
            }
        } catch (error) {
            console.error("Error starting private chat:", error)
            alert("Gagal memulai chat pribadi")
        } finally {
            setMessageLoading(false)
        }
    }

    const sendBroadcastMessage = async () => {
        if (!broadcastMessage.trim()) return

        try {
            const response = await fetch("/api/admin/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: broadcastMessage,
                    type: broadcastModal.type,
                }),
            })

            if (response.ok) {
                setBroadcastMessage("")
                setBroadcastModal({ open: false, type: "all" })
                alert("Broadcast message sent successfully!")
            }
        } catch (error) {
            console.error("Error sending broadcast:", error)
        }
    }

    const deleteConversation = async (conversationId) => {
        if (!confirm("Apakah Anda yakin ingin menghapus percakapan ini?"))
            return

        try {
            const response = await fetch("/api/chat", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversationId }),
            })

            if (response.ok) {
                setConversations((prev) =>
                    prev.filter((conv) => conv.id !== conversationId)
                )
                if (selectedConversation?.id === conversationId) {
                    setSelectedConversation(null)
                    setMessages([])
                }
            }
        } catch (error) {
            console.error("Error deleting conversation:", error)
        }
    }

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
        if (!message.isAdmin) return null // Hanya untuk pesan admin

        if (message.read) {
            return "Dibaca"
        } else {
            return "Terkirim"
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar - Conversation List */}
            <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-blue-600 text-white">
                    <h1 className="text-xl font-semibold">Chat Support</h1>
                    <p className="text-sm opacity-90">
                        {conversations.length} percakapan aktif
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="p-4 border-b border-gray-200 space-y-2">
                    <button
                        onClick={() =>
                            setStartChatModal({
                                open: true,
                                selectedUser: null,
                                message: "",
                            })
                        }
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        💬 Mulai Chat Pribadi
                    </button>
                    <button
                        onClick={() =>
                            setBroadcastModal({ open: true, type: "all" })
                        }
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        📢 Kirim Broadcast
                    </button>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            Belum ada percakapan
                        </div>
                    ) : (
                        conversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                onClick={() => selectConversation(conversation)}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                                    selectedConversation?.id === conversation.id
                                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                                        : ""
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                {conversation.user?.name?.charAt(
                                                    0
                                                ) || "U"}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">
                                                    {conversation.user?.name ||
                                                        "Unknown User"}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {conversation.user?.email ||
                                                        conversation.email}
                                                </p>
                                            </div>
                                        </div>
                                        {conversation.lastMessage && (
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-600 truncate">
                                                    {
                                                        conversation.lastMessage
                                                            .message
                                                    }
                                                </p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-xs text-gray-400">
                                                        {formatTime(
                                                            conversation
                                                                .lastMessage
                                                                .time
                                                        )}
                                                    </span>
                                                    {conversation.unreadCount >
                                                        0 && (
                                                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                                            {
                                                                conversation.unreadCount
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteConversation(conversation.id)
                                        }}
                                        className="text-red-500 hover:text-red-700 p-1"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 bg-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {selectedConversation.user?.name?.charAt(
                                        0
                                    ) || "U"}
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        {selectedConversation.user?.name ||
                                            "Unknown User"}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {selectedConversation.user?.email ||
                                            selectedConversation.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-500 mt-8">
                                    Mulai percakapan dengan user ini
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
                                                        ? "justify-end"
                                                        : "justify-start"
                                                }`}
                                            >
                                                <div
                                                    className={`max-w-xs lg:max-w-md ${
                                                        message.isAdmin
                                                            ? "order-2"
                                                            : "order-1"
                                                    }`}
                                                >
                                                    {/* Sender Name */}
                                                    {!message.isAdmin && (
                                                        <div className="text-xs text-gray-500 mb-1 mr-1 text-right">
                                                            {message.from}
                                                        </div>
                                                    )}

                                                    {/* Message Bubble */}
                                                    <div
                                                        className={`px-4 py-2 rounded-lg ${
                                                            message.isAdmin
                                                                ? "bg-blue-500 text-white"
                                                                : "bg-gray-200 text-gray-900"
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
                                                                ? "justify-end mr-1"
                                                                : "justify-start ml-1"
                                                        }`}
                                                    >
                                                        <div
                                                            className={`text-xs ${
                                                                message.isAdmin
                                                                    ? "text-blue-500"
                                                                    : "text-gray-500"
                                                            }`}
                                                        >
                                                            {formatTime(
                                                                message.time
                                                            )}
                                                        </div>

                                                        {/* Read Status for Admin Messages */}
                                                        {message.isAdmin && (
                                                            <div className="flex items-center gap-1 ml-2">
                                                                <span
                                                                    className={`text-xs ${
                                                                        message.read
                                                                            ? "text-blue-500"
                                                                            : "text-gray-400"
                                                                    }`}
                                                                >
                                                                    {message.read
                                                                        ? "✓✓"
                                                                        : "✓"}
                                                                </span>
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
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) =>
                                        setNewMessage(e.target.value)
                                    }
                                    onKeyPress={(e) =>
                                        e.key === "Enter" && sendMessage()
                                    }
                                    placeholder="Ketik pesan..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={messageLoading}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={
                                        !newMessage.trim() || messageLoading
                                    }
                                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {messageLoading ? "Mengirim..." : "Kirim"}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <div className="text-6xl mb-4">💬</div>
                            <h2 className="text-xl font-semibold mb-2">
                                Pilih Percakapan
                            </h2>
                            <p>
                                Pilih percakapan dari daftar di sebelah kiri
                                untuk mulai chatting
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Start Private Chat Modal */}
            {startChatModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">
                            Mulai Chat Pribadi
                        </h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Pilih User:
                            </label>
                            <select
                                value={startChatModal.selectedUser?.id || ""}
                                onChange={(e) => {
                                    const user = chatUsers.find(
                                        (u) => u.id === e.target.value
                                    )
                                    setStartChatModal({
                                        ...startChatModal,
                                        selectedUser: user,
                                    })
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Pilih user...</option>
                                {chatUsers.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email}){" "}
                                        {user.hasConversation
                                            ? " - Sudah ada chat"
                                            : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Pesan Awal:
                            </label>
                            <textarea
                                value={startChatModal.message}
                                onChange={(e) =>
                                    setStartChatModal({
                                        ...startChatModal,
                                        message: e.target.value,
                                    })
                                }
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Tulis pesan awal untuk user..."
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() =>
                                    setStartChatModal({
                                        open: false,
                                        selectedUser: null,
                                        message: "",
                                    })
                                }
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={startPrivateChat}
                                disabled={
                                    !startChatModal.selectedUser ||
                                    !startChatModal.message.trim() ||
                                    messageLoading
                                }
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                            >
                                {messageLoading ? "Memulai..." : "Mulai Chat"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Broadcast Modal */}
            {broadcastModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-semibold mb-4">
                            Kirim Broadcast Message
                        </h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Tipe Broadcast:
                            </label>
                            <select
                                value={broadcastModal.type}
                                onChange={(e) =>
                                    setBroadcastModal({
                                        ...broadcastModal,
                                        type: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Semua User</option>
                                <option value="active">User Aktif</option>
                                <option value="inactive">User Nonaktif</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Pesan:
                            </label>
                            <textarea
                                value={broadcastMessage}
                                onChange={(e) =>
                                    setBroadcastMessage(e.target.value)
                                }
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Tulis pesan broadcast..."
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() =>
                                    setBroadcastModal({
                                        open: false,
                                        type: "all",
                                    })
                                }
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={sendBroadcastMessage}
                                disabled={!broadcastMessage.trim()}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                Kirim
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
