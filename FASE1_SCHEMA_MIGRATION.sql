-- ============================================
-- FASE 1: MIGRAZIONE SCHEMA DATABASE SUPABASE
-- Aggiornamento completo per supportare nuova UI
-- ============================================
-- Esegui questo script nella SQL Editor di Supabase
-- Data: 2026-01-23

-- ============================================
-- 1. AGGIORNAMENTO TABELLA formaggi
-- ============================================

-- 1.1 Aggiungere yield_percentage (DECIMAL per % resa)
ALTER TABLE formaggi 
  ADD COLUMN IF NOT EXISTS yield_percentage DECIMAL(5,2);

-- 1.2 Aggiungere prices (JSONB) per i 3 prezzi e % di vendita
ALTER TABLE formaggi 
  ADD COLUMN IF NOT EXISTS prices JSONB DEFAULT '{
    "price1": 0,
    "price2": 0,
    "price3": 0,
    "salesPercentage1": 100,
    "salesPercentage2": 0,
    "salesPercentage3": 0
  }'::jsonb;

-- 1.3 Aggiungere default_fields (JSONB) per parametri predefiniti
ALTER TABLE formaggi 
  ADD COLUMN IF NOT EXISTS default_fields JSONB DEFAULT '{}'::jsonb;

-- 1.4 Aggiungere custom_fields (JSONB) per campi personalizzati
ALTER TABLE formaggi 
  ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '[]'::jsonb;

-- 1.5 Migrazione dati esistenti: convertire yield_liters_per_kg a yield_percentage
-- Se yield_liters_per_kg = 0.12 (12kg da 100L), allora yield_percentage = 12
UPDATE formaggi 
SET yield_percentage = (yield_liters_per_kg * 100)
WHERE yield_percentage IS NULL AND yield_liters_per_kg IS NOT NULL;

-- 1.6 Migrazione dati esistenti: convertire price_per_kg a prices.price1
UPDATE formaggi 
SET prices = jsonb_set(
  COALESCE(prices, '{"price1": 0, "price2": 0, "price3": 0, "salesPercentage1": 100, "salesPercentage2": 0, "salesPercentage3": 0}'::jsonb),
  '{price1}',
  to_jsonb(COALESCE(price_per_kg, 0))
)
WHERE prices->>'price1' = '0' OR prices->>'price1' IS NULL;

-- 1.7 Aggiungere commenti per chiarezza
COMMENT ON COLUMN formaggi.yield_percentage IS 'Resa in percentuale (es. 20 = 20kg da 100L di latte)';
COMMENT ON COLUMN formaggi.prices IS 'JSONB con price1, price2, price3 (€/kg) e salesPercentage1, salesPercentage2, salesPercentage3 (%)';
COMMENT ON COLUMN formaggi.default_fields IS 'JSONB con parametri predefiniti: temperaturaCoagulazione, nomeFermento, quantitaFermento, muffe, quantitaMuffe, caglio, quantitaCaglio';
COMMENT ON COLUMN formaggi.custom_fields IS 'JSONB array di oggetti {key: string, value: string} per campi personalizzati';

-- ============================================
-- 2. AGGIORNAMENTO TABELLA attività
-- ============================================

