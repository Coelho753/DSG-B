import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

const getStoredAccessToken = () => (
  localStorage.getItem('accessToken')
  || localStorage.getItem('token')
  || localStorage.getItem('authToken')
  || sessionStorage.getItem('accessToken')
  || sessionStorage.getItem('token')
  || sessionStorage.getItem('authToken')
);

const getStoredRefreshToken = () => (
  localStorage.getItem('refreshToken')
  || sessionStorage.getItem('refreshToken')
);

const persistAccessToken = (token) => {
  if (!token) return;
  localStorage.setItem('accessToken', token);
  localStorage.setItem('token', token);
  localStorage.setItem('authToken', token);
};

api.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !originalRequest?._retry) {
      const refreshToken = getStoredRefreshToken();
      if (!refreshToken) return Promise.reject(error);

      originalRequest._retry = true;
      try {
        const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, { refreshToken });
        const newAccessToken = data?.accessToken;
        persistAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
