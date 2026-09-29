import React, { useState } from 'react';
import { voteGoalVideo, apiFetch } from '../api/api';
import { useAuth } from '../context/AuthContext';

const Goals = ({ goalsList = [], fetchGoals }) => {
  const { user } = useAuth();
  const [votingId, setVotingId] = useState(null);

  const handleVote = async (goalId) => {
    if (!user || !user.id) {
      alert('Səs vermək üçün hesaba daxil olmalısınız!');
      return;
    }

    try {
      setVotingId(goalId);

      // Əgər api.js daxilində getTopGoalVideos/voteGoalVideo eksport olunubsa istifadə edirik,
      // yoxdursa birbaşa apiFetch vasitəsilə fallback edirik:
      if (typeof voteGoalVideo === 'function') {
        await voteGoalVideo(goalId, user.id);
      } else {
        await apiFetch(`/api/goal-videos/${goalId}/vote?userId=${user.id}`, { method: 'POST' });
      }

      alert('Səsiniz uğurla qeydə alındı! 🎉');
      if (fetchGoals) fetchGoals();
    } catch (err) {
      console.error('Səsvermə xətası:', err);
      alert(err.message || 'Səs verərkən xəta baş verdi və ya artıq səs vermisiniz.');
    } finally {
      setVotingId(null);
    }
  };

  return (
    <div style={{ backgroundColor: '#f6f6f2', minHeight: '100vh', paddingBottom: '80px', fontFamily: 'sans-serif' }}>
      {/* Header Bölməsi */}
      <div style={{ backgroundColor: '#2e7d32', color: '#fff', padding: '24px 20px', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
        <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>⚽ Ayın Ən Gözəl Qolu</h2>
        <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>Baxın, səs verin və ən yaxşı qolu seçin!</p>
      </div>

      {/* Siyahı Bölməsi */}
      <div style={{ padding: '16px', maxWidth: '480px', margin: '0 auto' }}>
        {goalsList.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', marginTop: '40px', fontSize: '14px' }}>
            Hələ ki, heç bir video yüklənməyib.
          </div>
        ) : (
          goalsList.map((item) => (
            <div key={item.id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              {/* Peşəkar 16:9 Nisbətində Video Formatı */}
              <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#000' }}>
                <video 
                  controls 
                  preload="metadata"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                >
                  <source src={item.videoUrl} type="video/mp4" />
                  Sizin brauzer video dəstəkləmir.
                </video>
              </div>

              {/* Məlumat və Səs Vermə Paneli */}
              <div style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#111' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: '#777', marginTop: '2px' }}>
                    Müəllif: {item.ownerName || item.author || 'İstifadəçi'}
                  </div>
                </div>

                <button 
                  onClick={() => handleVote(item.id)}
                  disabled={votingId === item.id}
                  style={{ 
                    backgroundColor: '#e8f5e9', 
                    color: '#2e7d32', 
                    border: '1px solid #2e7d32', 
                    padding: '8px 14px', 
                    borderRadius: '12px', 
                    fontWeight: 'bold', 
                    fontSize: '13px', 
                    cursor: 'pointer',
                    opacity: votingId === item.id ? 0.6 : 1,
                    transition: '0.2s'
                  }}
                >
                  🔥 {item.voteCount ?? item.votes ?? 0} Səs
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Goals;