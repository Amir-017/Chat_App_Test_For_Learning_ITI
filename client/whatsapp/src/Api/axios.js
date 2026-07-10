// api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// interceptor - بيتنفذ تلقائي قبل أي request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export default api;