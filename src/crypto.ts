import { pbkdf2Sync } from 'pbkdf2';
import crypto from 'crypto';

export function encrypt(vault: Vault, secret: string, salt: string): string {

  const derived = pbkdf2Sync(secret, salt, 10, 32, 'sha256');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', derived, iv);
  const encrypted = iv.toString('hex') + cipher.update(JSON.stringify(vault), 'utf8', 'base64') + cipher.final('base64');

  return encrypted;

}

export function decrypt(encrypted: string, secret: string, salt: string): Vault {

  const derived = pbkdf2Sync(secret, salt, 10, 32, 'sha256');
  const iv = encrypted.substr(0, 32);
  const data = encrypted.substr(32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', derived, Buffer.from(iv, 'hex'));
  const decrypted = decipher.update(data, 'base64', 'utf8') + decipher.final('utf8');

  return JSON.parse(decrypted);

}
