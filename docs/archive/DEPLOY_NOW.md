# 🚀 Deploy Immediato - DARIO

## ⚡ Deploy Rapido

Ho preparato tutto per il deploy. Segui questi passaggi:

---

## 📋 STEP 1: Verifica Supabase (2 minuti)

### 1.1 Ottieni le Credenziali

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona il tuo progetto
3. **Settings** → **API**
4. Copia:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 1.2 Crea Utente (se non l'hai già fatto)

1. **Authentication** → **Users** → **Add User**
2. Email: `dario@corzanoepaterno.com` (o quella che preferisci)
3. Password: (genera una password sicura)
4. ✅ **Auto Confirm User** (SPUNTA!)
5. Clicca **Create User**

**Salva le credenziali!**

---

## 🌐 STEP 2: Configura Vercel (3 minuti)

### 2.1 Aggiungi Variabili d'Ambiente

1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleziona progetto `dario-caseificio` (o creane uno nuovo)
3. **Settings** → **Environment Variables**
4. Aggiungi:

   **Variabile 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://xxxxx.supabase.co` (il Project URL di Supabase)
   - Environment: ☑️ Production, ☑️ Preview, ☑️ Development
   - Clicca **Save**

   **Variabile 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (l'anon key di Supabase)
   - Environment: ☑️ Production, ☑️ Preview, ☑️ Development
   - Clicca **Save**

---

## 🚀 STEP 3: Deploy (2 opzioni)

### Opzione A: Deploy via Vercel Dashboard (Consigliato)

1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleziona il progetto `dario-caseificio`
3. Se il progetto è già connesso a GitHub:
   - Fai un commit e push → Deploy automatico
   - Oppure clicca **Redeploy** dopo aver aggiunto le variabili
4. Se il progetto non esiste:
   - **Add New** → **Project**
   - Connetti il repository GitHub
   - Vercel rileva automaticamente Vite
   - Clicca **Deploy**

### Opzione B: Deploy via CLI

```bash
cd /Users/roccogoldschmidt/Desktop/projects/proj-dario

# Installa Vercel CLI (se non l'hai già)
npm install -g vercel

# Login (se non sei già loggato)
vercel login

# Deploy in produzione
vercel --prod
```

Oppure usa lo script che ho creato:

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## ✅ STEP 4: Verifica (2 minuti)

1. Vai su `https://dario-caseificio.vercel.app/`
2. Dovresti vedere la pagina di login
3. Fai login con le credenziali create in Supabase
4. **Risultato atteso**: Login funzionante e accesso all'app

---

## 🐛 Se Qualcosa Non Funziona

### Login non funziona
- Verifica che l'utente esista in Supabase Auth
- Verifica che le variabili d'ambiente siano corrette in Vercel
- Controlla la console del browser (F12) per errori

### Dati non vengono salvati
- Verifica che RLS sia abilitato (esegui `FASE2_VERIFY_RLS.sql`)
- Verifica che le variabili d'ambiente siano configurate
- Controlla i log di Supabase

### "Supabase non configurato" in console
- Verifica che `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` siano in Vercel
- Assicurati di aver fatto **Redeploy** dopo aver aggiunto le variabili

---

## 📞 Supporto

Se hai problemi:
1. Controlla `DEPLOY_STEP_BY_STEP.md` per istruzioni dettagliate
2. Verifica i log in Vercel Dashboard → Deployments → [ultimo deploy] → Logs
3. Verifica i log in Supabase Dashboard → Logs → Postgres Logs

---

**Tutto pronto! Buon deploy! 🚀**
