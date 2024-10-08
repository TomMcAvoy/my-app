import { JWK, generateKeyPair, exportJWK, importJWK } from 'jose';

export interface KeyPair {
  publicKey: JWK;
  privateKey: JWK;
}

export class KeyManagement {
  private static instance: KeyManagement;
  private keyStore: Map<string, KeyPair>;

  private constructor() {
    this.keyStore = new Map();
  }

  public static getInstance(): KeyManagement {
    if (!KeyManagement.instance) {
      KeyManagement.instance = new KeyManagement();
    }
    return KeyManagement.instance;
  }

  public async generateKeyPair(keyId: string): Promise<KeyPair> {
    const { publicKey, privateKey } = await generateKeyPair('RSA-OAEP', {
      modulusLength: 2048,
    });
    const publicJWK = await exportJWK(publicKey);
    const privateJWK = await exportJWK(privateKey);
    const keyPair: KeyPair = { publicKey: publicJWK, privateKey: privateJWK };
    this.keyStore.set(keyId, keyPair);
    return keyPair;
  }

  public getKeyPair(keyId: string): KeyPair | undefined {
    return this.keyStore.get(keyId);
  }

  // these routines are not used in the current implementation
  public async importPublicKey(jwk: JWK): Promise<CryptoKey> {
    return (await importJWK(jwk, 'RSA-OAEP')) as CryptoKey;
  }
  // these routines are not used in the current implementation
  public async importPrivateKey(jwk: JWK): Promise<CryptoKey> {
    return (await importJWK(jwk, 'RSA-OAEP')) as CryptoKey;
  }
}
