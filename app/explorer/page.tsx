import { PageHeader } from "@/components/layout/page-header";

export default function ExplorerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Explorer"
        description="Deep dive into the outlook corpus."
      />

      <div className="flex h-[60vh] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20">
        <h3 className="text-xl font-semibold text-muted-foreground">Phase 2</h3>
        <p className="mt-2 text-muted-foreground">Search and semantic exploration tools coming soon.</p>
      </div>
    </div>
  );
}
