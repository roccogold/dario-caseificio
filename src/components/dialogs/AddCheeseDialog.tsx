import { useState } from "react";
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

interface ProtocolStep {
  day: number;
  activity: string;
}

interface AddCheeseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (cheese: {
    name: string;
    color: string;
    yieldPerLiter: number;
    pricePerKg: number;
    protocol: ProtocolStep[];
  }) => void;
  existingNames?: string[];
}

export function AddCheeseDialog({
  open,
  onOpenChange,
  onAdd,
  existingNames = [],
}: AddCheeseDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(CHEESE_COLORS[0].value);
  const [yieldPerLiter, setYieldPerLiter] = useState("0.12");
  const [pricePerKg, setPricePerKg] = useState("15.00");
  const [protocol, setProtocol] = useState<ProtocolStep[]>([
    { day: 1, activity: "Salatura" },
  ]);

  const resetForm = () => {
    setName("");
    setColor(CHEESE_COLORS[0].value);
    setYieldPerLiter("0.12");
    setPricePerKg("15.00");
    setProtocol([{ day: 1, activity: "Salatura" }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Inserisci il nome del formaggio");
      return;
    }

    if (existingNames.includes(name.trim().toLowerCase())) {
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

    onAdd({
      name: name.trim(),
      color,
      yieldPerLiter: yieldValue,
      pricePerKg: priceValue,
      protocol: protocol.filter((p) => p.activity.trim()),
    });

    toast.success(`${name} aggiunto con successo!`);
    resetForm();
    onOpenChange(false);
  };

  const addProtocolStep = () => {
    const lastDay = protocol.length > 0 ? protocol[protocol.length - 1].day : 0;
    setProtocol([...protocol, { day: lastDay + 1, activity: "" }]);
  };

  const updateProtocolStep = (
    index: number,
    field: "day" | "activity",
    value: string | number
  ) => {
    setProtocol(
      protocol.map((step, i) =>
        i === index ? { ...step, [field]: value } : step
      )
    );
  };

  const removeProtocolStep = (index: number) => {
    setProtocol(protocol.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Nuovo Tipo di Formaggio</DialogTitle>
          <DialogDescription>
            Aggiungi un nuovo tipo di formaggio con il suo protocollo di produzione.
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
            <div className="space-y-2">
              {protocol.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    className="w-20"
                    placeholder="Giorno"
                    value={step.day}
                    onChange={(e) =>
                      updateProtocolStep(index, "day", parseInt(e.target.value) || 0)
                    }
                  />
                  <Input
                    className="flex-1"
                    placeholder="Attività"
                    value={step.activity}
                    onChange={(e) =>
                      updateProtocolStep(index, "activity", e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProtocolStep(index)}
                    className="h-10 w-10 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit">Aggiungi Formaggio</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
