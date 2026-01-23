-- ============================================
-- FASE 1: ABILITARE REAL-TIME PER LE TABELLE
-- ============================================
-- Esegui questo script nella SQL Editor di Supabase

-- Abilita real-time per formaggi
ALTER PUBLICATION supabase_realtime ADD TABLE formaggi;

-- Abilita real-time per produzioni
ALTER PUBLICATION supabase_realtime ADD TABLE produzioni;

-- Abilita real-time per attività
ALTER PUBLICATION supabase_realtime ADD TABLE attività;

-- Verifica che il real-time sia abilitato
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
