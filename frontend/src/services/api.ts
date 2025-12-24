// frontend/src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Interceptor para injetar Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para refrescar token expirado (lógica simplificada)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Idealmente, você teria um endpoint /refresh que retorna um novo token
      // e um refresh token. Aqui, estamos apenas deslogando o usuário.
      console.error("Sessão expirada. Faça login novamente.");
      localStorage.removeItem('auth_token');
      // Redireciona para a página de login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
