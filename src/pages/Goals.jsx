import React from 'react';
import { apiFetch } from '../api/api';
import { useAuth } from '../context/AuthContext';

const Goals = ({ goalsList, fetchGoals }) => {
  const { user } = useAuth();

  const handleVote = (goalId) => {
    if (!user || !user.id) {
      alert('Səs vermək üçün hesaba daxil olmalısınız!');
      return;
    }

    apiFetch(`/api/goal-videos/${goalId}/vote?userId=${user.id}`, { method: 'POST' })
      .then(() => {
        alert('Səsiniz uğurla qeydə alındı! 🎉');
        if (fetchGoals) fetchGoals();
      })
      .catch((err) => {
        console.error('Səsvermə xətası:', err);
        alert(err.message || 'Səs verərkən xəta baş verdi və ya artıq səs vermisiniz.');
      });
  };

  return (
    <div style={{ backgroundColor: '#f6f6f2', minHeight: '100vh', paddingBottom: '80px', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#2e7d32', color: '#fff', padding: '24px 20px', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
        <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>⚽ Ayın Ən Gözəl Qolu</h2>
        <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>Baxın, səs verin və ən yaxşı qolu seçin!</p>
      </div>

      <div style={{ padding: '16px', maxWidth: '480px', margin: '0 auto' }}>
        {goalsList.map((item) => (
          <div key={item.id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <video controls style={{ width: '100%', height: '220px', backgroundColor: '#000', objectFit: 'cover' }}>
              <source src={item.videoUrl} type="video/mp4" />
            </video>
            <div style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#111' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: '#777', marginTop: '2px' }}>Müəllif: {item.ownerName || item.author || 'İstifadəçi'}</div>
              </div>
              <button 
                onClick={() => handleVote(item.id)}
                style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', border: '1px solid #2e7d32', padding: '8px 14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                🔥 {item.voteCount ?? item.votes ?? 0} Səs
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Goals;