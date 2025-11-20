import { useAuthStatus } from '@/hooks/useAuthStatus';
import { Redirect, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function AuthLayout() {
  const theme = useTheme();
  const status = useAuthStatus();
  const pathname = usePathname();

  const onCompleteProfileRoute =
    pathname === '/complete-profile' || pathname === '/(auth)/complete-profile';

  if (status === 'loading') {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (status === 'unauthenticated' && onCompleteProfileRoute) {
    return <Redirect href="/(auth)/login" />;
  }

  if (status === 'authenticated-full') {
    return <Redirect href="/(app)/home" />;
  }

  if (status === 'authenticated-partial' && !onCompleteProfileRoute) {
    return <Redirect href="/(auth)/complete-profile" />;
  }

  return (
    <>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="complete-profile" />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
