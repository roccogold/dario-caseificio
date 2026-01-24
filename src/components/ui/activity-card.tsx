import { motion } from "framer-motion";
import { Check, Edit, Trash2, CalendarDays, Repeat, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { Activity } from "@/types";
import { format } from "date-fns";

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
  // Per attività ricorrenti, controlla se è completata per la data corrente
  const isCompleted = activity.recurrence && activity.recurrence !== 'none' as const && activity.type === 'recurring'
    ? (activity.completedDates || []).includes(format(currentDate, 'yyyy-MM-dd'))
    : activity.completed;

  // Icone per tipo di attività
  const typeIcons = {
    protocol: ClipboardList,
    recurring: Repeat,
    "one-time": CalendarDays,
  };

  const TypeIcon = typeIcons[activity.type];

  // Testo della ricorrenza
  const getRecurrenceText = () => {
    if (activity.type === "protocol") return "Protocollo";
    if (activity.type === "recurring" && activity.recurrence) {
      const recurrenceMap: Record<string, string> = {
        daily: "Giornaliera",
        weekly: "Settimanale",
        monthly: "Mensile",
        quarterly: "Trimestrale",
        semiannual: "Semestrale",
        annual: "Annuale",
      };
      return recurrenceMap[activity.recurrence] || "";
    }
    return "Nessuna ricorrenza";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg border transition-all duration-300",
        isCompleted
          ? "bg-success/5 border-success/20"
          : "bg-card border-border"
      )}
    >
      {/* Left accent bar - only for completed */}
      {isCompleted && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-success rounded-l-lg" />
      )}

      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={cn(
          "relative flex flex-shrink-0 items-center justify-center border-2 transition-all duration-300 ml-3",
          isCompleted
            ? "h-4 w-4 rounded border-success bg-success text-white"
            : "h-4 w-4 rounded border-muted-foreground/30 bg-background hover:border-primary hover:bg-primary/5"
        )}
      >
        {isCompleted && (
          <motion.div
            initial={false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </motion.div>
        )}
      </button>

      {/* Content - Title and description on same line */}
      <div className="flex-1 min-w-0 flex items-center gap-2 py-3">
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
            {activity.type === "protocol" && cheeseTypeName && cheeseColor && (
              <>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
                  style={{ 
                    backgroundColor: cheeseColor,
                    color: '#000'
                  }}
                >
                  {cheeseTypeName}
                </span>
              </>
            )}
            <span
              className={cn(
                "text-sm font-medium transition-all duration-300",
                isCompleted 
                  ? "text-muted-foreground/60 line-through" 
                  : "text-foreground"
              )}
            >
              {activity.title}
            </span>
            {activity.description && (
              <>
                <span className={cn(
                  "text-sm transition-all duration-300",
                  isCompleted ? "text-muted-foreground/60 line-through" : "text-muted-foreground"
                )}>
                  —
                </span>
                <span className={cn(
                  "text-sm transition-all duration-300",
                  isCompleted ? "text-muted-foreground/60 line-through" : "text-muted-foreground"
                )}>
                  {activity.description}
                </span>
              </>
            )}
          </div>
          {/* Recurrence badge */}
          <div className="flex items-center">
            <span className={cn(
              "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-muted/50 text-muted-foreground"
            )}>
              <TypeIcon className="h-3 w-3" />
              {getRecurrenceText()}
            </span>
          </div>
        </div>

        {/* Action icons - only visible on hover */}
        <div className="flex items-center gap-2 pr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isCompleted && (
            <Check className="h-4 w-4 text-success flex-shrink-0" />
          )}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex items-center justify-center w-8 h-8 hover:bg-muted rounded transition-colors"
              title="Modifica attività"
            >
              <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex items-center justify-center w-8 h-8 hover:bg-destructive/10 rounded transition-colors"
              title="Elimina attività"
            >
              <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive transition-colors" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
