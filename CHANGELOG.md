# Changelog

All notable changes to this project are documented here.

## [Unreleased]

## [0.1.1] - 2026-09-30

### Fixed

- Keep swipe previews local, emit the chosen value once on release, cap fling momentum to two extra rows, retain gesture ownership, and render a buffered strip so rapid and edge-start swipes stay visible and controlled.
- Prevent interrupted settle animations, controlled updates, and prop-only callback changes from corrupting a later gesture.
- Use one React Native spring configuration family for boundary settling so ReelPicker no longer throws on Android.

## [0.1.0] - 2026-09-30

### Added

- Initial package, Expo Web showcase, CI validation, and release automation foundation.

### Fixed

- Expo Web showcase now resolves one shared React runtime when consuming the local package, preventing the deployed `useState` runtime crash.
