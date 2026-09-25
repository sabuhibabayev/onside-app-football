import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/api';

const ProfileDetails = ({ currentUser, setCurrentUser, onBack }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    imageUrl: ''
  });

  useEffect(() => {
    const activeUser = currentUser || JSON.parse(localStorage.getItem('user') || '{}');
    if (activeUser) {
      setUser(activeUser);
      setFormData({
        firstName: activeUser.firstName || '',
        lastName: activeUser.lastName || '',
        phoneNumber: activeUser.phoneNumber || '',
        imageUrl: activeUser.imageUrl || ''
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const userId = user?.id;
      if (!userId) throw new Error('İstifadəçi ID-si tapılmadı!');

      const updatedUser = await apiFetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const newUserData = { ...user, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUserData));
      if (setCurrentUser) setCurrentUser(newUserData);
      setUser(newUserData);

      setMessage({ type: 'success', text: 'Məlumatlar uğurla yeniləndi!' });
      setIsEditing(false);
    } catch (err) {
      console.error('Yenilənmə xətası:', err);
      setMessage({ type: 'error', text: err.message || 'Xəta baş verdi!' });
    } finally {
      setLoading(false);
    }
  };

  const formattedUserId = user?.id ? `#${String(user.id).padStart(6, '0')}` : '#000000';

  return (
    <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* Geri qayıtmaq üçün Düymə */}
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', fontSize: '15px', fontWeight: 'bold',
          color: '#2e7d32', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px'
        }}
      >
        ← Geri (Menyuya)
      </button>

      <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
        
        {/* Başlıq və ID */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img
            src={user?.imageUrl || 'https://via.placeholder.com/90'}
            alt="Profil"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/90'; }}
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #2e7d32', marginBottom: '8px' }}
          />
          <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#111' }}>
            {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'İstifadəçi Adı'}
          </h3>
          <span style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
            İstifadəçi ID: {formattedUserId}
          </span>
        </div>

        {/* Bildiriş Mesajı */}
        {message.text && (
          <div style={{
            padding: '10px', borderRadius: '10px', fontSize: '13px', marginBottom: '14px',
            backgroundColor: message.type === 'success' ? '#e8f5e9' : '#ffebee',
            color: message.type === 'success' ? '#2e7d32' : '#c62828'
          }}>
            {message.text}
          </div>
        )}

        {!isEditing ? (
          /* MƏLUMATLARIN STANDART GÖRÜNÜŞÜ */
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                <span style={{ fontSize: '12px', color: '#888', display: 'block' }}>E-poçt ünvanı</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#222' }}>{user?.email || 'Təyin edilməyib'}</span>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                <span style={{ fontSize: '12px', color: '#888', display: 'block' }}>Telefon nömrəsi</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#222' }}>{user?.phoneNumber || 'Təyin edilməyib'}</span>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                <span style={{ fontSize: '12px', color: '#888', display: 'block' }}>Hesab Növü (Rol)</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#2e7d32' }}>{user?.role || 'Müştəri'}</span>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              style={{
                width: '100%', padding: '12px', backgroundColor: '#2e7d32', color: '#fff',
                border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              Məlumatları Dəyiş
            </button>
          </div>
        ) : (
          /* MƏLUMATLARIN REDAKTƏ FORMASI */
          <form onSubmit={handleUpdateProfile}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>Ad</label>
              <input
                type="text" name="firstName" value={formData.firstName} onChange={handleChange} required
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>Soyad</label>
              <input
                type="text" name="lastName" value={formData.lastName} onChange={handleChange} required
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>Telefon</label>
              <input
                type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>Profil Şəkli (URL)</label>
              <input
                type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button" onClick={() => setIsEditing(false)}
                style={{ flex: 1, padding: '10px', backgroundColor: '#eee', color: '#333', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
              >
                Ləğv et
              </button>
              <button
                type="submit" disabled={loading}
                style={{ flex: 1, padding: '10px', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {loading ? 'Yadda saxlanılır...' : 'Yadda Saxla'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default ProfileDetails;