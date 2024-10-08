/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { AVLTreeNode } from 'avl-tree-typed';
import { JWK, importJWK } from 'jose';
import {
  encryptData,
  decryptData,
  signData,
  verifySignature,
} from '../encryption/encryption';
import { generateLocalKeyPair } from '../utils/utils';

export class ExtendedTreeNode extends AVLTreeNode {
  private className: unknown;
  private createdAt: Date;
  private cryptoKey: JWK;
  private data: unknown;
  private encryptedData: string;
  private modifiedAt: Date;
  private signature: string;
  private version: number;
  uuid: any;

  constructor(
    uuid: string,
    className: string,
    data: unknown,
    cryptoKey: JWK,
    signature: string,
    createdAt: Date,
    modifiedAt: Date
  ) {
    super(uuid, className);
    this.className = className;
    this.createdAt = createdAt;
    this.cryptoKey = cryptoKey;
    this.data = data;
    this.encryptedData = '';
    this.modifiedAt = modifiedAt;
    this.signature = signature;
    this.version = 0;
    const serializedData = JSON.stringify({ data, signature });
    encryptData(serializedData, this.cryptoKey).then(
      (encrypted) => (this.encryptedData = encrypted)
    );
  }

  public getClassName(): any {
    return this.className;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getCryptoKey(): JWK {
    return this.cryptoKey;
  }

  public getData(): unknown {
    return this.data;
  }

  public async getDecryptedData(): Promise<unknown> {
    const decryptedData = await decryptData(this.encryptedData, this.cryptoKey);
    const { data, signature } = JSON.parse(decryptedData);
    this.signature = signature;
    return data;
  }

  public getEncryptedData(): string {
    return this.encryptedData;
  }

  public getModifiedAt(): Date {
    return this.modifiedAt;
  }

  public getSignature(): string {
    return this.signature;
  }

  public getVersion(): number {
    return this.version;
  }

  public incrementVersion(): void {
    this.version += 1;
    this.modifiedAt = new Date();
  }

  public setClassName(className: unknown): void {
    this.className = className;
  }

  public setCreatedAt(createdAt: Date): void {
    this.createdAt = createdAt;
  }

  public setCryptoKey(cryptoKey: JWK): void {
    this.cryptoKey = cryptoKey;
  }

  public setData(data: unknown): void {
    this.data = data;
  }

  public setEncryptedData(encryptedData: string): void {
    this.encryptedData = encryptedData;
  }

  public setModifiedAt(modifiedAt: Date): void {
    this.modifiedAt = modifiedAt;
  }

  public setSignature(signature: string): void {
    this.signature = signature;
  }

  public setVersion(version: number): void {
    this.version = version;
  }

  public async toJSON(): Promise<string> {
    return JSON.stringify({
      className: this.className,
      createdAt: this.createdAt,
      encryptedData: this.encryptedData,
      modifiedAt: this.modifiedAt,
      treeKey: this.key,
      treeValue: this.value,
      uuid: this.uuid,
      version: this.version,
    });
  }

  public static async fromJSON(
    json: string,
    cryptoKey: JWK,
    senderPublicKey: JWK
  ): Promise<ExtendedTreeNode> {
    const obj = JSON.parse(json);
    const decryptedData = await decryptData(obj.encryptedData, cryptoKey);
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
      signature,
      new Date(obj.createdAt),
      new Date(obj.modifiedAt)
    );
    node.encryptedData = obj.encryptedData;
    return node;
  }
}

export default ExtendedTreeNode;
