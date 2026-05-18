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
  const [view, setView] = useState<'login' | 'forgot' | 'force-change-password'>('login');
  
  // Estados para el cambio forzado de contraseña
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loggedInEmail, setLoggedInEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'login') {
      // Leer administradores registrados desde localStorage
      const stored = localStorage.getItem('kennedy_admins');
      let registeredAdmins: any[] = [];
      if (stored) {
        try {
          registeredAdmins = JSON.parse(stored);
        } catch (err) {
          registeredAdmins = [];
        }
      }
      
      const matchedAdmin = registeredAdmins.find(
        (admin) => admin.email.toLowerCase() === email.toLowerCase() && admin.password === password
      );

      const isMaster = email.trim() !== '' && password === 'kennedy2026';

      if (isMaster || matchedAdmin) {
        if (matchedAdmin && matchedAdmin.mustChangePassword) {
          // Si el administrador es nuevo y debe cambiar contraseña
          setLoggedInEmail(matchedAdmin.email);
          setView('force-change-password');
          setError(false);
        } else {
          onSuccess();
        }
      } else {
        setError(true);
      }
    } else if (view === 'force-change-password') {
      if (!newPassword || !confirmNewPassword) {
        setError(true);
        return;
      }
      if (newPassword !== confirmNewPassword) {
        alert('/// LAS CONTRASEÑAS NO COINCIDEN ///');
        return;
      }
      if (newPassword.length < 6) {
        alert('/// LA CLAVE DEBE TENER AL MENOS 6 CARACTERES ///');
        return;
      }
      if (newPassword === 'kennedy2026') {
        alert('/// POR SEGURIDAD, NO PUEDE UTILIZAR LA CLAVE DE DEFECTO ///');
        return;
      }

      // Actualizar la contraseña en localStorage y apagar la bandera
      const stored = localStorage.getItem('kennedy_admins');
      if (stored) {
        try {
          const admins = JSON.parse(stored);
          const idx = admins.findIndex((a: any) => a.email.toLowerCase() === loggedInEmail.toLowerCase());
          if (idx !== -1) {
            admins[idx].password = newPassword;
            admins[idx].mustChangePassword = false;
            localStorage.setItem('kennedy_admins', JSON.stringify(admins));
          }
        } catch (err) {
          console.error(err);
        }
      }

      alert('/// CLAVE DE TELEGRAMA ACTUALIZADA CON ÉXITO ///\nBienvenido al panel de control.');
      onSuccess();
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
          {view === 'login' && 'Documento Confidencial. Ingrese su correo oficial y clave de telegrama para acceder a la moderación.'}
          {view === 'forgot' && 'Recuperación de credencial. Ingrese su correo oficial para recibir las instrucciones de restauración.'}
          {view === 'force-change-password' && 'Actualización de Seguridad. Su cuenta es nueva y requiere asignar su clave confidencial antes de ingresar.'}
        </p>

        {view === 'force-change-password' ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <p className="auth-text" style={{ color: '#d1562b', fontWeight: 'bold', display: 'block', margin: '-10px 0 10px 0' }}>
              /// CAMBIO DE CLAVE OBLIGATORIO ///
            </p>

            <input
              type="password"
              className="auth-input"
              placeholder="[ NUEVA CLAVE ]"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setError(false); }}
              autoFocus
              required
            />

            <input
              type="password"
              className="auth-input"
              placeholder="[ CONFIRMAR CLAVE ]"
              value={confirmNewPassword}
              onChange={(e) => { setConfirmNewPassword(e.target.value); setError(false); }}
              required
            />

            <button type="submit" className="auth-submit-btn">
              ESTABLECER CLAVE Y ACCEDER
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="email"
              className={`auth-input ${error && view === 'forgot' ? 'auth-input-error' : ''}`}
              placeholder="[ CORREO OFICIAL ]"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(false); }}
              autoFocus
              required
            />

            {view === 'login' && (
              <input
                type="password"
                className={`auth-input ${error ? 'auth-input-error' : ''}`}
                placeholder="[ CLAVE DE TELEGRAMA ]"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                required
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
        )}

        <div className="auth-stamp">SELLO OFICIAL</div>
      </div>
    </div>
  );
};

export default AdminAuthModal;
