# 🚀 Guida Step-by-Step: Deploy Produzione DARIO

## 📋 Panoramica

Questa guida ti porterà attraverso tutti i passaggi necessari per deployare DARIO su Vercel con Supabase configurato correttamente.

**Tempo stimato**: 15-20 minuti

---

## ✅ STEP 1: Verifica Pre-requisiti

### 1.1 Verifica Supabase

- [ ] Hai un account Supabase? [Crea account](https://app.supabase.com)
- [ ] Hai un progetto Supabase creato?
- [ ] Hai eseguito `FASE1_SCHEMA_MIGRATION.sql`?
- [ ] Hai eseguito `FASE2_RLS_POLICIES.sql`?
- [ ] Real-time è abilitato per `formaggi`, `produzioni`, `attività`?

**Se qualcosa manca, fermati qui e completa prima di procedere.**

---

## 🔧 STEP 2: Preparazione Supabase

### 2.1 Ottieni le Credenziali Supabase

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona il tuo progetto
3. Vai su **Settings** (icona ingranaggio in basso a sinistra) → **API**
4. Trova la sezione **Project API keys**

**Copia questi valori (li userai dopo):**

```
Project URL: https://xxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANTE**: Salva questi valori in un file di testo temporaneo, li userai tra poco.

### 2.2 Verifica RLS Policies

1. Vai su **SQL Editor** (icona database in sidebar)
2. Esegui `FASE2_VERIFY_RLS.sql`
3. Verifica che vedi:
   - ✅ `formaggi`: 4 policy
   - ✅ `produzioni`: 4 policy
   - ✅ `attività`: 4 policy
   - ✅ `logs`: 1 policy

**Se mancano policy, esegui `FASE2_CREATE_MISSING_POLICIES.sql`**

### 2.3 Verifica Real-time

1. Vai su **Database** → **Replication**
2. Verifica che ci sia un checkmark verde per:
   - ✅ `formaggi`
   - ✅ `produzioni`
   - ✅ `attività`

**Se non sono abilitati, esegui `FASE1_ENABLE_REALTIME_V2.sql`**

### 2.4 Crea Utente di Produzione

1. Vai su **Authentication** → **Users**
2. Clicca **Add User** (pulsante in alto a destra)
3. Seleziona **Create new user**
4. Compila:
   - **Email**: `dario@corzanoepaterno.com` (o quella che preferisci)
   - **Password**: (genera una password sicura, minimo 8 caratteri)
   - **Auto Confirm User**: ✅ (SPUNTA questa opzione - importante!)
5. Clicca **Create User**
6. **SALVA LE CREDENZIALI** in un posto sicuro:
   ```
   Email: dario@corzanoepaterno.com
   Password: [la password che hai scelto]
   ```

**✅ Step 2 completato!** Hai:
- Credenziali Supabase (URL + Key)
- Utente di produzione creato
- RLS e Real-time verificati

---

## 🌐 STEP 3: Configurazione Vercel

### 3.1 Accedi a Vercel

1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Accedi con il tuo account (GitHub, GitLab, o email)

### 3.2 Trova o Crea il Progetto

**Se il progetto esiste già:**
- Cerca `dario-caseificio` nella lista progetti
- Clicca sul progetto

**Se il progetto non esiste:**
1. Clicca **Add New** → **Project**
2. Connetti il repository GitHub (se non è già connesso)
3. Seleziona il repository `proj-dario` (o quello che contiene il codice)
4. Vercel dovrebbe rilevare automaticamente:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Clicca **Deploy** (per ora senza variabili, le aggiungiamo dopo)

### 3.3 Aggiungi Variabili d'Ambiente

1. Nel progetto Vercel, vai su **Settings** (in alto)
2. Clicca su **Environment Variables** (sidebar sinistra)
3. Aggiungi la prima variabile:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://xxxxx.supabase.co` (il Project URL che hai copiato)
   - **Environment**: Seleziona tutte e tre: ☑️ Production, ☑️ Preview, ☑️ Development
   - Clicca **Save**

4. Aggiungi la seconda variabile:
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (l'anon key che hai copiato)
   - **Environment**: Seleziona tutte e tre: ☑️ Production, ☑️ Preview, ☑️ Development
   - Clicca **Save**

**⚠️ IMPORTANTE**: 
- Assicurati di NON avere spazi extra nelle variabili
- Verifica che i valori siano corretti (copia-incolla esatto)

### 3.4 Redeploy con Variabili

1. Vai su **Deployments** (in alto)
2. Trova l'ultimo deployment
3. Clicca sui tre puntini (⋯) → **Redeploy**
4. Seleziona **Use existing Build Cache** (opzionale)
5. Clicca **Redeploy**

**Attendi che il deploy finisca** (2-3 minuti)

**✅ Step 3 completato!** Hai:
- Variabili d'ambiente configurate
- Deployment in corso

---

## ✅ STEP 4: Verifica Post-Deploy

### 4.1 Test Login

1. Vai su `https://dario-caseificio.vercel.app/`
2. Dovresti vedere la pagina di login
3. Prova a fare login con:
   - Email: quella che hai creato in Supabase (es. `dario@corzanoepaterno.com`)
   - Password: quella che hai creato in Supabase
4. **Risultato atteso**: Login funzionante e reindirizzamento a `/calendario`

**❌ Se il login non funziona:**
- Controlla la console del browser (F12) per errori
- Verifica che le variabili d'ambiente siano corrette in Vercel
- Verifica che l'utente esista in Supabase Auth

### 4.2 Test Dati

1. Dopo il login, crea un formaggio di test
2. Vai su Supabase Dashboard → **Table Editor** → `formaggi`
3. **Risultato atteso**: Il formaggio dovrebbe apparire nella tabella

**❌ Se i dati non appaiono:**
- Controlla la console per errori
- Verifica che RLS sia abilitato
- Verifica che le policy siano corrette

### 4.3 Test Real-time (Opzionale)

1. Apri l'app in due browser diversi (o finestre incognito)
2. Fai login con lo stesso utente in entrambi
3. Crea/modifica un formaggio in una finestra
4. **Risultato atteso**: Modifiche visibili in tempo reale nell'altra finestra

---

## 🐛 Troubleshooting

### Problema: "Supabase non configurato" in console

**Causa**: Variabili d'ambiente non configurate o errate

**Soluzione**:
1. Vai su Vercel → Settings → Environment Variables
2. Verifica che `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` esistano
3. Verifica che i valori siano corretti (senza spazi, URL completo)
4. Redeploy il progetto

### Problema: Login non funziona

**Causa**: Utente non esiste o password errata

**Soluzione**:
1. Vai su Supabase → Authentication → Users
2. Verifica che l'utente esista
3. Se non esiste, crealo di nuovo
4. Se esiste, prova a resettare la password

### Problema: "Access denied" o errori 403

**Causa**: RLS Policies non configurate correttamente

**Soluzione**:
1. Vai su Supabase → SQL Editor
2. Esegui `FASE2_VERIFY_RLS.sql`
3. Se mancano policy, esegui `FASE2_RLS_POLICIES.sql`

### Problema: Dati non persistono

**Causa**: App sta usando localStorage invece di Supabase

**Soluzione**:
1. Verifica che `import.meta.env.PROD === true` in produzione
2. Verifica che le variabili d'ambiente siano configurate
3. Controlla la console per errori di connessione Supabase

---

## 📝 Checklist Finale

Prima di considerare il deploy completato:

- [ ] Login funziona con credenziali Supabase
- [ ] Logout funziona
- [ ] Dati vengono salvati su Supabase (verifica in Table Editor)
- [ ] Dati persistono dopo refresh
- [ ] Route protette funzionano (non si può accedere senza login)
- [ ] Real-time funziona (opzionale ma consigliato)
- [ ] Nessun errore critico in console

---

## 🎉 Completato!

Se tutti i test passano, il tuo deployment è completo e sicuro!

**I tuoi dati sono ora:**
- ✅ Salvati su Supabase Database
- ✅ Protetti da RLS (solo utenti autenticati)
- ✅ Sincronizzati in real-time
- ✅ Accessibili da qualsiasi dispositivo con login

---

## 📞 Supporto

Se incontri problemi:
1. Controlla questa guida
2. Verifica i log in Vercel Dashboard → Deployments → [ultimo deploy] → Logs
3. Verifica i log in Supabase Dashboard → Logs → Postgres Logs
4. Controlla la console del browser (F12)

**Buon deploy! 🚀**
