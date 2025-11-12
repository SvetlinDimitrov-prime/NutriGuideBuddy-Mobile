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

export default function Register() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;

  // theme-bound styles (avoid inline color objects)
  const themed = useMemo(
    () =>
      StyleSheet.create({
        pageBG: { backgroundColor: theme.colors.background },
        surfaceBG: { backgroundColor: theme.colors.surface },
        linkColor: { color: theme.colors.primary },
      }),
    [theme.colors.background, theme.colors.surface, theme.colors.primary],
  );

  const containerStyle = useMemo(() => [{ maxWidth: isWide ? s(520) : s(480) }], [isWide]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const emailError = !!email && !/^\S+@\S+\.\S+$/.test(email);
  const passShort = !!pass && pass.length < 6;
  const mismatch = !!confirm && confirm !== pass;

  const valid = !emailError && !passShort && !mismatch && !!email && !!pass && !!agree;

  const onRegister = async () => {
    if (!valid) return;
    try {
      setSubmitting(true);
      router.replace('/home');
    } finally {
      setSubmitting(false);
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
              Create account
            </Text>
            <Text style={[styles.subtitle]}>{'It’s quick and easy'}</Text>
          </View>

          <View style={[styles.stack, containerStyle]}>
            <TextInput
              mode="outlined"
              label="Full name (optional)"
              value={name}
              onChangeText={setName}
              left={<TextInput.Icon icon="account" />}
              style={[styles.input, themed.surfaceBG]}
            />

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
              style={[styles.input, themed.surfaceBG]}
              error={passShort}
            />
            {passShort && (
              <HelperText type="error" visible style={styles.helper}>
                Use at least 6 characters
              </HelperText>
            )}

            <TextInput
              mode="outlined"
              label="Confirm password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showConfirm}
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon
                  icon={showConfirm ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirm((v) => !v)}
                />
              }
              style={[styles.input, themed.surfaceBG]}
              error={mismatch}
            />
            {mismatch && (
              <HelperText type="error" visible style={styles.helper}>
                Passwords don’t match
              </HelperText>
            )}

            <Checkbox.Item
              status={agree ? 'checked' : 'unchecked'}
              onPress={() => setAgree((v) => !v)}
              label="I agree to the Terms & Privacy"
              position="leading"
              style={styles.checkboxItem}
            />

            <Button
              mode="contained"
              onPress={onRegister}
              disabled={!valid || submitting}
              loading={submitting}
              style={styles.button}
            >
              Sign up
            </Button>

            <View style={styles.loginWrap}>
              <Text style={styles.muted}>Already have an account? </Text>
              <Link href="/login">
                <Text style={[styles.link, themed.linkColor]}>Log in</Text>
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

  stack: {
    width: '100%',
    alignSelf: 'center',
    gap: s(10),
  },

  input: {
    fontSize: ms(16, 0.2),
  },
  helper: { marginTop: -vs(6) },

  checkboxItem: { paddingLeft: 0 },

  button: { borderRadius: s(12), marginTop: vs(6) },

  loginWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: s(4),
    marginTop: vs(10),
  },

  muted: { opacity: 0.8 },
  link: { textDecorationLine: 'underline' },
});
