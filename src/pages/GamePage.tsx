import { useCallback, useEffect, useState } from "react";
import {
  Gamepad2,
  Hand,
  LockKeyhole,
  Medal,
  RefreshCw,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getMinigames,
  getMinigameLeaderboard,
  type LeaderboardEntry,
  type Minigame,
} from "@/api/minigames";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const gamePaths: Record<string, string> = {
  memory: "/games/memory",
  reaction: "/games/reaction",
  dodge: "/games/dodge",
  rps: "/games/rps",
};

const leaderboardGames = [
  { code: "memory", name: "Memoria", icon: Gamepad2 },
  { code: "reaction", name: "Reflejos", icon: Sparkles },
  { code: "dodge", name: "Esquivar", icon: Medal },
  { code: "rps", name: "Piedra, papel o tijera", icon: Hand },
];

function getRankIcon(position: number) {
  if (position === 1) return Trophy;
  if (position === 2 || position === 3) return Medal;
  return null;
}

export default function GamesPage() {
  const [games, setGames] = useState<Minigame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedGame, setSelectedGame] = useState("memory");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  const loadGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setGames(await getMinigames());
    } catch {
      setError("No se pudieron cargar los minijuegos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGames();
  }, [loadGames]);

  const loadLeaderboard = useCallback(async () => {
    setLoadingLeaderboard(true);
    setLeaderboardError(null);

    try {
      const entries = await getMinigameLeaderboard(selectedGame);
      setLeaderboard(entries);
    } catch {
      setLeaderboardError("No se pudo cargar la clasificación.");
    } finally {
      setLoadingLeaderboard(false);
    }
  }, [selectedGame]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadingLeaderboard(true);
      setLeaderboardError(null);
      setLeaderboard([]);

      try {
        const entries = await getMinigameLeaderboard(selectedGame);

        if (!cancelled) {
          setLeaderboard(entries);
        }
      } catch {
        if (!cancelled) {
          setLeaderboardError("No se pudo cargar la clasificación.");
        }
      } finally {
        if (!cancelled) {
          setLoadingLeaderboard(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [selectedGame]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-pixel text-xl text-primary">Sala de juegos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Jugá y superá tus propios récords.
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
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <Gamepad2 className="size-6 text-primary" />
          </div>

          <div>
            <h2 className="font-pixel text-sm">¡Hora de jugar!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Jugá, conseguí monedas y competí por el primer puesto.
            </p>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="font-pixel text-sm">Minijuegos</h2>

        {loading && (
          <p className="text-sm text-muted-foreground">
            Cargando minijuegos...
          </p>
        )}

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        {!loading && !error && games.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Todavía no hay minijuegos disponibles.
          </p>
        )}

        {!error && games.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => {
              const Icon =
                leaderboardGames.find((item) => item.code === game.code)
                  ?.icon ?? Gamepad2;

              return (
                <Card key={game.id} className="flex flex-col rounded-2xl">
                  <CardHeader>
                    <div className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-primary/10">
                      <Icon className="size-6 text-primary" />
                    </div>

                    <CardTitle className="text-base">{game.name}</CardTitle>

                    <p className="text-sm text-muted-foreground">
                      {game.description}
                    </p>
                  </CardHeader>

                  <CardContent className="mt-auto flex items-center justify-between gap-2">
                    <Badge variant="secondary">
                      <Sparkles className="mr-1 size-3" />
                      Monedas
                    </Badge>

                    {gamePaths[game.code] ? (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={gamePaths[game.code]}>Jugar</Link>
                      </Button>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <LockKeyhole className="size-3" />
                        Próximamente
                      </span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-pixel text-sm">Clasificación</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Los mejores puntajes de cada minijuego.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted/50 p-1.5 sm:grid-cols-4">
          {leaderboardGames.map((game) => {
            const Icon = game.icon;
            const selected = selectedGame === game.code;

            return (
              <button
                key={game.code}
                type="button"
                onClick={() => setSelectedGame(game.code)}
                aria-pressed={selected}
                className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-3 text-center transition-colors ${
                  selected
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                }`}
              >
                <Icon className="size-5 shrink-0" />
                <span className="text-xs font-semibold sm:text-sm">
                  {game.name}
                </span>
              </button>
            );
          })}
        </div>

        <Card className="overflow-hidden rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/60">
            <CardTitle className="text-base">
              {
                leaderboardGames.find((game) => game.code === selectedGame)
                  ?.name
              }
            </CardTitle>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => void loadLeaderboard()}
              disabled={loadingLeaderboard}
              aria-label="Actualizar clasificación"
            >
              <RefreshCw
                className={`size-4 ${loadingLeaderboard ? "animate-spin" : ""}`}
              />
            </Button>
          </CardHeader>

          <CardContent className="p-3 sm:p-5">
            {loadingLeaderboard && (
              <div className="flex min-h-32 items-center justify-center">
                <RefreshCw className="size-5 animate-spin text-primary" />
              </div>
            )}

            {!loadingLeaderboard && leaderboardError && (
              <p
                role="alert"
                className="py-8 text-center text-sm text-destructive"
              >
                {leaderboardError}
              </p>
            )}

            {!loadingLeaderboard &&
              !leaderboardError &&
              leaderboard.length === 0 && (
                <div className="flex flex-col items-center py-10 text-center">
                  <Trophy className="size-9 text-muted-foreground/50" />
                  <p className="mt-3 font-medium">Todavía no hay puntajes</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ¡Sé el primero en aparecer en la clasificación!
                  </p>
                </div>
              )}

            {!loadingLeaderboard &&
              !leaderboardError &&
              leaderboard.length > 0 && (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => {
                    const position = index + 1;
                    const RankIcon = getRankIcon(position);

                    return (
                      <div
                        key={`${entry.player_id}-${position}`}
                        className={`flex items-center gap-3 rounded-xl p-3 sm:gap-4 ${
                          position === 1 ? "bg-amber-500/10" : "bg-muted/40"
                        }`}
                      >
                        <div
                          className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                            position === 1
                              ? "bg-amber-500/15 text-amber-600"
                              : position === 2
                                ? "bg-slate-400/15 text-slate-500"
                                : position === 3
                                  ? "bg-orange-700/10 text-orange-700 dark:text-orange-400"
                                  : "text-muted-foreground"
                          }`}
                        >
                          {RankIcon ? (
                            <RankIcon className="size-5" />
                          ) : (
                            <span className="text-sm font-bold">
                              {position}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {entry.player_name}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="font-pixel text-sm text-primary">
                            {entry.score.toLocaleString("es-AR")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            puntos
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
