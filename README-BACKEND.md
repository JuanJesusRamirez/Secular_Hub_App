# Secular Forum Hub - Backend API

This backend provides access to the Secular Forum Hub data, including 7,500+ investment outlook calls from major financial institutions.

## Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Database Setup:**
   The project uses SQLite with Prisma.
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Ingest Data:**
   Populate the database from `Bloomberg_Outlooks_2019_2026.xlsx`.
   ```bash
   npx ts-node scripts/ingest-data.ts
   ```

## Development

Run the development server:
```bash
npm run dev
```
API is accessible at `http://localhost:3000/api/...`

## API Endpoints

### Outlooks
- **GET /api/outlooks**
  - List outlooks with pagination and filtering.
  - Parameters:
    - `year` (number): Filter by year (e.g., 2026).
    - `institution` (string): Search by institution name.
    - `theme` (string): Search by theme name.
    - `theme_category` (string): Filter by mapped category (e.g., 'Macro Outlook').
    - `conviction` (string): 'high', 'medium', 'low'.
    - `search` (string): Full-text search on call text, theme, institution.
    - `limit` (number): Max records (default 50).
    - `page` (number): Page number (default 1).

- **GET /api/outlooks/[id]**
  - Get details for a specific outlook call by ID.

### Stats
- **GET /api/stats**
  - Aggregate statistics (counts by year, theme, institution).
- **GET /api/stats/themes**
  - Breakdown by theme category.
- **GET /api/stats/institutions**
  - Breakdown by institution.
- **GET /api/stats/years**
  - Breakdown by year.

### Comparison
- **GET /api/compare**
  - Compare two years to see thematic shifts.
  - Parameters:
    - `year1` (required): Base year.
    - `year2` (required): Comparison year.
  - Returns: Emerging themes, extinct themes, growing/declining themes, institutional shifts.
