import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Button, Divider, Surface, Text, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

const truncateLabel = (label: string, max = 14) =>
  label.length > max ? `${label.slice(0, max - 1)}…` : label;

// ✅ each row has its own generic type
export type ChipsPanelRow<T = any> = {
  key: string;
  title?: string;
  items: T[];
  selectedId: string | null;
  onSelect: (item: T) => void;
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  maxLabelChars?: number;
};

type Props = {
  rows: ChipsPanelRow<any>[];
  style?: ViewStyle;
};

export default function ChipsPanel({ rows, style }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const isWeb = Platform.OS === 'web';
  const useWrap = isWeb; // wrap on web, horizontal scroll on native

  return (
    <Surface style={[styles.card, style]} elevation={0}>
      {rows.map((row, idx) => {
        const maxChars = row.maxLabelChars ?? 16;

        const RowContent = (
          <View style={[styles.rowWrap, useWrap && styles.rowWrapWeb]}>
            {row.items.map((item) => {
              const id = row.getId(item);
              const label = row.getLabel(item);
              const selected = id === row.selectedId;

              return (
                <Button
                  key={id}
                  mode={selected ? 'contained' : 'outlined'}
                  onPress={() => row.onSelect(item)}
                  style={styles.chip}
                  labelStyle={[styles.chipLabel, selected && styles.chipLabelSelected]}
                  compact
                >
                  {truncateLabel(label, maxChars)}
                </Button>
              );
            })}
          </View>
        );

        return (
          <View key={row.key} style={styles.rowBlock}>
            {!!row.title && <Text style={styles.rowTitle}>{row.title}</Text>}

            {useWrap ? (
              RowContent
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.rowWrap}
              >
                {RowContent}
              </ScrollView>
            )}

            {idx < rows.length - 1 && <Divider style={styles.divider} />}
          </View>
        );
      })}
    </Surface>
  );
}

function makeStyles(theme: any) {
  type Styles = {
    card: ViewStyle;
    rowBlock: ViewStyle;
    rowTitle: TextStyle;
    rowWrap: ViewStyle;
    rowWrapWeb: ViewStyle;
    chip: ViewStyle;
    chipLabel: TextStyle;
    chipLabelSelected: TextStyle;
    divider: ViewStyle;
  };

  return StyleSheet.create<Styles>({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: s(14),
      paddingVertical: vs(8),
      paddingHorizontal: s(12),
      width: '100%',
      gap: vs(6),
    },

    rowBlock: {
      gap: vs(6),
    },

    rowTitle: {
      fontSize: ms(10, 0.2),
      fontWeight: '800',
      color: theme.colors.onSurfaceVariant,
      opacity: 0.9,
      paddingHorizontal: s(2),
    },

    rowWrap: {
      flexDirection: 'row',
      gap: s(8),
      paddingVertical: vs(2),
      paddingRight: s(2),
    },

    rowWrapWeb: {
      flexWrap: 'wrap',
      paddingRight: 0,
    },

    chip: {
      borderRadius: s(999),
    },

    chipLabel: {
      fontSize: ms(11, 0.2),
      fontWeight: '700',
      color: theme.colors.onSurface,
    },

    chipLabelSelected: {
      color: theme.colors.onPrimary,
    },

    divider: {
      marginTop: vs(6),
      opacity: 0.6,
    },
  });
}
