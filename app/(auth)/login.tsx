import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import { z } from 'zod';

import { useLogin } from '@/api/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required.').email('Please enter a valid email address.'),
  password: z.string().min(4, 'Password must be at least 4 characters long.'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;

  const containerStyle = useMemo(() => [{ maxWidth: isWide ? s(520) : s(480) }], [isWide]);

  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);

  const loginMutation = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const interactionDisabled = isSubmitting || loginMutation.isPending;
  const disableButton = interactionDisabled || !isValid;

  const onSubmit = (values: LoginForm) => {
    if (interactionDisabled) return;
    loginMutation.mutate({ email: values.email, password: values.password });
  };

  return (
    <SafeAreaView
      style={[styles.page, { backgroundColor: theme.colors.background }]}
      edges={['right', 'bottom', 'left']}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.center}>
          {/* header */}
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.title} accessibilityRole="header">
              Welcome back
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Sign in to continue
            </Text>
          </View>

          {/* form */}
          <View style={[styles.stack, containerStyle]}>
            {/* EMAIL */}
            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange, onBlur } }) => (
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
                    style={[styles.input, { backgroundColor: theme.colors.surface }]}
                    error={!!errors.email}
                    editable={!interactionDisabled}
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
              render={({ field: { value, onChange, onBlur } }) => (
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
                        onPress={() => {
                          if (!interactionDisabled) setShowPass((v) => !v);
                        }}
                      />
                    }
                    style={[styles.input, { backgroundColor: theme.colors.surface }]}
                    error={!!errors.password}
                    editable={!interactionDisabled}
                  />
                  {!!errors.password && (
                    <HelperText type="error" visible style={styles.helper}>
                      {errors.password.message}
                    </HelperText>
                  )}
                </>
              )}
            />

            {/* remember only (forgot password removed) */}
            <View style={styles.rowLeft}>
              <Checkbox.Item
                status={remember ? 'checked' : 'unchecked'}
                onPress={() => {
                  if (!interactionDisabled) setRemember((v) => !v);
                }}
                label="Remember me"
                position="leading"
                style={styles.checkboxItem}
                disabled={interactionDisabled}
              />
            </View>

            {/* submit */}
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              disabled={disableButton}
              loading={interactionDisabled}
              style={styles.button}
            >
              Log in
            </Button>

            {/* create account */}
            <View style={styles.createWrap}>
              <Text style={styles.muted}>Don’t have an account? </Text>
              {interactionDisabled ? (
                <Text style={[styles.link, { color: theme.colors.onSurfaceDisabled }]}>
                  Create one
                </Text>
              ) : (
                <Link href="/(auth)/register">
                  <Text style={[styles.link, { color: theme.colors.primary }]}>Create one</Text>
                </Link>
              )}
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
  keyboardAvoider: {
    flex: 1,
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
  stack: {
    width: '100%',
    alignSelf: 'center',
    gap: s(10),
  },
  input: {
    fontSize: ms(16, 0.2),
  },
  helper: { marginTop: -vs(6) },
  rowLeft: {
    marginTop: vs(2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
