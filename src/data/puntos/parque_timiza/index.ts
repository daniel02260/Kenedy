import type { PointOfInterest } from '../../../types';

export const parqueTimiza: PointOfInterest = {
  id: 'p_timiza',
  name: 'Parque Timiza',
  description: 'Un gran parque urbano, ideal para recreación y deporte.',
  x: 40,
  y: 75,
  media: [
    { type: 'image', url: '/img/img_parquetimiza/parque_timiza_1.jpg', title: 'Lago del Parque Timiza' },
    { type: 'podcast', url: '/img/img_parquetimiza/parque_timiza_podcast.wav', title: 'Historia Viva: Los orígenes de Timiza' },
    { type: 'video', url: '/img/img_parquetimiza/Parque Metropolitano Timiza .mp4', title: 'Recorrido en bici' }
  ],
  comments: []
};
