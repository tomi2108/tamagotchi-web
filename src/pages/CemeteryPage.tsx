import { Flower2, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CemeteryPage() {
  // TODO: Obtener las mascotas fallecidas desde la API.
  const pets: { id: number; name: string; diedAt: string }[] = [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="font-pixel text-xl text-primary">Cementerio</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Un lugar para recordar a quienes siempre serán parte de nuestra historia.
        </p>
      </header>

      {pets.length === 0 ? (
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
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <Card key={pet.id}>
              <CardHeader>
                <CardTitle>{pet.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Falleció el {new Date(pet.diedAt).toLocaleDateString("es-AR")}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
