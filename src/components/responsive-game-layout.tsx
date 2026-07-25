import type { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/constants/theme';

const MAX_BOARD_DIMENSION = 540;
const MAX_LANDSCAPE_CONTENT_WIDTH = 980;
const MIN_LANDSCAPE_RAIL_WIDTH = 124;

type LayoutSlot = (isLandscape: boolean) => ReactNode;
type BoardSlot = (dimension: number, isLandscape: boolean) => ReactNode;

type ResponsiveGameLayoutProps = {
  renderHeader: LayoutSlot;
  renderStats: LayoutSlot;
  renderBoard: BoardSlot;
  renderActions: LayoutSlot;
  children?: ReactNode;
};

export function ResponsiveGameLayout({
  renderHeader,
  renderStats,
  renderBoard,
  renderActions,
  children,
}: ResponsiveGameLayoutProps) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLandscape = width > height;
  const viewportHeight = height - insets.top - insets.bottom;
  const portraitContentWidth = Math.min(width - spacing.xl, MAX_BOARD_DIMENSION);
  const landscapeContentWidth = Math.min(
    width - spacing.xl,
    MAX_LANDSCAPE_CONTENT_WIDTH,
  );
  const landscapeBoardWidth =
    landscapeContentWidth -
    2 * (MIN_LANDSCAPE_RAIL_WIDTH + spacing.md);
  const boardDimension = Math.floor(
    isLandscape
      ? Math.min(
          Math.max(180, viewportHeight - spacing.xl),
          Math.max(180, landscapeBoardWidth),
          MAX_BOARD_DIMENSION,
        )
      : portraitContentWidth,
  );
  const landscapeRailWidth =
    (landscapeContentWidth - boardDimension - 2 * spacing.md) / 2;

  const header = renderHeader(isLandscape);
  const stats = renderStats(isLandscape);
  const board = renderBoard(boardDimension, isLandscape);
  const actions = renderActions(isLandscape);

  return (
    <SafeAreaView
      edges={isLandscape ? ['top', 'bottom'] : ['top', 'right', 'bottom', 'left']}
      style={styles.safeArea}>
      <ScrollView
        bounces={false}
        contentContainerStyle={[
          styles.scrollContent,
          isLandscape && styles.scrollContentLandscape,
        ]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}>
        {isLandscape ? (
          <View style={[styles.landscapeContent, { width: landscapeContentWidth }]}>
            <View
              style={[
                styles.landscapeRail,
                {
                  minHeight: boardDimension,
                  paddingLeft: insets.left,
                  width: landscapeRailWidth,
                },
              ]}>
              {header}
              {stats}
            </View>
            {board}
            <View
              style={[
                styles.landscapeRail,
                {
                  minHeight: boardDimension,
                  paddingRight: insets.right,
                  width: landscapeRailWidth,
                },
              ]}>
              {actions}
            </View>
          </View>
        ) : (
          <View style={[styles.portraitContent, { width: portraitContentWidth }]}>
            {header}
            {stats}
            {board}
            {actions}
          </View>
        )}
      </ScrollView>
      {children}
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
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  scrollContentLandscape: {
    justifyContent: 'center',
    paddingBottom: spacing.md,
    paddingTop: spacing.md,
  },
  portraitContent: {
    gap: spacing.md,
  },
  landscapeContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
  },
  landscapeRail: {
    gap: spacing.md,
    justifyContent: 'center',
  },
});
