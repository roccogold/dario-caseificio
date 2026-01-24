# Analisi Compatibilità Schema Supabase vs TypeScript Types

## 📊 Confronto Tabelle vs Tipi

### ✅ TABELLA: `formaggi` → `CheeseType`

| Campo DB | Tipo DB | Campo TS | Tipo TS | Status |
|----------|---------|----------|---------|--------|
| `id` | UUID | `id` | string | ✅ OK |
| `name` | TEXT | `name` | string | ✅ OK |
| `color` | TEXT | `color` | string | ✅ OK |
| `protocol` | JSONB | `protocol` | ProtocolStep[] | ✅ OK |
| `yield_liters_per_kg` | DECIMAL | `yieldPerLiter` | number | ⚠️ **NOME DIVERSO** |
| `price_per_kg` | DECIMAL | `pricePerKg` | number | ⚠️ **NOME DIVERSO** |
| `created_at` | TIMESTAMP | `createdAt` | Date | ⚠️ **NOME DIVERSO** |

**Problemi:**
- `yield_liters_per_kg` vs `yieldPerLiter` - **ATTENZIONE**: Il DB ha "liters_per_kg" ma il tipo TS dice "PerLiter" (kg per liter). Verificare quale è corretto!
- Nomi snake_case vs camelCase (normale, serve conversione)

---

### ⚠️ TABELLA: `produzioni` → `Production`

| Campo DB | Tipo DB | Campo TS | Tipo TS | Status |
|----------|---------|----------|---------|--------|
| `id` | UUID | `id` | string | ✅ OK |
| `production_date` | DATE | `date` | Date | ⚠️ **NOME DIVERSO** |
| `production_number` | TEXT | `productionNumber` | string | ⚠️ **NOME DIVERSO** |
| `total_liters` | INTEGER | `totalLiters` | number | ⚠️ **NOME DIVERSO** |
| `cheeses` | JSONB | `cheeses` | ProductionCheese[] | ✅ OK (struttura da verificare) |
| `notes` | TEXT | `notes?` | string? | ✅ OK |
| `created_at` | TIMESTAMP | `createdAt` | Date | ⚠️ **NOME DIVERSO** |

**Struttura `cheeses` JSONB:**
- DB: Array di oggetti JSON
- TS: `ProductionCheese[]` con `{ cheeseTypeId: string, liters: number }`
- ✅ **COMPATIBILE** (verificato nel codice esistente)

---

### ❌ TABELLA: `attività` → `Activity`

| Campo DB | Tipo DB | Campo TS | Tipo TS | Status |
|----------|---------|----------|---------|--------|
| `id` | UUID | `id` | string | ✅ OK |
| `date` | DATE | `date` | Date | ✅ OK |
| `title` | TEXT | `title` | string | ✅ OK |
| `description` | TEXT | `description?` | string? | ✅ OK |
| `recurrence` | TEXT | `recurrence?` | 'daily'\|'weekly'\|'monthly'? | ✅ OK |
| `is_completed` | BOOLEAN | `completed` | boolean | ⚠️ **NOME DIVERSO** |
| `created_at` | TIMESTAMP | `createdAt` | Date | ⚠️ **NOME DIVERSO** |
| ❌ **MANCA** | - | `type` | 'protocol'\|'recurring'\|'one-time' | ❌ **CAMPO MANCANTE** |
| ❌ **MANCA** | - | `productionId?` | string? | ❌ **CAMPO MANCANTE** |
| ❌ **MANCA** | - | `cheeseTypeId?` | string? | ❌ **CAMPO MANCANTE** |

**Problemi CRITICI:**
1. ❌ Manca campo `type` - essenziale per distinguere tipo attività
2. ❌ Manca campo `production_id` - per collegare attività a produzione
3. ❌ Manca campo `cheese_type_id` - per collegare attività a formaggio

---

### ✅ TABELLA: `logs` → (Nessun tipo TS)

| Campo DB | Tipo DB | Uso |
|----------|---------|-----|
| `id` | UUID | ✅ OK |
| `username` | TEXT | ✅ OK |
| `action` | TEXT | ✅ OK |
| `entity_type` | TEXT | ✅ OK |
| `entity_id` | TEXT | ✅ OK |
| `ip_address` | INET | ✅ OK |
| `user_agent` | TEXT | ✅ OK |
| `details` | JSONB | ✅ OK |
| `created_at` | TIMESTAMP | ✅ OK |

**Status:** ✅ **OK** - Tabella completa, nessun tipo TS necessario

---

## 🔧 Modifiche Necessarie allo Schema

### 1. Tabella `attività` - AGGIUNGERE colonne:

```sql
ALTER TABLE attività 
  ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('protocol', 'recurring', 'one-time')) DEFAULT 'one-time',
  ADD COLUMN IF NOT EXISTS production_id UUID REFERENCES produzioni(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cheese_type_id UUID REFERENCES formaggi(id) ON DELETE SET NULL;
```

### 2. Verificare `yield_liters_per_kg` vs `yieldPerLiter`

**Domanda importante:** 
- Il DB ha `yield_liters_per_kg` (litri per kg)
- Il tipo TS ha `yieldPerLiter` (kg per liter)

**Sono INVERTITI!** Quale è corretto?

Se il tipo TS è corretto (kg per liter), allora:
- Il DB dovrebbe essere `yield_kg_per_liter` OPPURE
- Il tipo TS dovrebbe essere `yieldLitersPerKg`

**Raccomandazione:** Verificare nel codice esistente quale viene usato.

---

## 📝 Piano di Migrazione

### Step 1: Aggiornare schema `attività`
```sql
-- Aggiungere colonne mancanti
ALTER TABLE attività 
  ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('protocol', 'recurring', 'one-time')) DEFAULT 'one-time',
  ADD COLUMN IF NOT EXISTS production_id UUID REFERENCES produzioni(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cheese_type_id UUID REFERENCES formaggi(id) ON DELETE SET NULL;

-- Aggiungere indice per performance
CREATE INDEX IF NOT EXISTS idx_attività_type ON attività(type);
CREATE INDEX IF NOT EXISTS idx_attività_production_id ON attività(production_id);
CREATE INDEX IF NOT EXISTS idx_attività_cheese_type_id ON attività(cheese_type_id);
```

### Step 2: Verificare e correggere `yield_liters_per_kg`
- Controllare nel codice esistente quale convenzione viene usata
- Decidere se modificare DB o tipo TS

### Step 3: Creare funzioni di conversione TypeScript
- `dbCheeseToType()` - Converte da DB a CheeseType
- `typeCheeseToDb()` - Converte da CheeseType a DB
- Stesso per Production e Activity

---

## ✅ Compatibilità Generale

| Tabella | Compatibilità | Azione Richiesta |
|---------|---------------|------------------|
| `formaggi` | ⚠️ 85% | Conversione nomi + verifica yield |
| `produzioni` | ✅ 95% | Solo conversione nomi |
| `attività` | ❌ 60% | **AGGIUNGERE 3 colonne** |
| `logs` | ✅ 100% | Nessuna modifica |

---

## 🎯 Raccomandazione Finale

1. ✅ **Usare schema esistente** con piccole modifiche
2. ⚠️ **Aggiungere colonne mancanti** in `attività`
3. ⚠️ **Verificare** convenzione `yield_liters_per_kg` vs `yieldPerLiter`
4. ✅ **Creare adapter** per conversione DB ↔ TypeScript
5. ✅ **Mantenere real-time** subscriptions per tutte le tabelle
