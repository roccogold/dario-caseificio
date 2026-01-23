import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Questi valori devono essere configurati con le credenziali del tuo progetto Supabase
// In produzione: variabili d'ambiente Vercel
// In sviluppo: file .env (opzionale, usa localStorage se non presente)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Crea un client Supabase solo se le variabili sono configurate
let supabase: SupabaseClient | null = null

const isProduction = import.meta.env.PROD;

if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'your_supabase_project_url') {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
    console.log('[supabase] ✅ Client initialized successfully');
    
    // In produzione, verifica che il client funzioni
    if (isProduction) {
      // Test rapido della connessione
      supabase.from('formaggi').select('id').limit(1).then(({ error }) => {
        if (error) {
          console.error('[supabase] ❌ Connection test failed:', error);
        } else {
          console.log('[supabase] ✅ Connection test passed');
        }
      }).catch(err => {
        console.error('[supabase] ❌ Connection test error:', err);
      });
    }
  } catch (error) {
    console.error('[supabase] ❌ Errore nella creazione del client Supabase:', error);
    if (isProduction) {
      console.error('[supabase] FATAL: Cannot initialize Supabase in production!');
    }
  }
} else {
  if (isProduction) {
    console.error('[supabase] ❌ FATAL: Supabase non configurato in produzione!');
    console.error('[supabase] SUPABASE_URL:', SUPABASE_URL ? 'Present' : 'MISSING');
    console.error('[supabase] SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'Present' : 'MISSING');
  } else {
    console.warn('[supabase] ⚠️ Supabase non configurato. Usa localStorage come fallback (development mode).');
  }
}

export { supabase }
