// Page cache kept in memory instead of files under .next/cache.
// On the live server the file cache could not be updated after a save ("revalidate"), which made
// every admin save that refreshes pages fail. Memory needs no disk writes; pages are rebuilt on
// demand after a restart. At most MAX entries are kept (oldest dropped first).
const MAX = 600;
const cache = new Map();

module.exports = class MemoryCacheHandler {
  constructor(options) { this.options = options; }
  async get(key) {
    const v = cache.get(key);
    if (!v) return null;
    cache.delete(key); cache.set(key, v); // most recently used last
    return v;
  }
  async set(key, data, ctx) {
    cache.delete(key);
    cache.set(key, { value: data, lastModified: Date.now(), tags: (ctx && ctx.tags) || [] });
    while (cache.size > MAX) cache.delete(cache.keys().next().value);
  }
  async revalidateTag(tags) {
    const list = [].concat(tags || []);
    for (const [key, v] of cache) if ((v.tags || []).some((t) => list.includes(t))) cache.delete(key);
  }
  resetRequestCache() {}
};
