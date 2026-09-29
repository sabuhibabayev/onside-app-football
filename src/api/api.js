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

  const isFormData = options.body instanceof FormData;
  
  // Headers hazırlanması
  const headers = { ...options.headers };

  // ⚠️ FormData olduqda Content-Type header-i verilmir (Browser/Http native özü boundary təyin etməlidir)
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token && token !== 'null' && token !== 'undefined') {
    const cleanToken = token.startsWith('Bearer ') ? token.replace('Bearer ', '') : token;
    headers['Authorization'] = `Bearer ${cleanToken}`;
  }

  const url = `${BASE_URL}${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();

  // Body hazırlanması (FormData olduqda olduğu kimi saxlanılır)
  let requestData = options.body;
  if (!isFormData && options.body && typeof options.body === 'string') {
    try {
      requestData = JSON.parse(options.body);
    } catch {
      requestData = options.body;
    }
  }

  try {
    // 🟢 Əgər tətbiq Mobil Cihazda (Android) işləyirsə
    if (Capacitor.isNativePlatform()) {
      const response = await CapacitorHttp.request({
        url,
        method,
        headers,
        data: requestData,
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
    
    // 🔵 Brauzerdə olduqda
    else {
      const fetchOptions = {
        ...options,
        method,
        headers,
      };

      // FormData olduqda body-ni toxunmadan ötürürük, əks halda JSON kimi
      if (isFormData) {
        fetchOptions.body = options.body;
      } else if (options.body && typeof options.body !== 'string') {
        fetchOptions.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, fetchOptions);

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

// ⭐ Goal Video Services
export const fetchGoalsList = (userId) => {
  const endpoint = userId ? `/api/goals?userId=${userId}` : '/api/goals';
  return apiFetch(endpoint);
};

export const voteGoalVideo = (goalId, userId) => 
  apiFetch(`/api/goals/${goalId}/vote?userId=${userId}`, { method: 'POST' });

// 📤 Video Yükləmə Servisi (FormData Dəstəkli)
export const uploadGoalVideo = (formData) => 
  apiFetch('/api/goals', { method: 'POST', body: formData });

// Other Services
export const rateUserProfile = (userId, stars) => 
  apiFetch(`/api/users/${userId}/rate?stars=${stars}`, { method: 'POST' });