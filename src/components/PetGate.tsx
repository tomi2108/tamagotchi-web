import { useEffect, useState, type ReactNode } from "react";
import { Cat, Dog, Heart, Rabbit, Sprout } from "lucide-react";
import { adoptPet } from "@/api/state";
import { getSpecies, type PetSpecies } from "@/api/species";
import { usePet } from "@/components/PetContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Step = "farewell" | "species" | "name";

const speciesIcons = {
  cat: Cat,
  dog: Dog,
  rabbit: Rabbit,
} as const;

const deathCauses = [
  "Se quedó esperando que le llenaran el plato. El plato sigue vacío.",
  "Tenía hambre. Sus cuidadores estaban ocupados mirando otra pantalla.",
  "Se aburrió tanto que empezó a reconsiderar todas sus decisiones.",
  "La falta de cariño alcanzó niveles que ni el veterinario pudo explicar.",
  "Murió de viejo. Al menos esta vez no podemos culpar al botón de posponer.",
  "Un desafortunado incidente relacionado con la administración del inventario.",
  "Esperó que alguien se acordara de cuidarlo. Esperó demasiado.",
];

function formatDeathDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Fecha desconocida";
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(parsedDate);
}

export default function PetGate({ children }: { children: ReactNode }) {
  const { pet, loading, error, loadPet, setPetError } = usePet();

  const [step, setStep] = useState<Step>("species");
  const [speciesOptions, setSpeciesOptions] = useState<PetSpecies[]>([]);
  const [species, setSpecies] = useState<PetSpecies["id"] | null>(null);
  const [name, setName] = useState("");
  const [loadingSpecies, setLoadingSpecies] = useState(true);
  const [adopting, setAdopting] = useState(false);
  const [speciesError, setSpeciesError] = useState<string | null>(null);
  const [deathCause] = useState(
    () => deathCauses[Math.floor(Math.random() * deathCauses.length)],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadSpecies() {
      setLoadingSpecies(true);
      setSpeciesError(null);

      try {
        const result = await getSpecies();

        if (cancelled) return;

        setSpeciesOptions(result);
        setSpecies((current) =>
          current && result.some((item) => item.id === current)
            ? current
            : null,
        );
      } catch {
        if (!cancelled) {
          setSpeciesError("No se pudieron cargar las especies.");
        }
      } finally {
        if (!cancelled) setLoadingSpecies(false);
      }
    }

    void loadSpecies();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    if (pet?.is_dead) {
      setStep("farewell");
    }
  }, [loading, pet?.is_dead]);

  async function handleAdopt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const petName = name.trim();

    if (!petName || !species || adopting) return;

    if (!speciesOptions.some((item) => item.id === species)) {
      setSpeciesError("La especie seleccionada ya no está disponible.");
      setStep("species");
      return;
    }

    setAdopting(true);
    setPetError(null);

    try {
      await adoptPet(petName, species);
      await loadPet();
    } catch {
      setPetError("No pudimos adoptar a tu nueva mascota. Intentá de nuevo.");
    } finally {
      setAdopting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Heart className="size-10 animate-pulse text-primary" />
          <p className="font-pixel text-xs text-primary">
            Buscando a tu compañero...
          </p>
        </div>
      </div>
    );
  }

  if (error && pet === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <Heart className="size-10 text-destructive" />
        <p role="alert" className="text-center text-sm text-muted-foreground">
          {error}
        </p>
        <Button variant="outline" onClick={() => void loadPet()}>
          <span className="mr-2">↻</span>
          Intentar de nuevo
        </Button>
      </div>
    );
  }

  if (pet && !pet.is_dead) {
    return <>{children}</>;
  }

  const selectedSpecies = speciesOptions.find((item) => item.id === species);
  const SelectedIcon = species ? speciesIcons[species] : Heart;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <Card className="w-full max-w-lg overflow-hidden border-2 border-primary/40 shadow-lg">
        <div className="h-2 bg-primary" />

        {step === "farewell" && (
          <>
            <CardHeader className="items-center space-y-4 pb-4 text-center">
              <div className="flex size-24 items-center justify-center rounded-2xl border-2 border-primary/40 bg-primary/10">
                <Heart className="size-12 text-primary" />
              </div>

              <p className="font-pixel text-[10px] uppercase tracking-widest text-muted-foreground">
                Un último recuerdo
              </p>

              <CardTitle className="font-pixel text-lg leading-relaxed text-primary">
                Gracias por estos momentos
              </CardTitle>

              <CardDescription className="text-sm leading-relaxed">
                {pet
                  ? `${pet.name} fue parte de esta pequeña aventura. Aunque ya no esté, los momentos compartidos quedan en el recuerdo.`
                  : "Nuestra pequeña aventura tuvo una pausa. Es momento de comenzar una nueva."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pb-6">
              <div className="space-y-3 rounded-xl border bg-muted/40 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Nombre</p>
                  <p className="font-pixel text-sm">
                    {pet?.name ?? "Compañero desconocido"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Fecha de fallecimiento
                  </p>
                  <p className="text-sm">
                    {pet?.dead_at
                      ? formatDeathDate(pet.dead_at)
                      : "Fecha desconocida"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Posible causa</p>
                  <p className="text-sm leading-relaxed">{deathCause}</p>
                </div>
              </div>

              <Button className="w-full" onClick={() => setStep("species")}>
                Comenzar una nueva aventura
                <Sprout className="ml-2 size-4" />
              </Button>
            </CardContent>
          </>
        )}

        {step === "species" && (
          <>
            <CardHeader className="items-center space-y-4 pb-4 text-center">
              <div className="flex size-20 items-center justify-center rounded-2xl border-2 border-primary/40 bg-primary/10">
                <Heart className="size-10 text-primary" />
              </div>

              <p className="font-pixel text-[10px] uppercase tracking-widest text-muted-foreground">
                Nueva aventura · 1 de 2
              </p>

              <CardTitle className="font-pixel text-lg text-primary">
                Elegí a tu compañero
              </CardTitle>

              <CardDescription>
                Cada aventura empieza con una nueva amistad.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pb-6">
              {loadingSpecies ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Cargando especies...
                </p>
              ) : speciesError ? (
                <div className="space-y-3 text-center">
                  <p role="alert" className="text-sm text-destructive">
                    {speciesError}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setLoadingSpecies(true);
                      setSpeciesError(null);
                      void getSpecies()
                        .then(setSpeciesOptions)
                        .catch(() =>
                          setSpeciesError(
                            "No se pudieron cargar las especies.",
                          ),
                        )
                        .finally(() => setLoadingSpecies(false));
                    }}
                  >
                    Intentar de nuevo
                  </Button>
                </div>
              ) : speciesOptions.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">
                  No hay especies disponibles.
                </p>
              ) : (
                speciesOptions.map((option) => {
                  const Icon = speciesIcons[option.id];

                  return (
                    <Button
                      key={option.id}
                      type="button"
                      variant="outline"
                      className={`group h-auto w-full justify-start gap-4 border-2 py-4 ${
                        species === option.id
                          ? "border-primary bg-primary/10"
                          : "hover:border-primary hover:bg-primary/5"
                      }`}
                      onClick={() => setSpecies(option.id)}
                    >
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="size-6 text-primary" />
                      </span>

                      <span className="flex min-w-0 flex-1 flex-col items-start gap-1 whitespace-normal text-left">
                        <span className="font-pixel text-xs">
                          {option.name}
                        </span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {option.description}
                        </span>
                      </span>

                      {species === option.id && (
                        <Heart className="size-4 shrink-0 text-primary" />
                      )}
                    </Button>
                  );
                })
              )}

              <Button
                className="w-full"
                disabled={loadingSpecies || !!speciesError || !species}
                onClick={() => setStep("name")}
              >
                Continuar
              </Button>
            </CardContent>
          </>
        )}

        {step === "name" && (
          <>
            <CardHeader className="items-center space-y-4 pb-4 text-center">
              <div className="flex size-20 items-center justify-center rounded-2xl border-2 border-primary/40 bg-primary/10">
                <SelectedIcon className="size-10 text-primary" />
              </div>

              <p className="font-pixel text-[10px] uppercase tracking-widest text-muted-foreground">
                Nueva aventura · 2 de 2
              </p>

              <CardTitle className="font-pixel text-lg text-primary">
                ¿Cómo se va a llamar?
              </CardTitle>

              <CardDescription>
                {selectedSpecies
                  ? `${selectedSpecies.name}: ${selectedSpecies.description}`
                  : "Elegí un nombre para tu nuevo compañero."}
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-6">
              <form onSubmit={handleAdopt} className="space-y-4">
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Nombre de tu mascota"
                  maxLength={30}
                  required
                  autoFocus
                />

                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={adopting || !name.trim() || !species}
                >
                  {adopting ? "Adoptando..." : "Adoptar compañero"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  disabled={adopting}
                  onClick={() => setStep("species")}
                >
                  Volver a elegir
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </main>
  );
}
