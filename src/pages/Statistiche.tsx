import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  Droplets,
  Factory,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Milk,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useData } from "@/hooks/use-data";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { CheeseBadge } from "@/components/ui/cheese-badge";
import { cn } from "@/lib/utils";

const MONTHS_IT = [
  "Gen",
  "Feb",
  "Mar",
  "Apr",
  "Mag",
  "Giu",
  "Lug",
  "Ago",
  "Set",
  "Ott",
  "Nov",
  "Dic",
];

// Custom Tooltip Component for Bar Chart
const CustomTooltip = ({ active, payload, cheeseTypes }: any) => {
  if (!active || !payload || !payload.length) return null;

  // Filtra solo i valori > 0
  const validPayload = payload.filter((entry: any) => entry.value > 0);
  if (validPayload.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "12px",
      }}
    >
      {validPayload.map((entry: any, index: number) => {
        const cheese = cheeseTypes.find((c: any) => c.name === entry.dataKey);
        if (!cheese || entry.value === 0) return null;
        
        return (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: index < validPayload.length - 1 ? "4px" : "0" }}>
            <CheeseBadge
              name={cheese.name}
              color={cheese.color}
              size="sm"
              className="text-xs"
            />
            <span style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }}>
              {entry.value} L
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Custom Tooltip Component for Area Chart (Annual View)
const CustomAreaTooltip = ({ active, payload, label, cheeseTypes }: any) => {
  if (!active || !payload || !payload.length) return null;

  // Filtra solo i valori > 0 (escludi "total" se è 0)
  const validPayload = payload.filter((entry: any) => {
    if (entry.dataKey === "total") {
      return entry.value > 0;
    }
    return entry.value > 0;
  });
  
  if (validPayload.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "12px",
      }}
    >
      {label && (
        <div style={{ fontWeight: 500, marginBottom: "6px", color: "hsl(var(--foreground))" }}>
          {label}
        </div>
      )}
      {validPayload.map((entry: any, index: number) => {
        if (entry.dataKey === "total") {
          return (
            <div key={`total-${index}`} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: index < validPayload.length - 1 ? "4px" : "0" }}>
              <span
                style={{
                  height: "10px",
                  width: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#F5E6D3",
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }}>
                Totale: <span style={{ color: "hsl(var(--foreground))", fontWeight: 500 }}>{entry.value} L</span>
              </span>
            </div>
          );
        }
        
        const cheese = cheeseTypes.find((c: any) => c.name === entry.dataKey);
        if (!cheese || entry.value === 0) return null;
        
        return (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: index < validPayload.length - 1 ? "4px" : "0" }}>
            <CheeseBadge
              name={cheese.name}
              color={cheese.color}
              size="sm"
              className="text-xs"
            />
            <span style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }}>
              {entry.value} L
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function Statistiche() {
  const { productions, cheeseTypes, getMonthlyStats } = useData();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCheeseId, setSelectedCheeseId] = useState<string | null>(null);
  const [viewType, setViewType] = useState<"annual" | "monthly">("annual");

  const monthlyStats = useMemo(() => {
    const stats = getMonthlyStats(selectedYear);
    
    // Filtra per formaggio se selezionato
    if (selectedCheeseId) {
      return stats.map(stat => ({
        ...stat,
        cheeseBreakdown: stat.cheeseBreakdown.filter(
          c => c.cheeseTypeId === selectedCheeseId
        ),
        totalLiters: stat.cheeseBreakdown
          .filter(c => c.cheeseTypeId === selectedCheeseId)
          .reduce((sum, c) => sum + c.liters, 0),
      }));
    }
    
    return stats;
  }, [selectedYear, productions, selectedCheeseId, getMonthlyStats]);

  // Calculate yearly totals - filtered by cheese if selected
  const yearlyTotals = useMemo(() => {
    const totalLiters = monthlyStats.reduce((sum, m) => sum + m.totalLiters, 0);
    
    // Count productions - if filtering by cheese, count only productions that include that cheese
    let totalProductions = 0;
    if (selectedCheeseId) {
      // Count unique productions that contain the selected cheese in the selected year
      const productionIds = new Set<string>();
      productions.forEach(p => {
        const prodDate = new Date(p.date);
        if (prodDate.getFullYear() === selectedYear &&
            p.cheeses.some(c => c.cheeseTypeId === selectedCheeseId)) {
          productionIds.add(p.id);
        }
      });
      totalProductions = productionIds.size;
    } else {
      // Count all productions for the year
      totalProductions = monthlyStats.reduce(
        (sum, m) => sum + m.productions,
        0
      );
    }
    
    const avgPerMonth = totalLiters / 12;
    const bestMonth = monthlyStats.reduce(
      (best, m) => (m.totalLiters > best.totalLiters ? m : best),
      monthlyStats[0]
    );

    return { totalLiters, totalProductions, avgPerMonth, bestMonth };
  }, [monthlyStats, selectedCheeseId, productions, selectedYear]);

  // Prepare chart data - filtered by cheese if selected
  const chartData = useMemo(() => {
    const cheesesToShow = selectedCheeseId 
      ? cheeseTypes.filter(c => c.id === selectedCheeseId)
      : cheeseTypes;
    
    return monthlyStats.map((stat) => {
      const data: Record<string, number | string> = {
        month: MONTHS_IT[stat.month],
      };
      
      // Add total liters for the month
      data.total = stat.totalLiters;
      
      // Add individual cheese data
      cheesesToShow.forEach((cheese) => {
        const cheeseData = stat.cheeseBreakdown.find(
          (c) => c.cheeseTypeId === cheese.id
        );
        data[cheese.name] = cheeseData?.liters || 0;
      });
      return data;
    });
  }, [monthlyStats, cheeseTypes, selectedCheeseId]);


  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="font-serif text-3xl font-semibold text-foreground">
              Statistiche
            </h1>
            <p className="mt-1 text-muted-foreground">
              Analisi della produzione
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Year Selector */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setSelectedYear((y) => y - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[4rem] text-center font-serif font-semibold">
                {selectedYear}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setSelectedYear((y) => y + 1)}
                disabled={selectedYear >= new Date().getFullYear()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Cheese Filter */}
            <Select
              value={selectedCheeseId || "all"}
              onValueChange={(value) =>
                setSelectedCheeseId(value === "all" ? null : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Milk className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Tutti i formaggi" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i formaggi</SelectItem>
                {cheeseTypes.map((cheese) => (
                  <SelectItem key={cheese.id} value={cheese.id}>
                    {cheese.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Monthly/Annual Toggle */}
            <ToggleGroup
              type="single"
              value={viewType}
              onValueChange={(value) => {
                if (value) setViewType(value as "annual" | "monthly");
              }}
              className="border border-border rounded-lg bg-muted/30 p-1 gap-0"
            >
              <ToggleGroupItem
                value="annual"
                aria-label="Annual view"
                className={cn(
                  "px-4 py-2 font-serif rounded-md transition-all",
                  viewType === "annual"
                    ? "bg-background text-foreground shadow-sm"
                    : "bg-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                Annuale
              </ToggleGroupItem>
              <ToggleGroupItem
                value="monthly"
                aria-label="Monthly view"
                className={cn(
                  "px-4 py-2 font-serif rounded-md transition-all",
                  viewType === "monthly"
                    ? "bg-background text-foreground shadow-sm"
                    : "bg-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                Mensile
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Litri Totali"
            value={yearlyTotals.totalLiters}
            suffix=" L"
            icon={<Droplets className="h-6 w-6" />}
            delay={0}
          />
          <StatCard
            title="Produzioni"
            value={yearlyTotals.totalProductions}
            icon={<Factory className="h-6 w-6" />}
            delay={100}
          />
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-card p-6 shadow-card"
        >
            <h2 className="mb-6 font-serif text-xl font-semibold text-card-foreground">
              {viewType === "annual" ? "Andamento Produzione" : `Produzione Mensile (${selectedYear})`}
            </h2>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                {viewType === "annual" ? (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F5E6D3" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#F5E6D3" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickFormatter={(value) => `${value}L`}
                    />
                    <Tooltip
                      content={<CustomAreaTooltip cheeseTypes={cheeseTypes} />}
                    />
                    {selectedCheeseId ? (
                      <>
                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="#F5E6D3"
                          fillOpacity={1}
                          fill="url(#colorTotal)"
                        />
                        {cheeseTypes
                          .filter(c => c.id === selectedCheeseId)
                          .map((cheese) => (
                            <Line
                              key={cheese.id}
                              type="monotone"
                              dataKey={cheese.name}
                              stroke={cheese.color}
                              strokeWidth={2}
                              dot={{ fill: cheese.color, r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          ))}
                      </>
                    ) : (
                      <>
                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="#F5E6D3"
                          fillOpacity={1}
                          fill="url(#colorTotal)"
                        />
                        {cheeseTypes.slice(0, 3).map((cheese) => (
                          <Line
                            key={cheese.id}
                            type="monotone"
                            dataKey={cheese.name}
                            stroke={cheese.color}
                            strokeWidth={2}
                            dot={{ fill: cheese.color, r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                      </>
                    )}
                  </AreaChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickFormatter={(value) => `${value}L`}
                    />
                    <Tooltip
                      content={<CustomTooltip cheeseTypes={cheeseTypes} />}
                    />
                    {selectedCheeseId ? (
                      cheeseTypes
                        .filter(c => c.id === selectedCheeseId)
                        .map((cheese) => (
                          <Bar
                            key={cheese.id}
                            dataKey={cheese.name}
                            fill={cheese.color}
                            radius={[8, 8, 0, 0]}
                          />
                        ))
                    ) : (
                      cheeseTypes.slice(0, 5).map((cheese, index, array) => (
                        <Bar
                          key={cheese.id}
                          dataKey={cheese.name}
                          stackId="a"
                          fill={cheese.color}
                          radius={index === array.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]}
                        />
                      ))
                    )}
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </motion.div>
      </div>
    </AppLayout>
  );
}
