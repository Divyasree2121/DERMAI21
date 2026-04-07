/**
 * @fileOverview Client-side encryption utility using Web Crypto API.
 * Provides AES-GCM encryption and decryption for securing report data in localStorage.
 * Includes stack-safe Base64 conversion for large dermatoscopic images.
 */

const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_DERIVATION_ALGORITHM = 'PBKDF2';
const HASH_ALGORITHM = 'SHA-256';
const ITERATIONS = 100000;

async function deriveKey(password: string, salt: Uint8Array) {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: KEY_DERIVATION_ALGORITHM,
      salt: salt,
      iterations: ITERATIONS,
      hash: HASH_ALGORITHM,
    },
    baseKey,
    { name: ENCRYPTION_ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Robust conversion from Uint8Array to Base64 string to avoid stack size issues with large data.
 * Replaces the spread operator (...combined) which can cause RangeError.
 */
function uint8ArrayToBase64(uint8: Uint8Array): string {
  let binary = '';
  const len = uint8.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}

/**
 * Robust conversion from Base64 string to Uint8Array.
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function encryptData(data: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const key = await deriveKey(password, salt);
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: ENCRYPTION_ALGORITHM, iv },
    key,
    encodedData
  );

  const combined = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);

  return uint8ArrayToBase64(combined);
}

export async function decryptData(encryptedBase64: string, password: string): Promise<string> {
  const combined = base64ToUint8Array(encryptedBase64);

  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const encryptedBuffer = combined.slice(28);

  const key = await deriveKey(password, salt);
  
  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      key,
      encryptedBuffer
    );
    return new TextDecoder().decode(decryptedBuffer);
  } catch (e) {
    throw new Error('Incorrect password or corrupted data.');
  }
}
