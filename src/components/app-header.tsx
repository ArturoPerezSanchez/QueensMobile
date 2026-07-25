import { Image } from 'expo-image';
import { ChevronDown, ChevronLeft, CircleHelp } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

type AppHeaderProps = {
  size: number;
  title: string;
  logoSource: number;
  compact?: boolean;
  rail?: boolean;
  onBack: () => void;
  onOpenSizes: () => void;
  onOpenRules: () => void;
};

export function AppHeader({
  size,
  title,
  logoSource,
  compact = false,
  rail = false,
  onBack,
  onOpenSizes,
  onOpenRules,
}: AppHeaderProps) {
  return (
    <View
      style={[
        styles.header,
        compact && styles.headerCompact,
        rail && styles.headerRail,
      ]}>
      <View style={[styles.brand, rail && styles.brandRail]}>
        <Pressable
          accessibilityLabel="Back to games"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
          style={({ pressed }) => [
            styles.backButton,
            compact && styles.backButtonCompact,
            pressed && styles.pressed,
          ]}>
          <ChevronLeft color={colors.ink} size={compact ? 21 : 23} strokeWidth={2} />
        </Pressable>
        <Image
          source={logoSource}
          style={[styles.logo, compact && styles.logoCompact]}
        />
        <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
      </View>

      <View style={[styles.tools, rail && styles.toolsRail]}>
        <Pressable
          accessibilityLabel={`Board size ${size} by ${size}. Change board size`}
          accessibilityRole="button"
          onPress={onOpenSizes}
          style={({ pressed }) => [
            styles.sizeButton,
            compact && styles.sizeButtonCompact,
            pressed && styles.pressed,
          ]}>
          <Text style={styles.sizeText}>
            {size} × {size}
          </Text>
          <ChevronDown color={colors.muted} size={17} strokeWidth={2} />
        </Pressable>
        <Pressable
          accessibilityLabel="Open game rules"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onOpenRules}
          style={({ pressed }) => [
            styles.helpButton,
            compact && styles.helpButtonCompact,
            pressed && styles.pressed,
          ]}>
          <CircleHelp color={colors.ink} size={compact ? 21 : 23} strokeWidth={1.8} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  headerCompact: {
    minHeight: 40,
  },
  headerRail: {
    alignItems: 'stretch',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  brandRail: {
    justifyContent: 'center',
  },
  backButton: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 32,
  },
  backButtonCompact: {
    height: 34,
    width: 26,
  },
  logo: {
    borderRadius: radius.sm,
    height: 38,
    width: 38,
  },
  logoCompact: {
    height: 32,
    width: 32,
  },
  title: {
    color: colors.ink,
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: 0,
  },
  titleCompact: {
    fontSize: 20,
  },
  tools: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  toolsRail: {
    gap: spacing.xs,
    justifyContent: 'center',
  },
  sizeButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 40,
    paddingHorizontal: 13,
  },
  sizeButtonCompact: {
    minHeight: 36,
    paddingHorizontal: 10,
  },
  sizeText: {
    color: colors.ink,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    letterSpacing: 0,
  },
  helpButton: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  helpButtonCompact: {
    height: 36,
    width: 36,
  },
  pressed: {
    opacity: 0.58,
    transform: [{ scale: 0.97 }],
  },
});
