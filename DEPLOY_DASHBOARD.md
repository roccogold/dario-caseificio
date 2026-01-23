# 🚀 Deploy via Vercel Dashboard - Guida Passo-Passo

## ✅ STEP 1: Preparazione Supabase (2 minuti)

### 1.1 Ottieni le Credenziali

1. Apri [Supabase Dashboard](https://app.supabase.com) in una nuova tab
2. Seleziona il tuo progetto
3. Clicca su **Settings** (icona ingranaggio in basso a sinistra)
4. Clicca su **API** nel menu laterale
5. Nella sezione **Project API keys**, troverai:
   - **Project URL**: `https://xxxxx.supabase.co` ← COPIA QUESTO
   - **anon public** key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` ← COPIA QUESTO

**⚠️ IMPORTANTE**: Tieni aperta questa pagina, ti servirà tra poco!

### 1.2 Crea Utente di Produzione (se non l'hai già fatto)

1. Nella stessa tab Supabase, vai su **Authentication** (sidebar sinistra)
2. Clicca su **Users**
3. Clicca sul pulsante **Add User** (in alto a destra)
4. Seleziona **Create new user**
5. Compila:
   - **Email**: `dario@corzanoepaterno.com` (o quella che preferisci)
   - **Password**: (genera una password sicura, minimo 8 caratteri)
   - **Auto Confirm User**: ✅ **SPUNTA QUESTA OZIONE** (importante!)
6. Clicca **Create User**
7. **SALVA LE CREDENZIALI** in un file di testo:
   ```
   Email: dario@corzanoepaterno.com
   Password: [la password che hai scelto]
   ```

**✅ Step 1 completato!** Hai:
- Project URL di Supabase
- anon key di Supabase
- Utente creato con credenziali salvate

---

## 🌐 STEP 2: Configurazione Vercel (3 minuti)

### 2.1 Accedi a Vercel

1. Apri [Vercel Dashboard](https://vercel.com/dashboard) in una nuova tab
2. Accedi con il tuo account (GitHub, GitLab, o email)

### 2.2 Trova il Progetto

**Cerca il progetto `dario-caseificio` o `proj-cheese-production` nella lista.**

Se lo trovi:
- Clicca sul nome del progetto

Se NON lo trovi:
- Clicca **Add New** → **Project**
- Connetti il repository GitHub (se non è già connesso)
- Seleziona il repository che contiene il codice DARIO
- Vercel dovrebbe rilevare automaticamente:
  - Framework: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`
- Clicca **Deploy** (per ora, aggiungeremo le variabili dopo)

### 2.3 Aggiungi Variabili d'Ambiente

1. Nel progetto Vercel, clicca su **Settings** (in alto nella barra)
2. Nel menu laterale sinistro, clicca su **Environment Variables**
3. Vedrai una lista vuota o con variabili esistenti

**Aggiungi la prima variabile:**

4. Clicca sul campo **Name** e scrivi: `VITE_SUPABASE_URL`
5. Clicca sul campo **Value** e incolla il **Project URL** che hai copiato da Supabase (es. `https://xxxxx.supabase.co`)
6. **IMPORTANTE**: Seleziona tutte e tre le checkbox:
   - ☑️ **Production**
   - ☑️ **Preview**
   - ☑️ **Development**
7. Clicca **Save**

**Aggiungi la seconda variabile:**

8. Clicca **Add Another** (o il pulsante +)
9. Clicca sul campo **Name** e scrivi: `VITE_SUPABASE_ANON_KEY`
10. Clicca sul campo **Value** e incolla l'**anon public key** che hai copiato da Supabase (es. `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
11. **IMPORTANTE**: Seleziona tutte e tre le checkbox:
    - ☑️ **Production**
    - ☑️ **Preview**
    - ☑️ **Development**
12. Clicca **Save**

**✅ Step 2 completato!** Hai:
- Variabili d'ambiente configurate
- Progetto pronto per il deploy

---

## 🚀 STEP 3: Deploy (1 minuto)

### 3.1 Redeploy con le Nuove Variabili

1. Vai su **Deployments** (in alto nella barra)
2. Vedrai una lista di deployment (se il progetto esiste già)
3. Trova l'ultimo deployment (quello più in alto)
4. Clicca sui **tre puntini** (⋯) accanto al deployment
5. Seleziona **Redeploy**
6. Nella finestra che si apre:
   - Lascia **Use existing Build Cache** spuntato (opzionale)
   - Clicca **Redeploy**

**Attendi 2-3 minuti** mentre Vercel fa il build e il deploy.

### 3.2 Verifica il Deploy

1. Quando il deploy è completato, vedrai un badge verde **Ready**
2. Clicca sul deployment per vedere i dettagli
3. In alto vedrai l'URL del sito: `https://dario-caseificio.vercel.app/` (o simile)
4. **Clicca sull'URL** per aprire il sito

**✅ Step 3 completato!** Il sito è online!

---

## ✅ STEP 4: Test e Verifica (2 minuti)

### 4.1 Test Login

1. Dovresti vedere la pagina di login di DARIO
2. Inserisci le credenziali che hai creato in Supabase:
   - **Email**: `dario@corzanoepaterno.com` (o quella che hai scelto)
   - **Password**: (la password che hai scelto)
3. Clicca **Accedi**

**Risultato atteso**: Login funzionante e reindirizzamento a `/calendario`

### 4.2 Test Dati

1. Dopo il login, vai su **Formaggi**
2. Clicca **Nuovo Formaggio**
3. Crea un formaggio di test (es. "Pecorino Test")
4. Salva
5. Vai su Supabase Dashboard → **Table Editor** → `formaggi`
6. **Risultato atteso**: Il formaggio dovrebbe apparire nella tabella

**✅ Step 4 completato!** Tutto funziona!

---

## 🐛 Troubleshooting

### ❌ "Supabase non configurato" in console

**Causa**: Variabili d'ambiente non configurate o errate

**Soluzione**:
1. Vai su Vercel → Settings → Environment Variables
2. Verifica che `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` esistano
3. Verifica che i valori siano corretti (senza spazi, URL completo)
4. **Redeploy** il progetto

### ❌ Login non funziona

**Causa**: Utente non esiste o password errata

**Soluzione**:
1. Vai su Supabase → Authentication → Users
2. Verifica che l'utente esista
3. Se non esiste, crealo di nuovo
4. Se esiste, prova a resettare la password

### ❌ "Access denied" o errori 403

**Causa**: RLS Policies non configurate correttamente

**Soluzione**:
1. Vai su Supabase → SQL Editor
2. Esegui `FASE2_VERIFY_RLS.sql`
3. Se mancano policy, esegui `FASE2_RLS_POLICIES.sql`

### ❌ Dati non persistono

**Causa**: App sta usando localStorage invece di Supabase

**Soluzione**:
1. Verifica che le variabili d'ambiente siano configurate in Vercel
2. Verifica che il deploy sia in **Production** (non Preview)
3. Controlla la console del browser (F12) per errori

---

## 📋 Checklist Finale

Prima di considerare il deploy completato:

- [ ] Login funziona con credenziali Supabase
- [ ] Logout funziona
- [ ] Dati vengono salvati su Supabase (verifica in Table Editor)
- [ ] Dati persistono dopo refresh
- [ ] Route protette funzionano (non si può accedere senza login)
- [ ] Nessun errore critico in console (F12)

---

## 🎉 Completato!

Se tutti i test passano, il tuo deployment è completo e sicuro!

**I tuoi dati sono ora:**
- ✅ Salvati su Supabase Database
- ✅ Protetti da RLS (solo utenti autenticati)
- ✅ Sincronizzati in real-time
- ✅ Accessibili da qualsiasi dispositivo con login

**URL del sito**: `https://dario-caseificio.vercel.app/`

---

## 📞 Supporto

Se incontri problemi:
1. Controlla questa guida
2. Verifica i log in Vercel Dashboard → Deployments → [ultimo deploy] → Logs
3. Verifica i log in Supabase Dashboard → Logs → Postgres Logs
4. Controlla la console del browser (F12)

**Buon deploy! 🚀**
