// src/components/home/meal/foodModal/search/SearchHeader.tsx
import { Platform, StyleSheet, View } from 'react-native';
import { IconButton, Searchbar, Text, useTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';
import { useBreakpoints, useResponsiveStyles } from '@/theme/responsive';

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  onBack: () => void;
};

export default function SearchHeader({ query, onQueryChange, onBack }: Props) {
  const theme = useTheme() as MD3Theme;
  const bp = useBreakpoints();
  const styles = useResponsiveStyles(theme, bp, makeStyles);

  return (
    <View style={styles.root}>
      {/* top bar */}
      <View style={styles.appBar}>
        <IconButton
          icon={Platform.OS === 'ios' ? 'chevron-left' : 'arrow-left'}
          size={s(20)}
          onPress={onBack}
          style={styles.appBarIcon}
        />
        <View>
          {/* 🔄 updated title + subtitle */}
          <Text style={styles.appBarTitle}>Add food</Text>
          <Text style={styles.appBarSubtitle}>Search database</Text>
        </View>
      </View>

      {/* search */}
      <View style={styles.searchBarWrap}>
        <Searchbar
          placeholder="Search foods…"
          value={query}
          onChangeText={onQueryChange}
          autoFocus
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          icon="magnify"
          clearIcon="close"
        />
      </View>
    </View>
  );
}

function makeStyles(
  theme: MD3Theme,
  _bp: { isXL: boolean; isLG: boolean; isMD: boolean; isSM: boolean },
) {
  const outline = theme.colors.outlineVariant;

  return StyleSheet.create({
    root: {
      marginBottom: vs(8),
    },

    appBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      marginBottom: vs(8),
    },

    appBarIcon: {
      margin: 0,
    },

    appBarTitle: {
      fontSize: ms(18, 0.2),
      fontWeight: Platform.OS === 'ios' ? '600' : '700',
    },

    appBarSubtitle: {
      fontSize: ms(12, 0.2),
      color: theme.colors.onSurfaceVariant,
      marginTop: vs(2),
    },

    searchBarWrap: {
      marginBottom: vs(4),
    },

    searchBar: {
      elevation: 0,
      borderRadius: s(999),
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: outline,
      height: vs(42),
    },

    searchInput: {
      fontSize: ms(14, 0.2),
    },
  });
}
