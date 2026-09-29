import React, { useEffect, useState, useMemo } from 'react';
import { 
  getPendingReservations, 
  getActiveReservations, 
  approveReservation,
  apiFetch
} from '../api/api';

const Admin = ({
  adminSelectedField,
  setAdminSelectedField,
  adminActiveTab = 'reservations',
  setAdminActiveTab,
  editingField,
  setEditingField,
  editValue,
  setEditValue,
  handleSaveEdit,
  timeSlotStatus = {},
  toggleTimeSlot,
  reservations = [],
  waitingList = [],
  handleApproveWaitingUser,
  fields = [],
  setShowAddFieldModal,
  handleDeleteField,
  setActiveNav
}) => {
  const [pendingReservations, setPendingReservations] = useState([]);
  const [activeReservations, setActiveReservations] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);

  // VIDEO YÜKLƏMƏ STATE-LƏRİ
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Mərkəzi Geri Düyməsi İdarəsi
  const handleBackNavigation = () => {
    if (adminSelectedField) {
      setAdminSelectedField(null);
    } else if (setActiveNav) {
      setActiveNav('profile');
    }
  };

  // Seçilmiş stadion dəyişdikdə Data Çəkilməsi
  useEffect(() => {
    if (adminSelectedField?.id) {
      loadFieldData(adminSelectedField.id);
    }
  }, [adminSelectedField]);

  const loadFieldData = async (fieldId) => {
    setLoadingPending(true);
    try {
      const [pendingData, activeData] = await Promise.all([
        getPendingReservations(fieldId).catch(() => []),
        getActiveReservations(fieldId).catch(() => [])
      ]);

      setPendingReservations(Array.isArray(pendingData) ? pendingData : []);
      setActiveReservations(Array.isArray(activeData) ? activeData : []);
    } catch (err) {
      console.error('Data yüklənməsində xəta:', err);
    } finally {
      setLoadingPending(false);
    }
  };

  // Rezervasiyanı təsdiqləmə funksiyası
  const handleApprove = async (reservationId) => {
    try {
      const approvedRes = await approveReservation(reservationId);
      alert('Rezervasiya uğurla təsdiqləndi! 🎉');

      setPendingReservations(prev => prev.filter(item => item.id !== reservationId));
      if (approvedRes) {
        setActiveReservations(prev => [...prev, approvedRes]);
      }

      if (handleApproveWaitingUser) {
        handleApproveWaitingUser(reservationId);
      }
    } catch (err) {
      alert(`Təsdiqləmə xətası: ${err.message || 'Xəta baş verdi'}`);
    }
  };

 // Faylı Base64 text formatına çevirən köməkçi funksiya
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// VIDEO YÜKLƏMƏ SORĞUSU (YALNIZ QALEREYADAN SEÇİMLƏ)
const handleUploadGoalVideo = async (e) => {
  e.preventDefault();

  if (!videoTitle.trim()) {
    alert('Zəhmət olmasa başlığı daxil edin!');
    return;
  }

  if (!videoFile) {
    alert('Zəhmət olmasa qalereyadan bir video seçin!');
    return;
  }

  setUploadingVideo(true);

  try {
    // Qalereyadan seçilən faylı Base64 string-ə çeviririk
    const base64Video = await convertFileToBase64(videoFile);

    const payload = {
      title: videoTitle.trim(),
      videoUrl: base64Video, // Faylın özünü verilənlər bazasına text kimi göndəririk
      fieldId: adminSelectedField?.id || null,
      voteCount: 0
    };

    await apiFetch('/api/goal-videos/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    alert('Qol videosu uğurla əlavə edildi! ⚽🔥');
    setShowVideoModal(false);
    setVideoTitle('');
    setVideoFile(null);
  } catch (err) {
    console.error('Video yükləmə xətası:', err);
    alert('Video əlavə edilərkən xəta baş verdi: ' + (err.message || 'Server xətası'));
  } finally {
    setUploadingVideo(false);
  }
};

  // Bugünkü aktiv rezervasiyaları useMemo ilə hesablayırıq
  const todayReservations = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const sourceList = activeReservations.length > 0 ? activeReservations : reservations;

    return sourceList.filter(r => {
      const isSameField = r.field?.id === adminSelectedField?.id || r.fieldId === adminSelectedField?.id;
      
      let resDateStr = "";
      if (Array.isArray(r.reservationDate)) {
        const [y, m, d] = r.reservationDate;
        resDateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      } else if (r.reservationDate) {
        resDateStr = String(r.reservationDate).split('T')[0];
      }

      return isSameField && (resDateStr === todayStr || !resDateStr) && r.status !== 'CANCELLED';
    });
  }, [activeReservations, reservations, adminSelectedField]);

  const displayWaitingList = pendingReservations.length > 0 ? pendingReservations : waitingList;

  // View 1: Seçilmiş Stadionun Təfərrüatları (Sub-view)
  if (adminSelectedField) {
    return (
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button onClick={handleBackNavigation} style={styles.backBtn}>←</button>
          <h2 style={styles.headerTitle}>{adminSelectedField.name} - İdarəetmə</h2>
        </div>

        <div style={styles.content}>
          {/* Tab Navigation */}
          <div style={styles.tabContainer}>
            <button 
              onClick={() => setAdminActiveTab('info')} 
              style={{ ...styles.tabBtn, ...(adminActiveTab === 'info' ? styles.activeTab : {}) }}
            >
              Məlumatlar
            </button>
            <button 
              onClick={() => setAdminActiveTab('reservations')} 
              style={{ ...styles.tabBtn, ...((adminActiveTab === 'reservations' || adminActiveTab === 'pending') ? styles.activeTab : {}) }}
            >
              Randevu & Gözləmə
            </button>
          </div>

          {/* TAB 1: MƏLUMATLAR */}
          {adminActiveTab === 'info' && (
            <div>
              {/* VIDEO YÜKLƏMƏ DÜYMƏSİ */}
              <button onClick={() => setShowVideoModal(true)} style={styles.uploadVideoBtn}>
                📹 Həftənin Qolu Videosu Yüklə
              </button>

              <h4 style={styles.sectionTitle}>Stadion ayarları</h4>
              
              <FieldEditCard 
                label="Meydança Adı" 
                fieldKey="name" 
                value={adminSelectedField.name} 
                editingField={editingField} 
                setEditingField={setEditingField} 
                editValue={editValue} 
                setEditValue={setEditValue} 
                handleSaveEdit={handleSaveEdit} 
              />

              <FieldEditCard 
                label="Məkan (Ünvan)" 
                fieldKey="address" 
                value={adminSelectedField.address} 
                editingField={editingField} 
                setEditingField={setEditingField} 
                editValue={editValue} 
                setEditValue={setEditValue} 
                handleSaveEdit={handleSaveEdit} 
              />

              <FieldEditCard 
                label="Qiymət (Azn/saat)" 
                fieldKey="pricePerHour" 
                value={`${adminSelectedField.pricePerHour} AZN`} 
                type="number"
                editingField={editingField} 
                setEditingField={setEditingField} 
                editValue={editValue} 
                setEditValue={setEditValue} 
                handleSaveEdit={handleSaveEdit} 
              />

              <h4 style={styles.sectionTitle}>Saat Müsaitliyi (Toxunaraq dəyiş)</h4>
              <p style={styles.subText}>Yaşıl: Boş | Boz: Dolu</p>

              <div style={styles.timeGrid}>
                {Object.keys(timeSlotStatus).map((slot) => {
                  const isAvailable = timeSlotStatus[slot];
                  return (
                    <button
                      key={slot}
                      onClick={() => toggleTimeSlot && toggleTimeSlot(slot)}
                      style={{
                        ...styles.timeSlotBtn,
                        border: isAvailable ? '1px solid #2e7d32' : '1px solid #ccc',
                        backgroundColor: isAvailable ? '#e8f5e9' : '#e0e0e0',
                        color: isAvailable ? '#2e7d32' : '#666',
                      }}
                    >
                      <span>{slot}</span>
                      <span style={{ ...styles.badge, backgroundColor: isAvailable ? '#2e7d32' : '#999' }}>
                        {isAvailable ? 'BOŞ' : 'DOLU'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button onClick={handleBackNavigation} style={styles.fullWidthBtn}>Siyahıya Qayıt</button>
            </div>
          )}

          {/* TAB 2: RANDEVU & GÖZLƏMƏ */}
          {(adminActiveTab === 'reservations' || adminActiveTab === 'pending') && (
            <div>
              <div style={styles.statusBanner}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>🔴</span>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#d84315' }}>Canlı Rejim</div>
                    <div style={{ fontSize: '12px', color: '#bf360c' }}>Stadion Aktivdir</div>
                  </div>
                </div>
                <span style={styles.activeTag}>Aktiv</span>
              </div>

              <h4 style={styles.sectionTitle}>Bugünkü Rezervasiyalar</h4>

              <div style={{ marginBottom: '20px' }}>
                {todayReservations.length > 0 ? (
                  todayReservations.map((res) => (
                    <div key={res.id} style={styles.resCard}>
                      <span style={{ fontSize: '20px' }}>👤</span>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#111' }}>
                          {res.startTime ? `${res.startTime} - ${res.endTime}` : '21:00 - 22:00'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#777' }}>
                          {res.userFullName || (res.user ? (res.user.fullName || res.user.name) : 'İstifadəçi')} • {res.neededPlayers ? `${res.neededPlayers} oyunçu axtarır` : 'Rezerv olunub'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={styles.emptyText}>Bugün üçün hələ təsdiqlənmiş rezervasiya yoxdur.</div>
                )}
              </div>

              <div>
                <h4 style={{ ...styles.sectionTitle, margin: '0 0 4px 0' }}>
                  ⌛ Gözləmə siyahısı ({displayWaitingList.length})
                </h4>
                <p style={styles.subText}>Təsdiq gözləyən rezervasiya sorğuları</p>

                {loadingPending ? (
                  <div style={{ fontSize: '13px', color: '#2e7d32', padding: '10px 0' }}>Yüklənir...</div>
                ) : displayWaitingList.length === 0 ? (
                  <div style={styles.emptyText}>Gözləmədə olan sorğu yoxdur.</div>
                ) : (
                  displayWaitingList.map((item, idx) => (
                    <div key={item.id} style={styles.pendingCard}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={styles.idxBadge}>{idx + 1}</span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#222' }}>
                            {item.userFullName || (item.user ? (item.user.fullName || item.user.name) : (item.customerName || item.name || 'İstifadəçi'))}
                          </div>
                          <div style={{ fontSize: '12px', color: '#888' }}>
                            Saat: {item.startTime ? `${item.startTime} - ${item.endTime}` : (item.timeSlot || item.time)}
                          </div>
                        </div>
                      </div>

                      <button onClick={() => handleApprove(item.id)} style={styles.approveBtn}>
                        ✓
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* QOL VIDEOSU YÜKLƏMƏ MODALI */}
{showVideoModal && (
  <div style={styles.modalOverlay}>
    <div style={styles.modalContent}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#111' }}>⚽ Qol Videosu Əlavə Et</h3>
      <form onSubmit={handleUploadGoalVideo}>
        <div style={{ marginBottom: '12px' }}>
          <label style={styles.label}>Qol Başlığı / Təsviri</label>
          <input 
            type="text" 
            placeholder="məs: Elvin - Mükəmməl uzaq zərbə!" 
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            style={styles.modalInput}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={styles.label}>Qalereyadan Video Seç</label>
          <input 
            type="file" 
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0])}
            style={{ fontSize: '13px', width: '100%' }}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button" 
            onClick={() => setShowVideoModal(false)}
            style={styles.cancelBtn}
          >
            Ləğv et
          </button>
          <button 
            type="submit" 
            disabled={uploadingVideo}
            style={styles.submitBtn}
          >
            {uploadingVideo ? 'Yüklənir...' : 'Yüklə'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
      </div>
    );
  }

  // View 2: Əsas Admin Paneli - Stadion Siyahısı
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={handleBackNavigation} style={styles.backBtn}>←</button>
        <h2 style={styles.headerTitle}>🛠️ Admin Panel</h2>
      </div>

      <div style={styles.content}>
        {/* Ümumi Qol Videosu Yükləmə Düyməsi */}
        <button onClick={() => setShowVideoModal(true)} style={{ ...styles.uploadVideoBtn, marginBottom: '20px' }}>
          📹 Həftənin Qolu Videosunu Əlavə Et
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#222', fontWeight: 'bold' }}>Stadionlarım ({fields.length})</h3>
          <button onClick={() => setShowAddFieldModal(true)} style={styles.addBtn}>+ Əlavə et</button>
        </div>

        <div>
          {fields.map((field) => (
            <div 
              key={field.id} 
              onClick={() => {
                setAdminSelectedField(field);
                if (setAdminActiveTab) setAdminActiveTab('reservations');
              }} 
              style={styles.fieldCard}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img src={field.imageUrl || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100'} alt={field.name} style={styles.fieldImg} />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#111' }}>{field.name}</div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '3px' }}>{field.pricePerHour} ₼/saat • {field.coverType === 'INDOOR' ? 'Qapalı' : 'Açıq'}</div>
                </div>
              </div>
              <button onClick={(e) => handleDeleteField(e, field.id)} style={styles.deleteBtn}>🗑️ Sil</button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL (KÖK PANELDƏN) */}
      {showVideoModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#111' }}>⚽ Qol Videosu Əlavə Et</h3>
            <form onSubmit={handleUploadGoalVideo}>
              <div style={{ marginBottom: '12px' }}>
                <label style={styles.label}>Qol Başlığı / Təsviri</label>
                <input 
                  type="text" 
                  placeholder="məs: Elvin - Mükəmməl uzaq zərbə!" 
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  style={styles.modalInput}
                  required
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={styles.label}>Fayldan Video Seç (MP4)</label>
                <input 
                  type="file" 
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  style={{ fontSize: '12px', width: '100%' }}
                />
              </div>

              <div style={{ textAlign: 'center', margin: '8px 0', color: '#888', fontSize: '12px' }}>və ya</div>

              <div style={{ marginBottom: '15px' }}>
                <label style={styles.label}>Direct Video Linki (URL)</label>
                <input 
                  type="url" 
                  placeholder="https://example.com/video.mp4" 
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  style={styles.modalInput}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowVideoModal(false)}
                  style={styles.cancelBtn}
                >
                  Ləğv et
                </button>
                <button 
                  type="submit" 
                  disabled={uploadingVideo}
                  style={styles.submitBtn}
                >
                  {uploadingVideo ? 'Yüklənir...' : 'Yüklə'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Alt Komponent: Düzəliş Kartı
const FieldEditCard = ({ label, fieldKey, value, type = 'text', editingField, setEditingField, editValue, setEditValue, handleSaveEdit }) => (
  <div style={styles.card}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '11px', color: '#888' }}>{label}</div>
        {editingField === fieldKey ? (
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <input type={type} value={editValue} onChange={(e) => setEditValue(e.target.value)} style={styles.input} />
            <button onClick={() => handleSaveEdit(fieldKey)} style={styles.saveBtn}>Ok</button>
          </div>
        ) : (
          <div style={{ fontWeight: 'bold', fontSize: '15px', color: fieldKey === 'name' ? '#2e7d32' : '#333', marginTop: '2px' }}>{value}</div>
        )}
      </div>
      {editingField !== fieldKey && (
        <span onClick={() => { setEditingField(fieldKey); setEditValue(value.replace(' AZN', '')); }} style={styles.editIcon}>✏️</span>
      )}
    </div>
  </div>
);

// Mərkəzi Stil Obyekti
const styles = {
  container: { backgroundColor: '#f6f6f2', minHeight: '100vh', paddingBottom: '80px', fontFamily: 'sans-serif' },
  header: { backgroundColor: '#f6f6f2', padding: '16px 20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #e5e5dd' },
  backBtn: { border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', marginRight: '15px' },
  headerTitle: { margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111' },
  content: { padding: '16px', maxWidth: '480px', margin: '0 auto' },
  tabContainer: { display: 'flex', borderBottom: '2px solid #e0e0d8', marginBottom: '20px' },
  tabBtn: { flex: 1, padding: '12px', border: 'none', backgroundColor: 'transparent', fontWeight: 'bold', fontSize: '14px', color: '#777', cursor: 'pointer' },
  activeTab: { color: '#2e7d32', borderBottom: '3px solid #2e7d32' },
  sectionTitle: { margin: '0 0 12px 0', fontSize: '15px', color: '#333', fontWeight: 'bold' },
  subText: { margin: '0 0 12px 0', fontSize: '12px', color: '#777' },
  card: { backgroundColor: '#ffffff', padding: '16px', borderRadius: '16px', marginBottom: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' },
  input: { padding: '6px 10px', borderRadius: '8px', border: '1px solid #2e7d32', width: '100%' },
  saveBtn: { backgroundColor: '#2e7d32', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  editIcon: { cursor: 'pointer', fontSize: '18px', padding: '6px' },
  timeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '25px' },
  timeSlotBtn: { padding: '12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  badge: { fontSize: '10px', padding: '2px 6px', borderRadius: '6px', color: '#fff' },
  fullWidthBtn: { width: '100%', padding: '14px', backgroundColor: '#e8f5e9', color: '#2e7d32', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer' },
  statusBanner: { backgroundColor: '#fbe9e7', border: '1px solid #ffccbc', padding: '14px 16px', borderRadius: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  activeTag: { fontSize: '12px', fontWeight: 'bold', backgroundColor: '#ffab91', color: '#d84315', padding: '4px 10px', borderRadius: '10px' },
  resCard: { backgroundColor: '#ffffff', padding: '14px 16px', borderRadius: '16px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' },
  pendingCard: { backgroundColor: '#ffffff', padding: '14px 16px', borderRadius: '16px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' },
  idxBadge: { backgroundColor: '#fff3e0', color: '#e65100', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px', fontWeight: 'bold' },
  approveBtn: { backgroundColor: '#4caf50', color: '#fff', border: 'none', width: '36px', height: '36px', borderRadius: '12px', fontSize: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 6px rgba(76,175,80,0.3)' },
  emptyText: { fontSize: '13px', color: '#888', fontStyle: 'italic', padding: '10px 0' },
  addBtn: { backgroundColor: '#e8f5e9', color: '#2e7d32', border: 'none', padding: '8px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' },
  fieldCard: { backgroundColor: '#ffffff', padding: '14px 16px', borderRadius: '16px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', cursor: 'pointer' },
  fieldImg: { width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' },
  deleteBtn: { backgroundColor: '#fce8e6', color: '#d93025', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
  
  // Video Yükləmə Stilləri
  uploadVideoBtn: { width: '100%', padding: '12px', backgroundColor: '#1b5e20', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', marginBottom: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(27,94,32,0.2)' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' },
  modalContent: { backgroundColor: '#ffffff', borderRadius: '20px', padding: '20px', width: '100%', maxWidth: '380px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
  label: { fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '4px' },
  modalInput: { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #ccc', fontSize: '13px', boxSizing: 'border-box' },
  cancelBtn: { flex: 1, padding: '10px', backgroundColor: '#f5f5f5', color: '#666', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  submitBtn: { flex: 1, padding: '10px', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }
};

export default Admin;