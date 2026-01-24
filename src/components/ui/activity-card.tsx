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
  const isCompleted = activity.recurrence && activity.recurrence !== 'none' as const && activity.type === 'recurring'
    ? (activity.completedDates || []).includes(format(currentDate, 'yyyy-MM-dd'))
    : activity.completed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className={cn(
        "group relative flex items-start gap-4 rounded-xl p-4 transition-all duration-300",
        isCompleted
          ? "bg-gradient-to-r from-success/10 to-success/5 border border-success/20"
          : "bg-card border border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
      )}
    >
      {/* Left accent bar */}
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-colors duration-300",
          isCompleted ? "bg-success" : "bg-primary/30"
        )}
      />

      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={cn(
          "relative mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-300",
          isCompleted
            ? "border-success bg-success text-success-foreground shadow-sm shadow-success/30"
            : "border-muted-foreground/30 hover:border-primary hover:bg-primary/10 hover:scale-110"
        )}
      >
        <motion.div
          initial={false}
          animate={{ scale: isCompleted ? 1 : 0, opacity: isCompleted ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </motion.div>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 pl-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {activity.type === "protocol" && cheeseTypeName && cheeseColor && (
              <CheeseBadge
                name={cheeseTypeName}
                color={cheeseColor}
                size="sm"
              />
            )}
            <p
              className={cn(
                "font-medium text-base transition-all duration-300",
                isCompleted 
                  ? "line-through text-muted-foreground/60" 
                  : "text-foreground"
              )}
            >
              {activity.title}
            </p>
            {activity.type !== "protocol" && cheeseColor && (
              <span
                className="h-2.5 w-2.5 rounded-full ring-2 ring-background shadow-sm"
                style={{ backgroundColor: cheeseColor }}
              />
            )}
          </div>
          {activity.type !== "protocol" && (
            <div className="flex items-center gap-0.5">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 hover:bg-muted rounded-lg"
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
                  className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 hover:bg-destructive/10 rounded-lg"
                  title="Elimina attività"
                >
                  <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive transition-colors" />
                </button>
              )}
            </div>
          )}
        </div>
        {activity.description && (
          <p className={cn(
            "mt-1.5 text-sm line-clamp-2 transition-colors duration-300",
            isCompleted ? "text-muted-foreground/50" : "text-muted-foreground"
          )}>
            {activity.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-3">
          <span className={cn(
            "inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors duration-300",
            isCompleted 
              ? "bg-success/10 text-success" 
              : "bg-muted text-muted-foreground"
          )}>
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
          {isCompleted && (
            <span className="text-xs text-success font-medium">
              ✓ Completato
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
