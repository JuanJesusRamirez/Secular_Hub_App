import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// SubTheme patterns based on keywords in call text
const SUBTHEME_PATTERNS: Record<string, Array<{ keywords: string[]; subTheme: string }>> = {
  'AI': [
    { keywords: ['magnificent seven', 'mag 7', 'mega cap'], subTheme: 'Magnificent Seven Leadership' },
    { keywords: ['earnings', 'profit', 'revenue'], subTheme: 'Tech Earnings Resilience' },
    { keywords: ['capex', 'capital expenditure', 'investment spend'], subTheme: 'Capex Beneficiaries' },
    { keywords: ['semiconductor', 'chip'], subTheme: 'Semiconductor Surge' },
    { keywords: ['productivity', 'efficiency'], subTheme: 'Productivity Gains' },
    { keywords: ['bubble', 'overvalued', 'valuation'], subTheme: 'Valuation Concerns' },
    { keywords: ['transform', 'disrupt', 'revolution'], subTheme: 'Sector Transformation' },
    { keywords: ['dividend'], subTheme: 'Dividend Opportunity' },
    { keywords: ['diversif'], subTheme: 'Diversification Play' },
  ],
  'GROWTH': [
    { keywords: ['soft landing'], subTheme: 'Soft Landing Expected' },
    { keywords: ['recession'], subTheme: 'Recession Risk' },
    { keywords: ['resilient', 'resilience'], subTheme: 'Economic Resilience' },
    { keywords: ['slow', 'decelerat'], subTheme: 'Growth Deceleration' },
    { keywords: ['strong', 'robust'], subTheme: 'Robust Growth' },
    { keywords: ['moderate', 'modest'], subTheme: 'Moderate Expansion' },
  ],
  'INFLATION': [
    { keywords: ['sticky', 'persistent'], subTheme: 'Sticky Inflation' },
    { keywords: ['peak', 'peaked'], subTheme: 'Peak Inflation' },
    { keywords: ['disinflation', 'falling', 'decline'], subTheme: 'Disinflation Path' },
    { keywords: ['core'], subTheme: 'Core Inflation Focus' },
    { keywords: ['wage', 'labor'], subTheme: 'Wage Pressure' },
    { keywords: ['supply chain', 'supply-chain'], subTheme: 'Supply Chain Impact' },
  ],
  'MONETARY POLICY': [
    { keywords: ['rate cut', 'cutting'], subTheme: 'Rate Cut Expectations' },
    { keywords: ['rate hike', 'hiking', 'tightening'], subTheme: 'Continued Tightening' },
    { keywords: ['pause', 'hold'], subTheme: 'Policy Pause' },
    { keywords: ['pivot'], subTheme: 'Fed Pivot' },
    { keywords: ['restrictive'], subTheme: 'Restrictive Stance' },
    { keywords: ['dovish'], subTheme: 'Dovish Turn' },
    { keywords: ['hawkish'], subTheme: 'Hawkish Bias' },
  ],
  'STOCKS': [
    { keywords: ['value'], subTheme: 'Value Rotation' },
    { keywords: ['growth'], subTheme: 'Growth Outperformance' },
    { keywords: ['quality'], subTheme: 'Quality Focus' },
    { keywords: ['small cap', 'small-cap'], subTheme: 'Small Cap Opportunity' },
    { keywords: ['large cap', 'large-cap'], subTheme: 'Large Cap Preference' },
    { keywords: ['dividend'], subTheme: 'Dividend Stocks' },
    { keywords: ['defensive'], subTheme: 'Defensive Positioning' },
    { keywords: ['cyclical'], subTheme: 'Cyclical Exposure' },
    { keywords: ['earnings'], subTheme: 'Earnings Focus' },
  ],
  'BONDS': [
    { keywords: ['duration'], subTheme: 'Duration Strategy' },
    { keywords: ['yield', 'income'], subTheme: 'Yield Opportunity' },
    { keywords: ['credit'], subTheme: 'Credit Selection' },
    { keywords: ['treasury', 'treasuries', 'government'], subTheme: 'Treasury Preference' },
    { keywords: ['corporate'], subTheme: 'Corporate Bonds' },
    { keywords: ['high yield', 'high-yield'], subTheme: 'High Yield Exposure' },
    { keywords: ['investment grade'], subTheme: 'Investment Grade Focus' },
  ],
  'US': [
    { keywords: ['exceptiona'], subTheme: 'US Exceptionalism' },
    { keywords: ['outperform'], subTheme: 'US Outperformance' },
    { keywords: ['equity', 'equities', 'stock'], subTheme: 'US Equity Preference' },
    { keywords: ['consumer'], subTheme: 'US Consumer Strength' },
    { keywords: ['fiscal'], subTheme: 'Fiscal Support' },
  ],
  'EUROPE': [
    { keywords: ['recession'], subTheme: 'European Recession Risk' },
    { keywords: ['recovery'], subTheme: 'European Recovery' },
    { keywords: ['energy'], subTheme: 'Energy Crisis Impact' },
    { keywords: ['value', 'cheap', 'discount'], subTheme: 'European Value' },
    { keywords: ['ecb'], subTheme: 'ECB Policy' },
  ],
  'CHINA': [
    { keywords: ['reopening', 'reopen', 'covid'], subTheme: 'China Reopening' },
    { keywords: ['property', 'real estate'], subTheme: 'Property Sector Concerns' },
    { keywords: ['stimulus'], subTheme: 'China Stimulus' },
    { keywords: ['slow', 'decelerat'], subTheme: 'China Slowdown' },
    { keywords: ['consumer'], subTheme: 'Chinese Consumer' },
  ],
  'APAC': [
    { keywords: ['china'], subTheme: 'China Recovery Play' },
    { keywords: ['japan'], subTheme: 'Japan Opportunity' },
    { keywords: ['india'], subTheme: 'India Growth Story' },
    { keywords: ['emerging', 'em'], subTheme: 'EM Asia Exposure' },
  ],
  'RECESSION': [
    { keywords: ['avoid', 'averted'], subTheme: 'Recession Avoided' },
    { keywords: ['mild', 'shallow'], subTheme: 'Mild Recession' },
    { keywords: ['risk', 'probability'], subTheme: 'Recession Probability' },
    { keywords: ['deep', 'severe'], subTheme: 'Deep Recession Risk' },
  ],
  'ELECTIONS': [
    { keywords: ['uncertainty'], subTheme: 'Election Uncertainty' },
    { keywords: ['volatility'], subTheme: 'Election Volatility' },
    { keywords: ['policy'], subTheme: 'Policy Implications' },
    { keywords: ['fiscal'], subTheme: 'Fiscal Policy Shift' },
  ],
  'GEOPOLITICS': [
    { keywords: ['ukraine', 'russia'], subTheme: 'Ukraine Conflict' },
    { keywords: ['china', 'taiwan'], subTheme: 'China-Taiwan Tensions' },
    { keywords: ['trade', 'tariff'], subTheme: 'Trade Tensions' },
    { keywords: ['risk'], subTheme: 'Geopolitical Risk' },
  ],
  'COMMODITIES': [
    { keywords: ['oil', 'energy'], subTheme: 'Energy Markets' },
    { keywords: ['gold'], subTheme: 'Gold Hedge' },
    { keywords: ['metal'], subTheme: 'Industrial Metals' },
    { keywords: ['agriculture', 'food'], subTheme: 'Agricultural Commodities' },
  ],
  'CREDIT': [
    { keywords: ['spread'], subTheme: 'Spread Opportunity' },
    { keywords: ['default'], subTheme: 'Default Risk' },
    { keywords: ['high yield', 'high-yield'], subTheme: 'High Yield Credit' },
    { keywords: ['investment grade'], subTheme: 'IG Credit' },
    { keywords: ['quality'], subTheme: 'Credit Quality Focus' },
  ],
  'VOLATILITY': [
    { keywords: ['hedge', 'hedging'], subTheme: 'Volatility Hedging' },
    { keywords: ['elevat', 'high'], subTheme: 'Elevated Volatility' },
    { keywords: ['opportunity'], subTheme: 'Volatility Opportunity' },
  ],
  'ESG': [
    { keywords: ['climate', 'carbon', 'green'], subTheme: 'Climate Transition' },
    { keywords: ['energy transition'], subTheme: 'Energy Transition' },
    { keywords: ['sustainable'], subTheme: 'Sustainable Investing' },
  ],
  'TECH': [
    { keywords: ['ai', 'artificial intelligence'], subTheme: 'AI Integration' },
    { keywords: ['cloud'], subTheme: 'Cloud Computing' },
    { keywords: ['software'], subTheme: 'Software Focus' },
    { keywords: ['semiconductor', 'chip'], subTheme: 'Semiconductor Play' },
    { keywords: ['cyber'], subTheme: 'Cybersecurity' },
  ],
  'VALUATIONS': [
    { keywords: ['expensive', 'rich', 'overvalued'], subTheme: 'Elevated Valuations' },
    { keywords: ['cheap', 'attractive', 'discount'], subTheme: 'Attractive Valuations' },
    { keywords: ['fair', 'reasonable'], subTheme: 'Fair Value' },
    { keywords: ['multiple', 'pe', 'p/e'], subTheme: 'Multiple Expansion' },
  ],
  'EARNINGS': [
    { keywords: ['growth'], subTheme: 'Earnings Growth' },
    { keywords: ['resilient', 'resilience'], subTheme: 'Earnings Resilience' },
    { keywords: ['decline', 'contract'], subTheme: 'Earnings Pressure' },
    { keywords: ['beat', 'surprise'], subTheme: 'Earnings Surprises' },
  ],
};

