"use strict";
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
exports.consumeMessages = void 0;
const kafkajs_1 = require("kafkajs");
const rxjs_1 = require("rxjs");
const uuid_1 = require("uuid");
const redis_1 = require("redis");
// Kafka connection options
const kafka = new kafkajs_1.Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092'],
});
// Redis connection options
const redisOptions = {
    url: 'redis://localhost:6379',
    // password: 'your_password', // Uncomment if your Redis server requires a password
};
// Kafka topic
const topic = 'test-topic';
// Function to create a Kafka topic
function createTopic() {
    return __awaiter(this, void 0, void 0, function* () {
        const admin = kafka.admin();
        yield admin.connect();
        console.log('Connected to Kafka as admin');
        const topics = yield admin.listTopics();
        if (!topics.includes(topic)) {
            yield admin.createTopics({
                topics: [
                    {
                        topic,
                        numPartitions: 1,
                        replicationFactor: 1,
                    },
                ],
            });
            console.log(`Topic ${topic} created`);
        }
        else {
            console.log(`Topic ${topic} already exists`);
        }
        yield admin.disconnect();
        console.log('Admin disconnected');
    });
}
// Function to produce a message to Kafka
function produceMessage() {
    return new rxjs_1.Observable((observer) => {
        const producer = kafka.producer();
        producer
            .connect()
            .then(() => {
            console.log('Connected to Kafka as producer');
            // Generate a unique key for the message
            const key = (0, uuid_1.v4)();
            const sampleMessage = {
                key,
                value: JSON.stringify({
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    age: 30,
                    createdAt: new Date().toISOString(),
                }),
            };
            return producer.send({
                topic,
                messages: [sampleMessage],
            });
        })
            .then(() => {
            console.log(`Message produced to topic ${topic}`);
            observer.next(`Message produced to topic ${topic}`);
            observer.complete();
        })
            .catch((error) => {
            observer.error(error);
        })
            .finally(() => {
            producer.disconnect().then(() => {
                console.log('Producer disconnected');
            });
        });
        return () => {
            producer.disconnect().then(() => {
                console.log('Producer disconnected');
            });
        };
    });
}
// Function to consume messages from Kafka and store in Redis
function consumeMessages() {
    return new rxjs_1.Observable((observer) => {
        const consumer = kafka.consumer({ groupId: 'test-group' });
        const client = (0, redis_1.createClient)(redisOptions);
        client.on('error', (err) => console.error('Redis Client Error', err));
        const connectRedis = () => __awaiter(this, void 0, void 0, function* () {
            if (!client.isOpen) {
                yield client.connect();
            }
        });
        consumer
            .connect()
            .then(() => {
            console.log('Connected to Kafka as consumer');
            return consumer.subscribe({ topic, fromBeginning: true });
        })
            .then(() => {
            return consumer.run({
                eachMessage: ({ topic, partition, message, heartbeat, pause, }) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b;
                    yield connectRedis(); // Ensure Redis client is connected
                    const msg = {
                        partition,
                        offset: message.offset,
                        key: (_a = message.key) === null || _a === void 0 ? void 0 : _a.toString(),
                        value: (_b = message.value) === null || _b === void 0 ? void 0 : _b.toString(),
                    };
                    console.log(msg);
                    // Store in Redis with UUID as key
                    const key = `kafka:${msg.key}`;
                    yield client.set(key, JSON.stringify(msg));
                    console.log(`Message with key ${msg.key} stored in Redis`);
                    observer.next({ topic, partition, message, heartbeat, pause });
                }),
            });
        })
            .catch((error) => {
            observer.error(error);
        });
        // Graceful shutdown
        const shutdown = () => __awaiter(this, void 0, void 0, function* () {
            console.log('Disconnecting consumer...');
            yield consumer.disconnect();
            console.log('Consumer disconnected');
            yield client.quit();
            console.log('Redis client disconnected');
            observer.complete();
            process.exit(0);
        });
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
        return () => {
            consumer.disconnect().then(() => {
                console.log('Consumer disconnected');
            });
            client.quit().then(() => {
                console.log('Redis client disconnected');
            });
        };
    });
}
exports.consumeMessages = consumeMessages;
// Run the createTopic, produceMessage, and consumeMessages functions
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield createTopic();
    produceMessage().subscribe({
        next: (msg) => console.log(msg),
        complete: () => console.log('Message production complete'),
        error: (err) => console.error('Error producing message:', err),
    });
    consumeMessages().subscribe({
        next: (msg) => console.log('Consumed message:', msg),
        complete: () => console.log('Message consumption complete'),
        error: (err) => console.error('Error consuming message:', err),
    });
}))();
//# sourceMappingURL=kafkaclient.js.map