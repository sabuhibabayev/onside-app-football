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

      if (typeof voteGoalVideo === 'function') {
        await voteGoalVideo(goalId, user.id);
      } else {
        await apiFetch(`/api/goals/${goalId}/vote?userId=${user.id}`, { method: 'POST' });
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
          goalsList.map((item) => {
            // Backend GoalResponse DTO-dan gələn hasVoted statusu
            const hasVoted = Boolean(item.hasVoted);

            return (
              <div key={item.id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                {/* 16:9 Video Formatı */}
                <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#000' }}>
                  <video 
                    controls 
                    preload="metadata"
                    src={item.videoUrl}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  >
                    Sizin brauzer video dəstəkləmir.
                  </video>
                </div>

                {/* Məlumat və Səs Vermə Paneli */}
                <div style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#111' }}>
                      {item.description || item.title || 'Qol Videosu'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#777', marginTop: '2px' }}>
                      Müəllif: {item.userName || item.ownerName || 'İstifadəçi'}
                    </div>
                  </div>

                  <button 
                    onClick={() => handleVote(item.id)}
                    disabled={votingId === item.id || hasVoted}
                    style={{ 
                      backgroundColor: hasVoted ? '#c8e6c9' : '#e8f5e9', 
                      color: '#2e7d32', 
                      border: '1px solid #2e7d32', 
                      padding: '8px 14px', 
                      borderRadius: '12px', 
                      fontWeight: 'bold', 
                      fontSize: '13px', 
                      cursor: hasVoted ? 'default' : 'pointer',
                      opacity: votingId === item.id ? 0.6 : 1,
                      transition: '0.2s'
                    }}
                  >
                    {hasVoted ? '✓ Səs verilib' : `🔥 ${item.votesCount ?? item.voteCount ?? 0} Səs`}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Goals;