// app/(auth)/login.tsx
import * as Google from 'expo-auth-session/providers/google';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { ms, s, vs } from 'react-native-size-matters';

import { useDevLogin, useGoogleLogin } from '@/api/hooks/useAuth';
import PageShell from '@/components/PageShell';
import DevLoginCard from '@/components/auth/login/DevLoginCard';
import GoogleLoginButton from '@/components/auth/login/GoogleLoginButton';

import type { DevUserKey } from '@/api/types/auth';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;

  const containerStyle = useMemo(() => [{ maxWidth: isWide ? s(520) : s(480) }], [isWide]);

  const googleLoginMutation = useGoogleLogin();
  const devLoginMutation = useDevLogin();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: Platform.select({
      web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
      default: undefined,
    }),
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (request?.redirectUri) {
      console.log('Google redirect URI:', request.redirectUri);
    }
  }, [request]);

  const handledTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (response?.type !== 'success') return;

    const idToken = response.params.id_token as string | undefined;
    if (!idToken) return;

    if (handledTokenRef.current === idToken) return;
    handledTokenRef.current = idToken;

    googleLoginMutation.mutate(idToken, {
      onSuccess: () => {
        router.replace('/home');
      },
    });
  }, [response, googleLoginMutation]);

  const interactionDisabled = googleLoginMutation.isPending || devLoginMutation.isPending;

  const handleGoogleLogin = () => {
    if (!request || interactionDisabled) return;
    promptAsync();
  };

  const handleDevLogin = (userKey: DevUserKey) => {
    if (interactionDisabled) return;
    devLoginMutation.mutate(userKey, {
      onSuccess: () => {
        router.replace('/home');
      },
    });
  };

  return (
    <PageShell scrollable={false} contentStyle={styles.content}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title} accessibilityRole="header">
          Welcome
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Sign in with your Google account
        </Text>
      </View>

      {/* CONTENT */}
      <View style={[styles.stack, containerStyle]}>
        <GoogleLoginButton
          disabled={!request || interactionDisabled}
          loading={googleLoginMutation.isPending}
          onPress={handleGoogleLogin}
        />

        {__DEV__ && (
          <DevLoginCard
            disabled={interactionDisabled}
            loading={devLoginMutation.isPending}
            onLogin={handleDevLogin}
          />
        )}
      </View>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  content: {
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
    gap: s(16),
  },
});
