import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { formatTime } from '@/lib/game';

type StatsBarProps = {
  elapsedSeconds: number;
  bestTime?: number;
  queenCount: number;
  size: number;
  timerPaused: boolean;
  compact?: boolean;
};

type MetricProps = {
  label: string;
  value: string;
  muted?: boolean;
  compact?: boolean;
};

function Metric({ label, value, muted = false, compact = false }: MetricProps) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text>
      <Text
        style={[
          styles.value,
          compact && styles.valueCompact,
          muted && styles.mutedValue,
        ]}
        numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function StatsBar({
  elapsedSeconds,
  bestTime,
  queenCount,
  size,
  timerPaused,
  compact = false,
}: StatsBarProps) {
  return (
    <View style={[styles.bar, compact && styles.barCompact]}>
      <Metric compact={compact} label={timerPaused ? 'TIMER PAUSED' : 'TIMER'} value={timerPaused ? '--:--' : formatTime(elapsedSeconds)} muted={timerPaused} />
      <View style={styles.divider} />
      <Metric compact={compact} label="BEST" value={bestTime === undefined ? '--:--' : formatTime(bestTime)} muted={bestTime === undefined} />
      <View style={styles.divider} />
      <Metric compact={compact} label="QUEENS" value={`${queenCount}/${size}`} />
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
    minHeight: 68,
    paddingHorizontal: spacing.sm,
  },
  barCompact: {
    minHeight: 58,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: spacing.xs,
  },
  divider: {
    alignSelf: 'center',
    backgroundColor: colors.line,
    height: 32,
    width: StyleSheet.hairlineWidth,
  },
  label: {
    color: colors.subtle,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0,
    marginBottom: 4,
  },
  labelCompact: {
    fontSize: 9,
    marginBottom: 3,
  },
  value: {
    color: colors.ink,
    fontSize: 19,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
    letterSpacing: 0,
  },
  valueCompact: {
    fontSize: 17,
  },
  mutedValue: {
    color: colors.subtle,
  },
});
