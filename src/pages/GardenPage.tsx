import { useCallback, useEffect, useState } from "react";
import {
  Apple,
  Carrot,
  Cherry,
  Clock3,
  Flower2,
  Grape,
  Leaf,
  LoaderCircle,
  Shovel,
  Sprout,
  Wheat,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  getGarden,
  harvestPlant,
  plantSeed,
  type GardenPlot,
} from "@/api/garden";
import { getInventory, type Item } from "@/api/inventory";
import { formatRemaining } from "@/lib/format";

function getSeedIcon(code: string, name: string) {
  const value = `${code} ${name} `.toLowerCase();

  if (value.includes("strawberry") || value.includes("frutilla")) {
    return Cherry;
  }
  if (value.includes("carrot") || value.includes("zanahoria")) {
    return Carrot;
  }
  if (
    value.includes("pumpkin") ||
    value.includes("calabaza") ||
    value.includes("tomato") ||
    value.includes("tomate")
  ) {
    return Apple;
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

export default function GardenPage() {
  const [plots, setPlots] = useState<GardenPlot[]>([]);
  const [seeds, setSeeds] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyPlot, setBusyPlot] = useState<number | null>(null);
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const refresh = useCallback(async () => {
    const [garden, inventory] = await Promise.all([
      getGarden(),
      getInventory(),
    ]);

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

  async function handlePlant(plotNumber: number, seedCode: string) {
    if (busyPlot !== null) return;

    setBusyPlot(plotNumber);
    setError(null);

    try {
      await plantSeed(plotNumber, seedCode);
      setSelectedSeed(null);
      await refresh();
    } catch {
      setError("No se pudo plantar.");
    } finally {
      setBusyPlot(null);
    }
  }

  async function handleHarvest(plotNumber: number) {
    if (busyPlot !== null) return;

    setBusyPlot(plotNumber);
    setError(null);

    try {
      await harvestPlant(plotNumber);
      await refresh();
    } catch {
      setError("No se pudo cosechar.");
    } finally {
      setBusyPlot(null);
    }
  }

  function openPlot(plot: GardenPlot) {
    if (busyPlot !== null) return;

    if (plot.seed_code === null) {
      if (!selectedSeed) return;

      const seed = seeds.find(
        (item) => item.code === selectedSeed && item.quantity > 0,
      );

      if (!seed) {
        setSelectedSeed(null);
        setError("Esa semilla ya no está disponible.");
        return;
      }

      void handlePlant(plot.plot_number, seed.code);
      return;
    }

    const ready =
      plot.ready_at !== null &&
      new Date(plot.ready_at).getTime() <= now;

    if (ready) {
      void handleHarvest(plot.plot_number);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <LoaderCircle className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  const availableSeeds = seeds.filter((seed) => seed.quantity > 0);

  return (
    <main className="mx-auto max-w-[1600px] space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Jardín
        </h1>
      </header>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid items-stretch gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="rounded-3xl border-border/70 bg-card/90">
          <CardContent className="p-4 sm:p-5">
            <h2 className="mb-4 text-lg font-bold">Semillas</h2>

            <div className="max-h-[340px] space-y-2 overflow-y-auto pr-1 sm:max-h-[480px]">
              {availableSeeds.map((seed) => {
                const Icon = getSeedIcon(seed.code, seed.name);
                const selected = selectedSeed === seed.code;

                return (
                  <button
                    key={seed.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setSelectedSeed(selected ? null : seed.code);
                      setError(null);
                    }}
                    className={`flex w - full items - center gap - 4 rounded - 2xl border p - 3 text - left transition - all duration - 200 sm: p - 4 ${selected
                        ? "border-primary/60 bg-primary/10 shadow-sm ring-2 ring-primary/15"
                        : "border-transparent bg-muted/40 hover:border-primary/20 hover:bg-accent/70"
                      } `}
                  >
                    <span
                      className={`flex size - 12 shrink - 0 items - center justify - center rounded - 2xl ${selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10 text-primary"
                        } `}
                    >
                      <Icon className="size-6" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">
                        {seed.name}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        x{seed.quantity}
                      </span>
                    </span>

                    {selected && (
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Sprout className="size-4" />
                      </span>
                    )}
                  </button>
                );
              })}

              {availableSeeds.length === 0 && (
                <div className="flex flex-col items-center rounded-2xl border border-dashed border-border p-6 text-muted-foreground">
                  <Sprout className="size-7 opacity-60" />
                </div>
              )}
            </div>

            <div className="mt-5 rounded-2xl bg-emerald-500/10 p-4">
              <div className="flex items-start gap-3">
                <Sprout className="mt-0.5 size-5 shrink-0 text-emerald-700 dark:text-emerald-400" />
                <div>
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                    Consejo del día
                  </p>
                  <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-300/80">
                    Las plantas siguen creciendo aunque cierres la app.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-3xl border-border/70">
          <CardContent className="relative min-h-[520px] overflow-hidden bg-sky-200 p-0 dark:bg-slate-800 sm:min-h-[680px]">
            <div className="absolute right-10 top-10 size-20 rounded-full bg-yellow-300 shadow-[0_0_0_12px_rgba(253,224,71,0.18)]" />

            <div className="absolute inset-x-0 top-[38%] h-[62%] bg-[#91b27d] dark:bg-emerald-950" />
            <div className="absolute inset-x-0 top-[38%] h-20 bg-[#8bb77b] dark:bg-emerald-900" />

            <div className="relative z-10 grid min-h-[520px] grid-cols-2 gap-x-3 gap-y-12 px-3 pb-10 pt-32 sm:min-h-[680px] sm:grid-cols-3 sm:gap-x-5 sm:gap-y-14 sm:px-6 sm:pb-12 sm:pt-48">
              {plots.map((plot) => {
                const occupied = plot.seed_code !== null;
                const ready =
                  occupied &&
                  plot.ready_at !== null &&
                  new Date(plot.ready_at).getTime() <= now;
                const busy = busyPlot === plot.plot_number;
                const seed = seeds.find(
                  (item) => item.code === plot.seed_code,
                );
                const Icon = seed
                  ? getSeedIcon(seed.code, seed.name)
                  : Sprout;

                return (
                  <button
                    key={plot.plot_number}
                    type="button"
                    disabled={busy || (occupied && !ready)}
                    onClick={() => openPlot(plot)}
                    className="group flex min-w-0 flex-col items-center justify-self-stretch text-center disabled:cursor-default"
                    aria-label={
                      occupied
                        ? ready
                          ? `Cosechar ${plot.seed_name} `
                          : `${plot.seed_name}, creciendo`
                        : selectedSeed
                          ? "Plantar semilla"
                          : `Parcela vacía ${plot.plot_number} `
                    }
                  >
                    {(occupied || selectedSeed) && (
                      <span className="z-10 mb-[-12px] flex size-11 items-center justify-center rounded-full border border-white/50 bg-white/90 text-amber-900 shadow-md transition-transform group-hover:scale-110">
                        {busy ? (
                          <LoaderCircle className="size-5 animate-spin" />
                        ) : occupied ? (
                          <Icon className="size-5 text-green-700" />
                        ) : (
                          <span className="text-2xl leading-none">+</span>
                        )}
                      </span>
                    )}

                    <span
                      className={`flex min - h - 24 w - full flex - col items - center justify - center rounded - [2rem] border - [6px] px - 3 py - 5 text - white shadow - [inset_0_ - 7px_0_rgba(0, 0, 0, 0.12)] transition - transform sm: min - h - 28 ${occupied
                          ? "border-[#9d6848] bg-[#a97550]"
                          : "border-[#b97c51] bg-[#956442]"
                        } ${!occupied && selectedSeed
                          ? "group-hover:scale-[1.03] group-hover:brightness-110"
                          : ""
                        } `}
                    >
                      {occupied && (
                        <>
                          <span className="max-w-full truncate text-sm font-bold">
                            {plot.seed_name}
                          </span>

                          <span className="mt-2 flex min-h-4 items-center justify-center gap-1 text-xs text-white/85">
                            {ready ? (
                              <>
                                <Shovel className="size-3" />
                                Cosechar
                              </>
                            ) : (
                              <>
                                <Clock3 className="size-3 shrink-0" />
                                {plot.ready_at
                                  ? formatRemaining(plot.ready_at, now)
                                  : "Creciendo"}
                              </>
                            )}
                          </span>
                        </>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
