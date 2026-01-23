# 🎯 Guida Setup Vercel - Passo-Passo

## ✅ STEP 1: Verifica che il Deploy Funzioni

1. Nella pagina **Production Deployment** che vedi:
   - Clicca sull'URL: `dario-caseificio.vercel.app` (o il link esterno accanto)
   - Dovresti vedere il nuovo sito con "DARIO" e il nuovo design
   - Se vedi ancora il vecchio sito, fai **hard refresh**: `Cmd + Shift + R` (Mac) o `Ctrl + Shift + R` (Windows)

**✅ Se vedi il nuovo design → Perfetto! Il deploy è andato a buon fine!**

---

## 🔗 STEP 2: Connetti GitHub (Opzionale ma Consigliato)

Per avere deploy automatici in futuro:

1. Nella pagina **Git** che vedi:
   - Clicca sul pulsante **"GitHub"** (con il logo GitHub)
   - Autorizza Vercel ad accedere a GitHub (se richiesto)
   - Seleziona il repository: `roccogold/dario-s-cheese-diary`
   - Seleziona branch: `main`
   - Clicca **Connect** o **Deploy**

2. Dopo la connessione:
   - Ogni push su GitHub farà automaticamente un nuovo deploy
   - Vedrai i commit e i deploy nella pagina Deployments

**⚠️ Nota**: Se preferisci continuare con deploy manuali, puoi saltare questo step.

---

## 🔧 STEP 3: Verifica Variabili d'Ambiente

1. Vai su **Settings** → **Environment Variables**
2. Verifica che ci siano:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Se mancano, aggiungile (vedi `DEPLOY_DASHBOARD.md`)

---

## ✅ STEP 4: Test Finale

1. Vai su `https://dario-caseificio.vercel.app/`
2. Fai login con le credenziali Supabase
3. Verifica che:
   - Il logo sia quello nuovo (frog-logo.svg)
   - Il design sia aggiornato
   - I dati vengano salvati su Supabase

---

## 🎉 Completato!

Se tutto funziona, il deploy è completo!
