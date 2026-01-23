-- ============================================
-- FASE 1: ABILITARE REAL-TIME PER LE TABELLE
-- Versione 2 - Metodo alternativo
-- ============================================
-- Esegui questo script nella SQL Editor di Supabase

-- Aggiungi le tabelle alla pubblicazione real-time
-- Se le tabelle sono già nella pubblicazione, verrà generato un warning ma non un errore
DO $$
BEGIN
  -- Aggiungi formaggi (ignora se già presente)
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE formaggi;
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'formaggi già presente nella pubblicazione';
  END;
  
  -- Aggiungi produzioni (ignora se già presente)
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE produzioni;
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'produzioni già presente nella pubblicazione';
  END;
  
  -- Aggiungi attività (ignora se già presente)
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE attività;
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'attività già presente nella pubblicazione';
  END;
END $$;

-- Verifica che il real-time sia abilitato
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
        AND schemaname = t.schemaname
        AND tablename = t.tablename
    ) THEN '✅ Abilitato'
    ELSE '❌ Non abilitato'
  END as realtime_status
FROM pg_tables t
WHERE schemaname = 'public'
  AND tablename IN ('formaggi', 'produzioni', 'attività')
ORDER BY tablename;

-- Verifica anche direttamente dalla pubblicazione
SELECT 
  pubname,
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('formaggi', 'produzioni', 'attività')
ORDER BY tablename;
