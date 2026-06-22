-- Require builder login with Store ID + secret key.
--
-- This keeps public_store_key only as the public SDK key used by published
-- storefronts. It must not be accepted as the login identifier.

create extension if not exists pgcrypto;

alter table public.builder_owners
  add column if not exists secret_key_hash text;

alter table public.builder_owners
  alter column secret_key_hash set not null;

alter table public.builder_owners
  add constraint builder_owners_secret_key_hash_format
  check (secret_key_hash ~ '^scrypt\$[0-9a-f]+\$[0-9a-f]+$') not valid;

alter table public.builder_owners
  validate constraint builder_owners_secret_key_hash_format;

drop index if exists public.builder_owners_public_store_key_idx;

create index if not exists builder_owners_public_store_key_idx
  on public.builder_owners (public_store_key);

comment on column public.builder_owners.store_id is
  'Canonical merchant Store ID. Builder login must use this value, not public_store_key.';

comment on column public.builder_owners.public_store_key is
  'Public SDK key for loading store data in published storefronts. Not a login credential.';

comment on column public.builder_owners.secret_key_hash is
  'scrypt hash of the merchant secret key, format scrypt$saltHex$derivedHex. The plaintext secret key is never stored.';
