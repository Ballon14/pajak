import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "../auth/[...nextauth]/route"
import { connectToDatabase } from "../../../lib/mongodb"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const db = await connectToDatabase()
        const taxRecordsCollection = db.collection("TaxRecord")

        // Get user's tax records with timeout
        const records = await Promise.race([
            taxRecordsCollection
                .find({ userId: session.user.id })
                .sort({ year: -1 })
                .limit(10) // Limit to recent 10 records
                .toArray(),
            new Promise((_, reject) =>
                setTimeout(
                    () => reject(new Error("Dashboard data timeout")),
                    3000
                )
            ),
        ])

        // Calculate statistics
        const totalData = records.length
        const totalPajak = records.reduce(
            (sum, record) => sum + (record.total || 0),
            0
        )

        // Get current month data
        const currentMonth = new Date().getMonth() + 1
        const currentYear = new Date().getFullYear()
        const dataThisMonth = records.filter(
            (record) =>
                record.year === currentYear &&
                new Date(record.createdAt || new Date()).getMonth() + 1 ===
                    currentMonth
        ).length

        // Get recent data (last 5 records)
        const recentData = records.slice(0, 5).map((record) => ({
            id: record._id.toString(),
            name: record.name,
            total: record.total,
            year: record.year,
            status: record.status,
            createdAt: record.createdAt,
        }))

        const dashboardData = {
            totalData,
            totalPajak,
            dataThisMonth,
            recentData,
            user: {
                name: session.user.name,
                email: session.user.email,
                role: session.user.role,
            },
        }

        return NextResponse.json(dashboardData)
    } catch (error) {
        console.error("Dashboard API error:", error.message)

        // Return default data on error
        return NextResponse.json({
            totalData: 0,
            totalPajak: 0,
            dataThisMonth: 0,
            recentData: [],
            user: {
                name: session?.user?.name || "User",
                email: session?.user?.email || "",
                role: session?.user?.role || "user",
            },
        })
    }
}
