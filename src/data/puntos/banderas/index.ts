import type { PointOfInterest } from '../../../types';

export const monumentoBanderas: PointOfInterest = {
  id: 'p_banderas',
  name: 'Monumento a las Banderas',
  description: 'Ubicado en el corazón de la localidad, este monumento representa el panamericanismo y es un símbolo histórico y cultural de Kennedy.',
  x: 58,
  y: 45,
  media: [
    { type: 'image', url: '/img/Banderas.png', title: 'Monumento a las Banderas' },
    { type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Recorrido en bici' }
  ],
  comments: [] // inicial vacío, la app fusiona los guardados
};
