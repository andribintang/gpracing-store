import axios from 'axios';

const BRAND = process.env.NEXT_PUBLIC_BRAND || 'gpracing';
const BASE  = process.env.NEXT_PUBLIC_API_URL || 'https://backend-gphrdpro.up.railway.app/api';

export const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('store_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    const session = localStorage.getItem('session_id');
    if (session) config.headers['x-session-id'] = session;
  }
  return config;
});

export const getConfig     = ()           => api.get(`/store/${BRAND}/config`);
export const getBanners    = ()           => api.get(`/store/${BRAND}/banners`);
export const getCategories = ()           => api.get(`/store/${BRAND}/categories`);
export const getFeatured   = ()           => api.get(`/store/${BRAND}/products/featured`);
export const getProducts   = (params: Record<string, unknown>) => api.get(`/store/${BRAND}/products`, { params });
export const getProduct    = (slug: string) => api.get(`/store/${BRAND}/products/${slug}`);

export const register      = (data: unknown) => api.post('/store/auth/register', data);
export const login         = (data: unknown) => api.post('/store/auth/login', data);
export const getProfile    = ()           => api.get('/store/customer/profile');
export const updateProfile = (data: unknown) => api.put('/store/customer/profile', data);
export const addAddress    = (data: unknown) => api.post('/store/customer/addresses', data);
export const updateAddress = (id: number, data: unknown) => api.put(`/store/customer/addresses/${id}`, data);
export const deleteAddress = (id: number) => api.delete(`/store/customer/addresses/${id}`);

export const getCart        = ()          => api.get('/store/cart');
export const addToCart      = (data: unknown) => api.post('/store/cart', data);
export const updateCartItem = (id: number, qty: number) => api.patch(`/store/cart/${id}`, { quantity: qty });
export const removeCartItem = (id: number) => api.delete(`/store/cart/${id}`);
export const clearCart      = ()          => api.delete('/store/cart');

export const getProvinces  = ()           => api.get('/store/ongkir/provinces');
export const getCities     = (province_id: number) => api.get('/store/ongkir/cities', { params: { province_id } });
export const getOngkir     = (data: unknown) => api.post('/store/ongkir/cost', data);

export const checkVoucher  = (data: unknown) => api.post('/store/voucher/check', data);
export const createOrder   = (data: unknown) => api.post('/store/orders', data);
export const getOrder      = (id: number)    => api.get(`/store/orders/${id}`);
export const getMyOrders   = (params?: unknown) => api.get('/store/customer/orders', { params });
