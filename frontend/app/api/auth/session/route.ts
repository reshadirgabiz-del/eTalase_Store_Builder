import { hashSecretKey, verifySecretKey } from "@/lib/credentials";
import { createSession, destroySession, readSession } from "@/lib/session";
import { getEtalaseSourceSupabase, getSupabaseAdmin, jsonError } from "@/lib/supabase";

export async function GET() {
  const session = await readSession();
  if (!session) {
    return Response.json({ authenticated: false, storeId: null, publicStoreKey: null });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("builder_owners")
    .select("public_store_key")
    .eq("store_id", session.storeId)
    .maybeSingle();

  if (error) return jsonError("Tidak dapat membaca sesi", 500);

  return Response.json({
    authenticated: true,
    storeId: session.storeId,
    publicStoreKey: data?.public_store_key ?? null,
  });
}

export async function POST(request: Request) {
  let body: { storeId?: unknown; secretKey?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError("Permintaan tidak valid", 400);
  }

  const storeId = typeof body.storeId === "string" ? body.storeId.trim() : "";
  const accessKey = typeof body.secretKey === "string" ? body.secretKey.trim() : "";

  if (!storeId || !accessKey) {
    return jsonError("Store ID dan access key wajib diisi", 400);
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("builder_owners")
    .select("store_id, public_store_key, secret_key_hash")
    .eq("store_id", storeId)
    .maybeSingle();

  if (error) return jsonError("Tidak dapat memverifikasi kredensial", 500);

  const ok = data ? await verifySecretKey(accessKey, data.secret_key_hash) : false;
  if (ok) {
    await createSession(data!.store_id);
    return Response.json({ storeId: data!.store_id, publicStoreKey: data!.public_store_key });
  }

  let sourceSupabase;
  try {
    sourceSupabase = getEtalaseSourceSupabase();
  } catch {
    return jsonError("Konfigurasi Supabase sumber toko belum diset", 500);
  }

  const { data: store, error: storeError } = await sourceSupabase
    .from("stores")
    .select("id, public_store_key")
    .eq("id", storeId)
    .maybeSingle();

  if (storeError) return jsonError("Tidak dapat menyinkronkan toko dari SDK", 500);
  if (!store) {
    return jsonError("Store ID tidak ditemukan di Supabase sumber eTalase", 401);
  }
  if (!store.public_store_key) {
    return jsonError("Toko ditemukan, tetapi public_store_key kosong di Supabase sumber eTalase", 401);
  }
  if (store.public_store_key !== accessKey) {
    return jsonError("Access key tidak cocok dengan public_store_key toko di Supabase sumber eTalase", 401);
  }

  const secretKeyHash = await hashSecretKey(accessKey);
  const { error: upsertError } = await supabase
    .from("builder_owners")
    .upsert(
      {
        store_id: store.id,
        public_store_key: store.public_store_key,
        secret_key_hash: secretKeyHash,
      },
      { onConflict: "store_id" },
    );

  if (upsertError) return jsonError("Tidak dapat menyimpan sinkronisasi toko", 500);

  await createSession(store.id);
  return Response.json({ storeId: store.id, publicStoreKey: store.public_store_key });
}

export async function DELETE() {
  await destroySession();
  return Response.json({ ok: true });
}
