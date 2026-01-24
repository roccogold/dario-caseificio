-- Script per aggiungere le colonne yield_liters_per_kg e price_per_kg alla tabella formaggi
-- Esegui questo script nella SQL Editor di Supabase se la tabella formaggi esiste già

-- Aggiungi colonna resa (litri per kg)
ALTER TABLE formaggi 
ADD COLUMN IF NOT EXISTS yield_liters_per_kg DECIMAL(5,2);

-- Aggiungi colonna prezzo (euro per kg)
ALTER TABLE formaggi 
ADD COLUMN IF NOT EXISTS price_per_kg DECIMAL(10,2);

-- Verifica che le colonne siano state aggiunte
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'formaggi'
  AND column_name IN ('yield_liters_per_kg', 'price_per_kg');