-- 2.1 Verificare/aggiungere colonne per tipo e relazioni (già nella migrazione precedente)
ALTER TABLE attività 
  ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('protocol', 'recurring', 'one-time')) DEFAULT 'one-time',
  ADD COLUMN IF NOT EXISTS production_id UUID REFERENCES produzioni(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cheese_type_id UUID REFERENCES formaggi(id) ON DELETE SET NULL;

-- 2.2 Aggiungere completed_dates (JSONB array) per attività ricorrenti
ALTER TABLE attività 
  ADD COLUMN IF NOT EXISTS completed_dates JSONB DEFAULT '[]'::jsonb;

-- 2.3 Migrazione dati esistenti: aggiornare type in base a recurrence
UPDATE attività 
SET type = CASE
  WHEN recurrence IS NOT NULL AND recurrence != 'none' THEN 'recurring'
  ELSE 'one-time'
END
WHERE type IS NULL OR type = 'one-time';

-- 2.4 Aggiungere commenti
COMMENT ON COLUMN attività.type IS 'Tipo attività: protocol (da protocollo formaggio), recurring (ricorrente), one-time (una tantum)';
COMMENT ON COLUMN attività.completed_dates IS 'JSONB array di date (yyyy-MM-dd) per tracciare completamento attività ricorrenti per giorno specifico';

-- ============================================
-- 3. INDICI PER PERFORMANCE
-- ============================================

-- 3.1 Indici per formaggi
CREATE INDEX IF NOT EXISTS idx_formaggi_yield_percentage ON formaggi(yield_percentage);
CREATE INDEX IF NOT EXISTS idx_formaggi_prices ON formaggi USING GIN (prices);

-- 3.2 Indici per attività (verificare se già esistono)
CREATE INDEX IF NOT EXISTS idx_attività_type ON attività(type);
CREATE INDEX IF NOT EXISTS idx_attività_production_id ON attività(production_id);
CREATE INDEX IF NOT EXISTS idx_attività_cheese_type_id ON attività(cheese_type_id);
CREATE INDEX IF NOT EXISTS idx_attività_completed_dates ON attività USING GIN (completed_dates);

-- 3.3 Indici per produzioni (verificare se già esistono)
CREATE INDEX IF NOT EXISTS idx_produzioni_date ON produzioni(production_date);
CREATE INDEX IF NOT EXISTS idx_produzioni_number ON produzioni(production_number);

-- ============================================
-- 4. VERIFICA STRUTTURA JSONB
-- ============================================

-- 4.1 Verificare struttura prices (esempio di validazione)
-- La struttura attesa è:
-- {
--   "price1": number,
--   "price2": number,
--   "price3": number,
--   "salesPercentage1": number,
--   "salesPercentage2": number,
--   "salesPercentage3": number
-- }

-- 4.2 Verificare struttura default_fields (esempio)
-- {
--   "temperaturaCoagulazione": string,
--   "nomeFermento": string,
--   "quantitaFermento": string,
--   "muffe": string,
--   "quantitaMuffe": string,
--   "caglio": string,
--   "quantitaCaglio": string
-- }

-- 4.3 Verificare struttura custom_fields (esempio)
-- [
--   {"key": "Fuscelle", "value": "50"},
--   {"key": "Altro", "value": "testo"}
-- ]

-- ============================================
-- 5. CONSTRAINTS E VALIDAZIONI
-- ============================================

-- 5.1 Verificare che yield_percentage sia tra 0 e 100
-- Nota: PostgreSQL non supporta IF NOT EXISTS con ADD CONSTRAINT, quindi usiamo DO block
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_yield_percentage' 
    AND conrelid = 'formaggi'::regclass
  ) THEN
    ALTER TABLE formaggi 
      ADD CONSTRAINT check_yield_percentage 
      CHECK (yield_percentage IS NULL OR (yield_percentage >= 0 AND yield_percentage <= 100));
  END IF;
END $$;

-- 5.2 Verificare che i prezzi siano positivi (se presenti)
-- Nota: questo richiede una funzione trigger perché JSONB non supporta CHECK diretti
-- Per ora, la validazione avviene lato applicazione

-- ============================================
-- 6. REAL-TIME (da abilitare manualmente in Dashboard)
-- ============================================
-- Vai su Supabase Dashboard → Database → Replication
-- Abilita real-time per:
-- - formaggi
-- - produzioni
-- - attività
-- 
-- Oppure esegui:
-- ALTER PUBLICATION supabase_realtime ADD TABLE formaggi;
-- ALTER PUBLICATION supabase_realtime ADD TABLE produzioni;
-- ALTER PUBLICATION supabase_realtime ADD TABLE attività;

-- ============================================
-- 7. VERIFICA FINALE
-- ============================================

-- Query per verificare che tutte le colonne siano presenti:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'formaggi' 
-- ORDER BY ordinal_position;

-- Query per verificare indici:
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename IN ('formaggi', 'produzioni', 'attività')
-- ORDER BY tablename, indexname;

-- ============================================
-- RIEPILOGO MODIFICHE
-- ============================================
-- ✅ formaggi: aggiunte 4 colonne (yield_percentage, prices, default_fields, custom_fields)
-- ✅ formaggi: migrazione dati da yield_liters_per_kg e price_per_kg
-- ✅ attività: verificato/aggiunto type, production_id, cheese_type_id
-- ✅ attività: aggiunto completed_dates per attività ricorrenti
-- ✅ Indici: aggiunti per performance
-- ✅ Constraints: aggiunto check per yield_percentage
-- ⚠️ Real-time: da abilitare manualmente in Dashboard
-- ⚠️ RLS policies: da applicare in Fase 2
