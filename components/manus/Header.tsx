
export default function Header() {
    return (
        <header className="border-b border-border">
            <div className="container py-8">
                <div className="flex items-center gap-4">
                    {/* Línea de acento vertical */}
                    <div className="accent-line" />

                    <div>
                        <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
                            Informe Estratégico
                        </p>
                        <h1 className="text-4xl font-bold text-primary mt-2">
                            Predicciones Globales 2026
                        </h1>
                        <p className="text-base text-muted-foreground mt-3 max-w-2xl">
                            Meta-análisis de perspectivas de inversión de las principales instituciones financieras del mundo
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}
