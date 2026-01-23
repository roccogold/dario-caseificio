# Guida Test End-to-End - DARIO

## 🎯 Obiettivo
Verificare che tutte le funzionalità dell'applicazione funzionino correttamente dopo l'implementazione della Fase 2 (Sicurezza e RLS).

---

## 📋 Pre-requisiti

1. ✅ Server di sviluppo avviato: `npm run dev` su `http://localhost:8080`
2. ✅ Database Supabase configurato (opzionale per test locali)
3. ✅ Browser con console aperta (F12)

---

## 🧪 Test Checklist

### 1. Test Autenticazione

#### 1.1 Login
- [ ] Apri `http://localhost:8080/`
- [ ] Verifica che appaia la pagina di login
- [ ] Verifica che il logo frog e "DARIO" siano visibili
- [ ] Inserisci email: `oscargoldschmidt@gmail.com`
- [ ] Inserisci password: `pecorina`
- [ ] Clicca "Accedi"
- [ ] **Risultato atteso**: Reindirizzamento a `/calendario` e caricamento dell'app

#### 1.2 Logout
- [ ] Dopo il login, clicca su "Esci" nella sidebar
- [ ] **Risultato atteso**: Reindirizzamento al login

#### 1.3 Password Dimenticata (Sviluppo)
- [ ] Dalla pagina di login, clicca "Password dimenticata?"
- [ ] Inserisci un'email non esistente (es. `test@test.com`)
- [ ] Clicca "Invia Istruzioni"
- [ ] **Risultato atteso**: Messaggio "Email non trovata"
- [ ] Inserisci email: `oscargoldschmidt@gmail.com`
- [ ] Clicca "Invia Istruzioni"
- [ ] **Risultato atteso**: Messaggio "Il reset password non è disponibile in modalità sviluppo"

#### 1.4 Protezione Route
- [ ] Senza essere loggato, prova ad accedere direttamente a:
  - `http://localhost:8080/calendario`
  - `http://localhost:8080/formaggi`
  - `http://localhost:8080/produzioni`
  - `http://localhost:8080/statistiche`
- [ ] **Risultato atteso**: Reindirizzamento al login per tutte le route

---

### 2. Test Calendario

#### 2.1 Visualizzazione
- [ ] Dopo il login, verifica che la pagina Calendario si carichi
- [ ] Verifica che la vista "Giorno" sia selezionata di default
- [ ] Verifica che la data corrente sia visualizzata

#### 2.2 Navigazione Date
- [ ] Clicca sulle frecce per cambiare giorno
- [ ] Clicca "Oggi" per tornare alla data corrente
- [ ] **Risultato atteso**: La data cambia correttamente

#### 2.3 Cambio Vista
- [ ] Clicca su "Settimana"
- [ ] **Risultato atteso**: Vista settimanale con 7 giorni
- [ ] Clicca su "Mese"
- [ ] **Risultato atteso**: Vista mensile con calendario completo
- [ ] Clicca su "Giorno"
- [ ] **Risultato atteso**: Torna alla vista giornaliera

#### 2.4 Nuova Produzione
- [ ] Clicca "+ Nuova Produzione"
- [ ] Compila il form:
  - Lotto: `TEST-001`
  - Data: oggi
  - Formaggio: seleziona un formaggio esistente o creane uno nuovo
  - Quantità: `100` L
- [ ] Clicca "Aggiungi Produzione"
- [ ] **Risultato atteso**: Produzione creata e visibile nel calendario

#### 2.5 Aggiungi Attività
- [ ] Clicca "+ Aggiungi Attività"
- [ ] Compila il form:
  - Titolo: `Test Attività`
  - Data: oggi
  - Ricorrenza: `Nessuna ricorrenza`
- [ ] Clicca "Aggiungi Attività"
- [ ] **Risultato atteso**: Attività creata e visibile nel calendario

#### 2.6 Completamento Attività
- [ ] Clicca sulla checkbox di un'attività
- [ ] **Risultato atteso**: Attività marcata come completata (line-through, opacità ridotta)

---

### 3. Test Formaggi

#### 3.1 Visualizzazione
- [ ] Vai a `/formaggi`
- [ ] **Risultato atteso**: Lista dei formaggi (o stato vuoto se non ce ne sono)

#### 3.2 Aggiungi Formaggio
- [ ] Clicca "Aggiungi Formaggio"
- [ ] Compila il form:
  - Nome: `Test Formaggio`
  - Colore: seleziona un colore
  - Resa: `20%`
  - Prezzi: compila almeno il primo prezzo
  - Protocollo: aggiungi almeno una fase (Giorno 1: Salatura)
