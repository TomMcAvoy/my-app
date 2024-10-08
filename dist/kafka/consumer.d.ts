/**
 * @file consumer.ts
 * @description Kafka consumer that reads messages from a Kafka topic and stores them in Redis.
 * @version 1.0.0
 * @date 2023-10-05
 * @license MIT
 *
 * @dependencies
 * - kafkajs: Kafka client for Node.js
 * - redis: Redis client for Node.js
 * - jose: JavaScript Object Signing and Encryption (JOSE) library
 *
 * @usage
 * To start the consumer, run the following command:
 * ```
 * npm start
 * ```
 *
 * @notes
 * - Ensure that Kafka and Redis are running before starting the consumer.
 * - The consumer includes retry logic and graceful shutdown handling.
 *
 * @maintainer
 * - GitHub Copilot
 */
/**
 * Starts the Kafka consumer.
 * Connects to the Kafka broker, subscribes to the topic, and processes incoming messages.
 */
export declare function startConsumer(): Promise<void>;
//# sourceMappingURL=consumer.d.ts.map