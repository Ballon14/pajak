import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
    try {
<<<<<<< Updated upstream
        // Test database connection with MongoDB-compatible query
        await prisma.user.findFirst({
            select: { id: true },
        })
=======
        // Test database connection
        await prisma.user.findFirst({
		select: { id:true }
	})
>>>>>>> Stashed changes

        const healthData = {
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || "development",
            version: process.env.npm_package_version || "1.0.0",
            database: "connected",
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(
                    process.memoryUsage().heapTotal / 1024 / 1024
                ),
                external: Math.round(
                    process.memoryUsage().external / 1024 / 1024
                ),
            },
        }

        return NextResponse.json(healthData, { status: 200 })
    } catch (error) {
        console.error("Health check failed:", error)

        const errorData = {
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            error: error.message,
            database: "disconnected",
        }

        return NextResponse.json(errorData, { status: 503 })
    } finally {
        await prisma.$disconnect()
    }
}
