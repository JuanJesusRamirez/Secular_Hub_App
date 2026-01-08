# Secular Forum AI Integration Service

This service provides AI-powered narrative generation and analysis for the Secular Forum Hub. It integrates with Azure OpenAI (primary) or OpenAI (fallback) to process outlook calls.

## Architecture

- **Client**: `lib/ai/client.ts` - Abstracted client for Azure/OpenAI.
- **Caching**: `lib/ai/cache.ts` - LRU in-memory cache (TTL 1 hour) to minimize API costs.
- **Parsers**: `lib/ai/parsers.ts` - Zod schemas for validating structured JSON outputs.
- **Prompts**: `prompts/*.md` - Markdown templates for LLM instructions.
- **Endpoints**: `app/api/ai/*` - Next.js API routes exposing AI capabilities.

## Configuration

Set the following environment variables in `.env`:

```bash
# Azure OpenAI (Preferred)
AZURE_OPENAI_KEY=your_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

# OpenAI (Fallback)
OPENAI_API_KEY=sk-...
```

## API Reference

### 1. Consensus Summary
**POST** `/api/ai/summary`
Generates a narrative summary of outlook calls.

```json
{
  "year": 2025,
  "theme_category": "Macro",
  "max_calls": 50
}
```

### 2. Sentiment Analysis
**POST** `/api/ai/sentiment`
Batch analyzes sentiment of specific calls.

```json
{
  "call_ids": ["call_123", "call_456"]
}
```

### 3. Delta Narrative
**POST** `/api/ai/delta`
Compares narratives between two years.

```json
{
  "year1": 2024,
  "year2": 2025
}
```

### 4. Natural Language Query
**POST** `/api/ai/query`
Answers questions based on context calls.

```json
{
  "question": "What is the view on inflation?",
  "filters": { "year": 2025 }
}
```
