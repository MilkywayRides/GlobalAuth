// Simple browser-compatible encryption for OAuth demo
export class E2EEncryption {
  static encryptOAuthData(data: any): string {
    const jsonData = JSON.stringify(data);
    // Use base64 encoding with a simple obfuscation for demo
    const encoded = btoa(jsonData);
    const obfuscated = encoded.split('').reverse().join('');
    return obfuscated;
  }

  static decryptOAuthData(encryptedString: string): any {
    try {
      // Reverse the obfuscation
      const encoded = encryptedString.split('').reverse().join('');
      const jsonData = atob(encoded);
      return JSON.parse(jsonData);
    } catch (error) {
      throw new Error('Failed to decrypt OAuth data');
    }
  }
}

// Secure token generation (browser compatible)
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for server-side
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Hash sensitive data (browser compatible)
export async function hashSensitiveData(data: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback for server-side
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
