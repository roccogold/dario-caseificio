import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Production, CheeseType } from "@/types";
import { CheeseBadge } from "@/components/ui/cheese-badge";

interface CheeseRankingProps {
  productions: Production[];
  cheeseTypes: CheeseType[];
}

export function CheeseRanking({ productions, cheeseTypes }: CheeseRankingProps) {
  // Calculate total liters per cheese type
  const cheeseStats = cheeseTypes
    .map((cheese) => {
      const totalLiters = productions.reduce((sum, prod) => {
        const cheeseProd = prod.cheeses.find(
          (c) => c.cheeseTypeId === cheese.id
        );
        return sum + (cheeseProd?.liters || 0);
      }, 0);
      return { cheese, totalLiters };
    })
    .filter((stat) => stat.totalLiters > 0)
    .sort((a, b) => b.totalLiters - a.totalLiters)
    .slice(0, 5);

  const maxLiters = cheeseStats[0]?.totalLiters || 1;

  if (cheeseStats.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="rounded-xl border border-border bg-card shadow-card"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border p-6">
        <Trophy className="h-5 w-5 text-warning" />
        <div>
          <h2 className="font-serif text-xl font-semibold text-card-foreground">
            Top Formaggi
          </h2>
          <p className="text-sm text-muted-foreground">Per litri lavorati</p>
        </div>
      </div>

      {/* Ranking */}
      <div className="p-6">
        <div className="space-y-4">
          {cheeseStats.map((stat, index) => (
            <motion.div
              key={stat.cheese.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-center gap-4"
            >
              {/* Rank */}
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-serif text-sm font-semibold ${
                  index === 0
                    ? "bg-warning/20 text-warning"
                    : index === 1
                    ? "bg-muted text-muted-foreground"
                    : index === 2
                    ? "bg-accent/20 text-accent"
                    : "bg-muted/50 text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>

              {/* Bar and Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <CheeseBadge
                    name={stat.cheese.name}
                    color={stat.cheese.color}
                    size="sm"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {stat.totalLiters.toLocaleString("it-IT")} L
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stat.totalLiters / maxLiters) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: stat.cheese.color }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
