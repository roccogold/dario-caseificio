# Setup Supabase Auth per Dario

Questa guida ti aiuterà a configurare l'autenticazione Supabase e le policy RLS.

## Passo 1: Abilita Email Auth in Supabase

1. Vai su [supabase.com/dashboard](https://supabase.com/dashboard)
2. Seleziona il progetto `proj-dario`
3. Vai su **Authentication** → **Providers**
4. Assicurati che **Email** sia abilitato (dovrebbe essere già attivo di default)
5. Se non lo è, attivalo e salva

## Passo 2: Crea l'utente

1. Vai su **Authentication** → **Users**
2. Clicca su **"Add user"** → **"Create new user"**
3. Compila:
   - **Email**: (usa la tua email)
   - **Password**: (crea una password sicura)
   - **Auto Confirm User**: ✅ (spunta questa opzione per non richiedere email verification)
4. Clicca **"Create user"**

## Passo 3: Aggiorna le Policy RLS

1. Vai su **SQL Editor** in Supabase
2. Clicca **New Query**
3. Copia e incolla tutto il contenuto del file `supabase-rls-policies.sql`
4. Clicca **Run** (o premi Cmd/Ctrl + Enter)
5. Dovresti vedere "Success. No rows returned"

## Passo 4: Testa il Login

1. Apri l'applicazione (locale o Vercel)
2. Prova a fare login con:
   - **Email**: (usa la tua email)
   - **Password**: (crea una password sicura)
3. Dovresti essere autenticato correttamente

## Cosa è cambiato

✅ **Password hashate sul server** (non più nel browser)
✅ **Session management sicuro** (JWT gestiti da Supabase)
✅ **RLS attivo**: solo utenti autenticati possono accedere ai dati
✅ **Password reset integrato** (via email Supabase)

## Password Reset

Se un utente dimentica la password:
1. Clicca "Password dimenticata?" nel login
2. Inserisce l'email
3. Riceve un'email da Supabase con il link di reset
4. Clicca il link e imposta una nuova password

## Aggiungere nuovi utenti

Per aggiungere nuovi utenti in futuro:
1. Vai su Supabase Dashboard → Authentication → Users
2. Clicca "Add user" → "Create new user"
3. Inserisci email e password
4. Spunta "Auto Confirm User" se non vuoi richiedere email verification

## Troubleshooting

**Problema**: "Invalid login credentials"
- **Soluzione**: Verifica che l'utente esista in Supabase Auth e che la password sia corretta

**Problema**: "Policy violation" o "permission denied"
- **Soluzione**: Verifica che le policy RLS siano state create correttamente (Passo 3)

**Problema**: Non riesco a fare login
- **Soluzione**: Verifica che Email Auth sia abilitato in Authentication → Providers
