"use client"
import {
    useState,
    useEffect,
    createContext,
    useContext,
    useCallback,
} from "react"

// Context untuk notifikasi
const NotificationContext = createContext()

// Hook untuk menggunakan notifikasi
export const useNotification = () => {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error(
            "useNotification must be used within NotificationProvider"
        )
    }
    return context
}

// Provider untuk notifikasi
export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([])

    const addNotification = useCallback(
        (message, type = "info", duration = 5000) => {
            const id = Date.now() + Math.random()
            const notification = { id, message, type, duration }

            setNotifications((prev) => [...prev, notification])

            setTimeout(() => removeNotification(id), duration)
            return id
        },
        []
    )

    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id))
    }, [])

    const clearAll = useCallback(() => {
        setNotifications([])
    }, [])

    return (
        <NotificationContext.Provider
            value={{ addNotification, removeNotification, clearAll }}
        >
            {children}
            <NotificationContainer
                notifications={notifications}
                removeNotification={removeNotification}
            />
        </NotificationContext.Provider>
    )
}

// Container untuk menampilkan notifikasi
function NotificationContainer({ notifications, removeNotification }) {
    return (
        <div
            style={{
                position: "fixed",
                top: 20,
                right: 20,
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                maxWidth: 400,
            }}
        >
            {notifications.map((notification) => (
                <NotificationToast
                    key={notification.id}
                    notification={notification}
                    onRemove={removeNotification}
                />
            ))}
        </div>
    )
}

// Komponen toast individual
function NotificationToast({ notification, onRemove }) {
    const [isVisible, setIsVisible] = useState(false)
    const [isLeaving, setIsLeaving] = useState(false)

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100)
    }, [])

    const handleRemove = () => {
        setIsLeaving(true)
        setTimeout(() => {
            onRemove(notification.id)
        }, 300)
    }

    const getTypeStyles = (type) => {
        switch (type) {
            case "success":
                return { background: "#10b981", color: "white", icon: "✅" }
            case "error":
                return { background: "#ef4444", color: "white", icon: "❌" }
            case "warning":
                return { background: "#f59e0b", color: "white", icon: "⚠️" }
            case "info":
            default:
                return { background: "#3b82f6", color: "white", icon: "ℹ️" }
        }
    }

    const styles = getTypeStyles(notification.type)

    return (
        <div
            style={{
                background: styles.background,
                color: styles.color,
                padding: "12px 16px",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                gap: 12,
                minWidth: 300,
                maxWidth: 400,
                transform: isVisible ? "translateX(0)" : "translateX(100%)",
                opacity: isLeaving ? 0 : 1,
                transition: "all 0.3s ease",
                cursor: "pointer",
            }}
            onClick={handleRemove}
            onMouseEnter={(e) => {
                e.target.style.transform = "translateX(0) scale(1.02)"
            }}
            onMouseLeave={(e) => {
                e.target.style.transform = "translateX(0) scale(1)"
            }}
        >
            <span style={{ fontSize: 18 }}>{styles.icon}</span>
            <div style={{ flex: 1, fontSize: 14 }}>{notification.message}</div>
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    handleRemove()
                }}
                style={{
                    background: "none",
                    border: "none",
                    color: styles.color,
                    fontSize: 18,
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 20,
                    height: 20,
                }}
            >
                ×
            </button>
        </div>
    )
}

// Komponen untuk notifikasi chat khusus
export function ChatNotification({ message, onClose }) {
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

// Hook untuk notifikasi chat
export function useChatNotification() {
    const [chatNotifications, setChatNotifications] = useState([])

    const addChatNotification = (message) => {
        const id = Date.now() + Math.random()
        setChatNotifications((prev) => [...prev, { id, message }])
        return id
    }

    const removeChatNotification = (id) => {
        setChatNotifications((prev) => prev.filter((notif) => notif.id !== id))
    }

    return {
        chatNotifications,
        addChatNotification,
        removeChatNotification,
    }
}

// Komponen untuk menampilkan notifikasi chat
export function ChatNotificationContainer() {
    const { chatNotifications, removeChatNotification } = useChatNotification()

    return (
        <>
            {chatNotifications.map((notification) => (
                <ChatNotification
                    key={notification.id}
                    message={notification.message}
                    onClose={() => removeChatNotification(notification.id)}
                />
            ))}
        </>
    )
}
