import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import PointMarker from '../PosicionComponentes/PointMarker';
import PointDetailModal from '../ModalDetalles(Descripcion_Media_Comentarios)/PointDetailModal';
import InfoModal from '../AcercaProyecto/InfoModal';
import AdminAuthModal from '../../../admin/AdminAuthModal';
import AdminLogoutModal from '../../../admin/AdminLogoutModal';
import type { PointOfInterest } from '../../types';
import './Map.css';

const Map = () => {
  const { points, isAdmin, setIsAdmin } = useAppContext();
  const [selectedPoint, setSelectedPoint] = useState<PointOfInterest | null>(null);
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  const [modalOrigin, setModalOrigin] = useState<{ x: number, y: number } | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [showAdminLogout, setShowAdminLogout] = useState(false);

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
            />
          ))}
        </div>
      </div>

      {/* Map Overlay Controls */}
      <div className="map-overlay">

        {/* Top Header */}
        <div className="map-header">
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

          <div className="map-controls-top-right">
            <button className="icon-btn dark-btn" onClick={() => setIsInfoOpen(true)}>i</button>
          </div>
        </div>

        {/* Sidebar Menu for Points */}
        <div className="map-sidebar">
          <h3 className="sidebar-title">Lugares Documentados</h3>
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
                      className="sidebar-btn-map"
                      onClick={(e) => {
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
        </div>



        {/* Bottom Elements */}
        <div className="map-bottom-container">

          {/* Stats Box */}
          <div className="map-stats-box">
            <div className="tag-clip"></div>
            <div className="tag-eyelet"></div>
            <span className="stats-label">Lugares visitados:</span>
            <span className="stats-number">{points.length}</span>
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
    </div>
  );
};

export default Map;
