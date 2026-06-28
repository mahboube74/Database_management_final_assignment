const { createClient } = require('@supabase/supabase-js');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);


const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const mongoDbName = process.env.MONGODB_DATABASE || 'cfx_database';

let mongoClient = null;
let mongoDb = null;

async function connectMongoDB() {
    try {
        if (mongoClient && mongoDb) {
            return mongoDb;
        }

        mongoClient = new MongoClient(mongoUri);
        await mongoClient.connect();
        mongoDb = mongoClient.db(mongoDbName);

        console.log('Database is connect');

        return mongoDb;
    } catch (error) {
        console.error('Error in MongoDB:', error.message);
        throw error;
    }
}

function getMongoDb() {
    if (!mongoDb) {
        throw new Error('You are not connected to mongoDB ');
    }
    return mongoDb;
}


async function disconnectMongoDB() {
    if (mongoClient) {
        await mongoClient.close();
        console.log('The connection is closed');
        mongoClient = null;
        mongoDb = null;
    }
}

async function testConnections() {

    try {
        const db = await connectMongoDB();
        const collections = await db.listCollections().toArray();

        if (supabaseUrl && supabaseKey) {
            const { data, error } = await supabase
                .from('customers')
                .select('count', { count: 'exact', head: true });

            if (error) {
                console.log('error connection in supabase');
            } else {
                console.log('Supabase is connected');
            }
        } else {
            console.log('Error is Supabase info');
        }

        return true;
    } catch (error) {
        console.error(error.message);
        return false;
    }
}

module.exports = {
    supabase,
    connectMongoDB,
    getMongoDb,
    disconnectMongoDB,
    testConnections
};
