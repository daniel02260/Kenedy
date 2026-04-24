import './AdminAuthModal.css';

interface AdminLogoutModalProps {
  onConfirm: () => void;
  onClose: () => void;
}

const AdminLogoutModal = ({ onConfirm, onClose }: AdminLogoutModalProps) => {
  return (
    <div className="admin-auth-overlay" onClick={onClose}>
      <div className="admin-auth-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose} title="Mantener archivo abierto">&times;</button>
        
        <div className="auth-header">
          <div className="auth-decoration-line"></div>
          <h2 className="auth-title">CIERRE DE SESIÓN</h2>
          <div className="auth-decoration-line"></div>
        </div>

        <p className="auth-text" style={{ marginBottom: '40px' }}>
          ATENCIÓN: Sistema de moderación actualmente activo. <br /><br />
          ¿Desea revocar sus credenciales operativas y sellar de vuelta el archivo clasificado?
        </p>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            className="auth-submit-btn" 
            style={{ background: 'transparent', color: '#362f2d', border: '2px solid #362f2d', boxShadow: 'none' }} 
            onClick={onClose}
          >
            CANCELAR
          </button>
          <button 
            className="auth-submit-btn" 
            onClick={onConfirm}
          >
            SELLAR ARCHIVO
          </button>
        </div>

        <div className="auth-stamp" style={{ borderColor: 'rgba(54, 47, 45, 0.3)', color: 'rgba(54, 47, 45, 0.3)', transform: 'rotate(10deg)' }}>
          EN REVISIÓN
        </div>
      </div>
    </div>
  );
};

export default AdminLogoutModal;
