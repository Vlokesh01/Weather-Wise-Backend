import redis from '../redis/redisClient.js';
import { fetchCurrentByCoords, fetchCurrentByCity, fetchOneCall, geocodeQuery } from '../utils/externalApi.js';

const makeKey = (...parts) => parts.join(':');

export const getCurrent = async (req, res) => {
  try {
    const { q, lat, lon, units = 'metric' } = req.query;
    let cacheKey;
    let data;
    if (lat && lon) {
      cacheKey = makeKey('weather', 'current', `${lat},${lon}`, units);
      const cached = await redis.get(cacheKey);
      if (cached) return res.json(JSON.parse(cached));
      data = await fetchCurrentByCoords(lat, lon, units);
    } else if (q) {
      cacheKey = makeKey('weather', 'current', q.toLowerCase(), units);
      const cached = await redis.get(cacheKey);
      if (cached) return res.json(JSON.parse(cached));
      data = await fetchCurrentByCity(q, units);
    } else {
      return res.status(400).json({ error: 'provide q or lat & lon' });
    }

    // store cache with TTL 60s
    await redis.set(cacheKey, JSON.stringify(data), 'EX', 60);
    res.json(data);
  } catch (err) {
    console.error('getCurrent error', err?.response?.data || err.message);
    res.status(500).json({ error: 'failed to fetch current weather' });
  }
};

export const getForecast = async (req, res) => {
  try {
    const { lat, lon, units = 'metric', exclude = '' } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'provide lat & lon' });
    const cacheKey = makeKey('weather', 'forecast', `${lat},${lon}`, units);
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));
    const data = await fetchOneCall(lat, lon, units, exclude);
    // forecast TTL 600s
    await redis.set(cacheKey, JSON.stringify(data), 'EX', 600);
    res.json(data);
  } catch (err) {
    console.error('getForecast error', err?.response?.data || err.message);
    res.status(500).json({ error: 'failed to fetch forecast' });
  }
};

export const searchGeo = async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: 'q required' });
    const key = makeKey('geo', q.toLowerCase());
    const cached = await redis.get(key);
    if (cached) return res.json(JSON.parse(cached));
    const data = await geocodeQuery(q, 10);
    await redis.set(key, JSON.stringify(data), 'EX', 3600);
    res.json(data);
  } catch (err) {
    console.error('searchGeo error', err?.response?.data || err.message);
    res.status(500).json({ error: 'failed to geocode' });
  }
};
