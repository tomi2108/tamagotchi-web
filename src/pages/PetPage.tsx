import { useEffect, useState } from "react";
import {
  BatteryCharging,
  Cat,
  Dog,
  Drumstick,
  Droplet,
  Moon,
  Rabbit,
  RefreshCw,
  Sparkles,
  SprayCan,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getSpecies, type PetSpecies } from "@/api/species";
import { usePet } from "@/components/PetContext";

const stats = [
  { key: "energy", label: "Energía", icon: BatteryCharging },
  { key: "hunger", label: "Hambre", icon: Drumstick },
  { key: "hydration", label: "Hidratación", icon: Droplet },
  { key: "cleanliness", label: "Limpieza", icon: SprayCan },
  { key: "happiness", label: "Felicidad", icon: Sparkles },
] as const;

const speciesIcons = {
  cat: Cat,
  dog: Dog,
  rabbit: Rabbit,
} as const;

export default function PetPage() {
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
          <CardHeader className="items-center text-center">
            <CardTitle className="text-2xl">Todavía no tenés una mascota</CardTitle>
            <p className="text-sm text-muted-foreground">
              Adoptá un compañero para empezar vuestra aventura.
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const petSpecies = species.find((item) => item.id === pet.species);
  const SpeciesIcon = speciesIcons[pet.species];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{pet.name}</h1>
          <p className="mt-1 text-muted-foreground">
            {petSpecies?.name ?? pet.species} ·{" "}
            {pet.is_dead
              ? "Descansa en paz"
              : pet.status === "sleeping"
                ? "Durmiendo plácidamente"
                : "Tu pequeño compañero"}
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => void handleRefresh()}
          disabled={refreshing}
          aria-label="Actualizar estado de la mascota"
        >
          <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <Card>
        <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 p-8">
          {pet.status === "sleeping" && !pet.is_dead && (
            <span className="text-lg tracking-[0.3em]">z z z</span>
          )}

          <SpeciesIcon className="size-16" strokeWidth={1.25} />

          {pet.status === "sleeping" && !pet.is_dead && (
            <Moon className="size-4 text-muted-foreground" />
          )}

          <p className="text-center text-sm text-muted-foreground">
            {pet.is_dead
              ? "Tu mascota ha fallecido."
              : pet.status === "sleeping"
                ? "¡Que tenga dulces sueños!"
                : (petSpecies?.description ?? speciesError ?? "¿Listos para pasar tiempo juntos?")}
          </p>
        </CardContent>
      </Card>

      {!pet.is_dead && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Estado de tu mascota</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map(({ key, label, icon: Icon }) => {
              const percentage = Math.max(0, Math.min(100, pet[key]));

              return (
                <Card key={key}>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon className="size-4 text-primary" />
                        {label}
                      </span>

                      <span className="text-sm font-medium tabular-nums">
                        {Math.round(percentage)}%
                      </span>
                    </div>

                    <Progress value={percentage} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
