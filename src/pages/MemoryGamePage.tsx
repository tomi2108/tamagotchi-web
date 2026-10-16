import { useCallback, useEffect, useRef, useState } from "react";
import { Brain, Clock, Coins, RotateCcw, Trophy } from "lucide-react";
import { registerMinigameScore } from "@/api/minigames";
import { usePlayer } from "@/components/PlayerContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const symbols = ["🐱", "🐶", "🐰", "🌻", "🍓", "🎃", "🌷", "🍎"];

type MemoryCard = {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
};

function createDeck(): MemoryCard[] {
  return [...symbols, ...symbols]
    .map((symbol, id) => ({
      id,
      symbol,
      isFlipped: false,
      isMatched: false,
      sortKey: Math.random(),
    }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ sortKey: _sortKey, ...card }) => card);
}

function calculateScore(moves: number, elapsedSeconds: number) {
  return Math.max(0, 1000 - moves * 25 - elapsedSeconds * 5);
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function MemoryGamePage() {
  const { player } = usePlayer();

  const [cards, setCards] = useState<MemoryCard[]>(createDeck);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [locked, setLocked] = useState(false);
  const [started, setStarted] = useState(false);

  const [savingScore, setSavingScore] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [coinsAwarded, setCoinsAwarded] = useState<number | null>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);

  const scoreSubmitted = useRef(false);
  const savingScoreRef = useRef(false);
  const mismatchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const gameCompleted = matches === symbols.length;
  const score = calculateScore(moves, elapsedSeconds);

  useEffect(() => {
    if (!started || gameCompleted) return;

    const interval = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [started, gameCompleted]);

  useEffect(() => {
    return () => {
      if (mismatchTimeout.current) {
        window.clearTimeout(mismatchTimeout.current);
      }
    };
  }, []);

  const submitScore = useCallback(async () => {
    if (!player || !gameCompleted || scoreSubmitted.current || savingScoreRef.current) {
      return;
    }

    scoreSubmitted.current = true;
    savingScoreRef.current = true;
    setSavingScore(true);
    setScoreError(null);

    try {
      const result = await registerMinigameScore({
        gameCode: "memory",
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
  }, [player, gameCompleted, score]);

  useEffect(() => {
    if (gameCompleted && player) {
      void submitScore();
    }
  }, [gameCompleted, player, submitScore]);

  function handleCardClick(cardId: number) {
    if (locked || gameCompleted) return;

    const selectedCard = cards.find((card) => card.id === cardId);

    if (!selectedCard || selectedCard.isFlipped || selectedCard.isMatched) {
      return;
    }

    setStarted(true);

    const flippedCards = cards.map((card) =>
      card.id === cardId ? { ...card, isFlipped: true } : card,
    );

    const visibleCards = flippedCards.filter((card) => card.isFlipped && !card.isMatched);

    setCards(flippedCards);

    if (visibleCards.length !== 2) return;

    setMoves((current) => current + 1);
    setLocked(true);

    const [first, second] = visibleCards;

    if (first.symbol === second.symbol) {
      setCards((current) =>
        current.map((card) =>
          card.id === first.id || card.id === second.id ? { ...card, isMatched: true } : card,
        ),
      );

      setMatches((current) => current + 1);
      setLocked(false);
      return;
    }

    mismatchTimeout.current = window.setTimeout(() => {
      setCards((current) =>
        current.map((card) =>
          card.id === first.id || card.id === second.id ? { ...card, isFlipped: false } : card,
        ),
      );

      setLocked(false);
      mismatchTimeout.current = null;
    }, 800);
  }

  function restartGame() {
    if (mismatchTimeout.current) {
      window.clearTimeout(mismatchTimeout.current);
      mismatchTimeout.current = null;
    }

    setCards(createDeck());
    setMoves(0);
    setMatches(0);
    setElapsedSeconds(0);
    setLocked(false);
    setStarted(false);

    scoreSubmitted.current = false;
    savingScoreRef.current = false;
    setSavingScore(false);
    setScoreSaved(false);
    setCoinsAwarded(null);
    setScoreError(null);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Memoria Tamagotchi</h1>
          <p className="mt-1 text-muted-foreground">Encontrá las parejas de cartas iguales.</p>
        </div>

        <Button variant="outline" onClick={restartGame}>
          <RotateCcw className="mr-2 size-4" />
          Reiniciar
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <Brain className="size-5 text-primary" />
            <span className="text-2xl font-bold tabular-nums">{moves}</span>
            <span className="text-xs text-muted-foreground">Movimientos</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <Trophy className="size-5 text-primary" />
            <span className="text-2xl font-bold tabular-nums">
              {matches}/{symbols.length}
            </span>
            <span className="text-xs text-muted-foreground">Parejas</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <Clock className="size-5 text-primary" />
            <span className="text-2xl font-bold tabular-nums">{formatTime(elapsedSeconds)}</span>
            <span className="text-xs text-muted-foreground">Tiempo</span>
          </CardContent>
        </Card>
      </div>

      {gameCompleted && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="items-center text-center">
            <Trophy className="size-10 text-primary" />
            <CardTitle>¡Excelente memoria!</CardTitle>

            <p className="text-sm text-muted-foreground">
              Encontraste todas las parejas en {moves} movimientos y {formatTime(elapsedSeconds)}.
            </p>

            <p className="font-semibold">Puntuación: {score.toLocaleString("es-AR")}</p>

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
                  Reintentar
                </Button>
              </div>
            ) : !player ? (
              <p className="text-sm text-destructive">
                Seleccioná un jugador para guardar tu puntuación.
              </p>
            ) : null}

            <Button variant="outline" onClick={restartGame}>
              Jugar de nuevo
            </Button>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardContent className="grid grid-cols-4 gap-3 p-4 sm:gap-4 sm:p-6">
          {cards.map((card) => {
            const revealed = card.isFlipped || card.isMatched;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCardClick(card.id)}
                disabled={locked || card.isMatched || gameCompleted}
                aria-label={revealed ? `Carta ${card.symbol}` : "Revelar carta"}
                className={`flex aspect-square items-center justify-center rounded-xl border text-3xl transition-colors sm:text-4xl ${revealed
                    ? "border-primary/30 bg-primary/10"
                    : "border-border bg-muted hover:border-primary/50 hover:bg-accent"
                  } ${card.isMatched ? "border-primary/40 opacity-60" : ""}`}
              >
                {revealed ? card.symbol : <span className="text-xl text-muted-foreground">?</span>}
              </button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
