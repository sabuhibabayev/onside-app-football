import React, { useState, useEffect } from 'react';

const WeeklyGoals = () => {
  const [goals, setGoals] = useState([]);
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('jwt_token');

  // Bütün qolları gətiririk
  const fetchGoals = () => {
    fetch('http://localhost:8080/api/goals')
      .then((res) => res.json())
      .then((data) => setGoals(data))
      .catch((err) => console.error('Qolları yükləyərkən xəta:', err));
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // 1. Yeni Qol Yüklə
  const handleAddGoal = (e) => {
    e.preventDefault();
    fetch('http://localhost:8080/api/goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ description, videoUrl })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Qol əlavə edilmədi!');
        return res.json();
      })
      .then(() => {
        setMessage('Qol uğurla əlavə olundu!');
        setDescription('');
        setVideoUrl('');
        fetchGoals();
      })
      .catch((err) => setMessage(err.message));
  };

  // 2. Qola Səs Ver
  const handleVote = (goalId) => {
    fetch(`http://localhost:8080/api/goals/${goalId}/vote`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Səs verilə bilmədi!');
        return res.json();
      })
      .then(() => {
        fetchGoals();
      })
      .catch((err) => alert(err.message));
  };

  // 3. Həftənin Qalibini Seç (Admin)
  const handleSelectWinner = () => {
    fetch('http://localhost:8080/api/goals/select-weekly-winner', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Qalib seçilə bilmədi!');
        return res.json();
      })
      .then(() => {
        alert('Həftənin qalibi seçildi!');
        fetchGoals();
      })
      .catch((err) => alert(err.message));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>⚽ Həftənin Qolu / Səsvermə</h2>

      {message && <p style={{ color: 'green' }}>{message}</p>}

      {/* Qol Əlavə Etmə Formu */}
      <form onSubmit={handleAddGoal} style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3>Öz Qolunu Yüklə</h3>
        <input
          type="text"
          placeholder="Qolun təsviri (məs: Əla cərimə zərbəsi)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="url"
          placeholder="Video/Şəkil URL-i (məs: https://...)"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          required
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Qolu Göndər
        </button>
      </form>

      <button onClick={handleSelectWinner} style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#ffc107', border: 'none', cursor: 'pointer' }}>
        🏆 Həftənin Qalibini Seç
      </button>

      {/* Qolların Siyahısı */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {goals.map((goal) => (
          <div key={goal.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            <h4>{goal.description}</h4>
            {goal.videoUrl && (
              <video src={goal.videoUrl} controls style={{ width: '100%', maxHeight: '300px', marginBottom: '10px' }} />
            )}
            <p><strong>Səs sayı:</strong> {goal.voteCount || 0}</p>
            <button onClick={() => handleVote(goal.id)} style={{ padding: '8px 15px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
              👍 Səs Ver
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyGoals;