import { AVLTreeNode } from 'avl-tree-typed';
import { JWK } from 'jose';
export declare class ExtendedTreeNode extends AVLTreeNode {
    private className;
    private createdAt;
    private cryptoKey;
    private data;
    private encryptedData;
    private modifiedAt;
    private signature;
    private version;
    uuid: any;
    constructor(uuid: string, className: string, data: unknown, cryptoKey: JWK, signature: string, createdAt: Date, modifiedAt: Date);
    getClassName(): any;
    getCreatedAt(): Date;
    getCryptoKey(): JWK;
    getData(): unknown;
    getDecryptedData(): Promise<unknown>;
    getEncryptedData(): string;
    getModifiedAt(): Date;
    getSignature(): string;
    getVersion(): number;
    incrementVersion(): void;
    setClassName(className: unknown): void;
    setCreatedAt(createdAt: Date): void;
    setCryptoKey(cryptoKey: JWK): void;
    setData(data: unknown): void;
    setEncryptedData(encryptedData: string): void;
    setModifiedAt(modifiedAt: Date): void;
    setSignature(signature: string): void;
    setVersion(version: number): void;
    toJSON(): Promise<string>;
    static fromJSON(json: string, cryptoKey: JWK, senderPublicKey: JWK): Promise<ExtendedTreeNode>;
}
export default ExtendedTreeNode;
//# sourceMappingURL=extendedTreeNode.d.ts.map