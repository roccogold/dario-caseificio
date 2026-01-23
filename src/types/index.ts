export interface CheeseType {
  id: string;
  name: string;
  color: string;
  yieldPerLiter: number; // kg per liter
  pricePerKg: number;
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
