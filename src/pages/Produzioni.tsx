import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isSameDay, isSameYear, isWithinInterval, startOfYear, endOfYear, parse } from "date-fns";
import { it } from "date-fns/locale";
import {
  Search,
  Filter,
  Factory,
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  ChevronDown,
  Calendar,
} from "lucide-react";
import { useData } from "@/hooks/use-data";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheeseBadge } from "@/components/ui/cheese-badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EditProductionDialog } from "@/components/dialogs/EditProductionDialog";
import { Production } from "@/types";

type DateFilterType = "all" | "date-range" | "year" | "specific-day";

export default function Produzioni() {
  const { productions, cheeseTypes, updateProduction, deleteProduction } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCheese, setFilterCheese] = useState<string>("all");
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<string>("");
  const [specificDay, setSpecificDay] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState<Production | null>(null);

  const getCheeseType = (id: string) => cheeseTypes.find((c) => c.id === id);

  // Helper function to check if date is valid
  const isValidDate = (date: any): date is Date => {
    return date instanceof Date && !isNaN(date.getTime());
  };

  // Filter and sort productions
  const filteredProductions = useMemo(() => {
    return productions
      .filter((prod) => {
        // Skip invalid dates
        if (!isValidDate(prod.date)) {
          return false;
        }
        // Search filter
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          const matchesNumber = prod.productionNumber
            .toLowerCase()
            .includes(searchLower);
          const matchesNote = prod.notes?.toLowerCase().includes(searchLower);
          const matchesCheese = prod.cheeses.some((c) => {
            const type = getCheeseType(c.cheeseTypeId);
            return type?.name.toLowerCase().includes(searchLower);
          });
          if (!matchesNumber && !matchesNote && !matchesCheese) return false;
        }

        // Cheese filter
        if (filterCheese !== "all") {
          if (!prod.cheeses.some((c) => c.cheeseTypeId === filterCheese))
            return false;
        }

        // Date filter
        if (dateFilterType === "date-range") {
          if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isValidDate(start) && isValidDate(end) && isValidDate(prod.date)) {
              if (!isWithinInterval(prod.date, { start, end })) return false;
            }
          } else if (startDate) {
            const start = new Date(startDate);
            if (isValidDate(start) && isValidDate(prod.date)) {
              if (prod.date < start) return false;
            }
          } else if (endDate) {
            const end = new Date(endDate);
            if (isValidDate(end) && isValidDate(prod.date)) {
              if (prod.date > end) return false;
            }
          }
        } else if (dateFilterType === "year") {
          if (yearFilter) {
            const year = parseInt(yearFilter);
            if (!isNaN(year) && isValidDate(prod.date)) {
              if (!isSameYear(prod.date, new Date(year, 0, 1))) return false;
            }
          }
        } else if (dateFilterType === "specific-day") {
          if (specificDay) {
            const day = new Date(specificDay);
            if (isValidDate(day) && isValidDate(prod.date)) {
              if (!isSameDay(prod.date, day)) return false;
            }
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Safe date comparison - handle invalid dates
        const aTime = isValidDate(a.date) ? a.date.getTime() : 0;
        const bTime = isValidDate(b.date) ? b.date.getTime() : 0;
        return bTime - aTime;
      });
  }, [productions, searchQuery, filterCheese, dateFilterType, startDate, endDate, yearFilter, specificDay, cheeseTypes]);

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
              Storico Produzioni
            </h1>
            <p className="mt-1 text-muted-foreground">
              {productions.length} produzioni totali
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-3 sm:flex-row sm:items-center md:flex-wrap"
        >
          <div className="relative sm:w-64 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cerca per numero, formaggio, note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCheese} onValueChange={setFilterCheese}>
            <SelectTrigger className="w-full sm:w-48 md:w-56 flex-shrink-0">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Tutti i formaggi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i formaggi</SelectItem>
              {cheeseTypes.map((cheese) => (
                <SelectItem key={cheese.id} value={cheese.id}>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: cheese.color }}
                    />
                    {cheese.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateFilterType} onValueChange={(value) => {
            setDateFilterType(value as DateFilterType);
            // Reset date fields when changing filter type
            setStartDate("");
            setEndDate("");
            setYearFilter("");
            setSpecificDay("");
          }}>
            <SelectTrigger className="w-full sm:w-48 md:w-56 flex-shrink-0">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtra per data" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le produzioni</SelectItem>
              <SelectItem value="date-range">Da data a data</SelectItem>
              <SelectItem value="year">Per anno</SelectItem>
              <SelectItem value="specific-day">Giorno specifico</SelectItem>
            </SelectContent>
          </Select>

          {/* Date filter inputs - on same line */}
          {dateFilterType === "date-range" && (
            <>
              <Input
                type="date"
                placeholder="Data inizio"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-auto sm:flex-shrink-0"
              />
              <Input
                type="date"
                placeholder="Data fine"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:w-auto sm:flex-shrink-0"
              />
            </>
          )}

          {dateFilterType === "year" && (
            <Input
              type="number"
              placeholder="Anno (es. 2024)"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              min="2000"
              max="2100"
              className="w-full sm:w-32 flex-shrink-0"
            />
          )}

          {dateFilterType === "specific-day" && (
            <Input
              type="date"
              placeholder="Giorno specifico"
              value={specificDay}
              onChange={(e) => setSpecificDay(e.target.value)}
              className="w-full sm:w-auto sm:flex-shrink-0"
            />
          )}
        </motion.div>

        {/* Edit Production Dialog */}
        <EditProductionDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          production={selectedProduction}
          existingProductions={productions.map(p => ({ id: p.id, productionNumber: p.productionNumber }))}
          onUpdate={(id, updates) => {
            updateProduction(id, updates);
            setIsEditDialogOpen(false);
          }}
          cheeseTypes={cheeseTypes}
        />

        {/* Productions List */}
        {filteredProductions.length === 0 ? (
          <EmptyState
            icon={<Factory className="h-8 w-8" />}
            title={searchQuery || filterCheese !== "all" ? "Nessun risultato" : "Nessuna produzione"}
            description={
              searchQuery || filterCheese !== "all"
                ? "Prova a modificare i filtri di ricerca."
                : "Non hai ancora registrato nessuna produzione."
            }
          />
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredProductions.map((production, index) => (
                <motion.div
                  key={production.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.03 }}
                  className="overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all hover:shadow-card-hover"
                >
                  {/* Main Row */}
                  <div
                    className="flex cursor-pointer items-center justify-between p-4"
                    onClick={() =>
                      setExpandedId(
                        expandedId === production.id ? null : production.id
                      )
                    }
                  >
                    <div className="flex items-center gap-4">
                      {/* Date */}
                      <div className="text-center">
                        {isValidDate(production.date) ? (
                          <>
                            <div className="font-serif text-2xl font-semibold text-foreground">
                              {format(production.date, "dd")}
                            </div>
                            <div className="text-xs uppercase text-muted-foreground">
                              {format(production.date, "MMM yy", { locale: it })}
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Data non valida
                          </div>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="h-12 w-px bg-border" />

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-foreground">
                            Lotto #{production.productionNumber}
                          </span>
                          {production.notes && (
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        {/* Cheese list with liters */}
                        <div className="flex flex-wrap items-center gap-2">
                          {production.cheeses.map((cheese, idx) => {
                            const type = getCheeseType(cheese.cheeseTypeId);
                            if (!type) return null;
                            return (
                              <div key={cheese.cheeseTypeId} className="flex items-center gap-1.5">
                                <span
                                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                                  style={{ 
                                    backgroundColor: type.color,
                                    color: '#000'
                                  }}
                                >
                                  {type.name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {cheese.liters}L
                                </span>
                                {idx < production.cheeses.length - 1 && (
                                  <span className="text-muted-foreground/50">•</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-serif text-xl font-semibold text-foreground">
                          {production.totalLiters.toLocaleString("it-IT")} L
                        </div>
                        <div className="text-xs text-muted-foreground">
                          totale
                        </div>
                      </div>

                      <ChevronDown
                        className={cn(
                          "h-5 w-5 text-muted-foreground transition-transform",
                          expandedId === production.id && "rotate-180"
                        )}
                      />

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduction(production);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Modifica
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProduction(production.id);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Elimina
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedId === production.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-border bg-muted/30"
                      >
                        <div className="p-4">
                          {production.notes ? (
                            <div>
                              <p className="text-xs font-medium uppercase text-muted-foreground">
                                Note
                              </p>
                              <p className="mt-1 text-sm text-foreground">
                                {production.notes}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm italic text-muted-foreground">
                              Nessuna nota per questa produzione
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
