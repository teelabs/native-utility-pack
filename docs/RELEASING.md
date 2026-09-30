# Releasing Native Utility Pack

## GitHub Pages

The `pages.yml` workflow builds the root package, exports the Expo Web app from `examples/showcase`, and deploys only `examples/showcase/dist`.

In the repository settings, set Pages → Build and deployment → Source to **GitHub Actions**. The deployed site uses the repository base path:

`https://teelabs.github.io/native-utility-pack/`

## npm trusted publishing

Before enabling publication:

1. Create the npm package under the public `@teelabs` namespace.
2. In npm trusted publishing settings, add the GitHub repository `teelabs/native-utility-pack` and workflow `.github/workflows/publish.yml`.
3. Create a protected GitHub environment named `npm-publish` and require reviewer approval.
4. Confirm the package is public and that the organization permits provenance attestations.
5. Run the workflow manually or push a SemVer tag such as `v0.1.0` only after the release has been reviewed.

The workflow uses npm provenance and does not store an npm token. A tag must be created only after the version in `package.json` and the corresponding changelog release entry are consistent. The initial project state remains suitable for local `npm publish --dry-run` until these settings are enabled.

## Release checklist

- Run `npm run ci`.
- Run `cd examples/showcase && npm run build:web`.
- Run `npm pack --dry-run` and inspect the file list.
- Use the `$version-changelog` skill for the version bump and release entry.
- Create and review the release tag.
- Approve the protected `npm-publish` environment deployment.
