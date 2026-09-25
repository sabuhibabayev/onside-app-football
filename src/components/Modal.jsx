import React from 'react';

const Modal = ({ showAddFieldModal, setShowAddFieldModal, fieldCreatedSuccess, setFieldCreatedSuccess, newField, setNewField, availableAmenities, toggleAmenity, handleAddFieldSubmit, loading, setActiveNav }) => {
  if (!showAddFieldModal) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '20px', width: '100%', maxWidth: '420px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
        {!fieldCreatedSuccess ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>🏟️ Yeni Meydança Əlavə Et</h3>
              <button onClick={() => setShowAddFieldModal(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAddFieldSubmit}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '12px', color: '#666' }}>Meydança Adı:</label>
                <input type="text" required placeholder="Məs: Əli Arena" value={newField.name} onChange={(e) => setNewField({ ...newField, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '12px', color: '#666' }}>Ünvan:</label>
                <input type="text" required placeholder="Məs: Bakı, Nərimanov" value={newField.address} onChange={(e) => setNewField({ ...newField, address: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '12px', color: '#666' }}>Şəkil URL (Link):</label>
                <input type="url" placeholder="https://images.unsplash.com/..." value={newField.imageUrl} onChange={(e) => setNewField({ ...newField, imageUrl: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '12px', color: '#666' }}>Saatlıq Qiymət (AZN):</label>
                <input type="number" required placeholder="Məs: 40" value={newField.pricePerHour} onChange={(e) => setNewField({ ...newField, pricePerHour: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '12px', color: '#666' }}>Növü:</label>
                <select value={newField.coverType} onChange={(e) => setNewField({ ...newField, coverType: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}>
                  <option value="ARTIFICIAL">☀️ Açıq (Süni Ot)</option>
                  <option value="NATURAL">🌱 Açıq (Təbii Ot)</option>
                  <option value="INDOOR">🔒 Qapalı</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '8px' }}>Əlavə Xidmətlər:</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {availableAmenities.map((item) => {
                    const isSelected = newField.amenities.includes(item.id);
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => toggleAmenity(item.id)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid #2e7d32' : '1px solid #ccc',
                          backgroundColor: isSelected ? '#e8f5e9' : '#fff',
                          color: isSelected ? '#2e7d32' : '#666',
                          fontSize: '12px',
                          fontWeight: isSelected ? 'bold' : 'normal',
                          cursor: 'pointer'
                        }}
                      >
                        {isSelected ? '✓ ' : ''}{item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                {loading ? 'Əlavə olunur...' : 'Stadionu Yadda Saxla'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>🎉</div>
            <h2 style={{ color: '#2e7d32', margin: '0 0 8px 0', fontSize: '20px' }}>Meydança Uğurla Əlavə Olundu!</h2>
            <p style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>Yeni stadionunuz artıq bazada saxlanıldı.</p>

            <button
              onClick={() => {
                setFieldCreatedSuccess(false);
                setShowAddFieldModal(false);
                setNewField({
                  name: '',
                  address: '',
                  pricePerHour: '',
                  fieldSize: '40x20',
                  maxPlayers: '12',
                  coverType: 'ARTIFICIAL',
                  imageUrl: '',
                  amenities: []
                });
                setActiveNav('home');
              }}
              style={{ width: '100%', padding: '12px', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Ana Səhifəyə Keç Və Bax
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;