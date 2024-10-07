import { AVLTreeNode } from 'avl-tree-typed';
import {
  generateKeyPair,
  SignJWT,
  jwtVerify,
  CompactEncrypt,
  compactDecrypt,
} from 'jose';
import { v4 as uuidv4 } from 'uuid';

// Generate a key pair for encryption/decryption using jose
async function generateLocalKeyPair(): Promise<{
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );
  return { publicKey: keyPair.publicKey, privateKey: keyPair.privateKey };
}

// Sign the data
async function signData(data: string, privateKey: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const jwt = await new SignJWT({ data: encodedData })
    .setProtectedHeader({ alg: 'RS256' })
    .sign(privateKey);
  return jwt;
}

// Verify the signature
async function verifySignature(
  jwt: string,
  publicKey: CryptoKey
): Promise<boolean> {
  try {
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const { payload } = await jwtVerify(jwt, publicKey);
    return true;
  } catch (e) {
    return false;
  }
}

// Define the ExtendedTreeNode class that extends CustomAVLTreeNode
class ExtendedTreeNode extends AVLTreeNode {
  private encryptedData: string;
  private data: unknown;
  private cryptoKey: CryptoKey;
  private signature: string;

  constructor(
    uuid: string,
    className: string,
    data: unknown,
    cryptoKey: CryptoKey,
    treeKey: string,
    treeValue: unknown,
    signature: string
  ) {
    super(uuid, className, treeKey, treeValue);
    this.encryptedData = '';
    this.data = data;
    this.cryptoKey = cryptoKey;
    this.signature = signature;
    const serializedData = JSON.stringify({ data, signature });
    ExtendedTreeNode.encryptData(serializedData, this.cryptoKey).then(
      (encrypted) => (this.encryptedData = encrypted)
    );
  }

  private static async encryptData(
    data: string,
    key: CryptoKey
  ): Promise<string> {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    const jwe = await new CompactEncrypt(encodedData)
      .setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A256GCM' })
      .encrypt(key);
    return jwe;
  }

  private static async decryptData(
    jwe: string,
    privateKey: CryptoKey
  ): Promise<string> {
    const { plaintext } = await compactDecrypt(jwe, privateKey);
    const decoder = new TextDecoder();
    return decoder.decode(plaintext);
  }

  public async getDecryptedData(): Promise<unknown> {
    const decryptedData = await ExtendedTreeNode.decryptData(
      this.encryptedData,
      this.cryptoKey
    );
    const { data, signature } = JSON.parse(decryptedData);
    this.signature = signature;
    return data;
  }

  public async toJSON(): Promise<string> {
    return JSON.stringify({
      uuid: this.uuid,
      className: this.className,
      encryptedData: this.encryptedData,
      treeKey: this.key,
      treeValue: this.value,
    });
  }

  public static async fromJSON(
    json: string,
    cryptoKey: CryptoKey,
    senderPublicKey: CryptoKey
  ): Promise<ExtendedTreeNode> {
    const obj = JSON.parse(json);
    const decryptedData = await ExtendedTreeNode.decryptData(
      obj.encryptedData,
      cryptoKey
    );
    const { data, signature } = JSON.parse(decryptedData);
    const isValid = await verifySignature(signature, senderPublicKey);
    if (!isValid) {
      throw new Error('Invalid signature');
    }
    const node = new ExtendedTreeNode(
      obj.uuid,
      obj.className,
      data,
      cryptoKey,
      obj.treeKey,
      obj.treeValue,
      signature
    );
    node.encryptedData = obj.encryptedData;
    return node;
  }
}

// Define the ExtendedAVLTree class that extends AVLTree
class ExtendedAVLTree<T extends ExtendedTreeNode> {
  private compareFn: (a: T, b: T) => number;
  private tree: Map<string, T>;

  constructor(compareFn: (a: T, b: T) => number) {
    this.compareFn = compareFn;
    this.tree = new Map();
  }

  add(uuid: string, node: T): void {
    this.tree.set(uuid, node);
  }

  contains(uuid: string): boolean {
    return this.tree.has(uuid);
  }

  find(uuid: string): [string, T] | undefined {
    for (const entry of this.tree.entries()) {
      if (entry[0] === uuid) {
        return entry;
      }
    }
    return undefined;
  }
}

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
    await generateKeyPair();

  const data = { name: 'Alice' };
  const signature = await signData(JSON.stringify(data), senderPrivateKey);

  const node1 = new ExtendedTreeNode(
    uuidv4(),
    'Person',
    data,
    recipientPublicKey, // Encrypt with recipient's public key
    'key1',
    'value1',
    signature
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
}

initializeTree();
