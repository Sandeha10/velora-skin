import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchProducts = async (params = {}) => {
  const response = await apiClient.get('/products', { params });
  return response.data;
};

export const fetchProductBySlug = async (slug) => {
  const response = await apiClient.get(`/products/${slug}`);
  return response.data;
};