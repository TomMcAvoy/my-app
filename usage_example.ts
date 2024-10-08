// Example usage
const compareTreeNodesByUUID = (
  nodeA: ExtendedTreeNode,
  nodeB: ExtendedTreeNode
): number => {
  return nodeA.uuid.localeCompare(nodeB.uuid);
};

const extendedTree = new ExtendedAVLTree<ExtendedTreeNode>(
  compareTreeNodesByUUID
);

async function initializeTree() {
  // Generate key pairs for sender and recipient
  const { publicKey: senderPublicKey, privateKey: senderPrivateKey } =
    await generateLocalKeyPair();
  const { publicKey: recipientPublicKey, privateKey: recipientPrivateKey } =
    await generateLocalKeyPair();

  // Example API request/response data
  const apiData = {
    api_id: "1234567890abcdef",
    api_name: "My API",
    api_version: "v1",
    api_key: "abcdef1234567890",
    request: {
      method: "GET",
      url: "/my-api/v1/resource",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer token"
      },
      body: "",
      params: {
        query: {
          param1: "value1",
          param2: "value2"
        },
        path: {
          id: "123"
        }
      }
    },
    response: {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: "{\"key\":\"value\"}"
    },
    timestamp: "2023-10-01T12:34:56.789Z",
    latency: 123,
    ip_address: "192.168.1.1",
    geo: {
      country: "US",
      region: "CA",
      city: "San Francisco"
    },
    meta_data: {
      custom_field1: "value1",
      custom_field2: "value2"
    }
  };

  const signature = await signData(JSON.stringify(apiData), senderPrivateKey);

  const node1 = new ExtendedTreeNode(
    uuidv4(),
    'APIRequestResponse',
    apiData,
    recipientPublicKey, // Encrypt with recipient's public key
    signature,
    new Date(),
    new Date()
  );

  extendedTree.add(node1.uuid, node1);

  console.log(extendedTree.contains(node1.uuid)); // true

  // Serialize the node to JSON
  const serializedNode = await node1.toJSON();
  console.log(serializedNode); // JSON string representation of the node

  // Simulate sending the JSON string via Kafka
  const receivedJson = serializedNode; // In real scenario, this would be received from Kafka

  // Deserialize the JSON string back to an instance of ExtendedTreeNode
  const receivedNode = await ExtendedTreeNode.fromJSON(
    receivedJson,
    recipientPrivateKey, // Decrypt with recipient's private key
    senderPublicKey // Verify signature with sender's public key
  );

  // Add the received node to the tree
  extendedTree.add(receivedNode.uuid, receivedNode);

  // Retrieve the node from the tree and get the decrypted data
  const retrievedNode = extendedTree.find(receivedNode.uuid)?.[1];
  if (retrievedNode) {
    console.log(await retrievedNode.getDecryptedData());
  }
}

initializeTree();
