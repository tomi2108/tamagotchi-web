import { useCallback, useEffect, useRef, useState } from "react";
import {
  Coins,
  Hand,
  RotateCcw,
  Scissors,
  Trophy,
  X,
  ArrowRight,
} from "lucide-react";
import { registerMinigameScore } from "@/api/minigames";
import { usePlayer } from "@/components/PlayerContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePet } from "@/components/PetContext";

type Move = "rock" | "paper" | "scissors";
type RoundResult = "win" | "draw" | "lose";
type GameState = "ready" | "playing" | "roundComplete" | "finished";

type Round = {
  playerMove: Move;
  petMove: Move;
  result: RoundResult;
};

const TOTAL_ROUNDS = 3;

const moves: {
  id: Move;
  label: string;
  icon: typeof Hand;
  emoji: string;
}[] = [
  { id: "rock", label: "Piedra", icon: Hand, emoji: "✊" },
  { id: "paper", label: "Papel", icon: Hand, emoji: "✋" },
  { id: "scissors", label: "Tijera", icon: Scissors, emoji: "✌️" },
];

function getRoundResult(playerMove: Move, petMove: Move): RoundResult {
  if (playerMove === petMove) return "draw";

  const playerWins =
    (playerMove === "rock" && petMove === "scissors") ||
    (playerMove === "paper" && petMove === "rock") ||
    (playerMove === "scissors" && petMove === "paper");

  return playerWins ? "win" : "lose";
}

function calculateScore(rounds: Round[]) {
  return rounds.reduce((total, round) => {
    if (round.result === "win") return total + 100;
    if (round.result === "draw") return total + 25;
    return total;
  }, 0);
}

function getResultLabel(result: RoundResult) {
  if (result === "win") return "¡Ganaste!";
  if (result === "draw") return "¡Empate!";
  return "¡Perdiste!";
}

function getMoveLabel(move: Move) {
  return moves.find((item) => item.id === move)?.label ?? move;
}

function getMoveEmoji(move: Move) {
  return moves.find((item) => item.id === move)?.emoji ?? "❔";
}

