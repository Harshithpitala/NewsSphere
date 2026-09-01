class SimpleTtlCache {
  constructor(defaultTtlSeconds = 900) { // Default 15 minutes TTL
    this.cache = new Map();
    this.defaultTtl = defaultTtlSeconds * 1000;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  set(key, value, ttlSeconds) {
    const ttl = (ttlSeconds ? ttlSeconds * 1000 : this.defaultTtl);
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    this.cache.delete(key);
  }
}

export const memoryCache = new SimpleTtlCache(900);
