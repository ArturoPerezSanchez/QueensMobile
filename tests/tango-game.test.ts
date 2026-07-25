import assert from 'node:assert/strict';
import test from 'node:test';

import {
  evaluateTango,
  nextTangoCell,
} from '../src/lib/tango-game';
import type { TangoCell, TangoConstraint } from '../src/types/tango';

test('recognizes a completed valid Tango board', () => {
  const board: TangoCell[][] = [
    [0, 0, 1, 1],
    [1, 1, 0, 0],
    [0, 1, 0, 1],
    [1, 0, 1, 0],
  ];
  const constraints: TangoConstraint[] = [
    { row: 0, col: 0, direction: 'horizontal', relation: 'same' },
    { row: 2, col: 1, direction: 'vertical', relation: 'different' },
  ];

  const status = evaluateTango(board, constraints);

  assert.equal(status.isSolved, true);
  assert.equal(status.conflicts.size, 0);
  assert.equal(status.filledCount, 16);
});

test('marks Tango triple and balance conflicts', () => {
  const board: TangoCell[][] = [
    [1, 1, 1, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
  ];
  const status = evaluateTango(board, []);

  assert.equal(status.violations.triple, 1);
  assert.equal(status.violations.balance, 1);
  assert.deepEqual([...status.conflicts].sort(), ['0:0', '0:1', '0:2']);
});

test('marks both cells when a Tango relationship is broken', () => {
  const board: TangoCell[][] = [
    [1, 0, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
  ];
  const constraints: TangoConstraint[] = [
    { row: 0, col: 0, direction: 'horizontal', relation: 'same' },
  ];
  const status = evaluateTango(board, constraints);

  assert.equal(status.violations.relation, 1);
  assert.deepEqual([...status.conflicts].sort(), ['0:0', '0:1']);
});

test('cycles Tango cells forward and backward', () => {
  assert.equal(nextTangoCell(null), 1);
  assert.equal(nextTangoCell(1), 0);
  assert.equal(nextTangoCell(0), null);
  assert.equal(nextTangoCell(null, true), 0);
  assert.equal(nextTangoCell(0, true), 1);
  assert.equal(nextTangoCell(1, true), null);
});
