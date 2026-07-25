import type { GameStatus, Position, ViolationKind } from '@/types/game';

export const BOARD_SIZES = [4, 5, 6, 7, 8, 9, 10] as const;

export function positionKey(row: number, col: number): string {
  return `${row}:${col}`;
}

export function cycleCellState(
  queens: ReadonlySet<string>,
  manualMarks: ReadonlySet<string>,
  key: string,
): { queens: Set<string>; manualMarks: Set<string> } {
  const nextQueens = new Set(queens);
  const nextMarks = new Set(manualMarks);

  if (nextQueens.delete(key)) {
    nextMarks.add(key);
  } else if (!nextMarks.delete(key)) {
    nextQueens.add(key);
  }

  return { queens: nextQueens, manualMarks: nextMarks };
}

export function parsePositionKey(key: string): Position {
  const [row, col] = key.split(':').map(Number);
  return [row, col];
}

export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function createHints(): Record<ViolationKind, Set<string>> {
  return {
    row: new Set(),
    column: new Set(),
    region: new Set(),
    adjacent: new Set(),
  };
}

function addHint(
  board: number[][],
  hints: Record<ViolationKind, Set<string>>,
  kind: ViolationKind,
  first: Position,
  second: Position,
): void {
  if (kind === 'row') {
    for (let col = 0; col < board.length; col += 1) {
      hints.row.add(positionKey(first[0], col));
    }
    return;
  }

  if (kind === 'column') {
    for (let row = 0; row < board.length; row += 1) {
      hints.column.add(positionKey(row, first[1]));
    }
    return;
  }

  if (kind === 'region') {
    const region = board[first[0]][first[1]];
    board.forEach((row, rowIndex) => {
      row.forEach((cellRegion, colIndex) => {
        if (cellRegion === region) {
          hints.region.add(positionKey(rowIndex, colIndex));
        }
      });
    });
    return;
  }

  hints.adjacent.add(positionKey(first[0], first[1]));
  hints.adjacent.add(positionKey(second[0], second[1]));
}

export function evaluateGame(board: number[][], queens: Set<string>): GameStatus {
  const conflicts = new Set<string>();
  const conflictHints = createHints();
  const violations: Record<ViolationKind, number> = {
    row: 0,
    column: 0,
    region: 0,
    adjacent: 0,
  };
  const rows = new Map<number, string[]>();
  const columns = new Map<number, string[]>();
  const regions = new Map<number, string[]>();

  for (const key of queens) {
    const [row, col] = parsePositionKey(key);
    const region = board[row]?.[col];
    rows.set(row, [...(rows.get(row) ?? []), key]);
    columns.set(col, [...(columns.get(col) ?? []), key]);
    regions.set(region, [...(regions.get(region) ?? []), key]);
  }

  const positions = [...queens].map(parsePositionKey);
  for (let firstIndex = 0; firstIndex < positions.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < positions.length; secondIndex += 1) {
      const first = positions[firstIndex];
      const second = positions[secondIndex];
      const reasons: ViolationKind[] = [];

      if (first[0] === second[0]) reasons.push('row');
      if (first[1] === second[1]) reasons.push('column');
      const isAdjacent =
        Math.abs(first[0] - second[0]) <= 1 && Math.abs(first[1] - second[1]) <= 1;
      if (isAdjacent) reasons.push('adjacent');
      if (board[first[0]][first[1]] === board[second[0]][second[1]]) reasons.push('region');

      if (reasons.length > 0) {
        conflicts.add(positionKey(first[0], first[1]));
        conflicts.add(positionKey(second[0], second[1]));
        addHint(board, conflictHints, reasons[0], first, second);
        violations[reasons[0]] += 1;
      }
    }
  }

  const onePerRow = rows.size === board.length && [...rows.values()].every((items) => items.length === 1);
  const onePerColumn =
    columns.size === board.length && [...columns.values()].every((items) => items.length === 1);
  const onePerRegion =
    regions.size === board.length && [...regions.values()].every((items) => items.length === 1);

  return {
    conflicts,
    conflictHints,
    violations,
    queenCount: queens.size,
    isSolved:
      queens.size === board.length &&
      conflicts.size === 0 &&
      onePerRow &&
      onePerColumn &&
      onePerRegion,
  };
}

export function getConflictCells(status: GameStatus): Set<string> {
  return new Set(
    Object.values(status.conflictHints).flatMap((positions) => [...positions]),
  );
}

export function getForbiddenMarks(board: number[][], queens: Set<string>): Set<string> {
  const marks = new Set<string>();

  for (const key of queens) {
    const [queenRow, queenCol] = parsePositionKey(key);
    const queenRegion = board[queenRow][queenCol];

    for (let index = 0; index < board.length; index += 1) {
      marks.add(positionKey(queenRow, index));
      marks.add(positionKey(index, queenCol));
    }

    board.forEach((row, rowIndex) => {
      row.forEach((region, colIndex) => {
        const sameRegion = region === queenRegion;
        const adjacent =
          Math.abs(rowIndex - queenRow) <= 1 && Math.abs(colIndex - queenCol) <= 1;
        if (sameRegion || adjacent) marks.add(positionKey(rowIndex, colIndex));
      });
    });
  }

  queens.forEach((queen) => marks.delete(queen));
  return marks;
}

export function toPositionSet(positions: readonly Position[] | null): Set<string> {
  return new Set((positions ?? []).map(([row, col]) => positionKey(row, col)));
}
