-- ============================================
-- FASE 1: SCRIPT DI VERIFICA SCHEMA
-- Esegui questo script DOPO FASE1_SCHEMA_MIGRATION.sql
-- ============================================

-- ============================================
-- 1. VERIFICA COLONNE formaggi
-- ============================================
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'formaggi' 
  AND column_name IN (
    'id',
    'name',
    'color',
    'protocol',
    'yield_percentage',
    'yield_liters_per_kg',
    'prices',
    'default_fields',
    'custom_fields',
    'price_per_kg',
    'created_at',
    'updated_at'
  )
ORDER BY ordinal_position;

-- Verifica che yield_percentage esista
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'formaggi' AND column_name = 'yield_percentage'
  ) THEN
    RAISE EXCEPTION 'Colonna yield_percentage non trovata in formaggi!';
  END IF;
  RAISE NOTICE '✅ yield_percentage presente';
END $$;

-- Verifica che prices esista
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'formaggi' AND column_name = 'prices'
  ) THEN
    RAISE EXCEPTION 'Colonna prices non trovata in formaggi!';
  END IF;
  RAISE NOTICE '✅ prices presente';
END $$;

-- Verifica che default_fields esista
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'formaggi' AND column_name = 'default_fields'
  ) THEN
    RAISE EXCEPTION 'Colonna default_fields non trovata in formaggi!';
  END IF;
  RAISE NOTICE '✅ default_fields presente';
END $$;

-- Verifica che custom_fields esista
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'formaggi' AND column_name = 'custom_fields'
  ) THEN
    RAISE EXCEPTION 'Colonna custom_fields non trovata in formaggi!';
  END IF;
  RAISE NOTICE '✅ custom_fields presente';
END $$;

-- ============================================
-- 2. VERIFICA COLONNE attività
-- ============================================
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'attività' 
  AND column_name IN (
    'id',
    'date',
    'title',
    'description',
    'recurrence',
    'type',
    'production_id',
    'cheese_type_id',
    'is_completed',
    'completed_dates',
    'created_at',
    'updated_at'
  )
ORDER BY ordinal_position;

-- Verifica che type esista
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'attività' AND column_name = 'type'
  ) THEN
    RAISE EXCEPTION 'Colonna type non trovata in attività!';
  END IF;
  RAISE NOTICE '✅ type presente in attività';
END $$;

-- Verifica che completed_dates esista
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'attività' AND column_name = 'completed_dates'
  ) THEN
    RAISE EXCEPTION 'Colonna completed_dates non trovata in attività!';
  END IF;
  RAISE NOTICE '✅ completed_dates presente in attività';
END $$;

-- ============================================
-- 3. VERIFICA INDICI
-- ============================================
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('formaggi', 'produzioni', 'attività')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Verifica indici formaggi
DO $$
DECLARE
  idx_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO idx_count
  FROM pg_indexes 
  WHERE tablename = 'formaggi' 
    AND indexname IN ('idx_formaggi_yield_percentage', 'idx_formaggi_prices');
  
  IF idx_count < 2 THEN
    RAISE WARNING 'Alcuni indici mancanti per formaggi (attesi 2, trovati %)', idx_count;
  ELSE
    RAISE NOTICE '✅ Indici formaggi presenti';
  END IF;
END $$;

-- ============================================
-- 4. VERIFICA CONSTRAINTS
-- ============================================
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name IN ('formaggi', 'attività')
  AND tc.constraint_type = 'CHECK'
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================
-- 5. VERIFICA DATI ESISTENTI
-- ============================================

-- Conta formaggi
SELECT 
  COUNT(*) as total_formaggi,
  COUNT(yield_percentage) as with_yield_percentage,
  COUNT(prices) as with_prices,
  COUNT(default_fields) as with_default_fields,
  COUNT(custom_fields) as with_custom_fields
FROM formaggi;

-- Conta attività
SELECT 
  COUNT(*) as total_attività,
  COUNT(type) as with_type,
  COUNT(production_id) as with_production_id,
  COUNT(completed_dates) as with_completed_dates
FROM attività;

-- ============================================
-- 6. VERIFICA STRUTTURA JSONB
-- ============================================

-- Esempio di formaggio con prices valido
SELECT 
  id,
  name,
  prices->>'price1' as price1,
  prices->>'salesPercentage1' as sales_pct1,
  jsonb_typeof(prices) as prices_type
FROM formaggi
WHERE prices IS NOT NULL
LIMIT 5;

-- Esempio di formaggio con default_fields
SELECT 
  id,
  name,
  default_fields->>'temperaturaCoagulazione' as temp_coag,
  default_fields->>'nomeFermento' as fermento,
  jsonb_typeof(default_fields) as default_fields_type
FROM formaggi
WHERE default_fields IS NOT NULL AND default_fields != '{}'::jsonb
LIMIT 5;

-- ============================================
-- 7. VERIFICA REAL-TIME (se abilitato)
-- ============================================
-- Nota: questa query potrebbe non funzionare se non hai i permessi
-- Verifica manualmente in Supabase Dashboard → Database → Replication

SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
        AND tablename = t.tablename
    ) THEN '✅ Abilitato'
    ELSE '❌ Non abilitato'
  END as realtime_status
FROM pg_tables t
WHERE schemaname = 'public'
  AND tablename IN ('formaggi', 'produzioni', 'attività')
ORDER BY tablename;

-- ============================================
-- 8. RIEPILOGO FINALE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICA SCHEMA COMPLETATA';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Controlla i risultati sopra per eventuali errori o warning';
  RAISE NOTICE 'Se tutto è ✅, procedi con Fase 2 (RLS Policies)';
END $$;
