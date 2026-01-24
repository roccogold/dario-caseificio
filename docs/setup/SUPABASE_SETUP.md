# Setup Supabase per Dario

Questa guida ti aiuterà a configurare Supabase per condividere i dati tra tutti gli utenti.

## Passo 1: Crea un progetto Supabase

1. Vai su [https://supabase.com](https://supabase.com)
2. Crea un account (gratuito)
3. Clicca "New Project"
4. Compila:
   - **Name**: `dario-caseificio` (o il nome che preferisci)
   - **Database Password**: scegli una password sicura (salvala!)
   - **Region**: scegli la più vicina (es. `West Europe`)
5. Clicca "Create new project" e attendi il completamento (2-3 minuti)

## Passo 2: Crea le tabelle del database

1. Nel dashboard Supabase, vai su **SQL Editor** (menu laterale)
2. Clicca **New Query**
3. Copia e incolla tutto il contenuto del file `supabase-schema.sql`
4. Clicca **Run** (o premi Cmd/Ctrl + Enter)
5. Verifica che tutte le tabelle siano state create:
   - Vai su **Table Editor** nel menu laterale
   - Dovresti vedere: `formaggi`, `produzioni`, `attività`, `logs`

## Passo 3: Ottieni le credenziali API

1. Nel dashboard Supabase, vai su **Settings** (icona ingranaggio)
2. Clicca su **API**
3. Trova:
   - **Project URL** (es. `https://xxxxx.supabase.co`)
   - **anon public** key (una chiave lunga che inizia con `eyJ...`)

## Passo 4: Configura le variabili d'ambiente

1. Crea un file `.env` nella root del progetto (se non esiste già)
2. Aggiungi:

```env
VITE_SUPABASE_URL=il_tuo_project_url
VITE_SUPABASE_ANON_KEY=la_tua_anon_key
```

**Esempio:**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Passo 5: Testa la connessione

1. Riavvia il server di sviluppo: `npm run dev`
2. Accedi all'applicazione
3. Apri la console del browser (F12)
4. Dovresti vedere messaggi di connessione a Supabase
5. Prova a creare un formaggio o una produzione
6. Verifica che i dati appaiano nella tabella **Table Editor** di Supabase

## Passo 6: Deploy su Vercel

1. Aggiungi le variabili d'ambiente in Vercel:
   - Vai su [vercel.com](https://vercel.com)
   - Seleziona il progetto `dario-caseificio`
   - Vai su **Settings** → **Environment Variables**
   - Aggiungi:
     - `VITE_SUPABASE_URL` = il tuo Project URL
     - `VITE_SUPABASE_ANON_KEY` = la tua anon key
2. Fai un nuovo deploy: `vercel --prod`

## Funzionalità Real-Time

Una volta configurato, l'applicazione:
- ✅ Salva **tutti i dati** su Supabase (formaggi, produzioni, attività) - condivisi tra utenti
- ✅ Aggiorna automaticamente quando un altro utente fa modifiche (real-time)
- ✅ Registra tutte le azioni nella tabella `logs` (IP, username, azione, ora)
- ✅ Fallback a localStorage se Supabase non è configurato

## Troubleshooting

**Problema**: "Supabase non configurato, uso localStorage"
- **Soluzione**: Verifica che le variabili d'ambiente siano corrette nel file `.env`

**Problema**: Errore "relation does not exist"
- **Soluzione**: Esegui di nuovo lo script SQL in `supabase-schema.sql`

**Problema**: Errore di permessi
- **Soluzione**: Verifica che le policy RLS siano state create correttamente (dovrebbero permettere tutte le operazioni)

**Problema**: I dati non si aggiornano in tempo reale
- **Soluzione**: Verifica che Real-time sia abilitato in Supabase (Settings → API → Realtime)

## Sicurezza

⚠️ **Importante**: Le policy attuali permettono a chiunque (con la anon key) di leggere e scrivere. Per produzione:

1. Implementa autenticazione Supabase
2. Crea policy RLS più restrittive
3. Usa la `service_role` key solo lato server (mai nel frontend)

Per ora, con la anon key, solo chi ha accesso all'URL può vedere/modificare i dati.
