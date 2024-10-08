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
exports.sendMessage = void 0;
const utils_1 = require("./utils/utils");
const jose_1 = require("jose");
const encryption_1 = require("./encryption/encryption");
const kafkajs_1 = require("kafkajs");
const uuid_1 = require("uuid");
function signData(data, privateKeyJWK) {
    return __awaiter(this, void 0, void 0, function* () {
        const privateKey = yield (0, jose_1.importJWK)(privateKeyJWK, 'RS256');
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(data);
        const jws = yield new jose_1.CompactSign(encodedData)
            .setProtectedHeader({ alg: 'RS256' })
            .sign(privateKey);
        return jws;
    });
}
function verifySignature(jws, publicKeyJWK) {
    return __awaiter(this, void 0, void 0, function* () {
        const publicKey = yield (0, jose_1.importJWK)(publicKeyJWK, 'RS256');
        try {
            const { payload } = yield (0, jose_1.compactVerify)(jws, publicKey);
            return true;
        }
        catch (e) {
            return false;
        }
    });
}
const kafka = new kafkajs_1.Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092'], // Replace with your Kafka broker addresses
});
const producer = kafka.producer();
function sendMessage(topic, message, partition) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield producer.connect();
            console.log(`Connected to Kafka broker. Sending message to topic: ${topic}`);
            // Generate a unique key for each message
            const key = `${(0, uuid_1.v4)()}-${partition}`;
            // Include a counter in the message payload
            message.messageCount = (message.messageCount || 0) + 1;
            yield producer.send({
                topic,
                messages: [{ key, value: JSON.stringify(message), partition }],
            });
            console.log(`Message sent to topic ${topic}: key=${key}, value=${JSON.stringify(message)}`);
        }
        catch (error) {
            console.error('Failed to send message to Kafka:', error);
        }
        finally {
            yield producer.disconnect();
            console.log('Disconnected from Kafka broker.');
        }
    });
}
exports.sendMessage = sendMessage;
function initializeTree() {
    return __awaiter(this, void 0, void 0, function* () {
        const { publicKey: senderPublicKey, privateKey: senderPrivateKey } = yield (0, utils_1.generateLocalKeyPair)();
        const { publicKey: recipientPublicKey, privateKey: recipientPrivateKey } = yield (0, utils_1.generateLocalKeyPair)();
        const apiData = {
            api_id: '1234567890abcdef',
            api_name: 'My API',
            api_version: 'v1',
            api_key: 'abcdef1234567890',
            request: {
                method: 'GET',
                url: '/my-api/v1/resource',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer token',
                },
                body: '',
                params: {
                    query: {
                        param1: 'value1',
                        param2: 'value2',
                    },
                    path: {
                        id: '123',
                    },
                },
            },
            response: {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: '{"key":"value"}',
            },
            timestamp: '2023-10-01T12:34:56.789Z',
            latency: 123,
            ip_address: '192.168.1.1',
            geo: {
                country: 'US',
                region: 'CA',
                city: 'San Francisco',
            },
            meta_data: {
                custom_field1: 'value1',
                custom_field2: 'value2',
            },
        };
        const signature = yield signData(JSON.stringify(apiData), senderPrivateKey);
        const node = {
            id: (0, uuid_1.v4)(),
            type: 'APIRequestResponse',
            data: apiData,
            publicKey: recipientPublicKey,
            signature: signature,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        console.log('Node:', node);
        // Encrypt the JWT (signature)
        const encryptedSignature = yield (0, encryption_1.encryptData)(signature, recipientPublicKey);
        console.log('Encrypted Signature:', encryptedSignature);
        // Add encrypted signature to the node
        const nodeWithEncryptedSignature = Object.assign(Object.assign({}, node), { encryptedSignature: encryptedSignature });
        // Send node with encrypted signature to Kafka
        try {
            console.log('Attempting to send to Kafka topic');
            yield sendMessage('test-topic', nodeWithEncryptedSignature, 0);
            console.log('Message sent to Kafka successfully');
        }
        catch (error) {
            console.error('Failed to send message to Kafka:', error);
        }
        // Decrypt the JWE (signature)
        const decryptedSignature = yield (0, encryption_1.decryptData)(encryptedSignature, recipientPrivateKey);
        console.log('Decrypted Signature:', decryptedSignature);
        // Verify the decrypted signature
        const isSignatureValid = yield verifySignature(decryptedSignature, senderPublicKey);
        console.log('Is Signature Valid:', isSignatureValid);
    });
}
initializeTree();
//# sourceMappingURL=example.js.map