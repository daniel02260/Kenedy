import type { PointOfInterest } from '../../../types';

export const parqueTimiza: PointOfInterest = {
  id: 'p1',
  name: 'Monumento a las Banderas',
  description: 'Un gran parque urbano en la localidad de Kennedy, ideal para recreación y deporte.',
  x: 58,
  y: 45,
  media: [
    { type: 'image', url: '/img/Banderas.png', title: 'Monumento a las Banderas' },
    { type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Recorrido en bici' }
  ],
  comments: [] // inicial vacío, la app fusiona los guardados
};
