/**
 * Translate Google API errors into readable MCP tool responses. The
 * googleapis client throws GaxiosError with a .response.data payload
 * whose shape is documented at:
 * https://cloud.google.com/apis/design/errors
 */
export function formatError(err: unknown): string {
  if (!err) return "Unknown error";
  const e = err as {
    message?: string;
    code?: string | number;
    status?: number;
    response?: {
      status?: number;
      statusText?: string;
      data?: {
        error?: {
          code?: number;
          message?: string;
          status?: string;
          details?: unknown;
        };
      };
    };
  };
  const apiErr = e.response?.data?.error;
  const parts: string[] = [];
  if (apiErr?.code) parts.push(`HTTP ${apiErr.code}`);
  else if (e.response?.status) parts.push(`HTTP ${e.response.status}`);
  if (apiErr?.status) parts.push(apiErr.status);
  if (apiErr?.message) parts.push(apiErr.message);
  else if (e.message) parts.push(e.message);
  if (apiErr?.details) {
    parts.push("details: " + JSON.stringify(apiErr.details));
  }
  const msg = parts.join(" — ") || "Unknown Google API error";

  // Common hints.
  if (apiErr?.code === 401 || apiErr?.status === "UNAUTHENTICATED") {
    return `${msg}\n\nHint: the service account key is wrong or the token expired. Check \`auth_status\`.`;
  }
  if (apiErr?.code === 403 || apiErr?.status === "PERMISSION_DENIED") {
    return `${msg}\n\nHint: the service account is authenticated but not authorized. Verify the service-account email is invited to Play Console → Users and permissions, and that the permission change has propagated (can take up to 24h).`;
  }
  if (apiErr?.code === 404 || apiErr?.status === "NOT_FOUND") {
    return `${msg}\n\nHint: resource not found. If this is an edit operation, the edit id may have expired or been committed.`;
  }
  if (apiErr?.code === 409 || apiErr?.status === "ABORTED") {
    return `${msg}\n\nHint: a concurrent modification raced you. Retry after re-fetching current state.`;
  }
  if (apiErr?.code === 429 || apiErr?.status === "RESOURCE_EXHAUSTED") {
    return `${msg}\n\nHint: quota exceeded. The Android Publisher API is limited to 200k req/day across all resources.`;
  }
  return msg;
}
