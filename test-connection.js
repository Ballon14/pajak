const { MongoClient } = require("mongodb")

async function testConnection() {
    const url = "mongodb://iqbal:iqbal@100.96.165.28:27017/pajak_nextjs?authSource=admin"

    try {
        console.log("🔧 Testing connection without authentication...")
        const client = new MongoClient(url)

        await client.connect()
        console.log("✅ Connected successfully!")

        const db = client.db("pajak_nextjs")

        // Test creating a collection
        const testCollection = db.collection("test")
        await testCollection.insertOne({
            message: "Test connection",
            timestamp: new Date(),
        })
        console.log("✅ Write test successful!")

        // Test reading
        const result = await testCollection.findOne({
            message: "Test connection",
        })
        console.log("✅ Read test successful!", result)

        // Clean up
        await testCollection.deleteOne({ message: "Test connection" })
        console.log("✅ Cleanup successful!")

        await client.close()

        console.log("\n🎉 Database is ready for Prisma!")
        console.log("📝 Use this in your .env:")
        console.log(`DATABASE_URL="${url}"`)
    } catch (error) {
        console.log("❌ Error:", error.message)

        if (error.message.includes("Unauthorized")) {
            console.log("\n💡 Server requires authentication")
            console.log(
                "Please provide admin credentials or ask server admin to create a user"
            )
        }
    }
}

testConnection()
