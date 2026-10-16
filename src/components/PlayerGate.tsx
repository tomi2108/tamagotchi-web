import { useCallback, useEffect, useState } from "react";
import { Gamepad2, RefreshCw, UserRound } from "lucide-react";
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
      setError("No se pudieron cargar los jugadores. Intentá nuevamente.");
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
        <p className="text-sm text-muted-foreground">Cargando jugadores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4">
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
        <Button variant="outline" onClick={() => void loadPlayers()}>
          <RefreshCw className="mr-2 size-4" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <p className="text-sm text-muted-foreground">No hay jugadores disponibles.</p>
      </div>
    );
  }

  if (player && players.some((item) => item.id === player.id)) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10">
            <Gamepad2 className="size-7 text-primary" />
          </div>
          <CardTitle className="font-pixel text-lg text-primary">¿Quién está jugando?</CardTitle>
          <p className="text-sm text-muted-foreground">Elegí tu jugador para continuar.</p>
        </CardHeader>

        <CardContent className="space-y-3">
          {players.map((item) => (
            <Button
              key={item.id}
              variant="outline"
              className="h-12 w-full justify-start gap-3"
              onClick={() => selectPlayer(item)}
            >
              <UserRound className="size-5 text-primary" />
              {item.name}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
