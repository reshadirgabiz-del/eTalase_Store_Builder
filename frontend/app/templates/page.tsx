import { Suspense } from "react";
import { BuilderWorkspace } from "@/app/components/builder-workspace";

export default function TemplatesPage() {
  return (
    <Suspense fallback={null}>
      <BuilderWorkspace />
    </Suspense>
  );
}
