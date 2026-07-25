import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { fetchTangoPuzzle } from '@/lib/tango-api';
import {
  cloneTangoBoard,
  evaluateTango,
  nextTangoCell,
} from '@/lib/tango-game';
import type { LoadState } from '@/types/game';
import type {
  TangoCell,
  TangoPreferences,
  TangoPuzzle,
} from '@/types/tango';

const BEST_TIMES_KEY = 'tango.best-times.v1';
const PREFERENCES_KEY = 'tango.preferences.v1';
const DEFAULT_PREFERENCES: TangoPreferences = {
  haptics: true,
};

type BestTimes = Record<string, number>;

function parseStoredValue<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function useTangoGame() {
  const [size, setSize] = useState(6);
  const [puzzle, setPuzzle] = useState<TangoPuzzle | null>(null);
  const [entries, setEntries] = useState<TangoCell[][]>([]);
  const [history, setHistory] = useState<TangoCell[][][]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [bestTimes, setBestTimes] = useState<BestTimes>({});
  const [preferences, setPreferences] =
    useState<TangoPreferences>(DEFAULT_PREFERENCES);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [showConflictPanel, setShowConflictPanel] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const startedAtRef = useRef(0);
  const celebratedRef = useRef(false);

  const status = useMemo(
    () => (puzzle ? evaluateTango(entries, puzzle.constraints) : null),
    [entries, puzzle],
  );
  const assisted = solutionRevealed || usedHint;

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
    setUsedHint(false);
    celebratedRef.current = false;

    try {
      const nextPuzzle = await fetchTangoPuzzle(nextSize, controller.signal);
      if (controller.signal.aborted) return;

      setPuzzle(nextPuzzle);
      setEntries(cloneTangoBoard(nextPuzzle.board));
      setHistory([]);
      setElapsedSeconds(0);
      startedAtRef.current = Date.now();
      setLoadState('ready');
    } catch (loadError) {
      if (controller.signal.aborted) return;
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Could not load a Tango puzzle.',
      );
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
        ...parseStoredValue<Partial<TangoPreferences>>(storedPreferences, {}),
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
    if (
      loadState !== 'ready' ||
      !puzzle ||
      status?.isSolved ||
      solutionRevealed
    ) {
      return;
    }

    const timer = setInterval(() => {
      setElapsedSeconds(
        Math.floor((Date.now() - startedAtRef.current) / 1000),
      );
    }, 250);
    return () => clearInterval(timer);
  }, [loadState, puzzle, solutionRevealed, status?.isSolved]);

  useEffect(() => {
    if (
      !status?.isSolved ||
      assisted ||
      solutionRevealed ||
      celebratedRef.current
    ) {
      return;
    }
    celebratedRef.current = true;
    haptic('success');

    setBestTimes((current) => {
      const key = String(size);
      if (current[key] !== undefined && current[key] <= elapsedSeconds) {
        return current;
      }
      const next = { ...current, [key]: elapsedSeconds };
      void AsyncStorage.setItem(BEST_TIMES_KEY, JSON.stringify(next));
      return next;
    });
  }, [
    assisted,
    elapsedSeconds,
    haptic,
    size,
    solutionRevealed,
    status?.isSolved,
  ]);

  const chooseSize = useCallback((nextSize: number) => {
    setSize(nextSize);
  }, []);

  const newGame = useCallback(() => {
    void loadPuzzle(size);
  }, [loadPuzzle, size]);

  const cycleCell = useCallback(
    (row: number, col: number, reverse = false) => {
      if (
        !puzzle ||
        loadState !== 'ready' ||
        puzzle.board[row][col] !== null ||
        status?.isSolved ||
        solutionRevealed
      ) {
        return;
      }

      const next = cloneTangoBoard(entries);
      next[row][col] = nextTangoCell(next[row][col], reverse);
      setHistory((current) => [...current, cloneTangoBoard(entries)]);
      setEntries(next);
      setShowConflictPanel(false);

      const nextStatus = evaluateTango(next, puzzle.constraints);
      haptic(nextStatus.conflicts.size > 0 ? 'warning' : 'selection');
    },
    [
      entries,
      haptic,
      loadState,
      puzzle,
      solutionRevealed,
      status?.isSolved,
    ],
  );

  const undo = useCallback(() => {
    const previous = history.at(-1);
    if (!previous || solutionRevealed) return;
    setEntries(previous);
    setHistory((current) => current.slice(0, -1));
    setShowConflictPanel(false);
    haptic('selection');
  }, [haptic, history, solutionRevealed]);

  const retry = useCallback(() => {
    if (!puzzle || solutionRevealed) return;
    setEntries(cloneTangoBoard(puzzle.board));
    setHistory([]);
    setShowConflictPanel(false);
    celebratedRef.current = false;
    haptic('selection');
  }, [haptic, puzzle, solutionRevealed]);

  const revealHint = useCallback(() => {
    if (!puzzle || solutionRevealed || status?.isSolved) return;

    for (let row = 0; row < puzzle.size; row += 1) {
      for (let col = 0; col < puzzle.size; col += 1) {
        if (
          puzzle.board[row][col] === null &&
          entries[row][col] !== puzzle.solution[row][col]
        ) {
          const next = cloneTangoBoard(entries);
          next[row][col] = puzzle.solution[row][col];
          setHistory((current) => [...current, cloneTangoBoard(entries)]);
          setEntries(next);
          setUsedHint(true);
          setShowConflictPanel(false);
          haptic('warning');
          return;
        }
      }
    }
  }, [entries, haptic, puzzle, solutionRevealed, status?.isSolved]);

  const revealSolution = useCallback(() => {
    if (!puzzle || solutionRevealed || status?.isSolved) return;
    setEntries(cloneTangoBoard(puzzle.solution));
    setHistory([]);
    setSolutionRevealed(true);
    setShowConflictPanel(false);
    haptic('warning');
  }, [haptic, puzzle, solutionRevealed, status?.isSolved]);

  const setHaptics = useCallback((value: boolean) => {
    const next = { haptics: value };
    setPreferences(next);
    void AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
  }, []);

  return {
    assisted,
    bestTime: bestTimes[String(size)],
    canUndo: history.length > 0 && !solutionRevealed,
    chooseSize,
    cycleCell,
    elapsedSeconds,
    entries,
    error,
    loadState,
    newGame,
    preferences,
    puzzle,
    retry,
    revealHint,
    revealSolution,
    setHaptics,
    setShowConflictPanel,
    showConflictPanel:
      showConflictPanel && Boolean(status?.conflicts.size) && !solutionRevealed,
    size,
    solutionRevealed,
    status,
    undo,
    usedHint,
  };
}
