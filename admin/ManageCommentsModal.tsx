import { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabaseClient';
import { useAppContext } from '../src/context/AppContext';
import './AdminAuthModal.css';

interface ManageCommentsModalProps {
  onClose: () => void;
}

const ManageCommentsModal = ({ onClose }: ManageCommentsModalProps) => {
  const { points, deleteComment } = useAppContext();
  const [allComments, setAllComments] = useState<any[]>([]);

  useEffect(() => {
    // Aplanar los comentarios de todos los puntos en un solo array
    const flattened = points.flatMap(point => 
      point.comments.map(comment => ({
        ...comment,
        placeName: point.name,
        pointId: point.id
      }))
    );
    
    // Ordenar por fecha (más recientes primero)
    flattened.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setAllComments(flattened);
  }, [points]);

  const handleDelete = async (pointId: string, commentId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este comentario permanentemente de la nube?')) {
      // Usar la función del contexto (que ya borra en Supabase y actualiza la UI al instante)
      await deleteComment(pointId, commentId);
    }
  };

  return (
    <div className="admin-auth-overlay" onClick={onClose}>
      <div className="admin-add-place-modal manage-places-modal" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose} title="Cerrar">&times;</button>
        
        <h3>Auditoría de Comentarios Globales</h3>

        <div className="manage-places-list" style={{ maxHeight: '500px', overflowY: 'auto', marginTop: '20px' }}>
          {allComments.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>No hay firmas registradas en los diarios de campo.</p>
          ) : (
            allComments.map(comment => (
              <div key={comment.id} className="manage-place-item" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start', padding: '15px' }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="manage-place-name" style={{ fontSize: '1.1rem', color: '#883e20' }}>{comment.author}</span>
                    <span style={{ fontSize: '0.8rem', color: '#666', display: 'block', margin: '4px 0' }}>
                      📍 {comment.placeName} — {new Date(comment.date).toLocaleDateString()} a las {new Date(comment.date).toLocaleTimeString()}
                    </span>
                    {comment.email && <span style={{ fontSize: '0.8rem', color: '#666', display: 'block' }}>✉️ {comment.email}</span>}
                  </div>
                  <button 
                    className="manage-action-btn delete-btn" 
                    onClick={() => handleDelete(comment.pointId, comment.id)} 
                    title="Censurar Comentario"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
                
                <div style={{ 
                  background: 'rgba(255,255,255,0.5)', 
                  padding: '10px', 
                  borderRadius: '4px', 
                  width: '100%',
                  fontFamily: 'Courier New',
                  fontSize: '0.95rem',
                  borderLeft: '3px solid #883e20'
                }}>
                  "{comment.text}"
                </div>
                
                <div style={{ fontSize: '0.8rem', color: '#883e20', fontWeight: 'bold' }}>
                  ❤️ {comment.likes || 0} avales
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCommentsModal;
