# Repository Publishing and Expo Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing ReelPicker source into a publishable React Native package with Expo Web capability documentation deployed through GitHub Pages.

**Architecture:** Keep one root npm package that exports the component from `components/reel-picker/src`. Build the package with `tsup`, test public behavior with Vitest and React Native Testing Library, and build a separate Expo Web showcase under `examples/showcase` using the same package source. GitHub Actions will verify pull requests and deploy Pages; npm publication will be tag-triggered and environment-gated.

**Tech Stack:** TypeScript, React, React Native, Expo, Expo Router, tsup, Vitest, React Native Testing Library, GitHub Actions, npm trusted publishing, GitHub Pages.

**Spec:** The approved repository configuration and Expo React Native Web design from the 2026-09-30 conversation.

## Global Constraints

- Publish as `@teelabs/native-utility-pack` from one umbrella package.
- Keep React and React Native as peer dependencies.
- Validate the showcase with Expo Web.
- Keep npm publication dry-run/manual until trusted publishing and protected environment approval are enabled.
- Do not create releases, publish packages, or push remote changes without explicit authorization.
- Use SemVer and Keep a Changelog; this infrastructure-only change does not require a release bump.

## Review Focus

- Package consumers must receive the public `ReelPicker` export and declaration files.
- React and React Native must not be bundled as production dependencies.
- Typecheck, tests, build, and `npm pack --dry-run` must be executable from a clean checkout.
- Expo Web must render the actual component source, not a duplicate browser-only mock.
- Pages deployment must publish only the built showcase output and use the repository base path.

### Task 1: Bootstrap package and test tooling

**Files:**

- Create: `package.json`, `package-lock.json`, `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`, `.gitignore`, `.npmignore`, `CHANGELOG.md`
- Create: `tests/reel-picker.test.tsx`
- Modify: `components/reel-picker/src/index.ts` only if root exports require adjustment

**Interfaces:**

- Produces npm scripts: `lint`, `typecheck`, `test`, `build`, `pack:dry-run`, `ci`.
- Produces package entry points `.` and declaration output in `dist`.

- [ ] Add the failing public-interface tests for default value, controlled value, and bounded numeric tap behavior.
- [ ] Run the focused Vitest test and confirm it fails for the missing package/tooling setup.
- [ ] Add the root manifest, TypeScript/build/test configuration, and package ignore rules.
- [ ] Implement only the test-enabling configuration required for the focused tests, then run tests, typecheck, and build.
- [ ] Run `npm pack --dry-run` and inspect that source/config/test files are excluded.

### Task 2: Add Expo Web showcase

**Files:**

- Create: `examples/showcase/package.json`, `examples/showcase/app.json`, `examples/showcase/tsconfig.json`, `examples/showcase/index.ts`, `examples/showcase/App.tsx`
- Create: `examples/showcase/src/CapabilityCard.tsx`, `examples/showcase/src/theme.ts`
- Create: `examples/showcase/README.md`

**Interfaces:**

- Consumes the root package’s `ReelPicker` export through a workspace/file dependency.
- Produces a static Expo Web build in `examples/showcase/dist`.

- [ ] Add the Expo app shell with a single-page capability showcase.
- [ ] Render the actual `ReelPicker` with controlled state, bounds, formatted values, callbacks, reduced-motion control, and style customization.
- [ ] Add capability cards and accessible explanatory text for the package’s public behavior.
- [ ] Run the Expo Web export and confirm the generated output contains the showcase entry point.

### Task 3: Add CI and Pages deployment

**Files:**

- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/pages.yml`
- Create: `.github/workflows/publish.yml`
- Create: `docs/RELEASING.md`

**Interfaces:**

- CI consumes root npm scripts and the showcase export script.
- Pages workflow publishes the `examples/showcase/dist` artifact.
- Publish workflow uses `NPM_TOKEN` only as a temporary manual fallback and keeps the real publish job behind the `npm-publish` environment.

- [ ] Define pull-request and push verification for lint, typecheck, tests, build, pack dry-run, and Expo Web export.
- [ ] Define Pages permissions, artifact upload, and deployment with the repository base path.
- [ ] Define tag-triggered npm publication with provenance and an explicit protected environment.
- [ ] Document the required GitHub Pages and npm trusted-publishing settings without storing secrets.
- [ ] Validate workflow YAML syntax and run all equivalent local commands.

### Task 4: Initialize and configure the remote repository

**Files:**

- Modify: `.git/config` and Git history through normal Git commands

**Interfaces:**

- Produces remote `https://github.com/teelabs/native-utility-pack.git` with `main` as the default branch.
- Enables GitHub Pages through Actions after the repository exists.

- [ ] Initialize the local repository and commit the verified implementation.
- [ ] Create the public GitHub repository only after the user’s explicit remote authorization is confirmed.
- [ ] Push `main`, configure Pages/branch protections/environment metadata where the authenticated account permits it.
- [ ] Verify the remote repository, workflow files, and Pages URL through GitHub APIs.
