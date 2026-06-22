-- eTalase Builder database schema
-- Target: Supabase Postgres
--
-- Scope: this database stores ONLY builder-owned data — the published
-- storefront configuration (template choice, theme, texts, hidden components)
-- and the custom URI mapping. Store info, settings, and products are fetched
-- at runtime from the eTalase SDK using the store's public key, so they are
-- intentionally NOT modeled here.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- One row per published storefront.
-- store_id and public_store_key are external identifiers from the eTalase
-- platform; they are stored here purely as keys for SDK lookups and routing.
-- custom_store_uri is the full published URL, e.g. https://store.e-talase.com/bosqueshop.
create table if not exists public.storefront_publications (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null,
  public_store_key text not null,
  custom_store_uri text not null,
  alias text not null,
  template_id text not null default 'storefront-classic',
  theme jsonb not null default '{}'::jsonb,
  texts jsonb not null default '{}'::jsonb,
  hidden jsonb not null default '{}'::jsonb,
  config jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint storefront_publications_store_id_unique unique (store_id),
  constraint storefront_publications_custom_store_uri_unique unique (custom_store_uri),
  constraint storefront_publications_alias_unique unique (alias)
);

create index if not exists storefront_publications_public_store_key_idx
  on public.storefront_publications (public_store_key);

create index if not exists storefront_publications_published_at_idx
  on public.storefront_publications (published_at desc);

drop trigger if exists storefront_publications_set_updated_at on public.storefront_publications;
create trigger storefront_publications_set_updated_at
before update on public.storefront_publications
for each row execute function public.set_updated_at();

-- Owner credentials for write authorization.
-- Login uses store_id + merchant secret key. public_store_key remains only
-- for public SDK reads after the owner has been authorized.
-- secret_key_hash is scrypt(salt || secret_key) hex; the salt is embedded
-- in the hash record (format: "scrypt$<saltHex>$<derivedHex>") so rotation
-- does not require a schema change. Rows are seeded by the platform admin
-- when a merchant is onboarded — the builder never writes this table.
create table if not exists public.builder_owners (
  store_id uuid primary key,
  public_store_key text not null unique,
  secret_key_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint builder_owners_secret_key_hash_format
    check (secret_key_hash ~ '^scrypt\$[0-9a-f]+\$[0-9a-f]+$')
);

create index if not exists builder_owners_public_store_key_idx
  on public.builder_owners (public_store_key);

drop trigger if exists builder_owners_set_updated_at on public.builder_owners;
create trigger builder_owners_set_updated_at
before update on public.builder_owners
for each row execute function public.set_updated_at();

-- Useful seed shape for manual testing:
-- insert into public.storefront_publications
--   (store_id, public_store_key, custom_store_uri, alias)
-- values
--   ('00000000-0000-0000-0000-000000000001',
--    'etalase_pk_live_demo',
--    'https://store.e-talase.com/bosqueshop',
--    'bosqueshop');
