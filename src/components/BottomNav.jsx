import React from 'react';

const BottomNav = ({ activeNav, setActiveNav, setAdminSelectedField }) => {
  const navItems = [
    { id: 'home', label: 'Ana səhifə', icon: '🏠' },
    { id: 'goals', label: 'Qollar', icon: '⚽' },
    { id: 'players', label: 'Oyunçular', icon: '👥' },
    { id: 'profile', label: 'Profil', icon: '👤' }
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      backgroundColor: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(0,0,0,0.06)',
      padding: '8px 16px 12px 16px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 1000,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
    }}>
      {navItems.map((item) => {
        const isActive = activeNav === item.id || (item.id === 'profile' && activeNav === 'history');
        return (
          <div
            key={item.id}
            onClick={() => {
              setActiveNav(item.id);
              if (setAdminSelectedField) setAdminSelectedField(null);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: isActive ? '8px 16px' : '8px 12px',
              borderRadius: '24px',
              backgroundColor: isActive ? '#e8f5e9' : 'transparent',
              color: isActive ? '#2e7d32' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isActive ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            <span style={{ fontSize: '18px', filter: isActive ? 'drop-shadow(0 2px 4px rgba(46,125,50,0.3))' : 'none' }}>
              {item.icon}
            </span>
            {isActive && (
              <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '-0.2px' }}>
                {item.label}
              </span>
              
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BottomNav;