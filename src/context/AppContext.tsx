/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { PointOfInterest, Comment } from '../types';
import { allPoints } from '../data/puntos';

interface AppContextType {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  points: PointOfInterest[];
  addPoint: (point: Omit<PointOfInterest, 'id' | 'comments'>) => void;
  editPoint: (id: string, updates: Partial<PointOfInterest>) => void;
  deletePoint: (id: string) => void;
  addComment: (pointId: string, comment: Comment) => void;
  editComment: (pointId: string, commentId: string, newText: string) => void;
  deleteComment: (pointId: string, commentId: string) => void;
  likeComment: (pointId: string, commentId: string) => void;
  isFirstVisit: boolean;
  markFirstVisitDone: () => void;
  visitedPoints: string[];
  markPointAsVisited: (id: string) => void;
  previewPoint: { x: number; y: number } | null;
  setPreviewPoint: (point: { x: number; y: number } | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [previewPoint, setPreviewPoint] = useState<{ x: number; y: number } | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(() => {
    const visited = localStorage.getItem('kennedy_first_visit');
    return !visited;//si no hay visited, es la primera vez
  });
  const [visitedPoints, setVisitedPoints] = useState<string[]>(() => {
    const saved = localStorage.getItem('kennedy_visited_points');
    return saved ? JSON.parse(saved) : [];
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

  useEffect(() => {
    localStorage.setItem('kennedy_visited_points', JSON.stringify(visitedPoints));
  }, [visitedPoints]);

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

  const editComment = (pointId: string, commentId: string, newText: string) => {
    setPoints(prevPoints => 
      prevPoints.map(point => {
        if (point.id === pointId) {
          return {
            ...point,
            comments: point.comments.map(c => 
              c.id === commentId ? { ...c, text: newText } : c
            )
          };
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

  const addPoint = (point: Omit<PointOfInterest, 'id' | 'comments'>) => {
    setPoints(prevPoints => [
      ...prevPoints,
      {
        ...point,
        id: crypto.randomUUID(),
        comments: []
      }
    ]);
  };

  const editPoint = (id: string, updates: Partial<PointOfInterest>) => {
    setPoints(prevPoints =>
      prevPoints.map(point =>
        point.id === id ? { ...point, ...updates } : point
      )
    );
  };

  const deletePoint = (id: string) => {
    setPoints(prevPoints => prevPoints.filter(point => point.id !== id));
  };

  const markFirstVisitDone = () => {
    localStorage.setItem('kennedy_first_visit', 'true');
    setIsFirstVisit(false);
  };

  const markPointAsVisited = (id: string) => {
    setVisitedPoints(prev => {
      if (!prev.includes(id)) {
        return [...prev, id];
      }
      return prev;
    });
  };

  return (
    <AppContext.Provider value={{ isAdmin, setIsAdmin, points, addPoint, editPoint, deletePoint, addComment, editComment, deleteComment, likeComment, isFirstVisit, markFirstVisitDone, visitedPoints, markPointAsVisited, previewPoint, setPreviewPoint }}>
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
