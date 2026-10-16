import { useState } from "react";
import {
  Apple,
  Carrot,
  Cherry,
  Flower2,
  Grape,
  Leaf,
  LoaderCircle,
  Sprout,
  Wheat,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Item } from "@/api/inventory";

interface SeedPickerDialogProps {
  open: boolean;
  plotNumber: number | null;
  seeds: Item[];
  busy: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (seedCode: string) => void;
}

function getSeedIcon(seed: Item): LucideIcon {
  const value = `${seed.code} ${seed.name} `.toLowerCase();

  if (value.includes("strawberry") || value.includes("frutilla")) {
    return Cherry;
  }

  if (value.includes("pumpkin") || value.includes("calabaza")) {
    return Apple;
  }

  if (value.includes("tomato") || value.includes("tomate")) {
    return Apple;
  }

  if (value.includes("carrot") || value.includes("zanahoria")) {
    return Carrot;
  }

  if (value.includes("flower") || value.includes("flor")) {
    return Flower2;
  }

  if (value.includes("grape") || value.includes("uva")) {
    return Grape;
  }

  if (value.includes("wheat") || value.includes("trigo")) {
    return Wheat;
  }

  return Leaf;
}

export default function SeedPickerDialog({
  open,
  plotNumber,
  seeds,
  busy,
  onOpenChange,
  onConfirm,
}: SeedPickerDialogProps) {
  const [selectedSeedCode, setSelectedSeedCode] = useState<string | null>(null);

  function handleOpenChange(nextOpen: boolean) {
    if (busy) return;

    if (!nextOpen) {
      setSelectedSeedCode(null);
    }

    onOpenChange(nextOpen);
  }

  function handleConfirm() {
    if (!selectedSeedCode || busy) return;

    onConfirm(selectedSeedCode);
  }

  const selectedSeed = seeds.find((seed) => seed.code === selectedSeedCode);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-pixel text-base">Elegí qué plantar</DialogTitle>
          <DialogDescription>
            Seleccioná una semilla para la parcela {plotNumber}.
          </DialogDescription>
        </DialogHeader>

        {seeds.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No tenés semillas disponibles.
          </p>
        ) : (
          <div className="grid max-h-[50vh] grid-cols-2 gap-3 overflow-y-auto p-1">
            {seeds.map((seed) => {
              const selected = selectedSeedCode === seed.code;
              const SeedIcon = getSeedIcon(seed);

              return (
                <button
                  key={seed.id}
                  type="button"
                  disabled={seed.quantity <= 0 || busy}
                  onClick={() => setSelectedSeedCode(seed.code)}
                  className={`flex flex - col items - center gap - 2 rounded - xl border p - 4 text - center transition - colors ${selected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                      : "border-border bg-card hover:border-primary/50 hover:bg-accent"
                    } disabled: cursor - not - allowed disabled: opacity - 50`}
                >
                  <div className="flex size-16 items-center justify-center rounded-xl bg-primary/10">
                    <SeedIcon className="size-9 text-primary" strokeWidth={1.5} />
                  </div>

                  <span className="text-sm font-medium">{seed.name}</span>

                  <span className="text-xs text-muted-foreground">
                    Disponibles: {seed.quantity}
                  </span>

                  {selected && (
                    <span className="text-xs font-medium text-primary">Seleccionada</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            disabled={busy}
            onClick={() => handleOpenChange(false)}
          >
            <X />
            Cancelar
          </Button>

          <Button className="flex-1" disabled={!selectedSeed || busy} onClick={handleConfirm}>
            {busy ? <LoaderCircle className="animate-spin" /> : <Sprout />}
            Plantar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
