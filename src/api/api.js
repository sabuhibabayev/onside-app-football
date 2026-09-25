const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const apiFetch = async (endpoint, options = {}) => {
  let token = localStorage.getItem('token');
  
  // Bearer prefiksini təmizləyib standart hala gətiririk
  if (token && token.startsWith('Bearer ')) {
    token = token.replace('Bearer ', '');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // 🔴 401 Unauthorized olduqda avtomatik Session Logout
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/'; // Giriş ekranına yönləndir
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