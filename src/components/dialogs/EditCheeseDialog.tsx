import { useState, useEffect } from "react";
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
import { CHEESE_COLORS } from "@/lib/mock-data";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CheeseType } from "@/types";

interface ProtocolStep {
  day: number;
  activity: string;
}

interface EditCheeseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cheese: CheeseType | null;
  onUpdate: (id: string, updates: {
    name: string;
    color: string;
    yieldPerLiter: number;
    pricePerKg: number;
    protocol: ProtocolStep[];
  }) => void;
  existingNames?: string[];
}

export function EditCheeseDialog({
  open,
  onOpenChange,
  cheese,
  onUpdate,
  existingNames = [],
}: EditCheeseDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(CHEESE_COLORS[0].value);
  const [yieldPerLiter, setYieldPerLiter] = useState("0.12");
  const [pricePerKg, setPricePerKg] = useState("15.00");
  const [protocol, setProtocol] = useState<ProtocolStep[]>([
    { day: 1, activity: "Salatura" },
  ]);

  useEffect(() => {
    if (cheese) {
      setName(cheese.name);
      setColor(cheese.color);
      setYieldPerLiter(cheese.yieldPerLiter.toString());
      setPricePerKg(cheese.pricePerKg.toString());
      setProtocol(cheese.protocol.length > 0 ? cheese.protocol : [{ day: 1, activity: "Salatura" }]);
    }
  }, [cheese, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cheese) return;

    if (!name.trim()) {
      toast.error("Inserisci il nome del formaggio");
      return;
    }

    const nameLower = name.trim().toLowerCase();
    const otherNames = existingNames.filter(n => n !== cheese.name.toLowerCase());
    if (otherNames.includes(nameLower)) {
      toast.error("Esiste già un formaggio con questo nome");
      return;
    }

    const yieldValue = parseFloat(yieldPerLiter);
    const priceValue = parseFloat(pricePerKg);

    if (isNaN(yieldValue) || yieldValue <= 0) {
      toast.error("Inserisci una resa valida");
      return;
    }

    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error("Inserisci un prezzo valido");
      return;
    }

    // Ordina il protocollo per giorno prima di salvare
    const validProtocol = protocol.filter((p) => p.activity.trim());
    const sortedProtocol = [...validProtocol].sort((a, b) => a.day - b.day);
    
    onUpdate(cheese.id, {
      name: name.trim(),
      color,
      yieldPerLiter: yieldValue,
      pricePerKg: priceValue,
      protocol: sortedProtocol,
    });

    toast.success(`${name} aggiornato con successo!`);
    onOpenChange(false);
  };

  const addProtocolStep = () => {
    setProtocol([...protocol, { day: 0, activity: "" }]);
  };

  const updateProtocolStep = (
    index: number,
    field: "day" | "activity",
    value: string | number
  ) => {
    // Aggiorna il protocollo senza riordinare - l'ordinamento avviene solo al render
    const updatedProtocol = protocol.map((step, i) =>
      i === index ? { ...step, [field]: value } : step
    );
    setProtocol(updatedProtocol);
  };

  const removeProtocolStep = (index: number) => {
    setProtocol(protocol.filter((_, i) => i !== index));
  };

  if (!cheese) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Modifica Formaggio</DialogTitle>
          <DialogDescription>
            Modifica le informazioni del formaggio e il suo protocollo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome Formaggio</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Pecorino Toscano"
            />
          </div>

          {/* Colore */}
          <div className="space-y-2">
            <Label>Colore Identificativo</Label>
            <div className="flex flex-wrap gap-2">
              {CHEESE_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    color === c.value
                      ? "border-primary scale-110"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Resa e Prezzo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yield">Resa (kg/L)</Label>
              <Input
                id="yield"
                type="number"
                step="0.01"
                min="0"
                value={yieldPerLiter}
                onChange={(e) => setYieldPerLiter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Prezzo (€/kg)</Label>
              <Input
                id="price"
                type="number"
                step="0.50"
                min="0"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
              />
            </div>
          </div>

          {/* Protocollo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Protocollo di Produzione</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addProtocolStep}
                className="h-8 gap-1 text-xs"
              >
                <Plus className="h-3 w-3" />
                Aggiungi Fase
              </Button>
            </div>
            <div className="space-y-3">
              {[...protocol].sort((a, b) => a.day - b.day).map((step, index) => {
                // Trova l'indice originale nel protocollo non ordinato
                const originalIndex = protocol.findIndex(p => p === step);
                return (
                <div key={originalIndex} className="flex gap-3 items-start">
                  <div className="flex flex-col gap-1.5 w-14 flex-shrink-0">
                    <Label className="text-xs font-medium text-foreground">Giorno</Label>
                    <Input
                      type="number"
                      min="0"
                      className="w-14 h-10 text-sm font-medium text-center bg-background border-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={step.day}
                      onChange={(e) => {
                        const newDay = parseInt(e.target.value) || 0;
                        updateProtocolStep(originalIndex, "day", newDay);
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <Label className="text-xs font-medium text-foreground">Attività</Label>
                    <Input
                      className="h-10 bg-background border-border text-sm"
                      placeholder="Descrivi l'attività..."
                      value={step.activity}
                      onChange={(e) => {
                        updateProtocolStep(originalIndex, "activity", e.target.value);
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProtocolStep(originalIndex)}
                    className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-6 flex-shrink-0 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit">Salva Modifiche</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
