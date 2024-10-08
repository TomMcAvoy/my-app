/**
 * @file redisClient.js
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
 * node redisClient.js
 * ```
 * 
 * @notes
 * - Ensure that Redis is running locally before running the script.
 * 
 * @maintainer
 * - GitHub Copilot
 */

const redis = require('redis');
const { Observable } = require('rxjs');
const { v4: uuidv4 } = require('uuid');

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
    const record = { ...sampleRecordTemplate, uuid: uuidv4() };
    records.push(record);
  }
  return records;
}

function writeRecords() {
  return new Observable((observer) => {
    const client = redis.createClient(redisOptions);
    const records = generateUniqueRecords(10);

    client.on('error', (err) => console.error('Redis Client Error', err));

    client.connect()
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

    // Graceful shutdown
    const shutdown = async () => {
      if (client.isOpen) {
        console.log('Disconnecting Redis client...');
        await client.disconnect();
        console.log('Redis client disconnected');
      }
      readRecords().subscribe({
        next: (msg) => console.log(msg),
        complete: () => {
          console.log('Record reading complete');
          process.exit(0);
        },
        error: (err) => console.error('Error reading records:', err),
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

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
  return new Observable((observer) => {
    const client = redis.createClient(redisOptions);

    client.on('error', (err) => console.error('Redis Client Error', err));

    client.connect()
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
      })
      .finally(() => {
        if (client.isOpen) {
          client.disconnect().then(() => {
            console.log('Redis connection closed');
          });
        }
      });

    // Graceful shutdown
    const shutdown = async () => {
      if (client.isOpen) {
        console.log('Disconnecting Redis client...');
        await client.disconnect();
        console.log('Redis client disconnected');
      }
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

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
  return new Observable((observer) => {
    const subscriber = redis.createClient(redisOptions);

    subscriber.on('error', (err) => console.error('Redis Subscriber Error', err));

    subscriber.connect()
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

    // Graceful shutdown
    const shutdown = async () => {
      if (subscriber.isOpen) {
        console.log('Disconnecting subscriber...');
        await subscriber.unsubscribe(channel);
        await subscriber.disconnect();
        console.log('Subscriber disconnected');
      }
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

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

// Handle SIGINT and SIGTERM to read records
const handleShutdown = () => {
  readRecords().subscribe({
    next: (msg) => console.log(msg),
    complete: () => {
      console.log('Record reading complete');
      process.exit(0);
    },
    error: (err) => console.error('Error reading records:', err),
  });
};

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);
