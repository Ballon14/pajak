const { MongoClient } = require("mongodb")

async function setupMongoDB() {
    console.log("🔧 Setting up MongoDB connection to your server...")

    // Test connection strings untuk server MongoDB Anda
    const connectionStrings = [
        "mongodb://iqbal:iqbal@100.96.165.28:27017/pajak_nextjs?authSource=admin",
        "mongodb://100.96.165.28:27017",
        // Jika memerlukan autentikasi, uncomment dan sesuaikan:
        // 'mongodb://username:password@100.96.165.28:27017/pajak_nextjs',
    ]

    for (const url of connectionStrings) {
        try {
            console.log(`\n📡 Testing connection to: ${url}`)
            const client = new MongoClient(url, {
                serverSelectionTimeoutMS: 5000, // 5 detik timeout
                connectTimeoutMS: 10000, // 10 detik timeout
            })

            await client.connect()

            console.log("✅ Connection successful!")

            // Test database operations tanpa admin privileges
            try {
                const testDb = client.db("pajak_nextjs")
                const collections = await testDb.listCollections().toArray()
                console.log(
                    "📋 Collections in pajak_nextjs:",
                    collections.map((col) => col.name)
                )

                // Test create collection
                const testCollection = testDb.collection("test_connection")
                await testCollection.insertOne({
                    test: true,
                    timestamp: new Date(),
                })
                console.log("✅ Database write test successful")

                // Clean up test data
                await testCollection.deleteOne({ test: true })
                console.log("✅ Database cleanup successful")
            } catch (dbError) {
                console.log("⚠️ Database operations failed:", dbError.message)
                console.log(
                    "💡 This might be due to authentication requirements"
                )
            }

            await client.close()

            console.log("\n🎉 MongoDB server is ready!")
            console.log("\n📝 Next steps:")
            console.log("1. Create a .env file with:")
            console.log(`   DATABASE_URL="${url}"`)
            console.log("2. Run: npx prisma generate")
            console.log("3. Run: npx prisma db push")
            console.log("4. Run: npm run dev")

            return
        } catch (error) {
            console.log(`❌ Failed: ${error.message}`)

            if (error.message.includes("Unauthorized")) {
                console.log("💡 Tip: MongoDB server memerlukan autentikasi")
                console.log(
                    "   Gunakan format: mongodb://username:password@100.96.165.28:27017/pajak_nextjs"
                )
            } else if (error.message.includes("ECONNREFUSED")) {
                console.log(
                    "💡 Tip: Pastikan MongoDB server berjalan di port 27017"
                )
            }
        }
    }

    console.log("\n❌ Could not connect to MongoDB server")
    console.log("\n🔧 Troubleshooting:")
    console.log("1. Pastikan MongoDB server berjalan di 100.96.165.28:27017")
    console.log("2. Periksa firewall settings")
    console.log(
        "3. Jika memerlukan autentikasi, tambahkan username dan password"
    )
    console.log("4. Periksa network connectivity ke server")
}

setupMongoDB().catch(console.error)
