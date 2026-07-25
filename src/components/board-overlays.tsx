import { AlertTriangle, PartyPopper, RefreshCw, X } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { formatTime } from '@/lib/game';
import type { GameStatus, ViolationKind } from '@/types/game';

const violationNames: Record<ViolationKind, string> = {
  row: 'More than one queen shares a row.',
  column: 'More than one queen shares a column.',
  region: 'More than one queen is inside a colored region.',
  adjacent: 'Two queens are touching diagonally.',
};

type BoardOverlayProps = {
  dimension: number;
  loading: boolean;
  error: string | null;
  solved: boolean;
  solutionRevealed: boolean;
  elapsedSeconds: number;
  status: GameStatus | null;
  showConflicts: boolean;
  onCloseConflicts: () => void;
  onOpenRules: () => void;
  onNewGame: () => void;
};

export function ConflictTrigger({
  visible,
  onPress,
}: {
  visible: boolean;
  onPress: () => void;
}) {
  if (!visible) return null;
  return (
    <Pressable
      accessibilityLabel="Show board conflicts"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.warningButton, pressed && styles.pressed]}>
      <AlertTriangle color={colors.danger} fill={colors.dangerSoft} size={25} strokeWidth={2.2} />
    </Pressable>
  );
}

export function BoardOverlay({
  dimension,
  loading,
  error,
  solved,
  solutionRevealed,
  elapsedSeconds,
  status,
  showConflicts,
  onCloseConflicts,
  onOpenRules,
  onNewGame,
}: BoardOverlayProps) {
  const visible = loading || Boolean(error) || (solved && !solutionRevealed) || showConflicts;
  if (!visible) return null;

  const activeViolations = status
    ? (Object.keys(status.violations) as ViolationKind[]).filter(
        (kind) => status.violations[kind] > 0,
      )
    : [];

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
            <Text style={styles.messageCopy}>Creating a fresh, uniquely solvable puzzle.</Text>
          </>
        )}

        {error && !loading && (
          <>
            <AlertTriangle color={colors.danger} size={31} strokeWidth={1.8} />
            <Text style={styles.messageTitle}>Board unavailable</Text>
            <Text style={styles.messageCopy}>{error}</Text>
            <PrimaryButton icon={<RefreshCw color={colors.white} size={18} />} label="Try again" onPress={onNewGame} />
          </>
        )}

        {solved && !solutionRevealed && !loading && !error && (
          <>
            <View style={styles.successIcon}>
              <PartyPopper color={colors.success} size={28} strokeWidth={1.8} />
            </View>
            <Text style={styles.messageTitle}>Beautifully done!</Text>
            <Text style={styles.messageCopy}>
              You solved this board in {formatTime(elapsedSeconds)}.
            </Text>
            <PrimaryButton icon={<RefreshCw color={colors.white} size={18} />} label="Play again" onPress={onNewGame} />
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
            <Text style={styles.messageTitle}>Check these queens</Text>
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
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
      {icon}
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
  warningButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSolid,
    borderColor: 'rgba(200, 62, 77, 0.26)',
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    top: 10,
    width: 42,
    zIndex: 6,
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