// Default subThemes by theme category
const DEFAULT_SUBTHEMES: Record<string, string> = {
  'AI': 'AI Investment Theme',
  'GROWTH': 'Growth Outlook',
  'INFLATION': 'Inflation Dynamics',
  'MONETARY POLICY': 'Central Bank Policy',
  'STOCKS': 'Equity Strategy',
  'BONDS': 'Fixed Income Strategy',
  'CREDIT': 'Credit Markets',
  'US': 'US Market View',
  'EUROPE': 'European Outlook',
  'CHINA': 'China Focus',
  'JAPAN': 'Japan Opportunity',
  'APAC': 'Asia Pacific View',
  'GLOBAL': 'Global Perspective',
  'RECESSION': 'Recession Watch',
  'ELECTIONS': 'Political Impact',
  'GEOPOLITICS': 'Geopolitical Factors',
  'COMMODITIES': 'Commodity Markets',
  'CURRENCIES': 'Currency Dynamics',
  'VOLATILITY': 'Volatility Management',
  'ESG': 'ESG Considerations',
  'TECH': 'Technology Sector',
  'MAGNIFICENT 7': 'Mega Cap Tech',
  'ENERGY': 'Energy Sector',
  'VALUATIONS': 'Valuation Assessment',
  'EARNINGS': 'Corporate Earnings',
  'YIELDS': 'Yield Environment',
  'RATE CUTS': 'Rate Cut Cycle',
  'TARIFFS': 'Trade Policy Impact',
  'RISKS': 'Risk Assessment',
  'DIVERSIFICATION': 'Portfolio Diversification',
  'QUALITY': 'Quality Factor',
  'ROTATION': 'Market Rotation',
  'FISCAL': 'Fiscal Policy',
  'CONSUMERS': 'Consumer Health',
  'DOLLAR': 'Dollar Dynamics',
  'SOFT LANDING': 'Soft Landing Scenario',
  'BASE CASE': 'Base Case View',
};

