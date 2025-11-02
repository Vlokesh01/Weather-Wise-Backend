import express from 'express';
import { signup, login, getFavorites, addFavorite, removeFavorite } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

// favorites
router.get('/favorites', authMiddleware, getFavorites);
router.post('/favorites/add', authMiddleware, addFavorite);
router.delete('/favorites/:placeId', authMiddleware, removeFavorite);

export default () => router;
