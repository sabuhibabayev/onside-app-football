import { CapacitorHttp, Capacitor } from '@capacitor/core';

// Canlı Render Backend URL-i
const BASE_URL = 'https://onside-app-backend.onrender.com';

export const apiFetch = async (endpoint, options = {}) => {
  // LocalStorage-dən təhlükəsiz token oxunması
  let token = null;
  try {
    token = localStorage.getItem('token');
  } catch (e) {
    console.warn('LocalStorage access error:', e);
  }
  
  // Headers hazırlanması
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token && token !== 'null' && token !== 'undefined') {
    const cleanToken = token.startsWith('Bearer ') ? token.replace('Bearer ', '') : token;
    headers['Authorization'] = `Bearer ${cleanToken}`;
  }

  const url = `${BASE_URL}${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();

  try {
    // 🟢 Əgər tətbiq Mobil Cihazda (Android) işləyirsə, DOĞMA NATIVE HTTP çağırırıq (CORS və 10.0.2.2 xətalarını yan keçir)
    if (Capacitor.isNativePlatform()) {
      const response = await CapacitorHttp.request({
        url,
        method,
        headers,
        data: options.body ? JSON.parse(options.body) : undefined,
      });

      if (response.status === 401) {
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
        } catch (e) {}
        window.location.href = '/';
        throw new Error('Sessiyanın vaxtı bitdi. Yenidən daxil olun.');
      }

      if (response.status < 200 || response.status >= 300) {
        const errorMsg = response.data?.message || response.data?.error || `Xəta baş verdi: ${response.status}`;
        throw new Error(errorMsg);
      }

      return response.data;
    } 
    
    // 🔵 Brauzerdə olduqda standart fetch istifadə edirik
    else {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
        } catch (e) {}
        window.location.href = '/';
        throw new Error('Sessiyanın vaxtı bitdi. Yenidən daxil olun.');
      }

      if (!response.ok) {
        let errorMessage = `Xəta baş verdi: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      const text = await response.text();
      return text ? JSON.parse(text) : {};
    }
  } catch (error) {
    console.error(`[API Error] -> ${endpoint}:`, error.message);
    throw error;
  }
};

/* ==========================================================================
   MƏRKƏZLƏŞDİRİLMİŞ API SERVİSLƏRİ (Clean Code Services)
   ========================================================================== */

// Auth Services
export const loginUser = (credentials) => 
  apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) });

export const registerUser = (userData) => 
  apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(userData) });

export const fetchCurrentUser = () => 
  apiFetch('/api/users/me');

// Field Services
export const getFields = () => 
  apiFetch('/api/fields?size=100&pageSize=100');

export const getOwnerFields = (ownerId) => 
  apiFetch(`/api/fields/owner/${ownerId}`);

export const createField = (fieldData) => 
  apiFetch('/api/fields', { method: 'POST', body: JSON.stringify(fieldData) });

// Reservation Services
export const createReservation = (reservationData) => 
  apiFetch('/api/reservations', { method: 'POST', body: JSON.stringify(reservationData) });

export const getPendingReservations = (fieldId) => 
  apiFetch(`/api/reservations/field/${fieldId}/pending`);

export const getActiveReservations = (fieldId) => 
  apiFetch(`/api/reservations/field/${fieldId}/active`);

export const approveReservation = (reservationId) => 
  apiFetch(`/api/reservations/${reservationId}/approve`, { method: 'PUT' });

export const getLookingForPlayers = () => 
  apiFetch('/api/reservations/looking-for-players');

export const getUserReservationsHistory = () => 
  apiFetch('/api/reservations/my-reservations');

// Goal Video Services
export const fetchGoalsList = () => 
  apiFetch('/api/goals');

export const getTopGoalVideos = () => 
  apiFetch('/api/goal-videos/top10');

export const voteGoalVideo = (videoId, userId) => 
  apiFetch(`/api/goal-videos/${videoId}/vote?userId=${userId}`, { method: 'POST' });

// Other Services
export const rateUserProfile = (userId, stars) => 
  apiFetch(`/api/users/${userId}/rate?stars=${stars}`, { method: 'POST' });