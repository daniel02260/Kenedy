import type { PointOfInterest } from '../../../types';

export const parqueTimiza: PointOfInterest = {
  id: 'p_timiza',
  name: 'Parque Timiza',
  description: 'Un gran parque urbano, ideal para recreación y deporte.',
  x: 40,
  y: 75,
  media: [
    { type: 'image', url: 'public/img/img_parquetimiza/parque_timiza_1.jpg', title: 'Lago del Parque Timiza' },
    { type: 'podcast', url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3', title: 'Historia Viva: Los orígenes de Timiza' }
  ],
  comments: []
};
