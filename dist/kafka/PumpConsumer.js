"use strict";
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
const mongodb_1 = require("mongodb");
const kafka = new kafkajs_1.Kafka({
    brokers: ['kafka-broker:9092'],
    clientId: 'my-app',
});
const consumer = kafka.consumer({ groupId: 'consumer-group' });
const mongoClient = new mongodb_1.MongoClient('mongodb://localhost:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
/**
 * Handles the batch message by parsing it and storing it in MongoDB.
 * @param message - The message payload from Kafka.
 */
function handleBatchMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const db = mongoClient.db('mydatabase');
        const collection = db.collection('mycollection');
        const { key, value } = message.message;
        const parsedData = JSON.parse(value.toString());
        yield collection.insertOne(parsedData);
        console.log(`Data with key ${key} inserted into MongoDB`);
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
        yield mongoClient.connect();
        yield consumer.subscribe({ topic: 'batch-topic', fromBeginning: true });
        yield consumer.run({
            /**
             * Processes each message from the Kafka topic.
             * @param payload - The message payload.
             */
            eachMessage: (payload) => __awaiter(this, void 0, void 0, function* () {
                const { topic } = payload;
                try {
                    if (topic === 'batch-topic') {
                        yield handleBatchMessage(payload);
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
            yield mongoClient.close();
            process.exit(0);
        }));
        process.on('SIGTERM', () => __awaiter(this, void 0, void 0, function* () {
            console.log('Disconnecting consumer...');
            yield consumer.disconnect();
            yield mongoClient.close();
            process.exit(0);
        }));
    });
}
exports.startConsumer = startConsumer;
startConsumer().catch(console.error);
//# sourceMappingURL=PumpConsumer.js.map