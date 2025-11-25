import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'tmp', 'auth-codes.json');

// Ensure tmp directory exists
const tmpDir = path.dirname(STORAGE_FILE);
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

interface AuthCodeData {
  user: any;
  scope: string;
  clientId: string;
}

interface StorageData {
  [key: string]: AuthCodeData;
}

export function storeAuthCode(code: string, data: AuthCodeData) {
  try {
    let storage: StorageData = {};
    if (fs.existsSync(STORAGE_FILE)) {
      storage = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
    }
    
    storage[code] = data;
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(storage, null, 2));
    console.log('Stored auth code:', code);
  } catch (error) {
    console.error('Error storing auth code:', error);
  }
}

export function getAuthCode(code: string): AuthCodeData | null {
  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      return null;
    }
    
    const storage: StorageData = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
    return storage[code] || null;
  } catch (error) {
    console.error('Error getting auth code:', error);
    return null;
  }
}

export function deleteAuthCode(code: string) {
  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      return;
    }
    
    const storage: StorageData = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
    delete storage[code];
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(storage, null, 2));
    console.log('Deleted auth code:', code);
  } catch (error) {
    console.error('Error deleting auth code:', error);
  }
}