- [ ] Clicca "Aggiungi Formaggio"
- [ ] **Risultato atteso**: Formaggio creato e visibile nella lista

#### 3.3 Modifica Formaggio
- [ ] Clicca sui tre puntini su un formaggio
- [ ] Clicca "Modifica"
- [ ] Modifica il nome o altri campi
- [ ] Clicca "Salva Modifiche"
- [ ] **Risultato atteso**: Modifiche salvate e visibili

#### 3.4 Elimina Formaggio
- [ ] Clicca sui tre puntini su un formaggio
- [ ] Clicca "Elimina"
- [ ] Conferma l'eliminazione
- [ ] **Risultato atteso**: Formaggio rimosso dalla lista

#### 3.5 Ricerca Formaggio
- [ ] Usa la barra di ricerca per cercare un formaggio
- [ ] **Risultato atteso**: Lista filtrata in base alla ricerca

---

### 4. Test Produzioni

#### 4.1 Visualizzazione
- [ ] Vai a `/produzioni`
- [ ] **Risultato atteso**: Lista delle produzioni (o stato vuoto)

#### 4.2 Filtri Data
- [ ] Prova i filtri:
  - "Tutte le produzioni"
  - "Da data a data"
  - "Per anno"
  - "Giorno specifico"
- [ ] **Risultato atteso**: Lista filtrata correttamente

#### 4.3 Modifica Produzione
- [ ] Clicca "Modifica" su una produzione
- [ ] Modifica alcuni campi
- [ ] Clicca "Salva Modifiche"
- [ ] **Risultato atteso**: Modifiche salvate

#### 4.4 Elimina Produzione
- [ ] Clicca "Elimina" su una produzione
- [ ] Conferma l'eliminazione
- [ ] **Risultato atteso**: Produzione rimossa e attività correlate eliminate

---

### 5. Test Statistiche

#### 5.1 Visualizzazione
- [ ] Vai a `/statistiche`
- [ ] **Risultato atteso**: Grafici e statistiche visualizzate

#### 5.2 Filtri
- [ ] Cambia anno con le frecce
- [ ] Seleziona un formaggio dal dropdown
- [ ] Cambia tra "Annuale" e "Mensile"
- [ ] **Risultato atteso**: Grafici aggiornati correttamente

---

### 6. Test Persistenza Dati

#### 6.1 localStorage (Sviluppo)
- [ ] Crea alcuni dati (formaggi, produzioni, attività)
- [ ] Ricarica la pagina (F5)
- [ ] **Risultato atteso**: Dati ancora presenti

#### 6.2 Logout e Login
- [ ] Fai logout
- [ ] Fai login di nuovo
- [ ] **Risultato atteso**: Dati ancora presenti

---

### 7. Test Console (Errori)

#### 7.1 Verifica Errori
- [ ] Apri la console del browser (F12)
- [ ] Naviga attraverso tutte le pagine
- [ ] Esegui alcune operazioni CRUD
- [ ] **Risultato atteso**: Nessun errore in console (solo warning informativi sono OK)

---

## 🐛 Problemi Comuni e Soluzioni

### Problema: Login non funziona
**Soluzione**: 
- Verifica che `initializeUsers()` venga chiamato
- Controlla la console per errori
- Prova a pulire localStorage: `localStorage.clear()` nella console

### Problema: Dati non persistono
**Soluzione**:
- Verifica che non ci siano errori in console
- Controlla che `localStorage` sia abilitato nel browser
- Verifica che i dati vengano salvati correttamente

### Problema: Route non protette
**Soluzione**:
- Verifica che `ProtectedRoute` avvolga tutte le route in `App.tsx`
- Controlla che `isAuthenticated()` funzioni correttamente

---

## ✅ Checklist Finale

Prima di procedere al deployment, assicurati che:

- [ ] Tutti i test di autenticazione passino
- [ ] Tutti i test CRUD passino
- [ ] Nessun errore critico in console
- [ ] I dati persistono correttamente
- [ ] Le route sono protette
- [ ] L'UI è coerente e funzionale

---

## 📝 Note

- I test in modalità sviluppo usano `localStorage` per l'autenticazione
- In produzione, l'autenticazione userà Supabase
- Alcuni test potrebbero richiedere dati esistenti (creali se necessario)

---

**Buon testing! 🚀**
