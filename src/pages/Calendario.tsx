import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  startOfDay,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  getWeek,
} from "date-fns";
import { it } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Factory,
  CheckCircle2,
  Circle,
  ClipboardList,
} from "lucide-react";
import { useData } from "@/hooks/use-data";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/ui/activity-card";
import { CheeseBadge } from "@/components/ui/cheese-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AddProductionDialog } from "@/components/dialogs/AddProductionDialog";
import { AddActivityDialog } from "@/components/dialogs/AddActivityDialog";
import { EditActivityDialog } from "@/components/dialogs/EditActivityDialog";
import { cn } from "@/lib/utils";
import { ViewType, Activity } from "@/types";

export default function Calendario() {
  const {
    productions,
    activities,
    cheeseTypes,
    getActivitiesForDate,
    getProductionsForDate,
    toggleActivity,
    deleteActivity,
    updateActivity,
    addProduction,
    addActivity,
  } = useData();

  const [isProductionDialogOpen, setIsProductionDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [isEditActivityDialogOpen, setIsEditActivityDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const [view, setView] = useState<ViewType>("day"); // Default to day
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getCheeseType = useCallback((id: string | undefined) => {
    if (!id) return null;
    return cheeseTypes.find((c) => c.id === id) || null;
  }, [cheeseTypes]);

  // Check if a date has activities or productions
  const hasEvents = (date: Date) => {
    return (
      getActivitiesForDate(date).length > 0 ||
      getProductionsForDate(date).length > 0
    );
  };

  const hasPendingActivities = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return getActivitiesForDate(date).some((a) => {
      // Per attività ricorrenti, controlla se è completata per questa data
      if (a.recurrence && a.recurrence !== 'none' && a.type === 'recurring') {
        return !(a.completedDates || []).includes(dateStr);
      }
      return !a.completed;
    });
  };

  // Week view: get days of current week
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { locale: it });
    return eachDayOfInterval({
      start: weekStart,
      end: addDays(weekStart, 6),
    });
  }, [currentDate]);

  // Month view: get calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { locale: it });
    const calendarEnd = endOfWeek(monthEnd, { locale: it });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setView("day");
  };

  const handleViewChange = (newView: ViewType) => {
    setView(newView);
    if (newView === "day") {
      setCurrentDate(selectedDate);
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    if (view === "day") {
      setCurrentDate((d) => (direction === "prev" ? subDays(d, 1) : addDays(d, 1)));
      setSelectedDate((d) => (direction === "prev" ? subDays(d, 1) : addDays(d, 1)));
    } else if (view === "week") {
      setCurrentDate((d) => (direction === "prev" ? subWeeks(d, 1) : addWeeks(d, 1)));
    } else {
      setCurrentDate((d) => (direction === "prev" ? subMonths(d, 1) : addMonths(d, 1)));
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    setView("day");
  };

  // Day View Component
  const DayView = () => {
    const dayActivities = getActivitiesForDate(selectedDate);
    const dayProductions = getProductionsForDate(selectedDate);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="font-serif text-2xl font-semibold text-card-foreground capitalize">
            {format(selectedDate, "EEEE d MMMM yyyy", { locale: it })}
          </h2>
        </div>

        {/* Productions */}
        {dayProductions.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Factory className="h-4 w-4" />
              Produzioni
            </h3>
            <div className="space-y-2">
              {dayProductions.map((prod) => (
                <div
                  key={prod.id}
                  className="rounded-lg border border-border bg-card p-4 shadow-card"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      #{prod.productionNumber}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {prod.totalLiters} Lt
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {prod.cheeses.map((c) => {
                      const type = getCheeseType(c.cheeseTypeId);
                      return type ? (
                        <CheeseBadge
                          key={c.cheeseTypeId}
                          name={type.name}
                          color={type.color}
                          liters={c.liters}
                          size="sm"
                        />
                      ) : null;
                    })}
                  </div>
                  {prod.notes && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Note
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {prod.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activities */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CheckCircle2 className="h-4 w-4" />
            Attività ({dayActivities.length})
          </h3>
          {dayActivities.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="h-8 w-8" />}
              title="Nessuna attività"
              description="Non ci sono attività programmate per questo giorno."
            />
          ) : (
            <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {dayActivities.map((activity) => {
                        // Stable cheeseType lookup - always returns null if not found, never undefined
                        const cheeseType = getCheeseType(activity.cheeseTypeId);
                        return (
                          <ActivityCard
                            key={activity.id}
                            activity={activity}
                            cheeseColor={cheeseType?.color}
                            cheeseTypeName={cheeseType?.name}
                            onToggle={() => toggleActivity(activity.id, selectedDate)}
                            currentDate={selectedDate}
                            onEdit={activity.type !== "protocol" ? () => {
                              setSelectedActivity(activity);
                              setIsEditActivityDialogOpen(true);
                            } : undefined}
                            onDelete={activity.type !== "protocol" ? () => deleteActivity(activity.id) : undefined}
                          />
                        );
                      })}
                    </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Week View Component
  const WeekView = () => {
    return (
      <div className="space-y-4">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const dayActivities = getActivitiesForDate(day);
            const dayProductions = getProductionsForDate(day);

            return (
              <div key={day.toISOString()} className="flex flex-col">
                <div className="mb-2 text-center">
                  <div className="text-xs uppercase text-muted-foreground">
                    {format(day, "EEE", { locale: it })}
                  </div>
                  <div
                    className={cn(
                      "mt-1 flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all mx-auto",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : isToday(day)
                        ? "ring-2 ring-primary/30"
                        : ""
                    )}
                  >
                    {format(day, "d")}
                  </div>
                </div>
                <button
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    "flex-1 space-y-1.5 min-h-[200px] rounded-lg border p-2 text-left transition-all hover:border-primary hover:shadow-md",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/20"
                  )}
                >
                  {dayProductions.length > 0 && (
                    <div className="space-y-1">
                      {dayProductions.map((prod) => (
                        <div
                          key={prod.id}
                          className="rounded border-l-2 border-primary bg-background p-1.5 text-xs"
                        >
                          <div className="font-medium">Lotto #{prod.productionNumber}</div>
                          <div className="text-muted-foreground">
                            {prod.totalLiters}Lt
                          </div>
                          {prod.notes && (
                            <div className="mt-1 text-[10px] text-muted-foreground line-clamp-2">
                              {prod.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {dayActivities.map((activity) => {
                    const cheeseType = getCheeseType(activity.cheeseTypeId);
                    // Per attività ricorrenti, controlla se è completata per questa data
                    const isCompletedForDate = activity.recurrence && activity.recurrence !== 'none' && activity.type === 'recurring'
                      ? (activity.completedDates || []).includes(format(day, 'yyyy-MM-dd'))
                      : activity.completed;
                    
                    // Trova la produzione associata per le attività di protocollo
                    const associatedProduction = activity.type === "protocol" && activity.productionId
                      ? productions.find(p => p.id === activity.productionId)
                      : null;
                    
                    return (
                      <div
                        key={activity.id}
                        className={cn(
                          "rounded border-l-2 bg-background p-1.5 text-xs",
                          isCompletedForDate && "opacity-60",
                          cheeseType
                            ? `border-[${cheeseType.color}]`
                            : "border-muted-foreground"
                        )}
                        style={{
                          borderLeftColor: cheeseType?.color || undefined,
                        }}
                      >
                        <div className="flex items-center gap-1 flex-wrap">
                          {isCompletedForDate ? (
                            <CheckCircle2 className="h-3 w-3 text-success" />
                          ) : (
                            <Circle className="h-3 w-3 text-muted-foreground" />
                          )}
                          {activity.type === "protocol" && associatedProduction && (
                            <span className="rounded-full bg-primary/10 px-1.5 text-[10px] font-medium">
                              #{associatedProduction.productionNumber}
                            </span>
                          )}
                          {activity.type === "protocol" && cheeseType && (
                            <CheeseBadge
                              name={cheeseType.name}
                              color={cheeseType.color}
                              size="sm"
                            />
                          )}
                          <span className="font-medium">{activity.title}</span>
                        </div>
                      </div>
                    );
                  })}
                  {dayProductions.length === 0 && dayActivities.length === 0 && (
                    <div className="text-center text-xs text-muted-foreground/50 py-4">
                      Nessuna attività
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Month View Component
  const MonthView = () => {
    return (
      <div className="space-y-2">
        {/* Days of Week */}
        <div className="grid grid-cols-7 text-center gap-1 sm:gap-2">
          {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((day) => (
            <div
              key={day}
              className="py-1 text-xs font-medium uppercase text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {calendarDays.map((day, index) => {
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const dayActivities = getActivitiesForDate(day);
            const dayProductions = getProductionsForDate(day);
            const dayHasEvents = hasEvents(day);
            const dayHasPending = hasPendingActivities(day);

            return (
              <motion.button
                key={day.toISOString()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "relative min-h-[80px] rounded-lg border p-1.5 text-left transition-all hover:border-primary hover:shadow-sm",
                  !isCurrentMonth && "opacity-40",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card",
                  isToday(day) && !isSelected && "ring-1 ring-primary/30"
                )}
              >
                <span className={cn(
                  "text-xs font-medium",
                  isSelected && "text-primary",
                  !isCurrentMonth && "text-muted-foreground/50"
                )}>
                  {format(day, "d")}
                </span>
                
                {/* Activities and Productions */}
                <div className="mt-1 space-y-0.5">
                  {dayProductions.length > 0 && (
                    <div className="text-[10px] font-medium text-primary">
                      {dayProductions.length} prod.
                    </div>
                  )}
                  {dayActivities.slice(0, 2).map((activity) => {
                    const cheeseType = getCheeseType(activity.cheeseTypeId);
                    // Per attività ricorrenti, controlla se è completata per questa data
                    const isCompletedForDate = activity.recurrence && activity.recurrence !== 'none' && activity.type === 'recurring'
                      ? (activity.completedDates || []).includes(format(day, 'yyyy-MM-dd'))
                      : activity.completed;
                    
                    // Trova la produzione associata per le attività di protocollo
                    const associatedProduction = activity.type === "protocol" && activity.productionId
                      ? productions.find(p => p.id === activity.productionId)
                      : null;
                    
                    return (
                      <div
                        key={activity.id}
                        className={cn(
                          "text-[10px] flex items-center gap-1 flex-wrap",
                          isCompletedForDate && "opacity-60",
                          !isCurrentMonth && "text-muted-foreground/50"
                        )}
                      >
                        {activity.type === "protocol" && cheeseType ? (
                          <>
                            {associatedProduction && (
                              <span className="rounded-full bg-primary/10 px-1 text-[8px] font-medium flex-shrink-0">
                                #{associatedProduction.productionNumber}
                              </span>
                            )}
                            <CheeseBadge
                              name={cheeseType.name}
                              color={cheeseType.color}
                              size="sm"
                              className="text-[9px] px-1.5 py-0"
                            />
                            <span className={cn(
                              "truncate",
                              isCompletedForDate && "line-through"
                            )}>{activity.title}</span>
                          </>
                        ) : (
                          <>
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full flex-shrink-0",
                                isCompletedForDate ? "bg-success" : cheeseType ? "" : "bg-muted-foreground"
                              )}
                              style={{
                                backgroundColor: !isCompletedForDate && cheeseType ? cheeseType.color : undefined,
                              }}
                            />
                            <span className={cn(
                              "truncate",
                              isCompletedForDate && "line-through"
                            )}>{activity.title}</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                  {dayActivities.length > 2 && (
                    <div className="text-[10px] text-muted-foreground">
                      +{dayActivities.length - 2} altre
                    </div>
                  )}
                  {!dayHasEvents && (
                    <div className="text-[10px] text-muted-foreground/50 italic">
                      Nessuna attività
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

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
              Calendario
            </h1>
            <p className="mt-1 text-muted-foreground">
              Gestisci produzioni e attività
            </p>
          </div>
        </motion.div>

        {/* Dialogs */}
        <AddProductionDialog
          open={isProductionDialogOpen}
          onOpenChange={setIsProductionDialogOpen}
          onAdd={addProduction}
          cheeseTypes={cheeseTypes}
          selectedDate={selectedDate}
          existingProductions={productions.map(p => ({ id: p.id, productionNumber: p.productionNumber }))}
        />
        <AddActivityDialog
          open={isActivityDialogOpen}
          onOpenChange={setIsActivityDialogOpen}
          onAdd={addActivity}
          selectedDate={selectedDate}
        />
        <EditActivityDialog
          open={isEditActivityDialogOpen}
          onOpenChange={setIsEditActivityDialogOpen}
          activity={selectedActivity}
          onUpdate={(id, updates) => {
            updateActivity(id, updates);
            setIsEditActivityDialogOpen(false);
          }}
        />

        {/* Main Calendar Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6 shadow-card"
          >
          {/* Navigation Bar */}
          <div className="mb-6 space-y-3">
            {/* Top Row: Date Navigation and Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Date Navigation */}
              <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                <Button variant="outline" size="sm" onClick={goToToday} className="flex-shrink-0 h-9 sm:h-8">
                  Oggi
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateDate("prev")}
                  className="flex-shrink-0 h-9 w-9 sm:h-8 sm:w-8"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <h2 className="font-serif text-xs sm:text-sm md:text-base font-semibold text-card-foreground capitalize truncate min-w-0">
                  {view === "day" && format(selectedDate, "EEEE d MMMM yyyy", { locale: it })}
                  {view === "week" && `Settimana ${getWeek(currentDate, { locale: it })} - ${format(currentDate, "MMMM yyyy", { locale: it })}`}
                  {view === "month" && format(currentDate, "MMMM yyyy", { locale: it })}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateDate("next")}
                  className="flex-shrink-0 h-9 w-9 sm:h-8 sm:w-8"
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>

              {/* Action Buttons - Mobile: icon only, Desktop: with text */}
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsProductionDialogOpen(true)}
                  className="h-9 w-9 sm:h-8 sm:w-8 sm:px-3 sm:w-auto"
                  title="Nuova Produzione"
                >
                  <Factory className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Nuova Produzione</span>
                </Button>
                <Button
                  size="icon"
                  onClick={() => setIsActivityDialogOpen(true)}
                  className="h-9 w-9 sm:h-8 sm:w-8 sm:px-3 sm:w-auto"
                  title="Aggiungi Attività"
                >
                  <ClipboardList className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Aggiungi Attività</span>
                </Button>
              </div>
            </div>

            {/* Bottom Row: View Selector */}
            <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1">
              <Button
                variant={view === "day" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewChange("day")}
                className="flex-1 h-9 sm:h-8 text-xs sm:text-sm"
              >
                Giorno
              </Button>
              <Button
                variant={view === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewChange("week")}
                className="flex-1 h-9 sm:h-8 text-xs sm:text-sm"
              >
                Settimana
              </Button>
              <Button
                variant={view === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewChange("month")}
                className="flex-1 h-9 sm:h-8 text-xs sm:text-sm"
              >
                Mese
              </Button>
            </div>
          </div>

          {/* View Content */}
          <AnimatePresence mode="wait">
            {view === "day" && (
              <motion.div
                key="day"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <DayView />
              </motion.div>
            )}
            {view === "week" && (
              <motion.div
                key="week"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <WeekView />
              </motion.div>
            )}
            {view === "month" && (
              <motion.div
                key="month"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <MonthView />
              </motion.div>
            )}
          </AnimatePresence>
          </motion.div>
      </div>
    </AppLayout>
  );
}
