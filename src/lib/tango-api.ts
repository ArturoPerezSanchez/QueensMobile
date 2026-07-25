import { Platform } from 'react-native';

import type {
  TangoCell,
  TangoConstraint,
  TangoPuzzle,
  TangoResponse,
  TangoSymbol,
} from '@/types/tango';

const LOCAL_TANGO_API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8000/tango'
    : 'http://127.0.0.1:8000/tango';

export const TANGO_API_URL =
  process.env.EXPO_PUBLIC_TANGO_API_URL ?? LOCAL_TANGO_API_URL;

function isCell(value: unknown): value is TangoCell {
  return value === null || value === 0 || value === 1;
}

function isBoard(value: unknown, size: number): value is TangoCell[][] {
  return (
    Array.isArray(value) &&
    value.length === size &&
    value.every(
      (row) =>
        Array.isArray(row) &&
        row.length === size &&
        row.every((cell) => isCell(cell)),
    )
  );
}

function isSolution(value: unknown, size: number): value is TangoSymbol[][] {
  return (
    Array.isArray(value) &&
    value.length === size &&
    value.every(
      (row) =>
        Array.isArray(row) &&
        row.length === size &&
        row.every((cell) => cell === 0 || cell === 1),
    )
  );
}

function isConstraint(value: unknown, size: number): value is TangoConstraint {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<TangoConstraint>;
  const secondRow =
    candidate.direction === 'vertical' ? Number(candidate.row) + 1 : candidate.row;
  const secondCol =
    candidate.direction === 'horizontal' ? Number(candidate.col) + 1 : candidate.col;

  return (
    Number.isInteger(candidate.row) &&
    Number.isInteger(candidate.col) &&
    (candidate.direction === 'horizontal' ||
      candidate.direction === 'vertical') &&
    (candidate.relation === 'same' || candidate.relation === 'different') &&
    Number(candidate.row) >= 0 &&
    Number(candidate.col) >= 0 &&
    Number(secondRow) < size &&
    Number(secondCol) < size
  );
}

export async function fetchTangoPuzzle(
  size: number,
  signal?: AbortSignal,
): Promise<TangoPuzzle> {
  const params = new URLSearchParams({
    board_size: String(size),
    solution: 'true',
  });
  const response = await fetch(`${TANGO_API_URL}?${params.toString()}`, { signal });

  if (!response.ok) {
    throw new Error(`Could not create a Tango puzzle (${response.status}).`);
  }

  const payload = (await response.json()) as Partial<TangoResponse>;
  if (
    payload.board_size !== size ||
    !isBoard(payload.board, size) ||
    !isSolution(payload.solution, size) ||
    !Array.isArray(payload.constraints) ||
    !payload.constraints.every((constraint) => isConstraint(constraint, size))
  ) {
    throw new Error('The server returned an invalid Tango puzzle.');
  }

  return {
    board: payload.board,
    constraints: payload.constraints,
    size,
    solution: payload.solution,
  };
}
