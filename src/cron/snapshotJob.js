import nodeCron from 'node-cron';
import User from '../models/user.js';
import WeatherSnapshot from '../models/weatherSnapshot.js';
import { fetchCurrentByCoords, fetchCurrentByCity } from '../utils/externalApi.js';
import redis from '../redis/redisClient.js';

export function initSnapshotJob(io) {
  // runs every minute to keep "recent" data for real-time feed; adjust schedule as needed
  nodeCron.schedule('* * * * *', async () => {
    try {
      // find unique places from user favorites
      const users = await User.find({ 'favorites.0': { $exists: true } }, 'favorites');
      const placeMap = new Map();
      users.forEach(u => {
        u.favorites.forEach(f => {
          if (!placeMap.has(f.placeId)) placeMap.set(f.placeId, f);
        });
      });

      if (placeMap.size === 0) return;

      const places = Array.from(placeMap.values());
      // For each place, fetch current weather (use lat/lon if present)
      await Promise.all(places.map(async (p) => {
        try {
          let data;
          if (p.lat && p.lon) {
            const cacheKey = `weather:current:${p.lat},${p.lon}:metric`;
            const cached = await redis.get(cacheKey);
            if (cached) {
              data = JSON.parse(cached);
            } else {
              data = await fetchCurrentByCoords(p.lat, p.lon, 'metric');
              await redis.set(cacheKey, JSON.stringify(data), 'EX', 60);
            }
          } else {
            const cacheKey = `weather:current:${p.name.toLowerCase()}:metric`;
            const cached = await redis.get(cacheKey);
            if (cached) {
              data = JSON.parse(cached);
            } else {
              data = await fetchCurrentByCity(p.name, 'metric');
              await redis.set(cacheKey, JSON.stringify(data), 'EX', 60);
            }
          }

          // snapshot to DB for historical trends
          const snap = {
            placeId: p.placeId,
            name: p.name || (data.name || `${p.lat},${p.lon}`),
            lat: data.coord?.lat || p.lat,
            lon: data.coord?.lon || p.lon,
            dt: new Date(),
            temp: data.main?.temp,
            humidity: data.main?.humidity,
            wind: data.wind?.speed,
            raw: data
          };
          await WeatherSnapshot.create(snap);

          // emit to socket room (room name "place:{placeId}")
          if (io) {
            io.to(`place:${p.placeId}`).emit('weatherUpdate', { placeId: p.placeId, data: snap });
          }
        } catch (err) {
          console.error('error snapshotting place', p, err?.message || err);
        }
      }));

    } catch (err) {
      console.error('snapshot job error', err);
    }
  });
}
