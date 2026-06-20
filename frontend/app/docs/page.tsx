import { Button, Group, Title } from "@mantine/core";
import { ArrowLeft } from "lucide-react";

export default function DocsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f7f8fb" }}>
      <Group justify="space-between" p="md" style={{ borderBottom: "1px solid #d9dee7", background: "#fff" }}>
        <Title order={3}>Dokumentasi SDK eTalase</Title>
        <Button component="a" href="/" variant="outline" leftSection={<ArrowLeft size={16} />}>
          Kembali ke builder
        </Button>
      </Group>
      <iframe
        src="/api/sdk-docs"
        title="Dokumentasi SDK eTalase"
        style={{ display: "block", width: "100%", height: "calc(100vh - 69px)", border: 0, background: "#fff" }}
      />
    </main>
  );
}
