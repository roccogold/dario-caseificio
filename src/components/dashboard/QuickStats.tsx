import { Droplets, Factory, Calendar, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Production } from "@/types";
import { startOfMonth, endOfMonth, isWithinInterval, subMonths } from "date-fns";

interface QuickStatsProps {
  productions: Production[];
}

export function QuickStats({ productions }: QuickStatsProps) {
  const today = new Date();
  const currentMonthStart = startOfMonth(today);
  const currentMonthEnd = endOfMonth(today);
  const lastMonthStart = startOfMonth(subMonths(today, 1));
  const lastMonthEnd = endOfMonth(subMonths(today, 1));

  // Current month stats
  const currentMonthProductions = productions.filter((p) =>
    isWithinInterval(p.date, { start: currentMonthStart, end: currentMonthEnd })
  );
  
  const currentMonthLiters = currentMonthProductions.reduce(
    (sum, p) => sum + p.totalLiters,
    0
  );
  
  const currentMonthCount = currentMonthProductions.length;

  // Last month stats for comparison
  const lastMonthProductions = productions.filter((p) =>
    isWithinInterval(p.date, { start: lastMonthStart, end: lastMonthEnd })
  );
  
  const lastMonthLiters = lastMonthProductions.reduce(
    (sum, p) => sum + p.totalLiters,
    0
  );

  // Calculate trend
  const litersTrend = lastMonthLiters
    ? Math.round(((currentMonthLiters - lastMonthLiters) / lastMonthLiters) * 100)
    : 0;

  // Average per production
  const avgPerProduction = currentMonthCount
    ? Math.round(currentMonthLiters / currentMonthCount)
    : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Litri Questo Mese"
        value={currentMonthLiters}
        suffix=" L"
        icon={<Droplets className="h-6 w-6" />}
        trend={
          litersTrend !== 0
            ? {
                value: Math.abs(litersTrend),
                label: "vs mese scorso",
                positive: litersTrend > 0,
              }
            : undefined
        }
        delay={0}
      />
      <StatCard
        title="Produzioni"
        value={currentMonthCount}
        icon={<Factory className="h-6 w-6" />}
        delay={100}
      />
      <StatCard
        title="Media per Produzione"
        value={avgPerProduction}
        suffix=" L"
        icon={<TrendingUp className="h-6 w-6" />}
        delay={200}
      />
      <StatCard
        title="Giorni di Produzione"
        value={new Set(currentMonthProductions.map((p) => p.date.toDateString())).size}
        icon={<Calendar className="h-6 w-6" />}
        delay={300}
      />
    </div>
  );
}
