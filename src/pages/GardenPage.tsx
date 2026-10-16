import { useCallback, useEffect, useState } from "react";
import { Sprout, Clock3, Shovel, LoaderCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getGarden, harvestPlant, plantSeed, type GardenPlot } from "@/api/garden";
import { getInventory, type Item } from "@/api/inventory";
import { formatRemaining } from "@/lib/format";

export default function GardenPage() {
  const [plots, setPlots] = useState<GardenPlot[]>([]);
  const [seeds, setSeeds] = useState<Item[]>([]);
  const [selectedSeeds, setSelectedSeeds] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [busyPlot, setBusyPlot] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const refresh = useCallback(async () => {
    const [garden, inventory] = await Promise.all([getGarden(), getInventory()]);
    setPlots(garden);
    setSeeds(inventory.filter((item) => item.type === "seed"));
  }, []);

  useEffect(() => {
    refresh()
      .catch(() => setError("No se pudo cargar la huerta."))
      .finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  async function handlePlant(plotNumber: number) {
    const seedCode = selectedSeeds[plotNumber];

    if (!seedCode) return;

    setBusyPlot(plotNumber);
    setError(null);

    try {
      await plantSeed(plotNumber, seedCode);
      await refresh();
    } catch {
      setError("No se pudo plantar. Revisá la parcela y tu inventario.");
    } finally {
      setBusyPlot(null);
    }
  }

  async function handleHarvest(plotNumber: number) {
    setBusyPlot(plotNumber);
    setError(null);

    try {
      await harvestPlant(plotNumber);
      await refresh();
    } catch {
      setError("No se pudo cosechar. La planta puede no estar lista.");
    } finally {
      setBusyPlot(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <LoaderCircle className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="font-pixel text-xl text-primary">Nuestra huerta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cultivemos juntos algo rico para nuestra mascota.
        </p>
      </header>

      <Card>
        <CardContent className="flex items-center gap-4 py-5">
          <Sprout className="size-10 shrink-0 text-primary" />
          <div>
            <h2 className="font-pixel text-sm">Un pequeño huerto compartido</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Plantá semillas, esperá a que crezcan y cosechá sus frutos.
            </p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <section className="space-y-3">
        <h2 className="font-pixel text-sm">Nuestras parcelas</h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {plots.map((plot) => {
            const occupied = plot.seed_code !== null;
            const ready =
              occupied && plot.ready_at !== null && new Date(plot.ready_at).getTime() <= now;
            const busy = busyPlot === plot.plot_number;

            return (
              <Card key={plot.plot_number} className={occupied ? "" : "border-dashed"}>
                <CardContent className="flex min-h-52 flex-col items-center gap-3 p-4 text-center">
                  <div
                    className={`flex size-12 items-center justify-center rounded-xl ${occupied ? "bg-primary/10" : "bg-amber-900/10"
                      }`}
                  >
                    <Sprout className={`size-6 ${occupied ? "text-primary" : "text-amber-800"}`} />
                  </div>

                  <span className="text-sm font-medium">Parcela {plot.plot_number}</span>

                  {occupied ? (
                    <>
                      <span className="text-sm">{plot.seed_name}</span>

                      {ready ? (
                        <Button
                          size="sm"
                          className="w-full"
                          disabled={busy}
                          onClick={() => handleHarvest(plot.plot_number)}
                        >
                          {busy ? <LoaderCircle className="animate-spin" /> : <Shovel />}
                          Cosechar
                        </Button>
                      ) : (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock3 className="size-3" />
                          {plot.ready_at ? formatRemaining(plot.ready_at, now) : "Creciendo..."}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-muted-foreground">Parcela vacía</span>
                      {seeds.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          No tenés semillas disponibles.
                        </p>
                      )}
                      <select
                        aria-label={`Semilla para parcela ${plot.plot_number}`}
                        className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                        value={selectedSeeds[plot.plot_number] ?? ""}
                        onChange={(event) =>
                          setSelectedSeeds((current) => ({
                            ...current,
                            [plot.plot_number]: event.target.value,
                          }))
                        }
                      >
                        <option value="">Elegir semilla</option>
                        {seeds.map((seed) => (
                          <option key={seed.id} value={seed.code}>
                            {seed.name} × {seed.quantity}
                          </option>
                        ))}
                      </select>

                      <Button
                        size="sm"
                        className="w-full"
                        disabled={busy || !selectedSeeds[plot.plot_number] || seeds.length === 0}
                        onClick={() => handlePlant(plot.plot_number)}
                      >
                        {busy ? <LoaderCircle className="animate-spin" /> : <Sprout />}
                        Plantar
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
