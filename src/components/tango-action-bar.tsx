import {
  Eye,
  Lightbulb,
  RefreshCw,
  RotateCcw,
  Undo2,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

type TangoActionBarProps = {
  compact?: boolean;
  vertical?: boolean;
  loading: boolean;
  canUndo: boolean;
  solved: boolean;
  solutionRevealed: boolean;
  onUndo: () => void;
  onRetry: () => void;
  onHint: () => void;
  onSolution: () => void;
  onNewGame: () => void;
};

type ActionProps = {
  icon: LucideIcon;
  label: string;
  disabled?: boolean;
  primary?: boolean;
  compact: boolean;
  vertical: boolean;
  onPress: () => void;
};

function Action({
  icon: Icon,
  label,
  disabled = false,
  primary = false,
  compact,
  vertical,
  onPress,
}: ActionProps) {
  const color = disabled
    ? colors.subtle
    : primary
      ? colors.white
      : colors.ink;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        compact && styles.actionCompact,
        vertical && styles.actionVertical,
        primary && styles.primaryAction,
        disabled && styles.disabledAction,
        pressed && !disabled && styles.pressed,
      ]}>
      <Icon color={color} size={compact ? 18 : 20} strokeWidth={1.9} />
      <Text
        numberOfLines={1}
        style={[styles.label, compact && styles.labelCompact, { color }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function TangoActionBar({
  compact = false,
  vertical = false,
  loading,
  canUndo,
  solved,
  solutionRevealed,
  onUndo,
  onRetry,
  onHint,
  onSolution,
  onNewGame,
}: TangoActionBarProps) {
  const gameLocked = loading || solved || solutionRevealed;

  return (
    <View
      style={[
        styles.bar,
        compact && styles.barCompact,
        vertical && styles.barVertical,
      ]}>
      <Action
        compact={compact}
        disabled={!canUndo || gameLocked}
        icon={Undo2}
        label="Undo"
        onPress={onUndo}
        vertical={vertical}
      />
      <Action
        compact={compact}
        disabled={gameLocked}
        icon={RotateCcw}
        label="Retry"
        onPress={onRetry}
        vertical={vertical}
      />
      <Action
        compact={compact}
        disabled={gameLocked}
        icon={Lightbulb}
        label="Hint"
        onPress={onHint}
        vertical={vertical}
      />
      <Action
        compact={compact}
        disabled={gameLocked}
        icon={Eye}
        label="Solution"
        onPress={onSolution}
        vertical={vertical}
      />
      <Action
        compact={compact}
        disabled={loading}
        icon={RefreshCw}
        label="New game"
        onPress={onNewGame}
        primary
        vertical={vertical}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'stretch',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 3,
    padding: 5,
  },
  barCompact: {
    padding: 4,
  },
  barVertical: {
    flexDirection: 'column',
  },
  action: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 58,
    minWidth: 0,
    paddingHorizontal: 2,
  },
  actionCompact: {
    gap: 2,
    minHeight: 50,
  },
  actionVertical: {
    flex: 0,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-start',
    minHeight: 46,
    paddingHorizontal: spacing.sm,
  },
  primaryAction: {
    backgroundColor: colors.accent,
  },
  disabledAction: {
    opacity: 0.48,
  },
  pressed: {
    opacity: 0.65,
    transform: [{ scale: 0.97 }],
  },
  label: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0,
  },
  labelCompact: {
    fontSize: 9,
  },
});
