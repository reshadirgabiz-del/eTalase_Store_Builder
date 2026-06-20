"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Alert, Button, Loader, Stack, Text } from "@mantine/core";
import { colorSchemes, type ColorScheme } from "@/lib/templates";
import {
  EMPTY_HIDDEN,
  INITIAL_TEXT,
  StorefrontPreview,
  buildThemeStyle,
  fallbackProducts,
  type HiddenConfig,
  type PreviewPage,
  type Product,
  type Settings,
  type StoreInfo,
  type TextConfig,
} from "@/app/components/storefront-preview";

type Snapshot = {
  storeId?: string;
  publicKey?: string;
  theme: ColorScheme;
  texts: TextConfig;
  hidden: HiddenConfig;
  publishedAt?: string;
};

type LoadState = "loading" | "ready" | "missing" | "error";

const PUBLISH_KEY_PREFIX = "etalase-builder-publish::";

export default function PublishedPreviewPage({
  params,
}: {
  params: Promise<{ storeKey: string }>;
}) {
  const { storeKey } = use(params);
  const decodedKey = useMemo(() => decodeURIComponent(storeKey), [storeKey]);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<PreviewPage>("home");

  useEffect(() => {
    const raw = window.localStorage.getItem(PUBLISH_KEY_PREFIX + decodedKey);
    if (!raw) {
      setLoadState("missing");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Snapshot;
      setSnapshot(parsed);
    } catch {
      setLoadState("error");
      setError("Snapshot tersimpan rusak.");
    }
  }, [decodedKey]);

  useEffect(() => {
    if (!snapshot) return;
    let cancelled = false;
    (async () => {
      try {
        const [storeResponse, settingsResponse, productsResponse] = await Promise.all([
          fetch(`/api/stores/${encodeURIComponent(decodedKey)}/public`),
          fetch(`/api/settings/public?storeId=${encodeURIComponent(decodedKey)}`),
          fetch(`/api/products?storeId=${encodeURIComponent(decodedKey)}&limit=10`),
        ]);

        if (cancelled) return;

        if (storeResponse.ok) {
          setStoreInfo(await storeResponse.json());
        }
        if (settingsResponse.ok) {
          setSettings(await settingsResponse.json());
        }
        if (productsResponse.ok) {
          const json = await productsResponse.json();
          setProducts(json.data ?? []);
        }
        setLoadState("ready");
      } catch (err) {
        if (cancelled) return;
        setLoadState("error");
        setError(err instanceof Error ? err.message : "Tidak dapat memuat data toko");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [snapshot, decodedKey]);

  const themeStyle = useMemo(
    () => (snapshot ? buildThemeStyle(snapshot.theme) : buildThemeStyle(colorSchemes[0])),
    [snapshot],
  );

  if (loadState === "missing") {
    return (
      <main className="published-empty">
        <Stack align="center" gap="md" maw={520}>
          <Text size="lg" fw={700}>
            Belum ada storefront yang dipublish untuk key ini
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Kami tidak menemukan snapshot untuk <code>{decodedKey}</code>. Kembali ke builder, klik Publish di menu
            mengambang, lalu buka URL ini.
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
        <Alert color="red">{error ?? "Gagal memuat storefront yang dipublish ini."}</Alert>
      </main>
    );
  }

  if (!snapshot || loadState === "loading") {
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

  const texts: TextConfig = { ...INITIAL_TEXT, ...snapshot.texts };
  const hidden: HiddenConfig = { ...EMPTY_HIDDEN, ...snapshot.hidden };

  return (
    <div className="published-shell" style={themeStyle}>
      <StorefrontPreview
        storeName={storeName}
        logoUrl={logoUrl}
        storeId={storeInfo?.storeId || snapshot.storeId || decodedKey}
        settings={settings}
        products={liveProducts}
        texts={texts}
        hidden={hidden}
        currency={currency}
        editable={false}
        selectedSection="hero"
        onSelectSection={() => undefined}
        onToggleHidden={() => undefined}
        onUpdateText={() => undefined}
        page={page}
        onNavigate={setPage}
      />
    </div>
  );
}
