import express from 'express';
import { cacheMiddleware } from '../middleware/cache.js';
import { getCurrent, getForecast, searchGeo } from '../controllers/wheatherController.js';

export default function weatherRoutes(io) {
  const router = express.Router();

  // Cache middleware examples (we still also cache inside controller)
  const keyForCurrent = (req) => {
    const { q, lat, lon, units = 'metric' } = req.query;
    return `weather:current:${q ? q.toLowerCase() : `${lat},${lon}`}:${units}`;
  };

  router.get('/current', cacheMiddleware(keyForCurrent, 60), getCurrent);
  router.get('/forecast', getForecast);
  router.get('/search', searchGeo);

  // Socket subscription endpoint (clients connect via socket.io)
  // Clients should still subscribe via socket.io events (see server.js connecting io)
  router.get('/info', (req, res) => res.json({ info: 'weather routes active' }));

  return router;
}
