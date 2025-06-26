import { MongoClient } from 'mongodb';

const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);

let db = null;

export async function connectToDatabase() {
    if (db) return db;
    
    try {
        await client.connect();
        db = client.db();
        console.log('Connected to MongoDB');
        return db;
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
}

export async function closeConnection() {
    if (client) {
        await client.close();
    }
}

export { client }; 