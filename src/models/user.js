import mongoose from 'mongoose';

const FavoriteSchema = new mongoose.Schema({
  placeId: String, // cityId or "lat,lon"
  name: String,
  lat: Number,
  lon: Number,
  createdAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  email: { type: String, index: true, sparse: true },
  passwordHash: String, // for basic auth flow (bcrypt expected in real app)
  googleId: { type: String, index: true, sparse: true },
  name: String,
  favorites: [FavoriteSchema],
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
