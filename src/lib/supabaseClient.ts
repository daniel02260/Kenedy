import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('/// ADVERTENCIA: Credenciales de Supabase no configuradas en el entorno ///');
}

// Para evitar que la aplicación de React se caiga con pantalla blanca en producción (Vercel)
// si aún no se han configurado las Variables de Entorno, inicializamos un placeholder seguro.
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://ezvfzvihepkksqvozlcp.placeholder.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
