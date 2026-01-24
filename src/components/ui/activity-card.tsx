import { motion } from "framer-motion";
import { Check, Edit, Trash2, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { Activity } from "@/types";
import { format } from "date-fns";
import { forwardRef } from "react";
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

export const ActivityCard = forwardRef<HTMLDivElement, ActivityCardProps>(({
  activity,
  cheeseColor,
  cheeseTypeName,
  onToggle,
  currentDate = new Date(),
  onEdit,
  onDelete,
}, ref) => {
  // Per attività ricorrenti, controlla se è completata per la data corrente
  const isCompleted = activity.recurrence && activity.recurrence !== 'none' as const && activity.type === 'recurring'
    ? (activity.completedDates || []).includes(format(currentDate, 'yyyy-MM-dd'))
    : activity.completed;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(); // Ora è sincrono, nessun await necessario
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg border bg-card transition-all duration-200",
        isCompleted
          ? "border-success/30 bg-success/5"
          : "border-border hover:border-primary/20 hover:shadow-sm"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className={cn(
          "relative flex flex-shrink-0 items-center justify-center border-2 transition-all duration-150 ml-3 rounded cursor-pointer",
          isCompleted
            ? "h-3 w-3 border-success bg-success text-white shadow-sm"
            : "h-3 w-3 border-muted-foreground/30 bg-background hover:border-primary hover:bg-primary/5 active:scale-95"
        )}
      >
        {isCompleted && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Check className="h-1.5 w-1.5" strokeWidth={3} />
          </motion.div>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 flex items-center gap-3 py-2.5">
        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
          {/* Cheese badge for protocol activities - same as production section */}
          {activity.type === "protocol" && cheeseTypeName && cheeseColor && (
            <CheeseBadge
              name={cheeseTypeName}
              color={cheeseColor}
              size="sm"
            />
          )}
          
          {/* Title */}
          <span
            className={cn(
              "text-sm font-medium transition-colors duration-200",
              isCompleted 
                ? "text-muted-foreground/50" 
                : "text-foreground"
            )}
          >
            {activity.title}
          </span>
          
          {/* Description */}
          {activity.description && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className={cn(
                "text-sm text-muted-foreground/70 transition-colors duration-200",
                isCompleted && "text-muted-foreground/40"
              )}>
                {activity.description}
              </span>
            </>
          )}
        </div>

        {/* Protocol badge */}
        {activity.type === "protocol" && (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/40 text-xs text-muted-foreground flex-shrink-0">
            <ClipboardList className="h-3 w-3" />
            <span>Protocollo</span>
          </span>
        )}

        {/* Action icons - only visible on hover, hidden for protocol activities */}
        {activity.type !== "protocol" && (
          <div className="flex items-center gap-1 pr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="flex items-center justify-center w-7 h-7 hover:bg-muted rounded transition-colors"
                title="Modifica attività"
              >
                <Edit className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="flex items-center justify-center w-7 h-7 hover:bg-destructive/10 rounded transition-colors"
                title="Elimina attività"
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive/70 hover:text-destructive transition-colors" />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

ActivityCard.displayName = "ActivityCard";
