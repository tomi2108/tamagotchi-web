import { useCallback, useEffect, useState } from "react";
import { Heart, Moon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { adoptPet, getPetState, type PetState } from "@/api/state";

const stats = [
  { key: "energy", label: "Energía", initial: "E" },
  { key: "hunger", label: "Hambre", initial: "H" },
  { key: "hydration", label: "Hidratación", initial: "A" },
  { key: "cleanliness", label: "Limpieza", initial: "L" },
  { key: "happiness", label: "Felicidad", initial: "F" },
] as const;

export default function PetPage() {
  const [pet, setPet] = useState<PetState | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [adopting, setAdopting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPet = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setPet(await getPetState());
    } catch {
      setError("No se pudo cargar tu mascota. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPet();
  }, [loadPet]);

  async function handleAdopt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const petName = name.trim();
    if (!petName || adopting) return;

    setAdopting(true);
    setError(null);

    try {
      await adoptPet(petName);
      setName("");
      await loadPet();
    } catch {
      setError("No se pudo adoptar una mascota. Intentá nuevamente.");
    } finally {
      setAdopting(false);
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
        <Button variant="outline" onClick={() => void loadPet()}>
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
            <div className="mb-2 flex size-16 items-center justify-center rounded-full bg-muted">
              <Heart className="size-8" strokeWidth={1.5} />
            </div>
            <CardTitle className="text-2xl">Adoptá un nuevo compañero</CardTitle>
            <p className="text-sm text-muted-foreground">
              Hay un pequeño amigo esperándote. ¿Qué nombre le vas a poner?
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleAdopt} className="space-y-4">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nombre de tu mascota"
                maxLength={40}
                required
                autoFocus
              />

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={adopting || !name.trim()}>
                {adopting ? "Adoptando..." : "Adoptar mascota"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{pet.name}</h1>
          <p className="mt-1 text-muted-foreground">
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
          onClick={() => void loadPet()}
          aria-label="Actualizar estado de la mascota"
        >
          <RefreshCw className="size-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 p-8">
          {pet.status === "sleeping" && !pet.is_dead && (
            <span className="text-lg tracking-[0.3em]">z z z</span>
          )}

          <Heart className="size-16" strokeWidth={1.25} />

          {pet.status === "sleeping" && !pet.is_dead && (
            <Moon className="size-4 text-muted-foreground" />
          )}

          <p className="text-sm text-muted-foreground">
            {pet.is_dead
              ? "Tu mascota ha fallecido."
              : pet.status === "sleeping"
                ? "¡Que tenga dulces sueños!"
                : "¿Listos para pasar tiempo juntos?"}
          </p>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Estado de tu mascota</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map(({ key, label, initial }) => {
            const value = pet[key];
            const percentage = Math.max(0, Math.min(100, value));

            return (
              <Card key={key}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">
                      <span className="mr-2 font-semibold text-foreground">{initial}</span>
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
    </div>
  );
}
