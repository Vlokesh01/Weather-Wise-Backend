import redis from '../redis/redisClient.js';

/**
 * cache middleware: keyFunc(req) -> string
 * ttlSeconds = number
 */
export const cacheMiddleware = (keyFunc, ttlSeconds = 60) => {
  return async (req, res, next) => {
    try {
      const key = keyFunc(req);
      const cached = await redis.get(key);
      if (cached) {
        // cached may be stringified JSON
        return res.json(JSON.parse(cached));
      }
      // attach cache meta for controller to store after fetching
      req._cacheKey = key;
      req._cacheTTL = ttlSeconds;
      next();
    } catch (err) {
      console.error('Cache middleware error', err);
      next();
    }
  };
};
