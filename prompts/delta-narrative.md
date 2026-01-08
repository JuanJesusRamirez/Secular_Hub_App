You are a market strategist analyzing the shift in investment narratives between {{year1}} and {{year2}}.

**Goal:**
Compare the consensus outlooks from these two years and identify the structural shifts, reversals, and new themes.

**Data:**
Year {{year1}} Top Themes: {{year1_themes}}
Year {{year2}} Top Themes: {{year2_themes}}

**Shift Analysis:**
We have computed the following changes in theme frequency:
- Emerged (New in {{year2}}): {{emerged}}
- Extinct (Disappeared in {{year2}}): {{extinct}}
- Major Increases: {{increased}}
- Major Decreases: {{decreased}}

**Narrative Instructions:**
Write a compelling "Delta Narrative" that explains how the market conversation changed.
- What was the obsession in {{year1}}?
- What is the new focus in {{year2}}?
- Why did this shift happen? (Infer from the themes, e.g., "Inflation" fading -> "Recession" rising implies a shift in cycle concern).

**Output Format:**
Return a valid JSON object:

```json
{
  "narrative": "200-300 word narrative explaining the shift...",
  "sections": {
    "whats_new": "Description of new themes...",
    "whats_intensified": "Description of growing themes...",
    "whats_faded": "Description of declining themes...",
    "notable_reversals": "Specific contradictions between years (e.g. 'Cash is trash' to 'Cash is King')"
  },
  "key_shifts": [
    { "theme": "Theme Name", "direction": "up/down/new/gone", "driver": "Hypothesized driver (e.g. Fed policy)" }
  ]
}
```
