import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Production, CheeseType } from "@/types";

interface CheeseEntry {
  cheeseTypeId: string;
  liters: number;
}

interface EditProductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  production: Production | null;
  onUpdate: (id: string, updates: {
    date: Date;
    productionNumber: string;
    cheeses: CheeseEntry[];
    notes?: string;
  }) => void;
  cheeseTypes: CheeseType[];
  existingProductions?: Array<{ id: string; productionNumber: string }>;
}

export function EditProductionDialog({
  open,
  onOpenChange,
  production,
  onUpdate,
  cheeseTypes,
  existingProductions = [],
}: EditProductionDialogProps) {
  const [date, setDate] = useState("");
  const [productionNumber, setProductionNumber] = useState("");
  const [cheeses, setCheeses] = useState<CheeseEntry[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (production) {
      setDate(format(production.date, "yyyy-MM-dd"));
      setProductionNumber(production.productionNumber);
      setCheeses(production.cheeses.map(c => ({
        cheeseTypeId: c.cheeseTypeId,
        liters: c.liters,
      })));
      setNotes(production.notes || "");
    }
  }, [production, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!production) return;

    if (!productionNumber.trim()) {
      toast.error("Inserisci il numero di produzione");
      return;
    }

    // Validazione: verifica se esiste già una produzione con lo stesso numero di lotto
    // (escludendo la produzione corrente)
    const trimmedLotNumber = productionNumber.trim();
    const lotExists = existingProductions.some(
      (prod) => 
        prod.id !== production.id && 
        prod.productionNumber.toLowerCase() === trimmedLotNumber.toLowerCase()
    );
    if (lotExists) {
      toast.error("Esiste già una produzione con questo numero di lotto");
      return;
    }

    if (cheeses.length === 0) {
      toast.error("Aggiungi almeno un formaggio");
      return;
    }

    const validCheeses = cheeses.filter((c) => c.cheeseTypeId && c.liters > 0);
    if (validCheeses.length === 0) {
      toast.error("Inserisci quantità valide per i formaggi");
      return;
    }

    onUpdate(production.id, {
      date: new Date(date),
      productionNumber: productionNumber.trim(),
      cheeses: validCheeses,
      notes: notes.trim() || undefined,
    });

    toast.success("Produzione aggiornata con successo!");
    onOpenChange(false);
  };

  const addCheeseEntry = () => {
    const availableCheeses = cheeseTypes.filter(
      (ct) => !cheeses.some((c) => c.cheeseTypeId === ct.id)
    );
    if (availableCheeses.length > 0) {
      setCheeses([
        ...cheeses,
        { cheeseTypeId: availableCheeses[0].id, liters: 0 },
      ]);
    } else {
      toast.error("Hai già aggiunto tutti i tipi di formaggio disponibili");
    }
  };

  const updateCheeseEntry = (
    index: number,
    field: "cheeseTypeId" | "liters",
    value: string | number
  ) => {
    setCheeses(
      cheeses.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const removeCheeseEntry = (index: number) => {
    setCheeses(cheeses.filter((_, i) => i !== index));
  };

  const totalLiters = cheeses.reduce((sum, c) => sum + c.liters, 0);

  const getCheeseType = (id: string) => cheeseTypes.find((c) => c.id === id);

  if (!production) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-serif">Modifica Produzione</DialogTitle>
          <DialogDescription>
            Modifica le informazioni della produzione.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Data e Numero */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 sm:h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productionNumber">Lotto</Label>
              <Input
                id="productionNumber"
                value={productionNumber}
                onChange={(e) => setProductionNumber(e.target.value)}
                placeholder="202401001"
                className="h-11 sm:h-10"
              />
            </div>
          </div>

          {/* Formaggi */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Formaggi Prodotti</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addCheeseEntry}
                className="h-11 sm:h-10 gap-1.5 text-sm"
              >
                <Plus className="h-4 w-4 sm:h-3 sm:w-3" />
                Aggiungi
              </Button>
            </div>
            <div className="space-y-2">
              {cheeses.map((entry, index) => {
                const cheeseType = getCheeseType(entry.cheeseTypeId);
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2"
                  >
                    <select
                      className="flex-1 rounded-md border border-input bg-background px-3 py-2.5 sm:py-2 text-sm h-11 sm:h-10"
                      value={entry.cheeseTypeId}
                      onChange={(e) =>
                        updateCheeseEntry(index, "cheeseTypeId", e.target.value)
                      }
                    >
                      {cheeseTypes.map((ct) => (
                        <option key={ct.id} value={ct.id}>
                          {ct.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min="1"
                        className="w-20 h-11 sm:h-10"
                        value={entry.liters}
                        onChange={(e) =>
                          updateCheeseEntry(
                            index,
                            "liters",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                      <span className="text-sm text-muted-foreground">L</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCheeseEntry(index)}
                      className="h-11 w-11 sm:h-10 sm:w-10 text-destructive"
                      disabled={cheeses.length === 1}
                    >
                      <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2">
              <span className="text-sm font-medium">Totale Litri</span>
              <span className="text-lg font-semibold text-primary">
                {totalLiters} L
              </span>
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="notes">Note (opzionale)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Eventuali note sulla produzione..."
              rows={3}
              className="min-h-[80px] sm:min-h-[60px] text-base sm:text-sm"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 sm:h-10 w-full sm:w-auto"
            >
              Annulla
            </Button>
            <Button type="submit" className="h-11 sm:h-10 w-full sm:w-auto">Salva Modifiche</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
