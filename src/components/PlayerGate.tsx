import { useCallback, useEffect, useState } from "react";
import { Heart, RefreshCw, UserRound, Sprout } from "lucide-react";
import { getPlayers, type Player } from "@/api/players";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlayer } from "./PlayerContext";

export default function PlayerGate({ children }: { children: React.ReactNode }) {
  const { player, selectPlayer } = usePlayer();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlayers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const availablePlayers = await getPlayers();
      setPlayers(availablePlayers);

      const savedId = Number(localStorage.getItem("playerId"));
      const savedPlayer = availablePlayers.find((item) => item.id === savedId);

      if (savedPlayer) {
        selectPlayer(savedPlayer);
      } else {
        localStorage.removeItem("playerId");
      }
    } catch {
      setError("No pudimos encontrar a los cuidadores. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [selectPlayer]);

  useEffect(() => {
    void loadPlayers();
  }, [loadPlayers]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 animate-pulse items-center justify-center rounded-xl border-2 border-primary bg-primary/10">
            <Heart className="size-8 text-primary" />
          </div>
          <p className="font-pixel text-xs text-primary">Buscando cuidadores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4">
        <Heart className="size-10 text-destructive" />
        <p role="alert" className="text-center text-sm text-muted-foreground">
          {error}
        </p>
        <Button variant="outline" onClick={() => void loadPlayers()}>
          <RefreshCw className="mr-2 size-4" />
          Intentar de nuevo
        </Button>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Sprout className="size-10 text-primary" />
            <p className="font-pixel text-xs text-primary">¡Todavía no hay cuidadores!</p>
            <p className="text-sm text-muted-foreground">
              Parece que nuestra mascota todavía está esperando compañía.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (player && players.some((item) => item.id === player.id)) {
    return <>{children}</>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <Card className="w-full max-w-md overflow-hidden border-2 border-primary/40 shadow-lg">
        <div className="h-2 bg-primary" />

        <CardHeader className="items-center space-y-4 pb-4 text-center">
          <div className="relative flex size-24 items-center justify-center rounded-2xl border-2 border-primary/40 bg-primary/10">
            <Heart className="size-12 text-primary" />
            <span className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground">
              <Sprout className="size-4" />
            </span>
          </div>

          <div className="space-y-2">
            <p className="font-pixel text-[10px] uppercase tracking-widest text-muted-foreground">
              Mundo Tamagotchi
            </p>
            <CardTitle className="font-pixel text-lg leading-relaxed text-primary">
              ¡Elegí tu cuidador!
            </CardTitle>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Tu mascota necesita atención, juegos y cariño. ¿Quién se encargará de cuidarla hoy?
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-6">
          <p className="px-1 font-pixel text-[10px] text-muted-foreground">SELECCIONÁ TU PERFIL</p>

          {players.map((item) => (
            <Button
              key={item.id}
              variant="outline"
              className="group h-auto w-full justify-start gap-4 border-2 py-4 transition-colors hover:border-primary hover:bg-primary/5"
              onClick={() => selectPlayer(item)}
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <UserRound className="size-6 text-primary" />
              </span>

              <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
                <span className="font-pixel text-xs">{item.name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Cuidador de la mascota
                </span>
              </span>

              <Heart className="size-4 shrink-0 text-primary/50 transition-colors group-hover:text-primary" />
            </Button>
          ))}

          <p className="pt-3 text-center text-xs text-muted-foreground">
            Un poco de cariño puede cambiarle el día.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
