// ============= Type Definitions =============

export interface CustomField {
  key: string;
  value: string;
}

export interface DefaultFields {
  temperaturaCoagulazione?: string;
  nomeFermento?: string;
  quantitaFermento?: string;
  muffe?: string;
  quantitaMuffe?: string;
  caglio?: string;
  quantitaCaglio?: string;
}

export interface CheesePrices {
  price1: number;
  price2: number;
  price3: number;
  salesPercentage1: number;
  salesPercentage2: number;
  salesPercentage3: number;
}

export interface CheeseType {
  id: string;
  name: string;
  color: string;
  yieldPerLiter?: number; // Legacy: kg per liter
  yieldPercentage?: number; // New: % yield (e.g., 20 = 20kg from 100L)
  pricePerKg?: number; // Legacy: single price
  prices?: CheesePrices; // New: 3 prices with sales percentages
  defaultFields?: DefaultFields;
  customFields?: CustomField[];
  protocol: ProtocolStep[];
  createdAt: Date;
}

export interface ProtocolStep {
  day: number;
  activity: string;
}

export interface Production {
  id: string;
  date: Date;
  productionNumber: string;
  cheeses: ProductionCheese[];
  totalLiters: number;
  notes?: string;
  createdAt: Date;
}

export interface ProductionCheese {
  cheeseTypeId: string;
  liters: number;
}

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'none';

export interface Activity {
  id: string;
  title: string;
  description?: string;
  date: Date;
  type: 'protocol' | 'recurring' | 'one-time';
  recurrence?: RecurrenceType;
  productionId?: string;
  cheeseTypeId?: string;
  completed: boolean;
  completedDates?: string[];
  createdAt: Date;
}

export interface DailyStats {
  date: Date;
  totalLiters: number;
  productions: number;
  cheeseBreakdown: { cheeseTypeId: string; liters: number }[];
}

export interface MonthlyStats {
  month: number;
  year: number;
  totalLiters: number;
  productions: number;
  cheeseBreakdown: { cheeseTypeId: string; liters: number }[];
}

export type ViewType = 'day' | 'week' | 'month';
