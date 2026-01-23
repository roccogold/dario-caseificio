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
} from "lucide-react";
import {
  BarChart,
  Bar,
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

export default function Statistiche() {
  const { productions, cheeseTypes, getMonthlyStats } = useData();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthlyStats = useMemo(
    () => getMonthlyStats(selectedYear),
    [selectedYear, productions]
  );

  // Calculate yearly totals
  const yearlyTotals = useMemo(() => {
    const totalLiters = monthlyStats.reduce((sum, m) => sum + m.totalLiters, 0);
    const totalProductions = monthlyStats.reduce(
      (sum, m) => sum + m.productions,
      0
    );
    const avgPerMonth = totalLiters / 12;
    const bestMonth = monthlyStats.reduce(
      (best, m) => (m.totalLiters > best.totalLiters ? m : best),
      monthlyStats[0]
    );

    return { totalLiters, totalProductions, avgPerMonth, bestMonth };
  }, [monthlyStats]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return monthlyStats.map((stat) => {
      const data: Record<string, number | string> = {
        month: MONTHS_IT[stat.month],
      };
      cheeseTypes.forEach((cheese) => {
        const cheeseData = stat.cheeseBreakdown.find(
          (c) => c.cheeseTypeId === cheese.id
        );
        data[cheese.name] = cheeseData?.liters || 0;
      });
      return data;
    });
  }, [monthlyStats, cheeseTypes]);

  // Cheese ranking for the year
  const cheeseRanking = useMemo(() => {
    return cheeseTypes
      .map((cheese) => {
        const totalLiters = monthlyStats.reduce((sum, month) => {
          const cheeseData = month.cheeseBreakdown.find(
            (c) => c.cheeseTypeId === cheese.id
          );
          return sum + (cheeseData?.liters || 0);
        }, 0);
        return { cheese, totalLiters };
      })
      .filter((c) => c.totalLiters > 0)
      .sort((a, b) => b.totalLiters - a.totalLiters);
  }, [monthlyStats, cheeseTypes]);

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

          {/* Year Selector */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
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
              className="h-8 w-8"
              onClick={() => setSelectedYear((y) => y + 1)}
              disabled={selectedYear >= new Date().getFullYear()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <StatCard
            title="Media Mensile"
            value={Math.round(yearlyTotals.avgPerMonth)}
            suffix=" L"
            icon={<TrendingUp className="h-6 w-6" />}
            delay={200}
          />
          <StatCard
            title="Mese Migliore"
            value={yearlyTotals.bestMonth?.totalLiters || 0}
            suffix=" L"
            icon={<Calendar className="h-6 w-6" />}
            delay={300}
          />
        </div>

        {/* Chart and Ranking */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-card"
          >
            <h2 className="mb-6 font-serif text-xl font-semibold text-card-foreground">
              Produzione Mensile
            </h2>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
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
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  {cheeseTypes.slice(0, 5).map((cheese) => (
                    <Bar
                      key={cheese.id}
                      dataKey={cheese.name}
                      stackId="a"
                      fill={cheese.color}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Cheese Ranking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border border-border bg-card p-6 shadow-card"
          >
            <h2 className="mb-6 font-serif text-xl font-semibold text-card-foreground">
              Classifica Formaggi
            </h2>
            <div className="space-y-4">
              {cheeseRanking.map((item, index) => (
                <div
                  key={item.cheese.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                        index === 0
                          ? "bg-warning/20 text-warning"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <CheeseBadge
                      name={item.cheese.name}
                      color={item.cheese.color}
                      size="sm"
                    />
                  </div>
                  <span className="font-medium text-foreground">
                    {item.totalLiters.toLocaleString("it-IT")} L
                  </span>
                </div>
              ))}
              {cheeseRanking.length === 0 && (
                <p className="text-sm italic text-muted-foreground">
                  Nessun dato disponibile per quest'anno
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
