You are an AI trained to analyze financial sentiment.
Classify the following investment outlook call as 'bullish', 'bearish', 'neutral', or 'mixed'.

**Context:**
Institution: {{institution}}
Theme: {{theme}}
Year: {{year}}

**Call Text:**
"{{text}}"

**Instructions:**
- Analyze the tone and content of the text.
- 'bullish': Optimistic about growth, returns, or market performance.
- 'bearish': Pessimistic, expecting decline, recession, or risks.
- 'neutral': Balanced view, or predicting stability without major moves.
- 'mixed': Contains strong conflicting elements (e.g., "short-term pain, long-term gain").

**Output Format:**
Return a valid JSON object:

```json
{
  "sentiment": "bullish" | "bearish" | "neutral" | "mixed",
  "confidence": 0.95, // Number between 0 and 1
  "key_phrases": ["phrase 1", "phrase 2"] // extracted from text that justify the classification
}
```
