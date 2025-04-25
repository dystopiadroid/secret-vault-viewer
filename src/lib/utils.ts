
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import CryptoJS from 'crypto-js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Encryption utilities
export function encryptValue(value: string, key: string): string {
  if (!value || !key) return '';
  try {
    return CryptoJS.AES.encrypt(value, key).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return 'Encryption Error';
  }
}

export function decryptValue(encryptedValue: string, key: string): string {
  if (!encryptedValue || !key) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedValue, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return 'Decryption Error';
  }
}

// For demo purposes: generate random expiry date
export function generateRandomExpiryDate(): Date {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * 365) + 30; // 30 days to 395 days
  now.setDate(now.getDate() + randomDays);
  return now;
}
