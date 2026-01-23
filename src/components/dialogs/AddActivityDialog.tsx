import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (activity: {
    title: string;
    description?: string;
    date: Date;
    type: "one-time" | "recurring";
    recurrence?: "daily" | "weekly" | "monthly" | "quarterly" | "semiannual" | "annual" | "none";
    completed: boolean;
  }) => void;
  selectedDate?: Date;
}

export function AddActivityDialog({
  open,
  onOpenChange,
  onAdd,
  selectedDate = new Date(),
}: AddActivityDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(format(selectedDate, "yyyy-MM-dd"));
  const [recurrence, setRecurrence] = useState<"daily" | "weekly" | "monthly" | "quarterly" | "semiannual" | "annual" | "none">("none");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate(format(selectedDate, "yyyy-MM-dd"));
    setRecurrence("none");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Inserisci il titolo dell'attività");
      return;
    }

    const type = recurrence === "none" ? "one-time" : "recurring";
    const finalRecurrence = recurrence === "none" ? undefined : recurrence;

    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      date: new Date(date),
      type,
      recurrence: finalRecurrence,
      completed: false,
    });

    toast.success("Attività aggiunta con successo!");
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Nuova Attività</DialogTitle>
          <DialogDescription>
            Aggiungi una nuova attività o promemoria.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Titolo */}
          <div className="space-y-2">
            <Label htmlFor="title">Titolo Attività</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="es. Controllo temperature celle"
            />
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="activityDate">Data</Label>
            <Input
              id="activityDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Ricorrenza */}
          <div className="space-y-2">
            <Label>Ricorrenza</Label>
            <Select
              value={recurrence}
              onValueChange={(value: "daily" | "weekly" | "monthly" | "quarterly" | "semiannual" | "annual" | "none") => setRecurrence(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nessuna ricorrenza</SelectItem>
                <SelectItem value="daily">Giornaliera</SelectItem>
                <SelectItem value="weekly">Settimanale</SelectItem>
                <SelectItem value="monthly">Mensile</SelectItem>
                <SelectItem value="quarterly">Trimestrale</SelectItem>
                <SelectItem value="semiannual">Semestrale</SelectItem>
                <SelectItem value="annual">Annuale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Descrizione */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrizione (opzionale)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dettagli aggiuntivi su questa attività..."
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
            <Button type="submit">Aggiungi Attività</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
