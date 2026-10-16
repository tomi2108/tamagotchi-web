import { useCallback, useEffect, useRef, useState } from "react";
import { Coins, RotateCcw, Trophy } from "lucide-react";
import { registerMinigameScore } from "@/api/minigames";
import { usePlayer } from "@/components/PlayerContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LANES = 3;
const TICK_MS = 350;
const INITIAL_SPAWN_CHANCE = 0.45;

type GameState = "ready" | "playing" | "finished";

type Obstacle = {
  id: number;
  lane: number;
  row: number;
};

function calculateScore(secondsSurvived: number) {
  return secondsSurvived * 10;
}

export default function DodgeGamePage() {
  const { player } = usePlayer();

  const [gameState, setGameState] = useState<GameState>("ready");
  const [playerLane, setPlayerLane] = useState(1);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [secondsSurvived, setSecondsSurvived] = useState(0);
  const [savingScore, setSavingScore] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [coinsAwarded, setCoinsAwarded] = useState<number | null>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);

  const nextObstacleId = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameStateRef = useRef<GameState>("ready");
  const playerLaneRef = useRef(1);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const scoreSubmitted = useRef(false);
  const savingScoreRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);

  const score = calculateScore(secondsSurvived);

  const clearGameInterval = useCallback(() => {
    if (tickRef.current !== null) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearGameInterval();
  }, [clearGameInterval]);

  const submitScore = useCallback(async () => {
    if (!player || gameState !== "finished" || scoreSubmitted.current || savingScoreRef.current) {
      return;
    }

    scoreSubmitted.current = true;
    savingScoreRef.current = true;
    setSavingScore(true);
    setScoreError(null);

    try {
      const result = await registerMinigameScore({
        gameCode: "dodge",
        playerId: player.id,
        score,
      });

      setCoinsAwarded(result.coins);
      setScoreSaved(true);
    } catch {
      scoreSubmitted.current = false;
      setScoreError("No se pudo guardar la puntuación. Intentá nuevamente.");
    } finally {
      savingScoreRef.current = false;
      setSavingScore(false);
    }
  }, [player, gameState, score]);

  useEffect(() => {
    if (gameState === "finished" && player) {
      void submitScore();
    }
  }, [gameState, player, submitScore]);

  const finishGame = useCallback(() => {
    clearGameInterval();

    const startedAt = startTimeRef.current;
    const elapsed = startedAt === null ? 0 : Math.floor((Date.now() - startedAt) / 1000);

    setSecondsSurvived(elapsed);
    gameStateRef.current = "finished";
    setGameState("finished");
  }, [clearGameInterval]);

  const movePlayer = useCallback((direction: -1 | 1) => {
    if (gameStateRef.current !== "playing") return;

    const nextLane = Math.max(0, Math.min(LANES - 1, playerLaneRef.current + direction));
    playerLaneRef.current = nextLane;
    setPlayerLane(nextLane);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        event.preventDefault();
        movePlayer(-1);
      }

      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        event.preventDefault();
        movePlayer(1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movePlayer]);

  const startGame = useCallback(() => {
    clearGameInterval();

    playerLaneRef.current = 1;
    obstaclesRef.current = [];
    nextObstacleId.current = 0;
    startTimeRef.current = Date.now();

    setPlayerLane(1);
    setObstacles([]);
    setSecondsSurvived(0);
    setScoreSaved(false);
    setCoinsAwarded(null);
    setScoreError(null);
    setSavingScore(false);

    scoreSubmitted.current = false;
    savingScoreRef.current = false;

    gameStateRef.current = "playing";
    setGameState("playing");

    tickRef.current = setInterval(() => {
      if (gameStateRef.current !== "playing") return;

      const elapsed = Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000);

      setSecondsSurvived(elapsed);

      const spawnChance = Math.min(0.75, INITIAL_SPAWN_CHANCE + elapsed * 0.005);

      const currentObstacles = obstaclesRef.current
        .map((obstacle) => ({ ...obstacle, row: obstacle.row + 1 }))
        .filter((obstacle) => obstacle.row < 4);

      if (Math.random() < spawnChance) {
        currentObstacles.push({
          id: nextObstacleId.current++,
          lane: Math.floor(Math.random() * LANES),
          row: 0,
        });
      }

      const collision = currentObstacles.some(
        (obstacle) => obstacle.row === 3 && obstacle.lane === playerLaneRef.current,
      );

      obstaclesRef.current = currentObstacles;
      setObstacles(currentObstacles);

      if (collision) {
        finishGame();
      }
    }, TICK_MS);
  }, [clearGameInterval, finishGame]);

  function resetGame() {
    clearGameInterval();
    gameStateRef.current = "ready";
    setGameState("ready");
    playerLaneRef.current = 1;
    obstaclesRef.current = [];
    startTimeRef.current = null;

    setPlayerLane(1);
    setObstacles([]);
    setSecondsSurvived(0);
    setScoreSaved(false);
    setCoinsAwarded(null);
    setScoreError(null);
    setSavingScore(false);

    scoreSubmitted.current = false;
    savingScoreRef.current = false;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">¡A esquivar!</h1>
          <p className="mt-1 text-muted-foreground">
            Esquivá los obstáculos y sobreviví todo lo que puedas.
          </p>
        </div>

        <Button variant="outline" onClick={resetGame}>
          <RotateCcw className="mr-2 size-4" />
          Reiniciar
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <Trophy className="size-5 text-primary" />
            <span className="text-2xl font-bold tabular-nums">{score}</span>
            <span className="text-xs text-muted-foreground">Puntuación</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <span className="text-2xl">⏱️</span>
            <span className="text-2xl font-bold tabular-nums">{secondsSurvived}s</span>
            <span className="text-xs text-muted-foreground">Supervivencia</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-6">
          {gameState === "ready" ? (
            <div className="flex min-h-80 flex-col items-center justify-center gap-4 text-center">
              <span className="text-6xl">🐾</span>
              <h2 className="text-xl font-semibold">¡Preparados, listos!</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Movete entre los tres carriles para evitar los obstáculos. Usá las flechas del
                teclado o los botones de abajo.
              </p>
              <Button size="lg" onClick={startGame}>
                ¡Empezar!
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 4 }, (_, row) => (
                  <div key={row} className="col-span-3 grid grid-cols-3 gap-2">
                    {Array.from({ length: LANES }, (_, lane) => {
                      const obstacle = obstacles.find(
                        (item) => item.row === row && item.lane === lane,
                      );
                      const isPlayer = row === 3 && lane === playerLane;

                      return (
                        <div
                          key={lane}
                          className={`flex h-16 items-center justify-center rounded-lg border sm:h-20 ${isPlayer ? "border-primary bg-primary/10" : "bg-muted/40"
                            }`}
                        >
                          {obstacle ? (
                            <span className="text-2xl" aria-label="Obstáculo">
                              🪨
                            </span>
                          ) : isPlayer ? (
                            <span className="text-3xl" aria-label="Tu mascota">
                              🐱
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  disabled={gameState !== "playing" || playerLane === 0}
                  onClick={() => movePlayer(-1)}
                >
                  ← Izquierda
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  disabled={gameState !== "playing" || playerLane === LANES - 1}
                  onClick={() => movePlayer(1)}
                >
                  Derecha →
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {gameState === "finished" && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="items-center text-center">
            <Trophy className="size-10 text-primary" />
            <CardTitle>¡Fin del juego!</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sobreviviste {secondsSurvived} segundos y conseguiste {score.toLocaleString("es-AR")}{" "}
              puntos.
            </p>

            {scoreSaved ? (
              <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
                <Coins className="size-5 text-yellow-500" />
                <span className="font-semibold tabular-nums">
                  +{(coinsAwarded ?? 0).toLocaleString("es-AR")}
                </span>
                <span className="text-sm text-muted-foreground">monedas ganadas</span>
              </div>
            ) : savingScore ? (
              <p className="text-sm text-muted-foreground">Guardando puntuación...</p>
            ) : scoreError ? (
              <div className="space-y-2">
                <p role="alert" className="text-sm text-destructive">
                  {scoreError}
                </p>
                <Button variant="outline" onClick={() => void submitScore()}>
                  Reintentar guardado
                </Button>
              </div>
            ) : !player ? (
              <p className="text-sm text-destructive">
                Seleccioná un jugador para guardar tu puntuación.
              </p>
            ) : null}

            <Button onClick={startGame}>Jugar de nuevo</Button>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
