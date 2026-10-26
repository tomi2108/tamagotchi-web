import { useCallback, useEffect, useRef, useState } from "react";
import { Coins, RotateCcw, Trophy, Eraser, CheckCircle2 } from "lucide-react";
import { registerMinigameScore } from "@/api/minigames";
import { usePlayer } from "@/components/PlayerContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SIZE = 4;
const BOX_SIZE = 2;
const NUMBERS = [1, 2, 3, 4] as const;
const COMPLETION_BONUS = 200;
const POINTS_PER_CELL = 50;
const CLUES = 5;

type CellValue = number | null;
type Board = CellValue[][];
type GameState = "ready" | "playing" | "finished";

type Puzzle = {
  board: Board;
  solution: number[][];
};

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function isValidPlacement(
  board: Board,
  row: number,
  col: number,
  value: number,
): boolean {
  for (let i = 0; i < SIZE; i++) {
    if (i !== col && board[row][i] === value) return false;
    if (i !== row && board[i][col] === value) return false;
  }

  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

  for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
    for (let c = boxCol; c < boxCol + BOX_SIZE; c++) {
      if ((r !== row || c !== col) && board[r][c] === value) {
        return false;
      }
    }
  }

  return true;
}

function fillBoard(board: Board): boolean {
  let bestCell: [number, number] | null = null;
  let bestCandidates: number[] = [];

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] !== null) continue;

      const candidates = shuffle([...NUMBERS]).filter((number) =>
        isValidPlacement(board, r, c, number),
      );

      if (candidates.length === 0) return false;

      if (bestCell === null || candidates.length < bestCandidates.length) {
        bestCell = [r, c];
        bestCandidates = candidates;
      }
    }
  }

  if (!bestCell) return true;

  const [row, col] = bestCell;

  for (const number of bestCandidates) {
    board[row][col] = number;

    if (fillBoard(board)) return true;
  }

  board[row][col] = null;
  return false;
}

function countSolutions(board: Board, limit = 2): number {
  let count = 0;

  function solve(): void {
    if (count >= limit) return;

    let bestCell: [number, number] | null = null;
    let bestCandidates: number[] = [];

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] !== null) continue;

        const candidates = NUMBERS.filter((number) =>
          isValidPlacement(board, r, c, number),
        );

        if (candidates.length === 0) return;

        if (bestCell === null || candidates.length < bestCandidates.length) {
          bestCell = [r, c];
          bestCandidates = [...candidates];
        }
      }
    }

    if (!bestCell) {
      count++;
      return;
    }

    const [row, col] = bestCell;

    for (const number of bestCandidates) {
      board[row][col] = number;
      solve();
      board[row][col] = null;

      if (count >= limit) return;
    }
  }

  solve();
  return count;
}

function generatePuzzle(): Puzzle {
  const solutionBoard: Board = Array.from({ length: SIZE }, () =>
    Array<CellValue>(SIZE).fill(null),
  );

  fillBoard(solutionBoard);

  const solution = solutionBoard.map((row) =>
    row.map((value) => value as number),
  );

  const board = solution.map((row) => [...row] as CellValue[][][number]);
  const cells = shuffle(
    Array.from({ length: SIZE * SIZE }, (_, index) => index),
  );

  let clues = SIZE * SIZE;

  for (const cell of cells) {
    if (clues <= CLUES) break;

    const row = Math.floor(cell / SIZE);
    const col = cell % SIZE;
    const previous = board[row][col];

    board[row][col] = null;

    if (countSolutions(board) === 1) {
      clues--;
    } else {
      board[row][col] = previous;
    }
  }

  return { board, solution };
}

function isSolved(board: Board, solution: number[][]): boolean {
  return board.every((row, r) =>
    row.every((value, c) => value === solution[r][c]),
  );
}

function calculateScore(
  board: Board,
  solution: number[][],
  initialBoard: Board,
  mistakes: number,
): number {
  const correctCells = board.reduce(
    (total, row, r) =>
      total +
      row.filter(
        (value, c) => initialBoard[r][c] === null && value === solution[r][c],
      ).length,
    0,
  );

  const score = correctCells * POINTS_PER_CELL;
  return Math.min(1000, score + (mistakes === 0 ? COMPLETION_BONUS : 0));
}

