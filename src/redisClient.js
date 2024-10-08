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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var redis_1 = require("redis");
var rxjs_1 = require("rxjs");
var uuid_1 = require("uuid");
// Redis connection options
var redisOptions = {
    url: 'redis://localhost:6379',
};
// Sample record template
var sampleRecordTemplate = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: 30,
    createdAt: new Date().toISOString(),
};
function generateUniqueRecords(count) {
    var records = [];
    for (var i = 0; i < count; i++) {
        var record = __assign(__assign({}, sampleRecordTemplate), { uuid: (0, uuid_1.v4)() });
        records.push(record);
    }
    return records;
}
function writeRecords() {
    return new rxjs_1.Observable(function (observer) {
        var client = (0, redis_1.createClient)(redisOptions);
        var records = generateUniqueRecords(10);
        client.on('error', function (err) { return console.error('Redis Client Error', err); });
        client
            .connect()
            .then(function () {
            console.log('Connected to Redis');
            var promises = records.map(function (record) {
                var key = "user:".concat(record.uuid);
                return client.set(key, JSON.stringify(record));
            });
            return Promise.all(promises);
        })
            .then(function () {
            console.log('Records inserted');
            observer.next('Records inserted');
            observer.complete();
        })
            .catch(function (error) {
            observer.error(error);
        });
        return function () {
            if (client.isOpen) {
                client.disconnect().then(function () {
                    console.log('Redis connection closed');
                });
            }
        };
    });
}
function readRecords() {
    return new rxjs_1.Observable(function (observer) {
        var client = (0, redis_1.createClient)(redisOptions);
        client.on('error', function (err) { return console.error('Redis Client Error', err); });
        client
            .connect()
            .then(function () {
            console.log('Connected to Redis');
            return client.keys('user:*');
        })
            .then(function (keys) {
            var promises = keys.map(function (key) { return client.get(key); });
            return Promise.all(promises);
        })
            .then(function (records) {
            records.forEach(function (record) {
                console.log('Record:', JSON.parse(record));
            });
            observer.next('Records read');
            observer.complete();
        })
            .catch(function (error) {
            observer.error(error);
        });
        return function () {
            if (client.isOpen) {
                client.disconnect().then(function () {
                    console.log('Redis connection closed');
                });
            }
        };
    });
}
function subscribeToChannel(channel) {
    return new rxjs_1.Observable(function (observer) {
        var subscriber = (0, redis_1.createClient)(redisOptions);
        subscriber.on('error', function (err) {
            return console.error('Redis Subscriber Error', err);
        });
        subscriber
            .connect()
            .then(function () {
            console.log("Subscribed to channel: ".concat(channel));
            subscriber.subscribe(channel, function (message) {
                console.log("Received message from channel ".concat(channel, ": ").concat(message));
                observer.next(message);
            });
        })
            .catch(function (error) {
            observer.error(error);
        });
        return function () {
            if (subscriber.isOpen) {
                subscriber.unsubscribe(channel).then(function () {
                    subscriber.disconnect().then(function () {
                        console.log('Subscriber disconnected');
                    });
                });
            }
        };
    });
}
// Handle SIGINT and SIGTERM to read records
var handleShutdown = function () {
    readRecords().subscribe({
        next: function (msg) { return console.log(msg); },
        complete: function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('Record reading complete');
                process.exit(0);
                return [2 /*return*/];
            });
        }); },
        error: function (err) { return console.error('Error reading records:', err); },
    });
};
process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);
// Run the writeRecords and subscribeToChannel functions
writeRecords().subscribe({
    next: function (msg) { return console.log(msg); },
    complete: function () { return console.log('Record writing complete'); },
    error: function (err) { return console.error('Error writing records:', err); },
});
subscribeToChannel('test-channel').subscribe({
    next: function (msg) { return console.log('Received message:', msg); },
    complete: function () { return console.log('Subscription complete'); },
    error: function (err) { return console.error('Error subscribing to channel:', err); },
});
exports.default = { writeRecords: writeRecords, readRecords: readRecords, subscribeToChannel: subscribeToChannel };
