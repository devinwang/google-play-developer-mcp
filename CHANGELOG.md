# Changelog

All notable changes to this project follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
