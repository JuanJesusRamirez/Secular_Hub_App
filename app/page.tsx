import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Building2,
  FileText,
  Tags,
  FolderTree,
  Bookmark
} from "lucide-react";

import { getHomeStats, getBaseCasesByYear } from "@/lib/db/queries";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [stats, baseCases] = await Promise.all([
    getHomeStats(),
    getBaseCasesByYear(),
  ]);

  // Merge base cases with year stats
  const yearsData = baseCases.map(bc => ({
    year: bc.year,
    baseCase: bc.baseCase,
    description: bc.description,
    callCount: stats.years.find(y => y.year === bc.year)?.count || 0,
  }));

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="space-y-6 pt-4">
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1 space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Eight Years of Wall Street Consensus
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Secular and cyclical trend context, built from the collection of investment views
              published in annual outlooks by the world&apos;s largest financial institutions.
            </p>
          </div>

          {/* Animated Bull */}
          <div className="flex-shrink-0 hidden md:block">
            <video
              src="/images/Animated_Bull_Eyes_Blink_Only.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="h-32 w-auto rounded-lg"
            />
          </div>
        </div>

        {/* Key Stats - Macro Top-Down Narrative */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Time Span */}
          <div className="flex flex-col items-center justify-center p-5 bg-muted/30 rounded-lg border">
            <Calendar className="h-5 w-5 text-muted-foreground mb-2" />
            <span className="text-3xl font-bold">{stats.yearsCount}</span>
            <span className="text-sm text-muted-foreground text-center">Years</span>
            <span className="text-xs text-muted-foreground">2019-2026</span>
          </div>
          {/* Who */}
          <div className="flex flex-col items-center justify-center p-5 bg-muted/30 rounded-lg border">
            <Building2 className="h-5 w-5 text-muted-foreground mb-2" />
            <span className="text-3xl font-bold">{stats.institutionsCount}</span>
            <span className="text-sm text-muted-foreground text-center">Institutions</span>
          </div>
          {/* Categories */}
          <div className="flex flex-col items-center justify-center p-5 bg-muted/30 rounded-lg border">
            <FolderTree className="h-5 w-5 text-muted-foreground mb-2" />
            <span className="text-3xl font-bold">{stats.themeCategoriesCount}</span>
            <span className="text-sm text-muted-foreground text-center">Categories</span>
          </div>
          {/* Themes */}
          <div className="flex flex-col items-center justify-center p-5 bg-muted/30 rounded-lg border">
            <Tags className="h-5 w-5 text-muted-foreground mb-2" />
            <span className="text-3xl font-bold">{stats.themesCount}</span>
            <span className="text-sm text-muted-foreground text-center">Themes</span>
          </div>
          {/* SubThemes */}
          <div className="flex flex-col items-center justify-center p-5 bg-muted/30 rounded-lg border">
            <Bookmark className="h-5 w-5 text-muted-foreground mb-2" />
            <span className="text-3xl font-bold">{stats.subThemesCount}</span>
            <span className="text-sm text-muted-foreground text-center">SubThemes</span>
          </div>
          {/* Investment Views */}
          <div className="flex flex-col items-center justify-center p-5 bg-muted/30 rounded-lg border">
            <FileText className="h-5 w-5 text-muted-foreground mb-2" />
            <span className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground text-center">Investment Views</span>
          </div>
        </div>

        {/* Secondary Stats Row - Depth & Participation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-muted/20 rounded-lg border">
            <div className="text-xl font-semibold">~{stats.avgViewsPerYear.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Views per Year</div>
            <div className="text-xs text-muted-foreground/70">average</div>
          </div>
          <div className="p-4 bg-muted/20 rounded-lg border">
            <div className="text-xl font-semibold">~{stats.avgViewsPerInstitution}</div>
            <div className="text-sm text-muted-foreground">per Institution</div>
            <div className="text-xs text-muted-foreground/70">average</div>
          </div>
          <div className="p-4 bg-muted/20 rounded-lg border">
            <div className="text-xl font-semibold">62</div>
            <div className="text-sm text-muted-foreground">Institutions</div>
            <div className="text-xs text-muted-foreground/70">per year</div>
          </div>
          <div className="p-4 bg-muted/20 rounded-lg border">
            <div className="text-xl font-semibold">{stats.peakYear}</div>
            <div className="text-sm text-muted-foreground">Peak Coverage</div>
            <div className="text-xs text-muted-foreground/70">{stats.peakYearViews.toLocaleString()} views</div>
          </div>
        </div>
      </section>

      {/* Methodology and Data Source Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h2 className="text-2xl font-bold tracking-tight">Methodology and Data Source</h2>
        </div>

        <Card className="bg-muted/20">
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed">
              Bloomberg News&apos; annual <span className="font-medium text-foreground">&quot;Here&apos;s (Almost) Everything Wall Street Expects in [YEAR]&quot;</span> series,
              edited by Sam Potter (Senior Markets Editor), serves as the primary data source. Views and research are sampled from content
              shared with media or publicly accessible online, with multi-asset and macro teams preferred for broad market coverage.
              Maximum 15 calls per institution. Key views selected at Bloomberg&apos;s discretion.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* How Consensus is Built Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h2 className="text-2xl font-bold tracking-tight">How Consensus is Built</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Step 1 */}
          <Card className="relative">
            <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
              STEP 1
            </div>
            <CardHeader className="pt-6">
              <CardTitle className="text-lg">Base Case Identification</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Bloomberg editorial team identifies the <strong className="text-foreground">central scenario</strong> that
              represents the consensus view across institutions based on editorial judgment.
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card className="relative">
            <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
              STEP 2
            </div>
            <CardHeader className="pt-6">
              <CardTitle className="text-lg">Thematic Ordering</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Themes are sorted by <strong className="text-foreground">editorial relevance</strong> into thematic buckets.
              Remaining calls organized by standard asset class categories (equities, rates, FX, commodities, alternatives).
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="relative">
            <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
              STEP 3
            </div>
            <CardHeader className="pt-6">
              <CardTitle className="text-lg">Conviction Ranking</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Within each category, calls ordered by <strong className="text-foreground">apparent level of conviction</strong> as
              judged by Bloomberg News. Similar conviction levels sorted alphabetically by institution.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Coverage Timeline Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h2 className="text-2xl font-bold tracking-tight">Eight Years of Market Narratives Captured</h2>
        </div>
        <p className="text-muted-foreground">
          From late-cycle jitters through pandemic shock, inflation crisis, and the AI revolution —
          each year&apos;s Bloomberg-identified Base Case scenario and consensus theme.
        </p>

        <div className="grid gap-3">
          {yearsData.map((yearData, index) => (
            <Link
              key={yearData.year}
              href={`/snapshot?year=${yearData.year}`}
              className="group"
            >
              <Card className={`transition-all hover:bg-muted/50 hover:border-primary/50 ${index === 0 ? 'border-primary/30 bg-primary/5' : ''}`}>
                <CardContent className="py-4 px-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div className="text-2xl font-bold w-16">{yearData.year}</div>
                      <div className="hidden sm:block h-8 w-px bg-border" />
                      <div>
                        <div className="font-medium group-hover:text-primary transition-colors">
                          {yearData.baseCase}
                        </div>
                        <div className="text-sm text-muted-foreground hidden md:block">
                          {yearData.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium">{yearData.callCount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">views</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Key Assumptions & Limitations Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 bg-amber-500 rounded-full" />
          <h2 className="text-2xl font-bold tracking-tight">Key Assumptions &amp; Limitations</h2>
        </div>

        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="pt-6">
            <ul className="text-sm text-muted-foreground space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-amber-500 font-bold">1</span>
                <span><strong className="text-foreground">Qualitative aggregation:</strong> This is journalism-driven synthesis, not quantitative modeling. No weighting by historical accuracy or AUM.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-500 font-bold">2</span>
                <span><strong className="text-foreground">Editorial discretion:</strong> Inclusion, presentation, conviction ranking, and base case identification are entirely at Bloomberg News&apos; discretion.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-500 font-bold">3</span>
                <span><strong className="text-foreground">Marketing origin:</strong> Source content originated as marketing material with standard industry disclaimers.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-500 font-bold">4</span>
                <span><strong className="text-foreground">Non-exhaustive:</strong> The list is explicitly not comprehensive. Some institutions may not appear because research was unavailable or deemed unsuitable.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-500 font-bold">5</span>
                <span><strong className="text-foreground">Partial representation:</strong> Displayed views may not represent full institutional positioning across departments.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
