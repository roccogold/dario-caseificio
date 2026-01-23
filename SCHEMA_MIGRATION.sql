-- ============================================
-- MIGRAZIONE SCHEMA SUPABASE
-- Per compatibilità con nuova UI TypeScript
-- ============================================

-- ============================================
-- 1. AGGIORNARE TABELLA attività
-- ============================================
-- Aggiungere colonne mancanti per supportare i nuovi tipi TypeScript

ALTER TABLE attività 
  ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('protocol', 'recurring', 'one-time')) DEFAULT 'one-time',
  ADD COLUMN IF NOT EXISTS production_id UUID REFERENCES produzioni(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cheese_type_id UUID REFERENCES formaggi(id) ON DELETE SET NULL;

-- Aggiungere indici per performance
CREATE INDEX IF NOT EXISTS idx_attività_type ON attività(type);
CREATE INDEX IF NOT EXISTS idx_attività_production_id ON attività(production_id);
CREATE INDEX IF NOT EXISTS idx_attività_cheese_type_id ON attività(cheese_type_id);

-- Aggiornare attività esistenti: se hanno recurrence, sono 'recurring'
UPDATE attività 
SET type = 'recurring' 
WHERE recurrence IS NOT NULL AND recurrence != 'none' AND type IS NULL;

-- ============================================
-- 2. CORREGGERE yield_liters_per_kg → yield_kg_per_liter
-- ============================================
-- PROBLEMA: Il DB ha "liters_per_kg" ma il tipo TS ha "PerLiter" (kg per liter)
-- Il tipo TS è corretto: yieldPerLiter = kg per liter (resa)
-- Il DB deve essere rinominato per chiarezza

-- Opzione A: RINOMINARE colonna (se vuoi mantenere compatibilità)
-- ALTER TABLE formaggi RENAME COLUMN yield_liters_per_kg TO yield_kg_per_liter;

-- Opzione B: MANTENERE nome attuale ma aggiungere commento
COMMENT ON COLUMN formaggi.yield_liters_per_kg IS 'Resa in kg per litro (kg/L). Esempio: 0.12 = da 1L latte ottieni 0.12kg formaggio';

-- NOTA: Per ora manteniamo yield_liters_per_kg nel DB ma lo convertiamo nel codice
-- Il nome è confuso ma funziona se gestito correttamente nell'adapter

-- ============================================
-- 3. VERIFICARE STRUTTURA JSONB cheeses in produzioni
-- ============================================
-- La struttura attesa è:
-- [
--   { "cheeseTypeId": "uuid", "liters": 50 },
--   { "cheeseTypeId": "uuid", "liters": 30 }
-- ]

-- Verificare che i dati esistenti siano compatibili
-- Se necessario, eseguire migrazione dati

-- ============================================
-- 4. ABILITARE REAL-TIME (se non già fatto)
-- ============================================
-- Verificare in Supabase Dashboard → Database → Replication
-- che le tabelle siano abilitate per real-time:
-- - formaggi
-- - produzioni  
-- - attività

-- ============================================
-- 5. VERIFICARE RLS POLICIES
-- ============================================
-- Le policy attuali permettono tutto (per sviluppo)
-- In produzione, aggiornare per richiedere autenticazione:

-- Esempio per produzione:
-- DROP POLICY IF EXISTS "Allow all operations on formaggi" ON formaggi;
-- CREATE POLICY "Authenticated users can manage formaggi" ON formaggi
--   FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- RIEPILOGO MODIFICHE
-- ============================================
-- ✅ Aggiunte 3 colonne a attività: type, production_id, cheese_type_id
-- ✅ Aggiunti 3 indici per performance
-- ⚠️ yield_liters_per_kg mantenuto (conversione nel codice)
-- ✅ Real-time da abilitare manualmente in Supabase Dashboard
-- ⚠️ RLS policies da aggiornare per produzione
