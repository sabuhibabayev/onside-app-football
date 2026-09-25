import React, { useState, useEffect } from 'react';
import { rateUserProfile, apiFetch } from '../api/api';
import PaymentModal from './PaymentModal';

// ----------------------------------------------------
// 🔔 BİLDİRİŞLƏR ALO-KOMPONENTİ
// ----------------------------------------------------
const NotificationsContent = ({ userData, darkMode }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentRole = userData?.role || localStorage.getItem('role') || 'USER';
  const isOwnerOrAdmin = ['OWNER', 'ROLE_OWNER', 'ADMIN', 'ROLE_ADMIN'].includes(currentRole);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = isOwnerOrAdmin 
        ? `/api/reservations/pending` 
        : `/api/reservations/my-reservations`;

      const data = await apiFetch(endpoint);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Bildiriş xətası:', err);
      setError('Bildirişləri yükləmək mümkün olmadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reservationId) => {
    try {
      await apiFetch(`/api/reservations/${reservationId}/approve`, { method: 'PUT' });
      alert('Rezervasiya təsdiqləndi!');
      fetchNotifications();
    } catch (err) {
      alert('Təsdiqləmə zamanı xəta baş verdi!');
    }
  };

  const handleCancel = async (reservationId) => {
    if (!window.confirm('Rezervasiyanı ləğv etmək istədiyinizdən əminsiniz?')) return;
    try {
      await apiFetch(`/api/reservations/${reservationId}`, { method: 'DELETE' });
      alert('Rezervasiya ləğv edildi!');
      fetchNotifications();
    } catch (err) {
      alert('Ləğv etmə zamanı xəta baş verdi!');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', margin: 0 }}>🔔 Bildirişlər</h2>
        <button 
          onClick={fetchNotifications}
          style={{ background: 'none', border: 'none', color: '#81c784', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Yenilə 🔄
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#888' }}>Yüklənir...</div>
      ) : error ? (
        <div style={{ padding: '12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '12px', fontSize: '13px' }}>{error}</div>
      ) : notifications.length === 0 ? (
        <div style={{
          backgroundColor: darkMode ? '#1e1e1e' : '#fff',
          padding: '24px', borderRadius: '16px', textAlign: 'center', color: darkMode ? '#aaa' : '#666'
        }}>
          Hal-hazırda heç bir bildirişiniz yoxdur.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((item) => (
            <div 
              key={item.id}
              style={{
                backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
                borderRadius: '16px',
                padding: '16px',
                borderLeft: `5px solid ${item.status === 'APPROVED' ? '#4caf50' : item.status === 'PENDING' ? '#ff9800' : '#f44336'}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {item.fieldName || 'Meydança Rezervasiyası'}
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  backgroundColor: item.status === 'APPROVED' ? '#e8f5e9' : item.status === 'PENDING' ? '#fff3e0' : '#ffebee',
                  color: item.status === 'APPROVED' ? '#2e7d32' : item.status === 'PENDING' ? '#e65100' : '#c62828'
                }}>
                  {item.status === 'APPROVED' ? 'Təsdiqləndi' : item.status === 'PENDING' ? 'Gözləmədə' : 'Ləğv edildi'}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: darkMode ? '#bbb' : '#555', marginBottom: '10px' }}>
                📅 Tarix: <b>{item.date || item.reservationDate}</b> | ⏰ Saat: <b>{item.startTime} - {item.endTime}</b>
                {item.userName && <div>👤 Müraciət edən: <b>{item.userName}</b></div>}
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                {isOwnerOrAdmin && item.status === 'PENDING' && (
                  <button
                    onClick={() => handleApprove(item.id)}
                    style={{ backgroundColor: '#2e7d32', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                  >
                    ✓ Təsdiqlə
                  </button>
                )}
                {item.status === 'PENDING' && (
                  <button
                    onClick={() => handleCancel(item.id)}
                    style={{ backgroundColor: '#e53935', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                  >
                    ✕ Ləğv et
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// ----------------------------------------------------
// 👤 ƏSAS PROFİL KOMPONENİ
// ----------------------------------------------------
const Profile = ({ 
  userData, 
  setUserData, 
  fieldsCount, 
  reservationsCount, 
  setActiveNav, 
  handleLogout, 
  showAddFieldModal, 
  setShowAddFieldModal, 
  darkMode, 
  setDarkMode, 
  hoveredIndex, 
  setHoveredIndex 
}) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedStars, setSelectedStars] = useState(5);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // 🔑 AKTİV REJİM (null / 'info' / 'notifications')
  const [activeSubView, setActiveSubView] = useState(null);

  // Profil Məlumatları Redaktə State-ləri
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    firstName: userData?.firstName || userData?.fullName?.split(' ')[0] || '',
    lastName: userData?.lastName || userData?.fullName?.split(' ')[1] || '',
    phoneNumber: userData?.phoneNumber || userData?.phone || '',
    avatarUrl: userData?.avatarUrl || ''
  });

  const currentRole = userData?.role || localStorage.getItem('role') || 'USER';
  const isOwnerOrAdmin = ['OWNER', 'ROLE_OWNER', 'ADMIN', 'ROLE_ADMIN'].includes(currentRole);

  const handleVote = async () => {
    if (!userData?.id) {
      alert("İstifadəçi id-si tapılmadı!");
      return;
    }
    setLoading(true);
    try {
      const updatedUser = await rateUserProfile(userData.id, selectedStars);
      alert(`Səsiniz qeydə alındı! Yeni reytinq: ${updatedUser.rating}`);
      if (setUserData) setUserData(updatedUser);
      setShowRatingModal(false);
    } catch (err) {
      alert('Səs verərkən xəta baş verdi!');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditMsg({ type: '', text: '' });

    try {
      const userId = userData?.id;
      if (!userId) throw new Error('İstifadəçi ID-si tapılmadı!');

      const updatedUser = await apiFetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const newUserData = { ...userData, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUserData));
      if (setUserData) setUserData(newUserData);

      setEditMsg({ type: 'success', text: 'Məlumatlar uğurla yeniləndi!' });
      setIsEditing(false);
    } catch (err) {
      setEditMsg({ type: 'error', text: err.message || 'Xəta baş verdi!' });
    } finally {
      setEditLoading(false);
    }
  };

  const formattedUserId = userData?.id ? `#${String(userData.id).padStart(6, '0')}` : '#000000';

  const rawProfileItems = [
    { 
      id: 'add', 
      icon: '🏟️', 
      label: 'Stadion əlavə et', 
      isSpecial: true, 
      ownerOnly: true, 
      action: () => setShowAddFieldModal(true) 
    },
    { 
      id: 'dark', 
      icon: '🌙', 
      label: 'Qaranlıq rejim', 
      isToggle: true 
    },
    { 
      id: 'admin', 
      icon: '🛠️', 
      label: 'Admin panel', 
      ownerOnly: true, 
      action: () => setActiveNav('admin') 
    },
    { 
      id: 'history', 
      icon: '📜', 
      label: 'Keçmiş rezervasiyalarım', 
      action: () => setActiveNav('history') 
    },
    { 
      id: 'info', 
      icon: '👤', 
      label: 'Profil məlumatları',
      action: () => setActiveSubView('info')
    },
    { 
      id: 'notifications', 
      icon: '🔔', 
      label: 'Bildirişlər',
      action: () => setActiveSubView('notifications')
    },
    { 
      id: 'logout', 
      icon: '🚪', 
      label: 'Çıxış', 
      isLogout: true, 
      action: handleLogout 
    }
  ];

  const profileItems = rawProfileItems.filter(item => {
    if (item.ownerOnly && !isOwnerOrAdmin) return false;
    return true;
  });

  // ----------------------------------------------------
  // 🟢 ALT SƏHİFƏLƏR (Geri düyməsi ilə)
  // ----------------------------------------------------
  if (activeSubView !== null) {
    return (
      <div style={{ 
        backgroundColor: darkMode ? '#121212' : '#f6f6f2', 
        color: darkMode ? '#ffffff' : '#000000',
        minHeight: '100vh', 
        padding: '20px 16px 80px 16px', 
        fontFamily: 'sans-serif'
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          
          <button
            onClick={() => { setActiveSubView(null); setIsEditing(false); }}
            style={{
              background: 'none', border: 'none', fontSize: '15px', fontWeight: 'bold',
              color: '#81c784', cursor: 'pointer', display: 'flex', alignItems: 'center',
              gap: '6px', marginBottom: '16px'
            }}
          >
            ← Menyuya qayıt
          </button>

          {/* 1. PROFİL MƏLUMATLARI SƏHİFƏSİ */}
          {activeSubView === 'info' && (
            <div style={{ backgroundColor: darkMode ? '#1e1e1e' : '#ffffff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', textAlign: 'center', marginTop: 0, marginBottom: '20px' }}>Profil Məlumatları</h2>

              <div style={{ textAlign: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: darkMode ? '1px solid #333' : '1px solid #eee' }}>
                <img
                  src={userData?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"}
                  alt="Avatar"
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #81c784', marginBottom: '8px' }}
                />
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{userData?.fullName || userData?.name || 'İstifadəçi Adı'}</h3>
                <span style={{ backgroundColor: '#2e7d32', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                  ID: {formattedUserId}
                </span>
              </div>

              {editMsg.text && (
                <div style={{ padding: '10px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px', backgroundColor: editMsg.type === 'success' ? '#e8f5e9' : '#ffebee', color: editMsg.type === 'success' ? '#2e7d32' : '#c62828' }}>
                  {editMsg.text}
                </div>
              )}

              {!isEditing ? (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ padding: '12px', backgroundColor: darkMode ? '#2a2a2a' : '#f8f9fa', borderRadius: '12px' }}>
                      <span style={{ fontSize: '11px', color: darkMode ? '#aaa' : '#888', display: 'block' }}>E-poçt ünvanı</span>
                      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{userData?.email || 'Təyin edilməyib'}</span>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: darkMode ? '#2a2a2a' : '#f8f9fa', borderRadius: '12px' }}>
                      <span style={{ fontSize: '11px', color: darkMode ? '#aaa' : '#888', display: 'block' }}>Telefon nömrəsi</span>
                      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{userData?.phoneNumber || userData?.phone || 'Təyin edilməyib'}</span>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: darkMode ? '#2a2a2a' : '#f8f9fa', borderRadius: '12px' }}>
                      <span style={{ fontSize: '11px', color: darkMode ? '#aaa' : '#888', display: 'block' }}>Hesab Rolu</span>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#81c784' }}>{isOwnerOrAdmin ? 'Stadion Sahibi (Owner)' : 'Oyunçu (User)'}</span>
                    </div>
                  </div>
                  <button onClick={() => setIsEditing(true)} style={{ width: '100%', padding: '12px', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Məlumatları Redaktə Et
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateInfo}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '12px', color: darkMode ? '#ccc' : '#555', display: 'block', marginBottom: '4px' }}>Ad</label>
                    <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '12px', color: darkMode ? '#ccc' : '#555', display: 'block', marginBottom: '4px' }}>Soyad</label>
                    <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '12px', color: darkMode ? '#ccc' : '#555', display: 'block', marginBottom: '4px' }}>Telefon</label>
                    <input type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ fontSize: '12px', color: darkMode ? '#ccc' : '#555', display: 'block', marginBottom: '4px' }}>Profil Şəkli (URL)</label>
                    <input type="url" value={formData.avatarUrl} onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#eee', color: '#333', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Ləğv et</button>
                    <button type="submit" disabled={editLoading} style={{ flex: 1, padding: '10px', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                      {editLoading ? 'Yadda saxlanılır...' : 'Yadda Saxla'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 2. BİLDİRİŞLƏR SƏHİFƏSİ */}
          {activeSubView === 'notifications' && (
            <NotificationsContent userData={userData} darkMode={darkMode} />
          )}

        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 🟢 ƏSAS PROFİL MENYU EKRANI
  // ----------------------------------------------------
  return (
    <div style={{ 
      backgroundColor: darkMode ? '#121212' : '#f6f6f2', 
      color: darkMode ? '#ffffff' : '#000000',
      minHeight: '100vh', 
      paddingBottom: '80px', 
      fontFamily: 'sans-serif',
      transition: 'all 0.3s ease'
    }}>
      {/* ÜST BANER */}
      <div style={{ backgroundColor: '#2e7d32', color: '#fff', padding: '30px 20px 25px 20px', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#fff', margin: '0 auto 12px auto', overflow: 'hidden', border: '3px solid #81c784' }}>
          <img src={userData?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>
          {userData?.fullName || userData?.name || 'İstifadəçi'}
        </h2>
        <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', color: '#ffffff' }}>
          {isOwnerOrAdmin ? 'Stadion Sahibi (Owner)' : 'Müştəri (Oyunçu)'}
        </span>
      </div>

      {/* STATİSTİKA KARTLARI */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-around', 
        margin: '-20px 16px 20px 16px', 
        backgroundColor: darkMode ? '#1e1e1e' : '#ffffff', 
        borderRadius: '16px', 
        padding: '16px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#81c784' }}>
            {isOwnerOrAdmin ? fieldsCount : (userData?.gamesCount || 0)}
          </div>
          <div style={{ fontSize: '11px', color: darkMode ? '#aaa' : '#888', marginTop: '2px' }}>
            {isOwnerOrAdmin ? 'Meydança' : 'Mənim Oyunlarım'}
          </div>
        </div>

        <div style={{ width: '1px', backgroundColor: darkMode ? '#333' : '#eee' }}></div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#81c784' }}>{reservationsCount}</div>
          <div style={{ fontSize: '11px', color: darkMode ? '#aaa' : '#888', marginTop: '2px' }}>Rezervasiya</div>
        </div>

        <div style={{ width: '1px', backgroundColor: darkMode ? '#333' : '#eee' }}></div>
        
        <div onClick={() => setShowRatingModal(true)} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#81c784' }}>⭐ {userData?.rating || '5.0'}</div>
          <div style={{ fontSize: '11px', color: '#81c784', marginTop: '2px', textDecoration: 'underline' }}>Səs ver</div>
        </div>
      </div>

      {/* MENYU SİYAHISI */}
      <div style={{ padding: '0 16px', maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ backgroundColor: darkMode ? '#1e1e1e' : '#ffffff', borderRadius: '16px', overflow: 'hidden', border: darkMode ? '1px solid #333' : 'none' }}>
          {profileItems.map((item, index) => {
            const isHovered = hoveredIndex === index;
            return (
              <div
                key={item.id}
                onClick={item.action}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  borderBottom: index === profileItems.length - 1 ? 'none' : (darkMode ? '1px solid #2a2a2a' : '1px solid #f0f0f0'),
                  cursor: 'pointer',
                  backgroundColor: isHovered ? (darkMode ? '#2a3b2c' : '#e8f5e9') : 'transparent',
                }}
              >
                <span style={{ fontSize: '20px', marginRight: '14px' }}>{item.icon}</span>
                <span style={{ flex: 1, fontSize: '14px', fontWeight: 'bold', color: item.isLogout ? '#e53935' : (darkMode ? '#ffffff' : '#333333') }}>
                  {item.label}
                </span>

                {item.isSpecial && (
                  <span style={{ backgroundColor: '#2e7d32', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px', fontWeight: 'bold' }}>+</span>
                )}

                {item.isToggle && (
                  <input 
                    type="checkbox" 
                    checked={darkMode} 
                    onChange={() => setDarkMode(!darkMode)} 
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }} 
                  />
                )}

                {!item.isSpecial && !item.isToggle && (
                  <span style={{ color: isHovered ? '#81c784' : '#666', fontWeight: 'bold' }}>›</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SƏSVERMƏ MODALI */}
      {showRatingModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: darkMode ? '#1e1e1e' : '#fff', color: darkMode ? '#fff' : '#333', padding: '24px', borderRadius: '16px', textAlign: 'center', minWidth: '290px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: darkMode ? '#fff' : '#333' }}>Profilə Səs Ver</h3>
            <p style={{ fontSize: '14px', color: darkMode ? '#aaa' : '#666', margin: '0 0 15px 0' }}>Cari Reytinq: ⭐ {userData?.rating || '5.0'}</p>
            <div style={{ fontSize: '32px', cursor: 'pointer', margin: '15px 0' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} onClick={() => setSelectedStars(star)} style={{ color: star <= selectedStars ? '#FFD700' : '#CCC', padding: '0 4px', transition: 'color 0.2s' }}>★</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button onClick={handleVote} disabled={loading} style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                {loading ? 'Göndərilir...' : 'Səsi Təsdiqlə'}
              </button>
              <button onClick={() => setShowRatingModal(false)} style={{ background: darkMode ? '#333' : '#eee', color: darkMode ? '#fff' : '#333', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Bağla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ÖDƏNİŞ MODALI */}
      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        userData={userData} 
        setUserData={setUserData} 
      />
    </div>
  );
};

export default Profile;