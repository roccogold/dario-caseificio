import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Questi valori devono essere configurati con le credenziali del tuo progetto Supabase
// In produzione: variabili d'ambiente Vercel
// In sviluppo: file .env (opzionale, usa localStorage se non presente)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Crea un client Supabase solo se le variabili sono configurate
let supabase: SupabaseClient | null = null

if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'your_supabase_project_url') {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  } catch (error) {
    console.warn('Errore nella creazione del client Supabase:', error)
  }
} else {
  console.warn('Supabase non configurato. Usa localStorage come fallback.')
}

export { supabase }
