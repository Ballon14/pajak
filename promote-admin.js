require("dotenv").config()
const { connectToDatabase } = require("./lib/mongodb")

async function promoteToAdmin(email) {
    const db = await connectToDatabase()
    const result = await db
        .collection("User")
        .updateOne({ email }, { $set: { role: "admin" } })
    if (result.modifiedCount > 0) {
        console.log(`User ${email} now has role admin`)
    } else {
        console.log(`User ${email} not found or already admin.`)
    }
    process.exit()
}

promoteToAdmin("iqbaldev.site@gmail.com")
