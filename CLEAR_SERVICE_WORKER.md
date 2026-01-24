# 🔧 Come Rimuovere il Service Worker Vecchio

Il problema è che il service worker sta servendo una versione cached. Ecco come risolverlo:

## Metodo 1: DevTools (Immediato)

1. Apri DevTools (F12)
2. Vai su **Application** → **Service Workers**
3. Trova il service worker per `dario-caseificio.vercel.app`
4. Clicca **"Unregister"** (deregistra)
5. Vai su **Application** → **Storage**
6. Clicca **"Clear site data"**
7. Ricarica la pagina (F5)

## Metodo 2: Hard Refresh (Dopo il nuovo deploy)

Dopo che Vercel ha completato il deploy (1-2 minuti):

1. Apri la pagina: https://dario-caseificio.vercel.app/calendario
2. Fai **Hard Refresh**:
   - **Chrome/Edge**: `Ctrl+Shift+R` (Windows) o `Cmd+Shift+R` (Mac)
   - **Firefox**: `Ctrl+F5` (Windows) o `Cmd+Shift+R` (Mac)
   - **Safari**: `Cmd+Option+R`

## Metodo 3: Modalità Incognito

1. Apri una finestra in modalità incognito
2. Vai su: https://dario-caseificio.vercel.app/calendario
3. Dovresti vedere la versione nuova (senza cache)

## Cosa Ho Fatto

Ho aggiornato la configurazione del service worker per:
- ✅ `skipWaiting: true` - Aggiorna immediatamente
- ✅ `clientsClaim: true` - Prende controllo di tutte le pagine
- ✅ `registerType: "prompt"` - Notifica quando c'è un aggiornamento

Il nuovo deploy forzerà l'aggiornamento del service worker.

---

**Nota**: Dopo il deploy, il service worker si aggiornerà automaticamente. Se vedi ancora la versione vecchia, usa il Metodo 1 per rimuoverlo manualmente.
