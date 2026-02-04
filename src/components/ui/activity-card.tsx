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
        "group relative flex items-center gap-3 rounded-lg border border-border bg-card transition-all duration-200 hover:border-primary/20 hover:shadow-sm h-[52px] pl-3"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className={cn(
          "relative flex flex-shrink-0 items-center justify-center border-2 transition-all duration-150 rounded cursor-pointer",
          isCompleted
            ? "h-2.5 w-2.5 border-success bg-success text-white shadow-sm"
            : "h-2.5 w-2.5 border-muted-foreground/30 bg-background hover:border-primary hover:bg-primary/5 active:scale-95"
        )}
      >
        {isCompleted && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Check className="h-5 w-5" strokeWidth={3} />
          </motion.div>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3 pr-2 sm:pr-3 h-full">
        <div className="flex-1 min-w-0 flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
          {/* Cheese badge for protocol activities - same as production section */}
          {activity.type === "protocol" && cheeseTypeName && cheeseColor && (
            <CheeseBadge
              name={cheeseTypeName}
              color={cheeseColor}
              size="sm"
              shape="square"
              className="flex-shrink-0"
            />
          )}
          
          {/* Title */}
          <span
            className={cn(
              "text-sm font-medium transition-colors duration-200 flex-shrink-0",
              isCompleted 
                ? "text-muted-foreground/50" 
                : "text-foreground"
            )}
          >
            {activity.title}
          </span>
          
          {/* Description (show "Lotto #10" not "Lotto: 10") */}
          {activity.description && (
            <>
              <span className="text-muted-foreground/40 hidden sm:inline">·</span>
              <span className={cn(
                "text-xs sm:text-sm text-muted-foreground/70 transition-colors duration-200 truncate",
                isCompleted && "text-muted-foreground/40"
              )}>
                {activity.description.replace(/^Lotto:\s*/i, "Lotto #")}
              </span>
            </>
          )}
        </div>

        {/* Right side - Protocol badge or Action icons placeholder */}
        <div className="flex items-center flex-shrink-0 w-auto sm:w-[80px] justify-end">
          {/* Protocol badge */}
          {activity.type === "protocol" && (
            <span className="inline-flex items-center gap-1 px-1.5 sm:gap-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-muted/40 text-[10px] sm:text-xs text-muted-foreground">
              <ClipboardList className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="hidden sm:inline">Protocollo</span>
            </span>
          )}

          {/* Action icons - only visible on hover, hidden for protocol activities */}
          {activity.type !== "protocol" && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
      </div>
    </motion.div>
  );
});

ActivityCard.displayName = "ActivityCard";