export default function RockPaperScissorsPage() {
  const { player } = usePlayer();
  const { pet } = usePet();

  const [gameState, setGameState] = useState<GameState>("ready");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [savingScore, setSavingScore] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [coinsAwarded, setCoinsAwarded] = useState<number | null>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);

  const scoreSubmitted = useRef(false);
  const savingScoreRef = useRef(false);

  const currentRound = rounds.length + 1;
  const score = calculateScore(rounds);
  const wins = rounds.filter((round) => round.result === "win").length;
  const draws = rounds.filter((round) => round.result === "draw").length;
  const losses = rounds.filter((round) => round.result === "lose").length;
  const lastRound = rounds[rounds.length - 1];

  const submitScore = useCallback(async () => {
    if (!player || scoreSubmitted.current || savingScoreRef.current) {
      return;
    }

    scoreSubmitted.current = true;
    savingScoreRef.current = true;
    setSavingScore(true);
    setScoreError(null);

    try {
      const result = await registerMinigameScore({
        gameCode: "rps",
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
  }, [player, score]);

  useEffect(() => {
    if (gameState === "finished" && player) {
      void submitScore();
    }
  }, [gameState, player, submitScore]);

  function startGame() {
    setRounds([]);
    setGameState("playing");
    setScoreSaved(false);
    setCoinsAwarded(null);
    setScoreError(null);
    setSavingScore(false);
    scoreSubmitted.current = false;
    savingScoreRef.current = false;
  }

  function playMove(playerMove: Move) {
    if (gameState !== "playing" || rounds.length >= TOTAL_ROUNDS) {
      return;
    }

    const petMove = moves[Math.floor(Math.random() * moves.length)].id;
    const result = getRoundResult(playerMove, petMove);

    setRounds((previous) => [...previous, { playerMove, petMove, result }]);
    setGameState("roundComplete");
  }

  function continueGame() {
    if (gameState !== "roundComplete") return;

    setGameState(rounds.length >= TOTAL_ROUNDS ? "finished" : "playing");
  }

  function resetGame() {
    setRounds([]);
    setGameState("ready");
    setScoreSaved(false);
    setCoinsAwarded(null);
    setScoreError(null);
    setSavingScore(false);
    scoreSubmitted.current = false;
    savingScoreRef.current = false;
  }

  const gameWinner =
    wins > losses
      ? "¡Ganaste la partida!"
      : losses > wins
        ? `${pet?.name} ganó`
        : "¡La partida terminó en empate!";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Piedra, papel o tijera
          </h1>
          <p className="mt-1 text-muted-foreground">
            Jugá 3 rondas contra {pet?.name} y sumá puntos.
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
            <Hand className="size-8 text-primary" />
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold">
              {gameState === "ready" && "¿Piedra, papel o tijera?"}
              {gameState === "playing" &&
                `Ronda ${currentRound} de ${TOTAL_ROUNDS}`}
              {gameState === "roundComplete" &&
                `Resultado de la ronda ${rounds.length}`}
              {gameState === "finished" && gameWinner}
            </h2>

            <p className="text-sm text-muted-foreground">
              {gameState === "ready" &&
                "Elegí tu jugada en cada ronda. ¡Suerte!"}
              {gameState === "playing" &&
                "Tu rival ya está listo. ¿Qué vas a elegir?"}
              {gameState === "roundComplete" &&
                (rounds.length < TOTAL_ROUNDS
                  ? "Revisá el resultado antes de continuar."
                  : "Esta fue la última ronda. Revisá el resultado final.")}
              {gameState === "finished" &&
                "La partida terminó. Revisá los resultados y tu puntuación."}
            </p>
          </div>

          {gameState === "ready" && (
            <div className="flex min-h-48 w-full flex-col items-center justify-center gap-4 rounded-2xl border bg-card sm:min-h-56">
              <span className="text-6xl">✊</span>
              <Button size="lg" onClick={startGame}>
                ¡Empezar!
              </Button>
            </div>
          )}

          {gameState === "playing" && (
            <div className="w-full space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {moves.map(({ id, label, icon: Icon }) => (
                  <Button
                    key={id}
                    variant="outline"
                    className="h-28 flex-col gap-3 border-2 hover:border-primary hover:bg-primary/5"
                    onClick={() => playMove(id)}
                  >
                    <Icon className="size-8" />
                    <span>{label}</span>
                  </Button>
                ))}
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Elegí una opción para jugar la ronda.
              </p>
            </div>
          )}

          {gameState === "roundComplete" && lastRound && (
            <div className="w-full space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 rounded-xl border bg-card p-5 text-center">
                  <p className="text-sm text-muted-foreground">Vos</p>
                  <span className="block text-5xl">
                    {getMoveEmoji(lastRound.playerMove)}
                  </span>
                  <p className="font-semibold">
                    {getMoveLabel(lastRound.playerMove)}
                  </p>
                </div>

                <div className="space-y-2 rounded-xl border bg-card p-5 text-center">
                  <p className="text-sm text-muted-foreground">{pet?.name}</p>
                  <span className="block text-5xl">
                    {getMoveEmoji(lastRound.petMove)}
                  </span>
                  <p className="font-semibold">
                    {getMoveLabel(lastRound.petMove)}
                  </p>
                </div>
              </div>

              <div
                className={`space-y-2 rounded-xl border p-5 text-center ${
                  lastRound.result === "win"
                    ? "border-green-500/30 bg-green-500/10"
                    : lastRound.result === "lose"
                      ? "border-destructive/30 bg-destructive/10"
                      : "bg-muted/40"
                }`}
              >
                <p
                  className={`text-2xl font-bold ${
                    lastRound.result === "win"
                      ? "text-green-500"
                      : lastRound.result === "lose"
                        ? "text-destructive"
                        : "text-muted-foreground"
                  }`}
                >
                  {getResultLabel(lastRound.result)}
                </p>

                <p className="text-sm text-muted-foreground">
                  {lastRound.result === "win"
                    ? "+100 puntos"
                    : lastRound.result === "draw"
                      ? "+25 puntos"
                      : "+0 puntos"}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border p-3 text-center">
                  <Trophy className="mx-auto mb-1 size-4 text-green-500" />
                  <p className="text-xl font-bold tabular-nums">{wins}</p>
                  <p className="text-xs text-muted-foreground">Victorias</p>
                </div>

                <div className="rounded-lg border p-3 text-center">
                  <Hand className="mx-auto mb-1 size-4 text-muted-foreground" />
                  <p className="text-xl font-bold tabular-nums">{draws}</p>
                  <p className="text-xs text-muted-foreground">Empates</p>
                </div>

                <div className="rounded-lg border p-3 text-center">
                  <X className="mx-auto mb-1 size-4 text-destructive" />
                  <p className="text-xl font-bold tabular-nums">{losses}</p>
                  <p className="text-xs text-muted-foreground">Derrotas</p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
                <span className="text-sm text-muted-foreground">
                  Puntuación acumulada
                </span>
                <span className="text-xl font-bold tabular-nums">
                  {score.toLocaleString("es-AR")}
                </span>
              </div>

              <Button className="w-full" onClick={continueGame}>
                {rounds.length < TOTAL_ROUNDS
                  ? "Siguiente ronda"
                  : "Ver resultado final"}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          )}

          {gameState === "finished" && (
            <div className="w-full space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border bg-card p-3 text-center">
                  <Trophy className="mx-auto mb-2 size-5 text-green-500" />
                  <p className="text-2xl font-bold tabular-nums">{wins}</p>
                  <p className="text-xs text-muted-foreground">Victorias</p>
                </div>

                <div className="rounded-xl border bg-card p-3 text-center">
                  <Hand className="mx-auto mb-2 size-5 text-muted-foreground" />
                  <p className="text-2xl font-bold tabular-nums">{draws}</p>
                  <p className="text-xs text-muted-foreground">Empates</p>
                </div>

                <div className="rounded-xl border bg-card p-3 text-center">
                  <X className="mx-auto mb-2 size-5 text-destructive" />
                  <p className="text-2xl font-bold tabular-nums">{losses}</p>
                  <p className="text-xs text-muted-foreground">Derrotas</p>
                </div>
              </div>

              <div className="space-y-3">
                {rounds.map((round, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Ronda {index + 1}
                      </p>
                      <p className="text-sm font-medium">
                        {getMoveLabel(round.playerMove)} vs.{" "}
                        {getMoveLabel(round.petMove)}
                      </p>
                    </div>

                    <span
                      className={`text-sm font-semibold ${
                        round.result === "win"
                          ? "text-green-600"
                          : round.result === "lose"
                            ? "text-destructive"
                            : "text-muted-foreground"
                      }`}
                    >
                      {getResultLabel(round.result)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border bg-muted/40 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Puntuación final
                </p>
                <p className="mt-1 text-4xl font-bold tabular-nums">
                  {score.toLocaleString("es-AR")}
                </p>
              </div>

              {scoreSaved ? (
                <div className="flex items-center justify-center gap-2 rounded-lg border bg-card px-4 py-3">
                  <Coins className="size-5 text-yellow-500" />
                  <span className="font-semibold tabular-nums">
                    +{(coinsAwarded ?? 0).toLocaleString("es-AR")}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    monedas ganadas
                  </span>
                </div>
              ) : savingScore ? (
                <p className="text-center text-sm text-muted-foreground">
                  Guardando puntuación...
                </p>
              ) : scoreError ? (
                <div className="space-y-2 text-center">
                  <p role="alert" className="text-sm text-destructive">
                    {scoreError}
                  </p>
                  <Button variant="outline" onClick={() => void submitScore()}>
                    Reintentar guardado
                  </Button>
                </div>
              ) : !player ? (
                <p className="text-center text-sm text-destructive">
                  Seleccioná un jugador para guardar tu puntuación.
                </p>
              ) : null}

              <Button className="w-full" onClick={startGame}>
                Jugar de nuevo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
