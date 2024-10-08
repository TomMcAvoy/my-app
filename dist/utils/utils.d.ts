import { JWK } from 'jose';
export declare function generateLocalKeyPair(): Promise<{
    privateKey: JWK;
    publicKey: JWK;
}>;
export declare function signData(data: string, privateKey: JWK): Promise<string>;
export declare function verifySignature(jws: string, publicKey: JWK): Promise<boolean>;
//# sourceMappingURL=utils.d.ts.map