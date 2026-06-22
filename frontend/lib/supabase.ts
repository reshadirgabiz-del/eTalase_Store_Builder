import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;
let cachedSourceClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in frontend/.env");
  }

  cachedClient ??= createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}

export function getEtalaseSourceSupabase(): SupabaseClient {
  const url = process.env.ETALASE_SOURCE_SUPABASE_URL;
  const key = process.env.ETALASE_SOURCE_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "ETALASE_SOURCE_SUPABASE_URL and ETALASE_SOURCE_SUPABASE_SERVICE_ROLE_KEY must be set in frontend/.env",
    );
  }

  cachedSourceClient ??= createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedSourceClient;
}

export async function resolveOwnerStoreId(storeKeyOrId: string): Promise<string | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("builder_owners")
    .select("store_id")
    .eq("store_id", storeKeyOrId)
    .maybeSingle();

  if (error) throw error;
  return data?.store_id ?? null;
}

export function jsonError(message: string, status = 500): Response {
  return Response.json({ error: message }, { status });
}
