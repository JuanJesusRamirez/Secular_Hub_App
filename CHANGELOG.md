## [2.0.0] - 2026-01-13

### Major Changes
- **Architecture**: Migrated core data from CSV/SQLite to **PostgreSQL**.
- **Performance**: Implemented a caching layer (`word_cloud_cache`) to reduce API response times from seconds to milliseconds.
- **Word Analysis**: New consolidated analysis engine supporting words, phrases, and historical periods (2019-2026).
- **Dynamic Content**: API now dynamically fetches available years and metadata from the database.

### Added
- **Aggregated Views**: Added support for "All Years (2019-2026)" analysis.
- **Improved UI**: Updated sidebar navigation and icons for better tool discovery.

---

## [1.0.0] - 2026-01-03

### Added
- **Demo Mode**: Floating controller (`Ctrl + .`) for presentation navigation.
- **Presenter Overlay**: Script notes for live demo.
- **Resilient Home Page**: `page.tsx` now handles backend failures gracefully with fallback data.
- **Integration Tests**: Added tests for API, Snapshot, Delta, and AI modules in `/tests/integration`.
- **Scripts**: `seed-demo-data.ts` and `pre-flight-check.ts`.
- **Documentation**: Deployment guide, Demo script, and Troubleshooting guide.
- **Azure/CI**: ARM template and GitHub Actions workflow.

### Fixed
- **API Robustness**: Added error logging and manual JSON serialization to `/api/stats` to handle potential BigInt issues (Note: Persistent environment issue remaining, workaround in place via fallback).
- **Layout**: Added global Demo components to `layout.tsx`.

### Known Issues
- `/api/stats` endpoint currently returns 500 in some environments. Home page uses fallback data to ensure Demo continuity.
