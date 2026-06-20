import { readFile } from "node:fs/promises";
import path from "node:path";
import { jsonError } from "@/lib/supabase";

export async function GET() {
  try {
    const docsPath = path.resolve(process.cwd(), "../../eTalase Module/docs/index.html");
    const html = await readFile(docsPath, "utf8");
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Tidak dapat memuat dokumentasi SDK", 500);
  }
}
