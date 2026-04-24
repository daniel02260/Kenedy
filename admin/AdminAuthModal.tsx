import { useState } from 'react';
import './AdminAuthModal.css';

interface AdminAuthModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

const AdminAuthModal = ({ onSuccess, onClose }: AdminAuthModalProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'kennedy2026') {
      onSuccess();
    } else {
      setError(true);
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
          Documento Confidencial. Ingrese su número de serie de telegrafista para acceder a la moderación.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="password"
            className={`auth-input ${error ? 'auth-input-error' : ''}`}
            placeholder="[ CLAVE DE TELEGRAMA ]"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            autoFocus
          />
          {error && <p className="auth-error-text">/// AUTORIZACIÓN DENEGADA ///</p>}
          <button type="submit" className="auth-submit-btn">VALIDAR CREDENCIAL</button>
        </form>

        <div className="auth-stamp">SELLO OFICIAL</div>
      </div>
    </div>
  );
};

export default AdminAuthModal;
