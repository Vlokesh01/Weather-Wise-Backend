import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY;
const GEOCODING_KEY = process.env.GEOCODING_API_KEY || OPENWEATHER_KEY;

const OPENWEATHER_BASE_URL = process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5';
const GEOCODING_BASE_URL = process.env.GEOCODING_BASE_URL || 'http://api.openweathermap.org/geo/1.0';

if (!OPENWEATHER_KEY) {
  console.warn('OPENWEATHER_API_KEY not set — external API calls will fail');
}

export async function fetchCurrentByCoords(lat, lon, units = 'metric') {
  const url = `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${OPENWEATHER_KEY}`;
  const r = await axios.get(url);
  return r.data;
}

export async function fetchCurrentByCity(q, units = 'metric') {
  const url = `${OPENWEATHER_BASE_URL}/weather?q=${encodeURIComponent(q)}&units=${units}&appid=${OPENWEATHER_KEY}`;
  const r = await axios.get(url);
  return r.data;
}

export async function fetchOneCall(lat, lon, units = 'metric', exclude = '') {
  try {
    const url = `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${OPENWEATHER_KEY}`;
    const r = await axios.get(url);
    return r.data;
  } catch (err) {
    console.error('fetchOneCall failed:', err.response?.data || err.message);
    throw err;
  }
}

export async function geocodeQuery(q, limit = 5) {
  const url = `${GEOCODING_BASE_URL}/direct?q=${encodeURIComponent(q)}&limit=${limit}&appid=${GEOCODING_KEY}`;
  const r = await axios.get(url);
  return r.data;
}
