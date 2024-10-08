/**
 * @file pumpConsumer.ts
 * @description Kafka consumer that reads batch messages from Kafka and stores them in MongoDB.
 * @version 1.0.0
 * @date 2023-10-05
 * @license MIT
 *
 * @dependencies
 * - kafkajs: Kafka client for Node.js
 * - mongodb: MongoDB client for Node.js
 *
 * @usage
 * To start the consumer, run the following command:
 * ```
 * npm start
 * ```
 *
 * @notes
 * - Ensure that Kafka and MongoDB are running before starting the consumer.
 *
 * @maintainer
 * - GitHub Copilot
 */

import { Kafka, EachMessagePayload } from 'kafkajs';
import { MongoClient } from 'mongodb';

const kafka = new Kafka({
  brokers: ['kafka-broker:9092'],
  clientId: 'my-app',
});

const consumer = kafka.consumer({ groupId: 'consumer-group' });
const mongoClient = new MongoClient('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

/**
 * Handles the batch message by parsing it and storing it in MongoDB.
 * @param message - The message payload from Kafka.
 */
async function handleBatchMessage(message) {
  const db = mongoClient.db('mydatabase');
  const collection = db.collection('mycollection');
  const { key, value } = message.message;

  const parsedData = JSON.parse(value.toString());
  await collection.insertOne(parsedData);
  console.log(`Data with key ${key} inserted into MongoDB`);
}

/**
 * Starts the Kafka consumer.
 * Connects to the Kafka broker, subscribes to the topic, and processes incoming messages.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function startConsumer() {
  await consumer.connect();
  await mongoClient.connect();
  await consumer.subscribe({ topic: 'batch-topic', fromBeginning: true });

  await consumer.run({
    /**
     * Processes each message from the Kafka topic.
     * @param payload - The message payload.
     */
    eachMessage: async (payload) => {
      const { topic } = payload;
      try {
        if (topic === 'batch-topic') {
          await handleBatchMessage(payload);
        }
      } catch (error) {
        console.error(`Error processing message from topic ${topic}:`, error);
      }
    },
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Disconnecting consumer...');
    await consumer.disconnect();
    await mongoClient.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Disconnecting consumer...');
    await consumer.disconnect();
    await mongoClient.close();
    process.exit(0);
  });
}

startConsumer().catch(console.error);
