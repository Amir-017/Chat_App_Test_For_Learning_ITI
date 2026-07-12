// api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// interceptor - بيتنفذ تلقائي قبل أي request
api.interceptors.request.use(async (config) => {
  const token = await window.Clerk?.session?.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
