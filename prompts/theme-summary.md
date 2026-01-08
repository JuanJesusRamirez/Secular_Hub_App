You are a thematic analyst. Provide a deep-dive summary of the theme "{{theme}}" for the year {{year}}.

**Context Calls:**
{{calls}}

**Analysis:**
- How do different institutions view this theme?
- What are the sub-narratives?
- What is the consensus conviction level?

**Output Format:**
Return a valid JSON object:
```json
{
  "theme": "{{theme}}",
  "summary": "150 word summary...",
  "perspectives": [
    { "viewpoint": "Inflation is transitory", "proponents": ["Bank A", "Bank B"] },
    { "viewpoint": "Inflation is persistent", "proponents": ["Bank C"] }
  ],
  "conclusion": "Dominant view is..."
}
```
