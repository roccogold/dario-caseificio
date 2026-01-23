import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Activity, CheeseType } from "@/types";
import { ActivityCard } from "@/components/ui/activity-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

interface TodayActivitiesProps {
  activities: Activity[];
  cheeseTypes: CheeseType[];
  onToggleActivity: (id: string) => void;
  onDeleteActivity?: (id: string) => void;
}

export function TodayActivities({
  activities,
  cheeseTypes,
  onToggleActivity,
  onDeleteActivity,
}: TodayActivitiesProps) {
  const pendingCount = activities.filter((a) => !a.completed).length;
  const completedCount = activities.filter((a) => a.completed).length;

  const getCheeseColor = (cheeseId?: string) => {
    if (!cheeseId) return undefined;
    return cheeseTypes.find((c) => c.id === cheeseId)?.color;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="rounded-xl border border-border bg-card shadow-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-6">
        <div>
          <h2 className="font-serif text-xl font-semibold text-card-foreground">
            Attività di Oggi
          </h2>
          <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {pendingCount} in sospeso
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              {completedCount} completate
            </span>
          </div>
        </div>
        <Link to="/calendario">
          <Button variant="ghost" size="sm" className="gap-1">
            Vedi tutto
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Activities List */}
      <div className="p-6">
        {activities.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="h-8 w-8" />}
            title="Nessuna attività oggi"
            description="Non hai attività programmate per oggi. Aggiungi una nuova attività o controlla il calendario."
            action={
              <Link to="/calendario">
                <Button>Vai al Calendario</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  cheeseColor={getCheeseColor(activity.cheeseTypeId)}
                  onToggle={() => onToggleActivity(activity.id)}
                  onDelete={onDeleteActivity ? () => onDeleteActivity(activity.id) : undefined}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
