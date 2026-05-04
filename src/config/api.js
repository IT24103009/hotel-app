// ─────────────────────────────────────────────────
//  src/config/api.js
//  Change BASE_URL to your deployed backend URL
// ─────────────────────────────────────────────────
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔴 CHANGE THIS to your deployed backend URL (Render / Railway / AWS)
// Example: 'https://hotel-api.onrender.com'
export const BASE_URL = 'https://20202257-dd04-40b8-aa4b-fe2d8c15fc1d-00-oci1sb6rtt5p.sisko.replit.dev';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.clear();
    }
    return Promise.reject(err);
  }
);

export default api;
