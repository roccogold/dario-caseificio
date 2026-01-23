# Fase 1: Verifica e Aggiornamento Schema Database Supabase

## 📋 Overview

Questa fase aggiorna lo schema del database Supabase per supportare tutte le nuove funzionalità dell'applicazione:
- Campi predefiniti (Temperatura Coagulazione, Fermenti, Muffe, Caglio)
- Campi personalizzati
- 3 prezzi con percentuali di vendita
- Resa in percentuale
- Attività ricorrenti con completed_dates

## 🚀 Istruzioni

### Step 1: Eseguire la Migrazione

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona il tuo progetto
3. Vai su **SQL Editor** (menu laterale)
4. Apri il file `FASE1_SCHEMA_MIGRATION.sql`
5. Copia e incolla tutto il contenuto nell'editor SQL
6. Clicca su **Run** (o premi `Cmd/Ctrl + Enter`)

### Step 2: Verificare la Migrazione

1. Sempre in **SQL Editor**
2. Apri il file `FASE1_VERIFY_SCHEMA.sql`
3. Copia e incolla tutto il contenuto
4. Clicca su **Run**
5. Controlla i risultati:
   - ✅ Tutti i check devono essere verdi
   - ⚠️ Se vedi warning, controlla i dettagli
   - ❌ Se vedi errori, risolvili prima di procedere

### Step 3: Abilitare Real-Time

1. Vai su **Database** → **Replication** nel menu laterale
2. Abilita real-time per:
   - ✅ `formaggi`
   - ✅ `produzioni`
   - ✅ `attività`

Oppure esegui questo SQL:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE formaggi;
ALTER PUBLICATION supabase_realtime ADD TABLE produzioni;
ALTER PUBLICATION supabase_realtime ADD TABLE attività;
```

## 📊 Cosa viene modificato

### Tabella `formaggi`
- ✅ Aggiunta colonna `yield_percentage` (DECIMAL)
- ✅ Aggiunta colonna `prices` (JSONB)
- ✅ Aggiunta colonna `default_fields` (JSONB)
- ✅ Aggiunta colonna `custom_fields` (JSONB)
- ✅ Migrazione automatica dati esistenti

### Tabella `attività`
- ✅ Verificata/aggiunta colonna `type`
- ✅ Verificata/aggiunta colonna `production_id`
- ✅ Verificata/aggiunta colonna `cheese_type_id`
- ✅ Aggiunta colonna `completed_dates` (JSONB array)

### Indici
- ✅ Aggiunti indici per performance su nuovi campi
- ✅ Aggiunti indici GIN per JSONB

## ⚠️ Note Importanti

1. **Backup**: Prima di eseguire la migrazione, fai un backup del database
2. **Dati Esistenti**: La migrazione converte automaticamente i dati esistenti
3. **Backward Compatibility**: I campi legacy (`yield_liters_per_kg`, `price_per_kg`) vengono mantenuti
4. **Real-Time**: Deve essere abilitato manualmente dopo la migrazione

## ✅ Checklist Post-Migrazione

- [ ] Migrazione eseguita senza errori
- [ ] Script di verifica passa tutti i check
- [ ] Real-time abilitato per tutte le tabelle
- [ ] Dati esistenti convertiti correttamente
- [ ] Indici creati correttamente

## 🔄 Rollback (se necessario)

Se qualcosa va storto, puoi fare rollback rimuovendo le colonne:

```sql
-- ATTENZIONE: Questo elimina i dati nelle colonne!
ALTER TABLE formaggi DROP COLUMN IF EXISTS yield_percentage;
ALTER TABLE formaggi DROP COLUMN IF EXISTS prices;
ALTER TABLE formaggi DROP COLUMN IF EXISTS default_fields;
ALTER TABLE formaggi DROP COLUMN IF EXISTS custom_fields;
ALTER TABLE attività DROP COLUMN IF EXISTS completed_dates;
```

## 📝 Prossimi Passi

Dopo aver completato questa fase:
1. ✅ Verifica che tutto funzioni correttamente
2. ✅ Procedi con **Fase 2: Sicurezza e RLS Policies**
