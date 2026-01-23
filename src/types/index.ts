export interface CustomField {
  key: string; // Nome del campo (es. "Fermenti")
  value: string; // Valore del campo (testo libero)
}

export interface DefaultFields {
  temperaturaCoagulazione?: string; // Temperatura Coagulazione
  nomeFermento?: string; // Nome Fermento
  quantitaFermento?: string; // Quantità Fermento (unità)
  muffe?: string; // Muffe
  quantitaMuffe?: string; // Quantità Muffe (unità)
  caglio?: string; // Caglio
  quantitaCaglio?: string; // Quantità Caglio (cc)
}

export interface CheeseType {
  id: string;
  name: string;
  color: string;
  yieldPercentage?: number; // % resa (es. 20% = 20kg da 100L) - optional
  prices?: {
    price1: number; // €/kg
    price2: number; // €/kg
    price3: number; // €/kg
    salesPercentage1: number; // % di vendita per prezzo 1
    salesPercentage2: number; // % di vendita per prezzo 2
    salesPercentage3: number; // % di vendita per prezzo 3
  };
  defaultFields?: DefaultFields; // Campi predefiniti
  customFields?: CustomField[]; // Campi personalizzati dinamici
  protocol: ProtocolStep[];
  createdAt: Date;
  // Legacy fields for backward compatibility
  yieldPerLiter?: number; // deprecated - use yieldPercentage
  pricePerKg?: number; // deprecated - use prices.price1
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

export interface Activity {
  id: string;
  title: string;
  description?: string;
  date: Date;
  type: 'protocol' | 'recurring' | 'one-time';
  recurrence?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'none';
  productionId?: string;
  cheeseTypeId?: string;
  completed: boolean; // Per attività one-time e protocol
  completedDates?: string[]; // Per attività ricorrenti: array di date in formato 'yyyy-MM-dd'
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
