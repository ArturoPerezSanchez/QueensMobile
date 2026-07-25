import { Image } from 'expo-image';
import { ChevronDown, CircleHelp } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

type AppHeaderProps = {
  size: number;
  compact?: boolean;
  onOpenSizes: () => void;
  onOpenRules: () => void;
};

export function AppHeader({
  size,
  compact = false,
  onOpenSizes,
  onOpenRules,
}: AppHeaderProps) {
  return (
    <View style={[styles.header, compact && styles.headerCompact]}>
      <View style={styles.brand}>
        <Image
          source={require('../../assets/images/queens-logo.png')}
          style={[styles.logo, compact && styles.logoCompact]}
        />
        <Text style={[styles.title, compact && styles.titleCompact]}>Queens</Text>
      </View>

      <View style={styles.tools}>
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
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
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
