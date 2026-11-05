// Loads the admin's saved settings once when the server starts.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { applyRuntimeSync } = await import('./lib/server/settings');
    applyRuntimeSync();
  }
}
