// Loads the admin's saved settings once when the server starts.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { applyRuntimeSync } = await import('./lib/server/settings');
    applyRuntimeSync();
    // After each deploy, translate new or changed pages into all website languages in the background.
    // Texts shown without a translation are collected by u() and translated every 3 minutes.
    setInterval(() => { void import('./lib/server/translate').then((m) => m.flushMissingUi()).catch(() => {}); }, 180_000);
    setTimeout(() => { void import('./lib/server/translate').then((m) => m.autoCatchUp()).catch(() => {}); }, 60_000);
  }
}

/** Keeps the last server errors (message and first lines of the stack) so the owner self test can show them. */
export async function onRequestError(err: unknown, request: { path: string; method: string }, context: { routerKind: string; routePath: string; routeType: string }) {
  try {
    const e = err as Error & { digest?: string };
    const g = globalThis as unknown as { __ADGV_ERR?: unknown[] };
    g.__ADGV_ERR = [{ at: new Date().toISOString(), path: request.path, method: request.method, route: context.routePath, type: context.routeType, digest: e?.digest, msg: String(e?.message ?? e).slice(0, 500), stack: String(e?.stack ?? '').split('\n').slice(0, 8).join('\n') }, ...(g.__ADGV_ERR ?? [])].slice(0, 15);
  } catch {}
}
