import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

let redis;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
} else {
  // Fallback to a no-op object that mimics essential methods using in-memory map
  console.warn('REDIS_URL not set — using in-memory cache (not recommended for production)');
  const map = new Map();
  redis = {
    async get(k) { 
      const entry = map.get(k);
      if (!entry) return null;
      if (entry.expireAt && Date.now() > entry.expireAt) { map.delete(k); return null; }
      return entry.value;
    },
    async set(k, v, ex, ttl) {
      const ttlSeconds = (ex === 'EX' && ttl) ? ttl : ttl;
      const expireAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
      map.set(k, { value: v, expireAt });
    },
    async del(k) { map.delete(k); },
    on() {},
  };
}

export default redis;
