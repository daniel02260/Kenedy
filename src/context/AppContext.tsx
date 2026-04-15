import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { PointOfInterest, Comment } from '../types';
import { allPoints } from '../data/puntos';

interface AppContextType {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  points: PointOfInterest[];
  addComment: (pointId: string, comment: Comment) => void;
  deleteComment: (pointId: string, commentId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [points, setPoints] = useState<PointOfInterest[]>(() => {
    const saved = localStorage.getItem('kennedy_points');
    if (saved) {
      try {
        const parsedSaved: PointOfInterest[] = JSON.parse(saved);
        return allPoints.map(staticPoint => {
          const savedPoint = parsedSaved.find(p => p.id === staticPoint.id);
          if (savedPoint) {
             return { ...staticPoint, comments: savedPoint.comments || [] };
          }
          return staticPoint;
        });
      } catch (e) {
        console.error("Error al parsear puntos guardados, limpiando memoria.", e);
        localStorage.removeItem('kennedy_points');
        return allPoints;
      }
    }
    return allPoints;
  });

  useEffect(() => {
    localStorage.setItem('kennedy_points', JSON.stringify(points));
  }, [points]);

  const addComment = (pointId: string, comment: Comment) => {
    setPoints(prevPoints => 
      prevPoints.map(point => {
        if (point.id === pointId) {
          return { ...point, comments: [...point.comments, comment] };
        }
        return point;
      })
    );
  };

  const deleteComment = (pointId: string, commentId: string) => {
    setPoints(prevPoints => 
      prevPoints.map(point => {
        if (point.id === pointId) {
          return { ...point, comments: point.comments.filter(c => c.id !== commentId) };
        }
        return point;
      })
    );
  };

  return (
    <AppContext.Provider value={{ isAdmin, setIsAdmin, points, addComment, deleteComment }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within a AppProvider');
  }
  return context;
};
