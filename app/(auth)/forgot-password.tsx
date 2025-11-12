import { useState } from 'react';
import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button } from 'react-native-paper';
import { s, vs, ms } from 'react-native-size-matters';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.center}>
        <Text variant="headlineSmall" style={styles.title}>
          Reset password
        </Text>

        <View style={styles.form}>
          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={() => alert('Reset link sent (demo)')}
            style={styles.button}
          >
            Send reset link
          </Button>

          <View style={styles.links}>
            <Link href="/login">
              <Text>Back to Login</Text>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: s(16), paddingVertical: vs(16) },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: s(12) },
  title: { marginBottom: vs(8) },
  form: { width: '100%', maxWidth: s(560), gap: s(12) },
  input: { backgroundColor: 'transparent', fontSize: ms(16, 0.2) },
  button: { borderRadius: s(12), marginTop: vs(4) },
  links: { marginTop: vs(12) },
});
