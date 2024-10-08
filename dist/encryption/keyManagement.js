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
exports.KeyManagement = void 0;
const jose_1 = require("jose");
class KeyManagement {
    constructor() {
        this.keyStore = new Map();
    }
    static getInstance() {
        if (!KeyManagement.instance) {
            KeyManagement.instance = new KeyManagement();
        }
        return KeyManagement.instance;
    }
    generateKeyPair(keyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { publicKey, privateKey } = yield (0, jose_1.generateKeyPair)('RSA-OAEP', {
                modulusLength: 2048,
            });
            const publicJWK = yield (0, jose_1.exportJWK)(publicKey);
            const privateJWK = yield (0, jose_1.exportJWK)(privateKey);
            const keyPair = { publicKey: publicJWK, privateKey: privateJWK };
            this.keyStore.set(keyId, keyPair);
            return keyPair;
        });
    }
    getKeyPair(keyId) {
        return this.keyStore.get(keyId);
    }
    // these routines are not used in the current implementation
    importPublicKey(jwk) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield (0, jose_1.importJWK)(jwk, 'RSA-OAEP'));
        });
    }
    // these routines are not used in the current implementation
    importPrivateKey(jwk) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield (0, jose_1.importJWK)(jwk, 'RSA-OAEP'));
        });
    }
}
exports.KeyManagement = KeyManagement;
//# sourceMappingURL=keyManagement.js.map