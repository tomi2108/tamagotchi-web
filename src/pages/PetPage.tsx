import { useEffect, useState } from "react";
import {
  BatteryCharging,
  Cat,
  Dog,
  Droplet,
  Gamepad2,
  Moon,
  Rabbit,
  RefreshCw,
  Sparkles,
  SprayCan,
  Drumstick,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getSpecies, type PetSpecies } from "@/api/species";
import { usePet } from "@/components/PetContext";
import { useNavigate } from "react-router-dom";

const stats = [
  { key: "energy", label: "Energía", icon: BatteryCharging },
  { key: "hunger", label: "Hambre", icon: Drumstick },
  { key: "hydration", label: "Hidratación", icon: Droplet },
  { key: "happiness", label: "Felicidad", icon: Sparkles },
  { key: "cleanliness", label: "Limpieza", icon: SprayCan },
] as const;

const speciesIcons = {
  cat: Cat,
  dog: Dog,
  rabbit: Rabbit,
} as const;

export default function PetPage() {
  const navigate = useNavigate();
  const { pet, loading, error, loadPet } = usePet();
  const [species, setSpecies] = useState<PetSpecies[]>([]);
  const [speciesError, setSpeciesError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getSpecies()
      .then((result) => {
        if (!cancelled) setSpecies(result);
      })
      .catch(() => {
        if (!cancelled) {
          setSpeciesError("No se pudieron cargar las especies.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRefresh() {
    if (refreshing) return;

    setRefreshing(true);

    try {
      await loadPet();
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-muted-foreground">Cargando mascota...</p>
      </div>
    );
  }

  if (error && pet === null) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-12 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" onClick={() => void handleRefresh()}>
          <RefreshCw className="mr-2 size-4" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (pet === null) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold">Todavía no tenés una mascota</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Adoptá un compañero para empezar vuestra aventura.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const petSpecies = species.find((item) => item.id === pet.species);
  const SpeciesIcon =
    speciesIcons[pet.species as keyof typeof speciesIcons] ?? Cat;

  const status = pet.is_dead
    ? "Descansa en paz"
    : pet.status === "sleeping"
      ? "Durmiendo plácidamente"
      : "Tu pequeño compañero";

  return (
    <main className="mx-auto max-w-[1600px] space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Mi mascota
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            ¡Hola! Soy {pet.name}
          </h1>
          <p className="mt-2 text-base text-muted-foreground sm:text-lg">
            Un poquito de cuidado hace una gran diferencia.
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => void handleRefresh()}
          disabled={refreshing}
          aria-label="Actualizar estado de la mascota"
          className="shrink-0"
        >
          <RefreshCw
            className={`size - 4 ${refreshing ? "animate-spin" : ""} `}
          />
        </Button>
      </header>

      <div className="grid items-stretch gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Escenario de la mascota */}
        <Card className="overflow-hidden rounded-3xl border-border/70 bg-gradient-to-b from-sky-100 via-emerald-50 to-green-200 dark:from-slate-800 dark:via-slate-800 dark:to-emerald-950">
          <CardContent className="relative flex min-h-[480px] flex-col items-center justify-center overflow-hidden p-6 sm:min-h-[620px]">
            {/* Ventana decorativa */}
            <div className="absolute left-8 top-8 flex size-28 items-center justify-center rounded-t-full border-[8px] border-amber-50 bg-sky-200 shadow-md sm:left-12 sm:top-12 sm:size-36">
              <div className="absolute inset-y-0 left-1/2 w-1 bg-amber-50" />
              <div className="absolute bottom-0 left-0 h-1/3 w-full rounded-t-full bg-green-600/60" />
            </div>

            {/* Planta decorativa */}
            <div className="absolute right-10 top-24 flex flex-col items-center sm:right-16 sm:top-28">
              <div className="relative h-16 w-20">
                <span className="absolute left-2 top-1 h-10 w-5 -rotate-45 rounded-t-full bg-green-700/70" />
                <span className="absolute right-2 top-5 h-10 w-5 rotate-45 rounded-t-full bg-green-800/70" />
              </div>
              <div className="h-0 w-0 border-x-[30px] border-b-[65px] border-x-transparent border-b-amber-700/70" />
            </div>

            {/* Nube */}
            <div className="absolute right-[24%] top-20 size-20 rounded-full bg-white/60 blur-md" />

            {/* Mensaje */}
            <div className="absolute right-5 top-8 max-w-48 rounded-2xl rounded-bl-sm border border-border/60 bg-card/95 px-4 py-3 text-sm font-medium shadow-sm sm:right-8 sm:top-12">
              {pet.is_dead
                ? "Siempre te recordaremos."
                : pet.status === "sleeping"
                  ? "Zzz... ¡dulces sueños!"
                  : "¡Hoy puede ser un gran día!"}
            </div>

            {/* Representación temporal: no necesita sprite */}
            <div className="relative z-10 mt-24 flex flex-col items-center">
              <div className="relative flex size-40 items-center justify-center rounded-full border-4 border-foreground/50 bg-card/60 shadow-xl sm:size-52">
                <SpeciesIcon
                  className="size-24 text-foreground/80 sm:size-32"
                  strokeWidth={1}
                />
                {pet.status === "sleeping" && !pet.is_dead && (
                  <Moon className="absolute -right-2 top-2 size-8 text-indigo-500" />
                )}
              </div>

              <p className="mt-5 text-xl font-bold text-foreground">
                {pet.name}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {petSpecies?.name ?? pet.species} · {status}
              </p>
            </div>

            {/* Suelo decorativo */}
            <div className="absolute inset-x-0 bottom-0 h-[22%] border-t-4 border-green-700/20 bg-green-700/30" />
            <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-border/60 bg-card/90 px-4 py-2 text-sm font-medium shadow-sm">
              <span
                className={`size - 2 rounded - full ${
                  pet.is_dead
                    ? "bg-muted-foreground"
                    : pet.status === "sleeping"
                      ? "bg-indigo-400"
                      : "bg-green-500"
                } `}
              />
              {pet.is_dead
                ? "En el cementerio"
                : pet.status === "sleeping"
                  ? "Durmiendo"
                  : "Feliz de verte"}
            </div>
          </CardContent>
        </Card>

        {/* Estado y juego */}
        <Card className="rounded-3xl border-border/70 bg-card/90">
          <CardContent className="flex h-full flex-col p-6 sm:p-8">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <h2 className="mt-3 text-xl font-bold sm:text-2xl">
                  ¿Cómo está {pet.name}?
                </h2>
              </div>
              <span className="rounded-2xl bg-primary/10 px-4 py-3 text-lg font-bold tabular-nums text-primary">
                {Math.round(
                  stats.reduce((sum, stat) => sum + pet[stat.key], 0) /
                    stats.length,
                )}
                %
              </span>
            </div>

            <div className="space-y-5">
              {stats.map(({ key, label, icon: Icon }) => {
                const percentage = Math.max(0, Math.min(100, pet[key]));

                const quality =
                  percentage >= 75
                    ? "Muy bien"
                    : percentage >= 45
                      ? "Regular"
                      : "Necesita atención";

                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                      <Icon className="size-5 text-primary" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{label}</span>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(percentage)}% · {quality}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto pt-10">
              <Button
                className="h-16 w-full rounded-2xl text-base font-semibold"
                onClick={() => {
                  navigate("/games");
                }}
                disabled={pet.is_dead}
              >
                <Gamepad2 className="mr-2 size-5" />
                Jugar con {pet.name}
              </Button>

              {pet.is_dead && (
                <p className="mt-3 text-center text-sm text-muted-foreground">
                  No podés jugar con una mascota fallecida.
                </p>
              )}

              {speciesError && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  {speciesError}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
