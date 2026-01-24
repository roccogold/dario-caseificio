import type { CheeseType, Production, Activity, ProtocolStep, ProductionCheese, RecurrenceType } from "@/types";

// ============================================
// DATABASE TYPES (snake_case)
// ============================================

interface DbCheese {
  id: string;
  name: string;
  color: string;
  protocol: ProtocolStep[];
  yield_liters_per_kg: number | null; // Legacy: kg per liter (resa)
  yield_percentage: number | null; // Nuovo: % resa (es. 20 = 20kg da 100L)
  price_per_kg: number | null; // Legacy: prezzo singolo
  prices: {
    price1: number;
    price2: number;
    price3: number;
    salesPercentage1: number;
    salesPercentage2: number;
    salesPercentage3: number;
  } | null; // Nuovo: 3 prezzi con % vendita
  default_fields: {
    temperaturaCoagulazione?: string;
    nomeFermento?: string;
    quantitaFermento?: string;
    muffe?: string;
    quantitaMuffe?: string;
    caglio?: string;
    quantitaCaglio?: string;
  } | null; // Nuovo: parametri predefiniti
  custom_fields: Array<{ key: string; value: string }> | null; // Nuovo: campi personalizzati
  created_at: string;
  updated_at?: string;
}

interface DbProduction {
  id: string;
  production_number: string;
  production_date: string;
  total_liters: number;
  cheeses: ProductionCheese[];
  notes: string | null;
  created_at: string;
  updated_at?: string;
}

interface DbActivity {
  id: string;
  date: string;
  title: string;
  description: string | null;
  type: 'protocol' | 'recurring' | 'one-time' | null;
  recurrence: RecurrenceType | null;
  production_id: string | null;
  cheese_type_id: string | null;
  is_completed: boolean;
  completed_dates: string[] | null; // Nuovo: array di date per attività ricorrenti
  created_at: string;
  updated_at?: string;
}

// ============================================
// CONVERSION: Database → TypeScript
// ============================================

export function dbCheeseToType(dbCheese: DbCheese): CheeseType {
  // Calcola yieldPercentage: se presente nel DB usa quello, altrimenti converte da yield_liters_per_kg, altrimenti undefined
  let yieldPercentage: number | undefined;
  if (dbCheese.yield_percentage !== null && dbCheese.yield_percentage !== undefined) {
    yieldPercentage = Number(dbCheese.yield_percentage);
  } else if (dbCheese.yield_liters_per_kg !== null && dbCheese.yield_liters_per_kg !== undefined) {
    // Conversione: yield_liters_per_kg (kg/L) → yield_percentage (%)
    yieldPercentage = Number(dbCheese.yield_liters_per_kg) * 100;
  }
  // Se entrambi sono null, yieldPercentage rimane undefined (opzionale)

  // Gestisci prices: se presente nel DB usa quello, altrimenti usa price_per_kg legacy, altrimenti undefined
  let prices: CheeseType['prices'] | undefined;
  if (dbCheese.prices && typeof dbCheese.prices === 'object') {
    prices = {
      price1: Number(dbCheese.prices.price1) || 0,
      price2: Number(dbCheese.prices.price2) || 0,
      price3: Number(dbCheese.prices.price3) || 0,
      salesPercentage1: Number(dbCheese.prices.salesPercentage1) || 0,
      salesPercentage2: Number(dbCheese.prices.salesPercentage2) || 0,
      salesPercentage3: Number(dbCheese.prices.salesPercentage3) || 0,
    };
  } else if (dbCheese.price_per_kg !== null && dbCheese.price_per_kg !== undefined) {
    // Fallback a price_per_kg legacy
    prices = {
      price1: Number(dbCheese.price_per_kg),
      price2: 0,
      price3: 0,
      salesPercentage1: 100,
      salesPercentage2: 0,
      salesPercentage3: 0,
    };
  }
  // Se entrambi sono null, prices rimane undefined (opzionale)

  return {
    id: dbCheese.id,
    name: dbCheese.name,
    color: dbCheese.color,
    protocol: dbCheese.protocol || [],
    ...(yieldPercentage !== undefined && { yieldPercentage }),
    ...(prices !== undefined && { prices }),
    defaultFields: dbCheese.default_fields || undefined,
    customFields: dbCheese.custom_fields || undefined,
    // Legacy fields per backward compatibility
    yieldPerLiter: dbCheese.yield_liters_per_kg ?? (yieldPercentage ? yieldPercentage / 100 : undefined),
    pricePerKg: dbCheese.price_per_kg ?? (prices ? prices.price1 : undefined),
    createdAt: new Date(dbCheese.created_at),
  };
}

export function dbProductionToType(dbProduction: DbProduction): Production {
  return {
    id: dbProduction.id,
    date: new Date(dbProduction.production_date),
    productionNumber: dbProduction.production_number,
    cheeses: dbProduction.cheeses || [],
    totalLiters: dbProduction.total_liters,
    notes: dbProduction.notes || undefined,
    createdAt: new Date(dbProduction.created_at),
  };
}

