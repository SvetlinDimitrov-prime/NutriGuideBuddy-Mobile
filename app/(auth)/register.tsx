import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { Button, Checkbox, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ms, s, vs } from 'react-native-size-matters';

import { useCreateUser } from '@/api/hooks/useUsers';
import { RegisterFormValues, registerSchema } from '@/api/validation/registerSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

export default function Register() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;

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

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirm: '',
      agree: true,
    },
  });

  const { mutate: createUser, isPending } = useCreateUser((fieldErrors) => {
    Object.entries(fieldErrors).forEach(([field, message]) => {
      if (field in errors || ['email', 'username', 'password'].includes(field)) {
        setError(field as keyof RegisterFormValues, {
          type: 'server',
          message,
        });
      }
    });
  });

  const onSubmit = (values: RegisterFormValues) => {
    createUser(
      {
        email: values.email,
        username: values.username,
        password: values.password,
      },
      {
        onSuccess: () => {
          router.replace('/home');
        },
      },
    );
  };

  const submitting = isSubmitting || isPending;

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
            <Text style={[styles.subtitle]}>It’s quick and easy</Text>
          </View>

          <View style={[styles.stack, containerStyle]}>
            {/* USERNAME (was "Full name (optional)") */}
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    mode="outlined"
                    label="Username"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    left={<TextInput.Icon icon="account" />}
                    style={[styles.input, themed.surfaceBG]}
                    error={!!errors.username}
                  />
                  {!!errors.username && (
                    <HelperText type="error" visible style={styles.helper}>
                      {errors.username.message}
                    </HelperText>
                  )}
                </>
              )}
            />

            {/* EMAIL */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    mode="outlined"
                    label="Email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    left={<TextInput.Icon icon="email" />}
                    style={[styles.input, themed.surfaceBG]}
                    error={!!errors.email}
                  />
                  {!!errors.email && (
                    <HelperText type="error" visible style={styles.helper}>
                      {errors.email.message}
                    </HelperText>
                  )}
                </>
              )}
            />

            {/* PASSWORD */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    mode="outlined"
                    label="Password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showPass}
                    left={<TextInput.Icon icon="lock" />}
                    right={
                      <TextInput.Icon
                        icon={showPass ? 'eye-off' : 'eye'}
                        onPress={() => setShowPass((v) => !v)}
                      />
                    }
                    style={[styles.input, themed.surfaceBG]}
                    error={!!errors.password}
                  />
                  {!!errors.password && (
                    <HelperText type="error" visible style={styles.helper}>
                      {errors.password.message}
                    </HelperText>
                  )}
                </>
              )}
            />

            {/* CONFIRM PASSWORD */}
            <Controller
              control={control}
              name="confirm"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    mode="outlined"
                    label="Confirm password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showConfirm}
                    left={<TextInput.Icon icon="lock-check" />}
                    right={
                      <TextInput.Icon
                        icon={showConfirm ? 'eye-off' : 'eye'}
                        onPress={() => setShowConfirm((v) => !v)}
                      />
                    }
                    style={[styles.input, themed.surfaceBG]}
                    error={!!errors.confirm}
                  />
                  {!!errors.confirm && (
                    <HelperText type="error" visible style={styles.helper}>
                      {errors.confirm.message}
                    </HelperText>
                  )}
                </>
              )}
            />

            {/* AGREE TO TERMS */}
            <Controller
              control={control}
              name="agree"
              render={({ field: { value, onChange } }) => (
                <>
                  <Checkbox.Item
                    status={value ? 'checked' : 'unchecked'}
                    onPress={() => onChange(!value)}
                    label="I agree to the Terms & Privacy"
                    position="leading"
                    style={styles.checkboxItem}
                  />
                  {!!errors.agree && (
                    <HelperText type="error" visible style={styles.helper}>
                      {errors.agree.message}
                    </HelperText>
                  )}
                </>
              )}
            />

            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              disabled={submitting}
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
