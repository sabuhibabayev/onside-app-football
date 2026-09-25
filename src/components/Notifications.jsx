import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/api';

const Notifications = ({ userData, darkMode, setActiveNav }) => {
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
      // Backend-dən bildirişləri və ya gözləmədə olan rezervasiyaları gətiririk
      const endpoint = isOwnerOrAdmin 
        ? `/api/reservations/pending` 
        : `/api/reservations/my-reservations`;

      const data = await apiFetch(endpoint);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Bildirişləri gətirərkən xəta:', err);
      setError('Bildirişləri yükləmək mümkün olmadı.');
    } finally {
      setLoading(false);
    }
  };

  // Admin/Owner üçün rezervasiyanı təsdiqləmək
  const handleApprove = async (reservationId) => {
    try {
      await apiFetch(`/api/reservations/${reservationId}/approve`, { method: 'PUT' });
      alert('Rezervasiya təsdiqləndi!');
      fetchNotifications();
    } catch (err) {
      alert('Təsdiqləmə zamanı xəta baş verdi!');
    }
  };

  // Rezervasiyanı ləğv etmək / İmtina etmək
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
    <div style={{
      backgroundColor: darkMode ? '#121212' : '#f6f6f2',
      color: darkMode ? '#ffffff' : '#000000',
      minHeight: '100vh',
      padding: '20px 16px 80px 16px',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        
        {/* Başlıq */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', margin: 0 }}>🔔 Bildirişlər</h2>
          <button 
            onClick={fetchNotifications}
            style={{ background: 'none', border: 'none', color: '#81c784', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Yenilə 🔄
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>Yüklənir...</div>
        ) : error ? (
          <div style={{ padding: '14px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '12px', fontSize: '13px' }}>{error}</div>
        ) : notifications.length === 0 ? (
          <div style={{
            backgroundColor: darkMode ? '#1e1e1e' : '#fff',
            padding: '30px', borderRadius: '16px', textAlign: 'center', color: darkMode ? '#aaa' : '#666'
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
                  <span style={{ fontWeight: 'bold', fontSize: '15px' }}>
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

                <div style={{ fontSize: '13px', color: darkMode ? '#bbb' : '#555', marginBottom: '12px' }}>
                  📅 Tarix: <b>{item.date || item.reservationDate}</b> | ⏰ Saat: <b>{item.startTime} - {item.endTime}</b>
                  {item.userName && <div>👤 Müraciət edən: <b>{item.userName}</b></div>}
                </div>

                {/* DÜYMƏLƏR */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  {isOwnerOrAdmin && item.status === 'PENDING' && (
                    <button
                      onClick={() => handleApprove(item.id)}
                      style={{
                        backgroundColor: '#2e7d32', color: '#fff', border: 'none',
                        padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer'
                      }}
                    >
                      ✓ Təsdiqlə
                    </button>
                  )}
                  {item.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancel(item.id)}
                      style={{
                        backgroundColor: '#e53935', color: '#fff', border: 'none',
                        padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer'
                      }}
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
    </div>
  );
};

export default Notifications;