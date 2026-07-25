import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { ConflictTrigger } from '@/components/board-overlays';
import { SizeSheet, TangoRulesSheet } from '@/components/game-sheets';
import { ResponsiveGameLayout } from '@/components/responsive-game-layout';
import { StatsBar } from '@/components/stats-bar';
import { TangoActionBar } from '@/components/tango-action-bar';
import { TangoBoard } from '@/components/tango-board';
import { TangoBoardOverlay } from '@/components/tango-overlays';
import { colors, radius } from '@/constants/theme';
import { useTangoGame } from '@/hooks/use-tango-game';
import { TANGO_BOARD_SIZES } from '@/lib/tango-game';

export default function TangoScreen() {
  const router = useRouter();
  const [showRules, setShowRules] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const game = useTangoGame();
  const solved = game.status?.isSolved ?? false;
  const hasConflicts = Boolean(game.status?.conflicts.size);

  function openRulesFromConflict() {
    game.setShowConflictPanel(false);
    setShowRules(true);
  }

  return (
    <ResponsiveGameLayout
      renderActions={(isLandscape) => (
        <TangoActionBar
          canUndo={game.canUndo}
          compact={isLandscape}
          loading={game.loadState === 'loading'}
          onHint={game.revealHint}
          onNewGame={game.newGame}
          onRetry={game.retry}
          onSolution={game.revealSolution}
          onUndo={game.undo}
          solutionRevealed={game.solutionRevealed}
          solved={solved}
          vertical={isLandscape}
        />
      )}
      renderBoard={(boardDimension) => (
        <View style={[styles.boardStage, { height: boardDimension, width: boardDimension }]}>
          {game.puzzle ? (
            <TangoBoard
              board={game.puzzle.board}
              conflicts={game.status?.conflicts ?? new Set<string>()}
              constraints={game.puzzle.constraints}
              dimension={boardDimension}
              disabled={
                game.loadState !== 'ready' ||
                solved ||
                game.solutionRevealed ||
                game.showConflictPanel
              }
              entries={game.entries}
              onCycleCell={game.cycleCell}
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
          <TangoBoardOverlay
            assisted={game.assisted}
            bestTime={game.bestTime}
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
          logoSource={require('../../assets/images/tango-logo.png')}
          onBack={() => router.replace('/')}
          onOpenRules={() => setShowRules(true)}
          onOpenSizes={() => setShowSizes(true)}
          rail={isLandscape}
          size={game.size}
          title="Tango"
        />
      )}
      renderStats={(isLandscape) => (
        <StatsBar
          bestTime={game.bestTime}
          compact={isLandscape}
          elapsedSeconds={game.elapsedSeconds}
          progressLabel="FILLED"
          progressValue={`${game.status?.filledCount ?? 0}/${game.size * game.size}`}
          timerPaused={game.solutionRevealed}
          vertical={isLandscape}
        />
      )}>
      <SizeSheet
        intro="Choose an even board size. Larger Tango boards contain more relationships."
        onChoose={game.chooseSize}
        onClose={() => setShowSizes(false)}
        options={TANGO_BOARD_SIZES}
        size={game.size}
        visible={showSizes}
      />
      <TangoRulesSheet
        haptics={game.preferences.haptics}
        onClose={() => setShowRules(false)}
        onToggleHaptics={game.setHaptics}
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
