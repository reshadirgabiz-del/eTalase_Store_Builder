#!/usr/bin/env node
// Usage: node scripts/seed-owner.mjs <store_uuid> <etalase_pk_live_...> <etalase_sk_live_...>
// Prints an INSERT statement for builder_owners with a scrypt-hashed secret_key.

import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const [, , storeId, publicKey, secretKey] = process.argv;

if (!storeId || !publicKey || !secretKey) {
  console.error("Usage: node scripts/seed-owner.mjs <store_uuid> <public_key> <secret_key>");
  process.exit(1);
}

const salt = randomBytes(16);
const derived = await scryptAsync(secretKey, salt, 32);
const hash = `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;

const sql = `insert into public.builder_owners (store_id, public_store_key, secret_key_hash)
values (
  '${storeId.replace(/'/g, "''")}',
  '${publicKey.replace(/'/g, "''")}',
  '${hash}'
)
on conflict (store_id) do update set
  public_store_key = excluded.public_store_key,
  secret_key_hash = excluded.secret_key_hash;`;

console.log(sql);
