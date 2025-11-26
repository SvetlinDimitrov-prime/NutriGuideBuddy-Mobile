import { Linking, Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

type Props = {
  style?: ViewStyle;
};

const OFF_DATA_URL = 'https://world.openfoodfacts.org/data';
const OFF_TERMS_URL = 'https://world.openfoodfacts.org/terms-of-use';

export default function OpenFoodFactsAttribution({ style }: Props) {
  const theme = useTheme() as MD3Theme;
  const styles = makeStyles(theme);

  const openDataPage = () => {
    Linking.openURL(OFF_DATA_URL).catch(() => {
      // swallow – no toast here to keep it subtle
    });
  };

  const openTermsPage = () => {
    Linking.openURL(OFF_TERMS_URL).catch(() => {});
  };

  return (
    <View style={[styles.root, style]}>
      <Text style={styles.line1}>
        This search uses data from{' '}
        <Text style={styles.link} onPress={openDataPage}>
          Open Food Facts
        </Text>
        .
      </Text>

      <Text style={styles.line2}>
        Database: ODbL · Contents: DbCL · Images:{' '}
        <Text style={styles.link} onPress={openTermsPage}>
          CC BY-SA
        </Text>
        .
      </Text>
    </View>
  );
}

function makeStyles(theme: MD3Theme) {
  const isWeb = Platform.OS === 'web';

  return StyleSheet.create({
    root: {
      marginTop: vs(12),
      marginBottom: vs(4),
      paddingHorizontal: isWeb ? 0 : s(2),
    },

    line1: {
      fontSize: ms(11, 0.2),
      color: theme.colors.onSurfaceVariant,
    },

    line2: {
      marginTop: vs(2),
      fontSize: ms(10, 0.2),
      color: theme.colors.onSurfaceVariant,
      opacity: 0.85,
    },

    link: {
      textDecorationLine: 'underline',
      color: theme.colors.primary,
    },
  });
}
