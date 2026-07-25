import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionBar } from '@/components/action-bar';
import { AppHeader } from '@/components/app-header';
import { BoardOverlay, ConflictTrigger } from '@/components/board-overlays';
import { GameBoard } from '@/components/game-board';
import { RulesSheet, SizeSheet } from '@/components/game-sheets';
import { StatsBar } from '@/components/stats-bar';
import { colors, radius, spacing } from '@/constants/theme';
import { useQueensGame } from '@/hooks/use-queens-game';

const MAX_CONTENT_WIDTH = 540;

export default function GameScreen() {
  const { width } = useWindowDimensions();
  const [showRules, setShowRules] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const game = useQueensGame();
  const contentWidth = Math.min(width - spacing.xl, MAX_CONTENT_WIDTH);
  const boardDimension = Math.floor(contentWidth);
  const queenCount = game.status?.queenCount ?? 0;
  const solved = game.status?.isSolved ?? false;
  const hasConflicts = Boolean(game.status && game.status.conflicts.size > 0);

  function openRulesFromConflict() {
    game.setShowConflictPanel(false);
    setShowRules(true);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}>
        <View style={[styles.content, { width: contentWidth }]}>
          <AppHeader
            onOpenRules={() => setShowRules(true)}
            onOpenSizes={() => setShowSizes(true)}
            size={game.size}
          />

          <StatsBar
            bestTime={game.bestTime}
            elapsedSeconds={game.elapsedSeconds}
            queenCount={queenCount}
            size={game.size}
            timerPaused={game.solutionRevealed}
          />

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
                onToggleQueen={game.toggleQueen}
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

          <ActionBar
            autoMark={game.preferences.autoMark}
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
          />
        </View>
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
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  content: {
    gap: spacing.md,
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
