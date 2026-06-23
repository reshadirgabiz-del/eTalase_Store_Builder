"use client";

import Link from "next/link";
import { Alert, Badge, Button, Group, List, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { ArrowLeft, KeyRound, LayoutTemplate, Palette, Send, Sparkles } from "lucide-react";
import etalaseLogo from "../../assets/logo.png";

type Step = {
  index: number;
  title: string;
  description: string;
  details: string[];
  icon: React.ReactNode;
};

const STEPS: Step[] = [
  {
    index: 1,
    title: "Hubungkan toko eTalase",
    description:
      "Builder memerlukan Store ID dan access key untuk mengambil data toko, produk, dan pengaturan publik dari akun eTalase Anda.",
    details: [
      "Buka halaman builder dan klik tombol \"Masukkan Store ID\".",
      "Masukkan Store ID (format UUID) dari dashboard eTalase Anda.",
      "Masukkan access key. Gunakan public key (etalase_pk_live_...) untuk sinkronisasi otomatis pertama kali, atau secret key (etalase_sk_live_...) jika sudah pernah login.",
      "Klik Login. Sesi Anda disimpan di browser, sehingga tidak perlu login ulang setiap membuka halaman.",
    ],
    icon: <KeyRound size={18} />,
  },
  {
    index: 2,
    title: "Pilih atau unggah template",
    description:
      "Pilih satu dari template standar yang siap pakai, atau unggah aplikasi kustom dalam format zip jika Anda punya kebutuhan khusus.",
    details: [
      "Lihat preview tiap template dengan data toko Anda sebelum memilih.",
      "Template standar langsung dapat diedit dan dipublish secara instan.",
      "Unggahan kustom (zip) akan masuk antrian review admin (~1 minggu) sebelum dideploy.",
      "Pastikan alur utama storefront (katalog, detail produk, navigasi) sudah diuji sebelum mengirim unggahan kustom.",
    ],
    icon: <LayoutTemplate size={18} />,
  },
  {
    index: 3,
    title: "Atur tema, teks, dan publish",
    description:
      "Sesuaikan skema warna, font, dan teks pada setiap bagian, lalu publish ke link kustom di store.e-talase.com.",
    details: [
      "Klik bagian apa pun di preview untuk mengedit teksnya langsung.",
      "Buka panel Tema untuk mengganti palet warna, font heading/body, dan gambar hero.",
      "Gunakan menu mengambang di kanan bawah untuk preview, simpan draft, atau publish.",
      "Saat publish, pilih nama link unik (misal: \"bosqueshop\") — storefront aktif di store.e-talase.com/nama-link.",
    ],
    icon: <Palette size={18} />,
  },
];

export default function HowToPage() {
  return (
    <main className="howto-page">
      <header className="howto-toolbar">
        <div className="howto-brand">
          <a href="https://e-talase.com" aria-label="e-talase" className="howto-wordmark">
            <img src={etalaseLogo.src} alt="e-talase" />
          </a>
          <span className="howto-back">Panduan builder</span>
        </div>
        <Group gap="xs">
          <Button
            component={Link}
            href="/templates"
            variant="default"
            leftSection={<LayoutTemplate size={16} />}
          >
            Ke katalog template
          </Button>
          <Button component={Link} href="/" leftSection={<ArrowLeft size={16} />}>
            Kembali ke beranda
          </Button>
        </Group>
      </header>

      <section className="howto-hero">
        <Badge color="teal" variant="light" leftSection={<Sparkles size={12} />}>
          Panduan 3 langkah
        </Badge>
        <Title order={1}>Dari Store ID sampai storefront aktif dalam 3 langkah.</Title>
        <Text c="dimmed" maw={720} mx="auto">
          Halaman ini menjelaskan alur kerja singkat untuk merangkai storefront e-talase Anda — mulai dari menghubungkan toko, memilih template, sampai mempublikasikan link kustom.
        </Text>
      </section>

      <section className="howto-steps">
        <Stack gap="lg" maw={880} mx="auto">
          {STEPS.map((step) => (
            <Paper key={step.index} withBorder radius="lg" p="xl" className="howto-step-card">
              <Group align="flex-start" wrap="nowrap" gap="lg">
                <ThemeIcon size={48} radius="xl" variant="light" color="teal">
                  {step.icon}
                </ThemeIcon>
                <Stack gap="sm" style={{ flex: 1 }}>
                  <Group gap="sm" align="baseline">
                    <Text size="xs" fw={700} c="teal" tt="uppercase" lts={1}>
                      Langkah {step.index}
                    </Text>
                    <Title order={3}>{step.title}</Title>
                  </Group>
                  <Text c="dimmed">{step.description}</Text>
                  <List size="sm" spacing="xs" withPadding>
                    {step.details.map((detail) => (
                      <List.Item key={detail}>{detail}</List.Item>
                    ))}
                  </List>
                </Stack>
              </Group>
            </Paper>
          ))}
        </Stack>
      </section>

      <section className="howto-cta">
        <Paper withBorder radius="lg" p="xl" maw={880} mx="auto" className="howto-cta-card">
          <Group justify="space-between" wrap="wrap" gap="md">
            <div>
              <Title order={4}>Siap mencoba?</Title>
              <Text size="sm" c="dimmed" mt={4}>
                Buka katalog template, pilih tampilan yang cocok, dan mulai sesuaikan dengan data toko Anda.
              </Text>
            </div>
            <Button component={Link} href="/templates" leftSection={<Send size={16} />} size="md">
              Mulai membangun
            </Button>
          </Group>
        </Paper>
      </section>

      <Alert
        color="gray"
        variant="light"
        maw={880}
        mx="auto"
        mt="xl"
        title="Butuh bantuan lebih lanjut?"
      >
        Kunjungi <a href="https://e-talase.com" target="_blank" rel="noopener noreferrer">e-talase.com</a>{" "}
        untuk dokumentasi produk lengkap, atau hubungi tim support melalui dashboard eTalase Anda.
      </Alert>

      <footer className="howto-footer">
        <a href="https://e-talase.com" aria-label="e-talase">
          <img src={etalaseLogo.src} alt="e-talase" />
        </a>
        <div className="howto-footer-copy">© {new Date().getFullYear()} · Panduan Storefront Builder</div>
        <div className="howto-footer-links">
          <Link href="/">Beranda</Link>
          <Link href="/templates">Template</Link>
        </div>
      </footer>
    </main>
  );
}
