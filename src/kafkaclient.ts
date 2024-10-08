import { Kafka, EachMessagePayload, KafkaMessage } from 'kafkajs';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { createClient, RedisClientType } from 'redis';

// Kafka connection options
const kafka = new Kafka({
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
async function createTopic(): Promise<void> {
  const admin = kafka.admin();
  await admin.connect();
  console.log('Connected to Kafka as admin');

  const topics = await admin.listTopics();
  if (!topics.includes(topic)) {
    await admin.createTopics({
      topics: [
        {
          topic,
          numPartitions: 1,
          replicationFactor: 1,
        },
      ],
    });
    console.log(`Topic ${topic} created`);
  } else {
    console.log(`Topic ${topic} already exists`);
  }

  await admin.disconnect();
  console.log('Admin disconnected');
}

// Function to produce a message to Kafka
function produceMessage(): Observable<string> {
  return new Observable((observer) => {
    const producer = kafka.producer();

    producer
      .connect()
      .then(() => {
        console.log('Connected to Kafka as producer');

        // Generate a unique key for the message
        const key = uuidv4();
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
function consumeMessages(): Observable<EachMessagePayload> {
  return new Observable((observer) => {
    const consumer = kafka.consumer({ groupId: 'test-group' });
    const client: RedisClientType = createClient(redisOptions);

    client.on('error', (err) => console.error('Redis Client Error', err));

    const connectRedis = async () => {
      if (!client.isOpen) {
        await client.connect();
      }
    };

    consumer
      .connect()
      .then(() => {
        console.log('Connected to Kafka as consumer');
        return consumer.subscribe({ topic, fromBeginning: true });
      })
      .then(() => {
        return consumer.run({
          eachMessage: async ({
            topic,
            partition,
            message,
            heartbeat,
            pause,
          }: EachMessagePayload) => {
            await connectRedis(); // Ensure Redis client is connected

            const msg = {
              partition,
              offset: message.offset,
              key: message.key?.toString(),
              value: message.value?.toString(),
            };
            console.log(msg);

            // Store in Redis with UUID as key
            const key = `kafka:${msg.key}`;
            await client.set(key, JSON.stringify(msg));
            console.log(`Message with key ${msg.key} stored in Redis`);

            observer.next({ topic, partition, message, heartbeat, pause });
          },
        });
      })
      .catch((error) => {
        observer.error(error);
      });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('Disconnecting consumer...');
      await consumer.disconnect();
      console.log('Consumer disconnected');
      await client.quit();
      console.log('Redis client disconnected');
      observer.complete();
      process.exit(0);
    };

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

// Run the createTopic, produceMessage, and consumeMessages functions
(async () => {
  await createTopic();
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
})();

export { consumeMessages };
