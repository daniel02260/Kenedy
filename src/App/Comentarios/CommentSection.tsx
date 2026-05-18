import { useState, useEffect, type FormEvent } from 'react';
import { useAppContext } from '../../context/AppContext';
import './CommentSection.css';

interface CommentSectionProps {
  pointId: string;
}

const CommentSection = ({ pointId }: CommentSectionProps) => {
  const { points, addComment, editComment, deleteComment, likeComment, isAdmin } = useAppContext();
  const point = points.find(p => p.id === pointId);
  const comments = point?.comments || [];

  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [savedEmail, setSavedEmail] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [dataTreatment, setDataTreatment] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('kennedy_user_email');
    if (email) {
      setSavedEmail(email);
      setAuthorEmail(email); // Precargar email si existe
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim() || !authorEmail.trim() || !dataTreatment) {
      if (!dataTreatment) alert("Por favor acepta el tratamiento de datos personales.");
      return;
    }

    // Validación de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(authorEmail)) {
      alert("Por favor ingresa un correo electrónico válido (ej. usuario@dominio.com).");
      return;
    }

    localStorage.setItem('kennedy_user_email', authorEmail.toLowerCase());
    setSavedEmail(authorEmail.toLowerCase());

    const comment = {
      id: Date.now().toString(),
      author: authorName,
      email: authorEmail.toLowerCase(),
      text: newComment,
      date: new Date().toISOString(),
    };

    addComment(pointId, comment);
    setNewComment('');
    // No borramos el nombre y el correo para que sea más fácil volver a comentar
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editingCommentText.trim()) return;
    editComment(pointId, commentId, editingCommentText);
    setEditingCommentId(null);
  };

  return (
    <div className="comment-section guestbook-container">
      <div className="guestbook-header">
        <h3>Firmas y Registros ({comments.length})</h3>
        <span className="guestbook-deco"></span>
      </div>

      <div className="comments-list guestbook-pages">
        {comments.length === 0 ? (
          <p className="no-comments handwritten">Las páginas de este tomo están en blanco. ¡Deja la primera marca de tinta!</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment-card ink-entry">
              <div className="comment-header">
                <strong className="handwritten-author">{comment.author}</strong>
                <span className="comment-date typewriter-text">
                  {new Date(comment.date).toLocaleDateString()}
                </span>
                <div className="comment-actions-row">
                  {savedEmail && comment.email === savedEmail ? (
                    <>
                      <button className="action-btn-sm edit" onClick={() => { setEditingCommentId(comment.id); setEditingCommentText(comment.text); }}>✏️</button>
                      <button className="action-btn-sm delete" onClick={() => { if(window.confirm('¿Borrar tu firma?')) deleteComment(pointId, comment.id); }}>🗑️</button>
                    </>
                  ) : (
                    <button className="action-btn-sm like" onClick={() => likeComment(pointId, comment.id)} title="Me gusta">
                      ❤️ {comment.likes || 0}
                    </button>
                  )}
                  {isAdmin && (!savedEmail || comment.email !== savedEmail) && (
                    <button
                      className="delete-comment-btn"
                      onClick={() => deleteComment(pointId, comment.id)}
                      title="Eliminar como administrador"
                    >
                      Tachar ✗
                    </button>
                  )}
                </div>
              </div>
              
              {editingCommentId === comment.id ? (
                <div className="edit-comment-area">
                  <textarea 
                    value={editingCommentText} 
                    onChange={(e) => setEditingCommentText(e.target.value)}
                    className="antique-input antique-textarea"
                    rows={3}
                  />
                  <div className="edit-actions">
                    <button className="action-btn-sm save" onClick={() => handleSaveEdit(comment.id)}>Guardar</button>
                    <button className="action-btn-sm cancel" onClick={() => setEditingCommentId(null)}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <p className="comment-text cursive-text">{comment.text}</p>
              )}
            </div>
          ))
        )}
      </div>

      <form className="comment-form guestbook-form" onSubmit={handleSubmit}>
        <h4 className="form-title">Inscribe tus memorias</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Sello personal (Nombre)</label>
            <input
              type="text"
              placeholder="Firma..."
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
              className="antique-input"
            />
          </div>
          <div className="form-group">
            <label>Correo electronico(E-mail)</label>
            <input
              type="email"
              placeholder="tu@correo.com..."
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              required
              className="antique-input"
            />
          </div>
        </div>
        <div className="form-group">
          <label>Inscripción</label>
          <textarea
            placeholder="Redacta mediante pluma tus impresiones..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
            rows={4}
            className="antique-input antique-textarea"
          />
        </div>
        <div className="data-treatment-group">
          <label className="checkbox-container">
            <input 
              type="checkbox" 
              checked={dataTreatment} 
              onChange={(e) => setDataTreatment(e.target.checked)} 
              required 
            />
            <span className="checkbox-text">
              Acepto el tratamiento de mis datos personales de acuerdo con la política de privacidad.
            </span>
          </label>
        </div>
        <button type="submit" className="submit-comment-btn wax-seal-btn">Enviar comentario</button>
      </form>
    </div>
  );
};

export default CommentSection;
