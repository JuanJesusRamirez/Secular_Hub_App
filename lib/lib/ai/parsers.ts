import { z } from 'zod';
import { ConsensusSummaryOutput, SentimentAnalysisOutput, DeltaNarrativeOutput, QueryOutput } from '@/types/ai';

export const ConsensusSummarySchema = z.object({
  summary: z.string(),
  key_themes: z.array(z.string()),
  dominant_view: z.string(),
  notable_outliers: z.array(z.object({
    institution: z.string(),
    view: z.string(),
  })),
  confidence: z.enum(['high', 'medium', 'low']),
});

export const SentimentAnalysisSchema = z.object({
  sentiment: z.enum(['bullish', 'bearish', 'neutral', 'mixed']),
  confidence: z.number().min(0).max(1),
  key_phrases: z.array(z.string()),
});

export const DeltaNarrativeSchema = z.object({
  narrative: z.string(),
  sections: z.object({
    whats_new: z.string(),
    whats_intensified: z.string(),
    whats_faded: z.string(),
    notable_reversals: z.string(),
  }),
  key_shifts: z.array(z.object({
    theme: z.string(),
    direction: z.string(),
    driver: z.string(),
  })),
});

export const QuerySchema = z.object({
  answer: z.string(),
  sources: z.array(z.object({
    id: z.string(),
    institution: z.string(),
    excerpt: z.string(),
  })),
  follow_up_questions: z.array(z.string()),
});

// AI Generation schemas for backfill migration
export const SubThemeGenerationSchema = z.object({
  subTheme: z.string().min(2).max(100),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

export const SectionDescriptionGenerationSchema = z.object({
  sectionDescription: z.string().min(10).max(500),
  confidence: z.number().min(0).max(1),
  keyPoints: z.array(z.string()),
});

export type SubThemeGeneration = z.infer<typeof SubThemeGenerationSchema>;
export type SectionDescriptionGeneration = z.infer<typeof SectionDescriptionGenerationSchema>;

/**
 * Helper to parse JSON from AI response, handling markdown code blocks if present.
 */
export function parseAiResponse<T>(content: string | null | undefined, schema: z.ZodType<T>): T {
  if (!content) {
    throw new Error('Empty AI response');
  }

  let jsonString = content.trim();

  // Strip markdown code blocks if present
  if (jsonString.startsWith('```')) {
    const lines = jsonString.split('\n');
    if (lines[0].startsWith('```')) {
      lines.shift(); // Remove first line
    }
    if (lines[lines.length - 1].startsWith('```')) {
      lines.pop(); // Remove last line
    }
    jsonString = lines.join('\n');
  }
  
  // Attempt to parse JSON
  try {
    const parsed = JSON.parse(jsonString);
    return schema.parse(parsed);
  } catch (error) {
    console.error('Failed to parse AI response:', content);
    throw new Error(`Invalid structured output: ${error}`);
  }
}
