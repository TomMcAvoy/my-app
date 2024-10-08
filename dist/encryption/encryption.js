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
exports.verifySignature = exports.signData = exports.decryptData = exports.encryptData = void 0;
const jose_1 = require("jose");
function encryptData(data, publicKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const publicKeyCrypto = yield (0, jose_1.importJWK)(publicKey, 'RSA-OAEP-256');
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(data);
        const jwe = yield new jose_1.CompactEncrypt(encodedData)
            .setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A256GCM' })
            .encrypt(publicKeyCrypto);
        return jwe;
    });
}
exports.encryptData = encryptData;
function decryptData(jwe, privateKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const privateKeyCrypto = yield (0, jose_1.importJWK)(privateKey, 'RSA-OAEP-256');
        const { plaintext } = yield (0, jose_1.compactDecrypt)(jwe, privateKeyCrypto);
        return new TextDecoder().decode(plaintext);
    });
}
exports.decryptData = decryptData;
function signData(data, senderPrivateKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(data);
        const jwt = yield new jose_1.SignJWT({ data: encodedData })
            .setProtectedHeader({ alg: 'RS256' })
            .sign(senderPrivateKey);
        return jwt;
    });
}
exports.signData = signData;
function verifySignature(jwt, senderPublicKey) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // eslint-disable-next-line no-unused-vars
            yield (0, jose_1.jwtVerify)(jwt, senderPublicKey);
            return true;
        }
        catch (e) {
            return false;
        }
    });
}
exports.verifySignature = verifySignature;
//# sourceMappingURL=encryption.js.map