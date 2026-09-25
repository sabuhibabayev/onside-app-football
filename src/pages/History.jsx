import React, { useState } from 'react';
import ReceiptModal from '../components/ReceiptModal';

const History = ({ userHistoryList = [], userData, darkMode, setActiveNav }) => {
  // 1. Qəbz üçün state-lər
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // 2. Qəbzə bax düyməsinə tıklandıqda işləyən funksiya
  const handleOpenReceipt = (reservation) => {
    setSelectedReceipt({
      id: reservation.id,
      userName: userData?.fullName || userData?.name || 'Müştəri',
      fieldName: reservation.fieldName || reservation.field?.name || 'Stadion',
      date: reservation.reservationDate || reservation.date || '—',
      time: reservation.startTime ? `${reservation.startTime} - ${reservation.endTime}` : '—',
      paymentMethod: 'Onlayn Kart',
      amount: reservation.price || reservation.amount || '30',
      issueDate: reservation.createdAt || new Date().toLocaleDateString('az-AZ')
    });
    setIsReceiptOpen(true);
  };

  return (
    <div style={{ backgroundColor: darkMode ? '#121212' : '#f6f6f2', color: darkMode ? '#ffffff' : '#000000', minHeight: '100vh', paddingBottom: '80px', fontFamily: 'sans-serif' }}>
      {/* Üst Başlıq Barı */}
      <div style={{ backgroundColor: darkMode ? '#1e1e1e' : '#f6f6f2', padding: '16px 20px', display: 'flex', alignItems: 'center', borderBottom: darkMode ? '1px solid #333' : '1px solid #e5e5dd' }}>
        <button onClick={() => setActiveNav('profile')} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', marginRight: '15px', color: darkMode ? '#fff' : '#000' }}>←</button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: darkMode ? '#fff' : '#111' }}>📜 Keçmiş Rezervasiyalarım</h2>
      </div>

      {/* Rezervasiya Siyahısı */}
      <div style={{ padding: '16px', maxWidth: '480px', margin: '0 auto' }}>
        {userHistoryList && userHistoryList.length > 0 ? (
          userHistoryList.map((item) => (
            <div key={item.id} style={{ backgroundColor: darkMode ? '#1e1e1e' : '#ffffff', borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '15px', color: darkMode ? '#fff' : '#222' }}>
                  🏟️ {item.fieldName || item.field?.name || 'Stadion'}
                </span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  backgroundColor: item.status === 'APPROVED' ? '#e8f5e9' : item.status === 'REJECTED' ? '#ffebee' : '#fff3e0',
                  color: item.status === 'APPROVED' ? '#2e7d32' : item.status === 'REJECTED' ? '#c62828' : '#e65100'
                }}>
                  {item.status === 'APPROVED' ? '✅ Təsdiqləndi' : item.status === 'REJECTED' ? '❌ Ləğv edildi' : '⌛ Gözləmədə'}
                </span>
              </div>

              <div style={{ fontSize: '13px', color: darkMode ? '#bbb' : '#666' }}>
                📅 Tarix: {item.reservationDate || '2026-08-15'}
              </div>
              <div style={{ fontSize: '13px', color: darkMode ? '#bbb' : '#666', marginTop: '2px' }}>
                ⏰ Saat: {item.startTime ? `${item.startTime} - ${item.endTime}` : '21:00 - 22:00'}
              </div>

              {/* 3. "Qəbzə bax" Düyməsi */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', borderTop: darkMode ? '1px solid #333' : '1px solid #f0f0f0', paddingTop: '10px' }}>
                <button
                  onClick={() => handleOpenReceipt(item)}
                  style={{
                    backgroundColor: '#1976d2',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  📄 Qəbzə bax
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>📜</div>
            <div>Hələ ki heç bir rezervasiyanız yoxdur.</div>
          </div>
        )}
      </div>

      {/* 4. Qəbz Modalı */}
      <ReceiptModal 
        isOpen={isReceiptOpen} 
        onClose={() => setIsReceiptOpen(false)} 
        receiptData={selectedReceipt} 
        darkMode={darkMode} 
      />
    </div>
  );
};

export default History;