"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Alert, Button, Loader, Stack, Text } from "@mantine/core";
import { createEtalaseClient } from "etalase-module";
import { colorSchemes, type ColorScheme, type TemplateId } from "@/lib/templates";

const ETALASE_API_URL = process.env.NEXT_PUBLIC_ETALASE_API_URL;
import {
  EMPTY_HIDDEN,
  INITIAL_TEXT,
  StorefrontPreview,
  buildThemeStyle,
  fallbackProducts,
  type HiddenConfig,
  type PreviewPage,
  type Product,
  type ProductTextOverrides,
  type Settings,
  type StoreInfo,
  type TextConfig,
} from "@/app/components/storefront-preview";

type Snapshot = {
  storeId?: string;
  publicKey?: string;
  theme: ColorScheme;
  templateId?: TemplateId;
  texts: TextConfig;
  hidden: HiddenConfig;
  config?: { productTextOverrides?: ProductTextOverrides };
  publishedAt?: string;
  customStoreName?: string;
  customStoreUri?: string;
};

type LoadState = "loading" | "ready" | "missing" | "error";

export default function CustomStorefrontPage({
  params,
}: {
  params: Promise<{ customStoreName: string }>;
}) {
  const { customStoreName } = use(params);
  const alias = useMemo(() => decodeURIComponent(customStoreName), [customStoreName]);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [resolvedStoreId, setResolvedStoreId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<PreviewPage>("home");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const aliasResponse = await fetch(`/api/stores/custom-uri?alias=${encodeURIComponent(alias)}`);
        const aliasJson = await aliasResponse.json();
        if (!aliasResponse.ok) throw new Error(aliasJson.error ?? "Tidak dapat memuat link storefront");
        if (!aliasJson.publicStoreKey) {
          if (!cancelled) setLoadState("missing");
          return;
        }

        const publicKey = aliasJson.publicStoreKey as string;
        if (!cancelled) {
          setResolvedStoreId(aliasJson.storeId ?? null);
          setSnapshot({
            storeId: aliasJson.storeId ?? undefined,
            publicKey,
            theme: (aliasJson.theme ?? colorSchemes[0]) as ColorScheme,
            templateId: (aliasJson.templateId ?? "storefront-classic") as TemplateId,
            texts: (aliasJson.texts ?? {}) as TextConfig,
            hidden: (aliasJson.hidden ?? {}) as HiddenConfig,
            config: (aliasJson.config ?? {}) as { productTextOverrides?: ProductTextOverrides },
            publishedAt: aliasJson.publishedAt ?? undefined,
            customStoreUri: aliasJson.customStoreUri ?? undefined,
          });
        }

        const client = createEtalaseClient({ storeKey: publicKey, apiUrl: ETALASE_API_URL });
        const [info, nextSettings, productPage] = await Promise.all([
          client.store.getInfo(),
          client.store.getSettings(),
          client.products.list({ limit: 10 }),
        ]);

        if (cancelled) return;

        if (info) setStoreInfo({ ...info, publicKey });
        setSettings(nextSettings);
        setProducts(productPage.data ?? []);
        setLoadState("ready");
      } catch (err) {
        if (cancelled) return;
        setLoadState("error");
        setError(err instanceof Error ? err.message : "Tidak dapat memuat storefront");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [alias]);

  const themeStyle = useMemo(
    () => buildThemeStyle(snapshot?.theme ?? colorSchemes[0]),
    [snapshot],
  );

  if (loadState === "missing") {
    return (
      <main className="published-empty">
        <Stack align="center" gap="md" maw={520}>
          <Text size="lg" fw={700}>
            Link storefront tidak ditemukan
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Belum ada toko yang memakai link <code>{alias}</code>.
          </Text>
          <Button component={Link} href="/">
            Kembali ke builder
          </Button>
        </Stack>
      </main>
    );
  }

  if (loadState === "error") {
    return (
      <main className="published-empty">
        <Alert color="red">{error ?? "Gagal memuat storefront ini."}</Alert>
      </main>
    );
  }

  if (loadState === "loading") {
    return (
      <main className="published-empty">
        <Loader />
      </main>
    );
  }

  const liveProducts = products.length > 0 ? products : fallbackProducts;
  const storeName = settings?.storeName || storeInfo?.storeName || "Storefront";
  const logoUrl = settings?.logoUrl || storeInfo?.storePhotoUrl || "";
  const currency = settings?.currency ?? "IDR";
  const texts: TextConfig = { ...INITIAL_TEXT, ...(snapshot?.texts ?? {}) };
  const hidden: HiddenConfig = { ...EMPTY_HIDDEN, ...(snapshot?.hidden ?? {}) };

  return (
    <div className="published-shell" style={themeStyle}>
      <StorefrontPreview
        templateId={snapshot?.templateId ?? "storefront-classic"}
        storeName={storeName}
        logoUrl={logoUrl}
        storeId={storeInfo?.storeId || resolvedStoreId || snapshot?.storeId || alias}
        settings={settings}
        products={liveProducts}
        productTextOverrides={snapshot?.config?.productTextOverrides ?? {}}
        texts={texts}
        hidden={hidden}
        currency={currency}
        editable={false}
        selectedSection="hero"
        onSelectSection={() => undefined}
        onToggleHidden={() => undefined}
        onUpdateText={() => undefined}
        onUpdateProductText={() => undefined}
        page={page}
        onNavigate={setPage}
      />
    </div>
  );
}
