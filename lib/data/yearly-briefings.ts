export interface YearlyBriefing {
  subtitle: string;
  narrative: string;
}

export const YEARLY_BRIEFINGS: Record<number, YearlyBriefing> = {
  2026: {
    subtitle: "Capex + Policy Equal Growth",
    narrative: "The global economy is expected to grow steadily around 2.6% to 3.1% in 2026, supported primarily by sustained AI-driven capital investment and accommodative fiscal and monetary policies.\n\nThe US is projected to expand between 2.25% and 2.8%, benefiting from easing tariff pressures, tax incentives, and a softening labor market.\n\nWhile growth momentum may moderate compared to 2025, recession risks remain low, though geopolitical tensions, trade uncertainties, and uneven regional performance pose notable downside risks.\n\nInvestors should adopt a cautiously constructive stance, favoring equities and credit with diversification across sectors and regions, while remaining vigilant to volatility and potential policy shifts that could impact inflation and asset valuations.",
  },
  2025: {
    subtitle: "Inflation Watch Continues",
    narrative: "Markets remain focused on inflation trajectory and Fed policy normalization.",
  },
  2024: {
    subtitle: "Post-Recession Recovery",
    narrative: "Global markets adjusting to new normal interest rates following the 2023 slowdown."
  },
  2023: {
    subtitle: "The Year of the Bond",
    narrative: "Fixed income takes center stage as equity risk premiums compress."
  },
  2022: {
    subtitle: "Inflation Returns",
    narrative: "Central banks pivot to hawkish stance amidst rising global price pressures."
  },
  2021: {
    subtitle: "The Great Reopening",
    narrative: "Vaccine distribution fuels strong economic rebound and rotation into cyclicals."
  },
  2020: {
    subtitle: "Pandemic Shock",
    narrative: "Unprecedented global lockdowns trigger massive monetary and fiscal stimulus."
  },
  2019: {
    subtitle: "Late Cycle Jitters",
    narrative: "Trade wars and yield curve inversion spark fears of looming recession."
  }
};

export function getYearlyBriefing(year: number): YearlyBriefing | null {
  return YEARLY_BRIEFINGS[year] ?? null;
}

export const AVAILABLE_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019];
