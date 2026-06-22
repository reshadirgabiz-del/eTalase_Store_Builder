import { readSession } from "@/lib/session";
import { getSupabaseAdmin, jsonError, resolveOwnerStoreId } from "@/lib/supabase";

const STOREFRONT_BASE_URL = (process.env.NEXT_PUBLIC_STOREFRONT_BASE_URL ?? "https://store.e-talase.com").replace(/\/+$/, "");

function normalizeAlias(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isValidAlias(value: string) {
  return /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])$/.test(value);
}

function uriForAlias(alias: string) {
  return `${STOREFRONT_BASE_URL}/${alias}`;
}

async function findPublicationByAlias(alias: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("storefront_publications")
    .select("store_id, public_store_key, alias, custom_store_uri, template_id, theme, texts, hidden, config, published_at")
    .eq("alias", alias)
    .maybeSingle();

  if (error) throw error;
  return data;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function lookupOwnerPublicKey(storeId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("builder_owners")
    .select("public_store_key")
    .eq("store_id", storeId)
    .maybeSingle();

  if (error) throw error;
  return data?.public_store_key ?? null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const alias = normalizeAlias(searchParams.get("alias") ?? "");
    const callerStoreKey = searchParams.get("storeId") ?? "";

    if (!isValidAlias(alias)) {
      return jsonError("Nama link tidak valid", 400);
    }

    const existing = await findPublicationByAlias(alias);
    const callerStoreId = callerStoreKey ? await resolveOwnerStoreId(callerStoreKey) : null;
    const available = !existing || Boolean(callerStoreId && existing.store_id === callerStoreId);

    return Response.json({
      alias,
      customStoreUri: existing?.custom_store_uri ?? uriForAlias(alias),
      available,
      storeId: existing?.store_id ?? null,
      publicStoreKey: existing?.public_store_key ?? null,
      templateId: existing?.template_id ?? null,
      theme: existing?.theme ?? null,
      texts: existing?.texts ?? null,
      hidden: existing?.hidden ?? null,
      config: existing?.config ?? null,
      publishedAt: existing?.published_at ?? null,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Tidak dapat memeriksa link storefront", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await readSession();
    if (!session) return jsonError("Sesi tidak ditemukan. Silakan login ulang.", 401);

    const body = await request.json();
    const alias = normalizeAlias(String(body.alias ?? ""));
    const storeKey = String(body.storeId ?? "");
    const templateId = typeof body.templateId === "string" ? body.templateId : "storefront-classic";
    const theme = isPlainObject(body.theme) ? body.theme : {};
    const texts = isPlainObject(body.texts) ? body.texts : {};
    const hidden = isPlainObject(body.hidden) ? body.hidden : {};
    const config = isPlainObject(body.config) ? body.config : {};

    if (!isValidAlias(alias)) {
      return jsonError("Nama link tidak valid", 400);
    }

    const resolvedId = await resolveOwnerStoreId(storeKey);
    if (!resolvedId) return jsonError("Toko tidak ditemukan", 404);

    if (resolvedId !== session.storeId) {
      return jsonError("Tidak diizinkan mengubah link toko ini", 403);
    }

    const existing = await findPublicationByAlias(alias);
    if (existing && existing.store_id !== resolvedId) {
      return jsonError("Link ini sudah digunakan. Pilih nama lain.", 409);
    }

    const publicStoreKey = await lookupOwnerPublicKey(resolvedId);
    if (!publicStoreKey) return jsonError("Public key untuk toko tidak ditemukan", 500);

    const customStoreUri = uriForAlias(alias);
    const { data, error } = await getSupabaseAdmin()
      .from("storefront_publications")
      .upsert(
        {
          store_id: resolvedId,
          public_store_key: publicStoreKey,
          alias,
          custom_store_uri: customStoreUri,
          template_id: templateId,
          theme,
          texts,
          hidden,
          config,
          is_published: true,
          published_at: new Date().toISOString(),
        },
        { onConflict: "store_id" },
      )
      .select("store_id, public_store_key, alias, custom_store_uri, template_id, theme, texts, hidden, config, published_at")
      .single();

    if (error) throw error;

    return Response.json({
      alias: data.alias,
      storeId: data.store_id,
      publicStoreKey: data.public_store_key,
      customStoreUri: data.custom_store_uri,
      templateId: data.template_id,
      theme: data.theme,
      texts: data.texts,
      hidden: data.hidden,
      config: data.config,
      publishedAt: data.published_at,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Tidak dapat menyimpan link storefront", 500);
  }
}
