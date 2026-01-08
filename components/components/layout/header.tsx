export function Header() {
  const date = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="font-semibold text-lg">Secular Forum 2026</div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{date}</span>
        <div className="h-4 w-[1px] bg-border" />
        <span>Financial Innovation Team</span>
      </div>
    </header>
  );
}
