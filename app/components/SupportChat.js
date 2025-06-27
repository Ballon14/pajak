import React, { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"

const SupportChat = () => {
    const { data: session, status } = useSession()
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const messagesEndRef = useRef(null)

    // Ambil pesan hanya untuk user ini
    const fetchMessages = async () => {
        if (!session?.user?.email) return
        setRefreshing(true)
        const res = await fetch("/api/chat")
        const data = await res.json()
        // Filter pesan hanya untuk user ini (berdasarkan email atau id)
        const filtered = data.filter(
            (msg) =>
                msg.email === session.user.email ||
                msg.userId === session.user.id
        )
        setMessages(filtered)
        setRefreshing(false)
    }

    // Fetch pesan saat pop-up dibuka
    useEffect(() => {
        if (open && session?.user?.email) {
            fetchMessages()
        }
        // Tidak ada polling interval
    }, [open, session?.user?.email])

    useEffect(() => {
        // Auto scroll ke bawah saat pesan bertambah
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages, open])

    const handleSend = async (e) => {
        e.preventDefault()
        if (input.trim() === "" || !session?.user?.email) return
        setLoading(true)
        try {
            await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: input,
                    from: "user",
                    email: session.user.email,
                    userId: session.user.id,
                }),
            })
            setInput("")
            await fetchMessages() // fetch ulang dari backend
        } catch (err) {
            alert("Gagal mengirim pesan!")
        } finally {
            setLoading(false)
        }
    }

    if (status === "loading") return null
    if (!session?.user?.email) return null

    return (
        <>
            {/* Tombol chat */}
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    style={{
                        position: "fixed",
                        bottom: 24,
                        right: 24,
                        zIndex: 1000,
                        background: "#2563eb",
                        color: "white",
                        borderRadius: "50%",
                        width: 56,
                        height: 56,
                        border: "none",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        fontSize: 28,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    aria-label="Buka chat support"
                >
                    <span role="img" aria-label="chat">
                        💬
                    </span>
                </button>
            )}
            {/* Pop-up chat */}
            {open && (
                <div
                    style={{
                        position: "fixed",
                        bottom: 24,
                        right: 24,
                        width: 340,
                        maxHeight: 480,
                        background: "white",
                        borderRadius: 16,
                        boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
                        zIndex: 1001,
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            padding: "14px 18px",
                            borderBottom: "1px solid #eee",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "#2563eb",
                        }}
                    >
                        <span
                            style={{
                                fontWeight: "bold",
                                color: "#fff",
                                fontSize: 17,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <span role="img" aria-label="chat">
                                💬
                            </span>{" "}
                            Support Chat
                        </span>
                        <button
                            onClick={() => setOpen(false)}
                            style={{
                                background: "none",
                                border: "none",
                                fontSize: 22,
                                color: "#fff",
                                cursor: "pointer",
                            }}
                        >
                            &times;
                        </button>
                    </div>
                    <div
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: 16,
                            background: "#f7f8fa",
                        }}
                    >
                        {refreshing ? (
                            <div
                                style={{
                                    color: "#888",
                                    textAlign: "center",
                                    marginTop: 40,
                                }}
                            >
                                Memuat pesan...
                            </div>
                        ) : messages.length === 0 ? (
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
                            messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        marginBottom: 10,
                                        textAlign:
                                            msg.from === "user"
                                                ? "right"
                                                : "left",
                                    }}
                                >
                                    <span
                                        style={{
                                            display: "inline-block",
                                            background:
                                                msg.from === "user"
                                                    ? "#2563eb"
                                                    : "#e5e7eb",
                                            color:
                                                msg.from === "user"
                                                    ? "#fff"
                                                    : "#222",
                                            borderRadius: 10,
                                            padding: "8px 14px",
                                            maxWidth: "80%",
                                            fontSize: 15,
                                            boxShadow:
                                                msg.from === "user"
                                                    ? "0 1px 4px #2563eb22"
                                                    : "none",
                                        }}
                                    >
                                        {msg.text || msg.message}
                                    </span>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: "#888",
                                            marginTop: 2,
                                        }}
                                    >
                                        {msg.time
                                            ? new Date(
                                                  msg.time
                                              ).toLocaleTimeString()
                                            : ""}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form
                        onSubmit={handleSend}
                        style={{
                            display: "flex",
                            borderTop: "1px solid #eee",
                            padding: 10,
                            background: "#fff",
                        }}
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="text-black"
                            placeholder="Tulis pesan..."
                            style={{
                                flex: 1,
                                border: "1px solid #ccc",
                                outline: "none",
                                fontSize: 15,
                                padding: 10,
                                borderRadius: 8,
                                background: "#f7f8fa",
                            }}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            style={{
                                background: loading ? "#a5b4fc" : "#2563eb",
                                color: "white",
                                border: "none",
                                borderRadius: 8,
                                padding: "0 18px",
                                marginLeft: 8,
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.7 : 1,
                                fontWeight: 600,
                                fontSize: 15,
                            }}
                            disabled={loading}
                        >
                            {loading ? "..." : "Kirim"}
                        </button>
                    </form>
                </div>
            )}
        </>
    )
}

export default SupportChat
