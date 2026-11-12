import { revalidatePath as nextRevalidate } from 'next/cache';

/**
 * Refreshes cached pages after a save.
 * On the live server, refreshing inside a save made the whole request fail (503), so saves,
 * deletes and stage changes did not go through. Admin and dashboard pages are always built fresh,
 * and public pages refresh on their own timer (about a minute), so on the live server this is
 * skipped unless ADGV_REVALIDATE=1 is set.
 */
export function revalidatePath(path: string, type?: 'layout' | 'page') {
  if (process.env.NODE_ENV === 'production' && process.env.ADGV_REVALIDATE !== '1') return;
  try {
    nextRevalidate(path, type);
  } catch (e) {
    console.error('[revalidate] could not refresh', path, (e as Error)?.message);
  }
}
