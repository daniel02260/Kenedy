import { useState, useRef, useEffect } from 'react';
import type { PointOfInterest } from '../../types';
import CommentSection from '../Comentarios/CommentSection';
import './PointDetailModal.css';

interface PointDetailModalProps {
  point: PointOfInterest;
  onClose: () => void;
  originX?: number;
  originY?: number;
}

const CassettePlayer = ({ podcast }: { podcast: { url: string, title?: string } }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      audioRef.current.volume = volume;
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.error('Error loading audio:', e);
    // Intentar recargar el audio
    if (audioRef.current) {
      audioRef.current.load();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Number(e.target.value);
      setProgress(Number(e.target.value));
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`cassette-component ${isPlaying ? 'playing' : ''}`}>
      <div className="cassette-tape">
        <div className="cassette-screw screw-tl"></div>
        <div className="cassette-screw screw-tr"></div>
        <div className="cassette-screw screw-bl"></div>
        <div className="cassette-screw screw-br"></div>

        <div className="cassette-sticker">
          <div className="cassette-title-bar">
            <span>KENNEDY ARCHIVE</span>
            <span>SIDE A</span>
          </div>
          
          <div className="cassette-window">
            <div className="cassette-tape-line"></div>
            <div className="cassette-reel cassette-reel-left">
              <div className="reel-center">
                <div className="reel-teeth"></div>
              </div>
            </div>
            <div className="cassette-reel cassette-reel-right">
              <div className="reel-center">
                <div className="reel-teeth"></div>
              </div>
            </div>
          </div>
          
          <h4 className="cassette-title">{podcast.title || 'Grabación en Cinta'}</h4>
        </div>

        <div className="cassette-bottom">
          <div className="trap-hole"></div>
          <div className="trap-hole"></div>
          <div className="trap-hole"></div>
        </div>
      </div>

      {/* VINTAGE DECK CONTROLS */}
      <div className="deck-controls-container">
        <div className="deck-progress-section">
          <span className="deck-time">{formatTime(progress)}</span>
          <input
            type="range"
            className="deck-slider"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={handleSeek}
          />
          <span className="deck-time">{formatTime(duration)}</span>
        </div>

        <div className="deck-lower-controls">
          <div className="deck-buttons">
            <button className="deck-btn" onClick={handleStop} title="Detener">
              <span className="deck-btn-icon">■</span>
              <span className="deck-btn-label">STOP</span>
            </button>

            <button className={`deck-btn ${isPlaying ? 'active' : ''}`} onClick={togglePlay} title={isPlaying ? "Pausar" : "Reproducir"}>
              <span className="deck-btn-icon">{isPlaying ? "❚❚" : "▶"}</span>
              <span className="deck-btn-label">{isPlaying ? "PAUSE" : "PLAY"}</span>
            </button>
          </div>

          <div className="deck-mixer">
            <span className="mixer-icon">{volume === 0 ? "🔇" : "🔉"}</span>
            <input
              type="range"
              className="deck-slider volume-slider"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolumeChange}
              title="Volumen"
            />
          </div>
        </div>

        <audio
          ref={audioRef}
          src={podcast.url}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => { setIsPlaying(false); setProgress(0); }}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={handleError}
          preload="metadata"
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

