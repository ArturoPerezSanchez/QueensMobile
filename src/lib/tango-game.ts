import type {
  TangoCell,
  TangoConstraint,
  TangoRelation,
  TangoStatus,
  TangoSymbol,
  TangoViolationKind,
} from '@/types/tango';

export const TANGO_BOARD_SIZES = [4, 6, 8, 10] as const;

export function tangoPositionKey(row: number, col: number): string {
  return `${row}:${col}`;
}

export function cloneTangoBoard(board: TangoCell[][]): TangoCell[][] {
  return board.map((row) => [...row]);
}

function relationHolds(
  first: TangoSymbol,
  second: TangoSymbol,
  relation: TangoRelation,
): boolean {
  return relation === 'same' ? first === second : first !== second;
}

function addViolation(
  conflicts: Set<string>,
  violations: Record<TangoViolationKind, number>,
  kind: TangoViolationKind,
  positions: (readonly [number, number])[],
): void {
  violations[kind] += 1;
  positions.forEach(([row, col]) => conflicts.add(tangoPositionKey(row, col)));
}

export function evaluateTango(
  board: TangoCell[][],
  constraints: TangoConstraint[],
): TangoStatus {
  const size = board.length;
  const target = size / 2;
  const conflicts = new Set<string>();
  const violations: Record<TangoViolationKind, number> = {
    balance: 0,
    triple: 0,
    relation: 0,
  };

  for (let row = 0; row < size; row += 1) {
    for (const symbol of [0, 1] as const) {
      const matching = board[row]
        .map((value, col) => (value === symbol ? ([row, col] as const) : null))
        .filter(
          (position): position is readonly [number, number] => position !== null,
        );
      if (matching.length > target) {
        addViolation(conflicts, violations, 'balance', matching);
      }
    }

    for (let col = 0; col <= size - 3; col += 1) {
      const first = board[row][col];
      if (
        first !== null &&
        first === board[row][col + 1] &&
        first === board[row][col + 2]
      ) {
        addViolation(conflicts, violations, 'triple', [
          [row, col],
          [row, col + 1],
          [row, col + 2],
        ]);
      }
    }
  }

  for (let col = 0; col < size; col += 1) {
    for (const symbol of [0, 1] as const) {
      const matching: (readonly [number, number])[] = [];
      for (let row = 0; row < size; row += 1) {
        if (board[row][col] === symbol) matching.push([row, col]);
      }
      if (matching.length > target) {
        addViolation(conflicts, violations, 'balance', matching);
      }
    }

    for (let row = 0; row <= size - 3; row += 1) {
      const first = board[row][col];
      if (
        first !== null &&
        first === board[row + 1][col] &&
        first === board[row + 2][col]
      ) {
        addViolation(conflicts, violations, 'triple', [
          [row, col],
          [row + 1, col],
          [row + 2, col],
        ]);
      }
    }
  }

  for (const constraint of constraints) {
    const secondRow =
      constraint.direction === 'vertical' ? constraint.row + 1 : constraint.row;
    const secondCol =
      constraint.direction === 'horizontal' ? constraint.col + 1 : constraint.col;
    const first = board[constraint.row][constraint.col];
    const second = board[secondRow][secondCol];

    if (
      first !== null &&
      second !== null &&
      !relationHolds(first, second, constraint.relation)
    ) {
      addViolation(conflicts, violations, 'relation', [
        [constraint.row, constraint.col],
        [secondRow, secondCol],
      ]);
    }
  }

  const filledCount = board.flat().filter((cell) => cell !== null).length;
  return {
    conflicts,
    filledCount,
    isSolved: filledCount === size * size && conflicts.size === 0,
    violations,
  };
}

export function nextTangoCell(value: TangoCell, reverse = false): TangoCell {
  if (reverse) return value === null ? 0 : value === 0 ? 1 : null;
  return value === null ? 1 : value === 1 ? 0 : null;
}
