export interface ConsensusSummaryOutput {
  summary: string;
  key_themes: string[];
  dominant_view: string;
  notable_outliers: {
    institution: string;
    view: string;
  }[];
  confidence: 'high' | 'medium' | 'low';
}

export interface SentimentAnalysisOutput {
  sentiment: 'bullish' | 'bearish' | 'neutral' | 'mixed';
  confidence: number;
  key_phrases: string[];
}

export interface DeltaNarrativeOutput {
  narrative: string;
  sections: {
    whats_new: string;
    whats_intensified: string;
    whats_faded: string;
    notable_reversals: string;
  };
  key_shifts: {
    theme: string;
    direction: string;
    driver: string;
  }[];
}

export interface QueryOutput {
  answer: string;
  sources: {
    id: string;
    institution: string;
    excerpt: string;
  }[];
  follow_up_questions: string[];
}

export interface AiRequestError {
  error: string;
  code: string;
}
