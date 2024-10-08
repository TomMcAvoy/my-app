import { JWK } from 'jose';
export interface KeyPair {
    publicKey: JWK;
    privateKey: JWK;
}
export declare class KeyManagement {
    private static instance;
    private keyStore;
    private constructor();
    static getInstance(): KeyManagement;
    generateKeyPair(keyId: string): Promise<KeyPair>;
    getKeyPair(keyId: string): KeyPair | undefined;
    importPublicKey(jwk: JWK): Promise<CryptoKey>;
    importPrivateKey(jwk: JWK): Promise<CryptoKey>;
}
//# sourceMappingURL=keyManagement.d.ts.map