export default function SudokuGamePage() {
  const { player } = usePlayer();

  const [gameState, setGameState] = useState<GameState>("ready");
  const [puzzle, setPuzzle] = useState<Puzzle>(generatePuzzle);
  const [board, setBoard] = useState<Board>(() =>
    puzzle.board.map((row) => [...row]),
  );
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

  const score = calculateScore(board, puzzle.solution, puzzle.board, mistakes);

  const startGame = useCallback(() => {
    const nextPuzzle = generatePuzzle();

    setPuzzle(nextPuzzle);
    setBoard(nextPuzzle.board.map((row) => [...row]));
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
        gameCode: "sudoku",
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

  const enterNumber = useCallback(
    (value: number) => {
      if (gameState !== "playing" || !selectedCell) return;

      const [row, col] = selectedCell;

      if (puzzle.board[row][col] !== null) return;

      if (!isValidPlacement(board, row, col, value)) {
        setMistakes((current) => current + 1);
        setMessage("Ese número ya aparece en la fila, columna o caja de 2×2.");
        return;
      }

      const nextBoard = board.map((line) => [...line]);
      nextBoard[row][col] = value;

      setBoard(nextBoard);
      setMessage("");

      if (isSolved(nextBoard, puzzle.solution)) {
        setGameState("finished");
        setMessage("¡Excelente! Completaste el Sudoku.");
      }
    },
    [board, gameState, puzzle, selectedCell],
  );

  const eraseCell = useCallback(() => {
    if (gameState !== "playing" || !selectedCell) return;

    const [row, col] = selectedCell;

    if (puzzle.board[row][col] !== null) return;

    setBoard((current) =>
      current.map((line, r) =>
        line.map((value, c) => (r === row && c === col ? null : value)),
      ),
    );

    setMessage("");
  }, [gameState, puzzle, selectedCell]);

  const checkBoard = useCallback(() => {
    if (gameState !== "playing") return;

    const complete = board.every((row) => row.every((value) => value !== null));

    if (!complete) {
      setMessage("Todavía quedan casillas vacías. ¡Seguí jugando!");
      return;
    }

    if (isSolved(board, puzzle.solution)) {
      setGameState("finished");
      setMessage("¡Excelente! Completaste el Sudoku.");
    } else {
      setMistakes((current) => current + 1);
      setMessage(
        "Hay números incorrectos. Revisá el tablero e intentá de nuevo.",
      );
    }
  }, [board, gameState, puzzle]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (gameState !== "playing") return;

      if (/^[1-4]$/.test(event.key)) {
        enterNumber(Number(event.key));
      } else if (event.key === "Backspace" || event.key === "Delete") {
        eraseCell();
      } else if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight"
      ) {
        event.preventDefault();

        setSelectedCell(([row, col]) => {
          if (row === undefined || col === undefined) return [0, 0];

          if (event.key === "ArrowUp") row = Math.max(0, row - 1);
          if (event.key === "ArrowDown") row = Math.min(SIZE - 1, row + 1);
          if (event.key === "ArrowLeft") col = Math.max(0, col - 1);
          if (event.key === "ArrowRight") col = Math.min(SIZE - 1, col + 1);

          return [row, col];
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, enterNumber, eraseCell]);

  const filledCells = board.reduce(
    (total, row) => total + row.filter((value) => value !== null).length,
    0,
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            ¡Sudoku express!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Completá el tablero y entrená tu mente.
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
              {filledCells}/16
            </span>
            <span className="text-xs text-muted-foreground">
              Casillas ocupadas
            </span>
          </CardContent>
        </Card>
      </div>
      {gameState === "finished" && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="items-center text-center">
            <Trophy className="size-10 text-primary" />
            <CardTitle>¡Sudoku completado!</CardTitle>
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
              <h2 className="text-xl font-semibold">¡Hora de pensar!</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Completá las casillas vacías con números del 1 al 4. No repitas
                números en filas, columnas ni cajas de 2×2.
              </p>
              <Button size="lg" onClick={startGame}>
                ¡Empezar!
              </Button>
            </div>
          ) : (
            <>
              <div className="mx-auto max-w-xs">
                <div
                  role="group"
                  aria-label="Tablero de Sudoku de 4 por 4"
                  className="grid grid-cols-4 gap-0 rounded-lg border-2 border-primary bg-border p-0.5"
                >
                  {board.map((row, r) =>
                    row.map((value, c) => {
                      const selected =
                        selectedCell?.[0] === r && selectedCell?.[1] === c;
                      const given = puzzle.board[r][c] !== null;
                      const correct = value === puzzle.solution[r][c];

                      return (
                        <button
                          key={`${r}-${c}`}
                          type="button"
                          aria-label={`Fila ${r + 1}, columna ${c + 1}, ${
                            value ?? "vacía"
                          }${given ? ", número fijo" : ""}`}
                          aria-pressed={selected}
                          disabled={gameState !== "playing" || given}
                          onClick={() => {
                            setSelectedCell([r, c]);
                            setMessage("");
                          }}
                          className={[
                            "flex aspect-square min-h-14 items-center justify-center",
                            "rounded-none border-r border-b border-border text-xl font-semibold transition-colors sm:text-2xl",
                            c === 1 ? "border-r-[3px] border-r-primary" : "",
                            r === 1 ? "border-b-[3px] border-b-primary" : "",
                            given
                              ? "bg-muted font-bold text-foreground"
                              : "bg-card text-primary hover:bg-primary/10",
                            selected
                              ? "z-10 bg-primary/10 ring-2 ring-inset ring-primary"
                              : "",
                            value !== null && !given && !correct
                              ? "text-destructive"
                              : "",
                          ].join(" ")}
                        >
                          {value ?? ""}
                        </button>
                      );
                    }),
                  )}
                </div>

                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Seleccioná una casilla vacía y elegí un número.
                </p>
              </div>

              <div className="mx-auto grid max-w-xs grid-cols-4 gap-2">
                {NUMBERS.map((number) => (
                  <Button
                    key={number}
                    variant="outline"
                    className="h-12 text-lg font-bold"
                    disabled={!selectedCell || gameState !== "playing"}
                    onClick={() => enterNumber(number)}
                  >
                    {number}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  disabled={!selectedCell || gameState !== "playing"}
                  onClick={eraseCell}
                >
                  <Eraser className="mr-2 size-4" />
                  Borrar
                </Button>

                <Button disabled={gameState !== "playing"} onClick={checkBoard}>
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
