import { useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
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
import { CheeseBadge } from "@/components/ui/cheese-badge";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CheeseType } from "@/types";

interface CheeseEntry {
  cheeseTypeId: string;
  liters: number;
}

interface AddProductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (production: {
    date: Date;
    productionNumber: string;
    cheeses: CheeseEntry[];
    notes?: string;
  }) => void;
  cheeseTypes: CheeseType[];
  selectedDate?: Date;
  existingProductions?: Array<{ id: string; productionNumber: string }>;
}

export function AddProductionDialog({
  open,
  onOpenChange,
  onAdd,
  cheeseTypes,
  selectedDate = new Date(),
  existingProductions = [],
}: AddProductionDialogProps) {
  const [date, setDate] = useState(format(selectedDate, "yyyy-MM-dd"));
  const [productionNumber, setProductionNumber] = useState("");
  const [cheeses, setCheeses] = useState<CheeseEntry[]>(() => {
    if (cheeseTypes.length > 0) {
      return [{ cheeseTypeId: cheeseTypes[0].id, liters: 0 }];
    }
    return [{ cheeseTypeId: "", liters: 0 }];
  });
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setDate(format(selectedDate, "yyyy-MM-dd"));
    setProductionNumber("");
    if (cheeseTypes.length > 0) {
      setCheeses([{ cheeseTypeId: cheeseTypes[0].id, liters: 0 }]);
    } else {
      setCheeses([{ cheeseTypeId: "", liters: 0 }]);
    }
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productionNumber.trim()) {
      toast.error("Inserisci il numero di produzione");
      return;
    }

    // Validazione: verifica se esiste già una produzione con lo stesso numero di lotto
    const trimmedLotNumber = productionNumber.trim();
    const lotExists = existingProductions.some(
      (prod) => prod.productionNumber.toLowerCase() === trimmedLotNumber.toLowerCase()
    );
    if (lotExists) {
      toast.error("Esiste già una produzione con questo numero di lotto");
      return;
    }

    if (cheeses.length === 0) {
      toast.error("Aggiungi almeno un formaggio");
      return;
    }

    // Validazione più dettagliata
    for (const cheese of cheeses) {
      if (!cheese.cheeseTypeId || cheese.cheeseTypeId.trim() === "") {
        toast.error("Seleziona un tipo di formaggio per tutti gli elementi");
        return;
      }
      if (!cheese.liters || cheese.liters <= 0) {
        toast.error("Inserisci una quantità valida (maggiore di 0) per tutti i formaggi");
        return;
      }
    }
    
    const validCheeses = cheeses.filter((c) => c.cheeseTypeId && c.liters > 0);
    if (validCheeses.length === 0) {
      toast.error("Aggiungi almeno un formaggio con quantità valida");
      return;
    }

    onAdd({
      date: new Date(date),
      productionNumber: productionNumber.trim(),
      cheeses: validCheeses,
      notes: notes.trim() || undefined,
    });

    toast.success("Produzione registrata con successo!");
    resetForm();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Nuova Produzione</DialogTitle>
          <DialogDescription>
            Registra una nuova produzione giornaliera.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Data e Numero */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productionNumber">Lotto</Label>
              <Input
                id="productionNumber"
                value={productionNumber}
                onChange={(e) => setProductionNumber(e.target.value)}
                placeholder="202401001"
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
                className="h-10 gap-1.5 text-sm"
              >
                <Plus className="h-3 w-3" />
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
                      className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={entry.cheeseTypeId || ""}
                      onChange={(e) =>
                        updateCheeseEntry(index, "cheeseTypeId", e.target.value)
                      }
                      required
                    >
                      <option value="">Seleziona formaggio</option>
                      {cheeseTypes.map((ct) => (
                        <option key={ct.id} value={ct.id}>
                          {ct.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min="0.1"
                        step="0.1"
                        className="w-20"
                        value={entry.liters || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "") {
                            updateCheeseEntry(index, "liters", 0);
                          } else {
                            const numValue = parseFloat(value);
                            if (!isNaN(numValue) && numValue >= 0) {
                              updateCheeseEntry(index, "liters", numValue);
                            }
                          }
                        }}
                      />
                      <span className="text-sm text-muted-foreground">L</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCheeseEntry(index)}
                      className="h-10 w-10 text-destructive"
                      disabled={cheeses.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
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
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annulla
            </Button>
            <Button type="submit">Registra Produzione</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
