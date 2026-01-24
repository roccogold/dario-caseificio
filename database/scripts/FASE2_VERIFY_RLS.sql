-- ============================================
-- FASE 2: VERIFICA RLS POLICIES
-- Esegui questo script DOPO FASE2_RLS_POLICIES.sql
-- ============================================

-- ============================================
-- 1. VERIFICA CHE RLS SIA ABILITATO
-- ============================================
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

-- ============================================
-- 2. VERIFICA POLICY ESISTENTI
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as operation,
  CASE 
    WHEN qual IS NOT NULL THEN '✅ USING clause presente'
    ELSE '⚠️ Nessuna USING clause'
  END as using_status,
  CASE 
    WHEN with_check IS NOT NULL THEN '✅ WITH CHECK clause presente'
    ELSE '⚠️ Nessuna WITH CHECK clause'
  END as with_check_status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('formaggi', 'produzioni', 'attività', 'logs')
ORDER BY tablename, cmd;

-- ============================================
-- 3. CONTA POLICY PER TABELLA
-- ============================================
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

-- ============================================
-- 4. VERIFICA POLICY ATTESE
-- ============================================
DO $$
DECLARE
  formaggi_count INTEGER;
  produzioni_count INTEGER;
  attività_count INTEGER;
  logs_count INTEGER;
BEGIN
  -- Conta policy per formaggi (dovrebbero essere 4: SELECT, INSERT, UPDATE, DELETE)
  SELECT COUNT(*) INTO formaggi_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'formaggi';
  
  IF formaggi_count = 4 THEN
    RAISE NOTICE '✅ formaggi: 4 policy presenti (corretto)';
  ELSE
    RAISE WARNING '⚠️ formaggi: % policy trovate (attese 4)', formaggi_count;
  END IF;

  -- Conta policy per produzioni (dovrebbero essere 4)
  SELECT COUNT(*) INTO produzioni_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'produzioni';
  
  IF produzioni_count = 4 THEN
    RAISE NOTICE '✅ produzioni: 4 policy presenti (corretto)';
  ELSE
    RAISE WARNING '⚠️ produzioni: % policy trovate (attese 4)', produzioni_count;
  END IF;

  -- Conta policy per attività (dovrebbero essere 4)
  SELECT COUNT(*) INTO attività_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'attività';
  
  IF attività_count = 4 THEN
    RAISE NOTICE '✅ attività: 4 policy presenti (corretto)';
  ELSE
    RAISE WARNING '⚠️ attività: % policy trovate (attese 4)', attività_count;
  END IF;

  -- Conta policy per logs (dovrebbe essere 1: solo INSERT)
  SELECT COUNT(*) INTO logs_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'logs';
  
  IF logs_count = 1 THEN
    RAISE NOTICE '✅ logs: 1 policy presente (corretto - solo INSERT)';
  ELSE
    RAISE WARNING '⚠️ logs: % policy trovate (attesa 1)', logs_count;
  END IF;
END $$;

-- ============================================
-- 5. VERIFICA CHE LE POLICY RICHIEDANO AUTH
-- ============================================
-- Controlla che tutte le policy usino auth.uid() IS NOT NULL
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%' THEN '✅ Richiede autenticazione'
    ELSE '❌ NON richiede autenticazione'
  END as auth_required
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('formaggi', 'produzioni', 'attività', 'logs')
ORDER BY tablename, cmd;

-- ============================================
-- 6. TEST POLICY (richiede autenticazione)
-- ============================================
-- NOTA: Questi test funzionano solo se eseguiti da un utente autenticato
-- Per testare completamente, usa l'applicazione frontend

-- ============================================
-- RIEPILOGO FINALE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICA RLS COMPLETATA';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Controlla i risultati sopra per eventuali warning o errori';
  RAISE NOTICE '';
  RAISE NOTICE 'Prossimi passi:';
  RAISE NOTICE '1. Verifica che tutte le policy siano presenti';
  RAISE NOTICE '2. Testa l''autenticazione nell''applicazione';
  RAISE NOTICE '3. Verifica che utenti non autenticati non possano accedere ai dati';
END $$;
