import { publisher } from "../auth/client-factory.js";

/**
 * Helper for callers that want "open edit → do stuff → commit" in one
 * call without managing the edit id manually. Most edits-family tools
 * expose the explicit id variant too, so a user can run a long
 * multi-step edit if they need to.
 */
export async function withEdit<T>(
  packageName: string,
  fn: (editId: string) => Promise<T>,
  options: { commit?: boolean; changesNotSentForReview?: boolean } = {},
): Promise<T> {
  const { commit = true, changesNotSentForReview = false } = options;
  const api = await publisher();
  const inserted = await api.edits.insert({ packageName, requestBody: {} });
  const editId = inserted.data.id;
  if (!editId) {
    throw new Error("Failed to open an edit session — no id returned.");
  }
  try {
    const result = await fn(editId);
    if (commit) {
      await api.edits.commit({ packageName, editId, changesNotSentForReview });
    }
    return result;
  } catch (err) {
    try {
      await api.edits.delete({ packageName, editId });
    } catch {
      /* best-effort rollback */
    }
    throw err;
  }
}
