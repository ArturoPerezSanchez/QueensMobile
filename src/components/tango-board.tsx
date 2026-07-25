import { Moon, Sun } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/constants/theme';
import { tangoPositionKey } from '@/lib/tango-game';
import type {
  TangoCell,
  TangoConstraint,
  TangoSymbol,
} from '@/types/tango';

type TangoBoardProps = {
  board: TangoCell[][];
  entries: TangoCell[][];
  constraints: TangoConstraint[];
  conflicts: Set<string>;
  dimension: number;
  disabled: boolean;
  solutionRevealed: boolean;
  onCycleCell: (row: number, col: number) => void;
};

function TangoSymbolIcon({
  value,
  size,
  muted,
}: {
  value: TangoSymbol;
  size: number;
  muted: boolean;
}) {
  if (value === 1) {
    return (
      <Sun
        color="#B96C00"
        fill="#F5B73B"
        opacity={muted ? 0.56 : 1}
        size={size}
        strokeWidth={2.1}
      />
    );
  }

  return (
    <Moon
      color="#245B9F"
      fill="#3F82D4"
      opacity={muted ? 0.56 : 1}
      size={size}
      strokeWidth={1.9}
    />
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

export function TangoBoard({
  board,
  entries,
  constraints,
  conflicts,
  dimension,
  disabled,
  solutionRevealed,
  onCycleCell,
}: TangoBoardProps) {
  const cellSize = dimension / board.length;
  const iconSize = Math.max(18, cellSize * 0.56);
  const clueSize = Math.min(25, Math.max(14, cellSize * 0.31));

  return (
    <View
      accessibilityLabel={`${board.length} by ${board.length} Tango board`}
      style={[styles.board, { height: dimension, width: dimension }]}>
      {entries.map((rowValues, row) => (
        <View key={`row-${row}`} style={[styles.row, { height: cellSize }]}>
          {rowValues.map((value, col) => {
            const given = board[row][col] !== null;
            const key = tangoPositionKey(row, col);
            const label =
              value === null ? 'empty' : value === 1 ? 'sun' : 'moon';

            return (
              <Pressable
                accessibilityLabel={`Row ${row + 1}, column ${col + 1}: ${label}${given ? ', given' : ''}`}
                accessibilityRole="button"
                accessibilityState={{ disabled: disabled || given }}
                disabled={disabled || given}
                key={key}
                onPress={() => onCycleCell(row, col)}
                style={({ pressed }) => [
                  styles.cell,
                  (row + col) % 2 === 1 && styles.cellAlternate,
                  given && styles.cellGiven,
                  {
                    height: cellSize,
                    width: cellSize,
                  },
                  pressed && styles.cellPressed,
                ]}>
                {value !== null && (
                  <TangoSymbolIcon
                    muted={solutionRevealed && !given}
                    size={iconSize}
                    value={value}
                  />
                )}
                {conflicts.has(key) && !solutionRevealed && (
                  <ConflictStripes cellSize={cellSize} />
                )}
              </Pressable>
            );
          })}
        </View>
      ))}

      {constraints.map((constraint) => {
        const horizontal = constraint.direction === 'horizontal';
        const left =
          (constraint.col + (horizontal ? 1 : 0.5)) * cellSize - clueSize / 2;
        const top =
          (constraint.row + (horizontal ? 0.5 : 1)) * cellSize - clueSize / 2;

        return (
          <View
            key={`${constraint.row}:${constraint.col}:${constraint.direction}`}
            pointerEvents="none"
            style={[
              styles.clue,
              {
                height: clueSize,
                left,
                top,
                width: clueSize,
              },
            ]}>
            <Text
              style={[
                styles.clueText,
                { fontSize: Math.max(10, clueSize * 0.62) },
              ]}>
              {constraint.relation === 'same' ? '=' : '×'}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: colors.ink,
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
    backgroundColor: '#FFFDF9',
    borderColor: 'rgba(31, 45, 58, 0.20)',
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cellAlternate: {
    backgroundColor: '#F4F1EC',
  },
  cellGiven: {
    backgroundColor: '#E7E4DE',
  },
  cellPressed: {
    opacity: 0.68,
    transform: [{ scale: 0.94 }],
  },
  clue: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 253, 249, 0.98)',
    borderColor: 'rgba(31, 45, 58, 0.16)',
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 8,
  },
  clueText: {
    color: '#5E503B',
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 16,
  },
  conflictBase: {
    backgroundColor: 'rgba(200, 62, 77, 0.14)',
    overflow: 'hidden',
    zIndex: 4,
  },
  conflictStripe: {
    backgroundColor: 'rgba(200, 36, 52, 0.72)',
    height: 2.5,
    position: 'absolute',
  },
});
