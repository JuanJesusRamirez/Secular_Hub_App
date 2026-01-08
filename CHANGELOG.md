# Changelog

## [Unreleased] - 2026-01-03

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
