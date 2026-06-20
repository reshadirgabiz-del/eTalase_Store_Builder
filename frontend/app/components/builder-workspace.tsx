"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  ColorInput,
  FileInput,
  Group,
  Menu,
  Modal,
  Paper,
  ScrollArea,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
  Title,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CircleDot,
  Eye,
  EyeOff,
  ExternalLink,
  FileArchive,
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
  colorSchemes,
  templates,
  type ColorScheme,
  type TemplateId,
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
  type HiddenConfig,
  type PreviewPage,
  type Product,
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

const PUBLISH_KEY_PREFIX = "etalase-builder-publish::";
const STORE_ID_STORAGE_KEY = "etalase-builder-store-id";
const LEGACY_PUBLIC_KEY_STORAGE_KEY = "etalase-builder-public-key";
const TEMPLATE_LOCKED = true;

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
  const [storeId, setStoreId] = useState("");
  const [draftStoreId, setDraftStoreId] = useState("");
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const stored =
      window.localStorage.getItem(STORE_ID_STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_PUBLIC_KEY_STORAGE_KEY) ??
      "";
    setStoreId(stored);
    setDraftStoreId(stored);
    setKeyModalOpen(!stored);
    setHasHydrated(true);
  }, []);

  const [screen, setScreen] = useState<Screen>("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("storefront-classic");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateId | null>(null);
  const [customZip, setCustomZip] = useState<File | null>(null);
  const [customUploadModalOpen, setCustomUploadModalOpen] = useState(false);
  const [confirmedCustomQa, setConfirmedCustomQa] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [scheme, setScheme] = useState<ColorScheme>(colorSchemes[0]);
  const [texts, setTexts] = useState<TextConfig>(INITIAL_TEXT);
  const [hidden, setHidden] = useState<HiddenConfig>(EMPTY_HIDDEN);
  const [selectedSection, setSelectedSection] = useState<SectionId>("hero");
  const [editorMode, setEditorMode] = useState<EditorMode>("text");
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelTab, setPanelTab] = useState<PanelTab>("theme");
  const [previewMode, setPreviewMode] = useState(false);
  const [previewPage, setPreviewPage] = useState<PreviewPage>("home");
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const liveProducts = products.length > 0 ? products : fallbackProducts;
  const storeName = settings?.storeName || storeInfo?.storeName || "Storefront";
  const logoUrl = settings?.logoUrl || storeInfo?.storePhotoUrl || "";
  const currency = settings?.currency ?? "IDR";

  const template = templates.find((item) => item.id === selectedTemplate) ?? templates[0];
  const previewTemplateData = templates.find((item) => item.id === previewTemplate) ?? template;

  const themeStyle = useMemo(() => buildThemeStyle(scheme), [scheme]);
  const bodyFontValue = normalizeFontOption(scheme.fontBody, FONT_OPTIONS[0].value);
  const headingFontValue = normalizeFontOption(scheme.fontHeading, FONT_OPTIONS[0].heading);

  const loadStore = useCallback(async (key: string) => {
    setLoadState("loading");
    setError(null);

    try {
      const [storeResponse, settingsResponse, productsResponse] = await Promise.all([
        fetch(`/api/stores/${encodeURIComponent(key)}/public`),
        fetch(`/api/settings/public?storeId=${encodeURIComponent(key)}`),
        fetch(`/api/products?storeId=${encodeURIComponent(key)}&limit=10`),
      ]);

      const storeJson = await storeResponse.json();
      if (!storeResponse.ok) throw new Error(storeJson.error ?? "Pencarian toko gagal");

      const nextSettings = settingsResponse.ok ? await settingsResponse.json() : null;
      setStoreInfo(storeJson);
      setSettings(nextSettings);
      if (nextSettings?.storeDescription) {
        setTexts((current) => ({
          ...current,
          hero:
            current.hero.body === INITIAL_TEXT.hero.body
              ? { ...current.hero, body: nextSettings.storeDescription }
              : current.hero,
          footer:
            current.footer.body === INITIAL_TEXT.footer.body
              ? { ...current.footer, body: nextSettings.storeDescription }
              : current.footer,
        }));
      }
      setProducts(productsResponse.ok ? (await productsResponse.json()).data ?? [] : []);
      setLoadState("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tidak dapat memuat data toko");
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    if (!storeId) return;
    void loadStore(storeId);
  }, [loadStore, storeId]);

  function saveStoreId() {
    const normalized = draftStoreId.trim();
    if (!normalized) return;
    window.localStorage.setItem(STORE_ID_STORAGE_KEY, normalized);
    setStoreId(normalized);
    setKeyModalOpen(false);
  }

  function selectSection(section: SectionId) {
    if (previewMode) return;
    setSelectedSection(section);
  }

  function selectTemplate(id: TemplateId) {
    setSelectedTemplate(id);
    if (id === "storefront-classic") {
      setScreen("editor");
      setPreviewMode(false);
    }
  }

  function updateText(section: SectionId, field: TextField, value: string) {
    setTexts((current) => ({
      ...current,
      [section]: { ...current[section], [field]: value },
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

  const exportConfig = {
    storeId,
    publicKey: storeId,
    template,
    theme: scheme,
    texts,
    hidden,
    publishedAt: new Date().toISOString(),
  };

  function publish() {
    if (!storeId) return;
    const config = { ...exportConfig, publishedAt: new Date().toISOString() };
    window.localStorage.setItem(PUBLISH_KEY_PREFIX + storeId, JSON.stringify(config));
    window.localStorage.setItem("etalase-builder-last-publish", JSON.stringify(config));
    setPublishedAt(new Date().toLocaleString());
    setPublishedUrl(`/preview/${encodeURIComponent(storeId)}`);
  }

  function openPublishedPage() {
    if (publishedUrl) {
      router.push(publishedUrl);
    }
  }

  const disabled = !storeId || !hasHydrated;

  return (
    <main className="builder-root">
      <Modal
        opened={keyModalOpen}
        onClose={() => storeId && setKeyModalOpen(false)}
        closeOnClickOutside={Boolean(storeId)}
        closeOnEscape={Boolean(storeId)}
        withCloseButton={Boolean(storeId)}
        centered
        title="Hubungkan toko eTalase Anda"
      >
        <Stack>
          <Text size="sm" c="dimmed">
            Masukkan Store ID sebelum memilih atau mengedit template. ID ini sama dengan yang digunakan di URL checkout.
          </Text>
          <TextInput
            label="Store ID"
            placeholder="00000000-0000-0000-0000-000000000000"
            value={draftStoreId}
            onChange={(event) => setDraftStoreId(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") saveStoreId();
            }}
          />
          <Button onClick={saveStoreId} disabled={!draftStoreId.trim()}>
            Lanjutkan
          </Button>
        </Stack>
      </Modal>

      <CustomUploadReviewModal
        opened={customUploadModalOpen}
        onClose={() => setCustomUploadModalOpen(false)}
        confirmedCustomQa={confirmedCustomQa}
        customZip={customZip}
      />

      {screen === "templates" ? (
        <TemplateSelection
          disabled={disabled}
          storeId={storeId}
          loadState={loadState}
          error={error}
          customZip={customZip}
          confirmedCustomQa={confirmedCustomQa}
          onOpenKeyModal={() => setKeyModalOpen(true)}
          onPreview={setPreviewTemplate}
          onSelect={selectTemplate}
          onCustomZip={(file) => {
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
              storeName={storeName}
              logoUrl={logoUrl}
              storeId={storeInfo?.storeId || storeId}
              settings={settings}
              products={liveProducts}
              texts={texts}
              hidden={hidden}
              currency={currency}
              editable={!previewMode && !TEMPLATE_LOCKED}
              textEditMode={editorMode === "text"}
              selectedSection={selectedSection}
              onSelectSection={selectSection}
              onToggleHidden={toggleHidden}
              onUpdateText={updateText}
              page={previewPage}
              onNavigate={setPreviewPage}
              badgeEditable={!previewMode}
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
                  setPublishModalOpen(true);
                }}
                onOpenKeyModal={() => setKeyModalOpen(true)}
              />

              <aside className={`builder-panel ${panelOpen ? "is-open" : "is-closed"}`}>
                <div className="builder-panel-header">
                  <div>
                    <Text size="xs" tt="uppercase" fw={700} c="dimmed" lts={0.6}>
                      Template
                    </Text>
                    <Title order={4} mt={2}>
                      Storefront Classic
                    </Title>
                    <Text size="xs" c="dimmed" mt={4}>
                      Layout dan teks dikunci kecuali badge hero. Tema dan font tetap dapat diedit.
                    </Text>
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
                        <Text size="sm" fw={600} mb={6}>
                          Palet preset
                        </Text>
                        <SimpleGrid cols={2} spacing="xs">
                          {colorSchemes.map((preset) => (
                            <UnstyledButton
                              key={preset.id}
                              className={`palette-swatch ${scheme.id === preset.id ? "is-selected" : ""}`}
                              onClick={() => setScheme(preset)}
                            >
                              <div className="palette-strip">
                                <span style={{ background: preset.brand }} />
                                <span style={{ background: preset.brandStrong }} />
                                <span style={{ background: preset.accent }} />
                                <span style={{ background: preset.pageBg, border: "1px solid #d9dee7" }} />
                              </div>
                              <Text size="xs" fw={600} mt={6}>
                                {preset.name}
                              </Text>
                            </UnstyledButton>
                          ))}
                        </SimpleGrid>
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
                        <Stack gap="xs">
                          {COLOR_FIELDS.map((field) => (
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
                          ))}
                        </Stack>
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
        <div className="template-modal-preview" style={themeStyle}>
          <StorefrontPreview
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
                warna, lalu membuat route aktif di <code>/preview/{storeId || "[store-id]"}</code>.
              </Text>
              <Text size="xs" c="dimmed">
                Halaman publish adalah aplikasi lengkap: tautan katalog membuka halaman katalog, dan kartu produk
                membuka halaman detail produk.
              </Text>
              <Group justify="flex-end">
                <Button variant="default" onClick={() => setPublishModalOpen(false)}>
                  Batal
                </Button>
                <Button leftSection={<Send size={14} />} onClick={publish} disabled={!storeId}>
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
            Aktifkan pilihan "Saya sudah menguji alur utama storefront" sebelum mengirim untuk review.
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
  onPreview: (id: TemplateId) => void;
  onSelect: (id: TemplateId) => void;
  onCustomZip: (file: File | null) => void;
  onConfirmCustomQa: (value: boolean) => void;
}) {
  return (
    <section className={`template-page ${disabled ? "is-disabled" : ""}`}>
      <header className="template-header">
        <div>
          <Badge color={storeId ? "teal" : "gray"}>{storeId ? "Toko terhubung" : "Store ID diperlukan"}</Badge>
          <Title order={1} mt="sm">
            Pilih template storefront
          </Title>
          <Text c="dimmed" maw={760}>
            Pilih template Storepage, preview dengan data toko publik, lalu lanjutkan ke editor warna dan teks satu
            halaman penuh. Unggahan JavaScript kustom memerlukan review admin sebelum deploy.
          </Text>
        </div>
        <Group>
          <Button component="a" href="/docs" variant="outline" leftSection={<BookOpen size={16} />}>
            Dokumentasi SDK
          </Button>
          <Button leftSection={<KeyRound size={16} />} onClick={onOpenKeyModal}>
            {storeId ? "Ubah Store ID" : "Masukkan Store ID"}
          </Button>
        </Group>
      </header>

      {loadState === "loading" ? (
        <Alert color="blue" mx="auto" maw={1180}>
          Memuat data toko publik...
        </Alert>
      ) : null}
      {loadState === "error" && error ? (
        <Alert color="red" icon={<AlertTriangle size={16} />} mx="auto" maw={1180}>
          {error}
        </Alert>
      ) : null}

      <div className="template-grid">
        {templates
          .filter((template) => template.id !== "custom-upload")
          .map((template) => (
            <Paper className="template-card" key={template.id} withBorder>
              <div className="template-snapshot" aria-hidden>
                <div className="snapshot-nav" />
                <div className="snapshot-hero">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="snapshot-grid">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <Stack p="lg">
                <Group justify="space-between">
                  <Title order={3}>{template.name}</Title>
                  <Badge color="teal">{template.status}</Badge>
                </Group>
                <Text size="sm" c="dimmed">
                  {template.description}
                </Text>
                <Text size="sm">
                  Referensi: <strong>{template.source}</strong>
                </Text>
                <Group grow>
                  <Button variant="outline" leftSection={<Maximize2 size={16} />} disabled={disabled} onClick={() => onPreview(template.id)}>
                    Preview
                  </Button>
                  <Button disabled={disabled} onClick={() => onSelect(template.id)}>
                    Pilih
                  </Button>
                </Group>
              </Stack>
            </Paper>
          ))}

        <Paper className="template-card upload-card" withBorder>
          <Stack p="lg" h="100%" justify="space-between">
            <div>
              <Group justify="space-between" mb="sm">
                <Title order={3}>Unggah aplikasi kustom</Title>
                <FileArchive size={22} />
              </Group>
              <Text size="sm" c="dimmed">
                Unggah zip aplikasi JavaScript. Ini diperlakukan sebagai template non-standar dan memicu review admin
                sebelum deploy.
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
