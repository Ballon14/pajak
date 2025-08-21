const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")
const { Server } = require("socket.io")

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Store active connections and rooms
const connectedUsers = new Map()
const chatRooms = new Map()

app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url, true)
        handle(req, res, parsedUrl)
    })

    // Initialize Socket.IO
    const io = new Server(httpServer, {
        cors: {
            origin:
                process.env.NODE_ENV === "production"
                    ? process.env.NEXTAUTH_URL
                    : "http://localhost:3000",
            methods: ["GET", "POST"],
        },
    })

    // WebSocket connection handling
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`)

        // User authentication and room joining
        socket.on("user:join", ({ userId, userRole, userName }) => {
            connectedUsers.set(socket.id, {
                userId,
                userRole,
                userName,
                socketId: socket.id,
                joinedAt: new Date(),
                isOnline: true,
            })

            // Join appropriate rooms based on role
            if (userRole === "admin") {
                socket.join("admin-room")
                // Notify all users that admin is online
                socket.broadcast.emit("admin:online", {
                    adminName: userName,
                    timestamp: new Date(),
                })
            } else {
                socket.join(`user-${userId}`)
                // Join general support room
                socket.join("support-room")
            }

            // Send updated online users list
            const onlineUsers = Array.from(connectedUsers.values())
            io.emit("users:online", onlineUsers)

            console.log(`${userName} (${userRole}) joined chat`)
        })

        // Real-time messaging
        socket.on(
            "message:send",
            ({ message, recipientId, senderRole, chatRoomId }) => {
                const sender = connectedUsers.get(socket.id)
                if (!sender) return

                const messageData = {
                    id: Date.now() + Math.random(),
                    message,
                    senderId: sender.userId,
                    senderName: sender.userName,
                    senderRole: sender.userRole,
                    recipientId,
                    timestamp: new Date(),
                    status: "sent",
                    chatRoomId,
                }

                // Store message in room history
                if (!chatRooms.has(chatRoomId)) {
                    chatRooms.set(chatRoomId, [])
                }
                chatRooms.get(chatRoomId).push(messageData)

                // Send to recipient(s)
                if (senderRole === "admin") {
                    // Admin sending to specific user
                    io.to(`user-${recipientId}`).emit(
                        "message:received",
                        messageData
                    )
                    // Also send to other admins
                    socket
                        .to("admin-room")
                        .emit("message:received", messageData)
                } else {
                    // User sending to admin
                    io.to("admin-room").emit("message:received", messageData)
                }

                // Confirm delivery to sender
                socket.emit("message:delivered", {
                    messageId: messageData.id,
                    timestamp: new Date(),
                })

                console.log(`Message from ${sender.userName}: ${message}`)
            }
        )

        // Typing indicators
        socket.on("typing:start", ({ chatRoomId, userName }) => {
            socket.to(chatRoomId).emit("user:typing", {
                userName,
                userId: connectedUsers.get(socket.id)?.userId,
                timestamp: new Date(),
            })
        })

        socket.on("typing:stop", ({ chatRoomId }) => {
            socket.to(chatRoomId).emit("user:typing:stop", {
                userId: connectedUsers.get(socket.id)?.userId,
            })
        })

        // Message read receipts
        socket.on("message:read", ({ messageId, chatRoomId }) => {
            const reader = connectedUsers.get(socket.id)
            socket.to(chatRoomId).emit("message:read:confirm", {
                messageId,
                readBy: reader?.userName,
                readAt: new Date(),
            })
        })

        // Admin status updates
        socket.on("admin:status", ({ status, message }) => {
            const admin = connectedUsers.get(socket.id)
            if (admin?.userRole === "admin") {
                socket.broadcast.emit("admin:status:update", {
                    adminName: admin.userName,
                    status, // 'available', 'busy', 'away'
                    message,
                    timestamp: new Date(),
                })
            }
        })

        // Handle disconnection
        socket.on("disconnect", () => {
            const user = connectedUsers.get(socket.id)
            if (user) {
                console.log(`${user.userName} disconnected`)

                // Notify others about user going offline
                if (user.userRole === "admin") {
                    socket.broadcast.emit("admin:offline", {
                        adminName: user.userName,
                        timestamp: new Date(),
                    })
                }

                connectedUsers.delete(socket.id)

                // Send updated online users list
                const onlineUsers = Array.from(connectedUsers.values())
                io.emit("users:online", onlineUsers)
            }
        })

        // Error handling
        socket.on("error", (error) => {
            console.error("Socket error:", error)
        })
    })

    // Cleanup old chat rooms periodically (24 hours)
    setInterval(() => {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        for (const [roomId, messages] of chatRooms.entries()) {
            const recentMessages = messages.filter(
                (msg) => new Date(msg.timestamp) > oneDayAgo
            )
            if (recentMessages.length === 0) {
                chatRooms.delete(roomId)
            } else {
                chatRooms.set(roomId, recentMessages)
            }
        }
    }, 60 * 60 * 1000) // Run every hour

    httpServer
        .once("error", (err) => {
            console.error(err)
            process.exit(1)
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`)
            console.log(`> WebSocket server running`)
        })
})
