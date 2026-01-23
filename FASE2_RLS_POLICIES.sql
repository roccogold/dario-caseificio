-- ============================================
-- FASE 2: ROW LEVEL SECURITY (RLS) POLICIES
-- Protezione dati con autenticazione obbligatoria
-- ============================================
-- Esegui questo script nella SQL Editor di Supabase
-- Data: 2026-01-23

-- ============================================
-- 1. VERIFICA CHE RLS SIA ABILITATO
-- ============================================
-- Verifica che RLS sia abilitato su tutte le tabelle
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'formaggi'
    AND rowsecurity = true
  ) THEN
    ALTER TABLE formaggi ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS abilitato su formaggi';
  ELSE
    RAISE NOTICE '✅ RLS già abilitato su formaggi';
  END IF;

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

  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'attività'
    AND rowsecurity = true
  ) THEN
    ALTER TABLE attività ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS abilitato su attività';
  ELSE
    RAISE NOTICE '✅ RLS già abilitato su attività';
  END IF;

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
-- Rimuovi le policy che permettono accesso a tutti
DROP POLICY IF EXISTS "Allow all operations on formaggi" ON formaggi;
DROP POLICY IF EXISTS "Allow all operations on produzioni" ON produzioni;
DROP POLICY IF EXISTS "Allow all operations on attività" ON attività;
DROP POLICY IF EXISTS "Allow all operations on logs" ON logs;

-- Rimuovi anche le vecchie policy di autenticazione se esistono (per ricrearle)
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

-- ============================================
-- 3. CREA POLICY PER formaggi
-- ============================================
-- Solo utenti autenticati possono leggere
CREATE POLICY "Authenticated users can read formaggi" ON formaggi
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Solo utenti autenticati possono inserire
CREATE POLICY "Authenticated users can insert formaggi" ON formaggi
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Solo utenti autenticati possono aggiornare
CREATE POLICY "Authenticated users can update formaggi" ON formaggi
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Solo utenti autenticati possono eliminare
CREATE POLICY "Authenticated users can delete formaggi" ON formaggi
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 4. CREA POLICY PER produzioni
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
-- 5. CREA POLICY PER attività
-- ============================================
CREATE POLICY "Authenticated users can read attività" ON attività
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert attività" ON attività
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update attività" ON attività
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete attività" ON attività
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 6. CREA POLICY PER logs
-- ============================================
-- Solo utenti autenticati possono inserire logs
CREATE POLICY "Authenticated users can insert logs" ON logs
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Nessuna policy SELECT = nessuno può leggere logs via API
-- I logs sono visibili solo dal dashboard Supabase

-- ============================================
-- 7. VERIFICA FINALE
-- ============================================
-- Verifica che tutte le policy siano state create
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
ORDER BY tablename, policyname;

-- ============================================
-- RIEPILOGO
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS POLICIES APPLICATE CON SUCCESSO';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ RLS abilitato su tutte le tabelle';
  RAISE NOTICE '✅ Policy create per formaggi (4 policy)';
  RAISE NOTICE '✅ Policy create per produzioni (4 policy)';
  RAISE NOTICE '✅ Policy create per attività (4 policy)';
  RAISE NOTICE '✅ Policy create per logs (1 policy - solo INSERT)';
  RAISE NOTICE '';
  RAISE NOTICE 'IMPORTANTE:';
  RAISE NOTICE '- Solo utenti autenticati possono accedere ai dati';
  RAISE NOTICE '- I logs non sono leggibili via API (solo dashboard)';
  RAISE NOTICE '- Testa l''autenticazione prima di andare in produzione';
END $$;
