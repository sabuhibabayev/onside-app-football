import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import Goals from './pages/Goals';
import History from './pages/History';
import Players from './pages/Players';
import { apiFetch } from './api/api';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Home from './pages/Home';
import FieldDetail from './pages/FieldDetail';
import Modal from './components/Modal';
import Auth from './pages/Auth';
import { useAuth } from './context/AuthContext';

function App() {
  const { token, user, logout } = useAuth();

  const [fields, setFields] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedField, setSelectedField] = useState(null);
  const [activeNav, setActiveNav] = useState('home');

  // 🌙 DARK MODE İDARƏSİ
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [myOwnerFields, setMyOwnerFields] = useState([]);

  // ADMİN İDARƏETMƏ STATE-LƏRİ
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [adminSelectedField, setAdminSelectedField] = useState(null);
  const [adminActiveTab, setAdminActiveTab] = useState('info');
  const [fieldCreatedSuccess, setFieldCreatedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // REDAKTƏ STATE-LƏRİ
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  // REAL BACKEND STATE-LƏRİ
  const [waitingList, setWaitingList] = useState([]);
  const [lookingForPlayersList, setLookingForPlayersList] = useState([]);
  const [userHistoryList, setUserHistoryList] = useState([]); 
  const [goalsList, setGoalsList] = useState([]);

  const mockGoals = [
    { id: 1, title: 'Həftənin Qolu: Akrobatik Vuruş 🚀', author: 'Elvin M.', votes: 42, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 2, title: 'Uzaq Məsafədən Məsafəli Şut ⚽🔥', author: 'Səbuhi B.', votes: 29, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }
  ];

  const fetchGoals = () => {
    const activeToken = localStorage.getItem('token');
    fetch('http://localhost:8080/api/goals', {
      headers: { 'Authorization': `Bearer ${activeToken}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setGoalsList(data);
        else setGoalsList(mockGoals);
      })
      .catch(() => setGoalsList(mockGoals));
  };

  // REZERVASİYA FORMASI STATE-LƏRİ
  const [resDate, setResDate] = useState('2026-08-15');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isLooking, setIsLooking] = useState(false);
  const [neededCount, setNeededCount] = useState('');
  const [desc, setDesc] = useState('');

  // SAAT MÜSAİTLİYİ
  const [timeSlotStatus, setTimeSlotStatus] = useState({
    '18:00 - 19:00': true,
    '19:00 - 20:00': true,
    '20:00 - 21:00': false,
    '21:00 - 22:00': false,
    '22:00 - 23:00': true,
    '23:00 - 00:00': true
  });

  const [newField, setNewField] = useState({
    name: '',
    address: '',
    pricePerHour: '',
    fieldSize: '40x20',
    maxPlayers: '12',
    coverType: 'ARTIFICIAL',
    imageUrl: '',
    amenities: []
  });

  const availableAmenities = [
    { id: 'DUST', label: '🚿 Duş' },
    { id: 'ISIKLANDIRMA', label: '💡 İşıqlandırma' },
    { id: 'PARKING', label: '🅿️ Avtodayanacaq' },
    { id: 'KAFE', label: '☕ Kafe' }
  ];

  // 1️⃣ BÜTÜN FETCH FUNKSİYALARI

  const fetchFields = () => {
    apiFetch('/api/fields?size=100&pageSize=100')
      .then((data) => {
        if (data && data.content) setFields(data.content);
        else if (Array.isArray(data)) setFields(data);
      })
      .catch((err) => console.error('Stadionlar çəkilərkən xəta:', err));
  };

  const fetchReservations = () => {
    fetch('http://localhost:8080/api/reservations')
      .then((res) => res.json())
      .then((data) => setReservations(Array.isArray(data) ? data : data.content || []))
      .catch((err) => console.error('Xəta:', err));
  };

  const fetchPendingReservations = (fieldId) => {
    if (!fieldId) return;
    apiFetch(`/api/reservations/field/${fieldId}/pending`)
      .then((data) => {
        if (Array.isArray(data)) setWaitingList(data);
        else setWaitingList([]);
      })
      .catch(() => setWaitingList([]));
  };

  const fetchPlayersSearch = () => {
    apiFetch('/api/reservations/looking-for-players')
      .then((data) => {
        if (Array.isArray(data)) setLookingForPlayersList(data);
      })
      .catch((err) => console.error('Oyunçu axtarışı xətası:', err));
  };

  const fetchUserHistory = () => {
    apiFetch('/api/reservations/my-reservations')
      .then((data) => {
        if (Array.isArray(data)) setUserHistoryList(data);
        else setUserHistoryList(reservations);
      })
      .catch(() => setUserHistoryList(reservations));
  };

  const handleCreateReservation = () => {
    if (!selectedSlot) {
      alert('Zəhmət olmasa saat aralığı seçin!');
      return;
    }

    if (!token) {
      alert('Zəhmət olmasa hesaba daxil olun!');
      return;
    }

    const payload = {
      fieldId: Number(selectedField.id),
      reservationDate: resDate,
      startTime: selectedSlot.start,
      endTime: selectedSlot.end,
      isLookingForPlayers: Boolean(isLooking),
      neededPlayers: isLooking ? parseInt(neededCount || 0, 10) : 0,
      description: isLooking ? desc : ''
    };

    fetch('http://localhost:8080/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || 'Server xətası');
        }
        const text = await res.text();
        return text ? JSON.parse(text) : {};
      })
      .then(() => {
        alert('Rezervasiya uğurla yaradıldı! 🎉');
        setSelectedField(null);
      })
      .catch((err) => {
        console.error('Rezervasiya xətası:', err);
        alert('Rezervasiya yaradılarkən xəta baş verdi: ' + err.message);
      });
  };

  // 2️⃣ USEEFFECT BLOKLARI

  useEffect(() => {
    if (token) {
      fetchFields();
      fetchReservations();
    }
  }, [token]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (adminSelectedField) {
      fetchPendingReservations(adminSelectedField.id);
    }
  }, [adminSelectedField]);

  useEffect(() => {
    if (activeNav === 'players') fetchPlayersSearch();
    if (activeNav === 'history') fetchUserHistory();
    if (activeNav === 'goals') fetchGoals();
  }, [activeNav]);

  const handleApproveWaitingUser = (id) => {
    const activeToken = localStorage.getItem('token');
    const approvedItem = waitingList.find((item) => item.id === id);

    fetch(`http://localhost:8080/api/reservations/${id}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${activeToken}` }
    })
      .then((res) => {
        if (res.ok) {
          alert('Müraciət uğurla təsdiqləndi!');
          setWaitingList((prev) => prev.filter((item) => item.id !== id));
          if (approvedItem) {
            setReservations((prev) => [...prev, { ...approvedItem, status: 'APPROVED' }]);
          }
          if (adminSelectedField) {
            fetchPendingReservations(adminSelectedField.id);
          }
        }
      })
      .catch(() => {
        setWaitingList((prev) => prev.filter((item) => item.id !== id));
      });
  };

  const handleAddFieldSubmit = (e) => {
    e.preventDefault();

    const parsedPrice = parseFloat(newField.pricePerHour);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Zəhmət olmasa düzgün saatlıq qiymət daxil edin!');
      return;
    }

    if (!newField.name || !newField.name.trim()) {
      alert('Zəhmət olmasa meydançanın adını daxil edin!');
      return;
    }
    if (!newField.address || !newField.address.trim()) {
      alert('Zəhmət olmasa ünvanı daxil edin!');
      return;
    }

    setLoading(true);

    const safeAmenities = Array.isArray(newField.amenities) ? newField.amenities : [];

    const payload = {
      name: newField.name.trim(),
      address: newField.address.trim(),
      pricePerHour: parsedPrice,
      coverType: newField.coverType || 'ACIQ',
      hasLighting: safeAmenities.includes('ISIKLANDIRMA') || safeAmenities.includes('İşıqlandırma'),
      hasShower: safeAmenities.includes('DUST') || safeAmenities.includes('Duş'),
      fieldSize: newField.fieldSize || '40x20',
      maxPlayers: parseInt(newField.maxPlayers, 10) || 12,
      imageUrl: (newField.imageUrl && newField.imageUrl.trim()) 
        ? newField.imageUrl.trim() 
        : 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500'
    };

    fetch('http://localhost:8080/api/fields', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || 'Xəta baş verdi');
        }
        const text = await res.text();
        return text ? JSON.parse(text) : {};
      })
      .then(() => {
        setLoading(false);
        setFieldCreatedSuccess(true);
        if (typeof fetchFields === 'function') {
          fetchFields();
        }
      })
      .catch((err) => {
        setLoading(false);
        alert('Xəta baş verdi: ' + err.message);
      });
  };

  const handleSaveEdit = (fieldKey) => {
    if (!editValue.trim()) return;
    const updatedField = { ...adminSelectedField, [fieldKey]: editValue };
    setAdminSelectedField(updatedField);
    setFields((prev) => prev.map((f) => (f.id === updatedField.id ? updatedField : f)));
    setEditingField(null);
  };

  const toggleTimeSlot = (slot) => {
    setTimeSlotStatus((prev) => ({
      ...prev,
      [slot]: !prev[slot]
    }));
  };

  const toggleAmenity = (amenityId) => {
    setNewField((prev) => {
      const exists = prev.amenities.includes(amenityId);
      return exists
        ? { ...prev, amenities: prev.amenities.filter((a) => a !== amenityId) }
        : { ...prev, amenities: [...prev.amenities, amenityId] };
    });
  };

  const handleDeleteField = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Bu stadionu silməyə əminsiniz?')) {
      setFields((prev) => prev.filter((f) => f.id !== id));
    }
  };

  // Filtrləmə məntiqi
  const filteredFields = fields.filter((field) => {
  const matchesSearch =
    !searchTerm ||
    field.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.address?.toLowerCase().includes(searchTerm.toLowerCase());

  const cover = String(field.coverType || '').toUpperCase();

  if (filterType === 'OUTDOOR') {
    return matchesSearch && cover !== 'INDOOR' && cover !== 'QAPALI';
  }
  if (filterType === 'INDOOR') {
    return matchesSearch && (cover === 'INDOOR' || cover === 'QAPALI');
  }

  return matchesSearch;
});

  // LOGIN EKRANI
  if (!token) {
    return <Auth />;
  }

  // 📜 KEÇMİŞ REZERVASİYALAR SƏHİFƏSİ
  if (activeNav === 'history') {
    return (
      <>
        <History userHistoryList={userHistoryList} setActiveNav={setActiveNav} />
        <BottomNav activeNav={activeNav} setActiveNav={setActiveNav} setAdminSelectedField={setAdminSelectedField} />
      </>
    );
  }

  // 👥 OYUNÇULAR SƏHİFƏSİ
  if (activeNav === 'players') {
    return (
      <>
        <Players lookingForPlayersList={lookingForPlayersList} />
        <BottomNav activeNav={activeNav} setActiveNav={setActiveNav} setAdminSelectedField={setAdminSelectedField} />
      </>
    );
  }

  // ⚽ QOLLAR SƏHİFƏSİ
  if (activeNav === 'goals') {
    return (
      <>
        <Goals goalsList={goalsList} fetchGoals={fetchGoals} />
        <BottomNav activeNav={activeNav} setActiveNav={setActiveNav} setAdminSelectedField={setAdminSelectedField} />
      </>
    );
  }

  // ADMİN PANEL SƏHİFƏSİ
  if (activeNav === 'admin') {
    return (
      <>
        <Admin
          userData={user}
          adminSelectedField={adminSelectedField}
          setAdminSelectedField={setAdminSelectedField}
          adminActiveTab={adminActiveTab}
          setAdminActiveTab={setAdminActiveTab}
          editingField={editingField}
          setEditingField={setEditingField}
          editValue={editValue}
          setEditValue={setEditValue}
          handleSaveEdit={handleSaveEdit}
          timeSlotStatus={timeSlotStatus}
          toggleTimeSlot={toggleTimeSlot}
          reservations={reservations}
          waitingList={waitingList}
          handleApproveWaitingUser={handleApproveWaitingUser}
          fields={['OWNER', 'ROLE_OWNER'].includes(user?.role) ? myOwnerFields : fields}
          setShowAddFieldModal={setShowAddFieldModal}
          handleDeleteField={handleDeleteField}
        />
        <BottomNav activeNav={activeNav} setActiveNav={setActiveNav} setAdminSelectedField={setAdminSelectedField} />
        <Modal
          showAddFieldModal={showAddFieldModal}
          setShowAddFieldModal={setShowAddFieldModal}
          fieldCreatedSuccess={fieldCreatedSuccess}
          setFieldCreatedSuccess={setFieldCreatedSuccess}
          newField={newField}
          setNewField={setNewField}
          availableAmenities={availableAmenities}
          toggleAmenity={toggleAmenity}
          handleAddFieldSubmit={handleAddFieldSubmit}
          loading={loading}
          setActiveNav={setActiveNav}
        />
      </>
    );
  }

  // DETAL VƏ REZERVASİYA EKRANI
  if (selectedField) {
    return (
      <FieldDetail
        selectedField={selectedField}
        setSelectedField={setSelectedField}
        resDate={resDate}
        setResDate={setResDate}
        selectedSlot={selectedSlot}
        setSelectedSlot={setSelectedSlot}
        isLooking={isLooking}
        setIsLooking={setIsLooking}
        neededCount={neededCount}
        setNeededCount={setNeededCount}
        desc={desc}
        setDesc={setDesc}
        handleCreateReservation={handleCreateReservation}
      />
    );
  }

  // PROFİL SƏHİFƏSİ
  if (activeNav === 'profile') {
    return (
      <>
        <Profile 
          userData={user}
          fieldsCount={['OWNER', 'ROLE_OWNER'].includes(user?.role) ? myOwnerFields.length : fields.length}
          reservationsCount={reservations.length}
          setActiveNav={setActiveNav}
          handleLogout={logout}
          showAddFieldModal={showAddFieldModal}
          setShowAddFieldModal={setShowAddFieldModal}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          hoveredIndex={hoveredIndex}
          setHoveredIndex={setHoveredIndex}
        />
        <BottomNav activeNav={activeNav} setActiveNav={setActiveNav} setAdminSelectedField={setAdminSelectedField} />
        <Modal
          showAddFieldModal={showAddFieldModal}
          setShowAddFieldModal={setShowAddFieldModal}
          fieldCreatedSuccess={fieldCreatedSuccess}
          setFieldCreatedSuccess={setFieldCreatedSuccess}
          newField={newField}
          setNewField={setNewField}
          availableAmenities={availableAmenities}
          toggleAmenity={toggleAmenity}
          handleAddFieldSubmit={handleAddFieldSubmit}
          loading={loading}
          setActiveNav={setActiveNav}
        />
      </>
    );
  }

  // HOME (ANA SƏHİFƏ)
  return (
    <>
      <Home
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
  filterType={filterType}
  setFilterType={setFilterType}
  filteredFields={fields} // Bütün stadionlar massivi Home-a ötürülür
  setSelectedField={setSelectedField}
  userData={user}
/>
      <BottomNav activeNav={activeNav} setActiveNav={setActiveNav} setAdminSelectedField={setAdminSelectedField} />
    </>
  );
}

export default App;