import { MongoClient } from "mongodb"

const uri = process.env.DATABASE_URL
const options = {
    maxPoolSize: 10, // Connection pool size
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
}

const client = new MongoClient(uri, options)

let db = null
let connectionPromise = null

export async function connectToDatabase() {
    if (db) return db

    // Prevent multiple simultaneous connection attempts
    if (connectionPromise) return connectionPromise

    connectionPromise = (async () => {
        try {
            await client.connect()
            db = client.db()
            console.log("Connected to MongoDB with optimized settings")
            return db
        } catch (error) {
            console.error("Failed to connect to MongoDB:", error)
            connectionPromise = null // Reset on error
            throw error
        }
    })()

    return connectionPromise
}

export async function closeConnection() {
    if (client) {
        await client.close()
    }
}

export { client }
