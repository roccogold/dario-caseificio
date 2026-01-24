-- ============================================
-- FASE 1: ELIMINARE TUTTI I DATI DALLE TABELLE
-- ATTENZIONE: Questo elimina TUTTI i dati!
-- ============================================
-- Esegui questo script nella SQL Editor di Supabase

-- Disabilita temporaneamente i trigger per evitare problemi
SET session_replication_role = 'replica';

-- Elimina i dati rispettando le foreign key constraints
-- Ordine: prima le tabelle con foreign key, poi quelle referenziate

-- 1. Elimina tutte le attività (ha foreign key a produzioni e formaggi)
DELETE FROM attività;

-- 2. Elimina tutte le produzioni
DELETE FROM produzioni;

-- 3. Elimina tutti i formaggi
DELETE FROM formaggi;

-- 4. Elimina tutti i logs (opzionale, ma meglio pulire anche questi)
DELETE FROM logs;

-- Riabilita i trigger
SET session_replication_role = 'origin';

-- Verifica che le tabelle siano vuote
SELECT 
  'formaggi' as tabella,
  COUNT(*) as record_count
FROM formaggi
UNION ALL
SELECT 
  'produzioni' as tabella,
  COUNT(*) as record_count
FROM produzioni
UNION ALL
SELECT 
  'attività' as tabella,
  COUNT(*) as record_count
FROM attività
UNION ALL
SELECT 
  'logs' as tabella,
  COUNT(*) as record_count
FROM logs;

-- Messaggio di conferma
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TUTTI I DATI SONO STATI ELIMINATI';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Le tabelle sono ora vuote e pronte per un nuovo inizio';
END $$;
