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
exports.verifySignature = exports.signData = exports.generateLocalKeyPair = void 0;
const jose_1 = require("jose");
function generateLocalKeyPair() {
    return __awaiter(this, void 0, void 0, function* () {
        const { privateKey, publicKey } = yield (0, jose_1.generateKeyPair)('RSA-OAEP', {
            modulusLength: 2048,
        });
        const privateJWK = yield (0, jose_1.exportJWK)(privateKey);
        const publicJWK = yield (0, jose_1.exportJWK)(publicKey);
        return { privateKey: privateJWK, publicKey: publicJWK };
    });
}
exports.generateLocalKeyPair = generateLocalKeyPair;
function signData(data, privateKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const privateKeyCrypto = yield (0, jose_1.importJWK)(privateKey, 'RS256');
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(data);
        const jws = yield new jose_1.CompactSign(encodedData)
            .setProtectedHeader({ alg: 'RS256' })
            .sign(privateKeyCrypto);
        return jws;
    });
}
exports.signData = signData;
function verifySignature(jws, publicKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const publicKeyCrypto = yield (0, jose_1.importJWK)(publicKey, 'RS256');
        try {
            const { payload } = yield (0, jose_1.compactVerify)(jws, publicKeyCrypto);
            console.log('Payload:', new TextDecoder().decode(payload));
            return true;
        }
        catch (e) {
            console.error('Signature verification failed:', e);
            return false;
        }
    });
}
exports.verifySignature = verifySignature;
//# sourceMappingURL=utils.js.map