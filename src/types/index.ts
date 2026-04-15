export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface Media {
  type: 'image' | 'video' | 'podcast';
  url: string;
  title: string;
  thumbnail?: string; // para videos/podcasts si aplica
}

export interface PointOfInterest {
  id: string;
  name: string;
  description: string;
  x: number; // porcentaje horizontal 0-100 en el croquis
  y: number; // porcentaje vertical 0-100 en el croquis
  media: Media[];
  comments: Comment[];
}
