import  User  from '../models/user.js';
import bcrypt from 'bcrypt';
import { signJwt } from '../middleware/auth.js';

/**
 * Basic signup + login (email/password). In production, add email verification and stronger checks.
 */

export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'user exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash: hash, name });
    const token = signJwt({ id: user._id, email: user.email });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name }});
  } catch (err) {
    console.error('signup error', err);
    res.status(500).json({ error: 'server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash || '');
    if (!ok) return res.status(400).json({ error: 'invalid credentials' });
    const token = signJwt({ id: user._id, email: user.email });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, favorites: user.favorites }});
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ error: 'server error' });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'user not found' });
    res.json(user.favorites || []);
  } catch (err) {
    console.error('getFavorites error', err);
    res.status(500).json({ error: 'server error' });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const { placeId, name, lat, lon } = req.body;
    if (!placeId) return res.status(400).json({ error: 'placeId required' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'user not found' });
    if (user.favorites.some(f => f.placeId === placeId)) return res.status(400).json({ error: 'already favorite' });
    user.favorites.push({ placeId, name, lat, lon });
    await user.save();
    res.json(user.favorites);
  } catch (err) {
    console.error('addFavorite error', err);
    res.status(500).json({ error: 'server error' });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const { placeId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'user not found' });
    user.favorites = user.favorites.filter(f => f.placeId !== placeId);
    await user.save();
    res.json(user.favorites);
  } catch (err) {
    console.error('removeFavorite error', err);
    res.status(500).json({ error: 'server error' });
  }
};
