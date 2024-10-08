"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startConsumer = void 0;
const kafkajs_1 = require("kafkajs");
const client_1 = require("../redis/client");
const extendedTreeNode_1 = require("../tree/extendedTreeNode");
const kafka = new kafkajs_1.Kafka({
    brokers: ['kafka-broker:9092'],
    clientId: 'my-app',
});
const consumer = kafka.consumer({ groupId: 'consumer-group' });
const MAX_RETRIES = 3;
/**
 * Handles the node message by parsing it and storing it in Redis.
 * @param message - The message payload from Kafka.
 */
function handleNodeMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!message.message.value) {
            throw new Error('Message value is null or undefined');
        }
        const { node } = JSON.parse(message.message.value.toString());
        const extendedTreeNode = Object.assign(new extendedTreeNode_1.ExtendedTreeNode(node.uuid, node.className, node.data, node.cryptoKey, node.signature, new Date(node.createdAt), new Date(node.modifiedAt)), node);
        yield client_1.redisClient.set(extendedTreeNode.uuid, JSON.stringify(extendedTreeNode));
        console.log(`ExtendedTreeNode with UUID ${extendedTreeNode.uuid} stored in Redis`);
    });
}
/**
 * Handles the message with retry logic.
 * @param handler - The function to handle the message.
 * @param payload - The message payload.
 * @param retries - The current retry count.
 */
function handleMessageWithRetry(
// eslint-disable-next-line no-unused-vars
handler, payload, retries = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield handler(payload);
        }
        catch (error) {
            if (retries < MAX_RETRIES) {
                console.error(`Error processing message. Retrying... (${retries + 1}/${MAX_RETRIES})`);
                yield handleMessageWithRetry(handler, payload, retries + 1);
            }
            else {
                console.error(`Failed to process message after ${MAX_RETRIES} retries.`);
                throw error;
            }
        }
    });
}
/**
 * Starts the Kafka consumer.
 * Connects to the Kafka broker, subscribes to the topic, and processes incoming messages.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function startConsumer() {
    return __awaiter(this, void 0, void 0, function* () {
        yield consumer.connect();
        yield consumer.subscribe({ topic: 'node-topic', fromBeginning: true });
        yield consumer.run({
            /**
             * Processes each message from the Kafka topic.
             * @param payload - The message payload.
             */
            eachMessage: (payload) => __awaiter(this, void 0, void 0, function* () {
                const { topic } = payload;
                try {
                    if (topic === 'node-topic') {
                        yield handleMessageWithRetry(handleNodeMessage, payload);
                    }
                }
                catch (error) {
                    console.error(`Error processing message from topic ${topic}:`, error);
                }
            }),
        });
        // Graceful shutdown
        process.on('SIGINT', () => __awaiter(this, void 0, void 0, function* () {
            console.log('Disconnecting consumer...');
            yield consumer.disconnect();
            process.exit(0);
        }));
        process.on('SIGTERM', () => __awaiter(this, void 0, void 0, function* () {
            console.log('Disconnecting consumer...');
            yield consumer.disconnect();
            process.exit(0);
        }));
    });
}
exports.startConsumer = startConsumer;
startConsumer().catch(console.error);
//# sourceMappingURL=consumer.js.map