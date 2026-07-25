import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { fetchPuzzle } from '@/lib/api';
import {
  cycleCellState,
  evaluateGame,
  getConflictCells,
  getForbiddenMarks,
  positionKey,
  toPositionSet,
} from '@/lib/game';
import type { LoadState, Preferences, Puzzle } from '@/types/game';

const BEST_TIMES_KEY = 'queens.best-times.v1';
const PREFERENCES_KEY = 'queens.preferences.v1';
const DEFAULT_PREFERENCES: Preferences = {
  autoMark: false,
  haptics: true,
  patterns: false,
};

type BestTimes = Record<string, number>;
type MarkMode = 'add' | 'remove' | 'toggle';

function parseStoredValue<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function useQueensGame() {
  const [size, setSize] = useState(8);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [queens, setQueens] = useState<Set<string>>(() => new Set());
  const [manualMarks, setManualMarks] = useState<Set<string>>(() => new Set());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [bestTimes, setBestTimes] = useState<BestTimes>({});
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [showConflictPanel, setShowConflictPanel] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const startedAtRef = useRef(0);
  const celebratedRef = useRef(false);

  const status = useMemo(
    () => (puzzle ? evaluateGame(puzzle.board, queens) : null),
    [puzzle, queens],
  );
  const solutionCells = useMemo(
    () => toPositionSet(puzzle?.solution ?? null),
    [puzzle?.solution],
  );
  const automaticMarks = useMemo(
    () =>
      puzzle && preferences.autoMark
        ? getForbiddenMarks(puzzle.board, queens)
        : new Set<string>(),
    [preferences.autoMark, puzzle, queens],
  );
  const marks = useMemo(() => {
    const next = new Set([...manualMarks, ...automaticMarks]);
    queens.forEach((queen) => next.delete(queen));
    return next;
  }, [automaticMarks, manualMarks, queens]);
  const conflictCells = useMemo(
    () => (status ? getConflictCells(status) : new Set<string>()),
    [status],
  );

  const haptic = useCallback(
    (kind: 'selection' | 'warning' | 'success') => {
      if (!preferences.haptics) return;

      if (kind === 'selection') {
        void Haptics.selectionAsync();
      } else {
        void Haptics.notificationAsync(
          kind === 'success'
            ? Haptics.NotificationFeedbackType.Success
            : Haptics.NotificationFeedbackType.Warning,
        );
      }
    },
    [preferences.haptics],
  );

  const loadPuzzle = useCallback(async (nextSize: number) => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;

    setLoadState('loading');
    setError(null);
    setShowConflictPanel(false);
    setSolutionRevealed(false);
    celebratedRef.current = false;

    try {
      const nextPuzzle = await fetchPuzzle(nextSize, controller.signal);
      if (controller.signal.aborted) return;

      setPuzzle(nextPuzzle);
      setQueens(new Set());
      setManualMarks(new Set());
      setElapsedSeconds(0);
      startedAtRef.current = Date.now();
      setLoadState('ready');
    } catch (loadError) {
      if (controller.signal.aborted) return;
      setError(loadError instanceof Error ? loadError.message : 'Could not load a puzzle.');
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void Promise.all([
      AsyncStorage.getItem(BEST_TIMES_KEY),
      AsyncStorage.getItem(PREFERENCES_KEY),
    ]).then(([storedBestTimes, storedPreferences]) => {
      setBestTimes(parseStoredValue(storedBestTimes, {}));
      setPreferences({
        ...DEFAULT_PREFERENCES,
        ...parseStoredValue<Partial<Preferences>>(storedPreferences, {}),
      });
    });
  }, []);

  useEffect(() => {
    const startRequest = setTimeout(() => void loadPuzzle(size), 0);
    return () => {
      clearTimeout(startRequest);
      requestRef.current?.abort();
    };
  }, [loadPuzzle, size]);

  useEffect(() => {
    if (loadState !== 'ready' || !puzzle || status?.isSolved || solutionRevealed) return;

    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 250);
    return () => clearInterval(timer);
  }, [loadState, puzzle, solutionRevealed, status?.isSolved]);

  useEffect(() => {
    if (!status?.isSolved || solutionRevealed || celebratedRef.current) return;
    celebratedRef.current = true;
    haptic('success');

    setBestTimes((current) => {
      const key = String(size);
      if (current[key] !== undefined && current[key] <= elapsedSeconds) return current;
      const next = { ...current, [key]: elapsedSeconds };
      void AsyncStorage.setItem(BEST_TIMES_KEY, JSON.stringify(next));
      return next;
    });
  }, [elapsedSeconds, haptic, size, solutionRevealed, status?.isSolved]);

  const chooseSize = useCallback((nextSize: number) => {
    setSize(nextSize);
  }, []);

  const newGame = useCallback(() => {
    void loadPuzzle(size);
  }, [loadPuzzle, size]);

  const retry = useCallback(() => {
    if (!puzzle || solutionRevealed) return;
    setQueens(new Set());
    setManualMarks(new Set());
    setShowConflictPanel(false);
    celebratedRef.current = false;
  }, [puzzle, solutionRevealed]);

  const revealSolution = useCallback(() => {
    if (!puzzle?.solution) return;
    setQueens(new Set(solutionCells));
    setManualMarks(new Set());
    setSolutionRevealed(true);
    setShowConflictPanel(false);
    haptic('warning');
  }, [haptic, puzzle?.solution, solutionCells]);

  const cycleCell = useCallback(
    (row: number, col: number) => {
      if (!puzzle || loadState !== 'ready' || status?.isSolved || solutionRevealed) return;
      const key = positionKey(row, col);
      const next = cycleCellState(queens, manualMarks, key);
      const placedQueen = !queens.has(key) && next.queens.has(key);

      setQueens(next.queens);
      setManualMarks(next.manualMarks);

      const nextStatus = evaluateGame(puzzle.board, next.queens);
      haptic(placedQueen && nextStatus.conflicts.size > 0 ? 'warning' : 'selection');
    },
    [
      haptic,
      loadState,
      manualMarks,
      puzzle,
      queens,
      solutionRevealed,
      status?.isSolved,
    ],
  );

  const changeMark = useCallback(
    (row: number, col: number, mode: MarkMode = 'toggle') => {
      if (!puzzle || loadState !== 'ready' || status?.isSolved || solutionRevealed) return;
      const key = positionKey(row, col);
      if (queens.has(key)) return;

      setManualMarks((current) => {
        const next = new Set(current);
        const shouldAdd = mode === 'add' || (mode === 'toggle' && !next.has(key));
        if (shouldAdd) next.add(key);
        else next.delete(key);
        return next;
      });
    },
    [loadState, puzzle, queens, solutionRevealed, status?.isSolved],
  );

  const setPreference = useCallback((key: keyof Preferences, value: boolean) => {
    setPreferences((current) => {
      const next = { ...current, [key]: value };
      void AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return {
    size,
    puzzle,
    queens,
    manualMarks,
    marks,
    elapsedSeconds,
    bestTime: bestTimes[String(size)],
    preferences,
    loadState,
    error,
    solutionRevealed,
    status,
    conflictCells,
    solutionCells,
    showConflictPanel: showConflictPanel && Boolean(status?.conflicts.size),
    setShowConflictPanel,
    chooseSize,
    newGame,
    retry,
    revealSolution,
    cycleCell,
    changeMark,
    setPreference,
    markHaptic: () => haptic('selection'),
  };
}
