# google-play-developer-mcp

> **The complete Model Context Protocol (MCP) server for Google Play.**
> 150 tools. Full Android Publisher API v3 + Play Developer Reporting API v1beta1. No deprecated endpoints. Works with Claude, Cursor, VS Code Copilot, Gemini CLI, or any MCP client.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)](package.json)
[![API: v3](https://img.shields.io/badge/Android%20Publisher-v3-4285F4.svg)](https://developers.google.com/android-publisher/api-ref/rest)
[![Reporting: v1beta1](https://img.shields.io/badge/Play%20Reporting-v1beta1-4285F4.svg)](https://developers.google.com/play/developer/reporting)
[![MCP](https://img.shields.io/badge/MCP-compatible-9B59B6.svg)](https://modelcontextprotocol.io/)

---

## Table of Contents

- [Why this exists](#why-this-exists)
- [Feature matrix](#feature-matrix)
- [Quick start](#quick-start)
- [Step-by-step setup](#step-by-step-setup)
- [Register with your MCP client](#register-with-your-mcp-client)
- [Usage examples](#usage-examples)
- [Tool reference](#tool-reference)
- [Security](#security)
- [Design notes](#design-notes)
- [Contributing](#contributing)
- [Version history](#version-history)
- [References](#references)

---

## Why this exists

Google Play Console has an API, but its surface is wide and moves fast. Existing community MCPs each cover a slice — one does store listings, another does releases, a third does reviews — and all lag behind Google's deprecations.

**`google-play-developer-mcp` is the one that covers everything.**

| Property | This server | Typical community MCP |
|---|---|---|
| Android Publisher API v3 | ✅ Full | Partial |
| Play Developer Reporting API | ✅ Full | ❌ Missing |
| `monetization.onetimeproducts` (post-2025 catalog) | ✅ | Uses deprecated `inappproducts` |
| `purchases.subscriptionsv2` / `productsv2` | ✅ | Often still on v1 |
| 2026 features (OfferPhase, cancel/defer, priceStepUp) | ✅ | ❌ |
| Multi-account | ✅ | Usually one |
| Credential safety | No keys in repo, strict `.gitignore` | Varies |
| Public release under semver | ✅ v1.0.0 | Mostly pre-1.0 |

If you drive Google Play Console with an AI assistant — release automation, review triage, subscription catalog management, crash triage — this gives the assistant a full toolbox in one install.

---

## Feature matrix

**150 tools across 30 groups. Every non-deprecated endpoint in both APIs.**

<details open>
<summary><strong>Android Publisher API v3</strong></summary>

| Group | Tools | Covers |
|---|---|---|
| `accounts_*` | 6 | Local registry — add / list / switch / remove / update multiple Play Console accounts |
| `auth_*` | 1 | Verify the service account can acquire a token |
| `apps_*` | 2 | List every app the service account can see, get app details |
| `edits_*` | 5 | Managed-publishing transactions: `insert`, `get`, `validate`, `commit`, `delete` |
| `details_*` | 3 | App-level contact email / phone / website, default language |
| `country_availability_*` | 1 | Per-country availability within an edit |
| `listings_*` | 6 | Per-locale title / short description / full description / video. Includes `delete_all` |
| `images_*` | 4 | Icon, feature graphic, promo graphic, phone/tablet/TV/wear screenshots. List, upload, delete, delete-all |
| `bundles_*` | 2 | Upload and list Android App Bundles (AAB) |
| `apks_*` | 3 | Upload / list APKs + register externally-hosted APK (enterprise) |
| `deobfuscation_files_*` | 1 | Upload ProGuard / native code mapping |
| `expansion_files_*` | 4 | OBB — get / upload / update / patch |
| `tracks_*` | 5 | `internal`, `alpha`, `beta`, `production`, plus custom closed-testing tracks. List, get, update, patch, create |
| `testers_*` | 3 | Google Groups allowlists for internal / closed tracks |
| `onetime_products_*` | 17 | ✨ New monetization catalog for non-subscription products. Three-level hierarchy: product → purchase option → offer. Complete CRUD + batch on all three levels |
| `subscriptions_*` | 8 | Subscription catalog: list, create, update, delete, archive, batch-get, batch-update |
| `subscription_base_plans_*` | 7 | Monthly/annual plans. Activate, deactivate, migrate prices, batch migrate, batch update + states |
| `subscription_offers_*` | 10 | Free trials / introductory prices. Create, update, delete, activate, deactivate + batch flavours |
| `monetization_convert_region_prices` | 1 | Compute comparable region prices from one input price |
| `purchases_products_v2_*` | 1 | Verify one-time-product purchases (supports multiple purchase options + offers) |
| `purchases_subscriptions_v2_*` | 4 | Get, revoke, cancel, defer. Includes 2026 `OfferPhase`, `outOfAppPurchaseContext`, priceStepUp consent, item-based refund |
| `purchases_subscriptions_acknowledge` | 1 | v1 acknowledge (retained — still the right call for acknowledging initial purchase) |
| `purchases_voided_list` | 1 | Refund / chargeback feed |
| `orders_*` | 4 | List, get, batch-get, refund (get + batch-get added 2025-05) |
| `external_transactions_*` | 3 | Alternative Billing (Korea / EU) — get / create / refund |
| `reviews_*` | 3 | List, get, reply |
| `users_*` + `grants_*` | 7 | Team members & per-app grants |
| `device_tier_configs_*` | 3 | Device-tier targeting for AAB |
| `app_recovery_*` | 5 | Recovery actions: list, create, deploy, cancel, add targeting |
| `generated_apks_*` | 2 | List and download generated APKs from an AAB |
| `system_apks_variants_*` | 4 | System APK variants for preload scenarios |
| `internal_app_sharing_*` | 2 | Upload APK or AAB for internal link sharing |

</details>

<details open>
<summary><strong>Play Developer Reporting API v1beta1</strong></summary>

| Group | Tools | Covers |
|---|---|---|
| `reports_apps_*` | 2 | `search`, `fetch_release_filter_options` |
| `reports_anomalies_list` | 1 | Detected anomalies across all metric sets |
| `reports_crash_rate_*` | 2 | Crash rate — metadata + time-series query |
| `reports_anr_rate_*` | 2 | ANR rate |
| `reports_slow_start_rate_*` | 2 | Slow start (cold launch) |
| `reports_slow_rendering_rate_*` | 2 | Slow rendering (jank) |
| `reports_excessive_wakeup_rate_*` | 2 | Battery — excessive wake-ups |
| `reports_stuck_background_wake_lock_rate_*` | 2 | Battery — stuck wake locks |
| `reports_lmk_rate_*` | 2 | Low-memory killer rate |
| `reports_errors_counts_*` | 2 | Aggregate error counts |
| `reports_errors_issues_search` | 1 | Grouped ErrorIssue search |
| `reports_errors_reports_search` | 1 | Raw ErrorReport search |

</details>

---

## Quick start

```bash
npm install -g google-play-developer-mcp
```

Then in your MCP client config (e.g. `~/.config/claude/config.json`, Cursor MCP config, or VS Code `mcp.json`):

```json
{
  "mcpServers": {
    "google-play-developer": {
      "command": "google-play-developer-mcp"
    }
  }
}
```

Next, tell the server which Play Console account to use — see the [setup guide](#step-by-step-setup) below.

---

## Step-by-step setup

### 1. Create a Google Cloud service account

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Select or create a project (any project — this is just where the service account lives).
3. **APIs & Services → Library** — enable both of these:
   - **Google Play Android Developer API**
   - **Google Play Developer Reporting API**
4. **IAM & Admin → Service Accounts → Create service account**.
5. Once created, open the account → **Keys → Add key → JSON**. Download the JSON file.
6. Move the JSON file somewhere safe and outside any git repo. A good location: `~/.config/google-play-developer-mcp/service-account.json`.

### 2. Authorize the service account in Play Console

1. Open [Play Console](https://play.google.com/console).
2. **Users and permissions → Invite new user**. Paste the service account email (it looks like `name@project-id.iam.gserviceaccount.com`).
3. Assign permissions:
   - **Admin (all permissions)** for full access.
   - Or narrower combinations (View app information, Manage store presence, Manage orders and subscriptions, etc.) if you want to restrict what the MCP can do.
4. **Wait up to 24 hours.** Play Console takes time to propagate the new authorization — this is a common gotcha. If early API calls return `PERMISSION_DENIED`, this is usually why.

### 3. Register the account with the MCP server

Launch any MCP client that has the server configured, then run:

```
accounts_add --name my-app \
  --keyFile /Users/you/.config/google-play-developer-mcp/service-account.json \
  --description "My company's Play Console"
```

(Or manually create `~/.google-play-developer-mcp/accounts.json` — see the file format below.)

### 4. Verify

```
auth_status
```

Should return `{ ok: true, email: "..." }`.

```
apps_list
```

Lists the apps the service account can see.

---

## Register with your MCP client

### Claude Desktop

macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "google-play-developer": {
      "command": "google-play-developer-mcp"
    }
  }
}
```

### Claude Code

```bash
claude mcp add google-play-developer google-play-developer-mcp
```

Or edit `~/.claude.json`:

```json
{
  "mcpServers": {
    "google-play-developer": {
      "command": "google-play-developer-mcp"
    }
  }
}
```

### Cursor

Settings → MCP → Add new MCP server:

```json
{
  "google-play-developer": {
    "command": "google-play-developer-mcp"
  }
}
```

### VS Code (GitHub Copilot agent mode)

`.vscode/mcp.json`:

```json
{
  "servers": {
    "google-play-developer": {
      "type": "stdio",
      "command": "google-play-developer-mcp"
    }
  }
}
```

### Gemini CLI / Codex CLI / Windsurf / Continue

Any MCP-compliant client accepts the same `command` entry — point it at the globally installed `google-play-developer-mcp` binary (or at `node /path/to/dist/index.js` if running from source).

### Running from source (no npm install -g)

```bash
git clone https://github.com/devinwang/google-play-developer-mcp.git
cd google-play-developer-mcp
npm install
npm run build
```

Then in your MCP client config:

```json
{
  "mcpServers": {
    "google-play-developer": {
      "command": "node",
      "args": ["/absolute/path/to/google-play-developer-mcp/dist/index.js"]
    }
  }
}
```

---

## Usage examples

### Release a new build to internal testing

```
accounts_switch --name my-app

# Open an edit, upload bundle, route it to the internal track, commit.
edits_insert --packageName com.example.app
# → { id: "EDIT_ID", expiryTimeSeconds: "..." }

bundles_upload --packageName com.example.app --editId EDIT_ID \
  --file /path/to/app-release.aab
# → { versionCode: 47, sha256: "..." }

tracks_update --packageName com.example.app --editId EDIT_ID \
  --track internal \
  --releases '[{"versionCodes":["47"],"status":"completed","releaseNotes":[{"language":"en-US","text":"Fixes a crash on startup."}]}]'

edits_commit --packageName com.example.app --editId EDIT_ID
```

### Promote a release from beta to production with staged rollout

```
edits_insert --packageName com.example.app
# → EDIT_ID

# Promote the beta versionCodes to production with 10% staged rollout.
tracks_update --packageName com.example.app --editId EDIT_ID \
  --track production \
  --releases '[{"versionCodes":["47"],"status":"inProgress","userFraction":0.1}]'

edits_commit --packageName com.example.app --editId EDIT_ID
```

### Reply to reviews

```
reviews_list --packageName com.example.app --maxResults 50
# → { reviews: [{ reviewId, authorName, comments, ... }] }

reviews_reply --packageName com.example.app --reviewId REVIEW_ID \
  --replyText "Thanks for the feedback! The crash is fixed in v1.2 — please update."
```

### Create a subscription with a free-trial offer

```
# 1. Create the subscription (product)
subscriptions_create --packageName com.example.app --productId plus_monthly \
  --subscription '{"listings":[{"languageCode":"en-US","title":"Plus","benefits":["All premium features"]}],"taxAndComplianceSettings":{"taxTier":"TAX_TIER_UNSPECIFIED"}}'

# 2. Create a base plan
subscription_base_plans_batch_update --packageName com.example.app --productId plus_monthly \
  --requests '[{"basePlan":{"basePlanId":"monthly","autoRenewingBasePlanType":{"billingPeriodDuration":"P1M","accountHoldDuration":"P30D"},"state":"DRAFT","regionalConfigs":[{"regionCode":"US","price":{"currencyCode":"USD","units":"9","nanos":990000000}}]},"updateMask":"autoRenewingBasePlanType,regionalConfigs"}]'

# 3. Activate the base plan
subscription_base_plans_activate --packageName com.example.app \
  --productId plus_monthly --basePlanId monthly

# 4. Create a 7-day free-trial offer
subscription_offers_create --packageName com.example.app --productId plus_monthly \
  --basePlanId monthly --offerId new-user-trial \
  --offer '{"phases":[{"duration":"P7D","regionalConfigs":[{"regionCode":"US","free":true}]}],"state":"DRAFT"}'

subscription_offers_activate --packageName com.example.app \
  --productId plus_monthly --basePlanId monthly --offerId new-user-trial
```

### Verify a purchase token server-side (backend use case)

```
# For a one-time product (consumable or non-consumable)
purchases_products_v2_get --packageName com.example.app --token PURCHASE_TOKEN

# For a subscription — includes 2026 OfferPhase, priceChangeState, etc.
purchases_subscriptions_v2_get --packageName com.example.app --token PURCHASE_TOKEN
```

### Triage crashes

```
reports_crash_rate_query \
  --name "apps/com.example.app/crashRateMetricSet" \
  --dimensions '["versionCode","countryCode"]' \
  --metrics '["crashRate","distinctUsers"]' \
  --timelineSpec '{"aggregationPeriod":"DAILY","startTime":{"year":2026,"month":4,"day":1},"endTime":{"year":2026,"month":4,"day":8}}'

reports_errors_issues_search --parent "apps/com.example.app" \
  --filter "errorIssueType = \"CRASH\""
```

---

## Tool reference

All tools use `snake_case` names following the `resource_action` convention, consistent with the Android Publisher URL structure. See the [Feature matrix](#feature-matrix) for the full group breakdown.

Each tool accepts a JSON object of arguments — inspect the schema from your MCP client (Claude Code: `/mcp tools`, Claude Desktop: show tool list in chat, Cursor: MCP panel) to see the exact shape.

Complex body arguments (e.g. `subscription`, `offer`, `appRecoveryAction`, subscription `releases`) accept the Google-documented JSON schema directly — see the [official reference](https://developers.google.com/android-publisher/api-ref/rest).

---

## Security

This repo ships with **zero** credentials. You bring a service-account JSON key; the server records only the path.

What is and isn't on disk:

| Where | What |
|---|---|
| `~/.google-play-developer-mcp/accounts.json` | Account name + key-file path + description. No secrets. Created with `0600` permissions. |
| `~/.config/…/service-account.json` (you place it) | The actual Google Cloud service-account JSON. **Never** committed. **Never** emitted by any tool. |
| Repo contents | Code only. |

### `.gitignore` blocks

- `*.json.key`, `*service-account*.json`, `*service_account*.json`, `*-sa.json`, `*-sa-key.json`
- `gcp-key*.json`, `google-credentials*.json`, `play-credentials*.json`
- `.env`, `.env.*` (but keeps `.env.example`)
- `accounts.json`, `credentials/`, `keys/`, `secrets/`
- `*.pem`, `*.p12`, `*.pfx`, `*.key`, `id_rsa*`

### Recommended hygiene

- Keep your service-account JSON outside any git repo on your machine.
- Grant the service account the **narrowest role** that your workflow needs. Full admin grants the MCP permission to delete app metadata — give it only what you need.
- Rotate the service-account key yearly: delete the old key in Google Cloud Console, create a new one, run `accounts_update --keyFile <newPath>`.
- `auth_status` never returns the actual token; only a boolean and the service-account email.

### Audit trail

Every write operation on the Android Publisher API is logged by Google Cloud IAM under the service account's identity. If you ever suspect misuse, **IAM → Audit Logs** in the Cloud Console will show which endpoints were called.

---

## Design notes

- **Edit-session-aware.** Every write on the Android Publisher API runs inside an edit. The server exposes `edits_insert` / `edits_commit` / `edits_delete` directly so you can hold an edit open across many tool calls — the most common multi-step flow. If you forget to commit, nothing ships. Safe by default.
- **Multi-account.** One server process can manage many Play Console accounts. Switch with `accounts_switch`. State lives in `~/.google-play-developer-mcp/accounts.json`.
- **No deprecated endpoints.** Catalogue endpoints use `monetization.onetimeproducts` (not the deprecated `inappproducts`). Purchase verification uses `purchasesV2` / `subscriptionsV2`.
- **Forward-compatible types.** Where Google ships an API feature faster than the `googleapis` TypeScript typings, we cast through `publisherAny()` / `reportingAny()`. The HTTP calls are identical — only TypeScript's static check is skipped on the known-drifting surfaces.
- **Good error messages.** Every Google API error is translated — 401 becomes "your token is wrong", 403 becomes "permission not propagated, wait 24h", 429 becomes "quota exhausted", etc.
- **Stateless transport.** Server is stdio, no network listener, no persistent state beyond the accounts file.
- **Zero telemetry.** The server never phones home.

---

## Contributing

PRs welcome. Before you submit:

- `npm run typecheck` passes (CI will also run this)
- Never include a service-account key or token in an issue or PR. If you need to share a reproduction, redact the token (`X-Goog-Api-Client: ...REDACTED...`).
- New tools follow the `resource_action` naming convention.
- If you add a tool that hits a new API surface, add it to the [Feature matrix](#feature-matrix) so the doc stays in sync.

---

## Version history

### 0.1.0 — 2026-04-20 (first public release)

- **150 MCP tools** covering the full Android Publisher API v3 and Play Developer Reporting API v1beta1.
- **Latest-generation endpoints only.** Uses `monetization.onetimeproducts` (replaces deprecated `inappproducts`), `purchases.productsv2` / `subscriptionsv2` (replaces v1).
- **2026 features.** `SubscriptionPurchaseV2.offerPhase`, `purchases.subscriptionsv2.cancel`/`defer`, `orders.batchGet`, `offerPhaseDetails`, price step-up consent, `outOfAppPurchaseContext`.
- **Multi-account support** with on-disk registry.
- **Zero credentials** in the repository. Comprehensive `.gitignore`.
- **Error translation** for all common Google API failure modes.

---

## References

- [Google Play Android Developer API v3 — REST reference](https://developers.google.com/android-publisher/api-ref/rest)
- [Play Developer API release notes](https://developer.android.com/google/play/billing/play-developer-apis-release-notes)
- [Play Developer Reporting API v1beta1 — REST reference](https://developers.google.com/play/developer/reporting/reference/rest)
- [`monetization.onetimeproducts` reference](https://developers.google.com/android-publisher/api-ref/rest/v3/monetization.onetimeproducts)
- [`purchases.subscriptionsv2` reference](https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.subscriptionsv2)
- [Model Context Protocol specification](https://modelcontextprotocol.io/)
- [Anthropic Claude MCP documentation](https://docs.claude.com/en/docs/mcp)

---

## License

MIT — see [LICENSE](LICENSE).
