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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-unused-vars */
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const csurf_1 = __importDefault(require("csurf"));
const kafka_1 = require("../kafka");
const client_1 = require("../redis/client");
const client_2 = require("../mongo/client");
const extendedTreeNode_1 = require("../tree/extendedTreeNode");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)()); // Use Helmet for security headers
app.use((0, csurf_1.default)()); // Enable CSRF protection
app.use(express_1.default.json()); // Middleware to parse JSON request bodies
const MAX_RETRIES = 3;
function sendMessageWithRetry(topic, message, retries = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, kafka_1.sendMessage)(topic, message);
        }
        catch (error) {
            if (retries < MAX_RETRIES) {
                console.error(`Error sending message to ${topic}. Retrying... (${retries + 1}/${MAX_RETRIES})`);
                yield sendMessageWithRetry(topic, message, retries + 1);
            }
            else {
                console.error(`Failed to send message to ${topic} after ${MAX_RETRIES} retries.`);
                throw error;
            }
        }
    });
}
app.post('/read', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uuid } = req.body;
    try {
        yield sendMessageWithRetry('read-topic', JSON.stringify({ replyTopic: 'read-reply-topic', uuid }));
        res.status(200).send('Read request sent to Kafka');
    }
    catch (error) {
        res.status(500).send('Failed to send read request to Kafka');
    }
}));
app.post('/write', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = req.body;
    try {
        yield sendMessageWithRetry('write-topic', JSON.stringify({ replyTopic: 'write-reply-topic', data }));
        res.status(200).send('Write request sent to Kafka');
    }
    catch (error) {
        res.status(500).send('Failed to send write request to Kafka');
    }
}));
app.post('/send-node', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uuid, className, data, cryptoKey, signature, createdAt, modifiedAt } = req.body;
    const node = new extendedTreeNode_1.ExtendedTreeNode(uuid, className, data, cryptoKey, signature, new Date(createdAt), new Date(modifiedAt));
    try {
        yield sendMessageWithRetry('node-topic', JSON.stringify({ replyTopic: 'node-reply-topic', node }));
        res.status(200).send('ExtendedTreeNode sent to Kafka');
    }
    catch (error) {
        res.status(500).send('Failed to send ExtendedTreeNode to Kafka');
    }
}));
app.listen(3000, () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, client_1.connectRedis)();
    yield (0, client_2.connectMongo)();
    console.log('API Gateway listening on port 3000');
}));
//# sourceMappingURL=gateway.js.map