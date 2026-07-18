import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  console.warn('VITE_API_BASE_URL 환경변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
}

const client = axios.create({
  baseURL: BASE_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      return Promise.reject(new Error('권한이 없습니다'));
    }
    return Promise.reject(error);
  },
);

export default client;
