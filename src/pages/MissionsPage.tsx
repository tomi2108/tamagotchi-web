import { CheckCircle2, Coins, ListChecks, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const missions = [
  {
    id: 1,
    title: "Revisar a tu mascota",
    description: "Pasá a ver cómo está tu pequeño compañero.",
    reward: 5,
  },
  {
    id: 2,
    title: "Compartir un momento",
    description: "Dediquen un ratito a estar juntos.",
    reward: 10,
  },
  {
    id: 3,
    title: "Mantener todo en orden",
    description: "Revisá el inventario y prepará lo que necesite.",
    reward: 5,
  },
];

export default function MissionsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-pixel text-xl text-primary">Misiones diarias</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pequeños objetivos para cuidar juntos a nuestra mascota.
        </p>
      </header>

      <Card>
        <CardContent className="flex items-center gap-4 py-5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Target className="size-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-pixel text-sm">Las misiones de hoy</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Completá objetivos para ganar monedas.
            </p>
          </div>
          <Badge variant="secondary">0 / {missions.length}</Badge>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="font-pixel text-sm">Objetivos</h2>

        {missions.map((mission) => (
          <Card key={mission.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <ListChecks className="mt-1 size-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1 space-y-1">
                  <CardTitle className="text-base">{mission.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{mission.description}</p>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-sm">
                  <Coins className="size-4 text-amber-500" />
                  {mission.reward}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="size-4" />
                Disponible próximamente
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Las misiones y sus recompensas todavía son de ejemplo.
      </p>
    </div>
  );
}
