import { connectToDatabase } from "./lib/mongodb.js"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

async function setupDatabase() {
    try {
        if (!process.env.DATABASE_URL) {
            console.error("❌ DATABASE_URL not found in environment variables")
            console.log("💡 Please add DATABASE_URL to your .env file")
            process.exit(1)
        }

        const db = await connectToDatabase()

        // Create indexes for better performance
        console.log("Creating database indexes...")

        // Index for User collection
        const usersCollection = db.collection("User")
        await usersCollection.createIndex({ email: 1 }, { unique: true })
        await usersCollection.createIndex({ isActive: 1 })
        console.log("✓ User indexes created")

        // Index for TaxRecord collection
        const taxRecordsCollection = db.collection("TaxRecord")
        await taxRecordsCollection.createIndex({ userId: 1 })
        await taxRecordsCollection.createIndex({ year: -1 })
        await taxRecordsCollection.createIndex({ status: 1 })
        await taxRecordsCollection.createIndex({ userId: 1, year: -1 })
        console.log("✓ TaxRecord indexes created")

        // Index for chats collection
        const chatsCollection = db.collection("chats")
        await chatsCollection.createIndex({ time: 1 })
        await chatsCollection.createIndex({ userId: 1 })
        await chatsCollection.createIndex({ email: 1 })
        console.log("✓ Chats indexes created")

        console.log("Database setup completed successfully!")
        process.exit(0)
    } catch (error) {
        console.error("Database setup failed:", error)
        process.exit(1)
    }
}

setupDatabase()
