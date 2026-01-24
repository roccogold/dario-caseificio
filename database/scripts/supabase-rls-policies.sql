-- Policy RLS per sicurezza con Supabase Auth
-- Esegui questo script DOPO aver creato l'utente in Supabase Auth

-- Rimuovi le policy esistenti (se esistono)
DROP POLICY IF EXISTS "Allow all operations on formaggi" ON formaggi;
DROP POLICY IF EXISTS "Allow all operations on produzioni" ON produzioni;
DROP POLICY IF EXISTS "Allow all operations on attività" ON attività;
DROP POLICY IF EXISTS "Allow all operations on logs" ON logs;

-- Policy per formaggi: solo utenti autenticati possono leggere e scrivere
CREATE POLICY "Authenticated users can read formaggi" ON formaggi
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert formaggi" ON formaggi
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update formaggi" ON formaggi
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete formaggi" ON formaggi
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Policy per produzioni: solo utenti autenticati possono leggere e scrivere
CREATE POLICY "Authenticated users can read produzioni" ON produzioni
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert produzioni" ON produzioni
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update produzioni" ON produzioni
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete produzioni" ON produzioni
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Policy per attività: solo utenti autenticati possono leggere e scrivere
CREATE POLICY "Authenticated users can read attività" ON attività
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert attività" ON attività
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update attività" ON attività
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete attività" ON attività
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Policy per logs: solo utenti autenticati possono inserire, nessuno può leggere via API
-- (i logs sono visibili solo dal dashboard Supabase)
CREATE POLICY "Authenticated users can insert logs" ON logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Nessuna policy SELECT per logs = nessuno può leggere via API (solo dal dashboard)
