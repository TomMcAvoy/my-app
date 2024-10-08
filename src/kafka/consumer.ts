/**
 * @file consumer.ts
 * @description Kafka consumer that reads messages from a Kafka topic and stores them in Redis.
 * @version 1.0.0
 * @date 2023-10-05
 * @license MIT
 *
 * @dependencies
 * - kafkajs: Kafka client for Node.js
 * - redis: Redis client for Node.js
 * - jose: JavaScript Object Signing and Encryption (JOSE) library
 *
 * @usage
 * To start the consumer, run the following command:
 * ```
 * npm start
 * ```
 *
 * @notes
 * - Ensure that Kafka and Redis are running before starting the consumer.
 * - The consumer includes retry logic and graceful shutdown handling.
 *
 * @maintainer
 * - GitHub Copilot
 */

import { Kafka, EachMessagePayload } from 'kafkajs';
import { redisClient } from '../redis/client';
import { ExtendedTreeNode } from '../tree/extendedTreeNode';

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import { importJWK, CompactEncrypt } from 'jose'; // Correct import from jose library

const kafka = new Kafka({
  brokers: ['kafka-broker:9092'],
  clientId: 'my-app',
});

const consumer = kafka.consumer({ groupId: 'consumer-group' });

const MAX_RETRIES = 3;

/**
 * Handles the node message by parsing it and storing it in Redis.
 * @param message - The message payload from Kafka.
 */
async function handleNodeMessage(message: EachMessagePayload) {
  if (!message.message.value) {
    throw new Error('Message value is null or undefined');
  }
  const { node } = JSON.parse(message.message.value.toString());
  const extendedTreeNode = Object.assign(
    new ExtendedTreeNode(
      node.uuid,
      node.className,
      node.data,
      node.cryptoKey,
      node.signature,
      new Date(node.createdAt),
      new Date(node.modifiedAt)
    ),
    node
  );
  await redisClient.set(
    extendedTreeNode.uuid,
    JSON.stringify(extendedTreeNode)
  );
  console.log(
    `ExtendedTreeNode with UUID ${extendedTreeNode.uuid} stored in Redis`
  );
}

/**
 * Handles the message with retry logic.
 * @param handler - The function to handle the message.
 * @param payload - The message payload.
 * @param retries - The current retry count.
 */
async function handleMessageWithRetry(
  // eslint-disable-next-line no-unused-vars
  handler: (message: EachMessagePayload) => Promise<void>,
  payload: EachMessagePayload,
  retries = 0
): Promise<void> {
  try {
    await handler(payload);
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.error(
        `Error processing message. Retrying... (${retries + 1}/${MAX_RETRIES})`
      );
      await handleMessageWithRetry(handler, payload, retries + 1);
    } else {
      console.error(`Failed to process message after ${MAX_RETRIES} retries.`);
      throw error;
    }
  }
}

/**
 * Starts the Kafka consumer.
 * Connects to the Kafka broker, subscribes to the topic, and processes incoming messages.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'node-topic', fromBeginning: true });

  await consumer.run({
    /**
     * Processes each message from the Kafka topic.
     * @param payload - The message payload.
     */
    eachMessage: async (payload) => {
      const { topic } = payload;
      try {
        if (topic === 'node-topic') {
          await handleMessageWithRetry(handleNodeMessage, payload);
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
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Disconnecting consumer...');
    await consumer.disconnect();
    process.exit(0);
  });
}

startConsumer().catch(console.error);
