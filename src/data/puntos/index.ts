import type { PointOfInterest } from '../../types';
import { parqueTimiza } from './parque_timiza';
import { monumentoBanderas } from './banderas';
import { humedalElBurro } from './humedal_el_burro';
import { corabastos } from './corabastos';

// Aquí vas agregando todos los puntos que vayas creando
export const allPoints: PointOfInterest[] = [
  parqueTimiza,
  monumentoBanderas,
  humedalElBurro,
  corabastos
];
