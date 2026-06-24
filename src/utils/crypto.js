// Native Web Crypto API utilities for SecureVault

// Helpers to convert between ArrayBuffer and Base64 strings
export const bufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

export const base64ToBuffer = (base64) => {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// Convert string to UTF-8 ArrayBuffer
const stringToBuffer = (str) => {
  return new TextEncoder().encode(str);
};

// Convert UTF-8 ArrayBuffer to string
const bufferToString = (buf) => {
  return new TextDecoder().decode(buf);
};

// Derive cryptographic key from master password and salt using PBKDF2
export const deriveKey = async (password, saltBuffer) => {
  const subtle = window.crypto.subtle;
  
  // 1. Import the raw password as a key-generating key
  const passwordKey = await subtle.importKey(
    "raw",
    stringToBuffer(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  // 2. Derive the AES-GCM key from PBKDF2
  return await subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: 100000,
      hash: "SHA-256"
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

// Encrypt plaintext using derived key and AES-GCM
export const encryptData = async (plainText, key) => {
  const subtle = window.crypto.subtle;
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 12 bytes IV is standard for AES-GCM
  const encodedText = stringToBuffer(plainText);

  const encryptedBuffer = await subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    encodedText
  );

  return {
    ciphertext: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv)
  };
};

// Decrypt ciphertext using derived key and AES-GCM
export const decryptData = async (ciphertextBase64, ivBase64, key) => {
  const subtle = window.crypto.subtle;
  const iv = new Uint8Array(base64ToBuffer(ivBase64));
  const ciphertext = base64ToBuffer(ciphertextBase64);

  const decryptedBuffer = await subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    ciphertext
  );

  return bufferToString(decryptedBuffer);
};

// Setup a new vault: generate salt, derive key, and encrypt verification token
export const setupVault = async (masterPassword) => {
  const salt = window.crypto.getRandomValues(new Uint8Array(16)); // 16 bytes salt
  const key = await deriveKey(masterPassword, salt);
  const verifier = await encryptData("vault-unlocked", key);

  return {
    salt: bufferToBase64(salt),
    verifierCipher: verifier.ciphertext,
    verifierIv: verifier.iv,
    key // Return key so user is logged in immediately
  };
};

// Verify master password: try decrypting verification token
export const unlockVault = async (masterPassword, saltBase64, verifierCipher, verifierIv) => {
  try {
    const salt = new Uint8Array(base64ToBuffer(saltBase64));
    const key = await deriveKey(masterPassword, salt);
    const decrypted = await decryptData(verifierCipher, verifierIv, key);

    if (decrypted === "vault-unlocked") {
      return key;
    } else {
      throw new Error("Invalid master password");
    }
  } catch (e) {
    throw new Error("Invalid master password");
  }
};

// Derive recovery key from recovery phrase (normalized string) and salt
export const deriveRecoveryKey = async (recoveryPhrase, saltBuffer) => {
  const subtle = window.crypto.subtle;
  const normalizedPhrase = recoveryPhrase.trim().toLowerCase().replace(/\s+/g, " ");

  const phraseKey = await subtle.importKey(
    "raw",
    stringToBuffer(normalizedPhrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return await subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: 100000,
      hash: "SHA-256"
    },
    phraseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

// Encrypt the master password using a recovery phrase
export const encryptMasterPassword = async (masterPassword, recoveryPhrase) => {
  const recoverySalt = window.crypto.getRandomValues(new Uint8Array(16));
  const recoveryKey = await deriveRecoveryKey(recoveryPhrase, recoverySalt);
  const encrypted = await encryptData(masterPassword, recoveryKey);

  return {
    recoverySalt: bufferToBase64(recoverySalt),
    recoveryEncryptedPassword: encrypted.ciphertext,
    recoveryEncryptedIv: encrypted.iv
  };
};

// Decrypt the master password using a recovery phrase
export const decryptMasterPassword = async (recoveryPhrase, recoverySaltBase64, encryptedPasswordBase64, encryptedIvBase64) => {
  const recoverySalt = new Uint8Array(base64ToBuffer(recoverySaltBase64));
  const recoveryKey = await deriveRecoveryKey(recoveryPhrase, recoverySalt);
  return await decryptData(encryptedPasswordBase64, encryptedIvBase64, recoveryKey);
};

// Setup a new Security PIN: generate salt, derive key, and encrypt verification token
export const setupPin = async (pin) => {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(pin, salt);
  const verifier = await encryptData("pin-verified", key);

  return {
    pinSalt: bufferToBase64(salt),
    pinVerifierCipher: verifier.ciphertext,
    pinVerifierIv: verifier.iv
  };
};

// Verify PIN: try decrypting verification token
export const verifyPin = async (pin, saltBase64, verifierCipher, verifierIv) => {
  try {
    const salt = new Uint8Array(base64ToBuffer(saltBase64));
    const key = await deriveKey(pin, salt);
    const decrypted = await decryptData(verifierCipher, verifierIv, key);

    return decrypted === "pin-verified";
  } catch {
    return false;
  }
};
