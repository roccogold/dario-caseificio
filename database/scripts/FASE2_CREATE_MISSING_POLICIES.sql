-- ============================================
-- FASE 2: CREA POLICY MANCANTI
-- Crea le policy per produzioni e logs se mancanti
-- ============================================
-- Esegui questo script se FASE2_CHECK_MISSING_POLICIES.sql
-- mostra che mancano policy per produzioni o logs

-- ============================================
-- 1. VERIFICA CHE RLS SIA ABILITATO
-- ============================================
DO $$
BEGIN
  -- Abilita RLS su produzioni se non già abilitato
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'produzioni'
    AND rowsecurity = true
  ) THEN
    ALTER TABLE produzioni ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS abilitato su produzioni';
  ELSE
    RAISE NOTICE '✅ RLS già abilitato su produzioni';
  END IF;

  -- Abilita RLS su logs se non già abilitato
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'logs'
    AND rowsecurity = true
  ) THEN
    ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS abilitato su logs';
  ELSE
    RAISE NOTICE '✅ RLS già abilitato su logs';
  END IF;
END $$;

-- ============================================
-- 2. RIMUOVI POLICY ESISTENTI (se presenti)
-- ============================================
DROP POLICY IF EXISTS "Allow all operations on produzioni" ON produzioni;
DROP POLICY IF EXISTS "Allow all operations on logs" ON logs;

DROP POLICY IF EXISTS "Authenticated users can read produzioni" ON produzioni;
DROP POLICY IF EXISTS "Authenticated users can insert produzioni" ON produzioni;
DROP POLICY IF EXISTS "Authenticated users can update produzioni" ON produzioni;
DROP POLICY IF EXISTS "Authenticated users can delete produzioni" ON produzioni;

DROP POLICY IF EXISTS "Authenticated users can insert logs" ON logs;

-- ============================================
-- 3. CREA POLICY PER produzioni
-- ============================================
-- Solo utenti autenticati possono leggere
CREATE POLICY "Authenticated users can read produzioni" ON produzioni
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Solo utenti autenticati possono inserire
CREATE POLICY "Authenticated users can insert produzioni" ON produzioni
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Solo utenti autenticati possono aggiornare
CREATE POLICY "Authenticated users can update produzioni" ON produzioni
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Solo utenti autenticati possono eliminare
CREATE POLICY "Authenticated users can delete produzioni" ON produzioni
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 4. CREA POLICY PER logs
-- ============================================
-- Solo utenti autenticati possono inserire logs
CREATE POLICY "Authenticated users can insert logs" ON logs
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Nessuna policy SELECT per logs = nessuno può leggere logs via API
-- I logs sono visibili solo dal dashboard Supabase

-- ============================================
-- 5. VERIFICA FINALE
-- ============================================
-- Verifica che tutte le policy siano state create
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' AND qual LIKE '%auth.uid()%' THEN '✅ OK'
    WHEN cmd = 'INSERT' AND with_check LIKE '%auth.uid()%' THEN '✅ OK'
    WHEN cmd = 'UPDATE' AND qual LIKE '%auth.uid()%' AND with_check LIKE '%auth.uid()%' THEN '✅ OK'
    WHEN cmd = 'DELETE' AND qual LIKE '%auth.uid()%' THEN '✅ OK'
    ELSE '⚠️ Verifica'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('produzioni', 'logs')
ORDER BY tablename, cmd;

-- ============================================
-- RIEPILOGO
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'POLICY PER produzioni E logs CREATE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Policy create per produzioni (4 policy)';
  RAISE NOTICE '✅ Policy create per logs (1 policy - solo INSERT)';
  RAISE NOTICE '';
  RAISE NOTICE 'IMPORTANTE:';
  RAISE NOTICE '- Solo utenti autenticati possono accedere ai dati';
  RAISE NOTICE '- I logs non sono leggibili via API (solo dashboard)';
END $$;
