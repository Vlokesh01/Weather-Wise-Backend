import mongoose from 'mongoose';

const SnapshotSchema = new mongoose.Schema({
  placeId: String,
  name: String,
  lat: Number,
  lon: Number,
  dt: { type: Date, default: Date.now },
  temp: Number,
  humidity: Number,
  wind: Number,
  raw: mongoose.Schema.Types.Mixed // store raw API response if needed
});

SnapshotSchema.index({ placeId: 1, dt: 1 });

export default mongoose.model('WeatherSnapshot', SnapshotSchema);
