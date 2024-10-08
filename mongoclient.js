/**
 * @file mongoClient.js
 * @description Simple MongoDB client that writes a record to a local MongoDB database.
 * @version 1.0.0
 * @date 2023-10-05
 * @license MIT
 * 
 * @dependencies
 * - mongodb: MongoDB client for Node.js
 * 
 * @usage
 * To run the script, use the following command:
 * ```
 * node mongoClient.js
 * ```
 * 
 * @notes
 * - Ensure that MongoDB is running locally before running the script.
 * 
 * @maintainer
 * - GitHub Copilot
 */

const { MongoClient } = require('mongodb');

// MongoDB connection URI
const uri = 'mongodb://localhost:27017';

// Database and collection names
const dbName = 'mydatabase';
const collectionName = 'mycollection';

// Sample record to insert
const sampleRecord = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  age: 30,
  createdAt: new Date(),
};

async function writeRecord() {
  const client = new MongoClient(uri);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    // Get the database and collection
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Insert the sample record
    const result = await collection.insertOne(sampleRecord);
    console.log(`Record inserted with _id: ${result.insertedId}`);
  } catch (error) {
    console.error('Error writing record to MongoDB:', error);
  } finally {
    // Close the MongoDB connection
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the writeRecord function
writeRecord();
