import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ActionBar } from '@/components/action-bar';
import { AppHeader } from '@/components/app-header';
import { BoardOverlay, ConflictTrigger } from '@/components/board-overlays';
import { GameBoard } from '@/components/game-board';
import { RulesSheet, SizeSheet } from '@/components/game-sheets';
import { ResponsiveGameLayout } from '@/components/responsive-game-layout';
import { StatsBar } from '@/components/stats-bar';
import { colors, radius } from '@/constants/theme';
import { useQueensGame } from '@/hooks/use-queens-game';

export default function QueensScreen() {
  const router = useRouter();
  const [showRules, setShowRules] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const game = useQueensGame();
  const queenCount = game.status?.queenCount ?? 0;
  const solved = game.status?.isSolved ?? false;
  const hasConflicts = Boolean(game.status && game.status.conflicts.size > 0);

  function openRulesFromConflict() {
    game.setShowConflictPanel(false);
    setShowRules(true);
  }

  return (
    <ResponsiveGameLayout
      renderActions={(isLandscape) => (
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
      )}
      renderBoard={(boardDimension) => (
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
            <View
              style={[
                styles.boardPlaceholder,
                { height: boardDimension, width: boardDimension },
              ]}
            />
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
      )}
      renderHeader={(isLandscape) => (
        <AppHeader
          compact={isLandscape}
          logoSource={require('../../assets/images/queens-logo.png')}
          onBack={() => router.replace('/')}
          onOpenRules={() => setShowRules(true)}
          onOpenSizes={() => setShowSizes(true)}
          rail={isLandscape}
          size={game.size}
          title="Queens"
        />
      )}
      renderStats={(isLandscape) => (
        <StatsBar
          bestTime={game.bestTime}
          compact={isLandscape}
          elapsedSeconds={game.elapsedSeconds}
          progressLabel="QUEENS"
          progressValue={`${queenCount}/${game.size}`}
          timerPaused={game.solutionRevealed}
          vertical={isLandscape}
        />
      )}>
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
    </ResponsiveGameLayout>
  );
}

const styles = StyleSheet.create({
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
