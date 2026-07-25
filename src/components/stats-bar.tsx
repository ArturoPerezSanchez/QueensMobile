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
  vertical?: boolean;
};

type MetricProps = {
  label: string;
  value: string;
  muted?: boolean;
  compact?: boolean;
  vertical?: boolean;
};

function Metric({
  label,
  value,
  muted = false,
  compact = false,
  vertical = false,
}: MetricProps) {
  return (
    <View style={[styles.metric, vertical && styles.metricVertical]}>
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
  vertical = false,
}: StatsBarProps) {
  return (
    <View
      style={[
        styles.bar,
        compact && styles.barCompact,
        vertical && styles.barVertical,
      ]}>
      <Metric
        compact={compact}
        label={timerPaused ? 'TIMER PAUSED' : 'TIMER'}
        muted={timerPaused}
        value={timerPaused ? '--:--' : formatTime(elapsedSeconds)}
        vertical={vertical}
      />
      <View style={[styles.divider, vertical && styles.dividerVertical]} />
      <Metric
        compact={compact}
        label="BEST"
        muted={bestTime === undefined}
        value={bestTime === undefined ? '--:--' : formatTime(bestTime)}
        vertical={vertical}
      />
      <View style={[styles.divider, vertical && styles.dividerVertical]} />
      <Metric
        compact={compact}
        label="QUEENS"
        value={`${queenCount}/${size}`}
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
    minHeight: 68,
    paddingHorizontal: spacing.sm,
  },
  barCompact: {
    minHeight: 58,
  },
  barVertical: {
    flexDirection: 'column',
    minHeight: 0,
    paddingVertical: spacing.xs,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: spacing.xs,
  },
  metricVertical: {
    flex: 0,
    minHeight: 42,
    paddingVertical: spacing.xs,
  },
  divider: {
    alignSelf: 'center',
    backgroundColor: colors.line,
    height: 32,
    width: StyleSheet.hairlineWidth,
  },
  dividerVertical: {
    height: StyleSheet.hairlineWidth,
    width: '70%',
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
