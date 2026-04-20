import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * On-disk representation of a single Play Console account. Points at a
 * service-account key JSON — does NOT contain the key material.
 */
export interface Account {
  name: string;
  keyFile: string;
  description?: string;
}

/**
 * Accounts are stored in a single JSON file outside the repo so the user
 * can swap between multiple Play Console developer accounts without ever
 * editing code. File path: ~/.google-play-developer-mcp/accounts.json
 */
export interface AccountsFile {
  currentAccount: string | null;
  accounts: Record<string, Account>;
}

const CONFIG_DIR = path.join(os.homedir(), ".google-play-developer-mcp");
const ACCOUNTS_FILE = path.join(CONFIG_DIR, "accounts.json");

function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

export function loadAccounts(): AccountsFile {
  if (!fs.existsSync(ACCOUNTS_FILE)) {
    return { currentAccount: null, accounts: {} };
  }
  const raw = fs.readFileSync(ACCOUNTS_FILE, "utf8");
  const parsed = JSON.parse(raw) as AccountsFile;
  return {
    currentAccount: parsed.currentAccount ?? null,
    accounts: parsed.accounts ?? {},
  };
}

export function saveAccounts(store: AccountsFile): void {
  ensureConfigDir();
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(store, null, 2), {
    mode: 0o600,
  });
}

export function getCurrentAccount(): Account | null {
  const store = loadAccounts();
  if (!store.currentAccount) return null;
  return store.accounts[store.currentAccount] ?? null;
}

export function requireCurrentAccount(): Account {
  const account = getCurrentAccount();
  if (!account) {
    throw new Error(
      "No active Google Play account. Run `accounts_add` to register a service-account key, then `accounts_switch` to select it.",
    );
  }
  if (!fs.existsSync(account.keyFile)) {
    throw new Error(
      `Service-account key file not found: ${account.keyFile}. Update the path with \`accounts_update\` or re-add the account.`,
    );
  }
  return account;
}

export function addAccount(account: Account): void {
  const store = loadAccounts();
  store.accounts[account.name] = account;
  if (!store.currentAccount) store.currentAccount = account.name;
  saveAccounts(store);
}

export function removeAccount(name: string): void {
  const store = loadAccounts();
  delete store.accounts[name];
  if (store.currentAccount === name) {
    const remaining = Object.keys(store.accounts);
    store.currentAccount = remaining[0] ?? null;
  }
  saveAccounts(store);
}

export function switchAccount(name: string): void {
  const store = loadAccounts();
  if (!store.accounts[name]) {
    throw new Error(
      `No account named '${name}'. Run \`accounts_list\` to see available accounts.`,
    );
  }
  store.currentAccount = name;
  saveAccounts(store);
}

export function updateAccount(
  name: string,
  patch: Partial<Omit<Account, "name">>,
): void {
  const store = loadAccounts();
  const existing = store.accounts[name];
  if (!existing) throw new Error(`No account named '${name}'.`);
  store.accounts[name] = { ...existing, ...patch };
  saveAccounts(store);
}
