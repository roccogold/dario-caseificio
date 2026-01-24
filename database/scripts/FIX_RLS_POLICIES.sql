-- ============================================
-- FIX RLS POLICIES - Risolve problemi UPDATE
-- ============================================
-- Questo script corregge le RLS policies per permettere
-- correttamente UPDATE operations che restituiscono dati
-- Data: 2026-01-23

-- ============================================
-- 1. VERIFICA STATO ATTUALE
-- ============================================
-- Mostra le policies esistenti
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('formaggi', 'produzioni', 'attività', 'logs')
ORDER BY tablename, cmd, policyname;

-- ============================================
-- 2. RIMUOVI TUTTE LE POLICY ESISTENTI
-- ============================================
-- Rimuovi tutte le policy per ricrearle correttamente
DROP POLICY IF EXISTS "Authenticated users can read formaggi" ON formaggi;
DROP POLICY IF EXISTS "Authenticated users can insert formaggi" ON formaggi;
DROP POLICY IF EXISTS "Authenticated users can update formaggi" ON formaggi;
DROP POLICY IF EXISTS "Authenticated users can delete formaggi" ON formaggi;

DROP POLICY IF EXISTS "Authenticated users can read produzioni" ON produzioni;
DROP POLICY IF EXISTS "Authenticated users can insert produzioni" ON produzioni;
DROP POLICY IF EXISTS "Authenticated users can update produzioni" ON produzioni;
DROP POLICY IF EXISTS "Authenticated users can delete produzioni" ON produzioni;

DROP POLICY IF EXISTS "Authenticated users can read attività" ON attività;
DROP POLICY IF EXISTS "Authenticated users can insert attività" ON attività;
DROP POLICY IF EXISTS "Authenticated users can update attività" ON attività;
DROP POLICY IF EXISTS "Authenticated users can delete attività" ON attività;

DROP POLICY IF EXISTS "Authenticated users can insert logs" ON logs;

-- Rimuovi anche policy legacy se esistono
DROP POLICY IF EXISTS "Allow all operations on formaggi" ON formaggi;
DROP POLICY IF EXISTS "Allow all operations on produzioni" ON produzioni;
DROP POLICY IF EXISTS "Allow all operations on attività" ON attività;
DROP POLICY IF EXISTS "Allow all operations on logs" ON logs;

-- ============================================
-- 3. ASSICURA CHE RLS SIA ABILITATO
-- ============================================
ALTER TABLE formaggi ENABLE ROW LEVEL SECURITY;
ALTER TABLE produzioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE attività ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREA POLICY PER formaggi
-- ============================================
-- SELECT: utenti autenticati possono leggere tutte le righe
CREATE POLICY "Authenticated users can read formaggi" ON formaggi
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- INSERT: utenti autenticati possono inserire
CREATE POLICY "Authenticated users can insert formaggi" ON formaggi
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: IMPORTANTE - USING deve permettere di vedere la riga, WITH CHECK deve permettere l'update
-- Se USING restituisce false, la riga non esiste per l'utente e UPDATE restituisce 0 righe
CREATE POLICY "Authenticated users can update formaggi" ON formaggi
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL)  -- Deve vedere la riga per aggiornarla
  WITH CHECK (auth.uid() IS NOT NULL);  -- Deve poter salvare i nuovi valori

-- DELETE: utenti autenticati possono eliminare
CREATE POLICY "Authenticated users can delete formaggi" ON formaggi
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 5. CREA POLICY PER produzioni
-- ============================================
CREATE POLICY "Authenticated users can read produzioni" ON produzioni
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert produzioni" ON produzioni
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update produzioni" ON produzioni
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete produzioni" ON produzioni
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 6. CREA POLICY PER attività (CRITICO)
-- ============================================
-- SELECT: utenti autenticati possono leggere tutte le righe
CREATE POLICY "Authenticated users can read attività" ON attività
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- INSERT: utenti autenticati possono inserire
CREATE POLICY "Authenticated users can insert attività" ON attività
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: CRITICO - deve permettere di vedere E aggiornare la riga
-- Se USING restituisce false, UPDATE restituisce 0 righe → errore PGRST116
CREATE POLICY "Authenticated users can update attività" ON attività
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL)  -- CRITICO: deve vedere la riga esistente
  WITH CHECK (auth.uid() IS NOT NULL);  -- CRITICO: deve poter salvare i nuovi valori

-- DELETE: utenti autenticati possono eliminare
CREATE POLICY "Authenticated users can delete attività" ON attività
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 7. CREA POLICY PER logs
-- ============================================
-- Solo INSERT, nessun SELECT (logs visibili solo dal dashboard)
CREATE POLICY "Authenticated users can insert logs" ON logs
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- 8. VERIFICA FINALE
-- ============================================
-- Mostra tutte le policy create
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN '✅ USING clause presente'
    ELSE '❌ USING clause mancante'
  END as using_status,
  CASE 
    WHEN with_check IS NOT NULL THEN '✅ WITH CHECK clause presente'
    ELSE '❌ WITH CHECK clause mancante'
  END as with_check_status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('formaggi', 'produzioni', 'attività', 'logs')
ORDER BY tablename, cmd, policyname;

-- ============================================
-- 9. TEST QUERY (opzionale - commenta se non vuoi eseguire)
-- ============================================
-- Testa che le policy funzionino correttamente
-- IMPORTANTE: Esegui queste query come utente autenticato (non come service_role)
/*
-- Test SELECT
SELECT COUNT(*) FROM attività WHERE auth.uid() IS NOT NULL;

-- Test che UPDATE possa vedere le righe
-- (questo dovrebbe restituire almeno 0, non errore)
SELECT COUNT(*) FROM attività 
WHERE auth.uid() IS NOT NULL 
  AND id = 'some-existing-id';
*/

-- ============================================
-- RIEPILOGO
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS POLICIES AGGIORNATE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ RLS abilitato su tutte le tabelle';
  RAISE NOTICE '✅ Policy ricreate per formaggi (4 policy)';
  RAISE NOTICE '✅ Policy ricreate per produzioni (4 policy)';
  RAISE NOTICE '✅ Policy ricreate per attività (4 policy)';
  RAISE NOTICE '✅ Policy ricreate per logs (1 policy)';
  RAISE NOTICE '';
  RAISE NOTICE 'IMPORTANTE:';
  RAISE NOTICE '- USING clause permette di VEDERE le righe per UPDATE';
  RAISE NOTICE '- WITH CHECK clause permette di SALVARE i nuovi valori';
  RAISE NOTICE '- Se USING restituisce false, UPDATE restituisce 0 righe';
  RAISE NOTICE '- Verifica che auth.uid() IS NOT NULL durante le operazioni';
  RAISE NOTICE '';
  RAISE NOTICE 'Se il problema persiste:';
  RAISE NOTICE '1. Verifica che l''utente sia autenticato (auth.uid() IS NOT NULL)';
  RAISE NOTICE '2. Verifica che la riga esista: SELECT * FROM attività WHERE id = ''...''';
  RAISE NOTICE '3. Verifica che la policy SELECT permetta di vedere la riga';
  RAISE NOTICE '4. Verifica che la policy UPDATE abbia USING (auth.uid() IS NOT NULL)';
END $$;
