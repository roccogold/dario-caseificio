import { motion } from "framer-motion";
import { Check, Repeat, CalendarDays, ClipboardList, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Activity } from "@/types";
import { format } from "date-fns";
import { CheeseBadge } from "@/components/ui/cheese-badge";

interface ActivityCardProps {
  activity: Activity;
  cheeseColor?: string;
  cheeseTypeName?: string;
  onToggle: () => void;
  currentDate?: Date;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ActivityCard({
  activity,
  cheeseColor,
  cheeseTypeName,
  onToggle,
  currentDate = new Date(),
  onEdit,
  onDelete,
}: ActivityCardProps) {
  const typeIcons = {
    protocol: ClipboardList,
    recurring: Repeat,
    "one-time": CalendarDays,
  };

  const TypeIcon = typeIcons[activity.type];

  // Per attività ricorrenti, controlla se è completata per la data corrente
  const isCompleted = activity.recurrence && activity.recurrence !== 'none' && activity.type === 'recurring'
    ? (activity.completedDates || []).includes(format(currentDate, 'yyyy-MM-dd'))
    : activity.completed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className={cn(
        "group flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-all duration-200",
        isCompleted
          ? "bg-muted/50 opacity-75"
          : "hover:border-primary/30 hover:shadow-card"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={cn(
          "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
          isCompleted
            ? "border-success bg-success text-success-foreground"
            : "border-muted-foreground/40 hover:border-primary hover:bg-primary/10"
        )}
      >
        {isCompleted && <Check className="h-3 w-3" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {activity.type === "protocol" && cheeseTypeName && cheeseColor && (
              <CheeseBadge
                name={cheeseTypeName}
                color={cheeseColor}
                size="sm"
              />
            )}
            <p
              className={cn(
                "font-medium text-card-foreground",
                isCompleted && "line-through text-muted-foreground"
              )}
            >
              {activity.title}
            </p>
            {activity.type !== "protocol" && cheeseColor && (
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: cheeseColor }}
              />
            )}
          </div>
          {activity.type !== "protocol" && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                  title="Modifica attività"
                >
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                  title="Elimina attività"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              )}
            </div>
          )}
        </div>
        {activity.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {activity.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <TypeIcon className="h-3 w-3" />
            {activity.type === "protocol" && "Protocollo"}
            {activity.type === "recurring" && activity.recurrence && (
              activity.recurrence === "daily" ? "Giornaliero" :
              activity.recurrence === "weekly" ? "Settimanale" :
              activity.recurrence === "monthly" ? "Mensile" :
              activity.recurrence === "quarterly" ? "Trimestrale" :
              activity.recurrence === "semiannual" ? "Semestrale" :
              activity.recurrence === "annual" ? "Annuale" : ""
            )}
            {activity.type === "one-time" && "Nessuna ricorrenza"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
