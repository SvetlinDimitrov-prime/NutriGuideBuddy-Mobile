import type { ServingView } from '@/api/types/mealFoods';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';
import { useMemo, useState } from 'react';
import { Platform, StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { Button, Menu, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

type Props = {
  visible: boolean;
  servings: ServingView[];
  selected: ServingView | null;
  qtyText: string;
  onQtyChange: (t: string) => void;
  onSelectServing: (sv: ServingView) => void;
  gramsPreview: number;
  kcalPreview: number;
  kcalUnit: string;
  onCancel: () => void;
  onSave: () => void;
  saving?: boolean;
  saveDisabled?: boolean;
};

export function ServingEditorCard({
  visible,
  servings,
  selected,
  qtyText,
  onQtyChange,
  onSelectServing,
  gramsPreview,
  kcalPreview,
  kcalUnit,
  onCancel,
  onSave,
  saving,
  saveDisabled,
}: Props) {
  const theme = useTheme();
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  const [menuOpen, setMenuOpen] = useState(false);

  const qtyNum = useMemo(() => {
    if (!qtyText) return 0;
    const v = Number(qtyText.replace(',', '.'));
    return Number.isFinite(v) && v > 0 ? v : 0;
  }, [qtyText]);

  const openMenu = () => {
    setMenuOpen(false);
    requestAnimationFrame(() => setMenuOpen(true));
  };
  const closeMenu = () => setMenuOpen(false);

  const handleSelectServing = (sv: ServingView) => {
    closeMenu();
    requestAnimationFrame(() => onSelectServing(sv));
  };

  const handleQtyChange = (t: string) => {
    let cleaned = t.replace(/[^0-9.,]/g, '').replace(/-/g, '');

    if (cleaned.trim() === '') {
      onQtyChange('');
      return;
    }

    const firstSepMatch = cleaned.match(/[.,]/);
    const sepChar = firstSepMatch?.[0] ?? null;
    const hasTrailingSep = /[.,]$/.test(cleaned);

    const parts = cleaned.split(/[.,]/);
    let beforeRaw = parts[0] ?? '';
    let afterRaw = parts.slice(1).join('');

    let beforeDigits = beforeRaw.replace(/\D/g, '');
    let afterDigits = afterRaw.replace(/\D/g, '');

    if (beforeDigits === '' && sepChar && cleaned[0].match(/[.,]/)) {
      beforeDigits = '0';
    }

    const totalDigits = (beforeDigits + afterDigits).slice(0, 4);

    if (!sepChar) {
      onQtyChange(totalDigits);
      return;
    }

    const beforeLen = Math.min(beforeDigits.length || 1, totalDigits.length);
    const finalBefore = totalDigits.slice(0, beforeLen);
    const finalAfter = totalDigits.slice(finalBefore.length);

    let out = finalBefore;

    if (hasTrailingSep && finalAfter.length === 0) {
      out += sepChar;
    } else if (finalAfter.length > 0) {
      out += sepChar + finalAfter;
    }

    onQtyChange(out);
  };

  if (!visible) return null;

  return (
    <Surface style={styles.editCard} elevation={0}>
      <Text style={styles.hintText}>Choose a serving and adjust amount</Text>

      {/* SINGLE ROW ALWAYS */}
      <View style={styles.row}>
        {/* serving dropdown */}
        <Menu
          visible={menuOpen}
          onDismiss={closeMenu}
          anchor={
            <Button
              mode="text"
              icon={menuOpen ? 'chevron-up' : 'chevron-down'}
              onPress={openMenu}
              style={styles.selectBtn}
              contentStyle={styles.selectContent}
              labelStyle={styles.selectLabel}
              compact
            >
              {selected?.metric ?? 'Serving'}
            </Button>
          }
        >
          {servings.map((sv) => (
            <Menu.Item
              key={sv.id}
              title={`${sv.metric} • ${sv.gramsTotal} g`}
              onPress={() => handleSelectServing(sv)}
            />
          ))}
        </Menu>

        {/* compact amount input */}
        <View style={styles.amountBox}>
          <Text style={styles.amountMiniLabel}>Amount</Text>
          <TextInput
            mode="flat"
            value={qtyText}
            onChangeText={handleQtyChange}
            keyboardType="numeric"
            dense
            placeholder="0"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            style={styles.amountInput}
            contentStyle={styles.amountContent}
          />
        </View>

        {/* previews right next to selector on phone, right-aligned on web */}
        <View style={styles.previewInline}>
          <Text style={styles.previewText}>≈ {gramsPreview.toFixed(1)} g</Text>
          <Text style={styles.previewTextStrong}>
            🔥 ≈ {kcalPreview.toFixed(0)} {kcalUnit}
          </Text>
        </View>
      </View>

      <View style={styles.editActions}>
        <Button onPress={onCancel} mode="text" compact>
          Cancel
        </Button>
        <Button
          onPress={onSave}
          mode="contained"
          compact
          loading={saving}
          disabled={saveDisabled || qtyNum <= 0}
        >
          Save
        </Button>
      </View>
    </Surface>
  );
}

function makeStyles(theme: MD3Theme, bp: any) {
  const isSmall = bp.isSM || bp.isMD;
  const isWeb = Platform.OS === 'web';

  const pad = isWeb ? s(10) : s(12);
  const gap = isSmall ? s(6) : s(8);

  const selectHeight = isSmall ? vs(30) : isWeb ? vs(30) : vs(32);

  // smaller amount field (good for <=5 digits)
  const amountWidth = isSmall ? s(64) : isWeb ? s(56) : s(60);

  type Styles = {
    editCard: ViewStyle;
    hintText: TextStyle;

    row: ViewStyle;

    selectBtn: ViewStyle;
    selectContent: ViewStyle;
    selectLabel: TextStyle;

    amountBox: ViewStyle;
    amountMiniLabel: TextStyle;
    amountInput: TextStyle;
    amountContent: TextStyle;

    previewInline: ViewStyle;
    previewText: TextStyle;
    previewTextStrong: TextStyle;

    editActions: ViewStyle;
  };

  return StyleSheet.create<Styles>({
    editCard: {
      marginTop: vs(4),
      marginBottom: vs(6),
      padding: pad,
      borderRadius: s(12),
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.outlineVariant,
      gap: vs(8),
    },

    hintText: {
      fontSize: ms(isSmall ? 10.5 : 11, 0.2),
      color: theme.colors.onSurfaceVariant,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap,
      flexWrap: 'nowrap', // keep ONE row
    },

    selectBtn: {
      borderRadius: s(999),
      backgroundColor: 'transparent',
      paddingHorizontal: 0,
      maxWidth: isSmall ? s(120) : s(160),
      flexShrink: 0,
    },
    selectContent: {
      height: selectHeight,
      justifyContent: 'center',
      paddingHorizontal: s(2),
    },
    selectLabel: {
      fontSize: ms(isSmall ? 11 : 12, 0.2),
      fontWeight: '700',
    },

    amountBox: {
      width: amountWidth,
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.outlineVariant,
      paddingBottom: vs(1),
      flexShrink: 0,
    },
    amountMiniLabel: {
      fontSize: ms(9, 0.2),
      color: theme.colors.onSurfaceVariant,
      marginBottom: vs(0),
      fontWeight: '600',
    },
    amountInput: {
      backgroundColor: 'transparent',
      fontSize: ms(isSmall ? 12.5 : 13, 0.2),
      fontWeight: '800',
      textAlign: 'center',
      paddingHorizontal: 0,
      width: '100%',
      minHeight: vs(20),
    },
    amountContent: {
      paddingVertical: 0,
      textAlign: 'center',
      fontSize: ms(isSmall ? 12.5 : 13, 0.2),
      fontWeight: '800',
      minHeight: vs(20),
    },

    previewInline: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      flexShrink: 1,
      // phone: keep it near selector, don't push away
      ...(isSmall ? { marginLeft: s(6) } : { marginLeft: 'auto' }),
    },
    previewText: {
      fontSize: ms(isSmall ? 11 : 12, 0.2),
      color: theme.colors.onSurfaceVariant,
      flexShrink: 1,
    },
    previewTextStrong: {
      fontSize: ms(isSmall ? 11 : 12, 0.2),
      fontWeight: '800',
      color: theme.colors.onSurface,
      flexShrink: 1,
    },

    editActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: s(8),
      marginTop: vs(4),
    },
  });
}
