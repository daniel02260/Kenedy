import { useState, type FormEvent } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { PointOfInterest } from '../../types';

interface ManagePlacesModalProps {
  onClose: () => void;
}

const ManagePlacesModal = ({ onClose }: ManagePlacesModalProps) => {
  const { points, deletePoint, editPoint } = useAppContext();
  const [editingPoint, setEditingPoint] = useState<PointOfInterest | null>(null);
  
  // Edit Form States
  const [editStep, setEditStep] = useState(1);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editX, setEditX] = useState(50);
  const [editY, setEditY] = useState(50);
  const [editVideoLink, setEditVideoLink] = useState('');
  const [editPodcastLink, setEditPodcastLink] = useState('');
  // For simplicity, we might just keep existing media or allow replacing everything.
  // Replacing images can be complex if we want to keep some. We will allow adding new images 
  // that will OVERWRITE the old ones for simplicity, or we can just skip image editing if no new files are provided.
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleDelete = (point: PointOfInterest) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${point.name}"?`)) {
      deletePoint(point.id);
    }
  };

  const startEdit = (point: PointOfInterest) => {
    setEditingPoint(point);
    setEditName(point.name);
    setEditDescription(point.description);
    setEditX(point.x);
    setEditY(point.y);
    
    const video = point.media.find(m => m.type === 'video');
    const podcast = point.media.find(m => m.type === 'podcast');
    
    setEditVideoLink(video ? video.url : '');
    setEditPodcastLink(podcast ? podcast.url : '');
    setNewImages([]);
    setEditStep(1);
  };

  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleSaveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingPoint) return;
    setIsSaving(true);

    let updatedMedia = [...editingPoint.media];

    // If new images are selected, we replace old images.
    // Otherwise, we keep old images.
    if (newImages.length > 0) {
      const imageMedia = await Promise.all(
        newImages.map(async (file) => ({
          type: 'image' as const,
          url: await toBase64(file),
          title: file.name
        }))
      );
      // Remove old images
      updatedMedia = updatedMedia.filter(m => m.type !== 'image');
      // Add new ones
      updatedMedia = [...updatedMedia, ...imageMedia];
    }

    // Update video
    updatedMedia = updatedMedia.filter(m => m.type !== 'video');
    if (editVideoLink.trim()) {
      updatedMedia.push({ type: 'video', url: editVideoLink.trim(), title: 'Video' });
    }

    // Update podcast
    updatedMedia = updatedMedia.filter(m => m.type !== 'podcast');
    if (editPodcastLink.trim()) {
      updatedMedia.push({ type: 'podcast', url: editPodcastLink.trim(), title: 'Podcast' });
    }

    editPoint(editingPoint.id, {
      name: editName.trim(),
      description: editDescription.trim(),
      x: editX,
      y: editY,
      media: updatedMedia
    });

    setIsSaving(false);
    setEditingPoint(null);
  };

  return (
    <div className="admin-add-place-overlay" onClick={onClose}>
      <div className="admin-add-place-modal manage-places-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose} title="Cerrar">&times;</button>
        
        {!editingPoint ? (
          <>
            <h3>Gestionar Lugares</h3>
            <div className="manage-places-list">
              {points.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666' }}>No hay lugares documentados.</p>
              ) : (
                points.map(point => (
                  <div key={point.id} className="manage-place-item">
                    <span className="manage-place-name">{point.name}</span>
                    <div className="manage-place-actions">
                      <button className="manage-action-btn edit-btn" onClick={() => startEdit(point)} title="Editar">
                        ✏️ Editar
                      </button>
                      <button className="manage-action-btn delete-btn" onClick={() => handleDelete(point)} title="Eliminar">
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <h3>Editar lugar (Paso {editStep} de 3)</h3>
            <form className="admin-add-place-form" onSubmit={handleSaveEdit}>
              {editStep === 1 && (
                <>
                  <label>
                    Nombre del lugar
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Historia
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={4}
                      required
                    />
                  </label>
                </>
              )}

              {editStep === 2 && (
                <div className="coordinates-group">
                  <label>
                    Posición X (0-100)
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editX}
                      onChange={(e) => setEditX(Number(e.target.value))}
                      required
                    />
                  </label>
                  <label>
                    Posición Y (0-100)
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editY}
                      onChange={(e) => setEditY(Number(e.target.value))}
                      required
                    />
                  </label>
                </div>
              )}

              {editStep === 3 && (
                <>
                  <label>
                    Nuevas Fotos (reemplazarán las actuales)
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          setNewImages(Array.from(e.target.files));
                        }
                      }}
                    />
                  </label>

                  <label>
                    Link del video
                    <input
                      type="url"
                      value={editVideoLink}
                      onChange={(e) => setEditVideoLink(e.target.value)}
                      placeholder="https://"
                    />
                  </label>

                  <label>
                    Link del podcast
                    <input
                      type="url"
                      value={editPodcastLink}
                      onChange={(e) => setEditPodcastLink(e.target.value)}
                      placeholder="https://"
                    />
                  </label>
                </>
              )}

              <div className="form-navigation-buttons">
                <button type="button" className="sidebar-btn-map" style={{ background: '#755f46' }} onClick={() => {
                  if (editStep > 1) {
                    setEditStep(prev => prev - 1);
                  } else {
                    setEditingPoint(null); // Cancelar edición
                  }
                }}>
                  {editStep > 1 ? 'Atrás' : 'Cancelar'}
                </button>
                
                {editStep < 3 ? (
                  <button 
                    type="button" 
                    className="sidebar-btn-map" 
                    onClick={() => {
                      if (editStep === 1 && (!editName.trim() || !editDescription.trim())) {
                        alert('Por favor completa el nombre y la historia.');
                        return;
                      }
                      setEditStep(prev => prev + 1)
                    }}
                  >
                    Siguiente
                  </button>
                ) : (
                  <button className="sidebar-btn-map" type="submit" disabled={isSaving}>
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ManagePlacesModal;
