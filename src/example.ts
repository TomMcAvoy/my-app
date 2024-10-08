import { generateLocalKeyPair } from './utils/utils';
import { importJWK, JWK, CompactSign, compactVerify } from 'jose';
import { encryptData, decryptData } from './encryption/encryption';
import { Kafka } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';

interface ExtendedTreeNode {
  id: string;
  type: string;
  data: any;
  publicKey: JWK;
  signature: string;
  createdAt: Date;
  updatedAt: Date;
}

async function signData(data: string, privateKeyJWK: JWK): Promise<string> {
  const privateKey = await importJWK(privateKeyJWK, 'RS256');
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const jws = await new CompactSign(encodedData)
    .setProtectedHeader({ alg: 'RS256' })
    .sign(privateKey);
  return jws;
}

async function verifySignature(
  jws: string,
  publicKeyJWK: JWK
): Promise<boolean> {
  const publicKey = await importJWK(publicKeyJWK, 'RS256');
  try {
    const { payload } = await compactVerify(jws, publicKey);
    return true;
  } catch (e) {
    return false;
  }
}

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'], // Replace with your Kafka broker addresses
});

const producer = kafka.producer();

export async function sendMessage(
  topic: string,
  message: any,
  partition: number
): Promise<void> {
  try {
    await producer.connect();
    console.log(
      `Connected to Kafka broker. Sending message to topic: ${topic}`
    );

    // Generate a unique key for each message
    const key = `${uuidv4()}-${partition}`;

    // Include a counter in the message payload
    message.messageCount = (message.messageCount || 0) + 1;

    await producer.send({
      topic,
      messages: [{ key, value: JSON.stringify(message), partition }],
    });
    console.log(
      `Message sent to topic ${topic}: key=${key}, value=${JSON.stringify(
        message
      )}`
    );
  } catch (error) {
    console.error('Failed to send message to Kafka:', error);
  } finally {
    await producer.disconnect();
    console.log('Disconnected from Kafka broker.');
  }
}

async function initializeTree() {
  const { publicKey: senderPublicKey, privateKey: senderPrivateKey } =
    await generateLocalKeyPair();
  const { publicKey: recipientPublicKey, privateKey: recipientPrivateKey } =
    await generateLocalKeyPair();

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

  const signature = await signData(JSON.stringify(apiData), senderPrivateKey);

  const node: ExtendedTreeNode = {
    id: uuidv4(),
    type: 'APIRequestResponse',
    data: apiData,
    publicKey: recipientPublicKey,
    signature: signature,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  console.log('Node:', node);

  // Encrypt the JWT (signature)
  const encryptedSignature = await encryptData(signature, recipientPublicKey);
  console.log('Encrypted Signature:', encryptedSignature);

  // Add encrypted signature to the node
  const nodeWithEncryptedSignature = {
    ...node,
    encryptedSignature: encryptedSignature,
  };

  // Send node with encrypted signature to Kafka
  try {
    console.log('Attempting to send to Kafka topic');
    await sendMessage('test-topic', nodeWithEncryptedSignature, 0);
    console.log('Message sent to Kafka successfully');
  } catch (error) {
    console.error('Failed to send message to Kafka:', error);
  }

  // Decrypt the JWE (signature)
  const decryptedSignature = await decryptData(
    encryptedSignature,
    recipientPrivateKey
  );
  console.log('Decrypted Signature:', decryptedSignature);

  // Verify the decrypted signature
  const isSignatureValid = await verifySignature(
    decryptedSignature,
    senderPublicKey
  );
  console.log('Is Signature Valid:', isSignatureValid);
}

initializeTree();
