import { Gamepad2, LockKeyhole, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const games = [
  {
    id: "memory",
    name: "Memotest",
    description: "Encontrá los pares de dibujos iguales.",
    reward: "Monedas",
  },
  {
    id: "guess",
    name: "Adiviná el número",
    description: "Descubrí el número secreto con pocas pistas.",
    reward: "Monedas",
  },
  {
    id: "catch",
    name: "Lluvia de comida",
    description: "Juntá la comida que cae antes de que desaparezca.",
    reward: "Monedas",
  },
];

export default function GamesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="font-pixel text-xl text-primary">Sala de juegos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Jugá un rato y ganá recompensas para tu mascota.
        </p>
      </header>

      <Card>
        <CardContent className="flex items-center gap-4 py-6">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Gamepad2 className="size-6 text-primary" />
          </div>
          <div>
            <h2 className="font-pixel text-sm">¡Hora de jugar!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Estamos preparando nuevos minijuegos para que se diviertan juntos.
            </p>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="font-pixel text-sm">Minijuegos</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Card key={game.id} className="flex flex-col">
              <CardHeader>
                <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-muted">
                  <Gamepad2 className="size-6 text-primary" />
                </div>
                <CardTitle className="text-base">{game.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{game.description}</p>
              </CardHeader>

              <CardContent className="mt-auto flex items-center justify-between gap-2">
                <Badge variant="secondary">
                  <Sparkles className="mr-1 size-3" />
                  {game.reward}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <LockKeyhole className="size-3" />
                  Próximamente
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
