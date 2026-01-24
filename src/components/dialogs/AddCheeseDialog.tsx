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
import type { CustomField, DefaultFields } from "@/types";

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
    yieldPercentage?: number;
    prices?: {
      price1: number;
      price2: number;
      price3: number;
      salesPercentage1: number;
      salesPercentage2: number;
      salesPercentage3: number;
    };
    defaultFields?: DefaultFields;
    customFields?: CustomField[];
    protocol: ProtocolStep[];
  }) => void;
  existingNames?: string[];
  existingColors?: string[];
}

export function AddCheeseDialog({
  open,
  onOpenChange,
  onAdd,
  existingNames = [],
  existingColors = [],
}: AddCheeseDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(CHEESE_COLORS[0].value);
  const [yieldPercentage, setYieldPercentage] = useState("");
  const [price1, setPrice1] = useState("");
  const [price2, setPrice2] = useState("");
  const [price3, setPrice3] = useState("");
  const [salesPercentage1, setSalesPercentage1] = useState("");
  const [salesPercentage2, setSalesPercentage2] = useState("");
  const [salesPercentage3, setSalesPercentage3] = useState("");
  const [temperaturaCoagulazione, setTemperaturaCoagulazione] = useState("");
  const [nomeFermento, setNomeFermento] = useState("");
  const [quantitaFermento, setQuantitaFermento] = useState("");
  const [muffe, setMuffe] = useState("");
  const [quantitaMuffe, setQuantitaMuffe] = useState("");
  const [caglio, setCaglio] = useState("");
  const [quantitaCaglio, setQuantitaCaglio] = useState("");
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [protocol, setProtocol] = useState<ProtocolStep[]>([
    { day: 0, activity: "" },
  ]);

  const resetForm = () => {
    setName("");
    setColor(CHEESE_COLORS[0].value);
    setYieldPercentage("");
    setPrice1("");
    setPrice2("");
    setPrice3("");
    setSalesPercentage1("");
    setSalesPercentage2("");
    setSalesPercentage3("");
    setTemperaturaCoagulazione("");
    setNomeFermento("");
    setQuantitaFermento("");
    setMuffe("");
    setQuantitaMuffe("");
    setCaglio("");
    setQuantitaCaglio("");
    setCustomFields([]);
    setProtocol([{ day: 0, activity: "" }]);
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

    if (existingColors.includes(color)) {
      toast.error("Esiste già un formaggio con questo colore");
      return;
    }

    // Resa is optional - validate only if provided
    const yieldValue = yieldPercentage ? parseFloat(yieldPercentage) : undefined;
    if (yieldValue !== undefined) {
      if (isNaN(yieldValue) || yieldValue <= 0 || yieldValue > 100) {
        toast.error("Inserisci una resa valida (0-100%)");
        return;
      }
    }

    // Prices are optional - validate only if at least one price is provided
    const price1Value = price1 ? parseFloat(price1) : 0;
    const price2Value = price2 ? parseFloat(price2) : 0;
    const price3Value = price3 ? parseFloat(price3) : 0;
    const salesPct1 = salesPercentage1 ? parseFloat(salesPercentage1) : 0;
    const salesPct2 = salesPercentage2 ? parseFloat(salesPercentage2) : 0;
    const salesPct3 = salesPercentage3 ? parseFloat(salesPercentage3) : 0;

    const hasAnyPrice = price1Value > 0 || price2Value > 0 || price3Value > 0;
    
    if (hasAnyPrice) {
      // If any price is provided, validate sales percentages sum to 100
      const totalSalesPct = salesPct1 + salesPct2 + salesPct3;
      if (Math.abs(totalSalesPct - 100) > 0.01) {
        toast.error(`La somma delle percentuali di vendita deve essere 100% (attuale: ${totalSalesPct.toFixed(1)}%)`);
        return;
      }

      if (salesPct1 < 0 || salesPct2 < 0 || salesPct3 < 0 || salesPct1 > 100 || salesPct2 > 100 || salesPct3 > 100) {
        toast.error("Le percentuali di vendita devono essere tra 0% e 100%");
        return;
      }

      // At least one price must be valid
      if (price1Value <= 0 && price2Value <= 0 && price3Value <= 0) {
        toast.error("Inserisci almeno un prezzo valido");
        return;
      }
    }

    // Ordina il protocollo per giorno prima di salvare
    const validProtocol = protocol.filter((p) => p.activity.trim());
    const sortedProtocol = [...validProtocol].sort((a, b) => a.day - b.day);
    
    onAdd({
      name: name.trim(),
      color,
      ...(yieldValue !== undefined && { yieldPercentage: yieldValue }),
      ...(hasAnyPrice && {
        prices: {
          price1: price1Value || 0,
          price2: price2Value || 0,
          price3: price3Value || 0,
          salesPercentage1: salesPct1 || 0,
          salesPercentage2: salesPct2 || 0,
          salesPercentage3: salesPct3 || 0,
        },
      }),
      defaultFields: {
        temperaturaCoagulazione: temperaturaCoagulazione.trim() || undefined,
        nomeFermento: nomeFermento.trim() || undefined,
        quantitaFermento: quantitaFermento.trim() || undefined,
        muffe: muffe.trim() || undefined,
        quantitaMuffe: quantitaMuffe.trim() || undefined,
        caglio: caglio.trim() || undefined,
        quantitaCaglio: quantitaCaglio.trim() || undefined,
      },
      customFields: customFields.filter(f => f.key.trim() || f.value.trim()),
      protocol: sortedProtocol,
    });

    toast.success(`${name} aggiunto con successo!`);
    resetForm();
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
    setProtocol(
      protocol.map((step, i) =>
        i === index ? { ...step, [field]: value } : step
      )
    );
  };

  const removeProtocolStep = (index: number) => {
    setProtocol(protocol.filter((_, i) => i !== index));
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { key: "", value: "" }]);
  };

  const updateCustomField = (index: number, field: "key" | "value", value: string) => {
    setCustomFields(
      customFields.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    );
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  // Reset form when dialog opens or closes
  useEffect(() => {
    if (open) {
      resetForm();
    } else {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Nuovo Tipo di Formaggio</DialogTitle>
          <DialogDescription>
            Aggiungi un nuovo tipo di formaggio con il suo protocollo di produzione.
          </DialogDescription>
        </DialogHeader>

        <form key={open ? "form-open" : "form-closed"} onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
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
                  className={`h-10 w-10 rounded-full border-2 transition-all ${
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

          {/* Resa */}
          <div className="space-y-2">
            <Label htmlFor="yield">Resa (%)</Label>
            <Input
              key={`yield-${open}`}
              id="yield"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              autoComplete="off"
              value={yieldPercentage}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d*\.?\d*$/.test(val)) {
                  setYieldPercentage(val);
                }
              }}
              placeholder="es. 20 (20kg da 100L)"
            />
            <p className="text-xs text-muted-foreground">
              Percentuale di resa: da 100L di latte si ottengono {yieldPercentage ? (() => {
                const value = parseFloat(yieldPercentage) || 0;
                return value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
              })() : '0'}kg di formaggio
            </p>
          </div>

          {/* Prezzi e % di vendita */}
          <div className="space-y-4">
            <Label>Prezzi e Percentuali di Vendita</Label>
            <div className="space-y-3">
              {/* Prezzo 1 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="price1" className="text-xs">Prezzo Franco Caseificio (€/kg)</Label>
                  <Input
                    key={`price1-${open}`}
                    id="price1"
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*\.?[0-9]*"
                    autoComplete="off"
                    value={price1}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        setPrice1(val);
                      }
                    }}
                    placeholder="es. 12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salesPct1" className="text-xs">% di vendita</Label>
                  <Input
                    key={`salesPct1-${open}`}
                    id="salesPct1"
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*\.?[0-9]*"
                    autoComplete="off"
                    value={salesPercentage1}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        const numVal = parseFloat(val) || 0;
                        const remaining = 100 - numVal - (parseFloat(salesPercentage2) || 0) - (parseFloat(salesPercentage3) || 0);
                        if (remaining >= 0 || val === "") {
                          setSalesPercentage1(val);
                        }
                      }
                    }}
                    placeholder="es. 25%"
                  />
                </div>
              </div>
              {/* Prezzo 2 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="price2" className="text-xs">Prezzo Franco Cliente (€/kg)</Label>
                  <Input
                    key={`price2-${open}`}
                    id="price2"
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*\.?[0-9]*"
                    autoComplete="off"
                    value={price2}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        setPrice2(val);
                      }
                    }}
                    placeholder="es. 12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salesPct2" className="text-xs">% di vendita</Label>
                  <Input
                    key={`salesPct2-${open}`}
                    id="salesPct2"
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*\.?[0-9]*"
                    autoComplete="off"
                    value={salesPercentage2}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        const numVal = parseFloat(val) || 0;
                        const remaining = 100 - numVal - (parseFloat(salesPercentage1) || 0) - (parseFloat(salesPercentage3) || 0);
                        if (remaining >= 0 || val === "") {
                          setSalesPercentage2(val);
                        }
                      }
                    }}
                    placeholder="es. 25%"
                  />
                </div>
              </div>
              {/* Prezzo 3 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="price3" className="text-xs">Prezzo Vendita Diretta (€/kg)</Label>
                  <Input
                    key={`price3-${open}`}
                    id="price3"
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*\.?[0-9]*"
                    autoComplete="off"
                    value={price3}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        setPrice3(val);
                      }
                    }}
                    placeholder="es. 12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salesPct3" className="text-xs">% di vendita</Label>
                  <Input
                    key={`salesPct3-${open}`}
                    id="salesPct3"
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*\.?[0-9]*"
                    autoComplete="off"
                    value={salesPercentage3}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        const numVal = parseFloat(val) || 0;
                        const remaining = 100 - numVal - (parseFloat(salesPercentage1) || 0) - (parseFloat(salesPercentage2) || 0);
                        if (remaining >= 0 || val === "") {
                          setSalesPercentage3(val);
                        }
                      }
                    }}
                    placeholder="es. 25%"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Totale: {((parseFloat(salesPercentage1) || 0) + (parseFloat(salesPercentage2) || 0) + (parseFloat(salesPercentage3) || 0)).toFixed(1)}% / 100%
            </p>
          </div>

          {/* Default Fields */}
          <div className="space-y-4">
            <Label>Campi Predefiniti</Label>
            
            {/* Temperatura Coagulazione */}
            <div className="space-y-2">
              <Label htmlFor="temperaturaCoagulazione" className="text-xs">Temperatura Coagulazione</Label>
              <Input
                id="temperaturaCoagulazione"
                className="h-10 bg-background border-border text-sm"
                placeholder="es. 35°C"
                value={temperaturaCoagulazione}
                onChange={(e) => setTemperaturaCoagulazione(e.target.value)}
              />
            </div>

            {/* Nome Fermento e Quantità */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="nomeFermento" className="text-xs">Nome Fermento</Label>
                <Input
                  id="nomeFermento"
                  className="h-10 bg-background border-border text-sm"
                  placeholder="es. Lactobacillus"
                  value={nomeFermento}
                  onChange={(e) => setNomeFermento(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantitaFermento" className="text-xs">Quantità (unità)</Label>
                <Input
                  id="quantitaFermento"
                  className="h-10 bg-background border-border text-sm"
                  placeholder="es. 2"
                  value={quantitaFermento}
                  onChange={(e) => setQuantitaFermento(e.target.value)}
                />
              </div>
            </div>

            {/* Muffe e Quantità */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="muffe" className="text-xs">Muffe</Label>
                <Input
                  id="muffe"
                  className="h-10 bg-background border-border text-sm"
                  placeholder="es. Penicillium"
                  value={muffe}
                  onChange={(e) => setMuffe(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantitaMuffe" className="text-xs">Quantità (unità)</Label>
                <Input
                  id="quantitaMuffe"
                  className="h-10 bg-background border-border text-sm"
                  placeholder="es. 1"
                  value={quantitaMuffe}
                  onChange={(e) => setQuantitaMuffe(e.target.value)}
                />
              </div>
            </div>

            {/* Caglio e Quantità */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="caglio" className="text-xs">Caglio</Label>
                <Input
                  id="caglio"
                  className="h-10 bg-background border-border text-sm"
                  placeholder="es. Caglio vegetale"
                  value={caglio}
                  onChange={(e) => setCaglio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantitaCaglio" className="text-xs">Quantità (cc)</Label>
                <Input
                  id="quantitaCaglio"
                  className="h-10 bg-background border-border text-sm"
                  placeholder="es. 50"
                  value={quantitaCaglio}
                  onChange={(e) => setQuantitaCaglio(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Custom Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Campi Personalizzati</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addCustomField}
                    className="h-10 gap-1.5 text-sm"
              >
                <Plus className="h-3 w-3" />
                Aggiungi Campo
              </Button>
            </div>
            {customFields.length > 0 && (
              <div className="space-y-3">
                {customFields.map((field, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <Label className="text-xs font-medium text-foreground">Nome</Label>
                      <Input
                        className="h-10 bg-background border-border text-sm"
                        placeholder="es. Fuscelle"
                        value={field.key}
                        onChange={(e) => updateCustomField(index, "key", e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <Label className="text-xs font-medium text-foreground">Valore</Label>
                      <Input
                        className="h-10 bg-background border-border text-sm"
                        placeholder="Testo libero..."
                        value={field.value}
                        onChange={(e) => updateCustomField(index, "value", e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCustomField(index)}
                      className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 mb-0 flex-shrink-0 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="border-t border-border pt-4">
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
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      className="w-12 h-10 text-sm font-medium text-center bg-background border-border"
                      value={step.day === 0 ? "" : step.day}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d+$/.test(val)) {
                          const newDay = val === "" ? 0 : parseInt(val) || 0;
                          updateProtocolStep(originalIndex, "day", newDay);
                        }
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <Label className="text-xs font-medium text-foreground">Attività</Label>
                    <Input
                      className="h-10 bg-background border-border text-sm"
                      autoComplete="off"
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
