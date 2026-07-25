import {
  AlertTriangle,
  PartyPopper,
  RefreshCw,
  Trophy,
  X,
} from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { formatTime } from '@/lib/game';
import type { TangoStatus, TangoViolationKind } from '@/types/tango';

const violationNames: Record<TangoViolationKind, string> = {
  balance: 'A row or column contains too many suns or moons.',
  triple: 'Three matching symbols appear consecutively.',
  relation: 'A relationship clue is not satisfied.',
};

type TangoBoardOverlayProps = {
  dimension: number;
  loading: boolean;
  error: string | null;
  solved: boolean;
  solutionRevealed: boolean;
  assisted: boolean;
  elapsedSeconds: number;
  bestTime?: number;
  status: TangoStatus | null;
  showConflicts: boolean;
  onCloseConflicts: () => void;
  onOpenRules: () => void;
  onNewGame: () => void;
};

export function TangoBoardOverlay({
  dimension,
  loading,
  error,
  solved,
  solutionRevealed,
  assisted,
  elapsedSeconds,
  bestTime,
  status,
  showConflicts,
  onCloseConflicts,
  onOpenRules,
  onNewGame,
}: TangoBoardOverlayProps) {
  const showWin = solved && !solutionRevealed;
  const visible = loading || Boolean(error) || showWin || showConflicts;
  if (!visible) return null;

  const activeViolations = status
    ? (Object.keys(status.violations) as TangoViolationKind[]).filter(
        (kind) => status.violations[kind] > 0,
      )
    : [];
  const isNewBest = !assisted && bestTime === elapsedSeconds;

  return (
    <Pressable
      accessibilityRole="none"
      onPress={showConflicts ? onCloseConflicts : undefined}
      style={[styles.overlay, { height: dimension, width: dimension }]}>
      <View onStartShouldSetResponder={() => true} style={styles.message}>
        {loading && (
          <>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={styles.messageTitle}>Preparing your board</Text>
            <Text style={styles.messageCopy}>Creating a fresh Tango puzzle.</Text>
          </>
        )}

        {error && !loading && (
          <>
            <AlertTriangle color={colors.danger} size={31} strokeWidth={1.8} />
            <Text style={styles.messageTitle}>Board unavailable</Text>
            <Text style={styles.messageCopy}>{error}</Text>
            <PrimaryButton label="Try again" onPress={onNewGame} />
          </>
        )}

        {showWin && !loading && !error && (
          <>
            <View style={styles.successIcon}>
              {isNewBest ? (
                <Trophy color={colors.success} size={28} strokeWidth={1.8} />
              ) : (
                <PartyPopper color={colors.success} size={28} strokeWidth={1.8} />
              )}
            </View>
            <Text style={styles.messageTitle}>Beautifully done!</Text>
            <Text style={styles.messageCopy}>
              {assisted
                ? 'You completed the board with a little help.'
                : `You solved this board in ${formatTime(elapsedSeconds)}.`}
            </Text>
            {isNewBest && <Text style={styles.bestLabel}>NEW BEST TIME</Text>}
            <PrimaryButton label="Play again" onPress={onNewGame} />
          </>
        )}

        {showConflicts && !loading && !error && (
          <>
            <Pressable
              accessibilityLabel="Close conflicts"
              accessibilityRole="button"
              hitSlop={10}
              onPress={onCloseConflicts}
              style={styles.messageClose}>
              <X color={colors.muted} size={20} strokeWidth={1.8} />
            </Pressable>
            <AlertTriangle color={colors.danger} size={30} strokeWidth={1.9} />
            <Text style={styles.messageTitle}>Check this board</Text>
            <View style={styles.violations}>
              {activeViolations.map((kind) => (
                <Text key={kind} style={styles.violationText}>
                  {violationNames[kind]}
                </Text>
              ))}
            </View>
            <Pressable accessibilityRole="button" onPress={onOpenRules} style={styles.rulesLink}>
              <Text style={styles.rulesLinkText}>View the rules</Text>
            </Pressable>
          </>
        )}
      </View>
    </Pressable>
  );
}

function PrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
      <RefreshCw color={colors.white} size={18} />
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(31, 45, 58, 0.46)',
    borderRadius: radius.md,
    justifyContent: 'center',
    left: 0,
    padding: spacing.lg,
    position: 'absolute',
    top: 0,
    zIndex: 10,
  },
  message: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSolid,
    borderRadius: radius.md,
    gap: spacing.sm,
    maxWidth: 310,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    width: '92%',
  },
  messageClose: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 5,
    top: 5,
    width: 36,
  },
  messageTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  messageCopy: {
    color: colors.muted,
    fontSize: 14,
    letterSpacing: 0,
    lineHeight: 20,
    textAlign: 'center',
  },
  successIcon: {
    alignItems: 'center',
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  bestLabel: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.sm,
    minHeight: 46,
    paddingHorizontal: spacing.lg,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0,
  },
  violations: {
    gap: 5,
    marginTop: spacing.xs,
  },
  violationText: {
    color: colors.muted,
    fontSize: 14,
    letterSpacing: 0,
    lineHeight: 19,
    textAlign: 'center',
  },
  rulesLink: {
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  rulesLinkText: {
    color: colors.accentDark,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0,
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.64,
    transform: [{ scale: 0.98 }],
  },
});
