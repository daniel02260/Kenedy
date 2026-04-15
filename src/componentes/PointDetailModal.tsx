import { useState } from 'react';
import type { PointOfInterest } from '../types';
import CommentSection from './CommentSection';
import './PointDetailModal.css';

interface PointDetailModalProps {
  point: PointOfInterest;
  onClose: () => void;
}

const PointDetailModal = ({ point, onClose }: PointDetailModalProps) => {
  // Separamos los medios
  const allImages = point.media.filter(m => m.type === 'image');
  const allVideos = point.media.filter(m => m.type === 'video');
  const allPodcasts = point.media.filter(m => m.type === 'podcast');

  const coverImage = allImages.length > 0 ? allImages[0] : null;
  const galleryImages = coverImage ? allImages.slice(1) : allImages;

  // Estado para la sección activa (en vez de mostrar todo de golpe)
  const [activeSection, setActiveSection] = useState<'historia' | 'galeria' | 'videos' | 'podcasts' | 'comentarios'>('historia');

  return (
    <div className="fullscreen-overlay" onClick={onClose}>
      
      {/* Botón flotante círculo */}
      <button className="sticky-close-button" onClick={onClose} title="Cerrar y Volver">&times;</button>
      
      <div className="fullscreen-scroll-container" onClick={(e) => e.stopPropagation()}>
        
        {/* 1. SECCIÓN DE PORTADA / HERO */}
        <div className="fs-hero-section">
          {coverImage ? (
            <img src={coverImage.url} alt={coverImage.title} className="fs-hero-bg" />
          ) : (
            <div className="fs-hero-bg-fallback"></div>
          )}
          <div className="fs-hero-gradient"></div>
          <div className="fs-hero-content">
            <span className="fs-category-pill">EXPLORA KENNEDY</span>
            <h1 className="fs-title">{point.name}</h1>
            <div className="scroll-indicator">
              <span>Desliza hacia abajo</span>
              <div className="arrow-down">↓</div>
            </div>
          </div>
        </div>

        {/* 2. CUERPO DEL DOCUMENTO */}
        <div className="fs-document-body">

          {/* MENÚ DE ANCLAJES / PESTAÑAS (STICKY) */}
          <div className="fs-sticky-nav">
            <button 
              className={activeSection === 'historia' ? 'active' : ''} 
              onClick={() => setActiveSection('historia')}>Historia</button>
            <button 
              className={activeSection === 'galeria' ? 'active' : ''} 
              onClick={() => setActiveSection('galeria')}>Imágenes</button>
            <button 
              className={activeSection === 'videos' ? 'active' : ''} 
              onClick={() => setActiveSection('videos')}>Videos</button>
            <button 
              className={activeSection === 'podcasts' ? 'active' : ''} 
              onClick={() => setActiveSection('podcasts')}>Podcasts</button>
            <button 
              className={activeSection === 'comentarios' ? 'active' : ''} 
              onClick={() => setActiveSection('comentarios')}>Comentarios</button>
          </div>
          
          <div className="fs-section-wrapper">
            {/* --- HISTORIA --- */}
            {activeSection === 'historia' && (
              <section className="fs-section fs-history fade-in">
                <h2 className="section-title">Historia</h2>
                <p className="fs-description">{point.description}</p>
                <div className="fs-location-data">
                  <span className="pin">📍</span> Ubicación asignada: X({point.x}) Y({point.y})
                </div>
              </section>
            )}

            {/* --- CARRUSEL DE IMÁGENES --- */}
            {activeSection === 'galeria' && (
              <section className="fs-section fs-gallery fade-in">
                <h2 className="section-title">Galería Fotográfica</h2>
                {galleryImages.length > 0 ? (
                  <div className="fs-carousel">
                    {galleryImages.map((img, idx) => (
                      <div key={idx} className="carousel-item">
                        <img src={img.url} alt={img.title || `Galería ${idx+1}`} />
                        {img.title && <span className="carousel-caption">{img.title}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-media-text">Aún no hay fotografías adicionales registradas en este archivo.</p>
                )}
              </section>
            )}

            {/* --- VIDEOS --- */}
            {activeSection === 'videos' && (
              <section className="fs-section fs-videos fade-in">
                <h2 className="section-title">Cortometrajes y Videos</h2>
                {allVideos.length > 0 ? (
                  <div className="fs-video-grid">
                    {allVideos.map((vid, idx) => (
                      <div key={idx} className="video-card">
                        <video src={vid.url} controls />
                        {vid.title && <h4 className="media-card-title">{vid.title}</h4>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-media-text">No existen cintas de video registradas para esta ubicación por el momento.</p>
                )}
              </section>
            )}

            {/* --- PODCASTS --- */}
            {activeSection === 'podcasts' && (
              <section className="fs-section fs-podcasts fade-in">
                <h2 className="section-title">Archivo Sonoro (Podcasts)</h2>
                {allPodcasts.length > 0 ? (
                  <div className="fs-podcast-list">
                    {allPodcasts.map((pod, idx) => (
                      <div key={idx} className="podcast-card">
                        <div className="podcast-icon">📻</div>
                        <div className="podcast-player">
                          {pod.title && <h4 className="media-card-title">{pod.title}</h4>}
                          <audio src={pod.url} controls />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-media-text">El fonógrafo de este punto está vacío. No hay grabaciones sonoras.</p>
                )}
              </section>
            )}

            {/* --- COMENTARIOS --- */}
            {activeSection === 'comentarios' && (
              <section className="fs-section fs-comments fade-in">
                <h2 className="section-title">Libro de Visitas (Comentarios)</h2>
                <div className="fs-comments-wrapper">
                  <CommentSection pointId={point.id} />
                </div>
              </section>
            )}
          </div>

          <div className="fs-footer">
            <p>♦ Fin del Recorrido ♦</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PointDetailModal;
