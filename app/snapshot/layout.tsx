export default function SnapshotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="section-padding space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Consensus Snapshot</h1>
        <p className="text-muted-foreground">
          Aggregated market outlooks and thematic consensus for the year ahead.
        </p>
      </div>
      {children}
    </div>
  );
}
