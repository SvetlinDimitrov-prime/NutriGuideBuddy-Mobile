import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { Link } from 'expo-router';
import { s, vs, ms } from 'react-native-size-matters';

export default function ForgotPassword() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;

  const themed = useMemo(
    () =>
      StyleSheet.create({
        pageBG: { backgroundColor: theme.colors.background },
        surfaceBG: { backgroundColor: theme.colors.surface },
        linkColor: { color: theme.colors.primary },
        onSurfaceVariant: { color: theme.colors.onSurfaceVariant },
      }),
    [
      theme.colors.background,
      theme.colors.surface,
      theme.colors.primary,
      theme.colors.onSurfaceVariant,
    ],
  );

  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const emailError = !!email && !/^\S+@\S+\.\S+$/.test(email);

  const onSend = async () => {
    if (emailError || !email) return;
    try {
      setSending(true);
      alert('Reset link sent (demo)');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.page, themed.pageBG]} edges={['right', 'bottom', 'left']}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.center}>
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.title} accessibilityRole="header">
              Reset password
            </Text>
            <Text style={[styles.subtitle, themed.onSurfaceVariant]}>
              We’ll email you a reset link
            </Text>
          </View>

          <View style={isWide ? styles.stackWide : styles.stack}>
            <TextInput
              mode="outlined"
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              left={<TextInput.Icon icon="email" />}
              style={[styles.input, themed.surfaceBG]}
              error={emailError}
            />
            {emailError && (
              <HelperText type="error" visible style={styles.helper}>
                Enter a valid email address
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={onSend}
              disabled={emailError || !email || sending}
              loading={sending}
              style={styles.button}
            >
              Send reset link
            </Button>

            <View style={styles.links}>
              <Link href="/login">
                <Text style={[styles.link, themed.linkColor]}>Back to login</Text>
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: s(16),
    paddingVertical: vs(16),
  },
  flex1: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(16),
  },
  header: { alignItems: 'center' },
  title: { textAlign: 'center' },
  subtitle: {
    marginTop: vs(4),
    opacity: 0.9,
    fontSize: ms(15, 0.2),
    textAlign: 'center',
  },

  // single-column stacks with a max width, no inline styles
  stack: {
    width: '100%',
    alignSelf: 'center',
    maxWidth: s(480),
    gap: s(10),
  },
  stackWide: {
    width: '100%',
    alignSelf: 'center',
    maxWidth: s(520),
    gap: s(10),
  },

  input: {
    fontSize: ms(16, 0.2),
  },
  helper: { marginTop: -vs(6) },

  button: { borderRadius: s(12), marginTop: vs(6) },

  links: { marginTop: vs(10), alignItems: 'center' },
  link: { textDecorationLine: 'underline' },
});
