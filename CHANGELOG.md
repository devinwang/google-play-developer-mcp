# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] — 2026-08-03

No behaviour change. Release-pipeline only.

### Build / Release

- **Publishes via npm trusted publishing (OIDC) instead of an `NPM_TOKEN` secret.** A long-lived token expires silently, and npm answers an unauthorized publish with `404 Not Found - PUT` — which reads like a missing package rather than an auth failure, so a release can look tagged and shipped while the registry never moved. OIDC has nothing to expire.
- Dropped `registry-url` from `actions/setup-node`. It writes an `.npmrc` containing `_authToken=${NODE_AUTH_TOKEN}` and, with no token supplied, exports NODE_AUTH_TOKEN as the literal placeholder `XXXXX-XXXXX-XXXXX-XXXXX`; npm then authenticates with that bogus token instead of falling through to OIDC.
- The release job upgrades npm to the `11.x` line before publishing — OIDC needs >= 11.5.1 and Node 22 still bundles 10.x. Pinned rather than `@latest` so a release never rides on whatever major npm shipped that morning.
- Provenance is generated automatically under trusted publishing, so the explicit `--provenance` flag is gone. Attestation coverage is unchanged.

## [0.1.2] — 2026-04-26

First version published to npm. Pre-publish polish only — no behaviour change beyond what 0.1.1 already shipped.

### Build / Release

- Added CI workflow (typecheck + build matrix on Node 18/20/22) and a Release workflow that, on `v*` tag push, verifies the tag matches `package.json`, builds, and runs `npm publish --access public --provenance` (sigstore attestation), then cuts a GitHub Release using the matching CHANGELOG section as the notes.
- `main` is now branch-protected: PR + CI required, no force push, no delete, linear history.

### Metadata

- Tightened `description` so the high-value search terms (Google Play, MCP, Android Publisher API, Play Developer Reporting) fit inside the first 150 characters npm shows in search results.
- `keywords`: added `mcp-server`, `cursor`, `vscode`, `codex`, `gemini-cli`, `windsurf`, `play-developer-api`, `play-developer-reporting`, `play-purchases`, `monetization`, `agentic`, `ai-assistant`, `automation`, `android-app`. Removed `llm` (too generic).
- README: added `npm version`, `npm downloads`, `CI`, `Tools: 150`, and `TypeScript-strict` badges.

## [0.1.1] — 2026-04-26

Bug fix for the Play monetization catalog endpoints.

### Fixed

- **`regionsVersion` query encoding rejected by Play API.** The googleapis SDK serialises Discovery-style flat query params, so `regionsVersion` must be supplied as the flat key `'regionsVersion.version'`. Passing the original `{ version: "2022/02" }` object produced bracket-encoded query strings (`regionsVersion[version]=...`) that Play returned 400 for. The four affected catalog tools now accept either a plain string (`"2022/02"`) or the original nested shape, and flatten before calling the SDK:
  - `monetization.onetimeproducts.patch`
  - `monetization.subscriptions.patch`
  - `monetization.subscriptions.basePlans.offers.patch`

  `monetization.subscriptions.basePlans.migratePrices` is the one endpoint where `regionsVersion` is a *body* field rather than a query param; it continues to receive the nested `{ version }` shape, normalised from either input form.

### Build

- Added a `postbuild` step that `chmod +x dist/index.js`, so the `bin` entry stays executable on clean builds.

## [0.1.0] — 2026-04-20

### Initial public release

The first release of `google-play-developer-mcp`. Fully covers the Google Play Developer API as of April 2026.

**Scope**

- **150 MCP tools** organised into 30+ resource groups
- **Android Publisher API v3** — complete surface (edits, listings, images, bundles, tracks, monetization, purchases v2, orders, reviews, users, grants, device tiers, app recovery, generated APKs, system APKs, internal app sharing, external transactions)
- **Play Developer Reporting API v1beta1** — all 7 metric sets (crash, ANR, slow start, slow rendering, excessive wake-ups, stuck background wake locks, LMK) plus errors (counts / issues / reports) and anomaly detection
- **Multi-account** — register and switch between several Play Console accounts
- **No deprecated endpoints** — uses `monetization.onetimeproducts` (not `inappproducts`), `purchases.subscriptionsv2`/`productsv2` (not v1)
- **2026 features included** — `SubscriptionPurchaseV2.offerPhase`, `purchases.subscriptionsv2.cancel`/`defer`, orders `batchGet`, `offerPhaseDetails`, price step-up consent, `outOfAppPurchaseContext`

**Safety**

- No credentials, keys, or environment-specific data in the repository
- Service-account JSON files stay on the user's disk — only paths are recorded
- `.gitignore` blocks every common credential filename pattern
- Config directory (`~/.google-play-developer-mcp/`) is created with `0700` permissions; the accounts file with `0600`
