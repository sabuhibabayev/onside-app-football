import React from 'react';

const ReceiptModal = ({ isOpen, onClose, receiptData, darkMode }) => {
  if (!isOpen || !receiptData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px'
    }}>
      <div style={{
        backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
        color: darkMode ? '#ffffff' : '#000000',
        borderRadius: '20px', maxWidth: '380px', width: '100%', padding: '24px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)', textAlign: 'center'
      }}>
        {/* Başlıq */}
        <div style={{ borderBottom: '2px dashed #ccc', paddingBottom: '16px', marginBottom: '16px' }}>
          <span style={{ fontSize: '36px' }}>⚽</span>
          <h2 style={{ margin: '8px 0 4px 0', fontSize: '20px', color: '#2e7d32' }}>ONside QƏBZ</h2>
          <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Qəbz ID: #{receiptData?.id || Math.floor(100000 + Math.random() * 900000)}</p>
          <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#888' }}>Tarix: {receiptData?.issueDate || new Date().toLocaleDateString('az-AZ')}</p>
        </div>

        {/* Məlumatlar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', textAlign: 'left', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888' }}>Müştəri:</span>
            <b>{receiptData?.userName || 'Huseyin Salimzade'}</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888' }}>Meydança:</span>
            <b>{receiptData?.fieldName || 'Əsas Meydança'}</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888' }}>Rezerv Sifarişi:</span>
            <b>{receiptData?.date || '2026-09-25'} | {receiptData?.time || '18:00 - 19:00'}</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888' }}>Ödəniş Üsulu:</span>
            <b>{receiptData?.paymentMethod || 'Onlayn Kart'}</b>
          </div>
          <div style={{ borderTop: darkMode ? '1px solid #333' : '1px solid #eee', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
            <span>Ödənilən Məbləğ:</span>
            <b style={{ color: '#2e7d32' }}>{receiptData?.amount || '30'} AZN</b>
          </div>
        </div>

        {/* Düymələr */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handlePrint}
            style={{ flex: 1, padding: '12px', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            🖨️ Çap et / Saxla
          </button>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '12px', backgroundColor: darkMode ? '#333' : '#eee', color: darkMode ? '#fff' : '#333', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;