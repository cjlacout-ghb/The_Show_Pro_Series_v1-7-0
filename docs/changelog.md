# Changelog

## [1.5.0] - 2026-03-20
### Added
- **Supabase Integration**: Full database persistence for teams, players, games, and statistics.
- **Tournament Reset**: Critical feature to clear all scores and stats while preserving team rosters.
- **Improved Leaderboard**: Aggregated data processing for better performance on high volume of stats.
- **Optimistic Updates**: Scoring updates now reflect in the UI instantly before DB confirmation.
- **Swap Teams Button**: Quickly toggle Home/Visitor status in the game schedule.

### Changed
- **UI Refresh**: Migrated to a specialized Sports Dark Mode with improved typography and spacing.
- **Inning Logic**: Automated score summing from inning-by-inning inputs.
- **Navigation**: New Tab-based Menu system for better organization on mobile and desktop.

### Fixed
- **Hydration Errors**: Resolved React hydration issues during page reloads.
- **Data Race Conditions**: Fixed potential overwriting of data during rapid score entry.

## [1.0.0] - Initial Release
- Core tournament tracking system with local storage.
- Basic standings calculation.
- Manual team setup.
