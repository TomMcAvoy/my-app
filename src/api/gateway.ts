/* eslint-disable no-unused-vars */
import express from 'express';
import helmet from 'helmet';
import csurf from 'csurf';
import { sendMessage } from '../kafka';
import { connectRedis } from '../redis/client';
import { connectMongo } from '../mongo/client';
import { ExtendedTreeNode } from '../tree/extendedTreeNode';

const app = express();

app.use(helmet()); // Use Helmet for security headers
app.use(csurf()); // Enable CSRF protection
app.use(express.json()); // Middleware to parse JSON request bodies

const MAX_RETRIES = 3;

async function sendMessageWithRetry(
  topic: string,
  message: string,
  retries = 0
): Promise<void> {
  try {
    await sendMessage(topic, message);
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.error(
        `Error sending message to ${topic}. Retrying... (${
          retries + 1
        }/${MAX_RETRIES})`
      );
      await sendMessageWithRetry(topic, message, retries + 1);
    } else {
      console.error(
        `Failed to send message to ${topic} after ${MAX_RETRIES} retries.`
      );
      throw error;
    }
  }
}

app.post('/read', async (req: express.Request, res: express.Response) => {
  const { uuid } = req.body;
  try {
    await sendMessageWithRetry(
      'read-topic',
      JSON.stringify({ replyTopic: 'read-reply-topic', uuid })
    );
    res.status(200).send('Read request sent to Kafka');
  } catch (error) {
    res.status(500).send('Failed to send read request to Kafka');
  }
});

app.post('/write', async (req: express.Request, res: express.Response) => {
  const { data } = req.body;
  try {
    await sendMessageWithRetry(
      'write-topic',
      JSON.stringify({ replyTopic: 'write-reply-topic', data })
    );
    res.status(200).send('Write request sent to Kafka');
  } catch (error) {
    res.status(500).send('Failed to send write request to Kafka');
  }
});

app.post('/send-node', async (req: express.Request, res: express.Response) => {
  const { uuid, className, data, cryptoKey, signature, createdAt, modifiedAt } =
    req.body;
  const node = new ExtendedTreeNode(
    uuid,
    className,
    data,
    cryptoKey,
    signature,
    new Date(createdAt),
    new Date(modifiedAt)
  );
  try {
    await sendMessageWithRetry(
      'node-topic',
      JSON.stringify({ replyTopic: 'node-reply-topic', node })
    );
    res.status(200).send('ExtendedTreeNode sent to Kafka');
  } catch (error) {
    res.status(500).send('Failed to send ExtendedTreeNode to Kafka');
  }
});

app.listen(3000, async () => {
  await connectRedis();
  await connectMongo();
  console.log('API Gateway listening on port 3000');
});
