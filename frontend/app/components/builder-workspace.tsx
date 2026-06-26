"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  ActionIcon,
  Alert,
  Badge,
  Button,
  ColorInput,
  FileInput,
  Group,
  Loader,
  Menu,
  Modal,
  Paper,
  PasswordInput,
  ScrollArea,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import splashImage from "../../assets/splash.png";
import etalaseLogo from "../../assets/logo.png";
import templateClassicShot from "../../assets/templateScreenshots/classic.png";
import templateModernShot from "../../assets/templateScreenshots/modern.png";
import templatePastelShot from "../../assets/templateScreenshots/pastel.png";
import templateCyberShot from "../../assets/templateScreenshots/cyber.png";
import templatePastelBauhausShot from "../../assets/templateScreenshots/pastel-bauhaus.png";

import templateEditorialShot from "../../assets/templateScreenshots/editorial.png";
import templateNeonBrutaliseShot from "../../assets/templateScreenshots/brutalist.png";

const TEMPLATE_SCREENSHOTS: Partial<Record<TemplateId, { src: string }>> = {
  "classic": templateClassicShot,
  "modern": templateModernShot,
  "bauhaus": templateModernShot,
  "pastel": templatePastelShot,
  "pastel-bauhaus": templatePastelBauhausShot,
  "mosaic": templatePastelShot,
  "cyber": templateCyberShot,
  "editorial": templateEditorialShot,
  "brutalist": templateNeonBrutaliseShot,
};

const TEMPLATE_PREVIEW_PALETTES: Partial<Record<TemplateId, {
  brand: string;
  brandStrong: string;
  accent: string;
  pageBg: string;
  ink: string;
}>> = {
  "classic": { brand: "#6f4246", brandStrong: "#563136", accent: "#c45f67", pageBg: "#fcf7f5", ink: "#3e3033" },
  "modern": { brand: "#1e40af", brandStrong: "#1e3a8a", accent: "#f97316", pageBg: "#fefcf5", ink: "#0a0a0a" },
  "bauhaus": { brand: "#e63946", brandStrong: "#b8202d", accent: "#ffd400", pageBg: "#f4f1ea", ink: "#0a0a0a" },
  "pastel": { brand: "#be185d", brandStrong: "#9f1239", accent: "#fde68a", pageBg: "#fff7ed", ink: "#3d1322" },
  "pastel-bauhaus": { brand: "#e63946", brandStrong: "#b8202d", accent: "#ffd400", pageBg: "#f4f1ea", ink: "#0a0a0a" },
  "mosaic": { brand: "#0369a1", brandStrong: "#075985", accent: "#f97316", pageBg: "#f0f9ff", ink: "#0c1e2a" },
  "cyber": { brand: "#ff006e", brandStrong: "#c5005a", accent: "#00f0ff", pageBg: "#f5f5f0", ink: "#0a0a0f" },
  "editorial": { brand: "#1f1d1a", brandStrong: "#0a0a0a", accent: "#b04a2a", pageBg: "#fbf8f1", ink: "#181612" },
  "brutalist": { brand: "#0a0a0a", brandStrong: "#000000", accent: "#ccff00", pageBg: "#f2f2ed", ink: "#0a0a0a" },
  "glass": { brand: "#6366f1", brandStrong: "#4338ca", accent: "#22d3ee", pageBg: "#eef2ff", ink: "#1e1b4b" },
  "artisan": { brand: "#8a5a3b", brandStrong: "#5e3a22", accent: "#c97b3f", pageBg: "#f5ecdc", ink: "#2e1f12" },
};
import { createEtalaseClient } from "etalase-module";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Check,
  CircleDot,
  Eye,
  EyeOff,
  ExternalLink,
  FileArchive,
  HelpCircle,
  KeyRound,
  Maximize2,
  Palette,
  PanelRightOpen,
  RotateCcw,
  Save,
  Send,
  Settings as SettingsIcon,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import {
  COLOR_FIELDS,
  FONT_OPTIONS,
  TEMPLATE_LAYOUT_LABEL,
  colorSchemes,
  getTemplateDefaultScheme,
  templates,
  type ColorScheme,
  type TemplateId,
  type TemplateLayout,
} from "@/lib/templates";
import {
  EDITABLE_SECTIONS,
  EMPTY_HIDDEN,
  INITIAL_TEXT,
  PAGE_LABEL,
  SECTION_LABEL,
  StorefrontPreview,
  buildThemeStyle,
  fallbackProducts,
  templateSupportsHeroImage,
  type HiddenConfig,
  type PreviewPage,
  type Product,
  type ProductTextOverride,
  type ProductTextOverrides,
  type SectionId,
  type Settings,
  type StoreInfo,
  type TextConfig,
  type TextField,
} from "./storefront-preview";

type Screen = "templates" | "editor";
type LoadState = "idle" | "loading" | "ready" | "error";
type PanelTab = "layout" | "theme";
type EditorMode = "text" | "section";
type AliasStatus = "idle" | "checking" | "available" | "taken" | "invalid" | "error";

const PUBLISH_KEY_PREFIX = "etalase-builder-publish::";
const STORE_ID_STORAGE_KEY = "etalase-builder-store-id";
const PUBLIC_STORE_KEY_STORAGE_KEY = "etalase-builder-public-store-key";
const LEGACY_PUBLIC_KEY_STORAGE_KEY = "etalase-builder-public-key";
const HOWTO_SEEN_STORAGE_KEY = "etalase-builder-howto-seen";

const HOWTO_STEPS: { title: string; body: string }[] = [
  {
    title: "Hubungkan toko",
    body: "Masukkan Store ID dan access key. Public key (etalase_pk_live_...) otomatis menyinkronkan toko Anda.",
  },
  {
    title: "Pilih template",
    body: "Pilih dari template siap pakai, atau unggah aplikasi kustom (zip) untuk review admin.",
  },
  {
    title: "Atur tema & publish",
    body: "Edit warna, font, dan teks langsung di preview. Publish ke link kustom di store.e-talase.com/<nama>.",
  },
];
const DEMO_STORE_ID = "583e6139-c4cb-4037-beb1-0f787867ff90";
const DEMO_PUBLIC_KEY = "etalase_pk_live_ENvGGo5xJ9KlBgdraJuSf_ThMoNwndBke6R_5ZVNv9I";
const TEMPLATE_LOCKED = true;
const CUSTOM_UPLOAD_MAX_BYTES = 2 * 1024 * 1024;
const CUSTOM_UPLOAD_EMAIL = "info@mail.e-talase.com";
const STOREFRONT_BASE_URL = (process.env.NEXT_PUBLIC_STOREFRONT_BASE_URL ?? "https://store.e-talase.com").replace(/\/+$/, "");
const ETALASE_API_URL = process.env.NEXT_PUBLIC_ETALASE_API_URL;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const VISIBLE_COLOR_SCHEME_IDS = [
  "teal-gold",
  "minimal-mono",
  "graphite-lime",
  "indigo-coral",
  "forest-sky",
  "ocean-sunset",
  "bauhaus-primary",
  "bauhaus-cobalt",
];

const COLOR_FIELD_GROUPS: {
  value: string;
  label: string;
  fields: Array<(typeof COLOR_FIELDS)[number]["key"]>;
}[] = [
  { value: "text", label: "Text colors", fields: ["ink", "muted"] },
  { value: "brand", label: "Brand and buttons", fields: ["brand", "brandStrong", "buttonText"] },
  { value: "surface", label: "Backgrounds and surfaces", fields: ["pageBg", "surface"] },
  { value: "accent", label: "Accent colors", fields: ["accent"] },
];

function normalizeCustomStoreName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isValidCustomStoreName(value: string) {
  return /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])$/.test(value);
}

function customStoreUri(alias: string) {
  return `${STOREFRONT_BASE_URL}/${alias}`;
}

function setBuilderCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function getBuilderCookie(name: string) {
  const raw = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");
  return raw ? decodeURIComponent(raw) : "";
}

function normalizeFontOption(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  if (value.includes("Bricolage Grotesque")) return FONT_OPTIONS[0].heading;
  if (value.includes("Hanken Grotesk")) return FONT_OPTIONS[0].value;
  return FONT_OPTIONS.find((font) => value === font.value || value.includes(font.label))?.value
    ?? FONT_OPTIONS.find((font) => value === font.heading || value.includes(font.label))?.heading
    ?? value;
}

export function BuilderWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [storeId, setStoreId] = useState("");
  const [publicStoreKey, setPublicStoreKey] = useState("");
  const [draftStoreId, setDraftStoreId] = useState("");
  const [draftSecretKey, setDraftSecretKey] = useState("");
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthing, setIsAuthing] = useState(false);
  const [howToModalOpen, setHowToModalOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORE_ID_STORAGE_KEY) || getBuilderCookie(STORE_ID_STORAGE_KEY);
    const storeIdValue = stored.startsWith("etalase_pk_") ? "" : stored;
    if (stored && !storeIdValue) {
      window.localStorage.removeItem(STORE_ID_STORAGE_KEY);
    }
    const storedPublicKey =
      storeIdValue
        ? window.localStorage.getItem(PUBLIC_STORE_KEY_STORAGE_KEY) || getBuilderCookie(PUBLIC_STORE_KEY_STORAGE_KEY)
        : "";
    window.localStorage.removeItem(LEGACY_PUBLIC_KEY_STORAGE_KEY);
    setStoreId(storeIdValue);
    setDraftStoreId(storeIdValue);
    setPublicStoreKey(storedPublicKey);
    setKeyModalOpen(!storeIdValue || !storedPublicKey);
    const howToSeen = window.localStorage.getItem(HOWTO_SEEN_STORAGE_KEY);
    if (!howToSeen) setHowToModalOpen(true);
    setHasHydrated(true);
  }, []);

  function dismissHowToModal() {
    window.localStorage.setItem(HOWTO_SEEN_STORAGE_KEY, "1");
    setHowToModalOpen(false);
  }

  const [screen, setScreen] = useState<Screen>("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("classic");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateId | null>(null);
  const [customZip, setCustomZip] = useState<File | null>(null);
  const [customUploadModalOpen, setCustomUploadModalOpen] = useState(false);
  const [confirmedCustomQa, setConfirmedCustomQa] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productTextOverrides, setProductTextOverrides] = useState<ProductTextOverrides>({});
  const [scheme, setScheme] = useState<ColorScheme>(colorSchemes[0]);
  const [texts, setTexts] = useState<TextConfig>(INITIAL_TEXT);
  const [hidden, setHidden] = useState<HiddenConfig>(EMPTY_HIDDEN);
  const [heroImageOverride, setHeroImageOverride] = useState<string | null>(null);
  const [heroImageError, setHeroImageError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<SectionId>("hero");
  const [editorMode, setEditorMode] = useState<EditorMode>("text");
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelTab, setPanelTab] = useState<PanelTab>("theme");
  const [previewMode, setPreviewMode] = useState(false);
  const [previewPage, setPreviewPage] = useState<PreviewPage>("home");
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [customStoreName, setCustomStoreName] = useState("");
  const [aliasStatus, setAliasStatus] = useState<AliasStatus>("idle");
  const [aliasMessage, setAliasMessage] = useState("");
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [existingPublication, setExistingPublication] = useState<{
    alias: string;
    templateId: TemplateId;
    theme: ColorScheme | null;
    texts: Partial<TextConfig> | null;
    hidden: Partial<HiddenConfig> | null;
    config: { productTextOverrides?: ProductTextOverrides; heroImageOverride?: string | null } | null;
    customStoreUri: string | null;
    publishedAt: string | null;
  } | null>(null);
  const [existingModalOpen, setExistingModalOpen] = useState(false);
  const [oversizedUploadOpen, setOversizedUploadOpen] = useState(false);
  const [oversizedFileName, setOversizedFileName] = useState<string | null>(null);

  const liveProducts = products.length > 0 ? products : fallbackProducts;
  const storeName = settings?.storeName || storeInfo?.storeName || "Storefront";
  const logoUrl = settings?.logoUrl || storeInfo?.storePhotoUrl || "";
  const currency = settings?.currency ?? "IDR";

  const template = templates.find((item) => item.id === selectedTemplate) ?? templates[0];
  const previewTemplateData = templates.find((item) => item.id === previewTemplate) ?? template;
  const visibleColorSchemes = colorSchemes.filter((preset) => VISIBLE_COLOR_SCHEME_IDS.includes(preset.id));
  const colorFieldByKey = new Map(COLOR_FIELDS.map((field) => [field.key, field]));

  const themeStyle = useMemo(() => buildThemeStyle(scheme), [scheme]);
  const bodyFontValue = normalizeFontOption(scheme.fontBody, FONT_OPTIONS[0].value);
  const headingFontValue = normalizeFontOption(scheme.fontHeading, FONT_OPTIONS[0].heading);

  const loadStore = useCallback(async (key: string) => {
    setLoadState("loading");
    setError(null);

    try {
      const client = createEtalaseClient({ storeKey: key, apiUrl: ETALASE_API_URL });
      const [info, settings, productPage] = await Promise.all([
        client.store.getInfo(),
        client.store.getSettings(),
        client.products.list({ limit: 10 }),
      ]);

      if (!info) throw new Error("Pencarian toko gagal");

      setStoreInfo({ ...info, publicKey: key });
      setSettings(settings);
      if (settings?.storeDescription) {
        setTexts((current) => ({
          ...current,
          hero:
            current.hero.body === INITIAL_TEXT.hero.body
              ? { ...current.hero, body: settings.storeDescription! }
              : current.hero,
          footer:
            current.footer.body === INITIAL_TEXT.footer.body
              ? { ...current.footer, body: settings.storeDescription! }
              : current.footer,
        }));
      }
      setProducts(productPage.data ?? []);
      setLoadState("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tidak dapat memuat data toko");
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    if (!publicStoreKey) return;
    void loadStore(publicStoreKey);
  }, [loadStore, publicStoreKey]);

  useEffect(() => {
    if (!publishModalOpen || publishedUrl) return;
    const alias = normalizeCustomStoreName(customStoreName);
    setPublishError(null);
    if (!alias) {
      setAliasStatus("idle");
      setAliasMessage("");
      return;
    }
    if (!isValidCustomStoreName(alias)) {
      setAliasStatus("invalid");
      setAliasMessage("Gunakan 3-63 karakter: huruf kecil, angka, dan tanda hubung.");
      return;
    }

    setAliasStatus("checking");
    setAliasMessage("Memeriksa ketersediaan...");
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ alias, storeId });
        const response = await fetch(`/api/stores/custom-uri?${params.toString()}`, {
          signal: controller.signal,
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error ?? "Tidak dapat memeriksa link.");
        setAliasStatus(json.available ? "available" : "taken");
        setAliasMessage(
          json.available
            ? "Link tersedia."
            : "Link ini sudah digunakan. Pilih nama lain.",
        );
      } catch (err) {
        if (controller.signal.aborted) return;
        setAliasStatus("error");
        setAliasMessage(err instanceof Error ? err.message : "Tidak dapat memeriksa link.");
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [customStoreName, publishModalOpen, publishedUrl, storeId]);

  async function saveStoreId() {
    const normalized = draftStoreId.trim();
    const secret = draftSecretKey;
    if (!normalized || !secret) return;

    setIsAuthing(true);
    setAuthError(null);
    try {
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: normalized, secretKey: secret }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(json.error ?? "Tidak dapat login.");
      }

      const nextStoreId = typeof json.storeId === "string" ? json.storeId : normalized;
      const nextPublicStoreKey = typeof json.publicStoreKey === "string" ? json.publicStoreKey : "";
      window.localStorage.setItem(STORE_ID_STORAGE_KEY, nextStoreId);
      setBuilderCookie(STORE_ID_STORAGE_KEY, nextStoreId);
      if (nextPublicStoreKey) {
        window.localStorage.setItem(PUBLIC_STORE_KEY_STORAGE_KEY, nextPublicStoreKey);
        setBuilderCookie(PUBLIC_STORE_KEY_STORAGE_KEY, nextPublicStoreKey);
      } else {
        window.localStorage.removeItem(PUBLIC_STORE_KEY_STORAGE_KEY);
        setBuilderCookie(PUBLIC_STORE_KEY_STORAGE_KEY, "");
      }
      setStoreId(nextStoreId);
      setPublicStoreKey(nextPublicStoreKey);
      setDraftStoreId(nextStoreId);
      setDraftSecretKey("");
      setKeyModalOpen(false);

      try {
        const params = new URLSearchParams({ byStoreId: nextStoreId });
        const lookup = await fetch(`/api/stores/custom-uri?${params.toString()}`);
        const lookupJson = await lookup.json().catch(() => ({}));
        if (lookup.ok && lookupJson?.exists) {
          setExistingPublication({
            alias: lookupJson.alias,
            templateId: (lookupJson.templateId ?? "classic") as TemplateId,
            theme: (lookupJson.theme ?? null) as ColorScheme | null,
            texts: (lookupJson.texts ?? null) as Partial<TextConfig> | null,
            hidden: (lookupJson.hidden ?? null) as Partial<HiddenConfig> | null,
            config: (lookupJson.config ?? null) as
              | { productTextOverrides?: ProductTextOverrides; heroImageOverride?: string | null }
              | null,
            customStoreUri: lookupJson.customStoreUri ?? null,
            publishedAt: lookupJson.publishedAt ?? null,
          });
          setExistingModalOpen(true);
        }
      } catch {
        // non-blocking; user can still pick a template
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Tidak dapat login.");
    } finally {
      setIsAuthing(false);
    }
  }

  function applyExistingPublication(next: NonNullable<typeof existingPublication>) {
    setSelectedTemplate(next.templateId);
    if (next.theme) {
      setScheme(next.theme);
    } else {
      setScheme(getTemplateDefaultScheme(next.templateId));
    }
    setTexts({ ...INITIAL_TEXT, ...(next.texts ?? {}) } as TextConfig);
    setHidden({ ...EMPTY_HIDDEN, ...(next.hidden ?? {}) } as HiddenConfig);
    setProductTextOverrides(next.config?.productTextOverrides ?? {});
    setHeroImageOverride(next.config?.heroImageOverride ?? null);
    setCustomStoreName(next.alias);
    if (next.publishedAt) {
      setPublishedAt(new Date(next.publishedAt).toLocaleString());
    }
    if (next.customStoreUri) {
      setPublishedUrl(next.customStoreUri);
    }
    setPreviewMode(false);
    setScreen("editor");
  }

  function loadExistingPublication() {
    if (!existingPublication) return;
    applyExistingPublication(existingPublication);
    setExistingModalOpen(false);
  }

  useEffect(() => {
    if (!hasHydrated || !storeId) return;
    if (searchParams?.get("loadExisting") !== "1") return;
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({ byStoreId: storeId });
        const response = await fetch(`/api/stores/custom-uri?${params.toString()}`);
        const json = await response.json().catch(() => ({}));
        if (cancelled || !response.ok || !json?.exists) return;
        applyExistingPublication({
          alias: json.alias,
          templateId: (json.templateId ?? "classic") as TemplateId,
          theme: (json.theme ?? null) as ColorScheme | null,
          texts: (json.texts ?? null) as Partial<TextConfig> | null,
          hidden: (json.hidden ?? null) as Partial<HiddenConfig> | null,
          config: (json.config ?? null) as
            | { productTextOverrides?: ProductTextOverrides; heroImageOverride?: string | null }
            | null,
          customStoreUri: json.customStoreUri ?? null,
          publishedAt: json.publishedAt ?? null,
        });
      } catch {
        // non-blocking
      } finally {
        if (!cancelled) {
          router.replace("/templates");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, storeId, searchParams]);

  function startBlankBuild() {
    setExistingModalOpen(false);
  }

  function selectSection(section: SectionId) {
    if (previewMode) return;
    setSelectedSection(section);
  }

  function selectTemplate(id: TemplateId) {
    setSelectedTemplate(id);
    if (id !== "custom-upload") {
      setScreen("editor");
      setPreviewMode(false);
      setScheme(getTemplateDefaultScheme(id));
    }
  }

  function updateText(section: SectionId, field: TextField, value: string) {
    setTexts((current) => ({
      ...current,
      [section]: { ...current[section], [field]: value },
    }));
  }

  function updateProductText(productId: string, field: keyof ProductTextOverride, value: string) {
    setProductTextOverrides((current) => ({
      ...current,
      [productId]: { ...(current[productId] ?? {}), [field]: value },
    }));
  }

  function toggleHidden(section: SectionId, value?: boolean) {
    setHidden((current) => ({
      ...current,
      [section]: value ?? !current[section],
    }));
  }

  function updateColorField(key: keyof ColorScheme, value: string) {
    setScheme((current) => ({ ...current, id: "custom", name: "Custom", [key]: value }));
  }

  function updateFontField(key: "fontBody" | "fontHeading", value: string | null) {
    if (!value) return;
    setScheme((current) => ({ ...current, id: "custom", name: "Custom", [key]: value }));
  }

  function resetScheme() {
    setScheme(colorSchemes[0]);
  }

  function handleHeroImageUpload(file: File | null) {
    setHeroImageError(null);
    if (!file) {
      setHeroImageOverride(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setHeroImageError("File harus berupa gambar.");
      return;
    }
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setHeroImageError("Ukuran gambar maksimum 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") setHeroImageOverride(result);
    };
    reader.onerror = () => setHeroImageError("Tidak dapat membaca file.");
    reader.readAsDataURL(file);
  }

  const exportConfig = {
    storeId,
    publicKey: publicStoreKey || storeId,
    templateId: template.id,
    template,
    theme: scheme,
    texts,
    hidden,
    config: { productTextOverrides, heroImageOverride },
    publishedAt: new Date().toISOString(),
  };

  async function publish() {
    if (!storeId) return;
    const alias = normalizeCustomStoreName(customStoreName);
    if (!isValidCustomStoreName(alias)) {
      setAliasStatus("invalid");
      setAliasMessage("Gunakan 3-63 karakter: huruf kecil, angka, dan tanda hubung.");
      return;
    }
    if (aliasStatus !== "available") {
      setPublishError("Gunakan link yang tersedia sebelum publish.");
      return;
    }

    setIsPublishing(true);
    setPublishError(null);
    try {
      const response = await fetch("/api/stores/custom-uri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          alias,
          templateId: template.id,
          theme: scheme,
          texts,
          hidden,
          config: { productTextOverrides, heroImageOverride },
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Tidak dapat menyimpan link storefront.");

      const publishedAtIso = new Date().toISOString();
      const config = {
        ...exportConfig,
        publishedAt: publishedAtIso,
        customStoreName: alias,
        customStoreUri: json.customStoreUri ?? customStoreUri(alias),
      };
      window.localStorage.setItem(PUBLISH_KEY_PREFIX + storeId, JSON.stringify(config));
      window.localStorage.setItem(PUBLISH_KEY_PREFIX + alias, JSON.stringify(config));
      window.localStorage.setItem("etalase-builder-last-publish", JSON.stringify(config));
      setPublishedAt(new Date(publishedAtIso).toLocaleString());
      setPublishedUrl(json.customStoreUri ?? customStoreUri(alias));
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Tidak dapat publish storefront.");
    } finally {
      setIsPublishing(false);
    }
  }

  function openPublishedPage() {
    if (publishedUrl) {
      const url = new URL(publishedUrl);
      router.push(url.pathname);
    }
  }

  const disabled = !storeId || !publicStoreKey || !hasHydrated;

  return (
    <main className="builder-root">
      <Modal
        opened={keyModalOpen}
        onClose={() => storeId && publicStoreKey && setKeyModalOpen(false)}
        closeOnClickOutside={Boolean(storeId && publicStoreKey)}
        closeOnEscape={Boolean(storeId && publicStoreKey)}
        withCloseButton={Boolean(storeId && publicStoreKey)}
        centered
        size="md"
        radius="lg"
        className="builder-auth-modal"
        title={
          <Group gap="sm" wrap="nowrap" align="center">
            <KeyRound size={18} color="var(--mantine-color-teal-7)" />
            <span>Hubungkan toko eTalase Anda</span>
          </Group>
        }
      >
        <Stack gap="md">
          <div className="auth-modal-hint">
            Masukkan Store ID dan access key toko. Jika belum ada secret key khusus, gunakan public key eTalase
            (etalase_pk_live_...) untuk menyinkronkan toko dari SDK secara otomatis.
          </div>
          <TextInput
            label="Store ID"
            placeholder="00000000-0000-0000-0000-000000000000"
            value={draftStoreId}
            onChange={(event) => setDraftStoreId(event.currentTarget.value)}
            disabled={isAuthing}
          />
          <PasswordInput
            label="Access key"
            placeholder="etalase_pk_live_... atau etalase_sk_live_..."
            value={draftSecretKey}
            onChange={(event) => setDraftSecretKey(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void saveStoreId();
            }}
            disabled={isAuthing}
          />
          {authError && (
            <Alert color="red" variant="light">
              {authError}
            </Alert>
          )}
          <Button
            onClick={() => void saveStoreId()}
            loading={isAuthing}
            disabled={!draftStoreId.trim() || !draftSecretKey}
          >
            Login
          </Button>
          <Button
            variant="light"
            onClick={() => {
              setDraftStoreId(DEMO_STORE_ID);
              setDraftSecretKey(DEMO_PUBLIC_KEY);
            }}
            disabled={isAuthing}
          >
            Gunakan akun demo
          </Button>
        </Stack>
      </Modal>

      <CustomUploadReviewModal
        opened={customUploadModalOpen}
        onClose={() => setCustomUploadModalOpen(false)}
        confirmedCustomQa={confirmedCustomQa}
        customZip={customZip}
      />

      <Modal
        opened={existingModalOpen}
        onClose={startBlankBuild}
        centered
        size="lg"
        radius="lg"
        title={
          <Group gap="sm" wrap="nowrap" align="center">
            <Sparkles size={18} color="var(--mantine-color-teal-7)" />
            <span>Anda sudah memiliki storefront</span>
          </Group>
        }
      >
        <Stack gap="md">
          <Text size="sm">
            Toko ini sudah memiliki storefront aktif
            {existingPublication?.customStoreUri ? (
              <>
                {" "}di{" "}
                <code>{existingPublication.customStoreUri}</code>
              </>
            ) : null}
            . Anda dapat melanjutkan edit versi yang ada atau memulai dari template baru.
          </Text>
          {existingPublication?.alias ? (
            <StorefrontMobilePreview alias={existingPublication.alias} />
          ) : null}
          {existingPublication?.publishedAt ? (
            <Text size="xs" c="dimmed" ta="center">
              Terakhir dipublish: {new Date(existingPublication.publishedAt).toLocaleString()}
            </Text>
          ) : null}
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={startBlankBuild}>
              Buat baru dari awal
            </Button>
            <Button leftSection={<Eye size={14} />} onClick={loadExistingPublication}>
              Edit storefront yang ada
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={oversizedUploadOpen}
        onClose={() => setOversizedUploadOpen(false)}
        centered
        size="md"
        radius="lg"
        title={
          <Group gap="sm" wrap="nowrap" align="center">
            <AlertTriangle size={18} color="var(--mantine-color-orange-6)" />
            <span>File terlalu besar</span>
          </Group>
        }
      >
        <Stack gap="md">
          <Text size="sm">
            Unggahan kustom dibatasi maksimum <strong>2 MB</strong>
            {oversizedFileName ? (
              <>
                . File <code>{oversizedFileName}</code> melampaui batas tersebut
              </>
            ) : null}
            . Untuk template lebih besar, kirim bundle Anda melalui email beserta detail toko, dan tim kami akan
            membantu proses review.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setOversizedUploadOpen(false)}>
              Tutup
            </Button>
            <Button
              component="a"
              href={`mailto:${CUSTOM_UPLOAD_EMAIL}?subject=${encodeURIComponent(
                "Unggahan template kustom storefront",
              )}&body=${encodeURIComponent(
                `Store ID: ${storeId || "-"}\nNama file: ${oversizedFileName ?? "-"}\n\nMohon bantuannya untuk mengunggah template kustom kami.`,
              )}`}
              leftSection={<Send size={14} />}
            >
              Kirim email ke {CUSTOM_UPLOAD_EMAIL}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={howToModalOpen}
        onClose={dismissHowToModal}
        centered
        size="lg"
        radius="lg"
        className="howto-modal"
        title={
          <Group gap="sm" wrap="nowrap" align="center">
            <Sparkles size={18} color="var(--mantine-color-teal-7)" />
            <span>Selamat datang di Storefront Builder</span>
          </Group>
        }
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Bangun storefront eTalase Anda dalam 3 langkah singkat. Anda dapat membuka panduan ini kapan saja dari menu builder.
          </Text>
          <div className="howto-modal-steps">
            {HOWTO_STEPS.map((step, idx) => (
              <div key={step.title} className="howto-modal-step">
                <span className="howto-modal-step-num">{idx + 1}</span>
                <div>
                  <Text fw={600} size="sm">
                    {step.title}
                  </Text>
                  <Text size="xs" c="dimmed" mt={2}>
                    {step.body}
                  </Text>
                </div>
              </div>
            ))}
          </div>
          <Group justify="space-between" mt="xs">
            <Button
              component={Link}
              href="/how-to"
              variant="subtle"
              leftSection={<BookOpen size={14} />}
              onClick={dismissHowToModal}
            >
              Baca panduan lengkap
            </Button>
            <Button onClick={dismissHowToModal} leftSection={<Sparkles size={14} />}>
              Mulai membangun
            </Button>
          </Group>
        </Stack>
      </Modal>

      {screen === "templates" ? (
        <TemplateSelection
          disabled={disabled}
          storeId={storeId}
          loadState={loadState}
          error={error}
          customZip={customZip}
          confirmedCustomQa={confirmedCustomQa}
          onOpenKeyModal={() => setKeyModalOpen(true)}
          onOpenHowTo={() => setHowToModalOpen(true)}
          onPreview={setPreviewTemplate}
          onSelect={selectTemplate}
          onCustomZip={(file) => {
            if (file && file.size > CUSTOM_UPLOAD_MAX_BYTES) {
              setOversizedFileName(file.name);
              setOversizedUploadOpen(true);
              setCustomZip(null);
              return;
            }
            setCustomZip(file);
            if (file) {
              setCustomUploadModalOpen(true);
            }
          }}
          onConfirmCustomQa={setConfirmedCustomQa}
        />
      ) : (
        <div className={`editor-shell ${panelOpen && !previewMode ? "panel-open" : ""}`} style={themeStyle}>
          <div className="editor-canvas">
            <StorefrontPreview
              templateId={selectedTemplate}
              storeName={storeName}
              logoUrl={logoUrl}
              storeId={storeInfo?.storeId || storeId}
              settings={settings}
              products={liveProducts}
              productTextOverrides={productTextOverrides}
              texts={texts}
              hidden={hidden}
              currency={currency}
              editable={!previewMode}
              textEditMode={editorMode === "text"}
              selectedSection={selectedSection}
              onSelectSection={selectSection}
              onToggleHidden={toggleHidden}
              onUpdateText={updateText}
              onUpdateProductText={updateProductText}
              page={previewPage}
              onNavigate={setPreviewPage}
              badgeEditable={!previewMode}
              heroImageOverride={heroImageOverride}
              loading={loadState === "loading"}
            />
          </div>

          {!previewMode ? (
            <>
              <FloatingActionMenu
                panelOpen={panelOpen}
                previewPage={previewPage}
                onChangePreviewPage={setPreviewPage}
                onBack={() => setScreen("templates")}
                onTogglePanel={() => setPanelOpen((open) => !open)}
                onOpenTheme={() => {
                  setPanelTab("theme");
                  setPanelOpen(true);
                }}
                onPreview={() => setPreviewMode(true)}
                onSave={() => {
                  window.localStorage.setItem("etalase-builder-config", JSON.stringify(exportConfig));
                }}
                onPublish={() => {
                  setPublishedAt(null);
                  setPublishedUrl(null);
                  setPublishError(null);
                  setAliasStatus("idle");
                  setAliasMessage("");
                  setCustomStoreName((current) => current || normalizeCustomStoreName(storeName));
                  setPublishModalOpen(true);
                }}
                onOpenKeyModal={() => setKeyModalOpen(true)}
                onOpenHowTo={() => setHowToModalOpen(true)}
              />

              <aside className={`builder-panel ${panelOpen ? "is-open" : "is-closed"}`}>
                <div className="builder-panel-header">
                  <div>
                    <Text size="xs" tt="uppercase" fw={700} c="dimmed" lts={0.6}>
                      Template
                    </Text>
                    <Title order={4} mt={2}>
                      {template.name}
                    </Title>
                    <Text size="xs" c="dimmed" mt={4}>
                      Layout dan teks dikunci kecuali badge hero. Tema dan font tetap dapat diedit.
                    </Text>
                    {template.id === "brutalist" ? (
                      <Text size="xs" c="dimmed" mt={4}>
                        Tip: marquee berjalan di hero dapat diklik langsung di preview untuk mengubah teksnya.
                      </Text>
                    ) : null}
                  </div>
                  <Tooltip label="Ciutkan">
                    <ActionIcon variant="subtle" onClick={() => setPanelOpen(false)} aria-label="Ciutkan panel">
                      <X size={18} />
                    </ActionIcon>
                  </Tooltip>
                </div>

                <Tabs value={panelTab} onChange={(value) => value && setPanelTab(value as PanelTab)} variant="pills" radius="md" className="builder-panel-tabs">
                  <Tabs.List grow>
                    <Tabs.Tab value="layout" leftSection={<Eye size={14} />} disabled={TEMPLATE_LOCKED}>
                      Layout
                    </Tabs.Tab>
                    <Tabs.Tab value="theme" leftSection={<Palette size={14} />}>
                      Tema
                    </Tabs.Tab>
                  </Tabs.List>
                </Tabs>

                <ScrollArea className="builder-panel-body" type="auto" offsetScrollbars>
                  {!TEMPLATE_LOCKED ? (
                    <Stack gap="xs" mb="md">
                      <Text size="sm" fw={600}>
                        Mode edit
                      </Text>
                      <SegmentedControl
                        value={editorMode}
                        onChange={(value) => setEditorMode(value as EditorMode)}
                        data={[
                          { label: "Teks", value: "text" },
                          { label: "Bagian", value: "section" },
                        ]}
                        fullWidth
                      />
                    </Stack>
                  ) : null}

                  {panelTab === "layout" && !TEMPLATE_LOCKED ? (
                    <Stack gap="xs">
                      <Text size="sm" c="dimmed">
                        Atur bagian storefront satu per satu. Bagian yang disembunyikan akan dihapus dari preview dan
                        hasil publish.
                      </Text>
                      {EDITABLE_SECTIONS.map((section) => (
                        <Paper key={section} withBorder p="sm" radius="md" className="visibility-row">
                          <Group justify="space-between" wrap="nowrap">
                            <div>
                              <Text fw={600}>{SECTION_LABEL[section]}</Text>
                              <Text size="xs" c="dimmed" lineClamp={1}>
                                {texts[section].title}
                              </Text>
                            </div>
                            <Switch
                              checked={!hidden[section]}
                              onChange={(event) => toggleHidden(section, !event.currentTarget.checked)}
                              onLabel={<Eye size={12} />}
                              offLabel={<EyeOff size={12} />}
                              size="md"
                            />
                          </Group>
                        </Paper>
                      ))}
                    </Stack>
                  ) : null}

                  {panelTab === "theme" ? (
                    <Stack gap="md">
                      <div>
                        <Group justify="space-between" mb={6} align="center">
                          <Text size="sm" fw={600}>
                            Gambar hero
                          </Text>
                          {heroImageOverride ? (
                            <Button
                              size="compact-xs"
                              variant="subtle"
                              leftSection={<RotateCcw size={12} />}
                              onClick={() => {
                                setHeroImageOverride(null);
                                setHeroImageError(null);
                              }}
                            >
                              Hapus
                            </Button>
                          ) : null}
                        </Group>
                        <FileInput
                          placeholder={
                            templateSupportsHeroImage(template.id)
                              ? "Unggah gambar (.jpg, .png, .webp)"
                              : "Tidak tersedia untuk template ini"
                          }
                          accept="image/png,image/jpeg,image/webp"
                          leftSection={<Upload size={14} />}
                          value={null}
                          onChange={handleHeroImageUpload}
                          disabled={!templateSupportsHeroImage(template.id)}
                          clearable={false}
                        />
                        {heroImageError ? (
                          <Text size="xs" c="red" mt={4}>
                            {heroImageError}
                          </Text>
                        ) : (
                          <Text size="xs" c="dimmed" mt={4}>
                            {templateSupportsHeroImage(template.id)
                              ? heroImageOverride
                                ? "Gambar hero akan diganti dengan unggahan ini saat preview dan publish."
                                : "Gambar hero saat ini diambil dari produk pertama. Maks. 5 MB."
                              : "Template ini tidak memakai gambar hero statis, jadi unggahan dinonaktifkan."}
                          </Text>
                        )}
                        {heroImageOverride ? (
                          <div className="hero-upload-preview" aria-hidden>
                            <img src={heroImageOverride} alt="" />
                          </div>
                        ) : null}
                      </div>

                      <div>
                        <Text size="sm" fw={600} mb={6}>
                          Palet preset
                        </Text>
                        <Select
                          value={visibleColorSchemes.some((preset) => preset.id === scheme.id) ? scheme.id : null}
                          placeholder={scheme.id === "custom" ? "Custom colors" : "Choose palette"}
                          data={visibleColorSchemes.map((preset) => ({ label: preset.name, value: preset.id }))}
                          onChange={(value) => {
                            const next = colorSchemes.find((preset) => preset.id === value);
                            if (next) setScheme(next);
                          }}
                          allowDeselect={false}
                          renderOption={({ option }) => {
                            const preset = colorSchemes.find((item) => item.id === option.value);
                            return (
                              <Group gap="xs" wrap="nowrap">
                                <span className="palette-select-strip" aria-hidden>
                                  {preset ? (
                                    <>
                                      <i style={{ background: preset.brand }} />
                                      <i style={{ background: preset.brandStrong }} />
                                      <i style={{ background: preset.accent }} />
                                      <i style={{ background: preset.pageBg }} />
                                    </>
                                  ) : null}
                                </span>
                                <span>{option.label}</span>
                              </Group>
                            );
                          }}
                          leftSection={
                            <span className="palette-select-strip compact" aria-hidden>
                              <i style={{ background: scheme.brand }} />
                              <i style={{ background: scheme.brandStrong }} />
                              <i style={{ background: scheme.accent }} />
                              <i style={{ background: scheme.pageBg }} />
                            </span>
                          }
                          leftSectionWidth={70}
                        />
                      </div>

                      <div>
                        <Text size="sm" fw={600} mb={6}>
                          Font
                        </Text>
                        <Stack gap="xs">
                          <Select
                            label="Teks isi"
                            value={bodyFontValue}
                            onChange={(value) => updateFontField("fontBody", value)}
                            data={FONT_OPTIONS.map((font) => ({ label: font.label, value: font.value }))}
                            allowDeselect={false}
                            renderOption={({ option }) => (
                              <span style={{ fontFamily: option.value }}>{option.label}</span>
                            )}
                            styles={{ input: { fontFamily: bodyFontValue } }}
                          />
                          <Select
                            label="Judul"
                            value={headingFontValue}
                            onChange={(value) => updateFontField("fontHeading", value)}
                            data={FONT_OPTIONS.map((font) => ({ label: font.label, value: font.heading }))}
                            allowDeselect={false}
                            renderOption={({ option }) => (
                              <span style={{ fontFamily: option.value }}>{option.label}</span>
                            )}
                            styles={{ input: { fontFamily: headingFontValue } }}
                          />
                        </Stack>
                      </div>

                      <div>
                        <Group justify="space-between" mb={6}>
                          <Text size="sm" fw={600}>
                            Warna kustom
                          </Text>
                          <Button
                            size="compact-xs"
                            variant="subtle"
                            leftSection={<RotateCcw size={12} />}
                            onClick={resetScheme}
                          >
                            Reset
                          </Button>
                        </Group>
                        <Accordion multiple defaultValue={["text", "brand"]} variant="separated" radius="md">
                          {COLOR_FIELD_GROUPS.map((group) => (
                            <Accordion.Item value={group.value} key={group.value}>
                              <Accordion.Control>{group.label}</Accordion.Control>
                              <Accordion.Panel>
                                <Stack gap="xs">
                                  {group.fields.map((key) => {
                                    const field = colorFieldByKey.get(key);
                                    if (!field) return null;
                                    return (
                                      <ColorInput
                                        key={field.key}
                                        label={field.label}
                                        description={field.help}
                                        value={scheme[field.key] as string}
                                        onChange={(value) => updateColorField(field.key, value)}
                                        format="hex"
                                        swatches={[
                                          "#0f766e", "#3730a3", "#166534", "#be185d",
                                          "#1e1b4b", "#f59f00", "#fb7185", "#38bdf8",
                                          "#84cc16", "#f97316", "#171717", "#ffffff",
                                        ]}
                                        swatchesPerRow={6}
                                        withEyeDropper
                                      />
                                    );
                                  })}
                                </Stack>
                              </Accordion.Panel>
                            </Accordion.Item>
                          ))}
                        </Accordion>
                      </div>
                    </Stack>
                  ) : null}
                </ScrollArea>
              </aside>
            </>
          ) : (
            <Button className="exit-preview-button" leftSection={<X size={16} />} onClick={() => setPreviewMode(false)}>
              Keluar preview
            </Button>
          )}
        </div>
      )}

      <Modal opened={Boolean(previewTemplate)} onClose={() => setPreviewTemplate(null)} size="90vw" title={previewTemplateData.name}>
        <div className="template-modal-preview" style={buildThemeStyle(getTemplateDefaultScheme(previewTemplateData.id))}>
          <StorefrontPreview
            templateId={previewTemplateData.id}
            storeName={storeName}
            logoUrl={logoUrl}
            storeId={storeInfo?.storeId || storeId}
            settings={settings}
            products={liveProducts}
            texts={texts}
            hidden={EMPTY_HIDDEN}
            currency={currency}
            editable={false}
            selectedSection="hero"
            onSelectSection={() => undefined}
            onToggleHidden={() => undefined}
            onUpdateText={() => undefined}
            page="home"
            onNavigate={() => undefined}
          />
        </div>
        <Group justify="space-between" mt="md">
          <Text size="sm" c="dimmed">
            Referensi sumber: {previewTemplateData.source}
          </Text>
          <Button
            onClick={() => {
              setPreviewTemplate(null);
              selectTemplate(previewTemplateData.id);
            }}
          >
            Gunakan template ini
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        centered
        size="md"
        title="Publish storefront ini"
      >
        <Stack gap="md">
          {publishedUrl ? (
            <>
              <Alert color="teal" icon={<Send size={14} />}>
                Dipublish pada {publishedAt}. Storefront Anda sekarang aktif di{" "}
                <code>{publishedUrl}</code>.
              </Alert>
              <Text size="sm" c="dimmed">
                Route ini menampilkan storefront lengkap, termasuk Beranda, Katalog, dan Detail Produk, dari edit
                terakhir Anda. Publish ulang kapan saja untuk menimpa versi sebelumnya.
              </Text>
              <Group justify="flex-end">
                <Button variant="default" onClick={() => setPublishModalOpen(false)}>
                  Tutup
                </Button>
                <Button leftSection={<ExternalLink size={14} />} onClick={openPublishedPage}>
                  Buka halaman publish
                </Button>
              </Group>
            </>
          ) : (
            <>
              <Text size="sm">
                Publish akan menyimpan snapshot edit saat ini, termasuk penggantian teks, bagian tersembunyi, dan skema
                warna, lalu membuat link aktif di <code>{STOREFRONT_BASE_URL}/nama-toko</code>.
              </Text>
              <TextInput
                label="Nama link storefront"
                description="Gunakan huruf kecil, angka, dan tanda hubung. Nama ini harus unik."
                placeholder="bosqueshop"
                value={customStoreName}
                onChange={(event) => setCustomStoreName(normalizeCustomStoreName(event.currentTarget.value))}
                error={aliasStatus === "taken" || aliasStatus === "invalid" || aliasStatus === "error" ? aliasMessage : null}
                rightSection={
                  aliasStatus === "available" ? (
                    <Check size={16} color="var(--mantine-color-teal-6)" />
                  ) : aliasStatus === "checking" ? (
                    <Loader size="xs" />
                  ) : null
                }
              />
              {customStoreName ? (
                <Text size="xs" c={aliasStatus === "available" ? "teal" : "dimmed"}>
                  {customStoreUri(normalizeCustomStoreName(customStoreName))}
                  {aliasStatus === "available" ? " - tersedia" : aliasMessage ? ` - ${aliasMessage}` : ""}
                </Text>
              ) : null}
              {publishError ? (
                <Alert color="red" icon={<AlertTriangle size={14} />}>
                  {publishError}
                </Alert>
              ) : null}
              <Text size="xs" c="dimmed">
                Halaman publish adalah aplikasi lengkap: tautan katalog membuka halaman katalog, dan kartu produk
                membuka halaman detail produk.
              </Text>
              <Group justify="flex-end">
                <Button variant="default" onClick={() => setPublishModalOpen(false)}>
                  Batal
                </Button>
                <Button
                  leftSection={<Send size={14} />}
                  onClick={publish}
                  disabled={!storeId || aliasStatus !== "available" || isPublishing}
                  loading={isPublishing}
                >
                  Publish & buka
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Modal>
    </main>
  );
}

export function StorefrontMobilePreview({ alias }: { alias: string }) {
  const [loaded, setLoaded] = useState(false);
  const src = `/${encodeURIComponent(alias)}`;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        background: "linear-gradient(180deg, #f4f4f7 0%, #e8e8ee 100%)",
        borderRadius: 18,
        padding: "20px 0",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 280,
          height: 520,
          borderRadius: 32,
          background: "#0a0a0a",
          padding: 10,
          boxShadow: "0 18px 40px -18px rgba(15,15,20,0.4), 0 4px 12px -6px rgba(15,15,20,0.25)",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 14,
            left: "50%",
            transform: "translateX(-50%)",
            width: 80,
            height: 6,
            borderRadius: 4,
            background: "#1f1f24",
            zIndex: 2,
          }}
        />
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 24,
            overflow: "hidden",
            background: "#ffffff",
            position: "relative",
          }}
        >
          <iframe
            src={src}
            title={`Preview ${alias}`}
            onLoad={() => setLoaded(true)}
            style={{
              width: 390,
              height: "calc(500px / 0.64)",
              border: 0,
              transform: "scale(0.64)",
              transformOrigin: "top left",
              display: "block",
              opacity: loaded ? 1 : 0,
              transition: "opacity 0.25s ease",
            }}
          />
          {!loaded ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6e6e76",
                fontSize: 12,
              }}
            >
              <Loader size="sm" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CustomUploadReviewModal({
  opened,
  onClose,
  confirmedCustomQa,
  customZip,
}: {
  opened: boolean;
  onClose: () => void;
  confirmedCustomQa: boolean;
  customZip: File | null;
}) {
  return (
    <Modal opened={opened} onClose={onClose} centered size="lg" title="Review unggahan kustom">
      <Stack gap="md">
        <Alert color="orange" icon={<AlertTriangle size={16} />}>
          Anda mengunggah template non-standar. Review admin diperlukan sebelum storefront ini bisa aktif.
        </Alert>
        <Paper withBorder p="md" radius="md" className="publish-flow">
          <Stack gap="sm">
            <PublishStep index={1} title="Sudah menguji alur storefront?">
              Pastikan keranjang, checkout, detail produk, dan navigasi utama tampil benar dengan data toko aktif
              sebelum dikirim.
            </PublishStep>
            <PublishStep index={2} title="Snapshot disimpan lokal">
              Kami menyimpan zip unggahan dan pengujian utama agar reviewer admin memakai artefak yang sama dengan yang Anda uji.
            </PublishStep>
            <PublishStep index={3} title="Review admin (~1 minggu)">
              Admin eTalase memeriksa bundle, memverifikasi fitur utama, lalu men-deploy halaman jika lolos.
            </PublishStep>
            <PublishStep index={4} title="Notifikasi deploy">
              Anda menerima email setelah halaman aktif. Template standar melewati review ini dan publish secara instan.
            </PublishStep>
          </Stack>
        </Paper>
        {customZip ? (
          <Text size="xs" c="dimmed">
            Diunggah: <strong>{customZip.name}</strong> ({Math.round(customZip.size / 1024)} KB)
          </Text>
        ) : null}
        {!confirmedCustomQa ? (
          <Alert color="yellow" icon={<AlertTriangle size={14} />}>
            Aktifkan pilihan &quot;Saya sudah menguji alur utama storefront&quot; sebelum mengirim untuk review.
          </Alert>
        ) : null}
        <Group justify="flex-end">
          <Button onClick={onClose}>Mengerti</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function PublishStep({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Group align="flex-start" wrap="nowrap" gap="sm">
      <div className="publish-step-bullet">{index}</div>
      <div>
        <Text fw={600} size="sm">
          {title}
        </Text>
        <Text size="xs" c="dimmed">
          {children}
        </Text>
      </div>
    </Group>
  );
}

function TemplateSelection({
  disabled,
  storeId,
  loadState,
  error,
  customZip,
  confirmedCustomQa,
  onOpenKeyModal,
  onOpenHowTo,
  onPreview,
  onSelect,
  onCustomZip,
  onConfirmCustomQa,
}: {
  disabled: boolean;
  storeId: string;
  loadState: LoadState;
  error: string | null;
  customZip: File | null;
  confirmedCustomQa: boolean;
  onOpenKeyModal: () => void;
  onOpenHowTo: () => void;
  onPreview: (id: TemplateId) => void;
  onSelect: (id: TemplateId) => void;
  onCustomZip: (file: File | null) => void;
  onConfirmCustomQa: (value: boolean) => void;
}) {
  type LayoutFilter = "all" | TemplateLayout;
  const [category, setCategory] = useState<LayoutFilter>("all");
  const standardTemplates = templates.filter((template) => template.id !== "custom-upload");
  const visibleTemplates = standardTemplates.filter((template) => {
    if (category === "all") return true;
    return template.layout === category;
  });
  const layoutCount = (layout: TemplateLayout) =>
    standardTemplates.filter((template) => template.layout === layout).length;
  const categories: { value: LayoutFilter; label: string; count: number }[] = [
    { value: "all", label: "Semua", count: standardTemplates.length },
    { value: "full-home", label: TEMPLATE_LAYOUT_LABEL["full-home"], count: layoutCount("full-home") },
    { value: "catalogue-first", label: TEMPLATE_LAYOUT_LABEL["catalogue-first"], count: layoutCount("catalogue-first") },
  ];

  return (
    <section className={`template-catalogue-page ${disabled ? "is-disabled" : ""} pb-0`}>
      <div className="catalogue-toolbar">
        <div className="catalogue-brand">
          <a href="https://e-talase.com" aria-label="e-talase" className="catalogue-wordmark">
            <img src={etalaseLogo.src} alt="e-talase" />
          </a>
          <span className="catalogue-back">Template storefront</span>
        </div>
        <Group gap="xs">
          <Button
            variant="subtle"
            color="dark"
            leftSection={<HelpCircle size={16} />}
            onClick={onOpenHowTo}
          >
            Panduan
          </Button>
          <Button leftSection={<KeyRound size={16} />} onClick={onOpenKeyModal} color={storeId ? "teal" : "dark"}>
            {storeId ? "Ubah Store ID" : "Masukkan Store ID"}
          </Button>
        </Group>
      </div>

      <header className="catalogue-hero">
        <Badge color={storeId ? "teal" : "gray"} variant="light">
          {storeId ? "Toko terhubung" : "Store ID diperlukan"}
        </Badge>
        <Title order={1}>Pilih tampilan toko, lalu jadikan milikmu.</Title>
        <Text>
          Template di halaman ini adalah template builder asli. Preview memakai data toko kamu, lalu ubah warna, font, dan teks sesuai seleramu. Upload dan publish untuk menghubungkan ke toko kamu di aplikasi e-talase.
        </Text>
        <div className="catalogue-filter-row">
          {categories.map((item) => {
            const active = category === item.value;
            return (
              <button
                key={item.value}
                className={`catalogue-filter-chip ${active ? "is-active" : ""}`}
                onClick={() => setCategory(item.value)}
                type="button"
              >
                {item.label}
                <span>{item.count}</span>
              </button>
            );
          })}
        </div>
      </header>

      {loadState === "loading" ? (
        <Alert color="blue" mx="auto" maw={1180} mb="md">
          Memuat data toko publik...
        </Alert>
      ) : null}
      {loadState === "error" && error ? (
        <Alert color="red" icon={<AlertTriangle size={16} />} mx="auto" maw={1180} mb="md">
          {error}
        </Alert>
      ) : null}

      <div className="catalogue-grid">
        {visibleTemplates.map((template) => {
          const palette = TEMPLATE_PREVIEW_PALETTES[template.id];
          const cardStyle = palette
            ? ({
                "--template-card-bg": palette.pageBg,
                "--template-card-brand": palette.brand,
                "--template-card-brand-strong": palette.brandStrong,
                "--template-card-accent": palette.accent,
                "--template-card-ink": palette.ink,
              } as React.CSSProperties)
            : undefined;
          return (
            <Paper
              className="catalogue-template-card"
              key={template.id}
              withBorder
              style={
                palette
                  ? { ...cardStyle, background: palette.pageBg, borderColor: `color-mix(in oklab, ${palette.brand} 35%, transparent)` }
                  : undefined
              }
            >
              <button
                className="catalogue-card-thumb"
                type="button"
                disabled={disabled}
                onClick={() => onPreview(template.id)}
                aria-label={`Preview ${template.name}`}
                style={palette ? { background: `linear-gradient(135deg, ${palette.pageBg}, color-mix(in oklab, ${palette.accent} 30%, ${palette.pageBg}))` } : undefined}
              >
                <img src={(TEMPLATE_SCREENSHOTS[template.id] ?? splashImage).src} alt={`Pratinjau ${template.name}`} />
                <span
                  className="catalogue-card-overlay"
                  style={palette ? { background: palette.brand, color: "#ffffff" } : undefined}
                >
                  Pratinjau & pilih →
                </span>
              </button>
              <Stack p="lg" gap="sm" className="catalogue-template-body">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <div>
                    <Title order={3} style={palette ? { color: palette.ink } : undefined}>{template.name}</Title>
                    <Text size="xs" c="dimmed" mt={4}>
                      {template.capabilities.slice(0, 2).join(" · ")}
                    </Text>
                  </div>
                  <Badge
                    variant="light"
                    style={
                      palette
                        ? {
                            background: `color-mix(in oklab, ${palette.brand} 18%, transparent)`,
                            color: palette.brandStrong,
                            borderColor: `color-mix(in oklab, ${palette.brand} 30%, transparent)`,
                          }
                        : undefined
                    }
                  >
                    {template.layout ? TEMPLATE_LAYOUT_LABEL[template.layout] : template.status}
                  </Badge>
                </Group>
                {palette ? (
                  <Group gap={6} mt={2}>
                    {[palette.brand, palette.brandStrong, palette.accent, palette.pageBg, palette.ink].map((color, i) => (
                      <span
                        key={i}
                        aria-hidden
                        style={{
                          display: "inline-block",
                          width: 14,
                          height: 14,
                          borderRadius: 4,
                          background: color,
                          border: "1px solid color-mix(in oklab, currentColor 20%, transparent)",
                        }}
                      />
                    ))}
                  </Group>
                ) : null}
                <Text size="sm" c="dimmed" lineClamp={3}>
                  {template.description}
                </Text>
                <Group grow mt="xs" className="catalogue-template-actions">
                  <Button
                    variant="outline"
                    leftSection={<Maximize2 size={16} />}
                    disabled={disabled}
                    onClick={() => onPreview(template.id)}
                    style={
                      palette
                        ? { borderColor: palette.brand, color: palette.brandStrong }
                        : undefined
                    }
                  >
                    Preview
                  </Button>
                  <Button
                    disabled={disabled}
                    onClick={() => onSelect(template.id)}
                    style={palette ? { background: palette.brand, color: "#ffffff" } : undefined}
                  >
                    Pilih
                  </Button>
                </Group>
              </Stack>
            </Paper>
          );
        })}

      </div>

      <div className="w-[80%] max-w-4xl mx-auto mt-[-30] mb-20">
        <Paper className="catalogue-template-card upload-card" withBorder>
          <Stack p="lg" h="100%" justify="space-between">
            <div>
              <Group justify="space-between" mb="sm">
                <Title order={3}>Unggah aplikasi kustom</Title>
                <FileArchive size={22} />
              </Group>
              <Text size="sm" c="dimmed">
                Unggah zip aplikasi JavaScript (maks. 2 MB). Ini diperlakukan sebagai template non-standar dan memicu
                review admin sebelum deploy. Untuk bundle lebih besar, kirim via email ke {CUSTOM_UPLOAD_EMAIL}.
              </Text>
            </div>
            <Stack>
              <FileInput
                leftSection={<Upload size={16} />}
                placeholder="Unggah .zip"
                accept=".zip,application/zip,application/x-zip-compressed"
                value={customZip}
                onChange={onCustomZip}
                disabled={disabled}
              />
              <Switch
                label="Saya sudah menguji alur utama storefront"
                checked={confirmedCustomQa}
                onChange={(event) => onConfirmCustomQa(event.currentTarget.checked)}
                disabled={disabled}
              />
            </Stack>
          </Stack>
        </Paper>
      </div>

      {disabled ? (
        <div className="disabled-cover">
          <Paper p="xl" radius="md" withBorder>
            <Title order={3}>Store ID diperlukan</Title>
            <Text c="dimmed" mt={6} mb="md">
              Pemilihan template dinonaktifkan sampai Store ID diisi.
            </Text>
            <Button onClick={onOpenKeyModal}>Masukkan Store ID</Button>
          </Paper>
        </div>
      ) : null}

      <footer className="catalogue-footer">
        <a href="https://e-talase.com" aria-label="e-talase">
          <img src={etalaseLogo.src} alt="e-talase" />
        </a>
        <div className="catalogue-footer-copy">
          © {new Date().getFullYear()} · Storefront Builder · Dibuat untuk merchant e-talase
        </div>
        <div className="catalogue-footer-links">
          {/* <Link href="/docs">Dokumentasi SDK</Link> */}
          <Link href="/">Beranda</Link>
          <Link href="/how-to">Panduan</Link>
        </div>
      </footer>
    </section>
  );
}

function FloatingActionMenu({
  panelOpen,
  previewPage,
  onChangePreviewPage,
  onBack,
  onTogglePanel,
  onOpenTheme,
  onPreview,
  onSave,
  onPublish,
  onOpenKeyModal,
  onOpenHowTo,
}: {
  panelOpen: boolean;
  previewPage: PreviewPage;
  onChangePreviewPage: (page: PreviewPage) => void;
  onBack: () => void;
  onTogglePanel: () => void;
  onOpenTheme: () => void;
  onPreview: () => void;
  onSave: () => void;
  onPublish: () => void;
  onOpenKeyModal: () => void;
  onOpenHowTo: () => void;
}) {
  const pages: PreviewPage[] = ["home", "catalogue", "product"];

  return (
    <Menu position="top-end" width={260} shadow="xl" radius="md">
      <Menu.Target>
        <Tooltip label="Aksi builder" position="left">
          <ActionIcon className="floating-action-button" size={58} radius="xl" aria-label="Aksi builder">
            <Sparkles size={24} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Halaman</Menu.Label>
        {pages.map((page) => (
          <Menu.Item
            key={page}
            leftSection={
              previewPage === page ? <CircleDot size={16} /> : <span style={{ width: 16, display: "inline-block" }} />
            }
            onClick={() => onChangePreviewPage(page)}
          >
            {PAGE_LABEL[page]}
          </Menu.Item>
        ))}
        <Menu.Divider />
        <Menu.Label>Editor</Menu.Label>
        <Menu.Item leftSection={<PanelRightOpen size={16} />} onClick={onTogglePanel}>
          {panelOpen ? "Sembunyikan panel editor" : "Tampilkan panel editor"}
        </Menu.Item>
        <Menu.Item leftSection={<Palette size={16} />} onClick={onOpenTheme}>
          Ubah skema warna
        </Menu.Item>
        <Menu.Item leftSection={<Eye size={16} />} onClick={onPreview}>
          Mode preview
        </Menu.Item>
        <Menu.Divider />
        <Menu.Label>Alur kerja</Menu.Label>
        <Menu.Item leftSection={<Save size={16} />} onClick={onSave}>
          Simpan draft
        </Menu.Item>
        <Menu.Item leftSection={<Send size={16} />} onClick={onPublish}>
          Publish
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item leftSection={<HelpCircle size={16} />} onClick={onOpenHowTo}>
          Buka panduan
        </Menu.Item>
        <Menu.Item leftSection={<SettingsIcon size={16} />} onClick={onOpenKeyModal}>
          Ubah Store ID
        </Menu.Item>
        <Menu.Item leftSection={<ArrowLeft size={16} />} onClick={onBack}>
          Kembali ke template
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
