import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { s, vs } from 'react-native-size-matters';

type Props = {
  disabled: boolean;
  loading: boolean;
  onPress: () => void;
};

export default function GoogleLoginButton({ disabled, loading, onPress }: Props) {
  return (
    <Button
      mode="contained"
      icon="google"
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      style={styles.button}
    >
      Continue with Google
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: s(12),
    marginTop: vs(6),
  },
});
