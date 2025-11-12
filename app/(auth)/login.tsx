// app/(auth)/login.tsx
import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Checkbox, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { s, vs, ms } from 'react-native-size-matters';

export default function Login() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;

  const containerStyle = useMemo(() => [{ maxWidth: isWide ? s(520) : s(480) }], [isWide]);

  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const emailError = !!email && !/^\S+@\S+\.\S+$/.test(email);

  const onLogin = async () => {
    if (emailError || !email || !pass) return;
    try {
      setSubmitting(true);
      router.replace('/home');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.page, { backgroundColor: theme.colors.background }]}
      edges={['right', 'bottom', 'left']}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.center}>
          {/* header (flat, centered) */}
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.title} accessibilityRole="header">
              Welcome back
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Sign in to continue
            </Text>
          </View>

          {/* flat stack — no card */}
          <View style={[styles.stack, containerStyle]}>
            <TextInput
              mode="outlined" // keep outlined, but no surrounding Card
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              left={<TextInput.Icon icon="email" />}
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              error={emailError}
            />
            {emailError && (
              <HelperText type="error" visible style={styles.helper}>
                Enter a valid email address
              </HelperText>
            )}

            <TextInput
              mode="outlined"
              label="Password"
              value={pass}
              onChangeText={setPass}
              secureTextEntry={!showPass}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPass ? 'eye-off' : 'eye'}
                  onPress={() => setShowPass((v) => !v)}
                />
              }
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
            />

            <View style={styles.rowBetween}>
              <Checkbox.Item
                status={remember ? 'checked' : 'unchecked'}
                onPress={() => setRemember((v) => !v)}
                label="Remember me"
                position="leading"
                style={styles.checkboxItem}
              />
              <Link href="/forgot-password">
                <Text style={[styles.link, { color: theme.colors.primary }]}>Forgot password?</Text>
              </Link>
            </View>

            <Button
              mode="contained"
              onPress={onLogin}
              disabled={emailError || !email || !pass || submitting}
              loading={submitting}
              style={styles.button}
            >
              Log in
            </Button>

            <View style={styles.createWrap}>
              <Text style={styles.muted}>Don’t have an account? </Text>
              <Link href="/register">
                <Text style={[styles.link, { color: theme.colors.primary }]}>Create one</Text>
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

  // flat stack container
  stack: {
    width: '100%',
    alignSelf: 'center',
    gap: s(10),
  },

  input: {
    fontSize: ms(16, 0.2),
  },
  helper: { marginTop: -vs(6) },

  rowBetween: {
    marginTop: vs(2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkboxItem: { paddingLeft: 0 },

  button: { borderRadius: s(12), marginTop: vs(6) },

  createWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: s(4),
    marginTop: vs(10),
  },

  muted: { opacity: 0.8 },
  link: { textDecorationLine: 'underline' },
});
