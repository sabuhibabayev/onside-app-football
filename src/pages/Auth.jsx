import React, { useState } from 'react';
import { loginUser, registerUser } from '../api/api';

const Auth = ({ onAuthSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form məlumatlarını mərkəzləşdirilmiş state-də saxlayırıq
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'USER',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLoginView) {
        // Daxilolma sorğusu
        const data = await loginUser({
          email: formData.email,
          password: formData.password,
        });

        if (data.token) {
          localStorage.setItem('token', data.token);
          if (data.role) localStorage.setItem('role', data.role);
          
          // Prop olmasa belə səhifəni yeniləyərək daxil edir
          if (onAuthSuccess) {
            onAuthSuccess(data);
          } else {
            window.location.reload();
          }
        }
      } else {
        // Qeydiyyat sorğusu
        await registerUser(formData);
        alert('Qeydiyyat uğurla tamamlandı! İndi daxil ola bilərsiniz.');
        setIsLoginView(true);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Xəta baş verdi. Şifrə və ya email yanlış ola bilər.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>ONside</h1>
          <p style={styles.subtitle}>
            {isLoginView ? 'Hesabınıza daxil olun' : 'Yeni hesab yaradın'}
          </p>
        </div>

        {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          {!isLoginView && (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Ad və Soyad</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Məs: Əli Əliyev"
                  value={formData.fullName}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Telefon Nömrəsi</label>
                <input
                  type="text"
                  name="phone"
                  required
                  placeholder="Məs: +994501234567"
                  value={formData.phone}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Hesab Növü</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="USER">Müştəri (Oyunçu)</option>
                  <option value="OWNER">Stadion Sahibi</option>
                </select>
              </div>
            </>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              required
              placeholder="example@mail.com"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Şifrə</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Yüklənir...' : isLoginView ? 'Daxil ol' : 'Qeydiyyatdan keç'}
          </button>
        </form>

        <div style={styles.footer}>
          <button
            type="button"
            onClick={() => {
              setErrorMsg('');
              setIsLoginView(!isLoginView);
            }}
            style={styles.switchBtn}
          >
            {isLoginView
              ? 'Hesabınız yoxdur? Qeydiyyatdan keçin'
              : 'Artıq hesabınız var? Daxil olun'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#f6f6f2',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    fontFamily: 'sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '32px 24px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
  },
  header: { textAlign: 'center', marginBottom: '24px' },
  title: { color: '#2e7d32', margin: '0 0 8px 0', fontSize: '28px', fontWeight: 'bold' },
  subtitle: { color: '#666', margin: 0, fontSize: '14px' },
  errorBox: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    marginBottom: '16px',
    textAlign: 'center',
  },
  inputGroup: { marginBottom: '14px' },
  label: { fontSize: '12px', color: '#666', fontWeight: 'bold', display: 'block', marginBottom: '6px' },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #ddd',
    boxSizing: 'border-box',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #ddd',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#2e7d32',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '15px',
    cursor: 'pointer',
    marginTop: '6px',
  },
  footer: { textAlign: 'center', marginTop: '20px' },
  switchBtn: { background: 'none', border: 'none', color: '#2e7d32', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' },
};

export default Auth;