import { useState, useEffect, type FormEvent } from 'react';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../lib/supabaseClient';
import type { PointOfInterest } from '../../types';

interface ManagePlacesModalProps {
  onClose: () => void;
}

const ManagePlacesModal = ({ onClose }: ManagePlacesModalProps) => {
  const { points, deletePoint, editPoint, setPreviewPoint } = useAppContext();
  const [editingPoint, setEditingPoint] = useState<PointOfInterest | null>(null);
  
  // Edit Form States
  const [editStep, setEditStep] = useState(1);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editX, setEditX] = useState(50);
  const [editY, setEditY] = useState(50);
  const [editVideoLink, setEditVideoLink] = useState('');
  const [editPodcastLink, setEditPodcastLink] = useState('');
  
  const [editCoverImage, setEditCoverImage] = useState<File | null>(null);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Sync preview point when editing a place
  useEffect(() => {
    if (editingPoint && editStep === 2) {
      setPreviewPoint({ x: editX, y: editY });
    } else {
      setPreviewPoint(null);
    }
  }, [editX, editY, editStep, editingPoint, setPreviewPoint]);

  const handleClose = () => {
    setPreviewPoint(null);
    onClose();
  };

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
    setEditCoverImage(null);
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

    let currentMedia = [...editingPoint.media];

    // Separate existing images
    let imageMedia = currentMedia.filter(m => m.type === 'image');
    const nonImageMedia = currentMedia.filter(m => m.type !== 'image');

    // Handle Cover Image Update
    if (editCoverImage) {
      const coverBase64 = await toBase64(editCoverImage);
      const newCover = { type: 'image' as const, url: coverBase64, title: 'Portada' };
      if (imageMedia.length > 0) {
        imageMedia[0] = newCover;
      } else {
        imageMedia = [newCover];
      }
    }

    // Handle Carousel Images Update
    if (newImages.length > 0) {
      const carouselItems = await Promise.all(
        newImages.map(async (file) => ({
          type: 'image' as const,
          url: await toBase64(file),
          title: file.name
        }))
      );
      // Replace everything after the first image (the cover)
      const cover = imageMedia.length > 0 ? [imageMedia[0]] : [];
      imageMedia = [...cover, ...carouselItems];
    }

    let finalMedia = [...imageMedia, ...nonImageMedia];

    // Update video
    finalMedia = finalMedia.filter(m => m.type !== 'video');
    if (editVideoLink.trim()) {
      finalMedia.push({ type: 'video', url: editVideoLink.trim(), title: 'Video' });
    }

    // Update podcast
    finalMedia = finalMedia.filter(m => m.type !== 'podcast');
    if (editPodcastLink.trim()) {
      finalMedia.push({ type: 'podcast', url: editPodcastLink.trim(), title: 'Podcast' });
    }

    editPoint(editingPoint.id, {
      name: editName.trim(),
      description: editDescription.trim(),
      x: editX,
      y: editY,
      media: finalMedia
    });

    setIsSaving(false);
    setPreviewPoint(null);
    setEditingPoint(null);
  };

  return (
    <div className={`admin-add-place-overlay ${editingPoint && editStep === 2 ? 'preview-mode' : ''}`} onClick={handleClose}>
      <div className="admin-add-place-modal manage-places-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={handleClose} title="Cerrar">&times;</button>
        
        {!editingPoint ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>Gestionar Lugares</h3>
              <button 
                className="sidebar-btn-map" 
                style={{ width: 'auto', padding: '8px 15px', fontSize: '0.9rem', background: isSaving ? '#6b7280' : '#3b82f6', border: 'none', color: 'white', borderRadius: '4px' }}
                disabled={isSaving}
                onClick={async () => {
                  if (window.confirm('¿Deseas subir todos tus lugares locales a la nube para que sean visibles para todo el mundo?')) {
                    setIsSaving(true);
                    try {
                      // Usar supabase ya importado estáticamente al tope del archivo
                      const { error } = await supabase
                        .from('global_state')
                        .upsert({ id: 'places_v1', data: points });
                      
                      if (error) {
                        if (error.code === '42P01') {
                          alert('Error: Aún no has creado la tabla "global_state" en Supabase. Lee las instrucciones de la IA.');
                        } else {
                          alert(`Error al guardar: ${error.message}`);
                        }
                      } else {
                        alert('☁️ ¡Lugares sincronizados con la nube exitosamente! Todos los usuarios podrán verlos ahora.');
                      }
                    } catch (err) {
                      console.error(err);
                      alert('Error de conexión.');
                    } finally {
                      setIsSaving(false);
                    }
                  }
                }}
              >
                {isSaving ? 'Sincronizando...' : '☁️ Sincronizar a la Nube (Para todos)'}
              </button>
            </div>
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
                    Foto de portada principal (reemplazar)
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setEditCoverImage(e.target.files[0]);
                        }
                      }}
                    />
                  </label>

                  <label>
                    Fotos del carrusel (reemplazar carrusel actual)
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
