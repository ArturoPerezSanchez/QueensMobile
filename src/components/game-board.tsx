import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GestureResponderEvent,
  StyleSheet,
  View,
} from 'react-native';

import { colors, radius, regionColors } from '@/constants/theme';
import { positionKey } from '@/lib/game';

type MarkMode = 'add' | 'remove';

type GameBoardProps = {
  board: number[][];
  dimension: number;
  queens: Set<string>;
  manualMarks: Set<string>;
  marks: Set<string>;
  solutionCells: Set<string>;
  solutionRevealed: boolean;
  conflictCells: Set<string>;
  showPatterns: boolean;
  disabled: boolean;
  onCycleCell: (row: number, col: number) => void;
  onChangeMark: (row: number, col: number, mode: MarkMode) => void;
  onMarkStart: () => void;
};

type GestureState = {
  startPageX: number;
  startPageY: number;
  startRow: number;
  startCol: number;
  dragging: boolean;
  moved: boolean;
  mode: MarkMode;
  visited: Set<string>;
};

type BoardOrigin = {
  x: number;
  y: number;
};

function Pattern({ region, cellSize }: { region: number; cellSize: number }) {
  const variant = Math.abs(region) % 4;

  if (variant === 3) {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {[0.25, 0.5, 0.75].map((position) => (
          <View
            key={position}
            style={[
              styles.patternDot,
              { left: cellSize * position - 1.5, top: cellSize * position - 1.5 },
            ]}
          />
        ))}
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {[-0.25, 0.1, 0.45, 0.8].map((position) => (
        <View
          key={position}
          style={[
            styles.patternLine,
            {
              left: cellSize * position,
              top: cellSize * 0.5,
              width: cellSize * 1.5,
              transform: [{ rotate: variant === 1 ? '-45deg' : variant === 2 ? '90deg' : '45deg' }],
            },
          ]}
        />
      ))}
    </View>
  );
}

function ConflictStripes({ cellSize }: { cellSize: number }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.conflictBase]}>
      {[-0.45, -0.1, 0.25, 0.6, 0.95].map((position) => (
        <View
          key={position}
          style={[
            styles.conflictStripe,
            {
              left: cellSize * position,
              top: cellSize * 0.5,
              width: cellSize * 1.6,
              transform: [{ rotate: '-45deg' }],
            },
          ]}
        />
      ))}
    </View>
  );
}

