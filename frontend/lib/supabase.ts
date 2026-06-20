import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let cachedClient: SupabaseClient | null = null;

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

export async function resolveStoreId(storeKeyOrId: string): Promise<string | null> {
  if (UUID_RE.test(storeKeyOrId)) return storeKeyOrId;

  const { data, error } = await getSupabaseAdmin()
    .from("stores")
    .select("id")
    .eq("public_store_key", storeKeyOrId)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

export function jsonError(message: string, status = 500): Response {
  return Response.json({ error: message }, { status });
}
