import { format } from "date-fns";
import { it } from "date-fns/locale";
import { motion } from "framer-motion";
import { Plus, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useData } from "@/hooks/use-data";
import { AppLayout } from "@/components/layout/AppLayout";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { TodayActivities } from "@/components/dashboard/TodayActivities";
import { RecentProductions } from "@/components/dashboard/RecentProductions";
import { CheeseRanking } from "@/components/dashboard/CheeseRanking";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const {
    productions,
    cheeseTypes,
    activities,
    getActivitiesForDate,
    toggleActivity,
    deleteActivity,
  } = useData();

  const today = new Date();
  const todayActivities = getActivitiesForDate(today);

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
              Buongiorno!
            </h1>
            <p className="mt-1 text-muted-foreground">
              {format(today, "EEEE d MMMM yyyy", { locale: it })}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/calendario" className="w-full sm:w-auto">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <Calendar className="h-4 w-4" />
                Calendario
              </Button>
            </Link>
            <Link to="/calendario?new=true" className="w-full sm:w-auto">
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Nuova Produzione
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <QuickStats productions={productions} />

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Activities - Takes 2 columns */}
          <div className="md:col-span-2 lg:col-span-2">
            <TodayActivities
              activities={todayActivities}
              cheeseTypes={cheeseTypes}
              onToggleActivity={toggleActivity}
              onDeleteActivity={deleteActivity}
            />
          </div>

          {/* Cheese Ranking - Takes 1 column */}
          <div>
            <CheeseRanking productions={productions} cheeseTypes={cheeseTypes} />
          </div>
        </div>

        {/* Recent Productions */}
        <RecentProductions productions={productions} cheeseTypes={cheeseTypes} />
      </div>
    </AppLayout>
  );
}
