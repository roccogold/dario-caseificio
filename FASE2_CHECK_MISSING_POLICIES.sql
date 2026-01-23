-- ============================================
-- FASE 2: VERIFICA POLICY MANCANTI
-- Controlla se tutte le policy sono state create
-- ============================================

-- Verifica policy per tutte le tabelle
SELECT 
  tablename,
  COUNT(*) as total_policies,
  COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as select_policies,
  COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) as insert_policies,
  COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) as update_policies,
  COUNT(CASE WHEN cmd = 'DELETE' THEN 1 END) as delete_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('formaggi', 'produzioni', 'attività', 'logs')
GROUP BY tablename
ORDER BY tablename;

-- Mostra tutte le policy esistenti con dettagli
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
  AND tablename IN ('formaggi', 'produzioni', 'attività', 'logs')
ORDER BY tablename, cmd;

-- Verifica se RLS è abilitato
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ RLS Abilitato'
    ELSE '❌ RLS Non Abilitato'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('formaggi', 'produzioni', 'attività', 'logs')
ORDER BY tablename;
