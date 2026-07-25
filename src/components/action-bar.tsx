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
  onPress: () => void;
};

function Action({
  icon: Icon,
  label,
  active = false,
  disabled = false,
  primary = false,
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
        active && styles.activeAction,
        primary && styles.primaryAction,
        disabled && styles.disabledAction,
        pressed && !disabled && styles.pressed,
      ]}>
      <Icon color={color} size={20} strokeWidth={1.9} />
      <Text numberOfLines={1} style={[styles.label, { color }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ActionBar({
  patterns,
  autoMark,
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
    <View style={styles.bar}>
      <Action active={patterns} icon={Palette} label="Patterns" onPress={onTogglePatterns} />
      <Action disabled={loading || solutionRevealed || solved} icon={RotateCcw} label="Retry" onPress={onRetry} />
      <Action
        active={solutionRevealed}
        disabled={loading || !solutionAvailable || solutionRevealed || solved}
        icon={Eye}
        label="Solution"
        onPress={onSolution}
      />
      <Action active={autoMark} icon={ShieldCheck} label="Auto X" onPress={onToggleAutoMark} />
      <Action disabled={loading} icon={RefreshCw} label="New game" onPress={onNewGame} primary />
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
});
