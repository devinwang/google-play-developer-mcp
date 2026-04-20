import { z } from "zod";
import { defineTool, type Tool } from "../utils/tool.js";
import { reporting } from "../auth/client-factory.js";

/**
 * Play Developer Reporting API v1beta1.
 *
 * The API is organised around "metric sets" — normalized singleton
 * resources of app vitals. Each metric set supports `get` (metadata)
 * and `query` (time-series data with filters).
 *
 * apps.search  — list all apps the caller can see
 * anomalies.list — find statistical anomalies across metric sets
 * vitals.*     — 7 metric sets covering crashes, ANRs, performance, power
 * vitals.errors.counts / issues / reports — granular error data
 */

const appNameArg = z
  .string()
  .describe("Resource name in the form `apps/{packageName}` (e.g. apps/com.example)");

const queryRequest = z
  .object({
    dimensions: z.array(z.string()).optional(),
    metrics: z.array(z.string()).optional(),
    timelineSpec: z.record(z.any()).optional(),
    filter: z.string().optional(),
    userCohort: z.string().optional(),
    pageSize: z.number().int().optional(),
    pageToken: z.string().optional(),
  })
  .strict()
  .describe("Standard MetricSet query body — dimensions, metrics, timeline, filter.");

export const reportTools: Tool[] = [
  // ---------- apps ----------
  defineTool({
    name: "reports_apps_search",
    description: "List every app the service account can access.",
    input: z
      .object({
        pageSize: z.number().int().optional(),
        pageToken: z.string().optional(),
      })
      .strict(),
    handler: async (args) => (await (await reporting()).apps.search(args)).data,
  }),
  defineTool({
    name: "reports_apps_fetch_release_filter_options",
    description:
      "List the release-filter dimensions available for an app (version codes, track, staged rollout).",
    input: z.object({ name: appNameArg }).strict(),
    handler: async (args) =>
      (await (await reporting()).apps.fetchReleaseFilterOptions(args)).data,
  }),

  // ---------- anomalies ----------
  defineTool({
    name: "reports_anomalies_list",
    description: "List detected anomalies across metric sets for an app.",
    input: z
      .object({
        parent: appNameArg,
        pageSize: z.number().int().optional(),
        pageToken: z.string().optional(),
        filter: z.string().optional(),
      })
      .strict(),
    handler: async (args) => (await (await reporting()).anomalies.list(args)).data,
  }),

  // ---------- vitals.crashrate ----------
  defineTool({
    name: "reports_crash_rate_get",
    description: "Get crash-rate metric-set metadata (available dimensions, metrics, freshness).",
    input: z
      .object({
        name: z.string().describe("Format: apps/{packageName}/crashRateMetricSet"),
      })
      .strict(),
    handler: async (args) => (await (await reporting()).vitals.crashrate.get(args)).data,
  }),
  defineTool({
    name: "reports_crash_rate_query",
    description: "Query crash-rate timeline with dimensions, metrics, filter.",
    input: queryRequest.extend({
      name: z.string().describe("Format: apps/{packageName}/crashRateMetricSet"),
    }),
    handler: async ({ name, ...body }) =>
      (
        await (await reporting()).vitals.crashrate.query({
          name,
          requestBody: body,
        })
      ).data,
  }),

  // ---------- vitals.anrrate ----------
  defineTool({
    name: "reports_anr_rate_get",
    description: "Get ANR-rate metric-set metadata.",
    input: z.object({ name: z.string() }).strict(),
    handler: async (args) => (await (await reporting()).vitals.anrrate.get(args)).data,
  }),
  defineTool({
    name: "reports_anr_rate_query",
    description: "Query ANR-rate timeline.",
    input: queryRequest.extend({ name: z.string() }),
    handler: async ({ name, ...body }) =>
      (
        await (await reporting()).vitals.anrrate.query({
          name,
          requestBody: body,
        })
      ).data,
  }),

  // ---------- vitals.slowstartrate ----------
  defineTool({
    name: "reports_slow_start_rate_get",
    description: "Get slow-start-rate metadata.",
    input: z.object({ name: z.string() }).strict(),
    handler: async (args) => (await (await reporting()).vitals.slowstartrate.get(args)).data,
  }),
  defineTool({
    name: "reports_slow_start_rate_query",
    description: "Query slow-start-rate timeline.",
    input: queryRequest.extend({ name: z.string() }),
    handler: async ({ name, ...body }) =>
      (
        await (await reporting()).vitals.slowstartrate.query({
          name,
          requestBody: body,
        })
      ).data,
  }),

  // ---------- vitals.slowrenderingrate ----------
  defineTool({
    name: "reports_slow_rendering_rate_get",
    description: "Get slow-rendering-rate metadata.",
    input: z.object({ name: z.string() }).strict(),
    handler: async (args) =>
      (await (await reporting()).vitals.slowrenderingrate.get(args)).data,
  }),
  defineTool({
    name: "reports_slow_rendering_rate_query",
    description: "Query slow-rendering-rate timeline.",
    input: queryRequest.extend({ name: z.string() }),
    handler: async ({ name, ...body }) =>
      (
        await (await reporting()).vitals.slowrenderingrate.query({
          name,
          requestBody: body,
        })
      ).data,
  }),

  // ---------- vitals.excessivewakeuprate ----------
  defineTool({
    name: "reports_excessive_wakeup_rate_get",
    description: "Get excessive-wake-up-rate metadata.",
    input: z.object({ name: z.string() }).strict(),
    handler: async (args) =>
      (await (await reporting()).vitals.excessivewakeuprate.get(args)).data,
  }),
  defineTool({
    name: "reports_excessive_wakeup_rate_query",
    description: "Query excessive-wake-up-rate timeline.",
    input: queryRequest.extend({ name: z.string() }),
    handler: async ({ name, ...body }) =>
      (
        await (await reporting()).vitals.excessivewakeuprate.query({
          name,
          requestBody: body,
        })
      ).data,
  }),

  // ---------- vitals.stuckbackgroundwakelockrate ----------
  defineTool({
    name: "reports_stuck_background_wake_lock_rate_get",
    description: "Get stuck-background-wake-lock-rate metadata.",
    input: z.object({ name: z.string() }).strict(),
    handler: async (args) =>
      (await (await reporting()).vitals.stuckbackgroundwakelockrate.get(args)).data,
  }),
  defineTool({
    name: "reports_stuck_background_wake_lock_rate_query",
    description: "Query stuck-background-wake-lock-rate timeline.",
    input: queryRequest.extend({ name: z.string() }),
    handler: async ({ name, ...body }) =>
      (
        await (await reporting()).vitals.stuckbackgroundwakelockrate.query({
          name,
          requestBody: body,
        })
      ).data,
  }),

  // ---------- vitals.lmkrate ----------
  defineTool({
    name: "reports_lmk_rate_get",
    description: "Get Low-Memory-Killer (LMK) rate metadata.",
    input: z.object({ name: z.string() }).strict(),
    handler: async (args) => (await (await reporting()).vitals.lmkrate.get(args)).data,
  }),
  defineTool({
    name: "reports_lmk_rate_query",
    description: "Query LMK-rate timeline.",
    input: queryRequest.extend({ name: z.string() }),
    handler: async ({ name, ...body }) =>
      (
        await (await reporting()).vitals.lmkrate.query({
          name,
          requestBody: body,
        })
      ).data,
  }),

  // ---------- vitals.errors ----------
  defineTool({
    name: "reports_errors_counts_get",
    description: "Get error-counts metric-set metadata.",
    input: z.object({ name: z.string() }).strict(),
    handler: async (args) =>
      (await (await reporting()).vitals.errors.counts.get(args)).data,
  }),
  defineTool({
    name: "reports_errors_counts_query",
    description: "Query aggregated error-count timelines.",
    input: queryRequest.extend({ name: z.string() }),
    handler: async ({ name, ...body }) =>
      (
        await (await reporting()).vitals.errors.counts.query({
          name,
          requestBody: body,
        })
      ).data,
  }),
  defineTool({
    name: "reports_errors_issues_search",
    description: "Search grouped error issues (ErrorIssue).",
    input: z
      .object({
        parent: appNameArg,
        filter: z.string().optional(),
        interval: z.record(z.any()).optional(),
        pageSize: z.number().int().optional(),
        pageToken: z.string().optional(),
      })
      .strict(),
    handler: async (args) =>
      (await (await reporting()).vitals.errors.issues.search(args)).data,
  }),
  defineTool({
    name: "reports_errors_reports_search",
    description: "Search raw error reports (ErrorReport) within an issue or time window.",
    input: z
      .object({
        parent: appNameArg,
        filter: z.string().optional(),
        interval: z.record(z.any()).optional(),
        pageSize: z.number().int().optional(),
        pageToken: z.string().optional(),
      })
      .strict(),
    handler: async (args) =>
      (await (await reporting()).vitals.errors.reports.search(args)).data,
  }),
];
