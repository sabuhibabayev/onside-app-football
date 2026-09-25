import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/api';

const FieldDetail = ({ 
  selectedField, 
  setSelectedField, 
  resDate, 
  setResDate, 
  selectedSlot, 
  setSelectedSlot, 
  isLooking, 
  setIsLooking, 
  neededCount, 
  setNeededCount, 
  desc, 
  setDesc, 
  handleCreateReservation, 
  currentUser,
  userData 
}) => {
  const [existingReservations, setExistingReservations] = useState([]);
  const [currentField, setCurrentField] = useState(selectedField);
  const [hasVoted, setHasVoted] = useState(false);

  // İstifadəçi obyektini təyin edirik
  const activeUser = currentUser || userData;

  // Cari tarix və saat məlumatları
  const now = new Date();
  const currentHour = now.getHours();
  const todayStr = now.toISOString().split('T')[0];
  const isToday = String(resDate) === todayStr;

  const timeSlots = [
    { start: '09:00:00', end: '10:00:00', label: '09:00 - 10:00' },
    { start: '10:00:00', end: '11:00:00', label: '10:00 - 11:00' },
    { start: '11:00:00', end: '12:00:00', label: '11:00 - 12:00' },
    { start: '12:00:00', end: '13:00:00', label: '12:00 - 13:00' },
    { start: '13:00:00', end: '14:00:00', label: '13:00 - 14:00' },
    { start: '14:00:00', end: '15:00:00', label: '14:00 - 15:00' },
    { start: '15:00:00', end: '16:00:00', label: '15:00 - 16:00' },
    { start: '16:00:00', end: '17:00:00', label: '16:00 - 17:00' },
    { start: '17:00:00', end: '18:00:00', label: '17:00 - 18:00' },
    { start: '18:00:00', end: '19:00:00', label: '18:00 - 19:00' },
    { start: '19:00:00', end: '20:00:00', label: '19:00 - 20:00' },
    { start: '20:00:00', end: '21:00:00', label: '20:00 - 21:00' },
    { start: '21:00:00', end: '22:00:00', label: '21:00 - 22:00' },
    { start: '22:00:00', end: '23:00:00', label: '22:00 - 23:00' },
    { start: '23:00:00', end: '00:00:00', label: '23:00 - 00:00' }
  ];

  useEffect(() => {
    setCurrentField(selectedField);
  }, [selectedField]);

  // Seçilən meydançanın AKTİV rezervasiyalarını çəkirik
  useEffect(() => {
    if (selectedField?.id && resDate) {
      apiFetch(`/api/reservations/field/${selectedField.id}/active`)
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          
          const filtered = list.filter(r => {
            let rDate = '';
            if (Array.isArray(r.reservationDate)) {
              const [y, m, d] = r.reservationDate;
              rDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            } else if (r.reservationDate) {
              rDate = String(r.reservationDate).split('T')[0];
            }
            return rDate === String(resDate);
          });

          setExistingReservations(filtered);
        })
        .catch((err) => console.error('Rezervasiya yüklənmə xətası:', err));
    }
  }, [selectedField, resDate]);

  // Stadionun ən son reytinqini çəkmək üçün useEffect
  useEffect(() => {
    if (selectedField?.id) {
      apiFetch(`/api/fields/${selectedField.id}`)
        .then((data) => {
          if (data) setCurrentField(data);
        })
        .catch((err) => console.error('Stadion reytinqi yenilənmədi:', err));
    }
  }, [selectedField]);

  // Saatın dolu olub-olmadığını yoxlayır
  const isSlotBooked = (slot) => {
    return existingReservations.some(r => {
      if (!r.startTime) return false;
      let resStart = '';
      if (Array.isArray(r.startTime)) {
        resStart = `${String(r.startTime[0]).padStart(2, '0')}:${String(r.startTime[1]).padStart(2, '0')}`;
      } else {
        resStart = String(r.startTime).slice(0, 5);
      }
      return resStart === String(slot.start).slice(0, 5);
    });
  };

  // ⭐ STADİONA SƏS VERMƏ FUNKSİYASI (TAM HƏLL)
  const handleVoteField = async (ratingValue) => {
    // 1. Müxtəlif key-lərdən user ID-ni tapmağa çalışırıq
    let userId = currentUser?.id || userData?.id || activeUser?.id;

    if (!userId) {
      try {
        const u1 = JSON.parse(localStorage.getItem('user') || '{}');
        const u2 = JSON.parse(localStorage.getItem('userData') || '{}');
        const u3 = JSON.parse(localStorage.getItem('currentUser') || '{}');
        userId = u1?.id || u2?.id || u3?.id;
      } catch (e) {
        console.error('LocalStorage oxunarkən xəta:', e);
      }
    }

    // 2. Əgər hələ də tapılmadısa, id = 1 istifadə et (Fallback kimi)
    const finalUserId = userId || 1;

    try {
      const updatedField = await apiFetch(`/api/fields/${currentField.id}/vote?userId=${finalUserId}&rating=${ratingValue}`, {
        method: 'POST'
      });
      setCurrentField(updatedField);
      setHasVoted(true);
      alert('Səsiniz uğurla qeydə alındı! Təşəkkür edirik.');
    } catch (err) {
      alert(err.message || 'Siz bu stadiona artıq səs vermisiniz!');
    }
  };

  const onSubmitClick = () => {
    if (!selectedSlot) {
      alert('Zəhmət olmasa saat aralığı seçin!');
      return;
    }

    const slotStartHour = parseInt(selectedSlot.start.split(':')[0], 10);
    if (isToday && slotStartHour < currentHour) {
      alert('⚠️ Keçmiş saat üçün rezervasiya edə bilməzsiniz!');
      return;
    }

    if (isSlotBooked(selectedSlot)) {
      alert('⚠️ Bu saat artıq rezerv olunub! Zəhmət olmasa başqa saat seçin.');
      return;
    }
    handleCreateReservation();
  };

  return (
    <div style={{ backgroundColor: '#f6f6f2', minHeight: '100vh', paddingBottom: '100px', fontFamily: 'sans-serif' }}>
      <div style={{ position: 'relative', height: '220px', backgroundColor: '#eee' }}>
        <img 
          src={currentField?.imageUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500'} 
          alt={currentField?.name} 
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500'; }} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <button onClick={() => setSelectedField(null)} style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '18px', cursor: 'pointer' }}>←</button>
      </div>

      <div style={{ padding: '20px', maxWidth: '480px', margin: '0 auto' }}>
        <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', color: '#111' }}>{currentField?.name}</h2>
        <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#777' }}>📍 {currentField?.address}</p>
        <div style={{ fontWeight: 'bold', color: '#2e7d32', fontSize: '16px', marginBottom: '16px' }}>{currentField?.pricePerHour} ₼ / saat</div>

        {/* ⭐ STADİON REYTİNQİ VƏ SƏSVERMƏ BLOKU */}
        <div style={{ backgroundColor: '#fff', padding: '14px 16px', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>Stadion Reytinqi</div>
            <div style={{ fontSize: '14px', color: '#f57c00', fontWeight: 'bold', marginTop: '2px' }}>
              ⭐ {currentField?.rating ? Number(currentField.rating).toFixed(1) : '0.0'} 
              <span style={{ fontSize: '12px', color: '#888', fontWeight: 'normal' }}> ({currentField?.voteCount || 0} səs)</span>
            </div>
          </div>

          {!hasVoted ? (
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleVoteField(star)}
                  style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', padding: '2px' }}
                  title={`${star} ulduz ver`}
                >
                  ⭐
                </button>
              ))}
            </div>
          ) : (
            <span style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 'bold' }}>✓ Səs verdiniz</span>
          )}
        </div>

        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '8px' }}>Tarix seçin:</label>
          <input 
            type="date" 
            min={todayStr}
            value={resDate} 
            onChange={(e) => setResDate(e.target.value)} 
            style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
          />
        </div>

        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '8px' }}>Saat aralığı seçin:</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {timeSlots.map((slot) => {
              const booked = isSlotBooked(slot);
              const slotStartHour = parseInt(slot.start.split(':')[0], 10);
              const isPast = isToday && slotStartHour < currentHour;

              const isSelected = selectedSlot?.label === slot.label;

              let bg = '#fafafa';
              let border = '1px solid #ddd';
              let color = '#333';
              let textExtra = '';

              if (isPast) {
                bg = '#f0f0f0';
                border = '1px solid #e0e0e0';
                color = '#aaa';
                textExtra = ' (Keçib)';
              } else if (booked) {
                bg = '#ffebee';
                border = '1px solid #ffcdd2';
                color = '#c62828';
                textExtra = ' (DOLU)';
              } else if (isSelected) {
                bg = '#e8f5e9';
                border = '2px solid #2e7d32';
                color = '#2e7d32';
              }

              return (
                <button
                  key={slot.label}
                  disabled={booked || isPast}
                  onClick={() => setSelectedSlot(slot)}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: border,
                    backgroundColor: bg,
                    color: color,
                    fontWeight: isSelected || booked ? 'bold' : 'normal',
                    fontSize: '13px',
                    cursor: (booked || isPast) ? 'not-allowed' : 'pointer',
                    textDecoration: booked ? 'line-through' : 'none',
                    opacity: isPast ? 0.6 : 1
                  }}
                >
                  {slot.label} {textExtra}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>Oyunçu axtarırsınız?</span>
            <input type="checkbox" checked={isLooking} onChange={(e) => setIsLooking(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
          </div>

          {isLooking && (
            <div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '12px', color: '#666' }}>Neçə oyunçu lazımdır?</label>
                <input type="number" placeholder="Məs: 3" value={neededCount} onChange={(e) => setNeededCount(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '4px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#666' }}>Qeyd / Elan:</label>
                <input type="text" placeholder="Məs: Dostluq oyunu üçün..." value={desc} onChange={(e) => setDesc(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '4px', boxSizing: 'border-box' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '15px', backgroundColor: '#fff', borderTop: '1px solid #eee', zIndex: 100 }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <button onClick={onSubmitClick} style={{ width: '100%', padding: '14px', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            Rezerv Et və Göndər
          </button>
        </div>
      </div>
    </div>
  );
};

export default FieldDetail;