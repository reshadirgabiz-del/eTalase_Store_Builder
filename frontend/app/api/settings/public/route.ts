import { getSupabaseAdmin, jsonError, resolveStoreId } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const storeId = new URL(request.url).searchParams.get("storeId");
    if (!storeId) return jsonError("storeId query param is required", 400);

    const resolvedId = await resolveStoreId(storeId);
    if (!resolvedId) return jsonError("Toko tidak ditemukan", 404);

    const { data, error } = await getSupabaseAdmin()
      .from("settings")
      .select("*")
      .eq("store_id", resolvedId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return jsonError("Settings not found", 404);

    return Response.json({
      storeName: data.store_name ?? "",
      storeDescription: data.store_description ?? "",
      logoUrl: data.logo_url ?? data.store_logo ?? "",
      originAddress: data.origin_address ?? "",
      hideLocation: data.hide_location ?? false,
      midtransEnabled: Boolean(data.midtrans_server_key && data.midtrans_client_key),
      bankTransferEnabled: data.bank_transfer_enabled ?? false,
      bankTransferText: data.bank_transfer_text ?? "",
      bankAccountNumber: data.bank_account_number ?? "",
      bankRecipientName: data.bank_recipient_name ?? "",
      bankName: data.bank_name ?? "",
      currency: data.currency ?? "IDR",
      flatRateDeliveryEnabled: data.flat_rate_delivery_enabled ?? false,
      flatRateDeliveryPrice: data.flat_rate_delivery_price ?? 0,
      flatRateDeliveryName: data.flat_rate_delivery_name ?? "",
      socialLinks: data.social_links ?? [],
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Tidak dapat memuat pengaturan", 500);
  }
}
