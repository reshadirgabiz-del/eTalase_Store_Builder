import { serializeProduct } from "@/lib/products";
import { getSupabaseAdmin, jsonError, resolveStoreId } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const storeId = searchParams.get("storeId");
    if (!storeId) return jsonError("storeId query param is required", 400);

    const resolvedId = await resolveStoreId(storeId);
    if (!resolvedId) return jsonError("Toko tidak ditemukan", 404);

    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(Math.max(1, Number.parseInt(searchParams.get("limit") ?? "10", 10) || 10), 10);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await getSupabaseAdmin()
      .from("products")
      .select("*, product_images(*), product_variants(*)", { count: "exact" })
      .eq("store_id", resolvedId)
      .eq("is_active", true)
      .eq("is_archived", false)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return Response.json({
      data: (data ?? []).map(serializeProduct),
      total: count ?? 0,
      page,
      limit,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Tidak dapat memuat produk", 500);
  }
}
