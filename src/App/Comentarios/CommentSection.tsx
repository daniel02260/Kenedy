import { useState, type FormEvent } from 'react';
import { useAppContext } from '../../context/AppContext';
import './CommentSection.css';

interface CommentSectionProps {
  pointId: string;
}

const CommentSection = ({ pointId }: CommentSectionProps) => {
  const { points, addComment, deleteComment, isAdmin } = useAppContext();
  const point = points.find(p => p.id === pointId);
  const comments = point?.comments || [];

  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim() || !authorEmail.trim()) return;

    const comment = {
      id: Date.now().toString(),
      author: authorName,
      email: authorEmail,
      text: newComment,
      date: new Date().toISOString(),
    };

    addComment(pointId, comment);
    setNewComment('');
    setAuthorName('');
    setAuthorEmail('');
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
                {isAdmin && (
                  <button
                    className="delete-comment-btn"
                    onClick={() => deleteComment(pointId, comment.id)}
                    title="Eliminar como administrador"
                  >
                    Tachar ✗
                  </button>
                )}
              </div>
              <p className="comment-text cursive-text">{comment.text}</p>
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
        <button type="submit" className="submit-comment-btn wax-seal-btn">Enviar comentario</button>
      </form>
    </div>
  );
};

export default CommentSection;
