import React, { useState } from 'react';

const PaymentModal = ({ isOpen, onClose, userData, setUserData }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async (e) => {
    e.preventDefault();

    if (cardNumber.replace(/\s/g, '').length < 16) {
      alert('Zəhmət olmasa 16 rəqəmli kart nömrəsini tam daxil edin!');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userData.id,
          amount: 10.0,
          paymentType: 'PREMIUM_SUBSCRIPTION',
          paymentMethod: 'CARD',
          cardNumber: cardNumber.replace(/\s/g, ''),
          discountPercentage: 15,
          durationInDays: 30
        })
      });

      const data = await response.json();

      if (response.ok && data.status === 'SUCCESS') {
        alert('Ödəniş uğurla tamamlandı! Premium statusunuz aktivləşdirildi 👑');
        if (setUserData) {
          setUserData({ ...userData, isPremium: true, discountPercentage: 15 });
        }
        onClose();
      } else {
        alert('Ödəniş uğursuz oldu! Kart məlumatlarınızı yoxlayın.');
      }
    } catch (error) {
      alert('Xəta baş verdi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 2000
    }}>
      <div style={{
        backgroundColor: '#fff', width: '100%', maxWidth: '380px',
        borderRadius: '20px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#111' }}>👑 Premium Abunəlik</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ backgroundColor: '#fff8e1', padding: '12px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #ffe082' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#b78103' }}>1 Aylıq Premium Paket</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>Bütün rezervasiyalara 15% endirim</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2e7d32', marginTop: '6px' }}>10.00 ₼</div>
        </div>

        <form onSubmit={handlePayment}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '4px' }}>Kart Nömrəsi</label>
            <input
              type="text"
              placeholder="4169 0000 0000 0000"
              maxLength="19"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '4px' }}>Bitmə tarixi</label>
              <input
                type="text"
                placeholder="MM/YY"
                maxLength="5"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '4px' }}>CVV</label>
              <input
                type="password"
                placeholder="123"
                maxLength="3"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', backgroundColor: '#ffa000', color: '#fff', border: 'none',
              padding: '12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer'
            }}
          >
            {loading ? 'Ödənilir...' : '10.00 ₼ Ödə və Aktivləşdir'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;