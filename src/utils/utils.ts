import {
  JWK,
  generateKeyPair,
  exportJWK,
  importJWK,
  CompactSign,
  compactVerify,
} from 'jose';

export async function generateLocalKeyPair(): Promise<{
  privateKey: JWK;
  publicKey: JWK;
}> {
  const { privateKey, publicKey } = await generateKeyPair('RSA-OAEP', {
    modulusLength: 2048,
  });
  const privateJWK = await exportJWK(privateKey);
  const publicJWK = await exportJWK(publicKey);
  return { privateKey: privateJWK, publicKey: publicJWK };
}

export async function signData(data: string, privateKey: JWK): Promise<string> {
  const privateKeyCrypto = await importJWK(privateKey, 'RS256');
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const jws = await new CompactSign(encodedData)
    .setProtectedHeader({ alg: 'RS256' })
    .sign(privateKeyCrypto);
  return jws;
}

export async function verifySignature(
  jws: string,
  publicKey: JWK
): Promise<boolean> {
  const publicKeyCrypto = await importJWK(publicKey, 'RS256');
  try {
    const { payload } = await compactVerify(jws, publicKeyCrypto);
    console.log('Payload:', new TextDecoder().decode(payload));
    return true;
  } catch (e) {
    console.error('Signature verification failed:', e);
    return false;
  }
}
