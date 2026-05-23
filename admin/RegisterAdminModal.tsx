import { useState } from 'react';
import { supabase } from '../src/lib/supabaseClient';
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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setIsLoading(true);

    if (!email.trim() || !password || !confirmPassword) {
      setErrorText('/// COMPLETE TODOS LOS CAMPOS ///');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorText('/// LAS CONTRASEÑAS NO COINCIDEN ///');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorText('/// LA CLAVE DEBE TENER AL MENOS 6 CARACTERES ///');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Intentar registrar en Supabase (En vivo)
      const { error } = await supabase
        .from('administrators')
        .insert([{
          email: email.toLowerCase().trim(),
          password: password,
          must_change_password: true
        }]);

      if (error) {
        if (error.code === '23505') {
          setErrorText('/// ESTE CORREO YA ESTÁ REGISTRADO EN SUPABASE ///');
        } else {
          setErrorText(`/// ERROR EN LA NUBE: ${error.message} ///`);
        }
        setIsLoading(false);
        return;
      }

      // 2. Guardar en localStorage como robustez/fallback
      const stored = localStorage.getItem('kennedy_admins');
      let admins = [];
      if (stored) {
        try {
          admins = JSON.parse(stored);
        } catch (_err) {
          admins = [];
        }
      }
      admins.push({ email: email.toLowerCase().trim(), password, mustChangePassword: true });
      localStorage.setItem('kennedy_admins', JSON.stringify(admins));

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      setErrorText('/// FALLA DE CONEXIÓN CON EL SERVIDOR DE SUPABASE ///');
    } finally {
      setIsLoading(false);
    }
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
                disabled={isLoading}
              />

              <input
                type="password"
                className="auth-input"
                placeholder="[ CLAVE DE TELEGRAMA ]"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorText(''); }}
                required
                disabled={isLoading}
              />

              <input
                type="password"
                className="auth-input"
                placeholder="[ CONFIRMAR CLAVE ]"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrorText(''); }}
                required
                disabled={isLoading}
              />

              {errorText && <p className="auth-error-text">{errorText}</p>}

              <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                {isLoading ? 'ENVIANDO CREDENCIAL...' : 'REGISTRAR NUEVO ACCESO'}
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
