-- Schema database per Dario - Diario di Produzione Formaggi
-- Esegui questo script nella SQL Editor di Supabase

-- Tabella: formaggi
CREATE TABLE IF NOT EXISTS formaggi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  protocol JSONB DEFAULT '[]'::jsonb,
  yield_liters_per_kg DECIMAL(5,2),
  price_per_kg DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella: produzioni
CREATE TABLE IF NOT EXISTS produzioni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_number TEXT NOT NULL UNIQUE,
  production_date DATE NOT NULL,
  total_liters INTEGER NOT NULL DEFAULT 0,
  cheeses JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella: attività
CREATE TABLE IF NOT EXISTS attività (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  recurrence TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella: logs
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'formaggio', 'produzione', 'attività', etc.
  entity_id TEXT,
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_produzioni_date ON produzioni(production_date);
CREATE INDEX IF NOT EXISTS idx_produzioni_number ON produzioni(production_number);
CREATE INDEX IF NOT EXISTS idx_attività_date ON attività(date);
CREATE INDEX IF NOT EXISTS idx_logs_username ON logs(username);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_action ON logs(action);

-- Funzione per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_formaggi_updated_at BEFORE UPDATE ON formaggi
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_produzioni_updated_at BEFORE UPDATE ON produzioni
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attività_updated_at BEFORE UPDATE ON attività
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Abilita Row Level Security (RLS)
ALTER TABLE formaggi ENABLE ROW LEVEL SECURITY;
ALTER TABLE produzioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE attività ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Policy: tutti possono leggere e scrivere (per ora, puoi restringere dopo)
CREATE POLICY "Allow all operations on formaggi" ON formaggi
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on produzioni" ON produzioni
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on attività" ON attività
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on logs" ON logs
  FOR ALL USING (true) WITH CHECK (true);
