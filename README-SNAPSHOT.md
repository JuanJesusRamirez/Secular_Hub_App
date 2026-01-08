# Consensus Snapshot Module Architecture

## Overview
The Consensus Snapshot module visualizes market outlooks for a specific year (default 2026), aggregating data from editorially compiled consensus stats and AI-generated summaries.

## Architecture

### Components (`/components/snapshot`)
- **`ConsensusSummary`**: Displays the AI-generated narrative. Uses `useAiSummary` hook to interact with `/api/ai/summary`.
- **`ThemeTreemap`**: A Recharts-based treemap showing the hierarchy of key investment themes.
- **`SentimentDonut`**: A Recharts-based donut chart showing the breakdown of market sentiment (Bullish/Bearish/etc.).
- **`InstitutionGrid`**: A horizontal scrollable list of contributing institutions with call counts.
- **`ThemeDetailModal`**: A modal dialog that lists specific outlook calls when a theme is clicked.

### Data Flow
- **`useSnapshotData`**: Central hook that fetches:
  - Theme statistics (`/api/stats/themes`)
  - Institution statistics (`/api/stats/institutions`)
  - Sample of outlooks/outlooks for specific queries (`/api/outlooks`)
- **Interaction**:
  - Clicking a theme in the Treemap triggers a focused fetch for calls related to that theme.
  - Clicking an institution filters the context (implementation note: currently highlights visuals and filters drill-downs).

### AI Integration
- The module calls `/api/ai/summary` to generate a narrative based on the context `snapshot_2026`.

## Usage
Navigate to `/snapshot` to view the dashboard. The year is currently defaulted to 2026 in the hooks.
