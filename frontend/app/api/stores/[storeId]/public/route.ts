import { getSupabaseAdmin, jsonError, resolveStoreId } from "@/lib/supabase";

type Params = Promise<{ storeId: string }>;

export async function GET(_: Request, { params }: { params: Params }) {
  try {
    const { storeId } = await params;
    const resolvedId = await resolveStoreId(storeId);
    if (!resolvedId) return jsonError("Toko tidak ditemukan", 404);

    const { data, error } = await getSupabaseAdmin()
      .from("stores")
      .select("name, logo_url, public_store_key")
      .eq("id", resolvedId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return jsonError("Toko tidak ditemukan", 404);

    return Response.json({
      storeId: resolvedId,
      storeName: data.name ?? "",
      storePhotoUrl: data.logo_url ?? null,
      publicKey: data.public_store_key ?? null,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Tidak dapat memuat toko", 500);
  }
}
