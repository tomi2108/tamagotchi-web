import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Coins, RotateCcw, Trophy } from "lucide-react";
import { registerMinigameScore } from "@/api/minigames";
import { usePlayer } from "@/components/PlayerContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SIZE = 6;
const COMPLETION_BONUS = 200;
const POINTS_PER_CELL = 20;

type Cell = 0 | 1 | 2;
type Board = Cell[][];
type Solution = boolean[][];
type GameState = "ready" | "playing" | "finished";

type Puzzle = {
  name: string;
  solution: Solution;
  rowClues: number[][];
  columnClues: number[][];
};

const PUZZLE_PATTERNS = [
  {
    name: "Corazón",
    rows: [
      "011110",
      "111111",
      "111111",
      "011110",
      "001100",
      "000000",
    ],
  },
  {
    name: "Carita feliz",
    rows: [
      "011110",
      "100001",
      "101101",
      "100001",
      "010010",
      "001100",
    ],
  },
  {
    name: "Pez",
    rows: [
      "001100",
      "011110",
      "111111",
      "011110",
      "001100",
      "000100",
    ],
  },
  {
    name: "Gato",
    rows: [
      "101101",
      "111111",
      "111111",
      "011110",
      "001100",
      "001100",
    ],
  },
  {
    name: "Flor",
    rows: [
      "001100",
      "001100",
      "111111",
      "011110",
      "001100",
      "011110",
    ],
  },
  {
    name: "Flecha",
    rows: [
      "001100",
      "011110",
      "111111",
      "001100",
      "001100",
      "001100",
    ],
  },
] as const;

function getClues(line: boolean[]): number[] {
  const clues: number[] = [];
  let count = 0;

  for (const filled of line) {
    if (filled) {
      count++;
    } else if (count > 0) {
      clues.push(count);
      count = 0;
    }
  }

  if (count > 0) {
    clues.push(count);
  }

  return clues.length > 0 ? clues : [0];
}

function createPuzzle(
  name: string,
  rows: readonly string[],
): Puzzle {
  const solution = rows.map((row) =>
    [...row].map((cell) => cell === "1"),
  );

  return {
    name,
    solution,
    rowClues: solution.map(getClues),
    columnClues: Array.from({ length: SIZE }, (_, column) =>
      getClues(solution.map((row) => row[column])),
    ),
  };
}

const PUZZLES: Puzzle[] = PUZZLE_PATTERNS.map(({ name, rows }) =>
  createPuzzle(name, rows),
);

function emptyBoard(): Board {
  return Array.from({ length: SIZE }, () =>
    Array<Cell>(SIZE).fill(0),
  );
}

function isSolved(board: Board, solution: Solution): boolean {
  return board.every((row, r) =>
    row.every((cell, c) => cell !== 0 && (cell === 1) === solution[r][c]),
  );
}

function calculateScore(
  board: Board,
  solution: Solution,
  mistakes: number,
): number {
  const correctCells = board.reduce(
    (total, row, r) =>
      total +
      row.filter(
        (cell, c) => cell !== 0 && (cell === 1) === solution[r][c],
      ).length,
    0,
  );

  return Math.min(
    1000,
    correctCells * POINTS_PER_CELL +
      (mistakes === 0 ? COMPLETION_BONUS : 0),
  );
}

function choosePuzzle(previousName: string | null): Puzzle {
  const available = PUZZLES.filter(
    (puzzle) => puzzle.name !== previousName,
  );

  return available[Math.floor(Math.random() * available.length)];
}

