import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Milk,
  Euro,
  Droplets,
  MoreVertical,
  Edit,
  Trash2,
  Search,
  FileText,
} from "lucide-react";
import { useData } from "@/hooks/use-data";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheeseBadge } from "@/components/ui/cheese-badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddCheeseDialog } from "@/components/dialogs/AddCheeseDialog";
import { EditCheeseDialog } from "@/components/dialogs/EditCheeseDialog";
import { EditProtocolDialog } from "@/components/dialogs/EditProtocolDialog";
import { CheeseType } from "@/types";
import { generateCheesePDF } from "@/utils/generatePDF";
import { toast } from "sonner";

export default function Formaggi() {
  const { cheeseTypes, addCheeseType, updateCheeseType, deleteCheeseType } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isProtocolDialogOpen, setIsProtocolDialogOpen] = useState(false);
  const [selectedCheese, setSelectedCheese] = useState<CheeseType | null>(null);

  // Filter cheese types by search query
  const filteredCheeseTypes = useMemo(() => {
    if (!searchQuery.trim()) {
      return cheeseTypes;
    }
    const query = searchQuery.toLowerCase();
    return cheeseTypes.filter((cheese) =>
      cheese.name.toLowerCase().includes(query)
    );
  }, [cheeseTypes, searchQuery]);

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
              Tipi di Formaggio
            </h1>
            <p className="mt-1 text-muted-foreground">
              {cheeseTypes.length} formaggi totali
            </p>
          </div>
          <Button className="gap-2 w-full sm:w-auto" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Nuovo Formaggio
          </Button>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca formaggio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </motion.div>

        {/* Add Cheese Dialog */}
        <AddCheeseDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAdd={addCheeseType}
          existingNames={cheeseTypes.map((c) => c.name.toLowerCase())}
          existingColors={cheeseTypes.map((c) => c.color)}
        />

        {/* Edit Cheese Dialog */}
        <EditCheeseDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          cheese={selectedCheese}
          onUpdate={(id, updates) => {
            updateCheeseType(id, updates);
            setIsEditDialogOpen(false);
          }}
          existingNames={cheeseTypes.map((c) => c.name.toLowerCase())}
          existingColors={cheeseTypes.map((c) => c.color)}
        />

        {/* Edit Protocol Dialog */}
        <EditProtocolDialog
          open={isProtocolDialogOpen}
          onOpenChange={setIsProtocolDialogOpen}
          cheese={selectedCheese}
          onUpdate={(id, protocol) => {
            const cheese = cheeseTypes.find(c => c.id === id);
            if (cheese) {
              updateCheeseType(id, { protocol });
            }
            setIsProtocolDialogOpen(false);
          }}
        />

        {/* Cheese Grid */}
        {filteredCheeseTypes.length === 0 ? (
          <EmptyState
            icon={<Milk className="h-8 w-8" />}
            title={searchQuery ? "Nessun risultato" : "Nessun formaggio"}
            description={
              searchQuery
                ? "Prova a modificare la ricerca."
                : "Non hai ancora aggiunto nessun tipo di formaggio. Inizia creando il tuo primo formaggio."
            }
            action={
              !searchQuery && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  Aggiungi Formaggio
                </Button>
              )
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredCheeseTypes.map((cheese, index) => (
                <motion.div
                  key={cheese.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all hover:shadow-card-hover"
                >
                  {/* Color Header */}
                  <div
                    className="h-3"
                    style={{ backgroundColor: cheese.color }}
                  />

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <CheeseBadge
                        name={cheese.name}
                        color={cheese.color}
                        size="lg"
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 opacity-0 group-hover:opacity-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCheese(cheese);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Modifica
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async () => {
                              try {
                                await generateCheesePDF(cheese);
                                toast.success('PDF generato con successo!');
                              } catch (error: any) {
                                console.error('Error generating PDF:', error);
                                const errorMessage = error?.message || 'Errore nella generazione del PDF';
                                toast.error(errorMessage);
                              }
                            }}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Genera Scheda PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteCheeseType(cheese.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Elimina
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                          <Droplets className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Resa</p>
                          <p className="text-sm font-medium">
                            {cheese.yieldPercentage !== undefined 
                              ? `${cheese.yieldPercentage}%` 
                              : cheese.yieldPerLiter 
                                ? `${(cheese.yieldPerLiter * 100).toFixed(1)}%` 
                                : 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Prezzi */}
                      <div className="space-y-2">
                        {cheese.prices ? (
                          <>
                            {cheese.prices.price1 > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Franco Caseificio:</span>
                                <span className="font-medium">€{cheese.prices.price1.toFixed(2)}/kg</span>
                                {cheese.prices.salesPercentage1 > 0 && (
                                  <span className="text-xs text-muted-foreground">({cheese.prices.salesPercentage1}%)</span>
                                )}
                              </div>
                            )}
                            {cheese.prices.price2 > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Franco Cliente:</span>
                                <span className="font-medium">€{cheese.prices.price2.toFixed(2)}/kg</span>
                                {cheese.prices.salesPercentage2 > 0 && (
                                  <span className="text-xs text-muted-foreground">({cheese.prices.salesPercentage2}%)</span>
                                )}
                              </div>
                            )}
                            {cheese.prices.price3 > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Vendita Diretta:</span>
                                <span className="font-medium">€{cheese.prices.price3.toFixed(2)}/kg</span>
                                {cheese.prices.salesPercentage3 > 0 && (
                                  <span className="text-xs text-muted-foreground">({cheese.prices.salesPercentage3}%)</span>
                                )}
                              </div>
                            )}
                          </>
                        ) : cheese.pricePerKg ? (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Prezzo:</span>
                            <span className="font-medium">€{cheese.pricePerKg.toFixed(2)}/kg</span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Default Fields */}
                    {cheese.defaultFields && (
                      <div className="mt-4 border-t border-border pt-4">
                        <div className="space-y-2">
                          {cheese.defaultFields.temperaturaCoagulazione && (
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-muted-foreground">
                                  Temperatura Coagulazione
                                </p>
                                <p className="text-sm text-foreground mt-0.5">
                                  {cheese.defaultFields.temperaturaCoagulazione}
                                </p>
                              </div>
                            </div>
                          )}
                          {cheese.defaultFields.nomeFermento && (
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-muted-foreground">
                                  Nome Fermento
                                </p>
                                <p className="text-sm text-foreground mt-0.5">
                                  {cheese.defaultFields.nomeFermento}
                                  {cheese.defaultFields.quantitaFermento && ` (${cheese.defaultFields.quantitaFermento} unità)`}
                                </p>
                              </div>
                            </div>
                          )}
                          {cheese.defaultFields.muffe && (
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-muted-foreground">
                                  Muffe
                                </p>
                                <p className="text-sm text-foreground mt-0.5">
                                  {cheese.defaultFields.muffe}
                                  {cheese.defaultFields.quantitaMuffe && ` (${cheese.defaultFields.quantitaMuffe} unità)`}
                                </p>
                              </div>
                            </div>
                          )}
                          {cheese.defaultFields.caglio && (
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-muted-foreground">
                                  Caglio
                                </p>
                                <p className="text-sm text-foreground mt-0.5">
                                  {cheese.defaultFields.caglio}
                                  {cheese.defaultFields.quantitaCaglio && ` (${cheese.defaultFields.quantitaCaglio} cc)`}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Custom Fields */}
                    {cheese.customFields && cheese.customFields.length > 0 && (
                      <div className={`mt-4 border-t border-border pt-4 ${cheese.defaultFields ? '' : ''}`}>
                        <div className="space-y-2">
                          {cheese.customFields.map((field, index) => (
                            <div key={index} className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-muted-foreground">
                                  {field.key || "Campo"}
                                </p>
                                <p className="text-sm text-foreground mt-0.5">
                                  {field.value || "-"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Protocol Preview */}
                    {cheese.protocol.length > 0 && (
                      <div className={`mt-4 border-t border-border pt-4 ${cheese.customFields && cheese.customFields.length > 0 ? '' : ''}`}>
                        <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                          Protocollo ({cheese.protocol.length} fasi)
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {cheese.protocol.slice(0, 3).map((step, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              G{step.day}: {step.activity}
                            </span>
                          ))}
                          {cheese.protocol.length > 3 && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              +{cheese.protocol.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