function findSubTheme(theme: string, callText: string): string {
  const text = callText.toLowerCase();
  const patterns = SUBTHEME_PATTERNS[theme] || [];

  for (const pattern of patterns) {
    if (pattern.keywords.some(kw => text.includes(kw.toLowerCase()))) {
      return pattern.subTheme;
    }
  }

  // Try generic patterns
  for (const [patternTheme, patternList] of Object.entries(SUBTHEME_PATTERNS)) {
    for (const pattern of patternList) {
      if (pattern.keywords.some(kw => text.includes(kw.toLowerCase()))) {
        return pattern.subTheme;
      }
    }
  }

  return DEFAULT_SUBTHEMES[theme] || 'Market Outlook';
}

function generateSectionDescription(callText: string, theme: string, institution: string): string {
  // Clean up the call text
  let text = callText.replace(/^["']|["']$/g, '').trim();

  // If call text is short enough, use a condensed version
  if (text.length < 200) {
    // Extract the main point
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length > 0) {
      let desc = sentences[0].trim();
      if (desc.length > 150) {
        desc = desc.substring(0, 147) + '...';
      }
      return desc.charAt(0).toUpperCase() + desc.slice(1) + (desc.endsWith('.') ? '' : '.');
    }
  }

  // For longer texts, extract key phrases and create summary
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);

  // Key action words that indicate main points
  const keyIndicators = ['expect', 'believe', 'see', 'favor', 'prefer', 'recommend', 'overweight', 'underweight', 'anticipate', 'forecast', 'project'];

  // Find sentence with key indicator
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    if (keyIndicators.some(ind => lower.includes(ind))) {
      let desc = sentence.trim();
      if (desc.length > 180) {
        desc = desc.substring(0, 177) + '...';
      }
      return desc.charAt(0).toUpperCase() + desc.slice(1) + (desc.endsWith('.') ? '' : '.');
    }
  }

  // Fallback: use first meaningful sentence
  if (sentences.length > 0) {
    let desc = sentences[0].trim();
    if (desc.length > 180) {
      desc = desc.substring(0, 177) + '...';
    }
    return desc.charAt(0).toUpperCase() + desc.slice(1) + (desc.endsWith('.') ? '' : '.');
  }

  return `${institution} provides outlook on ${theme.toLowerCase()} market dynamics.`;
}

