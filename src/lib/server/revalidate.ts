import { revalidatePath as nextRevalidate } from 'next/cache';

/**
 * Refreshes cached pages after a save. On the live server Next's page cache can refuse the
 * refresh (for example when its cache folder is not writable after a deploy); that must never
 * make the save itself fail, so the error is logged and the save goes on. Pages still refresh
 * on their normal timer (about a minute).
 */
export function revalidatePath(path: string, type?: 'layout' | 'page') {
  try {
    nextRevalidate(path, type);
  } catch (e) {
    console.error('[revalidate] could not refresh', path, (e as Error)?.message);
  }
}
