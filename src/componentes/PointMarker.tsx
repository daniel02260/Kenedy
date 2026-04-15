import { type CSSProperties } from 'react';
import type { PointOfInterest } from '../types';
import './PointMarker.css';

interface PointMarkerProps {
  point: PointOfInterest;
  onClick: () => void;
}

const PointMarker = ({ point, onClick }: PointMarkerProps) => {
  // Ajustamos la posición 
  const style: CSSProperties = {
    left: `${point.x}%`, 
    top: `${point.y}%`,
  };

  // Get short name to fit in circle (first word or short)
  const shortName = point.name.split(' ')[0];

  const firstImage = point.media.find(m => m.type === 'image');

  return (
    <div className="point-marker-circle" style={style} onClick={onClick}>
      <div className="circle-inner">
         {firstImage ? (
           <img src={firstImage.url} alt={shortName} className="stamp-image" />
         ) : (
           <span className="circle-text">{shortName}</span>
         )}
      </div>
      <div className="point-tooltip">Ver más de {point.name}</div>
    </div>
  );
};

export default PointMarker;
