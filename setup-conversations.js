import { MongoClient } from "mongodb"
import dotenv from "dotenv"

dotenv.config()

async function setupConversations() {
    try {
        if (!process.env.DATABASE_URL) {
            console.error("❌ DATABASE_URL not found in environment variables")
            console.log("💡 Please add DATABASE_URL to your .env file")
            console.log(
                "   Example: DATABASE_URL=mongodb://localhost:27017/pajakapp"
            )
            process.exit(1)
        }

        console.log("🔗 Connecting to MongoDB...")
        const client = new MongoClient(process.env.DATABASE_URL, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })

        await client.connect()
        const db = client.db()
        console.log("✅ Connected to MongoDB successfully")

        console.log("Setting up conversations system...")

        // Create conversations collection indexes
        const conversationsCollection = db.collection("conversations")
        await conversationsCollection.createIndex({ userId: 1 })
        await conversationsCollection.createIndex({ email: 1 })
        await conversationsCollection.createIndex({ lastMessage: -1 })
        await conversationsCollection.createIndex({ unreadCount: 1 })
        console.log("✓ Conversations indexes created")

        // Create chats collection indexes for conversation system
        const chatsCollection = db.collection("chats")
        await chatsCollection.createIndex({ conversationId: 1 })
        await chatsCollection.createIndex({ userId: 1 })
        await chatsCollection.createIndex({ email: 1 })
        await chatsCollection.createIndex({ time: 1 })
        await chatsCollection.createIndex({ isAdmin: 1 })
        await chatsCollection.createIndex({ read: 1 })
        console.log("✓ Chats indexes created")

        // Create User collection indexes if not exists
        const usersCollection = db.collection("User")
        await usersCollection.createIndex({ email: 1 }, { unique: true })
        await usersCollection.createIndex({ isActive: 1 })
        console.log("✓ User indexes created")

        await client.close()
        console.log("✅ Conversations system setup completed successfully!")
        console.log("")
        console.log("📋 Features available:")
        console.log("✅ Two-way chat conversations like WhatsApp")
        console.log("✅ Separate conversation threads for each user")
        console.log("✅ Read/unread message tracking")
        console.log("✅ Admin can reply to user messages")
        console.log("✅ Real-time message updates")
        console.log("✅ Message timestamps and status indicators")

        process.exit(0)
    } catch (error) {
        console.error("❌ Conversations setup failed:", error.message)
        if (error.message.includes("DATABASE_URL")) {
            console.log(
                "💡 Please check your .env file and ensure DATABASE_URL is set correctly"
            )
        }
        process.exit(1)
    }
}

setupConversations()
