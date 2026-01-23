import { CheeseType, Production, Activity, ProtocolStep, ProductionCheese } from "@/types";

// ============================================
// DATABASE TYPES (snake_case)
// ============================================

interface DbCheese {
  id: string;
  name: string;
  color: string;
  protocol: ProtocolStep[];
  yield_liters_per_kg: number | null; // ATTENZIONE: nome confuso, ma è kg per liter
  price_per_kg: number | null;
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
  recurrence: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'none' | null;
  production_id: string | null;
  cheese_type_id: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at?: string;
}

// ============================================
// CONVERSION: Database → TypeScript
// ============================================

export function dbCheeseToType(dbCheese: DbCheese): CheeseType {
  return {
    id: dbCheese.id,
    name: dbCheese.name,
    color: dbCheese.color,
    protocol: dbCheese.protocol || [],
    // ATTENZIONE: yield_liters_per_kg nel DB è in realtà kg per liter (resa)
    yieldPerLiter: dbCheese.yield_liters_per_kg ?? 0,
    pricePerKg: dbCheese.price_per_kg ?? 0,
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
    recurrence: dbActivity.recurrence || undefined,
    productionId: dbActivity.production_id || undefined,
    cheeseTypeId: dbActivity.cheese_type_id || undefined,
    completed: dbActivity.is_completed,
    createdAt: new Date(dbActivity.created_at),
  };
}

// ============================================
// CONVERSION: TypeScript → Database
// ============================================

export function typeCheeseToDb(cheese: Omit<CheeseType, "id" | "createdAt"> & { id?: string }): Partial<DbCheese> {
  return {
    name: cheese.name,
    color: cheese.color,
    protocol: cheese.protocol || [],
    // ATTENZIONE: yield_liters_per_kg nel DB è in realtà kg per liter (resa)
    yield_liters_per_kg: cheese.yieldPerLiter,
    price_per_kg: cheese.pricePerKg,
  };
}

export function typeProductionToDb(production: Omit<Production, "id" | "createdAt" | "totalLiters"> & { id?: string; totalLiters?: number }): Partial<DbProduction> {
  const totalLiters = production.totalLiters ?? production.cheeses.reduce((sum, c) => sum + c.liters, 0);
  
  return {
    production_number: production.productionNumber,
    production_date: production.date.toISOString().split('T')[0], // YYYY-MM-DD
    total_liters: totalLiters,
    cheeses: production.cheeses,
    notes: production.notes || null,
  };
}

export function typeActivityToDb(activity: Omit<Activity, "id" | "createdAt"> & { id?: string }): Partial<DbActivity> {
  return {
    date: activity.date.toISOString().split('T')[0], // YYYY-MM-DD
    title: activity.title,
    description: activity.description || null,
    type: activity.type,
    recurrence: activity.recurrence || null,
    production_id: activity.productionId || null,
    cheese_type_id: activity.cheeseTypeId || null,
    is_completed: activity.completed,
  };
}