export function dbActivityToType(dbActivity: DbActivity): Activity {
  return {
    id: dbActivity.id,
    title: dbActivity.title,
    description: dbActivity.description || undefined,
    date: new Date(dbActivity.date),
    type: (dbActivity.type || 'one-time') as 'protocol' | 'recurring' | 'one-time',
    recurrence: (dbActivity.recurrence || undefined) as RecurrenceType | undefined,
    productionId: dbActivity.production_id || undefined,
    cheeseTypeId: dbActivity.cheese_type_id || undefined,
    completed: dbActivity.is_completed,
    completedDates: dbActivity.completed_dates || undefined,
    createdAt: new Date(dbActivity.created_at),
  };
}

// ============================================
// CONVERSION: TypeScript → Database
// ============================================

export function typeCheeseToDb(cheese: Omit<CheeseType, "id" | "createdAt"> & { id?: string }): Partial<DbCheese> {
  // Calcola yield_percentage: se presente usa quello, altrimenti null (opzionale)
  const yieldPercentage = cheese.yieldPercentage !== undefined 
    ? cheese.yieldPercentage 
    : (cheese.yieldPerLiter ? cheese.yieldPerLiter * 100 : null);

  // Usa prices se presente, altrimenti null (opzionale) o legacy pricePerKg
  // Se prices è un oggetto vuoto o ha tutti valori 0, lo salviamo comunque
  let prices = null;
  if (cheese.prices) {
    // Se prices esiste, usalo anche se ha valori 0
    prices = {
      price1: cheese.prices.price1 || 0,
      price2: cheese.prices.price2 || 0,
      price3: cheese.prices.price3 || 0,
      salesPercentage1: cheese.prices.salesPercentage1 || 0,
      salesPercentage2: cheese.prices.salesPercentage2 || 0,
      salesPercentage3: cheese.prices.salesPercentage3 || 0,
    };
  } else if (cheese.pricePerKg) {
    // Fallback a legacy pricePerKg
    prices = {
      price1: cheese.pricePerKg,
      price2: 0,
      price3: 0,
      salesPercentage1: 100,
      salesPercentage2: 0,
      salesPercentage3: 0,
    };
  }

  // Gestisci defaultFields: sempre usa quello fornito
  // Se è undefined, usa null. Se è un oggetto (anche vuoto), usalo
  const defaultFields = cheese.defaultFields !== undefined 
    ? cheese.defaultFields  // Usa l'oggetto così com'è, anche se vuoto
    : null;

  // Gestisci customFields: se è un array vuoto, salvalo come [] invece di null
  const customFields = cheese.customFields && cheese.customFields.length > 0
    ? cheese.customFields
    : (cheese.customFields !== undefined ? [] : null);

  // Assicurati che il protocollo sia sempre un array, anche se undefined
  const protocol = Array.isArray(cheese.protocol) ? cheese.protocol : [];
  
  // Debug logging (only in development)
  if (import.meta.env.DEV && cheese.protocol !== undefined) {
    console.log('[typeCheeseToDb] Protocol conversion:', {
      input: cheese.protocol,
      inputType: typeof cheese.protocol,
      isArray: Array.isArray(cheese.protocol),
      output: protocol,
      length: protocol.length
    });
  }
  
  return {
    ...(cheese.id && { id: cheese.id }), // Includi l'ID se fornito (per insert con UUID pre-generato)
    name: cheese.name,
    color: cheese.color,
    protocol: protocol, // Usa sempre un array, anche se vuoto
    yield_percentage: yieldPercentage,
    prices: prices,
    default_fields: defaultFields,
    custom_fields: customFields,
    // Mantieni anche legacy fields per backward compatibility
    yield_liters_per_kg: cheese.yieldPerLiter ?? (yieldPercentage ? yieldPercentage / 100 : null),
    price_per_kg: cheese.pricePerKg ?? (prices ? prices.price1 : null),
  };
}

export function typeProductionToDb(production: Omit<Production, "id" | "createdAt" | "totalLiters"> & { id?: string; totalLiters?: number }): Partial<DbProduction> {
  const totalLiters = production.totalLiters ?? production.cheeses.reduce((sum, c) => sum + c.liters, 0);
  
  return {
    ...(production.id && { id: production.id }), // Includi l'ID se fornito (per insert con UUID pre-generato)
    production_number: production.productionNumber,
    production_date: production.date.toISOString().split('T')[0], // YYYY-MM-DD
    total_liters: totalLiters,
    cheeses: production.cheeses,
    notes: production.notes || null,
  };
}

export function typeActivityToDb(activity: Omit<Activity, "id" | "createdAt"> & { id?: string }): Partial<DbActivity> {
  return {
    ...(activity.id && { id: activity.id }), // Includi l'ID se fornito (per insert con UUID pre-generato)
    date: activity.date.toISOString().split('T')[0], // YYYY-MM-DD
    title: activity.title,
    description: activity.description || null,
    type: activity.type || null,
    recurrence: activity.recurrence || null,
    production_id: activity.productionId || null,
    cheese_type_id: activity.cheeseTypeId || null,
    is_completed: activity.completed ?? false,
    completed_dates: activity.completedDates || null,
  };
}
