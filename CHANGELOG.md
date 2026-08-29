# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- Multi-column sorting and multi-filter APIs with typed descriptors.
- Clear, reset, state-inspection, and correctly spelled bookmark helpers.
- Custom bookmark identity, storage keys, URL parameter names, filter modes,
  null placement, storage-event synchronization, and pure processing helpers.
- Comprehensive hook, core, browser persistence, URL, and SSR tests.

### Changed

- Rebuilt the public types so configuration is optional and keys are inferred
  from the item type.
- Made filtering, sorting, and bookmark prioritization stable and non-mutating.
- Split memoized processing so bookmark changes do not repeat filtering and
  sorting, and reused a single natural-sort collator.
- Modernized dual ESM/CommonJS packaging, declarations, build tooling, linting,
  testing, coverage thresholds, clean-install CI, and package metadata.
- Updated the development stack to supported ESLint 10, React Hooks lint rules,
  Vitest 4, and jsdom 29 releases with a zero-vulnerability lockfile.

### Fixed

- Fixed stale state when several bookmark or rule updates are batched.
- Fixed explicit ascending requests unexpectedly toggling to descending.
- Prevented malformed or unavailable localStorage from crashing the hook.
- Prevented mount-time URL rewrites and preserved unrelated query parameters and
  hashes.
- Removed hard-coded bookmark identity and unsafe object-to-array spreading.
- Made all browser APIs safe during server rendering.

## [1.1.0] - 2025-08-14
### Changed
- Bumped package version to `1.1.0`.
- Added this changelog to document future updates.

### Fixed
- Corrected package metadata in `package-lock.json` to match the published version.
