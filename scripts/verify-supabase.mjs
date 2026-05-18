/**
 * ==========================================================
 *  SCRIPT DE VERIFICACIÓN DE CONEXIÓN CON SUPABASE
 *  Ejecutar con:  node scripts/verify-supabase.mjs
 * ==========================================================
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── 1. Leer las variables del .env.local manualmente ───────
const envPath = resolve('.env.local');
let envVars = {};
try {
  const content = readFileSync(envPath, 'utf-8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim();
        const val = trimmed.substring(eqIdx + 1).trim();
        envVars[key] = val;
      }
    }
  });
} catch (e) {
  console.error('❌ No se encontró el archivo .env.local en la raíz del proyecto.');
  process.exit(1);
}

// ── 2. Verificar que las variables existen ─────────────────
const url = envVars['VITE_SUPABASE_URL'];
const anonKey = envVars['VITE_SUPABASE_ANON_KEY'];

console.log('\n══════════════════════════════════════════');
console.log('   VERIFICACIÓN DE SUPABASE — KENEDY');
console.log('══════════════════════════════════════════\n');

console.log('📄 Archivo .env.local encontrado ✅');
console.log(`   VITE_SUPABASE_URL     = ${url ? url : '❌ NO DEFINIDO'}`);
console.log(`   VITE_SUPABASE_ANON_KEY = ${anonKey ? anonKey.substring(0, 30) + '...' : '❌ NO DEFINIDO'}`);

if (!url || !anonKey) {
  console.error('\n❌ Faltan credenciales obligatorias. Revisa tu .env.local');
  process.exit(1);
}

// ── 3. Crear cliente y probar conexión ─────────────────────
const supabase = createClient(url, anonKey);

console.log('\n─── Probando conexión con Supabase... ───\n');

// ── 4. Verificar tabla "administrators" ────────────────────
try {
  const { data: admins, error: admErr } = await supabase
    .from('administrators')
    .select('*')
    .limit(10);

  if (admErr) {
    console.error('❌ TABLA administrators — ERROR:', admErr.message);
    if (admErr.message.includes('does not exist')) {
      console.error('   → La tabla "administrators" NO existe en Supabase.');
      console.error('   → Debes ejecutar el SQL de creación de tablas en el SQL Editor de Supabase.');
    }
    if (admErr.message.includes('permission denied') || admErr.code === '42501') {
      console.error('   → Problema de permisos RLS. Revisa las políticas de seguridad.');
    }
  } else {
    console.log(`✅ TABLA administrators — Conectada. Registros encontrados: ${admins.length}`);
    if (admins.length > 0) {
      admins.forEach((a, i) => {
        console.log(`   [${i+1}] email: ${a.email} | must_change_password: ${a.must_change_password}`);
      });
    } else {
      console.log('   ⚠️  La tabla está vacía. No hay administradores registrados aún.');
      console.log('   → Usa el SQL Editor de Supabase para insertar tu primer admin.');
    }
  }
} catch (e) {
  console.error('❌ Error de red al consultar administrators:', e.message);
}

// ── 5. Verificar tabla "comments" ──────────────────────────
try {
  const { data: comments, error: comErr } = await supabase
    .from('comments')
    .select('*')
    .limit(10);

  if (comErr) {
    console.error('❌ TABLA comments — ERROR:', comErr.message);
    if (comErr.message.includes('does not exist')) {
      console.error('   → La tabla "comments" NO existe en Supabase.');
    }
    if (comErr.message.includes('permission denied') || comErr.code === '42501') {
      console.error('   → Problema de permisos RLS. Revisa las políticas de seguridad.');
    }
  } else {
    console.log(`✅ TABLA comments — Conectada. Registros encontrados: ${comments.length}`);
    if (comments.length > 0) {
      comments.forEach((c, i) => {
        console.log(`   [${i+1}] author: ${c.author} | point_id: ${c.point_id} | text: ${c.text?.substring(0, 40)}...`);
      });
    } else {
      console.log('   ⚠️  La tabla está vacía. No hay comentarios aún.');
    }
  }
} catch (e) {
  console.error('❌ Error de red al consultar comments:', e.message);
}

// ── 6. Prueba de escritura y borrado en administrators ─────
console.log('\n─── Prueba de escritura (INSERT + DELETE) ───\n');
const testEmail = `_test_verify_${Date.now()}@test.com`;
try {
  const { data: insertData, error: insertErr } = await supabase
    .from('administrators')
    .insert([{ email: testEmail, password: 'test123456', must_change_password: true }])
    .select();

  if (insertErr) {
    console.error('❌ INSERT en administrators FALLÓ:', insertErr.message);
    if (insertErr.code === '42501' || insertErr.message.includes('policy')) {
      console.error('   → Las políticas RLS están BLOQUEANDO la escritura.');
      console.error('   → Necesitas agregar una política INSERT para la tabla administrators.');
    }
  } else {
    console.log('✅ INSERT en administrators — Exitoso');

    // Limpiar el registro de prueba
    const { error: delErr } = await supabase
      .from('administrators')
      .delete()
      .eq('email', testEmail);

    if (delErr) {
      console.error('⚠️  DELETE del registro de prueba falló:', delErr.message);
      console.error('   → Elimina manualmente el registro de prueba: ' + testEmail);
    } else {
      console.log('✅ DELETE del registro de prueba — Limpieza exitosa');
    }
  }
} catch (e) {
  console.error('❌ Error de red en prueba de escritura:', e.message);
}

// ── 7. Resumen final ───────────────────────────────────────
console.log('\n══════════════════════════════════════════');
console.log('   VERIFICACIÓN COMPLETADA');
console.log('══════════════════════════════════════════');
console.log('');
console.log('ℹ️  Si ves ❌ arriba, revisa:');
console.log('   1. Que las tablas existan en Supabase (SQL Editor)');
console.log('   2. Que las políticas RLS permitan lectura/escritura');
console.log('   3. Que las credenciales en .env.local sean correctas');
console.log('');
