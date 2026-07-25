import assert from 'node:assert/strict';
import test from 'node:test';

import {
  cycleCellState,
  evaluateGame,
  formatTime,
  getConflictCells,
  getForbiddenMarks,
  positionKey,
} from '../src/lib/game';

const board = [
  [1, 1, 0, 0],
  [1, 1, 0, 2],
  [1, 1, 1, 2],
  [3, 3, 3, 3],
];

test('formats elapsed time with stable tabular fields', () => {
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(65), '01:05');
});

test('cycles a tapped cell from empty to queen to mark to empty', () => {
  const key = positionKey(2, 1);
  let state = cycleCellState(new Set(), new Set(), key);

  assert.equal(state.queens.has(key), true);
  assert.equal(state.manualMarks.has(key), false);

  state = cycleCellState(state.queens, state.manualMarks, key);
  assert.equal(state.queens.has(key), false);
  assert.equal(state.manualMarks.has(key), true);

  state = cycleCellState(state.queens, state.manualMarks, key);
  assert.equal(state.queens.has(key), false);
  assert.equal(state.manualMarks.has(key), false);
});

test('recognizes a complete valid solution', () => {
  const queens = new Set([
    positionKey(0, 2),
    positionKey(1, 0),
    positionKey(2, 3),
    positionKey(3, 1),
  ]);
  const status = evaluateGame(board, queens);

  assert.equal(status.isSolved, true);
  assert.equal(status.conflicts.size, 0);
});

test('uses one consistent conflict reason for a pair', () => {
  const status = evaluateGame(
    board,
    new Set([positionKey(0, 0), positionKey(0, 1)]),
  );
  const highlighted = getConflictCells(status);

  assert.equal(status.violations.row, 1);
  assert.equal(status.violations.region, 0);
  assert.equal(highlighted.size, 4);
  assert.deepEqual(
    [...highlighted].sort(),
    [0, 1, 2, 3].map((col) => positionKey(0, col)).sort(),
  );
});

test('adjacent-only conflicts highlight just the two queens', () => {
  const status = evaluateGame(
    board,
    new Set([positionKey(0, 2), positionKey(1, 1)]),
  );

  assert.deepEqual(
    [...getConflictCells(status)].sort(),
    [positionKey(0, 2), positionKey(1, 1)].sort(),
  );
});

test('diagonal neighbors take visual priority over their shared region', () => {
  const status = evaluateGame(
    board,
    new Set([positionKey(0, 0), positionKey(1, 1)]),
  );

  assert.equal(status.violations.adjacent, 1);
  assert.equal(status.violations.region, 0);
  assert.deepEqual(
    [...getConflictCells(status)].sort(),
    [positionKey(0, 0), positionKey(1, 1)].sort(),
  );
});

test('auto marks rows, columns, regions, and neighboring cells', () => {
  const queen = positionKey(1, 3);
  const marks = getForbiddenMarks(board, new Set([queen]));

  assert.equal(marks.has(queen), false);
  assert.equal(marks.has(positionKey(1, 0)), true);
  assert.equal(marks.has(positionKey(0, 3)), true);
  assert.equal(marks.has(positionKey(2, 3)), true);
  assert.equal(marks.has(positionKey(2, 2)), true);
});
