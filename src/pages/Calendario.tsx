import { useState, useMemo } from "react";
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

  const getCheeseType = (id: string) => cheeseTypes.find((c) => c.id === id);

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
                      {prod.totalLiters} L
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
                      {dayActivities.map((activity) => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          cheeseColor={getCheeseType(activity.cheeseTypeId)?.color}
                          onToggle={() => toggleActivity(activity.id, selectedDate)}
                          currentDate={selectedDate}
                          onEdit={() => {
                            setSelectedActivity(activity);
                            setIsEditActivityDialogOpen(true);
                          }}
                          onDelete={() => deleteActivity(activity.id)}
                        />
                      ))}
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
        <div className="grid grid-cols-7 gap-2">
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
                          <div className="font-medium">#{prod.productionNumber}</div>
                          <div className="text-muted-foreground">
                            {prod.totalLiters}L
                          </div>
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
                        <div className="flex items-center gap-1">
                          {isCompletedForDate ? (
                            <CheckCircle2 className="h-3 w-3 text-success" />
                          ) : (
                            <Circle className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className="font-medium">{activity.title}</span>
                          {activity.type === "protocol" && (
                            <span className="ml-1 rounded-full bg-primary/10 px-1 text-[10px]">
                              P
                            </span>
                          )}
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
        <div className="grid grid-cols-7 text-center">
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
        <div className="grid grid-cols-7 gap-1">
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
                    return (
                      <div
                        key={activity.id}
                        className={cn(
                          "text-[10px] truncate flex items-center gap-1",
                          isCompletedForDate && "opacity-60 line-through",
                          !isCurrentMonth && "text-muted-foreground/50"
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full flex-shrink-0",
                            isCompletedForDate ? "bg-success" : cheeseType ? "" : "bg-muted-foreground"
                          )}
                          style={{
                            backgroundColor: !isCompletedForDate && cheeseType ? cheeseType.color : undefined,
                          }}
                        />
                        <span className="truncate">{activity.title}</span>
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
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Oggi
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateDate("prev")}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="font-serif text-lg font-semibold text-card-foreground capitalize min-w-[200px] text-center">
                {view === "day" && format(selectedDate, "EEEE d MMMM yyyy", { locale: it })}
                {view === "week" && `Settimana ${getWeek(currentDate, { locale: it })} - ${format(currentDate, "MMMM yyyy", { locale: it })}`}
                {view === "month" && format(currentDate, "MMMM yyyy", { locale: it })}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateDate("next")}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* View Selector */}
            <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1">
              <Button
                variant={view === "day" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewChange("day")}
                className="flex-1"
              >
                Giorno
              </Button>
              <Button
                variant={view === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewChange("week")}
                className="flex-1"
              >
                Settimana
              </Button>
              <Button
                variant={view === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewChange("month")}
                className="flex-1"
              >
                Mese
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsProductionDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuova Produzione
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsActivityDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Aggiungi Attività
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
