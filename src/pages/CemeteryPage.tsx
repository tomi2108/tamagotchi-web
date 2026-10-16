import { useCallback, useEffect, useState } from "react";
import { Flower2, Heart, RefreshCw } from "lucide-react";
import { getCemetery, type CemeteryPet } from "@/api/cemetery";
import Tombstone from "@/components/Tombstone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CemeteryPage() {
  const [pets, setPets] = useState<CemeteryPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCemetery = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setPets(await getCemetery());
    } catch {
      setError("No se pudo cargar el cementerio. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCemetery();
  }, [loadCemetery]);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-muted-foreground">Cargando cementerio...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-pixel text-xl text-primary">Cementerio</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Un lugar para recordar a quienes siempre serán parte de nuestra historia.
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => void loadCemetery()}
          aria-label="Actualizar cementerio"
        >
          <RefreshCw className="size-4" />
        </Button>
      </header>

      {error && (
        <div className="space-y-3">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" onClick={() => void loadCemetery()}>
            Reintentar
          </Button>
        </div>
      )}

      {!error && pets.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <Flower2 className="size-8 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <h2 className="font-pixel text-sm">Un jardín en calma</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Todavía no hay mascotas en el cementerio. Acá vamos a guardar los recuerdos de
                nuestros pequeños compañeros.
              </p>
            </div>

            <Heart className="size-5 text-primary" />
          </CardContent>
        </Card>
      )}

      {!error && pets.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground">
            {pets.length} {pets.length === 1 ? "recuerdo" : "recuerdos"}
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <Tombstone key={pet.id} name={pet.name} dead_at={pet.dead_at} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
