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
