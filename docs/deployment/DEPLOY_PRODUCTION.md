# Guida Deployment in Produzione - DARIO

## 🎯 Obiettivo
Deployare l'applicazione DARIO su Vercel con autenticazione Supabase e RLS abilitato.

---

## 📋 Pre-requisiti

- [ ] Tutti i test end-to-end completati con successo
- [ ] Account Vercel creato
- [ ] Progetto Supabase configurato
- [ ] RLS Policies applicate (FASE2_RLS_POLICIES.sql eseguito)
- [ ] Real-time abilitato per le tabelle

---

## 🔧 Step 1: Preparazione Supabase

### 1.1 Verifica Configurazione Supabase

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona il tuo progetto
3. Vai su **Settings** → **API**
4. Copia:
   - **Project URL** (es. `https://xxxxx.supabase.co`)
   - **anon public key** (chiave pubblica)

### 1.2 Verifica RLS Policies

1. Vai su **SQL Editor**
2. Esegui `FASE2_VERIFY_RLS.sql`
3. Verifica che tutte le policy siano presenti:
   - ✅ `formaggi`: 4 policy
   - ✅ `produzioni`: 4 policy
   - ✅ `attività`: 4 policy
   - ✅ `logs`: 1 policy

### 1.3 Verifica Real-time

1. Vai su **Database** → **Replication**
2. Verifica che real-time sia abilitato per:
   - ✅ `formaggi`
   - ✅ `produzioni`
   - ✅ `attività`

### 1.4 Crea Utente di Produzione

1. Vai su **Authentication** → **Users**
2. Clicca **Add User** → **Create new user**
3. Inserisci:
   - Email: `tuo-email@esempio.com`
   - Password: (genera una password sicura)
4. Salva le credenziali in un posto sicuro

---

## 🚀 Step 2: Preparazione Vercel

### 2.1 Connessione Repository

1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Clicca **Add New** → **Project**
3. Connetti il repository GitHub (se non è già connesso)
4. Seleziona il repository `proj-dario`

### 2.2 Configurazione Build

Vercel dovrebbe rilevare automaticamente:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2.3 Variabili d'Ambiente

Aggiungi le seguenti variabili d'ambiente in Vercel:

1. Vai su **Settings** → **Environment Variables**
2. Aggiungi:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANTE**: 
- Sostituisci `xxxxx` con il tuo Project URL reale
- Sostituisci la chiave con la tua anon key reale
- Applica a: **Production**, **Preview**, **Development**

### 2.4 Configurazione Redirect

1. Vai su **Settings** → **Redirects**
2. Aggiungi (se necessario):
   - Source: `/*`
   - Destination: `/index.html`
   - Permanent: `false`

---

## 📦 Step 3: Deploy

### 3.1 Deploy Automatico

1. Vai su **Deployments**
2. Se hai già fatto push su GitHub, Vercel deployerà automaticamente
3. Oppure clicca **Redeploy** sull'ultimo deployment

### 3.2 Deploy Manuale (opzionale)

```bash
# Installa Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd /Users/roccogoldschmidt/Desktop/projects/proj-dario
vercel --prod
```

---

## ✅ Step 4: Verifica Post-Deploy

### 4.1 Test Autenticazione

1. Apri l'URL di produzione (es. `https://dario-caseificio.vercel.app`)
2. Verifica che appaia la pagina di login
3. Prova a fare login con le credenziali Supabase create
4. **Risultato atteso**: Login funzionante e reindirizzamento

### 4.2 Test Funzionalità

1. Testa tutte le funzionalità principali:
   - [ ] Creare formaggio
   - [ ] Creare produzione
   - [ ] Aggiungere attività
   - [ ] Visualizzare statistiche
   - [ ] Logout

### 4.3 Test Real-time

1. Apri l'app in due browser diversi (o finestre incognito)
2. Fai login con lo stesso utente
3. Crea/modifica un formaggio in una finestra
4. **Risultato atteso**: Modifiche visibili in tempo reale nell'altra finestra

### 4.4 Test RLS

1. Prova ad accedere senza essere autenticato (apri in incognito)
2. Prova a fare richieste dirette all'API Supabase
3. **Risultato atteso**: Accesso negato (403 o errore)

---

## 🔒 Step 5: Sicurezza Finale

### 5.1 Verifica RLS

1. Vai su Supabase Dashboard → **SQL Editor**
2. Esegui `FASE2_VERIFY_RLS.sql`
3. Verifica che tutte le policy siano attive

### 5.2 Verifica Autenticazione

1. Assicurati che solo utenti autenticati possano accedere
2. Testa che il logout funzioni correttamente
3. Verifica che le sessioni scadano correttamente

### 5.3 Monitoraggio

1. Vai su Vercel Dashboard → **Analytics**
2. Monitora errori e performance
3. Vai su Supabase Dashboard → **Logs**
4. Monitora le query e gli errori

---

## 🐛 Troubleshooting

### Problema: Variabili d'ambiente non funzionano
**Soluzione**:
- Verifica che le variabili siano aggiunte correttamente
- Assicurati che inizino con `VITE_`
- Riavvia il deployment dopo aver aggiunto le variabili

### Problema: Login non funziona in produzione
**Soluzione**:
- Verifica che `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` siano corrette
- Controlla la console del browser per errori
- Verifica che l'utente esista in Supabase Auth

### Problema: Real-time non funziona
**Soluzione**:
- Verifica che real-time sia abilitato in Supabase Dashboard
- Controlla che le variabili d'ambiente siano corrette
- Verifica la console per errori di connessione

### Problema: RLS blocca tutto
**Soluzione**:
- Verifica che l'utente sia autenticato correttamente
- Controlla che le policy siano configurate correttamente
- Verifica i logs di Supabase per dettagli

---

## 📝 Checklist Pre-Deploy

Prima di fare il deploy, verifica:

- [ ] Tutti i test end-to-end passano
- [ ] Variabili d'ambiente Supabase configurate
- [ ] RLS Policies applicate e verificate
- [ ] Real-time abilitato
- [ ] Utente di produzione creato
- [ ] Repository GitHub aggiornato
- [ ] Build locale funziona (`npm run build`)

---

## 🎉 Post-Deploy

Dopo il deploy:

1. ✅ Testa tutte le funzionalità
2. ✅ Verifica che l'autenticazione funzioni
3. ✅ Monitora errori per 24-48 ore
4. ✅ Documenta eventuali problemi riscontrati

---

**Buon deploy! 🚀**
