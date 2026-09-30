# Native Utility Pack

## Project

`@teelabs/native-utility-pack` is a public React Native utility monorepo owned by `teelabs`. It starts as one umbrella npm package; future components should be added within that public package strategy. Validate primarily with Expo while preserving compatibility with standard React Native consumers.

The current component is `ReelPicker`. It ports the supplied HTML slot-reel behavior to React Native and must preserve:

- accessibility semantics and labels;
- controlled and uncontrolled values;
- change, boundary, and swipe callbacks;
- animation, gesture behavior, and reduced-motion support; and
- theme, formatting, and style customization.

## Layout

- `components/reel-picker/` — the current package component area.
- `components/reel-picker/src/` — `ReelPicker` implementation, types, and public exports.
- `components/reel-picker/README.md` — component documentation.
- `tests/` — behavior and integration tests as they are added.
- `docs/` — package and architecture documentation as it is added.
- `examples/` — Expo validation applications as they are added.
- `.github/workflows/` — CI and release automation as it is added.

Keep the layout discoverable and update this file when a durable repository convention changes.

## Development

- Use TypeScript.
- Treat React and React Native as peer dependencies of the published package.
- Implement behavior changes test-first: add a failing behavior test, implement the smallest change, then refactor.
- Verify the package build and run `npm pack --dry-run` before considering packaging work complete.
- Use the Expo example for manual validation, including accessibility, gestures, animation, reduced motion, controlled/uncontrolled usage, and customization.
- Preserve public exports and type contracts unless a deliberate API change is documented.

## CI and Publishing

Pull requests and pushes should run lint, typecheck, tests, the package build, and package validation. Publishing uses the `@teelabs` npm namespace.

Initial publishing is dry-run/manual until explicitly enabled. Real publication requires a tagged release and approval through the protected GitHub environment. Use npm provenance/trusted publishing where supported. Do not publish, create releases, or make irreversible GitHub changes without explicit authorization.

The public GitHub repository is `teelabs/native-utility-pack`; issues, pull requests, and releases are tracked there.

## Versioning and Changelog

For meaningful changes, version bumps, release preparation, or changelog work, use the `$version-changelog` skill. Follow SemVer and Keep a Changelog conventions, keep ongoing work under `[Unreleased]`, and keep every version-tracking file consistent. Choose the bump from the change type: breaking changes are major, new backward-compatible features are minor, and fixes are patch-level.

Documentation-only and CI-only changes do not automatically require a version bump. Behavior or public API changes require the relevant documentation and changelog updates.

## Agent Workflow

1. Inspect the repository state and relevant package, CI, and release files before editing.
2. Preserve unrelated user changes and keep the requested scope bounded.
3. For implementation work, follow the test-first development expectation.
4. Run the relevant verification commands and inspect their completed output before claiming success.
5. Update documentation and the changelog when behavior or the public API changes.
6. Report partial results and failed verification plainly; do not imply that an unrun check passed.
