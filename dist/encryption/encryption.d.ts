import { JWK } from 'jose';
export declare function encryptData(data: string, publicKey: JWK): Promise<string>;
export declare function decryptData(jwe: string, privateKey: JWK): Promise<string>;
export declare function signData(data: string, senderPrivateKey: JWK): Promise<string>;
export declare function verifySignature(jwt: string, senderPublicKey: JWK): Promise<boolean>;
//# sourceMappingURL=encryption.d.ts.map