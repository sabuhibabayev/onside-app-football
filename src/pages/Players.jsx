import React from 'react';

const Players = ({ lookingForPlayersList }) => {
  return (
    <div style={{ backgroundColor: '#f6f6f2', minHeight: '100vh', paddingBottom: '80px', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#2e7d32', color: '#fff', padding: '24px 20px', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
        <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>👥 Oyunçu Axtaranlar</h2>
        <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>Komandasına adam çatışmayan oyunlara qoşulun</p>
      </div>

      <div style={{ padding: '16px', maxWidth: '480px', margin: '0 auto' }}>
        {lookingForPlayersList.length > 0 ? (
          lookingForPlayersList.map((item) => (
            <div key={item.id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px', marginBottom: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>
                  🏟️ {item.fieldName || 'Stadion'}
                </span>
                <span style={{ backgroundColor: '#fff3e0', color: '#e65100', padding: '4px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>
                  ⚡ {item.neededPlayers} oyunçu lazımdır
                </span>
              </div>

              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#111', marginBottom: '4px' }}>
                📅 Tarix: {item.reservationDate} | ⏰ {item.startTime} - {item.endTime}
              </div>

              {item.description && (
                <p style={{ margin: '6px 0 12px 0', fontSize: '13px', color: '#555', backgroundColor: '#f9f9f9', padding: '8px 12px', borderRadius: '8px' }}>
                  💬 "{item.description}"
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#888' }}>Kapitan</div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>{item.userName || 'İstifadəçi'}</div>
                </div>
                <a 
                  href={`https://web.whatsapp.com/send?phone=${item.userPhone ? item.userPhone.replace(/[^0-9]/g, '') : '994500000000'}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ backgroundColor: '#25D366', color: '#fff', textDecoration: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  💬 WhatsApp ilə yaz
                </a>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚽</div>
            <div style={{ fontSize: '15px', fontWeight: 'bold' }}>Hazırda oyunçu axtaran elan yoxdur</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Players;