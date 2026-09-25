import React from 'react';

const Home = ({ searchTerm, setSearchTerm, filterType, setFilterType, filteredFields = [], setSelectedField, userData }) => {
  
  // 🎯 DƏQİQ FİLTRLƏMƏ MƏNTİQİ
  const displayedFields = filteredFields.filter((field) => {
    // 1. Axtarış filtri (Ad və ya Ünvana görə)
    const matchesSearch =
      !searchTerm ||
      field.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.address?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // coverType dəyərini təmizləyirik
    const cover = String(field.coverType || '').toUpperCase().trim();

    // Qapalı stadion hesab edilənlər:
    const isIndoorField = cover === 'INDOOR' || cover === 'QAPALI';

    // 2. Qapalı filtri seçilibsə
    if (filterType === 'INDOOR') {
      return isIndoorField;
    }

    // 3. Açıq filtri seçilibsə (Qapalı olmayan HƏR ŞEY - OUTDOOR, ACIQ, ARTIFICIAL və s.)
    if (filterType === 'OUTDOOR') {
      return !isIndoorField;
    }

    // 4. Hamısı (ALL)
    return true;
  });

  return (
    <div style={{ backgroundColor: 'transparent', minHeight: '100vh', paddingBottom: '70px', fontFamily: 'sans-serif' }}>
      <div style={{ padding: '20px 16px 14px 16px', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          
          {/* 👋 SALAMLAMA VƏ BAŞLIQ */}
          <div>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              backgroundColor: '#e8f5e9', 
              color: '#2e7d32', 
              padding: '4px 10px', 
              borderRadius: '20px', 
              fontSize: '12px', 
              fontWeight: '700',
              marginBottom: '6px'
            }}>
              <span>👋</span> Salam, Xoş gəldiniz!
            </div>
            <h2 style={{ 
              margin: 0, 
              fontSize: '22px', 
              fontWeight: '800', 
              color: '#0f172a',
              letterSpacing: '-0.5px',
              lineHeight: '1.2'
            }}>
              Stadion tap <span style={{ color: '#2e7d32' }}>&</span> rezerv et
            </h2>
          </div>
          
          {/* ⚽ LOGO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              backgroundColor: '#2e7d32',
              color: '#ffffff',
              width: '38px',
              height: '38px',
              borderRadius: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '19px',
              boxShadow: '0 4px 10px rgba(46, 125, 50, 0.25)',
              transform: 'rotate(-4deg)'
            }}>
              ⚽
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ 
                fontSize: '22px', 
                fontWeight: '900', 
                letterSpacing: '-0.5px', 
                lineHeight: '1',
                color: '#0f172a'
              }}>
                ON<span style={{ color: '#2e7d32' }}>side</span>
              </span>
            </div>
          </div>
        </div>

        {/* 🔍 AXTARIŞ */}
        <div style={{ position: 'relative', marginBottom: '15px' }}>
          <input 
            type="text" 
            placeholder="🔍 Stadion axtar..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #eee', backgroundColor: '#f5f5f5', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
          />
        </div>

        {/* 🔘 FİLTR DÜYMƏLƏRİ */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button"
            onClick={() => setFilterType('ALL')} 
            style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', backgroundColor: filterType === 'ALL' ? '#4caf50' : '#e8f5e9', color: filterType === 'ALL' ? '#fff' : '#2e7d32', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Hamısı
          </button>
          <button 
            type="button"
            onClick={() => setFilterType('OUTDOOR')} 
            style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', backgroundColor: filterType === 'OUTDOOR' ? '#4caf50' : '#f0f0f0', color: filterType === 'OUTDOOR' ? '#fff' : '#666', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Açıq
          </button>
          <button 
            type="button"
            onClick={() => setFilterType('INDOOR')} 
            style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', backgroundColor: filterType === 'INDOOR' ? '#4caf50' : '#f0f0f0', color: filterType === 'INDOOR' ? '#fff' : '#666', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Qapalı
          </button>
        </div>
      </div>

      {/* 🏟️ KARTLARIN SİYAHISI */}
      <div style={{ padding: '16px', maxWidth: '480px', margin: '0 auto' }}>
        {displayedFields.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
            Axtarışa uyğun stadion tapılmadı.
          </div>
        ) : (
          displayedFields.map((field) => {
            const isPremium = userData?.isPremium;
            const discount = userData?.discountPercentage || 15;
            const discountedPrice = isPremium ? (field.pricePerHour * (1 - discount / 100)).toFixed(1) : field.pricePerHour;

            const cover = String(field.coverType || '').toUpperCase().trim();
            const isIndoor = cover === 'INDOOR' || cover === 'QAPALI';

            return (
              <div key={field.id} onClick={() => setSelectedField(field)} style={{ backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', cursor: 'pointer' }}>
                <div style={{ position: 'relative', height: '180px' }}>
                  <img 
                    src={field.imageUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500'} 
                    alt={field.name} 
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500'; }} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  
                  <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', color: '#333' }}>
                    {isIndoor ? '🔒 Qapalı' : '☀️ Açıq'}
                  </div>
                  
                  <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#fff', padding: '6px 12px', borderRadius: '16px', fontSize: '14px', fontWeight: 'bold', color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isPremium ? (
                      <>
                        <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px' }}>{field.pricePerHour} ₼</span>
                        <span>{discountedPrice} ₼ / saat</span>
                      </>
                    ) : (
                      <span>{field.pricePerHour} ₼ / saat</span>
                    )}
                  </div>
                </div>

                <div style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#222' }}>{field.name}</h3>
                    
                    <span style={{ fontSize: '13px', color: '#ffb300', fontWeight: 'bold' }}>
                      ★ {field.rating ? Number(field.rating).toFixed(1) : '0.0'}
                      <span style={{ fontSize: '11px', color: '#888', fontWeight: 'normal' }}>
                        ({field.voteCount || 0})
                      </span>
                    </span>
                  </div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#777' }}>📍 {field.address}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Home;