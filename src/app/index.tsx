import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionBar } from '@/components/action-bar';
import { AppHeader } from '@/components/app-header';
import { BoardOverlay, ConflictTrigger } from '@/components/board-overlays';
import { GameBoard } from '@/components/game-board';
import { RulesSheet, SizeSheet } from '@/components/game-sheets';
import { StatsBar } from '@/components/stats-bar';
import { colors, radius, spacing } from '@/constants/theme';
import { useQueensGame } from '@/hooks/use-queens-game';

const MAX_CONTENT_WIDTH = 540;
const MAX_LANDSCAPE_CONTENT_WIDTH = 980;
const MIN_LANDSCAPE_RAIL_WIDTH = 124;

export default function GameScreen() {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [showRules, setShowRules] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const game = useQueensGame();
  const isLandscape = width > height;
  const viewportHeight = height - insets.top - insets.bottom;
  const portraitContentWidth = Math.min(width - spacing.xl, MAX_CONTENT_WIDTH);
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
          MAX_CONTENT_WIDTH,
        )
      : portraitContentWidth,
  );
  const landscapeRailWidth =
    (landscapeContentWidth - boardDimension - 2 * spacing.md) / 2;
  const queenCount = game.status?.queenCount ?? 0;
  const solved = game.status?.isSolved ?? false;
  const hasConflicts = Boolean(game.status && game.status.conflicts.size > 0);

  useEffect(() => {
    void ScreenOrientation.unlockAsync();
  }, []);

  function openRulesFromConflict() {
    game.setShowConflictPanel(false);
    setShowRules(true);
  }

  const header = (
    <AppHeader
      compact={isLandscape}
      rail={isLandscape}
      onOpenRules={() => setShowRules(true)}
      onOpenSizes={() => setShowSizes(true)}
      size={game.size}
    />
  );

  const stats = (
    <StatsBar
      bestTime={game.bestTime}
      compact={isLandscape}
      elapsedSeconds={game.elapsedSeconds}
      queenCount={queenCount}
      size={game.size}
      timerPaused={game.solutionRevealed}
      vertical={isLandscape}
    />
  );

  const board = (
    <View style={[styles.boardStage, { height: boardDimension, width: boardDimension }]}>
      {game.puzzle ? (
        <GameBoard
          board={game.puzzle.board}
          conflictCells={game.conflictCells}
          dimension={boardDimension}
          disabled={
            game.loadState !== 'ready' ||
            solved ||
            game.solutionRevealed ||
            game.showConflictPanel
          }
          manualMarks={game.manualMarks}
          marks={game.marks}
          onChangeMark={game.changeMark}
          onMarkStart={game.markHaptic}
          onCycleCell={game.cycleCell}
          queens={game.queens}
          showPatterns={game.preferences.patterns}
          solutionCells={game.solutionCells}
          solutionRevealed={game.solutionRevealed}
        />
      ) : (
        <View style={[styles.boardPlaceholder, { height: boardDimension, width: boardDimension }]} />
      )}

      <ConflictTrigger
        onPress={() => game.setShowConflictPanel(true)}
        visible={hasConflicts && !game.showConflictPanel}
      />
      <BoardOverlay
        dimension={boardDimension}
        elapsedSeconds={game.elapsedSeconds}
        error={game.error}
        loading={game.loadState === 'loading'}
        onCloseConflicts={() => game.setShowConflictPanel(false)}
        onNewGame={game.newGame}
        onOpenRules={openRulesFromConflict}
        showConflicts={game.showConflictPanel}
        solutionRevealed={game.solutionRevealed}
        solved={solved}
        status={game.status}
      />
    </View>
  );

  const actions = (
    <ActionBar
      autoMark={game.preferences.autoMark}
      compact={isLandscape}
      loading={game.loadState === 'loading'}
      onNewGame={game.newGame}
      onRetry={game.retry}
      onSolution={game.revealSolution}
      onToggleAutoMark={() =>
        game.setPreference('autoMark', !game.preferences.autoMark)
      }
      onTogglePatterns={() =>
        game.setPreference('patterns', !game.preferences.patterns)
      }
      patterns={game.preferences.patterns}
      solutionAvailable={Boolean(game.puzzle?.solution)}
      solutionRevealed={game.solutionRevealed}
      solved={solved}
      vertical={isLandscape}
    />
  );

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
          <View style={[styles.content, { width: portraitContentWidth }]}>
            {header}
            {stats}
            {board}
            {actions}
          </View>
        )}
      </ScrollView>

      <SizeSheet
        onChoose={game.chooseSize}
        onClose={() => setShowSizes(false)}
        size={game.size}
        visible={showSizes}
      />
      <RulesSheet
        haptics={game.preferences.haptics}
        onClose={() => setShowRules(false)}
        onToggleHaptics={(value) => game.setPreference('haptics', value)}
        visible={showRules}
      />
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
  content: {
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
  boardStage: {
    alignSelf: 'center',
    position: 'relative',
  },
  boardPlaceholder: {
    backgroundColor: '#E6E3DE',
    borderColor: colors.lineStrong,
    borderRadius: radius.md,
    borderWidth: 2,
  },
});
