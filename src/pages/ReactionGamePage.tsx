import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Coins, RotateCcw, Timer, Trophy } from "lucide-react";
import { registerMinigameScore } from "@/api/minigames";
import { usePlayer } from "@/components/PlayerContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type GameState = "ready" | "waiting" | "react" | "early" | "finished";

const MIN_WAIT_MS = 1500;
const MAX_WAIT_MS = 4500;

function calculateScore(reactionMs: number) {
  return Math.max(0, Math.round(1000 - reactionMs));
}

export default function ReactionGamePage() {
  const { player } = usePlayer();

  const [gameState, setGameState] = useState<GameState>("ready");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [savingScore, setSavingScore] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [coinsAwarded, setCoinsAwarded] = useState<number | null>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const scoreSubmitted = useRef(false);
  const savingScoreRef = useRef(false);
  const gameStateRef = useRef<GameState>("ready");

  const score = reactionTime === null ? 0 : calculateScore(reactionTime);

  const clearGameTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearGameTimeout();
  }, [clearGameTimeout]);

  const submitScore = useCallback(async () => {
    if (!player || reactionTime === null || scoreSubmitted.current || savingScoreRef.current) {
      return;
    }

    scoreSubmitted.current = true;
    savingScoreRef.current = true;
    setSavingScore(true);
    setScoreError(null);

    try {
      const result = await registerMinigameScore({
        gameCode: "reaction",
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
  }, [player, reactionTime, score]);

  useEffect(() => {
    if (gameState === "finished" && player) {
      void submitScore();
    }
  }, [gameState, player, submitScore]);

  function startGame() {
    clearGameTimeout();

    setReactionTime(null);
    setScoreSaved(false);
    setCoinsAwarded(null);
    setScoreError(null);
    setSavingScore(false);
    scoreSubmitted.current = false;
    savingScoreRef.current = false;
    startTimeRef.current = null;

    gameStateRef.current = "waiting";
    setGameState("waiting");

    const delay = MIN_WAIT_MS + Math.random() * (MAX_WAIT_MS - MIN_WAIT_MS);

    timeoutRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      gameStateRef.current = "react";
      setGameState("react");
      timeoutRef.current = null;
    }, delay);
  }

  function handleReaction() {
    if (gameStateRef.current === "waiting") {
      clearGameTimeout();
      gameStateRef.current = "early";
      setGameState("early");
      return;
    }

    if (gameStateRef.current !== "react" || startTimeRef.current === null) {
      return;
    }

    const elapsed = Math.round(performance.now() - startTimeRef.current);

    setReactionTime(elapsed);
    gameStateRef.current = "finished";
    setGameState("finished");
  }

  function resetGame() {
    clearGameTimeout();

    gameStateRef.current = "ready";
    setGameState("ready");
    setReactionTime(null);
    setScoreSaved(false);
    setCoinsAwarded(null);
    setScoreError(null);
    setSavingScore(false);

    scoreSubmitted.current = false;
    savingScoreRef.current = false;
    startTimeRef.current = null;
  }

  const isClickable = gameState === "waiting" || gameState === "react";

  const targetClasses =
    gameState === "react"
      ? "bg-green-600 text-white hover:bg-green-700"
      : gameState === "waiting"
        ? "bg-red-600 text-white hover:bg-red-700"
        : gameState === "early"
          ? "bg-orange-500 text-white hover:bg-orange-600"
          : "bg-muted hover:bg-accent";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">¡Reacción relámpago!</h1>
          <p className="mt-1 text-muted-foreground">
            Prestá atención y reaccioná lo más rápido posible. ¡Cada milisegundo cuenta!
          </p>
        </div>

        <Button variant="outline" onClick={resetGame}>
          <RotateCcw className="mr-2 size-4" />
          Reiniciar
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-6 p-6 sm:p-10">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Timer className="size-8 text-primary" />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-semibold">
              {gameState === "ready" && "¿Qué tan rápidos son tus reflejos?"}
              {gameState === "waiting" && "Esperá la señal..."}
              {gameState === "react" && "¡AHORA!"}
              {gameState === "early" && "¡Demasiado pronto!"}
              {gameState === "finished" && "¡Tiempo registrado!"}
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {gameState === "ready" &&
                "Iniciá el juego y esperá a que la pantalla se ponga verde."}
              {gameState === "waiting" && "No pulses todavía. Reaccioná cuando cambie a verde."}
              {gameState === "react" && "¡Pulsá ahora lo más rápido que puedas!"}
              {gameState === "early" && "Pulsaste antes de tiempo. Probá de nuevo."}
              {gameState === "finished" && "Cuanto menor sea el tiempo, más puntos ganás."}
            </p>
          </div>

          {isClickable ? (
            <button
              type="button"
              onClick={handleReaction}
              className={`flex min-h-48 w-full select-none items-center justify-center rounded-2xl text-2xl font-bold transition-colors sm:min-h-56 ${targetClasses}`}
            >
              {gameState === "waiting" ? "NO PULSES" : "¡PULSÁ!"}
            </button>
          ) : gameState === "early" ? (
            <div
              className={`flex min-h-48 w-full flex-col items-center justify-center gap-3 rounded-2xl sm:min-h-56 ${targetClasses}`}
            >
              <AlertCircle className="size-12" />
              <span className="text-2xl font-bold">Falsa salida</span>
              <Button variant="secondary" onClick={startGame}>
                Intentar de nuevo
              </Button>
            </div>
          ) : gameState === "finished" ? (
            <div className="flex min-h-48 w-full flex-col items-center justify-center gap-3 rounded-2xl border bg-card sm:min-h-56">
              <Trophy className="size-12 text-primary" />
              <span className="text-4xl font-bold tabular-nums">{reactionTime} ms</span>
              <span className="text-sm text-muted-foreground">
                {reactionTime !== null && reactionTime < 200
                  ? "¡Reflejos increíbles!"
                  : reactionTime !== null && reactionTime < 300
                    ? "¡Muy buena reacción!"
                    : "¡Seguí practicando!"}
              </span>
            </div>
          ) : (
            <div className="flex min-h-48 w-full flex-col items-center justify-center gap-4 rounded-2xl border bg-card sm:min-h-56">
              <span className="text-6xl">🐾</span>
              <Button size="lg" onClick={startGame}>
                ¡Empezar!
              </Button>
            </div>
          )}

          {gameState === "finished" && (
            <div className="w-full space-y-4 text-center">
              <p className="text-lg font-semibold">Puntuación: {score.toLocaleString("es-AR")}</p>

              {scoreSaved ? (
                <div className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
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

              <div>
                <Button onClick={startGame}>Jugar de nuevo</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
