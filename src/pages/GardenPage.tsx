import { Sprout, Droplets, LockKeyhole } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const plots = Array.from({ length: 6 }, (_, index) => index + 1);

export default function GardenPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="font-pixel text-xl text-primary">Nuestra huerta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cultivemos juntos algo rico para nuestra mascota.
        </p>
      </header>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <Sprout className="size-10 text-primary" />
          <h2 className="font-pixel text-sm">Todo empieza con una semilla</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Pronto vamos a poder plantar, regar y cosechar comida para nuestra mascota. Mientras
            tanto, preparemos la tierra.
          </p>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="font-pixel text-sm">Nuestras parcelas</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {plots.map((plot) => (
            <Card key={plot} className="border-dashed">
              <CardContent className="flex min-h-32 flex-col items-center justify-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-amber-900/10">
                  <Sprout className="size-6 text-amber-800" />
                </div>
                <span className="text-sm font-medium">Parcela {plot}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <LockKeyhole className="size-3" />
                  Próximamente
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Droplets className="size-4" />
        Cada planta tendrá sus propios cuidados.
      </p>
    </div>
  );
}
