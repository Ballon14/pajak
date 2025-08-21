import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req) {
    try {
        const { action, userIds } = await req.json()
        
        if (!action || !userIds || !Array.isArray(userIds)) {
            return NextResponse.json({ error: "Action and user IDs are required" }, { status: 400 })
        }
        
        const db = await connectToDatabase()
        const objectIds = userIds.map(id => new ObjectId(id))
        
        let result
        
        switch (action) {
            case "activate":
                result = await db.collection("User").updateMany(
                    { _id: { $in: objectIds } },
                    { 
                        $set: { 
                            isActive: true,
                            updatedAt: new Date()
                        } 
                    }
                )
                break
                
            case "deactivate":
                result = await db.collection("User").updateMany(
                    { _id: { $in: objectIds } },
                    { 
                        $set: { 
                            isActive: false,
                            updatedAt: new Date()
                        } 
                    }
                )
                break
                
            case "delete":
                result = await db.collection("User").deleteMany({
                    _id: { $in: objectIds }
                })
                break
                
            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }
        
        return NextResponse.json({ 
            success: true, 
            modifiedCount: result.modifiedCount || result.deletedCount 
        })
    } catch (error) {
        console.error("Error performing bulk user operation:", error)
        return NextResponse.json({ error: "Failed to perform bulk operation" }, { status: 500 })
    }
}
