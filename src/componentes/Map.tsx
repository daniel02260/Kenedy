import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import PointMarker from './PointMarker';
import PointDetailModal from './PointDetailModal';
import InfoModal from './InfoModal';
import AdminAuthModal from './AdminAuthModal';
import AdminLogoutModal from './AdminLogoutModal';
import type { PointOfInterest } from '../types';
import './Map.css';

const Map = () => {
  const { points, isAdmin, setIsAdmin } = useAppContext();
  const [selectedPoint, setSelectedPoint] = useState<PointOfInterest | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [showAdminLogout, setShowAdminLogout] = useState(false);

  const closeModal = () => setSelectedPoint(null);

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
      {/* Background Croquis */}
      <div className="map-background">
        <img src="/img/croquis.png" alt="Croquis Kennedy" className="map-image" />
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

        {/* Dynamic Markers */}
        {points.map((point) => (
          <PointMarker
            key={point.id}
            point={point}
            onClick={() => setSelectedPoint(point)}
          />
        ))}

        {/* Bottom Elements */}
        <div className="map-bottom-container">

          {/* Stats Box */}
          <div className="map-stats-box">
            <span className="stats-label">LUGARES DISPONIBLES</span>
            <span className="stats-number">{points.length}</span>
          </div>

        </div>

      </div>

      {selectedPoint && (
        <PointDetailModal point={selectedPoint} onClose={closeModal} />
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