export default function NonogramGamePage() {
  const { player } = usePlayer();

  const [gameState, setGameState] = useState<GameState>("ready");
  const [puzzle, setPuzzle] = useState<Puzzle>(() => choosePuzzle(null));
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(
    null,
  );
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState("");
  const [savingScore, setSavingScore] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [coinsAwarded, setCoinsAwarded] = useState<number | null>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);

  const scoreSubmitted = useRef(false);
  const savingScoreRef = useRef(false);

  const score = calculateScore(board, puzzle.solution, mistakes);
  const markedCells = board.reduce(
    (total, row) => total + row.filter((cell) => cell !== 0).length,
    0,
  );

  const startGame = useCallback(() => {
    setPuzzle((current) => choosePuzzle(current.name));
    setBoard(emptyBoard());
    setSelectedCell(null);
    setMistakes(0);
    setMessage("");
    setSavingScore(false);
    setScoreSaved(false);
    setCoinsAwarded(null);
    setScoreError(null);
    scoreSubmitted.current = false;
    savingScoreRef.current = false;
    setGameState("playing");
  }, []);

  const resetGame = useCallback(() => {
    setGameState("ready");
    setBoard(emptyBoard());
    setSelectedCell(null);
    setMistakes(0);
    setMessage("");
    setSavingScore(false);
    setScoreSaved(false);
    setCoinsAwarded(null);
    setScoreError(null);
    scoreSubmitted.current = false;
    savingScoreRef.current = false;
  }, []);

  const toggleCell = useCallback(
    (row: number, column: number) => {
      if (gameState !== "playing") return;

      setBoard((current) => {
        const next = current.map((line) => [...line]) as Board;
        next[row][column] = ((next[row][column] + 1) % 3) as Cell;
        return next;
      });

      setSelectedCell([row, column]);
      setMessage("");
    },
    [gameState],
  );

  const checkBoard = useCallback(() => {
    if (gameState !== "playing") return;

    if (board.some((row) => row.some((cell) => cell === 0))) {
      setMessage("Todavía quedan casillas sin marcar.");
      return;
    }

    if (isSolved(board, puzzle.solution)) {
      setGameState("finished");
      setMessage("¡Excelente! Descubriste la imagen oculta.");
    } else {
      setMistakes((current) => current + 1);
      setMessage(
        "Hay casillas incorrectas. Revisá las pistas e intentá de nuevo.",
      );
    }
  }, [board, gameState, puzzle]);

  const submitScore = useCallback(async () => {
    if (
      !player ||
      gameState !== "finished" ||
      scoreSubmitted.current ||
      savingScoreRef.current
    ) {
      return;
    }

    scoreSubmitted.current = true;
    savingScoreRef.current = true;
    setSavingScore(true);
    setScoreError(null);

    try {
      const result = await registerMinigameScore({
        gameCode: "nonogram",
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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (gameState !== "playing") return;

      if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight"
      ) {
        event.preventDefault();

        setSelectedCell(([row, column] = [0, 0]) => {
          if (event.key === "ArrowUp") row = Math.max(0, row - 1);
          if (event.key === "ArrowDown") row = Math.min(SIZE - 1, row + 1);
          if (event.key === "ArrowLeft") column = Math.max(0, column - 1);
          if (event.key === "ArrowRight")
            column = Math.min(SIZE - 1, column + 1);

          return [row, column];
        });
      } else if (
        (event.key === " " || event.key === "Enter") &&
        selectedCell
      ) {
        event.preventDefault();
        toggleCell(...selectedCell);
      } else if (event.key.toLowerCase() === "x" && selectedCell) {
        event.preventDefault();
        const [row, column] = selectedCell;

        setBoard((current) => {
          const next = current.map((line) => [...line]) as Board;
          next[row][column] = 2;
          return next;
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, selectedCell, toggleCell]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">¡Nonograma!</h1>
          <p className="mt-1 text-muted-foreground">
            Descubrí la imagen oculta usando las pistas numéricas.
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
            <span className="text-2xl font-bold tabular-nums">
              {score.toLocaleString("es-AR")}
            </span>
            <span className="text-xs text-muted-foreground">Puntuación</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <span className="text-2xl font-bold tabular-nums">
              {markedCells}/{SIZE * SIZE}
            </span>
            <span className="text-xs text-muted-foreground">
              Casillas marcadas
            </span>
          </CardContent>
        </Card>
      </div>

      {gameState === "finished" && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="items-center text-center">
            <Trophy className="size-10 text-primary" />
            <CardTitle>¡Nonograma completado!</CardTitle>
            <p className="text-sm text-muted-foreground">
              Conseguíste {score.toLocaleString("es-AR")} puntos
              {mistakes === 0 ? " y el bonus por no cometer errores" : ""}.
            </p>

            {scoreSaved ? (
              <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
                <Coins className="size-5 text-yellow-500" />
                <span className="font-semibold tabular-nums">
                  +{(coinsAwarded ?? 0).toLocaleString("es-AR")}
                </span>
                <span className="text-sm text-muted-foreground">
                  monedas ganadas
                </span>
              </div>
            ) : savingScore ? (
              <p className="text-sm text-muted-foreground">
                Guardando puntuación...
              </p>
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

      <Card>
        <CardContent className="space-y-5 p-4 sm:p-6">
          {gameState === "ready" ? (
            <div className="flex min-h-80 flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-xl font-semibold">¡Hora de descubrir!</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Completá la cuadrícula de 6×6. Los números indican cuántas
                casillas consecutivas debés rellenar en cada fila y columna.
                Los grupos deben aparecer en el orden indicado y estar
                separados por al menos una casilla vacía.
              </p>
              <Button size="lg" onClick={startGame}>
                ¡Empezar!
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-lg font-semibold">{puzzle.name}</h2>
                <p className="text-xs text-muted-foreground">
                  Puzzle {PUZZLES.findIndex((item) => item.name === puzzle.name) + 1} de{" "}
                  {PUZZLES.length}
                </p>
              </div>

              <div className="mx-auto w-full max-w-sm">
                <div
                  role="group"
                  aria-label="Tablero de nonograma de 6 por 6"
                  className="grid gap-0"
                  style={{
                    gridTemplateColumns: "3.5rem repeat(6, minmax(0, 1fr))",
                    gridTemplateRows: "3.5rem repeat(6, minmax(0, 1fr))",
                  }}
                >
                  <div aria-hidden="true" />

                  {puzzle.columnClues.map((clue, column) => (
                    <div
                      key={`col-${column}`}
                      className="flex flex-col items-center justify-end gap-0.5 pb-2 text-sm font-semibold tabular-nums"
                      aria-label={`Columna ${column + 1}: ${clue.join(", ")}`}
                    >
                      {clue.map((number, index) => (
                        <span key={index}>{number}</span>
                      ))}
                    </div>
                  ))}

                  {board.map((row, r) => (
                    <Fragment key={`row-${r}`}>
                      <div
                        className="flex items-center justify-center gap-1 pr-2 text-sm font-semibold tabular-nums"
                        aria-label={`Fila ${r + 1}: ${puzzle.rowClues[r].join(", ")}`}
                      >
                        {puzzle.rowClues[r].map((number, index) => (
                          <span key={index}>{number}</span>
                        ))}
                      </div>

                      {row.map((cell, c) => {
                        const selected =
                          selectedCell?.[0] === r &&
                          selectedCell?.[1] === c;

                        return (
                          <button
                            key={`${r}-${c}`}
                            type="button"
                            aria-label={`Fila ${r + 1}, columna ${c + 1}: ${
                              cell === 0
                                ? "sin marcar"
                                : cell === 1
                                  ? "rellena"
                                  : "vacía"
                            }`}
                            aria-pressed={selected}
                            disabled={gameState !== "playing"}
                            onClick={() => toggleCell(r, c)}
                            className={[
                              "flex aspect-square min-h-8 items-center justify-center",
                              "border border-border transition-colors",
                              cell === 1
                                ? "bg-primary"
                                : cell === 2
                                  ? "bg-muted text-muted-foreground"
                                  : "bg-card hover:bg-primary/10",
                              selected
                                ? "z-10 ring-2 ring-inset ring-primary"
                                : "",
                            ].join(" ")}
                          >
                            {cell === 2 && (
                              <span className="text-sm leading-none">×</span>
                            )}
                          </button>
                        );
                      })}
                    </Fragment>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="size-3 rounded-sm bg-primary" />
                    Rellena
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="flex size-3 items-center justify-center rounded-sm border border-border">
                      ×
                    </span>
                    Vacía
                  </span>
                  <span>Sin marcar = desconocida</span>
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Tocá una casilla para alternar entre rellena, vacía y sin
                marcar.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  disabled={!selectedCell || gameState !== "playing"}
                  onClick={() => {
                    if (!selectedCell) return;
                    const [r, c] = selectedCell;

                    setBoard((current) => {
                      const next = current.map((line) => [...line]) as Board;
                      next[r][c] = 0;
                      return next;
                    });
                  }}
                >
                  Desmarcar
                </Button>

                <Button
                  disabled={gameState !== "playing"}
                  onClick={checkBoard}
                >
                  <CheckCircle2 className="mr-2 size-4" />
                  Comprobar
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                <span>Errores: {mistakes}</span>
                <span>Bonus sin errores: +{COMPLETION_BONUS}</span>
              </div>

              {message && (
                <p
                  role="status"
                  className="rounded-lg bg-muted p-3 text-center text-sm"
                >
                  {message}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
