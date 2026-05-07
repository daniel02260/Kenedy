/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { PointOfInterest, Comment } from '../types';
import { allPoints } from '../data/puntos';

interface AppContextType {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  points: PointOfInterest[];
  addComment: (pointId: string, comment: Comment) => void;
  deleteComment: (pointId: string, commentId: string) => void;
  likeComment: (pointId: string, commentId: string) => void;
  isFirstVisit: boolean;
  markFirstVisitDone: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(() => {
    const visited = localStorage.getItem('kennedy_first_visit');
    return !visited;//si no hay visited, es la primera vez
  });
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

  const likeComment = (pointId: string, commentId: string) => {
    setPoints(prevPoints => 
      prevPoints.map(point => {
        if (point.id === pointId) {
          return {
            ...point,
            comments: point.comments.map(c => 
              c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c
            )
          };
        }
        return point;
      })
    );
  };

  const markFirstVisitDone = () => {
    localStorage.setItem('kennedy_first_visit', 'true');
    setIsFirstVisit(false);
  };

  return (
    <AppContext.Provider value={{ isAdmin, setIsAdmin, points, addComment, deleteComment, likeComment, isFirstVisit, markFirstVisitDone }}>
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
