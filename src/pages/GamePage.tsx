import { useCallback, useEffect, useState } from "react";
import { Gamepad2, LockKeyhole, RefreshCw, Sparkles } from "lucide-react";
import { getMinigames, type Minigame } from "@/api/minigames";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Link } from "react-router-dom";

const gamePaths: Record<string, string> = {
  memory: "/games/memory",
  reaction: "/games/reaction",
  dodge: "/games/dodge",
};

export default function GamesPage() {
  const [games, setGames] = useState<Minigame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setGames(await getMinigames());
    } catch {
      setError("No se pudieron cargar los minijuegos. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGames();
  }, [loadGames]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-pixel text-xl text-primary">Sala de juegos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Jugá un rato y ganá recompensas para tu mascota.
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => void loadGames()}
          disabled={loading}
          aria-label="Actualizar minijuegos"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

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

        {loading && <p className="text-sm text-muted-foreground">Cargando minijuegos...</p>}

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        {!loading && !error && games.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavía no hay minijuegos disponibles.</p>
        )}

        {!error && games.length > 0 && (
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
                    Monedas
                  </Badge>
                  {gamePaths[game.code] ? (
                    <Button variant="outline" size="sm">
                      <Link to={gamePaths[game.code]}>Ver juego</Link>
                    </Button>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <LockKeyhole className="size-3" />
                      Próximamente
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
