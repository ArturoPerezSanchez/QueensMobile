import {
  Eye,
  Palette,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

type ActionBarProps = {
  patterns: boolean;
  autoMark: boolean;
  compact?: boolean;
  vertical?: boolean;
  solutionAvailable: boolean;
  solutionRevealed: boolean;
  solved: boolean;
  loading: boolean;
  onTogglePatterns: () => void;
  onRetry: () => void;
  onSolution: () => void;
  onToggleAutoMark: () => void;
  onNewGame: () => void;
};

type ActionProps = {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  disabled?: boolean;
  primary?: boolean;
  compact?: boolean;
  vertical?: boolean;
  onPress: () => void;
};

function Action({
  icon: Icon,
  label,
  active = false,
  disabled = false,
  primary = false,
  compact = false,
  vertical = false,
  onPress,
}: ActionProps) {
  const color = disabled
    ? colors.subtle
    : primary
      ? colors.white
      : active
        ? colors.accent
        : colors.ink;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: active }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        compact && styles.actionCompact,
        vertical && styles.actionVertical,
        active && styles.activeAction,
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

export function ActionBar({
  patterns,
  autoMark,
  compact = false,
  vertical = false,
  solutionAvailable,
  solutionRevealed,
  solved,
  loading,
  onTogglePatterns,
  onRetry,
  onSolution,
  onToggleAutoMark,
  onNewGame,
}: ActionBarProps) {
  return (
    <View
      style={[
        styles.bar,
        compact && styles.barCompact,
        vertical && styles.barVertical,
      ]}>
      <Action
        active={patterns}
        compact={compact}
        icon={Palette}
        label="Patterns"
        onPress={onTogglePatterns}
        vertical={vertical}
      />
      <Action
        compact={compact}
        disabled={loading || solutionRevealed || solved}
        icon={RotateCcw}
        label="Retry"
        onPress={onRetry}
        vertical={vertical}
      />
      <Action
        active={solutionRevealed}
        compact={compact}
        disabled={loading || !solutionAvailable || solutionRevealed || solved}
        icon={Eye}
        label="Solution"
        onPress={onSolution}
        vertical={vertical}
      />
      <Action
        active={autoMark}
        compact={compact}
        icon={ShieldCheck}
        label="Auto X"
        onPress={onToggleAutoMark}
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
  activeAction: {
    backgroundColor: 'rgba(0, 114, 178, 0.10)',
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
