import type { Puzzle, QueensResponse } from '@/types/game';

export const QUEENS_API_URL =
  process.env.EXPO_PUBLIC_QUEENS_API_URL ?? 'https://api.arturops.com/queens';

function assertBoard(board: unknown, size: number): asserts board is number[][] {
  if (
    !Array.isArray(board) ||
    board.length !== size ||
    board.some(
      (row) =>
        !Array.isArray(row) ||
        row.length !== size ||
        row.some((region) => !Number.isInteger(region)),
    )
  ) {
    throw new Error('The server returned an invalid board.');
  }
}

function parseSolution(solution: unknown, size: number): QueensResponse['solution'] {
  if (solution === null || solution === undefined) return null;
  if (
    !Array.isArray(solution) ||
    solution.length !== size ||
    solution.some(
      (position) =>
        !Array.isArray(position) ||
        position.length !== 2 ||
        !position.every((value) => Number.isInteger(value) && value >= 0 && value < size),
    )
  ) {
    throw new Error('The server returned an invalid solution.');
  }
  return solution as QueensResponse['solution'];
}

export async function fetchPuzzle(size: number, signal?: AbortSignal): Promise<Puzzle> {
  const params = new URLSearchParams({
    board_size: String(size),
    solution: 'true',
  });
  const response = await fetch(`${QUEENS_API_URL}?${params.toString()}`, { signal });

  if (!response.ok) {
    throw new Error(`Could not create a puzzle (${response.status}).`);
  }

  const payload = (await response.json()) as Partial<QueensResponse>;
  assertBoard(payload.board, size);

  return {
    board: payload.board,
    solution: parseSolution(payload.solution, size),
    size,
  };
}
