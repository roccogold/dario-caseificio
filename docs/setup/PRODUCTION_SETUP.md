# Setup Produzione - DARIO

## 🔒 Sicurezza Dati su Supabase

### ✅ Sì, i dati sono salvati su Supabase in modo sicuro

Quando deployi su Vercel con le variabili d'ambiente configurate:

1. **Produzione (`import.meta.env.PROD === true`)**: L'app usa automaticamente Supabase
2. **Sviluppo (`import.meta.env.DEV === true`)**: L'app usa localStorage

**Come funziona:**
- Il codice in `src/hooks/use-data.ts` controlla: `isProduction && VITE_SUPABASE_URL && supabase`
- Se tutte le condizioni sono vere → usa Supabase
- Altrimenti → usa localStorage

**Sicurezza garantita da:**
- ✅ RLS (Row Level Security) abilitato su tutte le tabelle
- ✅ Policy che richiedono autenticazione per tutte le operazioni
- ✅ Solo utenti autenticati possono accedere ai dati
- ✅ Real-time sincronizzato tra tutti i client

---

## 👤 Gestione Username e Password in Produzione

### Step 1: Creare Utente in Supabase

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona il tuo progetto
3. Vai su **Authentication** → **Users**
4. Clicca **Add User** → **Create new user**
5. Compila:
   - **Email**: `tuo-email@esempio.com` (es. `dario@corzanoepaterno.com`)
   - **Password**: (genera una password sicura)
   - **Auto Confirm User**: ✅ (spunta questa opzione)
6. Clicca **Create User**
7. **IMPORTANTE**: Salva le credenziali in un posto sicuro!

### Step 2: Configurare Variabili d'Ambiente su Vercel

1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleziona il progetto `dario-caseificio`
3. Vai su **Settings** → **Environment Variables**
4. Aggiungi queste variabili:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Dove trovare questi valori:**
- Vai su Supabase Dashboard → **Settings** → **API**
- **Project URL** = `VITE_SUPABASE_URL`
- **anon public key** = `VITE_SUPABASE_ANON_KEY`

**⚠️ IMPORTANTE:**
- Applica a: **Production**, **Preview**, **Development**
- Dopo aver aggiunto le variabili, **Redeploy** il progetto

### Step 3: Verificare che Funzioni

1. Dopo il redeploy, vai su `https://dario-caseificio.vercel.app/`
2. Dovresti vedere la pagina di login
3. Usa le credenziali create in Supabase:
   - Email: quella che hai inserito
   - Password: quella che hai inserito
4. **Risultato atteso**: Login funzionante e accesso all'app

---

## 🔐 Come Funziona l'Autenticazione

### In Sviluppo (localhost:8080)
- Usa `localStorage` per autenticazione
- Credenziali: Configurare tramite variabili d'ambiente o Supabase Auth (vedi `.env.local`)
- Dati salvati in `localStorage` del browser

### In Produzione (Vercel)
- Usa **Supabase Auth** per autenticazione
- Credenziali: quelle create in Supabase Dashboard
- Dati salvati su **Supabase Database** (sicuro, con RLS)

**Il codice rileva automaticamente:**
```javascript
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'
const useSupabase = isProduction && !!import.meta.env.VITE_SUPABASE_URL && !!supabase
```

---

## 📋 Checklist Pre-Deploy

Prima di deployare, verifica:

- [ ] RLS Policies applicate (`FASE2_RLS_POLICIES.sql` eseguito)
- [ ] Real-time abilitato per `formaggi`, `produzioni`, `attività`
- [ ] Utente di produzione creato in Supabase Auth
- [ ] Variabili d'ambiente configurate in Vercel:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Build locale funziona: `npm run build`
- [ ] Test end-to-end completati

---

## 🚀 Deploy su Vercel

### Opzione 1: Deploy Automatico (GitHub)

1. Assicurati che il codice sia su GitHub
2. Vai su Vercel Dashboard
3. Se il progetto è già connesso, ogni push fa deploy automatico
4. Oppure clicca **Redeploy** dopo aver aggiunto le variabili d'ambiente

### Opzione 2: Deploy Manuale

```bash
cd /Users/roccogoldschmidt/Desktop/projects/proj-dario

# Installa Vercel CLI (se non l'hai già)
npm i -g vercel

# Login
vercel login

# Deploy in produzione
vercel --prod
```

---

## ✅ Verifica Post-Deploy

### 1. Test Autenticazione
- [ ] Login con credenziali Supabase funziona
- [ ] Logout funziona
- [ ] Route protette funzionano

### 2. Test Dati
- [ ] Crea un formaggio → verifica su Supabase Dashboard
- [ ] Crea una produzione → verifica su Supabase Dashboard
- [ ] I dati persistono dopo refresh

### 3. Test Real-time
- [ ] Apri l'app in due browser diversi
- [ ] Crea/modifica dati in uno
- [ ] Verifica che appaiano in tempo reale nell'altro

### 4. Test RLS
- [ ] Prova ad accedere senza login → deve essere bloccato
- [ ] Verifica che solo utenti autenticati possano vedere i dati

---

## 🔑 Gestione Utenti Aggiuntivi

### Aggiungere Altri Utenti

1. Vai su Supabase Dashboard → **Authentication** → **Users**
2. Clicca **Add User** → **Create new user**
3. Inserisci email e password
4. Spunta **Auto Confirm User**
5. Clicca **Create User**

### Reset Password Utente

1. Vai su Supabase Dashboard → **Authentication** → **Users**
2. Trova l'utente
3. Clicca sui tre puntini → **Reset Password**
4. Oppure l'utente può usare "Password dimenticata?" nella pagina di login

### Eliminare Utente

1. Vai su Supabase Dashboard → **Authentication** → **Users**
2. Trova l'utente
3. Clicca sui tre puntini → **Delete User**

---

## 🛡️ Sicurezza Finale

### Verifica RLS

Esegui questo script in Supabase SQL Editor:
```sql
-- Verifica che RLS sia abilitato
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('formaggi', 'produzioni', 'attività', 'logs');

-- Verifica che le policy richiedano autenticazione
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('formaggi', 'produzioni', 'attività', 'logs');
```

### Best Practices

1. ✅ Usa password forti per gli utenti
2. ✅ Non condividere le credenziali Supabase
3. ✅ Monitora i log di Supabase per attività sospette
4. ✅ Fai backup regolari del database
5. ✅ Mantieni le variabili d'ambiente segrete

---

## 📞 Supporto

Se qualcosa non funziona:

1. **Controlla la console del browser** (F12) per errori
2. **Verifica le variabili d'ambiente** in Vercel
3. **Controlla i log di Supabase** → **Logs** → **Postgres Logs**
4. **Verifica che RLS sia abilitato** con `FASE2_VERIFY_RLS.sql`

---

**Tutto pronto per il deploy sicuro! 🚀**
