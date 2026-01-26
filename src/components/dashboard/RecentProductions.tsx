import { motion } from "framer-motion";
import { ArrowRight, Factory, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Production, CheeseType } from "@/types";
import { CheeseBadge } from "@/components/ui/cheese-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

interface RecentProductionsProps {
  productions: Production[];
  cheeseTypes: CheeseType[];
}

export function RecentProductions({
  productions,
  cheeseTypes,
}: RecentProductionsProps) {
  // Get last 5 productions sorted by date
  const recentProductions = [...productions]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  const getCheeseType = (id: string) => cheeseTypes.find((c) => c.id === id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="rounded-xl border border-border bg-card shadow-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-6">
        <div>
          <h2 className="font-serif text-xl font-semibold text-card-foreground">
            Produzioni Recenti
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ultime {recentProductions.length} produzioni registrate
          </p>
        </div>
        <Link to="/produzioni">
          <Button variant="ghost" size="sm" className="gap-1">
            Vedi tutto
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Productions List */}
      <div className="p-6">
        {recentProductions.length === 0 ? (
          <EmptyState
            icon={<Factory className="h-8 w-8" />}
            title="Nessuna produzione"
            description="Non hai ancora registrato nessuna produzione. Inizia a tracciare la tua produzione casearia."
            action={
              <Link to="/calendario">
                <Button>Nuova Produzione</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {recentProductions.map((production, index) => (
              <motion.div
                key={production.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-all hover:border-primary/30 hover:shadow-card"
              >
                <div className="flex items-center gap-4">
                  {/* Date */}
                  <div className="text-center">
                    <div className="font-numbers text-2xl font-semibold text-foreground">
                      {format(production.date, "dd")}
                    </div>
                    <div className="text-xs uppercase text-muted-foreground">
                      {format(production.date, "MMM", { locale: it })}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="border-l border-border pl-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{production.productionNumber}
                      </span>
                      {production.notes && (
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {production.cheeses.map((cheese) => {
                        const type = getCheeseType(cheese.cheeseTypeId);
                        return type ? (
                          <CheeseBadge
                            key={cheese.cheeseTypeId}
                            name={type.name}
                            color={type.color}
                            liters={cheese.liters}
                            size="sm"
                          />
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="text-right">
                  <div className="font-numbers text-lg font-semibold text-foreground">
                    {production.totalLiters.toLocaleString("it-IT")} L
                  </div>
                  <div className="text-xs text-muted-foreground">totale</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