const PointDetailModal = ({ point, onClose, originX, originY }: PointDetailModalProps) => {
  // Separamos los medios
  const allImages = point.media.filter(m => m.type === 'image');
  const allVideos = point.media.filter(m => m.type === 'video');
  const allPodcasts = point.media.filter(m => m.type === 'podcast');

  const coverImage = allImages.length > 0 ? allImages[0] : null;
  const galleryImages = allImages; // Mostrar TODAS las imágenes en la galería para que siempre haya fotos interactivas

  // Estado para la sección activa (en vez de mostrar todo de golpe)
  const [activeSection, setActiveSection] = useState<'historia' | 'galeria' | 'videos' | 'podcasts' | 'comentarios'>('historia');

  // Estado para la imagen en pantalla completa (Lightbox)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);
  const isHoveredCarousel = useRef(false);

  // Lógica de auto-scroll continuo para la galería
  useEffect(() => {
    if (activeSection !== 'galeria' || galleryImages.length <= 1) return;

    let animationFrameId: number;

    const scroll = () => {
      const el = carouselRef.current;
      if (el && !isHoveredCarousel.current && !lightboxImage) {
        el.scrollLeft += 1; // 1 pixel por frame = fluido y constante

        // Al llegar a la mitad (el final del primer set original), saltar invisiblemente al inicio real
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeSection, galleryImages.length, lightboxImage]);
  return (
    <div
      className="fullscreen-overlay"
      onClick={onClose}
      style={{
        '--origin-x': originX !== undefined ? `${originX}px` : '50%',
        '--origin-y': originY !== undefined ? `${originY}px` : '50%'
      } as React.CSSProperties}
    >

      {/* EFECTO MÁGICO: La foto misma crece a pantalla completa (Morph) */}
      <div
        className="hero-morph-image"
        style={{ backgroundImage: coverImage ? `url(${coverImage.url})` : 'none' }}
      ></div>

      {/* Contenido real del modal que entra por fade sin obstruir la animación */}
      <div className="fullscreen-content-fadein" onClick={(e) => e.stopPropagation()}>

        {/* Botón flotante círculo */}
        <button className="sticky-close-button" onClick={onClose} title="Cerrar y Volver">&times;</button>

        <div className="fullscreen-scroll-container" onClick={(e) => e.stopPropagation()}>

          {/* 1. SECCIÓN DE PORTADA / HERO */}
          <div className="fs-hero-section">
            {coverImage ? (
              <img
                src={coverImage.url}
                alt={coverImage.title}
                className="fs-hero-bg"
                style={{ cursor: 'zoom-in' }}
                onClick={() => setLightboxImage(coverImage.url)}
                title="Ampliar imagen"
              />
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
                onClick={() => setActiveSection('historia')}>Cronicas</button>
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
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point.name + " Kennedy Bogotá Colombia")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fs-location-data"
                    title="Abrir ubicación en Google Maps"
                  >
                    <span className="pin">🗺️</span> Abrir ubicación en Google Maps ➔
                  </a>
                </section>
              )}

              {/* --- CARRUSEL DE IMÁGENES --- */}
              {activeSection === 'galeria' && (
                <section className="fs-section fs-gallery fade-in">
                  <h2 className="section-title">Galería Fotográfica</h2>
                  {galleryImages.length > 0 ? (
                    <div
                      className="fs-carousel"
                      ref={carouselRef}
                      onMouseEnter={() => { isHoveredCarousel.current = true; }}
                      onMouseLeave={() => { isHoveredCarousel.current = false; }}
                      onTouchStart={() => { isHoveredCarousel.current = true; }}
                      onTouchEnd={() => { setTimeout(() => { isHoveredCarousel.current = false; }, 2000); }}
                    >                    {[...galleryImages, ...galleryImages].map((img, idx) => (
                      <div key={idx} className="carousel-item">
                        <img
                          src={img.url}
                          alt={img.title || `Galería ${idx + 1}`}
                          onClick={() => setLightboxImage(img.url)}
                          className="polaroid-photo"
                        />
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
                        <div key={idx} className="video-card cinema-screen-wrapper">
                          <div className="cinema-stage">
                            <div className="cinema-screen-container">
                              {vid.url.includes('youtube.com/embed') ? (
                                <iframe 
                                  src={vid.url} 
                                  className="cinema-video"
                                  allowFullScreen 
                                  title={vid.title}
                                ></iframe>
                              ) : (
                                <video 
                                  src={vid.url} 
                                  controls 
                                  className="cinema-video"
                                  preload="metadata"
                                  crossOrigin="anonymous"
                                >
                                  <p>Tu navegador no soporta video HTML5. Por favor actualiza tu navegador.</p>
                                </video>
                              )}
                              <div className="cinema-projector-glow"></div>
                            </div>
                          </div>
                          {vid.title && <h4 className="media-card-title cinema-title">{vid.title}</h4>}
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
                        <CassettePlayer key={idx} podcast={pod} />
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

      {/* Lightbox Fullscreen Overlay */}
      {lightboxImage && (
        <div
          className="lightbox-overlay"
          onClick={(e) => {
            e.stopPropagation(); // BUG FIX: Evitar que el click cierre TODO el mapa
            setLightboxImage(null);
          }}
        >
          <button className="lightbox-close">&times;</button>
          <img src={lightboxImage} alt="Imagen expandida" className="lightbox-image" />
        </div>
      )}
    </div>
  );
};

export default PointDetailModal;
