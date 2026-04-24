import { type CSSProperties } from 'react';
import type { PointOfInterest } from '../../types';
import './PointMarker.css';

interface PointMarkerProps {
  point: PointOfInterest;
  onClick: (e?: React.MouseEvent) => void;
  isHighlighted?: boolean;
}

const PointMarker = ({ point, onClick, isHighlighted }: PointMarkerProps) => {
  // Ajustamos la posición 
  const style: CSSProperties = {
    left: `${point.x}%`, 
    top: `${point.y}%`,
  };

  // Get short name to fit in circle (first word or short)
  const shortName = point.name.split(' ')[0];

  const firstImage = point.media.find(m => m.type === 'image');
  
  // Condición especial: Humedal el Burro abre su tooltip hacia arriba para no tapar los de abajo
  const isTooltipUp = point.name.includes("Humedal") || point.name.includes("Burro");

  return (
    <div 
      className={`point-marker-circle ${isHighlighted ? 'highlighted' : ''} ${isTooltipUp ? 'tooltip-up' : ''}`} 
      style={style} 
      onClick={onClick}
    >
      <div className="circle-inner">
         {firstImage ? (
           <img src={firstImage.url} alt={shortName} className="stamp-image" />
         ) : (
           <span className="circle-text">{shortName}</span>
         )}
      </div>
      <div className="point-tooltip">
        <h4 className="tooltip-title">{point.name}</h4>
        <div className="tooltip-divider"></div>
        <p className="tooltip-desc">{point.description}</p>
        <div className="tooltip-stitch"></div>
        <span className="corner-decor top-left"></span>
        <span className="corner-decor top-right"></span>
        <span className="corner-decor bottom-left"></span>
        <span className="corner-decor bottom-right"></span>
      </div>
    </div>
  );
};

export default PointMarker;