async function processBatch(batchSize: number = 100): Promise<number> {
  const records = await prisma.outlookCall.findMany({
    where: {
      subTheme: null,
      year: { in: [2019, 2020, 2021, 2022, 2023, 2024] }
    },
    select: {
      id: true,
      year: true,
      institution: true,
      institutionCanonical: true,
      theme: true,
      themeCategory: true,
      callText: true
    },
    orderBy: { id: 'asc' },
    take: batchSize
  });

  if (records.length === 0) {
    return 0;
  }

  for (const record of records) {
    const callText = record.callText || '';
    const subTheme = findSubTheme(record.theme, callText);
    const sectionDescription = generateSectionDescription(callText, record.theme, record.institutionCanonical);

    // Confidence based on whether we found a pattern match
    const confidence = subTheme !== (DEFAULT_SUBTHEMES[record.theme] || 'Market Outlook') ? 0.85 : 0.75;

    await prisma.outlookCall.update({
      where: { id: record.id },
      data: {
        subTheme,
        sectionDescription,
        subThemeGenerated: true,
        subThemeConfidence: confidence,
        sectionDescGenerated: true,
        sectionDescConfidence: confidence,
        generatedAt: new Date(),
        needsReview: confidence < 0.7
      }
    });
  }

  return records.length;
}

async function main() {
  console.log('=== BULK AI GENERATION ===\n');

  // Get initial count
  const initialMissing = await prisma.outlookCall.count({
    where: { subTheme: null, year: { in: [2019, 2020, 2021, 2022, 2023, 2024] } }
  });
  console.log('Records to process:', initialMissing);

  let totalProcessed = 0;
  const batchSize = 100;

  while (true) {
    const processed = await processBatch(batchSize);
    if (processed === 0) break;

    totalProcessed += processed;
    const remaining = initialMissing - totalProcessed;
    const pct = ((totalProcessed / initialMissing) * 100).toFixed(1);

    process.stdout.write(`\rProcessed: ${totalProcessed}/${initialMissing} (${pct}%) | Remaining: ${remaining}`);
  }

  console.log('\n\n=== COMPLETE ===');
  console.log('Total processed:', totalProcessed);

  // Final stats
  const generated = await prisma.outlookCall.count({ where: { subThemeGenerated: true } });
  const needsReview = await prisma.outlookCall.count({ where: { needsReview: true } });
  console.log('Total AI-generated:', generated);
  console.log('Needs review:', needsReview);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
