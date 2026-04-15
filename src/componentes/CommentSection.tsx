import { useState, type FormEvent } from 'react';
import { useAppContext } from '../context/AppContext';
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) return;

    const comment = {
      id: Date.now().toString(),
      author: authorName,
      text: newComment,
      date: new Date().toISOString(),
    };

    addComment(pointId, comment);
    setNewComment('');
    setAuthorName('');
  };

  return (
    <div className="comment-section">
      <h3>Comentarios ({comments.length})</h3>
      
      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">No hay comentarios aún. ¡Sé el primero!</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment-card">
              <div className="comment-header">
                <strong>{comment.author}</strong>
                <span className="comment-date">
                  {new Date(comment.date).toLocaleDateString()}
                </span>
                {isAdmin && (
                  <button 
                    className="delete-comment-btn"
                    onClick={() => deleteComment(pointId, comment.id)}
                    title="Eliminar como administrador"
                  >
                    🗑️
                  </button>
                )}
              </div>
              <p className="comment-text">{comment.text}</p>
            </div>
          ))
        )}
      </div>

      <form className="comment-form" onSubmit={handleSubmit}>
        <h4>Dejar un comentario</h4>
        <input 
          type="text" 
          placeholder="Tu nombre..." 
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          required
        />
        <textarea 
          placeholder="Escribe tu comentario aquí..." 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          required
          rows={3}
        />
        <button type="submit" className="submit-comment-btn">Enviar</button>
      </form>
    </div>
  );
};

export default CommentSection;
