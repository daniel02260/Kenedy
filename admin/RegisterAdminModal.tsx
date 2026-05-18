import { useState } from 'react';
import './AdminAuthModal.css';

interface RegisterAdminModalProps {
  onClose: () => void;
}

const RegisterAdminModal = ({ onClose }: RegisterAdminModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorText, setErrorText] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!email.trim() || !password || !confirmPassword) {
      setErrorText('/// COMPLETE TODOS LOS CAMPOS ///');
      return;
    }

    if (password !== confirmPassword) {
      setErrorText('/// LAS CONTRASEÑAS NO COINCIDEN ///');
      return;
    }

    if (password.length < 6) {
      setErrorText('/// LA CLAVE DEBE TENER AL MENOS 6 CARACTERES ///');
      return;
    }

    // Obtener administradores actuales de localStorage
    const stored = localStorage.getItem('kennedy_admins');
    let admins = [];
    if (stored) {
      try {
        admins = JSON.parse(stored);
      } catch (err) {
        admins = [];
      }
    }

    // Verificar si el correo ya está registrado
    const exists = admins.some((admin: any) => admin.email.toLowerCase() === email.toLowerCase());
    if (exists || email.toLowerCase() === 'admin@explorakennedy.com') {
      setErrorText('/// ESTE CORREO YA ESTÁ REGISTRADO ///');
      return;
    }

    // Agregar nuevo administrador (con bandera para forzar cambio de contraseña)
    admins.push({ email: email.toLowerCase(), password, mustChangePassword: true });
    localStorage.setItem('kennedy_admins', JSON.stringify(admins));

    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="admin-auth-overlay" onClick={onClose}>
      <div className="admin-auth-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose} title="Cerrar">&times;</button>

        <div className="auth-header">
          <div className="auth-decoration-line"></div>
          <h2 className="auth-title">REGISTRO DE ADMIN</h2>
          <div className="auth-decoration-line"></div>
        </div>

        {success ? (
          <div style={{ padding: '30px 0' }}>
            <span style={{ fontSize: '3rem' }}>📜</span>
            <p className="auth-text" style={{ color: '#d1562b', fontWeight: 'bold', display: 'block', marginTop: '15px' }}>
              /// ACCESO AUTORIZADO Y REGISTRADO ///
            </p>
            <p style={{ fontFamily: 'Courier New', color: '#4a3f38', fontSize: '0.9rem' }}>
              El nuevo administrador ha sido incorporado al sistema de control.
            </p>
          </div>
        ) : (
          <>
            <p className="auth-text">
              Ingrese el correo electrónico oficial y asigne la clave de telegrama para el nuevo moderador.
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
              <input
                type="email"
                className="auth-input"
                placeholder="[ CORREO DEL NUEVO ADMIN ]"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorText(''); }}
                autoFocus
                required
              />

              <input
                type="password"
                className="auth-input"
                placeholder="[ CLAVE DE TELEGRAMA ]"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorText(''); }}
                required
              />

              <input
                type="password"
                className="auth-input"
                placeholder="[ CONFIRMAR CLAVE ]"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrorText(''); }}
                required
              />

              {errorText && <p className="auth-error-text">{errorText}</p>}

              <button type="submit" className="auth-submit-btn">
                REGISTRAR NUEVO ACCESO
              </button>
            </form>
          </>
        )}

        <div className="auth-stamp">SELLO REGISTRO</div>
      </div>
    </div>
  );
};

export default RegisterAdminModal;
