import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { Button, Menu, IconButton, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ms, s, vs } from 'react-native-size-matters';

import { useDevLogin, useGoogleLogin } from '@/api/hooks/useAuth';
import { DEV_USER_KEYS, DevUserKey } from '@/api/types/auth';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;

  const containerStyle = useMemo(() => [{ maxWidth: isWide ? s(520) : s(480) }], [isWide]);

  const googleLoginMutation = useGoogleLogin();
  const devLoginMutation = useDevLogin();

  // ---- Google auth request ----
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: Platform.select({
      web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
      default: undefined,
    }),
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  // just for debugging – see what redirect URI Expo uses
  useEffect(() => {
    if (request?.redirectUri) {
      console.log('Google redirect URI:', request.redirectUri);
    }
  }, [request]);

  // ---- DEV user selector state ----
  const [devUser, setDevUser] = useState<DevUserKey>('USER1');
  const [menuVisible, setMenuVisible] = useState(false);
  const devUserLabel = useMemo(() => devUser.replace('USER', 'User '), [devUser]);

  // --- prevent multiple calls with the same idToken ---
  const handledTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (response?.type !== 'success') return;

    const idToken = response.params.id_token as string | undefined;
    if (!idToken) return;

    // if we've already handled this token, do nothing
    if (handledTokenRef.current === idToken) {
      return;
    }
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
    <SafeAreaView
      style={[styles.page, { backgroundColor: theme.colors.background }]}
      edges={['right', 'bottom', 'left']}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.center}>
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
            {/* GOOGLE LOGIN */}
            <Button
              mode="contained"
              icon="google"
              onPress={handleGoogleLogin}
              disabled={!request || interactionDisabled}
              loading={googleLoginMutation.isPending}
              style={styles.googleButton}
            >
              Continue with Google
            </Button>

            {/* DEV-ONLY SECTION (compact) */}
            {__DEV__ && (
              <View style={[styles.devCard, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.devHeaderRow}>
                  <View
                    style={[styles.devBadge, { backgroundColor: theme.colors.primaryContainer }]}
                  >
                    <Text style={[styles.devBadgeText, { color: theme.colors.onPrimaryContainer }]}>
                      DEV
                    </Text>
                  </View>
                  <Text style={[styles.devTitle, { color: theme.colors.onSurface }]}>
                    Quick login as seeded user
                  </Text>
                </View>

                <Text style={[styles.devHint, { color: theme.colors.onSurfaceVariant }]}>
                  Uses one of the predefined demo accounts. This is only available in development
                  builds.
                </Text>

                <View style={styles.devRow}>
                  <Button
                    mode="outlined"
                    icon="account"
                    onPress={() => handleDevLogin(devUser)}
                    disabled={interactionDisabled}
                    loading={devLoginMutation.isPending && devLoginMutation.variables === devUser}
                    style={styles.devLoginButton}
                    contentStyle={styles.devLoginButtonContent}
                    labelStyle={styles.devLoginButtonLabel}
                  >
                    Continue as {devUserLabel}
                  </Button>

                  <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                      <IconButton
                        icon="chevron-down"
                        size={22}
                        onPress={() => setMenuVisible(true)}
                        disabled={interactionDisabled}
                      />
                    }
                  >
                    {DEV_USER_KEYS.map((key) => (
                      <Menu.Item
                        key={key}
                        title={key.replace('USER', 'User ')}
                        onPress={() => {
                          setDevUser(key);
                          setMenuVisible(false);
                        }}
                      />
                    ))}
                  </Menu>
                </View>
              </View>
            )}
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
    gap: s(16),
  },
  googleButton: { borderRadius: s(12), marginTop: vs(6) },
  devCard: {
    marginTop: vs(10),
    borderRadius: s(14),
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
    elevation: 2,
  },
  devHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    marginBottom: vs(2),
  },
  devBadge: {
    paddingHorizontal: s(8),
    paddingVertical: vs(2),
    borderRadius: s(999),
  },
  devBadgeText: {
    fontSize: ms(10),
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  devTitle: {
    fontSize: ms(13, 0.2),
    fontWeight: '600',
  },
  devHint: {
    fontSize: ms(11.5, 0.2),
    opacity: 0.85,
    marginTop: vs(2),
  },
  devRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(10),
  },
  devLoginButton: {
    flex: 1,
    borderRadius: s(999),
  },
  devLoginButtonContent: {
    justifyContent: 'flex-start',
  },
  devLoginButtonLabel: {
    fontSize: ms(14, 0.2),
  },
});
