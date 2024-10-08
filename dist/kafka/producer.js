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
exports.sendMessage = exports.producer = void 0;
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const kafkajs_1 = require("kafkajs");
const kafka = new kafkajs_1.Kafka({
    brokers: ['kafka-broker:9092'],
    clientId: 'my-app',
});
exports.producer = kafka.producer();
function sendMessage(topic, message) {
    return __awaiter(this, void 0, void 0, function* () {
        yield exports.producer.connect();
        yield exports.producer.send({
            messages: [{ value: message }],
            topic,
        });
        yield exports.producer.disconnect();
    });
}
exports.sendMessage = sendMessage;
//# sourceMappingURL=producer.js.map