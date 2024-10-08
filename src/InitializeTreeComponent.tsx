/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { ExtendedTreeNode } from './tree';
import { v4 as uuidv4 } from 'uuid';
import { generateLocalKeyPair } from './utils/utils';
import { signData } from './encryption/encryption';

const InitializeTreeComponent: React.FC = () => {
  useEffect(() => {
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

      const signature = await signData(
        JSON.stringify(apiData),
        senderPrivateKey
      );

      const node1 = new ExtendedTreeNode(
        uuidv4(),
        'APIRequestResponse',
        apiData,
        recipientPublicKey,
        signature,
        new Date(),
        new Date()
      );

      console.log(await node1.getDecryptedData());
    }

    initializeTree();
  }, []);

  return (
    <div>
      <h2>Initializing Tree...</h2>
    </div>
  );
};

export default InitializeTreeComponent;
