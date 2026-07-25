import {
  Check,
  Crown,
  Equal,
  Hand,
  LayoutGrid,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  X,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '@/constants/theme';
import { BOARD_SIZES } from '@/lib/game';

type SheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

function Sheet({ visible, title, onClose, children }: SheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <Pressable
        accessibilityLabel="Close sheet"
        onPress={onClose}
        style={styles.backdrop}>
        <View
          onStartShouldSetResponder={() => true}
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable
              accessibilityLabel="Close"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
              <X color={colors.ink} size={22} strokeWidth={1.8} />
            </Pressable>
          </View>
          {children}
        </View>
      </Pressable>
    </Modal>
  );
}

type SizeSheetProps = {
  visible: boolean;
  size: number;
  options?: readonly number[];
  intro?: string;
  onChoose: (size: number) => void;
  onClose: () => void;
};

export function SizeSheet({
  visible,
  size,
  options = BOARD_SIZES,
  intro = 'Choose a board. Larger boards need a little more patience.',
  onChoose,
  onClose,
}: SizeSheetProps) {
  return (
    <Sheet onClose={onClose} title="Board size" visible={visible}>
      <Text style={styles.intro}>{intro}</Text>
      <View style={styles.sizeGrid}>
        {options.map((option) => {
          const selected = option === size;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={option}
              onPress={() => {
                onChoose(option);
                onClose();
              }}
              style={({ pressed }) => [
                styles.sizeOption,
                selected && styles.sizeOptionSelected,
                pressed && styles.pressed,
              ]}>
              <LayoutGrid color={selected ? colors.white : colors.muted} size={19} strokeWidth={1.7} />
              <Text style={[styles.sizeOptionText, selected && styles.sizeOptionTextSelected]}>
                {option} × {option}
              </Text>
              {selected && <Check color={colors.white} size={17} strokeWidth={2.4} />}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

type RuleProps = {
  icon: ReactNode;
  title: string;
  children: string;
};

function Rule({ icon, title, children }: RuleProps) {
  return (
    <View style={styles.rule}>
      <View style={styles.ruleIcon}>{icon}</View>
      <View style={styles.ruleCopy}>
        <Text style={styles.ruleTitle}>{title}</Text>
        <Text style={styles.ruleText}>{children}</Text>
      </View>
    </View>
  );
}

type RulesSheetProps = {
  visible: boolean;
  haptics: boolean;
  onToggleHaptics: (value: boolean) => void;
  onClose: () => void;
};

export function RulesSheet({
  visible,
  haptics,
  onToggleHaptics,
  onClose,
}: RulesSheetProps) {
  return (
    <Sheet onClose={onClose} title="How to play" visible={visible}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.rulesContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Place exactly one queen in every row, column, and colored region.
        </Text>
        <Rule icon={<Crown color={colors.accent} size={19} />} title="One queen per row">
          Every horizontal line must contain one queen, never two.
        </Rule>
        <Rule icon={<LayoutGrid color={colors.success} size={19} />} title="One queen per column">
          Every vertical line must also contain exactly one queen.
        </Rule>
        <Rule icon={<Sparkles color="#A1487A" size={19} />} title="One queen per region">
          Each colored area is a region and needs exactly one queen, whatever its shape.
        </Rule>
        <Rule icon={<ShieldCheck color={colors.danger} size={19} />} title="Queens cannot touch">
          Two queens may not be neighbors, including diagonally. A one-cell gap is safe.
        </Rule>
        <Rule icon={<Hand color={colors.muted} size={19} />} title="Use marks to think">
          Tap a cell to place a queen. Long-press to add an X, then drag to mark several cells.
        </Rule>
        <View style={styles.preferenceRow}>
          <View style={styles.preferenceCopy}>
            <Text style={styles.preferenceTitle}>Haptic feedback</Text>
            <Text style={styles.preferenceText}>Gentle confirmation for moves and results.</Text>
          </View>
          <Switch
            accessibilityLabel="Haptic feedback"
            onValueChange={onToggleHaptics}
            thumbColor={colors.white}
            trackColor={{ false: '#C8CDD1', true: colors.accent }}
            value={haptics}
          />
        </View>
      </ScrollView>
    </Sheet>
  );
}

export function TangoRulesSheet({
  visible,
  haptics,
  onToggleHaptics,
  onClose,
}: RulesSheetProps) {
  return (
    <Sheet onClose={onClose} title="How to play Tango" visible={visible}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.rulesContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Fill every cell with a sun or moon while satisfying all five rules.
        </Text>
        <Rule icon={<Sun color="#B96C00" size={19} />} title="Balance every line">
          Each row and column must contain the same number of suns and moons.
        </Rule>
        <Rule icon={<Moon color="#245B9F" size={19} />} title="Stop at two">
          Never place three matching symbols next to each other horizontally or vertically.
        </Rule>
        <Rule icon={<Equal color={colors.success} size={19} />} title="Equals means match">
          Cells separated by an equals sign must contain the same symbol.
        </Rule>
        <Rule icon={<X color={colors.danger} size={19} />} title="X means different">
          Cells separated by an X must contain opposite symbols.
        </Rule>
        <Rule icon={<Hand color={colors.muted} size={19} />} title="Cycle each cell">
          Tap an empty cell for a sun, tap again for a moon, and once more to clear it.
        </Rule>
        <View style={styles.preferenceRow}>
          <View style={styles.preferenceCopy}>
            <Text style={styles.preferenceTitle}>Haptic feedback</Text>
            <Text style={styles.preferenceText}>Gentle confirmation for moves and results.</Text>
          </View>
          <Switch
            accessibilityLabel="Haptic feedback"
            onValueChange={onToggleHaptics}
            thumbColor={colors.white}
            trackColor={{ false: '#C8CDD1', true: colors.accent }}
            value={haptics}
          />
        </View>
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(20, 28, 35, 0.44)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surfaceSolid,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '86%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: '#CFD3D6',
    borderRadius: radius.pill,
    height: 4,
    marginBottom: spacing.md,
    width: 42,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sheetTitle: {
    color: colors.ink,
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: 0,
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  intro: {
    color: colors.muted,
    fontSize: 15,
    letterSpacing: 0,
    lineHeight: 21,
    marginBottom: spacing.lg,
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sizeOption: {
    alignItems: 'center',
    backgroundColor: '#F1F2F2',
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    width: '48.5%',
  },
  sizeOptionSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  sizeOptionText: {
    color: colors.ink,
    flex: 1,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    letterSpacing: 0,
  },
  sizeOptionTextSelected: {
    color: colors.white,
  },
  rulesContent: {
    paddingBottom: spacing.sm,
  },
  rule: {
    alignItems: 'flex-start',
    borderBottomColor: colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: 14,
  },
  ruleIcon: {
    alignItems: 'center',
    backgroundColor: '#F0F2F2',
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    marginTop: 1,
    width: 36,
  },
  ruleCopy: {
    flex: 1,
  },
  ruleTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 3,
  },
  ruleText: {
    color: colors.muted,
    fontSize: 14,
    letterSpacing: 0,
    lineHeight: 20,
  },
  preferenceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  preferenceCopy: {
    flex: 1,
  },
  preferenceTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0,
  },
  preferenceText: {
    color: colors.muted,
    fontSize: 13,
    letterSpacing: 0,
    lineHeight: 18,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.64,
  },
});
