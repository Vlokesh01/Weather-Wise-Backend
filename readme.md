# Weather Backend (MERN-friendly)

## Setup
1. Copy `.env.example` to `.env` and fill values (MONGO_URI, OPENWEATHER_API_KEY, etc.)
2. Install deps:
   npm install
3. Run in dev:
   npm run dev
4. Start:
   npm start

## Endpoints
- GET /api/weather/current?q=city or ?lat=&lon=&units=
- GET /api/weather/forecast?lat=&lon=&units=
- GET /api/weather/search?q=...
- POST /api/user/signup { email, password, name }
- POST /api/user/login { email, password }
- GET /api/user/favorites (auth: Bearer token) 
- POST /api/user/favorite/add (auth) body: { placeId, name, lat, lon }
- DELETE /api/user/favorites/:placeId (auth)

## Sockets
Connect to server via socket.io and:
- `socket.emit('subscribe', { placeId })` to receive periodic `weatherUpdate` events

## Notes
- Caching: current weather cached 60s, forecast cached 600s.
- Cron snapshot: runs every minute and stores current weather snapshots for analytics.
