import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

type Props = {
  currentStep: 1 | 2;
};

export function AuthSteps({ currentStep }: Props) {
  const theme = useTheme();
  const active = theme.colors.primary;
  const inactive = theme.colors.outlineVariant;

  return (
    <View style={styles.container}>
      {/* Step 1 */}
      <View style={styles.step}>
        <View
          style={[
            styles.circle,
            {
              borderColor: active,
              backgroundColor: currentStep >= 1 ? active : 'transparent',
            },
          ]}
        >
          <Text style={styles.circleText}>1</Text>
        </View>
        <Text
          style={[
            styles.label,
            { color: currentStep >= 1 ? active : theme.colors.onSurfaceVariant },
          ]}
        >
          Login
        </Text>
      </View>

      <View style={[styles.line, { backgroundColor: currentStep >= 2 ? active : inactive }]} />

      {/* Step 2 */}
      <View style={styles.step}>
        <View
          style={[
            styles.circle,
            {
              borderColor: active,
              backgroundColor: currentStep >= 2 ? active : 'transparent',
            },
          ]}
        >
          <Text style={styles.circleText}>2</Text>
        </View>
        <Text
          style={[
            styles.label,
            { color: currentStep >= 2 ? active : theme.colors.onSurfaceVariant },
          ]}
        >
          Complete profile
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    marginBottom: vs(16),
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
  },
  circle: {
    width: s(26),
    height: s(26),
    borderRadius: s(13),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleText: {
    fontSize: ms(13),
    color: 'white',
  },
  label: {
    fontSize: ms(13),
  },
  line: {
    flex: 1,
    height: 2,
  },
});
