import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const OPENWEATHER = process.env.OPENWEATHER_API_KEY;
const GEOCODING_KEY = process.env.GEOCODING_API_KEY || OPENWEATHER;

if (!OPENWEATHER) {
  console.warn('OPENWEATHER_API_KEY not set — external API calls will fail');
}

export async function fetchCurrentByCoords(lat, lon, units = 'metric') {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${OPENWEATHER}`;
  const r = await axios.get(url);
  return r.data;
}

export async function fetchCurrentByCity(q, units = 'metric') {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&units=${units}&appid=${OPENWEATHER}`;
  const r = await axios.get(url);
  return r.data;
}

export async function fetchOneCall(lat, lon, units = 'metric', exclude = '') {
  try {
    // Use 5-day forecast endpoint instead of One Call
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${OPENWEATHER}`;
    const r = await axios.get(url);
    return r.data;
  } catch (err) {
    console.error('fetchOneCall failed:', err.response?.data || err.message);
    throw err;
  }
}


export async function geocodeQuery(q, limit = 5) {
  // using OpenWeather geocoding endpoint
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=${limit}&appid=${GEOCODING_KEY}`;
  const r = await axios.get(url);
  return r.data;
}
