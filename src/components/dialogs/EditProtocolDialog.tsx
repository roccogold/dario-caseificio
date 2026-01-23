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
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CheeseType } from "@/types";

interface ProtocolStep {
  day: number;
  activity: string;
}

interface EditProtocolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cheese: CheeseType | null;
  onUpdate: (id: string, protocol: ProtocolStep[]) => void;
}

export function EditProtocolDialog({
  open,
  onOpenChange,
  cheese,
  onUpdate,
}: EditProtocolDialogProps) {
  const [protocol, setProtocol] = useState<ProtocolStep[]>([
    { day: 1, activity: "Salatura" },
  ]);

  useEffect(() => {
    if (cheese) {
      setProtocol(cheese.protocol.length > 0 ? cheese.protocol : [{ day: 1, activity: "Salatura" }]);
    }
  }, [cheese, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cheese) return;

    // Ordina il protocollo per giorno prima di salvare
    const validProtocol = protocol.filter((p) => p.activity.trim());
    const sortedProtocol = [...validProtocol].sort((a, b) => a.day - b.day);
    onUpdate(cheese.id, sortedProtocol);

    toast.success(`Protocollo di ${cheese.name} aggiornato con successo!`);
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
          <DialogTitle className="font-serif">Modifica Protocollo</DialogTitle>
          <DialogDescription>
            Modifica il protocollo di produzione per {cheese.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Protocollo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Protocollo di Produzione</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addProtocolStep}
                className="h-10 gap-1.5 text-sm"
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
                <div key={originalIndex} className="flex gap-3 items-end">
                  <div className="flex flex-col gap-1.5 w-12 flex-shrink-0">
                    <Label className="text-xs font-medium text-foreground">Giorno</Label>
                    <Input
                      type="number"
                      min="0"
                      className="w-12 h-10 text-sm font-medium text-center bg-background border-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                    className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 mb-0 flex-shrink-0 transition-colors"
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
            <Button type="submit">Salva Protocollo</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
