import { useState } from 'react';
import { supabase } from '../src/lib/supabaseClient';
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
  const [isLoading, setIsLoading] = useState(false);

  // Estados para el cambio forzado de contraseña
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loggedInEmail, setLoggedInEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setIsLoading(true);

    if (view === 'login') {
      const trimmedEmail = email.toLowerCase().trim();

      try {
        // 2. Consulta en vivo en la tabla de Supabase
        const { data, error: sbError } = await supabase
          .from('administrators')
          .select('*')
          .eq('email', trimmedEmail)
          .eq('password', password);

        if (sbError) {
          console.error('Supabase Auth Error:', sbError);
          setError(true);
          setIsLoading(false);
          return;
        }

        if (data && data.length > 0) {
          const matchedAdmin = data[0];
          if (matchedAdmin.must_change_password) {
            // Si tiene activa la bandera de cambio obligatorio
            setLoggedInEmail(matchedAdmin.email);
            setView('force-change-password');
          } else {
            onSuccess();
          }
        } else {
          // Intentar como fallback en localStorage si Supabase está vacío / desconectado
          const stored = localStorage.getItem('kennedy_admins');
          let registeredAdmins: any[] = [];
          if (stored) {
            try {
              registeredAdmins = JSON.parse(stored);
            } catch (err) {
              registeredAdmins = [];
            }
          }

          const isValidLocal = registeredAdmins.find(
            (admin) => admin.email.toLowerCase() === trimmedEmail && admin.password === password
          );

          if (isValidLocal) {
            if (isValidLocal.mustChangePassword) {
              setLoggedInEmail(isValidLocal.email);
              setView('force-change-password');
            } else {
              onSuccess();
            }
          } else {
            setError(true);
          }
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    } else if (view === 'force-change-password') {
      if (!newPassword || !confirmNewPassword) {
        setError(true);
        setIsLoading(false);
        return;
      }
      if (newPassword !== confirmNewPassword) {
        alert('/// LAS CONTRASEÑAS NO COINCIDEN ///');
        setIsLoading(false);
        return;
      }
      if (newPassword.length < 6) {
        alert('/// LA CLAVE DEBE TENER AL MENOS 6 CARACTERES ///');
        setIsLoading(false);
        return;
      }
      if (newPassword === 'kennedy2026') {
        alert('/// POR SEGURIDAD, NO PUEDE UTILIZAR LA CLAVE DE DEFECTO ///');
        setIsLoading(false);
        return;
      }

      try {
        // 1. Actualizar clave en Supabase (En vivo)
        const { error: updateError } = await supabase
          .from('administrators')
          .update({ password: newPassword, must_change_password: false })
          .eq('email', loggedInEmail.toLowerCase().trim());

        if (updateError) {
          console.error(updateError);
          alert(`/// ERROR AL ACTUALIZAR EN LA NUBE: ${updateError.message} ///`);
          setIsLoading(false);
          return;
        }

        // 2. Sincronizar en localStorage como fallback
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
      } catch (err) {
        console.error(err);
        alert('/// FALLA DE CONEXIÓN AL GUARDAR LA NUEVA CLAVE ///');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Flujo de Olvido de contraseña simulado
      if (email.trim() !== '') {
        alert(`Se han enviado instrucciones al correo: ${email}`);
        setView('login');
        setError(false);
      } else {
        setError(true);
      }
      setIsLoading(false);
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
              disabled={isLoading}
            />

            <input
              type="password"
              className="auth-input"
              placeholder="[ CONFIRMAR CLAVE ]"
              value={confirmNewPassword}
              onChange={(e) => { setConfirmNewPassword(e.target.value); setError(false); }}
              required
              disabled={isLoading}
            />

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'GUARDANDO...' : 'ESTABLECER CLAVE Y ACCEDER'}
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
              disabled={isLoading}
            />

            {view === 'login' && (
              <input
                type="password"
                className={`auth-input ${error ? 'auth-input-error' : ''}`}
                placeholder="[ CLAVE DE TELEGRAMA ]"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                required
                disabled={isLoading}
              />
            )}

            {error && view === 'login' && <p className="auth-error-text">/// CREDENCIALES INVÁLIDAS ///</p>}
            {error && view === 'forgot' && <p className="auth-error-text">/// INGRESE UN CORREO VÁLIDO ///</p>}

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'VALIDANDO...' : (view === 'login' ? 'VALIDAR CREDENCIAL' : 'SOLICITAR RESTAURACIÓN')}
            </button>

            {view === 'login' ? (
              <button type="button" className="auth-link-btn" onClick={() => { setView('forgot'); setError(false); }} disabled={isLoading}>
                ¿Olvidé mi contraseña?
              </button>
            ) : (
              <button type="button" className="auth-link-btn" onClick={() => { setView('login'); setError(false); }} disabled={isLoading}>
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
