import {
  JWK,
  importJWK,
  CompactEncrypt,
  compactDecrypt,
  SignJWT,
  jwtVerify,
} from 'jose';

export async function encryptData(
  data: string,
  publicKey: JWK
): Promise<string> {
  const publicKeyCrypto = await importJWK(publicKey, 'RSA-OAEP-256');
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const jwe = await new CompactEncrypt(encodedData)
    .setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A256GCM' })
    .encrypt(publicKeyCrypto);
  return jwe;
}

export async function decryptData(
  jwe: string,
  privateKey: JWK
): Promise<string> {
  const privateKeyCrypto = await importJWK(privateKey, 'RSA-OAEP-256');
  const { plaintext } = await compactDecrypt(jwe, privateKeyCrypto);
  return new TextDecoder().decode(plaintext);
}

export async function signData(
  data: string,
  senderPrivateKey: JWK
): Promise<string> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const jwt = await new SignJWT({ data: encodedData })
    .setProtectedHeader({ alg: 'RS256' })
    .sign(senderPrivateKey);
  return jwt;
}

export async function verifySignature(
  jwt: string,
  senderPublicKey: JWK
): Promise<boolean> {
  try {
    // eslint-disable-next-line no-unused-vars
    await jwtVerify(jwt, senderPublicKey);
    return true;
  } catch (e) {
    return false;
  }
}
