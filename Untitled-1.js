
/**
 * @file redisClient.js
 * @description Simple Redis client that writes a record to a local Redis database.
 * @version 1.0.0
 * @date 2023-10-05
 * @license MIT
 * 
 * @dependencies
 * - redis: Redis client for Node.js
 * 
 * @usage
 * To run the script, use the following command:
 * ```
 * node redisClient.js
 * ```
 * 
 * @notes
 * - Ensure that Redis is running locally before running the script.
 * 
 * @maintainer
 * - GitHub Copilot
 */

const redis = require('redis');

// Redis connection options
const redisOptions = {
  url: 'redis://localhost:6379',
};

// Sample record to insert
const sampleRecord = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  age: 30,
  createdAt: new Date().toISOString(),
};

async function writeRecord() {
  const client = redis.createClient(redisOptions);

  client.on('error', (err) => console.error('Redis Client Error', err));

  try {
    // Connect to Redis
    await client.connect();
    console.log('Connected to Redis');

    // Insert the sample record
    const key = 'user:1001';
    await client.set(key, JSON.stringify(sampleRecord));
    console.log(`Record inserted with key: ${key}`);
  } catch (error) {
    console.error('Error writing record to Redis:', error);
  } finally {
    // Disconnect from Redis
    await client.disconnect();
    console.log('Redis connection closed');
  }
}

// Run the writeRecord function
writeRecord();