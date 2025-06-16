import * as crypto from "crypto";

/**
 * Encrypts data using AES-256-GCM with a randomly generated key and a unique Initialization Vector (IV).
 * The key and the encrypted data (which internally includes the IV) are returned.
 *
 * @param data The plaintext string to encrypt.
 * @returns A Promise that resolves to an object containing:
 *   - `encrypted`: A string representing the Base64-encoded ciphertext.
 *   - `secret`: A string representing the Base64-encoded secret key.
 */
export async function encryptData(data: string): Promise<{ encrypted: string, secret: string }> {
    // 1. Generate a random AES-GCM key
    const key = await crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256, // 256-bit key
        },
        true, // extractable: true (so we can export it)
        ["encrypt", "decrypt"]
    );

    // 2. Export the key to a raw format (ArrayBuffer) and then Base64 encode it
    const exportedKey = await crypto.subtle.exportKey("raw", key);
    const secret = btoa(String.fromCharCode(...new Uint8Array(exportedKey))); // Base64 encode

    // 3. Generate a random 128-bit (16-byte) Initialization Vector (IV)
    // The IV must be unique for each encryption operation with the same key.
    const iv = crypto.getRandomValues(new Uint8Array(16)); // 16 bytes for AES-GCM

    // 4. Encode the plaintext data to an ArrayBuffer
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    // 5. Encrypt the data
    const ciphertext = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
            // No additionalData needed for this simple case, but it's an option for authenticated encryption
        },
        key,
        encodedData
    );

    // 6. Combine IV and ciphertext, then Base64 encode for storage/transmission
    // It's crucial to store/transmit the IV along with the ciphertext.
    // Here, we prepend the IV to the ciphertext.
    const fullCiphertext = new Uint8Array(iv.length + ciphertext.byteLength);
    fullCiphertext.set(iv, 0);
    fullCiphertext.set(new Uint8Array(ciphertext), iv.length);

    const encrypted = btoa(String.fromCharCode(...fullCiphertext)); // Base64 encode

    return {
        encrypted: encrypted,
        secret: secret,
    };
}

/**
 * Decrypts data using AES-256-GCM with the provided encrypted string and secret key.
 *
 * @param encrypted The Base64-encoded encrypted string (produced by `encryptData`), which includes the IV.
 * @param secret The Base64-encoded secret key (produced by `encryptData`).
 * @returns A Promise that resolves to the decrypted plaintext string.
 */
export async function decryptData(encrypted: string, secret: string): Promise<string> {
    // 1. Decode the Base64 secret key and import it
    const decodedKey = Uint8Array.from(atob(secret), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey(
        "raw",
        decodedKey,
        { name: "AES-GCM" },
        true, // extractable: true
        ["encrypt", "decrypt"]
    );

    // 2. Decode the Base64 encrypted data
    const fullCiphertext = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));

    // 3. Extract the IV (first 16 bytes) and the actual ciphertext
    const iv = fullCiphertext.slice(0, 16);
    const ciphertext = fullCiphertext.slice(16);

    // 4. Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        ciphertext
    );

    // 5. Decode the decrypted ArrayBuffer back to a string
    const decoder = new TextDecoder();
    const plaintext = decoder.decode(decryptedBuffer);

    return plaintext;
}

// Example Usage (run this in a browser's developer console):
/*
(async () => {
    const originalData = "This is a very secret message that needs to be encrypted and decrypted.";
    console.log("Original Data:", originalData);

    try {
        const { encrypted, secret } = await encryptData(originalData);
        console.log("Encrypted Data (Base64):", encrypted);
        console.log("Secret Key (Base64):", secret);

        const decryptedData = await decryptData(encrypted, secret);
        console.log("Decrypted Data:", decryptedData);
        console.log("Decryption successful:", originalData === decryptedData);
    } catch (error) {
        console.error("Encryption/Decryption failed:", error);
    }
})();
*/
