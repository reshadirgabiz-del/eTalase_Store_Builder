import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const KEYLEN = 32;

export async function hashSecretKey(secretKey: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scryptAsync(secretKey, salt, KEYLEN);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifySecretKey(secretKey: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;

  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  if (salt.length === 0 || expected.length !== KEYLEN) return false;

  const derived = await scryptAsync(secretKey, salt, KEYLEN);
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}
