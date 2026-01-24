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

  const getRecurrenceLabel = () => {
    if (activity.type === "protocol") return "Protocollo";
    if (activity.type === "one-time") return null;
    if (activity.type === "recurring" && activity.recurrence) {
      const labels: Record<string, string> = {
        daily: "Ogni giorno",
        weekly: "Settimanale", 
        monthly: "Mensile",
        quarterly: "Trimestrale",
        semiannual: "Semestrale",
        annual: "Annuale"
      };
      return labels[activity.recurrence] || null;
    }
    return null;
  };

  const recurrenceLabel = getRecurrenceLabel();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "group flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200 cursor-pointer",
        isCompleted
          ? "bg-success/5"
          : "hover:bg-muted/50"
      )}
      onClick={onToggle}
    >
      {/* Compact Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={cn(
          "relative flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-all duration-200",
          isCompleted
            ? "bg-success border-success text-success-foreground"
            : "border-primary/40 hover:border-primary hover:bg-primary/5"
        )}
      >
        <motion.div
          initial={false}
          animate={{ 
            scale: isCompleted ? 1 : 0, 
            opacity: isCompleted ? 1 : 0
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <Check className="h-3 w-3" strokeWidth={2.5} />
        </motion.div>
      </button>

      {/* Content - Single line layout */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        {/* Cheese badge for protocol */}
        {activity.type === "protocol" && cheeseTypeName && cheeseColor && (
          <CheeseBadge
            name={cheeseTypeName}
            color={cheeseColor}
            size="sm"
          />
        )}
        
        {/* Cheese color dot for non-protocol */}
        {activity.type !== "protocol" && cheeseColor && (
          <span
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: cheeseColor }}
          />
        )}

        {/* Title */}
        <span
          className={cn(
            "font-serif text-sm truncate transition-all duration-200",
            isCompleted 
              ? "line-through text-muted-foreground/50" 
              : "text-foreground"
          )}
        >
          {activity.title}
        </span>

        {/* Description inline if short */}
        {activity.description && (
          <span className={cn(
            "text-xs truncate hidden sm:inline",
            isCompleted ? "text-muted-foreground/40" : "text-muted-foreground/70"
          )}>
            — {activity.description}
          </span>
        )}
      </div>

      {/* Right side: badges and actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Recurrence badge */}
        {recurrenceLabel && (
          <span className={cn(
            "hidden sm:inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide",
            isCompleted 
              ? "bg-success/10 text-success" 
              : "bg-primary/10 text-primary"
          )}>
            <TypeIcon className="h-2.5 w-2.5" />
            {recurrenceLabel}
          </span>
        )}

        {/* Completed indicator */}
        {isCompleted && (
          <span className="text-[10px] font-medium text-success uppercase tracking-wide">
            ✓
          </span>
        )}

        {/* Action buttons */}
        {activity.type !== "protocol" && (
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1 hover:bg-muted rounded transition-colors"
                title="Modifica"
              >
                <Edit className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 hover:bg-destructive/10 rounded transition-colors"
                title="Elimina"
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive/60 hover:text-destructive" />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
