"use strict";
/**
 * @file redisClient.ts
 * @description Enhanced Redis client using RxJS and Pub/Sub that writes, reads, and outputs messages to/from a Redis database.
 * @version 1.0.0
 * @date 2023-10-05
 * @license MIT
 *
 * @dependencies
 * - redis: Redis client for Node.js
 * - rxjs: Reactive Extensions for JavaScript
 * - uuid: UUID generation for unique keys
 *
 * @usage
 * To run the script, use the following command:
 * ```
 * npx ts-node redisClient.ts
 * ```
 *
 * @notes
 * - Ensure that Redis is running locally before running the script.
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
const redis_1 = require("redis");
const rxjs_1 = require("rxjs");
const uuid_1 = require("uuid");
// Redis connection options
const redisOptions = {
    url: 'redis://localhost:6379',
};
// Sample record template
const sampleRecordTemplate = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: 30,
    createdAt: new Date().toISOString(),
};
function generateUniqueRecords(count) {
    const records = [];
    for (let i = 0; i < count; i++) {
        const record = Object.assign(Object.assign({}, sampleRecordTemplate), { uuid: (0, uuid_1.v4)() });
        records.push(record);
    }
    return records;
}
function writeRecords() {
    return new rxjs_1.Observable((observer) => {
        const client = (0, redis_1.createClient)(redisOptions);
        const records = generateUniqueRecords(10);
        client.on('error', (err) => console.error('Redis Client Error', err));
        client
            .connect()
            .then(() => {
            console.log('Connected to Redis');
            const promises = records.map((record) => {
                const key = `user:${record.uuid}`;
                return client.set(key, JSON.stringify(record));
            });
            return Promise.all(promises);
        })
            .then(() => {
            console.log('Records inserted');
            observer.next('Records inserted');
            observer.complete();
        })
            .catch((error) => {
            observer.error(error);
        });
        return () => {
            if (client.isOpen) {
                client.disconnect().then(() => {
                    console.log('Redis connection closed');
                });
            }
        };
    });
}
function readRecords() {
    return new rxjs_1.Observable((observer) => {
        const client = (0, redis_1.createClient)(redisOptions);
        client.on('error', (err) => console.error('Redis Client Error', err));
        client
            .connect()
            .then(() => {
            console.log('Connected to Redis');
            return client.keys('user:*');
        })
            .then((keys) => {
            const promises = keys.map((key) => client.get(key));
            return Promise.all(promises);
        })
            .then((records) => {
            records.forEach((record) => {
                console.log('Record:', JSON.parse(record));
            });
            observer.next('Records read');
            observer.complete();
        })
            .catch((error) => {
            observer.error(error);
        });
        return () => {
            if (client.isOpen) {
                client.disconnect().then(() => {
                    console.log('Redis connection closed');
                });
            }
        };
    });
}
function subscribeToChannel(channel) {
    return new rxjs_1.Observable((observer) => {
        const subscriber = (0, redis_1.createClient)(redisOptions);
        subscriber.on('error', (err) => console.error('Redis Subscriber Error', err));
        subscriber
            .connect()
            .then(() => {
            console.log(`Subscribed to channel: ${channel}`);
            subscriber.subscribe(channel, (message) => {
                console.log(`Received message from channel ${channel}: ${message}`);
                observer.next(message);
            });
        })
            .catch((error) => {
            observer.error(error);
        });
        return () => {
            if (subscriber.isOpen) {
                subscriber.unsubscribe(channel).then(() => {
                    subscriber.disconnect().then(() => {
                        console.log('Subscriber disconnected');
                    });
                });
            }
        };
    });
}
// Handle SIGINT and SIGTERM to read records
const handleShutdown = () => {
    readRecords().subscribe({
        next: (msg) => console.log(msg),
        complete: () => __awaiter(void 0, void 0, void 0, function* () {
            console.log('Record reading complete');
            process.exit(0);
        }),
        error: (err) => console.error('Error reading records:', err),
    });
};
process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);
// Run the writeRecords and subscribeToChannel functions
writeRecords().subscribe({
    next: (msg) => console.log(msg),
    complete: () => console.log('Record writing complete'),
    error: (err) => console.error('Error writing records:', err),
});
subscribeToChannel('test-channel').subscribe({
    next: (msg) => console.log('Received message:', msg),
    complete: () => console.log('Subscription complete'),
    error: (err) => console.error('Error subscribing to channel:', err),
});
exports.default = { writeRecords, readRecords, subscribeToChannel };
//# sourceMappingURL=redisClient.js.map