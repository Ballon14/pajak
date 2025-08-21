import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "../../../../lib/mongodb"

const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    const db = await connectToDatabase()
                    const usersCollection = db.collection("User")

                    // Add timeout to database query
                    const user = await Promise.race([
                        usersCollection.findOne({
                            email: credentials.email,
                        }),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Database timeout')), 5000)
                        )
                    ])

                    if (!user) {
                        const error = new Error("redirect-register")
                        error.code = "redirect-register"
                        throw error
                    }

                    if (user.isActive === false) {
                        const error = new Error("nonaktif")
                        error.code = "nonaktif"
                        throw error
                    }

                    // Add timeout to password comparison
                    const isValid = await Promise.race([
                        bcrypt.compare(credentials.password, user.password),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Password check timeout')), 3000)
                        )
                    ])

                    if (!isValid) {
                        const error = new Error("wrong-credentials")
                        error.code = "wrong-credentials"
                        throw error
                    }

                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        role: user.role,
                    }
                } catch (error) {
                    console.error('Auth error:', error.message)
                    // Forward error message to frontend
                    throw error
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: "/login",
        signOut: "https://pajak.iqbaldev.site",
        error: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id
                token.name = user.name
                token.email = user.email
                token.image = user.image
                token.role = user.role
            }
            // Handle update
            if (trigger === "update" && session) {
                token.name = session.user.name
                token.email = session.user.email
                token.image = session.user.image
                token.role = session.user.role
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id
                session.user.name = token.name
                session.user.email = token.email
                session.user.image = token.image
                session.user.role = token.role
            }
            return session
        },
    },
    events: {
        async signIn({ user, account, profile, isNewUser }) {
            console.log("User signed in:", user.email)
        },
        async signOut({ session, token }) {
            console.log("User signed out:", session?.user?.email)
        },
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST, authOptions }
