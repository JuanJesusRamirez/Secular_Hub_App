import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generated values for the first 10 records
const updates = [
  {
    id: "AI-BLACKROCK_INVESTMENT_INSTITUTE-1-2024",
    subTheme: "Tech Earnings Resilience",
    sectionDescription: "Tech sector's earnings resilience expected to persist, making AI a major driver of US corporate profit growth.",
    confidence: 0.9
  },
  {
    id: "AI-BNY_MELLON_WEALTH_MANAGEMENT-2-2024",
    subTheme: "Magnificent Seven Leadership",
    sectionDescription: "AI and a resilient economy power corporate earnings, with Magnificent Seven valuations justified and rally room to broaden.",
    confidence: 0.9
  },
  {
    id: "AI-CAPITAL_GROUP-3-2024",
    subTheme: "Dividend Opportunity",
    sectionDescription: "AI enthusiasm pushed dividend-paying stock valuations to multi-decade lows, potentially making dividends more prominent in returns.",
    confidence: 0.85
  },
  {
    id: "AI-CHARLES_SCHWAB-4-2024",
    subTheme: "Capex Beneficiaries",
    sectionDescription: "AI-related stocks may benefit from increasing capital investment, though portfolio diversification remains important.",
    confidence: 0.9
  },
  {
    id: "AI-COMMONWEALTH_FINANCIAL_NETWORK-5-2024",
    subTheme: "Large-Cap Growth Foundation",
    sectionDescription: "Large-cap growth maintains solid foundation despite elevated valuations, driven by AI's revolutionary tech sector impact.",
    confidence: 0.85
  },
  {
    id: "AI-GOLDMAN_SACHS_ASSET_MANAGEMENT-6-2024",
    subTheme: "Sector Transformation",
    sectionDescription: "AI transforming semiconductors, cybersecurity, and healthcare; stock picking crucial amid wide performance dispersion.",
    confidence: 0.9
  },
  {
    id: "AI-STATE_STREET-7-2024",
    subTheme: "US Outperformance",
    sectionDescription: "US equities expected to outpace other markets on AI exposure, though margins face cost and demand headwinds.",
    confidence: 0.9
  },
  {
    id: "AI-STATE_STREET-8-2024",
    subTheme: "Multi-Factor Strategy",
    sectionDescription: "Multi-factor strategies blending quality and defensive bias recommended, with tech leaders capturing AI tailwinds.",
    confidence: 0.85
  },
  {
    id: "AI-T._ROWE_PRICE-9-2024",
    subTheme: "Structural Tailwinds",
    sectionDescription: "AI momentum provides structural growth tailwinds despite challenging valuations; small caps offer attractive entry.",
    confidence: 0.9
  },
  {
    id: "APAC-AXA_INVESTMENT_MANAGERS-1-2023",
    subTheme: "China Recovery Play",
    sectionDescription: "Asia positioned to benefit from China's post-Covid recovery, though US premium supported by tech dominance.",
    confidence: 0.85
  }
];

async function main() {
  console.log('Updating', updates.length, 'records...\n');

  for (const update of updates) {
    await prisma.outlookCall.update({
      where: { id: update.id },
      data: {
        subTheme: update.subTheme,
        sectionDescription: update.sectionDescription,
        subThemeGenerated: true,
        subThemeConfidence: update.confidence,
        sectionDescGenerated: true,
        sectionDescConfidence: update.confidence,
        generatedAt: new Date(),
        needsReview: update.confidence < 0.7
      }
    });
    console.log('✓', update.id);
    console.log('  subTheme:', update.subTheme);
    console.log('  sectionDescription:', update.sectionDescription);
    console.log('');
  }

  console.log('Done! Updated', updates.length, 'records.');

  // Verify
  const count = await prisma.outlookCall.count({
    where: { subThemeGenerated: true }
  });
  console.log('Total AI-generated records:', count);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