export function GameBoard({
  board,
  dimension,
  queens,
  manualMarks,
  marks,
  solutionCells,
  solutionRevealed,
  conflictCells,
  showPatterns,
  disabled,
  onCycleCell,
  onChangeMark,
  onMarkStart,
}: GameBoardProps) {
  const cellSize = dimension / board.length;
  const boardRef = useRef<View>(null);
  const boardOriginRef = useRef<BoardOrigin | null>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gestureRef = useRef<GestureState | null>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const clearTimer = useCallback(() => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
    longPressRef.current = null;
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const measureBoard = useCallback(() => {
    boardRef.current?.measure((_x, _y, _width, _height, pageX, pageY) => {
      boardOriginRef.current = { x: pageX, y: pageY };
    });
  }, []);

  const cellAt = useCallback(
    (pageX: number, pageY: number, fallbackX: number, fallbackY: number) => {
      const origin = boardOriginRef.current;
      const boardX = origin ? pageX - origin.x : fallbackX;
      const boardY = origin ? pageY - origin.y : fallbackY;
      const row = Math.min(board.length - 1, Math.max(0, Math.floor(boardY / cellSize)));
      const col = Math.min(board.length - 1, Math.max(0, Math.floor(boardX / cellSize)));
      return { row, col, key: positionKey(row, col) };
    },
    [board.length, cellSize],
  );

  const markCell = useCallback(
    (row: number, col: number, key: string) => {
      const gesture = gestureRef.current;
      if (!gesture || gesture.visited.has(key)) return;
      gesture.visited.add(key);
      onChangeMark(row, col, gesture.mode);
    },
    [onChangeMark],
  );

  const handleGrant = useCallback(
    (event: GestureResponderEvent) => {
      if (disabled) return;
      const { locationX, locationY, pageX, pageY } = event.nativeEvent;

      const beginGesture = () => {
        const cell = cellAt(pageX, pageY, locationX, locationY);
        const mode: MarkMode = manualMarks.has(cell.key) ? 'remove' : 'add';
        gestureRef.current = {
          startPageX: pageX,
          startPageY: pageY,
          startRow: cell.row,
          startCol: cell.col,
          dragging: false,
          moved: false,
          mode,
          visited: new Set(),
        };
        setPressedKey(cell.key);

        longPressRef.current = setTimeout(() => {
          const gesture = gestureRef.current;
          if (!gesture || gesture.moved) return;
          gesture.dragging = true;
          onMarkStart();
          markCell(
            gesture.startRow,
            gesture.startCol,
            positionKey(gesture.startRow, gesture.startCol),
          );
        }, 340);
      };

      boardRef.current?.measure((_x, _y, _width, _height, measuredPageX, measuredPageY) => {
        boardOriginRef.current = { x: measuredPageX, y: measuredPageY };
        beginGesture();
      });
    },
    [cellAt, disabled, manualMarks, markCell, onMarkStart],
  );

  const handleMove = useCallback(
    (event: GestureResponderEvent) => {
      const gesture = gestureRef.current;
      if (!gesture) return;
      const { locationX, locationY, pageX, pageY } = event.nativeEvent;
      const distance = Math.hypot(
        pageX - gesture.startPageX,
        pageY - gesture.startPageY,
      );

      if (!gesture.dragging && distance > 16) {
        gesture.moved = true;
        gesture.dragging = true;
        clearTimer();
        onMarkStart();
        markCell(
          gesture.startRow,
          gesture.startCol,
          positionKey(gesture.startRow, gesture.startCol),
        );
      }

      if (gesture.dragging) {
        const cell = cellAt(pageX, pageY, locationX, locationY);
        setPressedKey(cell.key);
        markCell(cell.row, cell.col, cell.key);
      }
    },
    [cellAt, clearTimer, markCell, onMarkStart],
  );

  const finishGesture = useCallback(() => {
    clearTimer();
    gestureRef.current = null;
    setPressedKey(null);
  }, [clearTimer]);

  const handleRelease = useCallback(() => {
    const gesture = gestureRef.current;
    if (gesture && !gesture.dragging && !gesture.moved) {
      onCycleCell(gesture.startRow, gesture.startCol);
    }
    finishGesture();
  }, [finishGesture, onCycleCell]);

  return (
    <View
      accessibilityLabel={`${board.length} by ${board.length} Queens board`}
      onLayout={measureBoard}
      onResponderGrant={handleGrant}
      onResponderMove={handleMove}
      onResponderRelease={handleRelease}
      onResponderTerminate={finishGesture}
      onStartShouldSetResponder={() => !disabled}
      ref={boardRef}
      style={[styles.board, { height: dimension, width: dimension }]}>
      {board.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={[styles.row, { height: cellSize }]}>
          {row.map((region, colIndex) => {
            const key = positionKey(rowIndex, colIndex);
            const hasQueen = queens.has(key);
            const hasMark = marks.has(key);
            const isSolution = solutionRevealed && solutionCells.has(key);
            const isPressed = pressedKey === key;

            return (
              <LinearGradient
                accessible
                accessibilityLabel={`Row ${rowIndex + 1}, column ${colIndex + 1}${hasQueen ? ', queen' : hasMark ? ', marked' : ''}`}
                accessibilityRole="button"
                accessibilityState={{ disabled }}
                colors={['rgba(255,255,255,0.20)', 'rgba(255,255,255,0)']}
                end={{ x: 1, y: 1 }}
                key={key}
                onAccessibilityTap={() => onCycleCell(rowIndex, colIndex)}
                start={{ x: 0, y: 0 }}
                style={[
                  styles.cell,
                  {
                    backgroundColor: regionColors[Math.abs(region) % regionColors.length],
                    height: cellSize,
                    width: cellSize,
                  },
                  isPressed && styles.cellPressed,
                ]}>
                {showPatterns && <Pattern cellSize={cellSize} region={region} />}
                {hasMark && !hasQueen && (
                  <X
                    color={colors.ink}
                    opacity={manualMarks.has(key) ? 0.65 : 0.5}
                    size={Math.max(17, cellSize * 0.5)}
                    strokeWidth={1.35}
                  />
                )}
                {(hasQueen || isSolution) && (
                  <Image
                    contentFit="contain"
                    source={require('../../assets/images/queen.png')}
                    style={[
                      styles.queen,
                      {
                        height: cellSize * 0.7,
                        opacity: isSolution && !hasQueen ? 0.72 : 1,
                        width: cellSize * 0.7,
                      },
                    ]}
                  />
                )}
                {conflictCells.has(key) && <ConflictStripes cellSize={cellSize} />}
              </LinearGradient>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: colors.surfaceSolid,
    borderColor: colors.ink,
    borderRadius: radius.md,
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  cell: {
    alignItems: 'center',
    borderColor: 'rgba(31, 45, 58, 0.32)',
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cellPressed: {
    opacity: 0.74,
  },
  queen: {
    zIndex: 3,
  },
  patternLine: {
    backgroundColor: 'rgba(255,255,255,0.34)',
    height: 2,
    position: 'absolute',
  },
  patternDot: {
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderRadius: 3,
    height: 3,
    position: 'absolute',
    width: 3,
  },
  conflictBase: {
    backgroundColor: 'rgba(200, 62, 77, 0.12)',
    overflow: 'hidden',
    zIndex: 4,
  },
  conflictStripe: {
    backgroundColor: 'rgba(200, 36, 52, 0.68)',
    height: 2.5,
    position: 'absolute',
  },
});
