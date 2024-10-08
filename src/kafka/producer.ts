/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  brokers: ['kafka-broker:9092'],
  clientId: 'my-app',
});

export const producer = kafka.producer();

export async function sendMessage(topic: string, message: string) {
  await producer.connect();
  await producer.send({
    messages: [{ value: message }],
    topic,
  });
  await producer.disconnect();
}
