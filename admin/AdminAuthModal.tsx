import { useState } from 'react';
import './AdminAuthModal.css';

interface AdminAuthModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

const AdminAuthModal = ({ onSuccess, onClose }: AdminAuthModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [view, setView] = useState<'login' | 'forgot'>('login');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'login') {
      if (email.trim() !== '' && password === 'kennedy2026') {
        onSuccess();
      } else {
        setError(true);
      }
    } else {
      if (email.trim() !== '') {
        alert(`Se han enviado instrucciones al correo: ${email}`);
        setView('login');
        setError(false);
      } else {
        setError(true);
      }
    }
  };

  return (
    <div className="admin-auth-overlay" onClick={onClose}>
      <div className="admin-auth-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose} title="Cerrar telegrama">&times;</button>

        <div className="auth-header">
          <div className="auth-decoration-line"></div>
          <h2 className="auth-title">Confidencial</h2>
          <div className="auth-decoration-line"></div>
        </div>

        <p className="auth-text">
          {view === 'login'
            ? 'Documento Confidencial. Ingrese su correo oficial y clave de telegrama para acceder a la moderación.'
            : 'Recuperación de credencial. Ingrese su correo oficial para recibir las instrucciones de restauración.'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            className={`auth-input ${error && view === 'forgot' ? 'auth-input-error' : ''}`}
            placeholder="[ CORREO OFICIAL ]"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(false); }}
            autoFocus
          />

          {view === 'login' && (
            <input
              type="password"
              className={`auth-input ${error ? 'auth-input-error' : ''}`}
              placeholder="[ CLAVE DE TELEGRAMA ]"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
            />
          )}

          {error && view === 'login' && <p className="auth-error-text">/// CREDENCIALES INVÁLIDAS ///</p>}
          {error && view === 'forgot' && <p className="auth-error-text">/// INGRESE UN CORREO VÁLIDO ///</p>}

          <button type="submit" className="auth-submit-btn">
            {view === 'login' ? 'VALIDAR CREDENCIAL' : 'SOLICITAR RESTAURACIÓN'}
          </button>

          {view === 'login' ? (
            <button type="button" className="auth-link-btn" onClick={() => { setView('forgot'); setError(false); }}>
              ¿Olvidé mi contraseña?
            </button>
          ) : (
            <button type="button" className="auth-link-btn" onClick={() => { setView('login'); setError(false); }}>
              Volver a la estación de control
            </button>
          )}
        </form>

        <div className="auth-stamp">SELLO OFICIAL</div>
      </div>
    </div>
  );
};

export default AdminAuthModal;
