import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { formatTime } from '@/lib/game';

type StatsBarProps = {
  elapsedSeconds: number;
  bestTime?: number;
  queenCount: number;
  size: number;
  timerPaused: boolean;
};

type MetricProps = {
  label: string;
  value: string;
  muted?: boolean;
};

function Metric({ label, value, muted = false }: MetricProps) {
  return (
    <View style={styles.metric}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, muted && styles.mutedValue]} numberOfLines={1}>
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
}: StatsBarProps) {
  return (
    <View style={styles.bar}>
      <Metric label={timerPaused ? 'TIMER PAUSED' : 'TIMER'} value={timerPaused ? '--:--' : formatTime(elapsedSeconds)} muted={timerPaused} />
      <View style={styles.divider} />
      <Metric label="BEST" value={bestTime === undefined ? '--:--' : formatTime(bestTime)} muted={bestTime === undefined} />
      <View style={styles.divider} />
      <Metric label="QUEENS" value={`${queenCount}/${size}`} />
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
  value: {
    color: colors.ink,
    fontSize: 19,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
    letterSpacing: 0,
  },
  mutedValue: {
    color: colors.subtle,
  },
});
