import { createClient } from 'redis';

export const redisClient = createClient();

export async function connectRedis(): Promise<void> {
  await redisClient.connect();
}
