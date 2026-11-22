// Loads the admin's saved settings once when the server starts.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { applyRuntimeSync } = await import('./lib/server/settings');
    applyRuntimeSync();
    // Currency rates: refreshed shortly after start and every 6 hours, outside page rendering.
    const fx = () => { void import('./lib/server/fx').then((m) => m.refreshRates()).catch(() => {}); };
    setTimeout(fx, 20_000); setInterval(fx, 6 * 3600_000);
    // Emails that could not be sent (mail server busy, website restarting) are sent again every minute.
    setInterval(() => { void import('./lib/server/mail').then((m) => m.retryMail()).catch(() => {}); }, 60_000);
    // After each deploy, translate new or changed pages into all website languages in the background.
    // Texts shown without a translation are collected by u() and translated every 3 minutes.
    setInterval(() => { void import('./lib/server/translate').then((m) => m.flushMissingUi()).catch(() => {}); }, 180_000);
    setTimeout(() => { void import('./lib/server/translate').then((m) => m.autoCatchUp()).catch(() => {}); }, 60_000);
    // Auto Publisher: one step every minute (research, write, check, pictures, publish; a step that is
    // still running holds a lock). Published articles are translated by the languages engine.
    if (process.env.DISABLE_AUTOPUBLISHER !== '1' && !process.env.CI) setInterval(() => { void import('./lib/server/ap/pipeline').then((m) => m.tick()).catch(() => {}); }, 60_000);
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
