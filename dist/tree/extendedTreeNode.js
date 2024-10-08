"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendedTreeNode = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
const avl_tree_typed_1 = require("avl-tree-typed");
const encryption_1 = require("../encryption/encryption");
class ExtendedTreeNode extends avl_tree_typed_1.AVLTreeNode {
    constructor(uuid, className, data, cryptoKey, signature, createdAt, modifiedAt) {
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
        (0, encryption_1.encryptData)(serializedData, this.cryptoKey).then((encrypted) => (this.encryptedData = encrypted));
    }
    getClassName() {
        return this.className;
    }
    getCreatedAt() {
        return this.createdAt;
    }
    getCryptoKey() {
        return this.cryptoKey;
    }
    getData() {
        return this.data;
    }
    getDecryptedData() {
        return __awaiter(this, void 0, void 0, function* () {
            const decryptedData = yield (0, encryption_1.decryptData)(this.encryptedData, this.cryptoKey);
            const { data, signature } = JSON.parse(decryptedData);
            this.signature = signature;
            return data;
        });
    }
    getEncryptedData() {
        return this.encryptedData;
    }
    getModifiedAt() {
        return this.modifiedAt;
    }
    getSignature() {
        return this.signature;
    }
    getVersion() {
        return this.version;
    }
    incrementVersion() {
        this.version += 1;
        this.modifiedAt = new Date();
    }
    setClassName(className) {
        this.className = className;
    }
    setCreatedAt(createdAt) {
        this.createdAt = createdAt;
    }
    setCryptoKey(cryptoKey) {
        this.cryptoKey = cryptoKey;
    }
    setData(data) {
        this.data = data;
    }
    setEncryptedData(encryptedData) {
        this.encryptedData = encryptedData;
    }
    setModifiedAt(modifiedAt) {
        this.modifiedAt = modifiedAt;
    }
    setSignature(signature) {
        this.signature = signature;
    }
    setVersion(version) {
        this.version = version;
    }
    toJSON() {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    static fromJSON(json, cryptoKey, senderPublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = JSON.parse(json);
            const decryptedData = yield (0, encryption_1.decryptData)(obj.encryptedData, cryptoKey);
            const { data, signature } = JSON.parse(decryptedData);
            const isValid = yield (0, encryption_1.verifySignature)(signature, senderPublicKey);
            if (!isValid) {
                throw new Error('Invalid signature');
            }
            const node = new ExtendedTreeNode(obj.uuid, obj.className, data, cryptoKey, signature, new Date(obj.createdAt), new Date(obj.modifiedAt));
            node.encryptedData = obj.encryptedData;
            return node;
        });
    }
}
exports.ExtendedTreeNode = ExtendedTreeNode;
exports.default = ExtendedTreeNode;
//# sourceMappingURL=extendedTreeNode.js.map