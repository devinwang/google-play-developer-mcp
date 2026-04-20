import { google, androidpublisher_v3, playdeveloperreporting_v1beta1 } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import { requireCurrentAccount } from "./account-store.js";

/**
 * Scopes required to exercise the full surface of both APIs.
 */
const SCOPES = [
  "https://www.googleapis.com/auth/androidpublisher",
  "https://www.googleapis.com/auth/playdeveloperreporting",
];

let cachedAuth: GoogleAuth | null = null;
let cachedAuthKeyFile: string | null = null;

function getAuth(): GoogleAuth {
  const account = requireCurrentAccount();
  if (cachedAuth && cachedAuthKeyFile === account.keyFile) {
    return cachedAuth;
  }
  cachedAuth = new GoogleAuth({
    keyFile: account.keyFile,
    scopes: SCOPES,
  });
  cachedAuthKeyFile = account.keyFile;
  return cachedAuth;
}

export function invalidateAuth(): void {
  cachedAuth = null;
  cachedAuthKeyFile = null;
}

export function publisher(): androidpublisher_v3.Androidpublisher {
  // Cast: googleapis and google-auth-library ship slightly divergent
  // generic parameters (JSONClient vs AuthClient). The runtime object
  // is correct — the type assertion keeps tsc happy.
  return google.androidpublisher({
    version: "v3",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    auth: getAuth() as any,
  });
}

export function reporting(): playdeveloperreporting_v1beta1.Playdeveloperreporting {
  return google.playdeveloperreporting({
    version: "v1beta1",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    auth: getAuth() as any,
  });
}

/**
 * Escape hatch for endpoints the bundled googleapis typings don't yet
 * know about. The underlying HTTP client still dispatches the call
 * correctly — we just bypass TypeScript's stale types for surfaces
 * added by Google after the last `googleapis` npm release.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function publisherAny(): any {
  return publisher();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function reportingAny(): any {
  return reporting();
}

/**
 * Probe auth by asking the library for an access token. Useful for the
 * `auth_status` tool — surfaces misconfigured key files and permission
 * issues before any API call attempts.
 */
export async function verifyAuth(): Promise<{
  email: string | null;
  tokenAcquired: boolean;
}> {
  const auth = getAuth();
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  const creds = (client as { email?: string }).email ?? null;
  return { email: creds, tokenAcquired: !!token?.token };
}
