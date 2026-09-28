// Cihazın harada işlədiyindən asılı olmayaraq canlı Render backend-indən istifadə edirik
const getBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  return 'https://onside-app-backend.onrender.com';
};

export const apiFetch = async (endpoint, options = {}) => {
  const BASE_URL = getBaseUrl();
  
  // LocalStorage-dən təhlükəsiz token oxunması
  let token = null;
  try {
    token = localStorage.getItem('token');
  } catch (e) {
    console.warn('LocalStorage access error:', e);
  }
  
  // Headers obyektinin hazırlanması
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Yalnız token həqiqətən VARSA və validdirsə Header-ə əlavə olunur
  if (token && token !== 'null' && token !== 'undefined') {
    const cleanToken = token.startsWith('Bearer ') ? token.replace('Bearer ', '') : token;
    headers['Authorization'] = `Bearer ${cleanToken}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // 🔴 401 Unauthorized olduqda avtomatik Session Logout
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

    // Boş cavab gəldikdə (204 No Content və ya 200 OK void)
    const text = await response.text();
    return text ? JSON.parse(text) : {};
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

// Other Services
export const fetchGoalsList = () => 
  apiFetch('/api/goals');

export const rateUserProfile = (userId, stars) => 
  apiFetch(`/api/users/${userId}/rate?stars=${stars}`, { method: 'POST' });