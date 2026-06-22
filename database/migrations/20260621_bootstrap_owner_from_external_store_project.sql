-- Builder owner bootstrap from an external eTalase Supabase project.
--
-- No builder DB table change is required for this. The application reads the
-- source project using these server-side environment variables:
--
--   ETALASE_SOURCE_SUPABASE_URL
--   ETALASE_SOURCE_SUPABASE_SERVICE_ROLE_KEY
--
-- The source project must contain public.stores(id, public_store_key).
-- On successful Store ID + public key verification, the builder app upserts:
--
--   public.builder_owners(store_id, public_store_key, secret_key_hash)
--
-- into the builder Supabase project.

comment on table public.builder_owners is
  'Builder authorization cache. Rows can be admin-seeded or bootstrapped after validating store_id + public_store_key against the external eTalase Supabase project.';
