import { getServerSession } from "next-auth"
import { authOptions } from "../app/api/auth/[...nextauth]/route"

export async function getSession() {
    return await getServerSession(authOptions)
}

export async function getCurrentUser() {
    const session = await getSession()
    return session?.user
}

export async function requireAuth() {
    const session = await getSession()
    if (!session) {
        throw new Error("Unauthorized")
    }
    return session
}

// Function to check if user exists in database
export async function userExists(email) {
    try {
        const { connectToDatabase } = await import("./mongodb.js")
        const db = await connectToDatabase()
        const usersCollection = db.collection("User")

        const user = await usersCollection.findOne({ email })
        return !!user
    } catch (error) {
        console.error("Error checking user existence:", error)
        return false
    }
}
