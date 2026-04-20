import { google, androidpublisher_v3, playdeveloperreporting_v1beta1 } from "googleapis";
import { requireCurrentAccount } from "./account-store.js";

/**
 * Scopes required to exercise the full surface of both APIs.
 */
const SCOPES = [
  "https://www.googleapis.com/auth/androidpublisher",
  "https://www.googleapis.com/auth/playdeveloperreporting",
];

// googleapis internally does `instanceof` checks against its own bundled
// copy of google-auth-library. Importing GoogleAuth directly from a
// separately-installed google-auth-library can land you on a different
// version and silently makes googleapis drop the auth object — producing
// 401 CREDENTIALS_MISSING even though the library issues a real token.
// Using `google.auth.GoogleAuth` from the googleapis package guarantees
// the constructor matches what googleapis looks for.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAuthClient = any;

interface AuthCache {
  keyFile: string;
  authClient: AnyAuthClient;
  publisher: androidpublisher_v3.Androidpublisher;
  reporting: playdeveloperreporting_v1beta1.Playdeveloperreporting;
}

let cache: AuthCache | null = null;

async function ensureCache(): Promise<AuthCache> {
  const account = requireCurrentAccount();
  if (cache && cache.keyFile === account.keyFile) return cache;

  const googleAuth = new google.auth.GoogleAuth({
    keyFile: account.keyFile,
    scopes: SCOPES,
  });
  const authClient: AnyAuthClient = await googleAuth.getClient();

  cache = {
    keyFile: account.keyFile,
    authClient,
    publisher: google.androidpublisher({ version: "v3", auth: authClient }),
    reporting: google.playdeveloperreporting({ version: "v1beta1", auth: authClient }),
  };
  return cache;
}

export function invalidateAuth(): void {
  cache = null;
}

export async function publisher(): Promise<androidpublisher_v3.Androidpublisher> {
  return (await ensureCache()).publisher;
}

export async function reporting(): Promise<playdeveloperreporting_v1beta1.Playdeveloperreporting> {
  return (await ensureCache()).reporting;
}

/**
 * Escape hatch for endpoints whose typings haven't caught up. The
 * underlying HTTP dispatch is identical — we just bypass TypeScript
 * on surfaces Google shipped after the last googleapis release.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function publisherAny(): Promise<any> {
  return (await ensureCache()).publisher;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function reportingAny(): Promise<any> {
  return (await ensureCache()).reporting;
}

export async function verifyAuth(): Promise<{
  email: string | null;
  tokenAcquired: boolean;
}> {
  const { authClient } = await ensureCache();
  const token = await authClient.getAccessToken();
  const email: string | null =
    authClient.email ?? authClient.credentials?.client_email ?? null;
  return { email, tokenAcquired: !!token?.token };
}
