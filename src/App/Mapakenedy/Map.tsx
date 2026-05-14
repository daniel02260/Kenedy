import { useState, type FormEvent } from 'react';
import { useAppContext } from '../../context/AppContext';
import PointMarker from '../PosicionComponentes/PointMarker';
import PointDetailModal from '../ModalDetalles(Descripcion_Media_Comentarios)/PointDetailModal';
import InfoModal from '../AcercaProyecto/InfoModal';
import AdminAuthModal from '../../../admin/AdminAuthModal';
import AdminLogoutModal from '../../../admin/AdminLogoutModal';
import ManagePlacesModal from '../AdminLugares/ManagePlacesModal';
import type { PointOfInterest } from '../../types';
import './Map.css';

const Map = () => {
  const { points, isAdmin, setIsAdmin, addPoint, isFirstVisit, markFirstVisitDone, visitedPoints, markPointAsVisited, previewPoint } = useAppContext();
  const [selectedPoint, setSelectedPoint] = useState<PointOfInterest | null>(null);
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  const [modalOrigin, setModalOrigin] = useState<{ x: number, y: number } | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [showAdminLogout, setShowAdminLogout] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceDescription, setNewPlaceDescription] = useState('');
  const [newVideoLink, setNewVideoLink] = useState('');
  const [newPodcastLink, setNewPodcastLink] = useState('');
  const [newCoverImage, setNewCoverImage] = useState<File | null>(null);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [newPlaceX, setNewPlaceX] = useState(50);
  const [newPlaceY, setNewPlaceY] = useState(50);
  const [addPlaceStep, setAddPlaceStep] = useState(1);
  const [showManagePlacesModal, setShowManagePlacesModal] = useState(false);

  const closeModal = () => {
    setSelectedPoint(null);
    setTimeout(() => setModalOrigin(null), 400); // Clear origin after animation
  };

  const handleAdminAccessClick = () => {
    if (isAdmin) {
      setShowAdminLogout(true);
    } else {
      setShowAdminAuth(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    setShowAdminAuth(false);
  };

  const handleAdminLogoutConfirm = () => {
    setIsAdmin(false);
    setShowAdminLogout(false);
  };

  const handleCoverImageChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      setNewCoverImage(files[0]);
    } else {
      setNewCoverImage(null);
    }
  };

  const handleImageFilesChange = (files: FileList | null) => {
    if (!files) return;
    setNewImages(Array.from(files));
  };

  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleAddPlace = async (event: FormEvent) => {
    event.preventDefault();
    if (!newPlaceName.trim() || !newPlaceDescription.trim()) return;
    setIsAddingPlace(true);

    const coverMedia = newCoverImage ? [{
      type: 'image' as const,
      url: await toBase64(newCoverImage),
      title: 'Portada - ' + newCoverImage.name
    }] : [];

    const carouselMedia = await Promise.all(
      newImages.map(async (file) => ({
        type: 'image' as const,
        url: await toBase64(file),
        title: file.name
      }))
    );

    const media: PointOfInterest['media'] = [
      ...coverMedia,
      ...carouselMedia,
      ...(newVideoLink.trim() ? [{ type: 'video' as const, url: newVideoLink.trim(), title: 'Video' }] : []),
      ...(newPodcastLink.trim() ? [{ type: 'podcast' as const, url: newPodcastLink.trim(), title: 'Podcast' }] : [])
    ];

    addPoint({
      name: newPlaceName.trim(),
      description: newPlaceDescription.trim(),
      x: newPlaceX,
      y: newPlaceY,
      media,
    });

    setNewPlaceName('');
    setNewPlaceDescription('');
    setNewVideoLink('');
    setNewPodcastLink('');
    setNewCoverImage(null);
    setNewImages([]);
    setNewPlaceX(50);
    setNewPlaceY(50);
    setIsAddingPlace(false);
    setShowAddPlaceModal(false);
    setAddPlaceStep(1);
  };

  return (
    <div className="map-container">
      {/* Viñeta Oscura General */}
      <div className="map-vignette"></div>

      {/* Wrapper de Alineación Perfecta (Escala juntos Croquis y Marcadores en 3:2 sin desfasarse) */}
      <div className="map-wrapper shifted-layer">
        <img src="/img/croquis.png" alt="Croquis Kennedy" className="map-image" />

        {/* Dynamic Markers */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
          {points.map((point) => (
            <PointMarker
              key={point.id}
              point={point}
              onClick={(e) => {
                markFirstVisitDone();
                markPointAsVisited(point.id);
                // Capturar el bounding rect exacto del marcador para el origen de la animación (Portal Expand)
                if (e) {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setModalOrigin({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                  });
                } else {
                  // Fallback to center if triggered from sidebar without event
                  setModalOrigin({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
                }
                setSelectedPoint(point);
              }}
              isHighlighted={hoveredPointId === point.id}
              isFirstVisit={isFirstVisit}
            />
          ))}

          {/* Preview Marker para el Paso 2 de agregar lugar */}
          {addPlaceStep === 2 && (
            <div 
              className="preview-marker" 
              style={{ left: `${newPlaceX}%`, top: `${newPlaceY}%` }}
            />
          )}

          {/* Preview Marker desde el contexto (para editar lugares) */}
          {previewPoint && (
            <div 
              className="preview-marker" 
              style={{ left: `${previewPoint.x}%`, top: `${previewPoint.y}%` }}
            />
          )}
        </div>
      </div>

      {/* Map Overlay Controls */}
      <div className="map-overlay">

        {/* Top Header */}
        <div className="map-header" style={{ position: 'relative' }}>
          <div className="map-title-container" style={{ background: 'transparent', boxShadow: 'none', padding: 0, marginLeft: '-20px', marginTop: '-20px' }}>
            <img
              src="/img/LOGO_EXPLORA_kENNEDY.png"
              alt="Explora Kennedy Transmedia"
              className="logo-overlay"
              style={{ maxWidth: '260px', height: 'auto', objectFit: 'contain', cursor: 'help' }}
              onClick={handleAdminAccessClick}
              title="Explora Kennedy"
            />
          </div>

          <div className="map-controls-top-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img 
              src="/img/logo_universidad.png" 
              alt="Logo Universidad" 
              style={{ maxWidth: '160px', height: 'auto', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.3))' }} 
            />
            <button className={`icon-btn dark-btn ${isFirstVisit ? 'first-visit-pulse' : ''}`} onClick={() => { markFirstVisitDone(); setIsInfoOpen(true); }}>i</button>
          </div>
        </div>

        {/* Sidebar Menu for Points */}
        <div className="map-sidebar">
          <h3 className="sidebar-title">{isAdmin ? 'Análisis' : 'Lugares Documentados'}</h3>
          {isAdmin ? (
            <ul className="sidebar-list">
              <li className="sidebar-item admin-sidebar-item">
                <div className="sidebar-item-icon">
                  <span style={{ fontSize: '1.4rem' }}>📊</span>
                </div>
                <div className="sidebar-item-info">
                  <span className="sidebar-item-name">Google Analytics</span>
                  <button
                    className="sidebar-btn-map"
                    type="button"
                    onClick={() => window.open('https://analytics.google.com/analytics/web/', '_blank')}
                  >
                    Acceder al flujo
                  </button>
                </div>
              </li>
              <li className="sidebar-item admin-sidebar-item">
                <div className="sidebar-item-icon">
                  <span style={{ fontSize: '1.4rem' }}>➕</span>
                </div>
                <div className="sidebar-item-info">
                  <span className="sidebar-item-name">Agregar lugar</span>
                  <button
                    className="sidebar-btn-map"
                    type="button"
                    onClick={() => setShowAddPlaceModal(true)}
                  >
                    Abrir formulario
                  </button>
                </div>
              </li>
              <li className="sidebar-item admin-sidebar-item">
                <div className="sidebar-item-icon">
                  <span style={{ fontSize: '1.4rem' }}>⚙️</span>
                </div>
                <div className="sidebar-item-info">
                  <span className="sidebar-item-name">Gestionar lugares</span>
                  <button
                    className="sidebar-btn-map"
                    type="button"
                    onClick={() => setShowManagePlacesModal(true)}
                  >
                    Abrir gestor
                  </button>
                </div>
              </li>
            </ul>
          ) : (
            <ul className="sidebar-list">
              {points.map((point) => {
                const firstImage = point.media.find(m => m.type === 'image');
                return (
                  <li
                    key={point.id}
                    className="sidebar-item"
                    onMouseEnter={() => setHoveredPointId(point.id)}
                    onMouseLeave={() => setHoveredPointId(null)}
                  >
                    <div 
                      className="sidebar-item-icon" 
                      onClick={(e) => {
                        markFirstVisitDone();
                        markPointAsVisited(point.id);
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setModalOrigin({
                          x: rect.left + rect.width / 2,
                          y: rect.top + rect.height / 2
                        });
                        setSelectedPoint(point);
                      }}
                    >
                      {firstImage ? (
                        <img src={firstImage.url} alt={point.name} />
                      ) : (
                        <span style={{ fontSize: '1.2rem' }}>📍</span>
                      )}
                    </div>
                    <div className="sidebar-item-info">
                      <span className="sidebar-item-name">{point.name}</span>
                      <button
                        className={`sidebar-btn-map ${isFirstVisit ? 'first-visit-pulse' : ''}`}
                        onClick={(e) => {
                          markFirstVisitDone();
                          markPointAsVisited(point.id);
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          setModalOrigin({
                            x: rect.left + rect.width / 2,
                            y: rect.top + rect.height / 2
                          });
                          setSelectedPoint(point);
                        }}
                      >
                        Ver en mapa
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>



        {/* Bottom Elements */}
        <div className="map-bottom-container">

          {/* Stats Box */}
          <div className="map-stats-box">
            <div className="tag-clip"></div>
            <div className="tag-eyelet"></div>
            <span className="stats-label">Lugares visitados:</span>
            <span className="stats-number">
              {Math.min(visitedPoints.filter(id => points.some(p => p.id === id)).length, points.length)}
            </span>
          </div>

        </div>

      </div>

      {/* Detalle del Punto */}
      {selectedPoint && (
        <PointDetailModal
          point={selectedPoint}
          onClose={closeModal}
          originX={modalOrigin?.x}
          originY={modalOrigin?.y}
        />
      )}

      {isInfoOpen && (
        <InfoModal onClose={() => setIsInfoOpen(false)} />
      )}

      {showAdminAuth && (
        <AdminAuthModal
          onSuccess={handleAdminLoginSuccess}
          onClose={() => setShowAdminAuth(false)}
        />
      )}

      {showAdminLogout && (
        <AdminLogoutModal
          onConfirm={handleAdminLogoutConfirm}
          onClose={() => setShowAdminLogout(false)}
        />
      )}

      {showAddPlaceModal && (
        <div className={`admin-add-place-overlay ${addPlaceStep === 2 ? 'preview-mode' : ''}`} onClick={() => { setShowAddPlaceModal(false); setAddPlaceStep(1); }}>
          <div className="admin-add-place-modal" onClick={(e) => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={() => { setShowAddPlaceModal(false); setAddPlaceStep(1); }} title="Cerrar">&times;</button>
            <h3>Agregar nuevo lugar (Paso {addPlaceStep} de 3)</h3>
            <form className="admin-add-place-form" onSubmit={handleAddPlace}>
              {addPlaceStep === 1 && (
                <>
                  <label>
                    Nombre del lugar
                    <input
                      type="text"
                      value={newPlaceName}
                      onChange={(e) => setNewPlaceName(e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Historia
                    <textarea
                      value={newPlaceDescription}
                      onChange={(e) => setNewPlaceDescription(e.target.value)}
                      rows={4}
                      required
                    />
                  </label>
                </>
              )}

              {addPlaceStep === 2 && (
                <div className="coordinates-group">
                  <label>
                    Posición X (0-100)
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newPlaceX}
                      onChange={(e) => setNewPlaceX(Number(e.target.value))}
                      required
                    />
                  </label>
                  <label>
                    Posición Y (0-100)
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newPlaceY}
                      onChange={(e) => setNewPlaceY(Number(e.target.value))}
                      required
                    />
                  </label>
                </div>
              )}

              {addPlaceStep === 3 && (
                <>
                  <label>
                    Foto de portada principal
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCoverImageChange(e.target.files)}
                      required
                    />
                  </label>

                  <label>
                    Fotos del carrusel (puedes seleccionar varias)
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageFilesChange(e.target.files)}
                    />
                  </label>

                  <label>
                    Link del video
                    <input
                      type="url"
                      value={newVideoLink}
                      onChange={(e) => setNewVideoLink(e.target.value)}
                      placeholder="https://"
                    />
                  </label>

                  <label>
                    Link del podcast
                    <input
                      type="url"
                      value={newPodcastLink}
                      onChange={(e) => setNewPodcastLink(e.target.value)}
                      placeholder="https://"
                    />
                  </label>
                </>
              )}

              <div className="form-navigation-buttons">
                {addPlaceStep > 1 ? (
                  <button type="button" className="sidebar-btn-map" onClick={() => setAddPlaceStep(prev => prev - 1)}>
                    Atrás
                  </button>
                ) : (
                  <div></div>
                )}
                
                {addPlaceStep < 3 ? (
                  <button 
                    type="button" 
                    className="sidebar-btn-map" 
                    onClick={() => {
                      if (addPlaceStep === 1 && (!newPlaceName.trim() || !newPlaceDescription.trim())) {
                        alert('Por favor completa el nombre y la historia.');
                        return;
                      }
                      setAddPlaceStep(prev => prev + 1)
                    }}
                  >
                    Siguiente
                  </button>
                ) : (
                  <button className="sidebar-btn-map" type="submit" disabled={isAddingPlace}>
                    {isAddingPlace ? 'Guardando...' : 'Agregar lugar'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {showManagePlacesModal && (
        <ManagePlacesModal onClose={() => setShowManagePlacesModal(false)} />
      )}
    </div>
  );
};

export default Map;
