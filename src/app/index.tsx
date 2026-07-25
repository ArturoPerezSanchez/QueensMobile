import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '@/constants/theme';

type GameCardProps = {
  title: string;
  description: string;
  logoSource: number;
  onPress: () => void;
  accent: string;
  wide: boolean;
};

function GameCard({
  title,
  description,
  logoSource,
  onPress,
  accent,
  wide,
}: GameCardProps) {
  return (
    <Pressable
      accessibilityHint={`Open ${title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.gameCard,
        wide && styles.gameCardWide,
        { borderTopColor: accent },
        pressed && styles.cardPressed,
      ]}>
      <Image contentFit="contain" source={logoSource} style={styles.gameLogo} />
      <View style={styles.gameCopy}>
        <Text style={styles.gameTitle}>{title}</Text>
        <Text style={styles.gameDescription}>{description}</Text>
      </View>
      <View style={[styles.openButton, { backgroundColor: accent }]}>
        <ChevronRight color={colors.white} size={22} strokeWidth={2.2} />
      </View>
    </Pressable>
  );
}

export default function GamesScreen() {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const contentWidth = Math.min(width - spacing.xxl, 860);

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.content, { width: contentWidth }]}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>PUZZLE COLLECTION</Text>
              <Text style={styles.heading}>Logic Games</Text>
            </View>
            <Text style={styles.gameCount}>2 games</Text>
          </View>

          <View style={[styles.gameGrid, isLandscape && styles.gameGridLandscape]}>
            <GameCard
              accent={colors.accent}
              description="Place one queen in every row, column, and region."
              logoSource={require('../../assets/images/queens-logo.png')}
              onPress={() => router.push('/queens')}
              title="Queens"
              wide={isLandscape}
            />
            <GameCard
              accent="#D88B00"
              description="Balance suns and moons without matching triples."
              logoSource={require('../../assets/images/tango-logo.png')}
              onPress={() => router.push('/tango')}
              title="Tango"
              wide={isLandscape}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.canvas,
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {
    gap: spacing.xl,
  },
  header: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: colors.subtle,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0,
    marginBottom: spacing.xs,
  },
  heading: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0,
  },
  gameCount: {
    color: colors.muted,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
    letterSpacing: 0,
    paddingBottom: 4,
  },
  gameGrid: {
    gap: spacing.md,
  },
  gameGridLandscape: {
    flexDirection: 'row',
  },
  gameCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderTopWidth: 4,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 132,
    padding: spacing.lg,
  },
  gameCardWide: {
    flex: 1,
    minWidth: 0,
  },
  gameLogo: {
    borderRadius: radius.md,
    height: 72,
    width: 72,
  },
  gameCopy: {
    flex: 1,
    minWidth: 0,
  },
  gameTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: spacing.xs,
  },
  gameDescription: {
    color: colors.muted,
    fontSize: 13,
    letterSpacing: 0,
    lineHeight: 18,
  },
  openButton: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  cardPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.985 }],
  },
});
