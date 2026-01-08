# Year-over-Year Delta Module
**Implemented by:** Agent Antigravity
**Date:** 2026-01-03

## Overview
The Year-over-Year Delta module visualizes the shift in secular themes and institutional outlooks between two selected years. It answers the question: *"What changed in Wall Street's thinking from [Year A] to [Year B]?"*

## Features

### 1. Dynamic Comparison
- **Year Selector**: Allows users to select any two years for comparison.
- **URL State**: Syncs selection with URL parameters (`?year1=2025&year2=2026`) for easy sharing.

### 2. AI Delta Narrative
- Fetches detailed AI-generated analysis of the shift.
- Structured sections: "What's New", "What Intensified", "What Faded", "Notable Reversals".
- Copy-to-clipboard functionality for convenient reporting.

### 3. Theme Migration Flow (Sankey)
- Visualizes how themes evolve using a Sankey diagram.
- Tracks flow from Year 1 themes to Year 2 themes.
- Highlights "New" themes and "Extinct" themes.

### 4. Conviction Shift Analysis
- Table showing significant rank changes in themes.
- Visual indicators (Up/Down arrows) for quick scanning.

### 5. Institutional Pivot Tracker
- Lists institutions that have changed their top conviction theme.
- Highlights "Pivots" vs. "Consistent" outlooks.

## Architecture

### File Structure
```
/app/delta
  ├── page.tsx            # Main assembly
  ├── loading.tsx         # Loading state
  └── layout.tsx          # Shared layout

/components/delta
  ├── year-selector.tsx   # Year selection logic
  ├── delta-stat-row.tsx  # KPI cards
  ├── ai-delta-narrative.tsx # Narrative display
  ├── theme-sankey.tsx    # Migration visualization
  ├── conviction-shift.tsx # Rank change table
  └── institution-pivots.tsx # Pivot list

/lib/hooks
  ├── use-delta-data.ts   # Data fetching aggregator
  └── use-compare-years.ts # URL state management
```

### Key Dependencies
- **Recharts**: Used for the Sankey diagram visualization.
- **Lucide React**: For iconography (arrows, sparkles, etc.).
- **Shadcn UI**: For base components (Card, Badge, Button, Select).

## Data Flow
1. **User selects years** via `YearSelector`.
2. `useCompareYears` updates URL.
3. `useDeltaData` listens to URL changes and fetches:
   - Structured comparison data from `/api/compare`.
   - AI narrative from `/api/ai/delta`.
   - Institutional stats from `/api/stats/institutions`.
4. Components render with the fetched data (or fall back to loading/mock states).

## Usage
Navigate to `/delta` to see the default 2025 vs 2026 comparison. Use the drop-downs to explore other years.
