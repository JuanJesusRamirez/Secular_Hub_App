
export default function Header() {
    return (
        <header className="border-b border-border">
            <div className="container py-4">
                <div className="flex items-center gap-4">
                    {/* Línea de acento vertical */}
                    <div className="accent-line" />

                    <div>
                        <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
                            Institutional Report
                        </p>
                        <h1 className="text-4xl font-bold text-primary mt-2">
                            2026 Global Predictions
                        </h1>
                        <p className="text-base text-muted-foreground mt-3 max-w-2xl">
                            Meta-analysis of investment outlooks from the world's leading financial institutions
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}
