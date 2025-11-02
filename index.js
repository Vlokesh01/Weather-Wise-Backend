import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import connectDB from './src/config/db.js';
import weatherRoutes from './src/routes/weatherRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import authRoutes from './src/routes/authRoute.js';
import { initSnapshotJob } from './src/cron/snapshotJob.js';
import redis from './src/redis/redisClient.js';
import passport from './src/config/passport.js';
import session from "express-session";



dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: process.env.FRONTEND_ORIGIN || '*' }
});

// Basic middleware
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));

// Rate limiter (global)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // adjust as needed
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Connect DB & Redis
connectDB().catch(err => {
  console.error('MongoDB connection error', err);
  process.exit(1);
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (e) => console.log('Redis error', e));

// mount routes
app.use('/api/weather', weatherRoutes(io));
app.use('/api/user', userRoutes());
app.use('/api/auth', authRoutes);

// Google OAuth routes
app.use(
  session({
    secret: "secret123",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// start cron job for snapshots and start server
initSnapshotJob(io); // starts cron that collects snapshots periodically

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
