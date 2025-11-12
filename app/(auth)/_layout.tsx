import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function AuthLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        statusBarStyle: theme.dark ? 'light' : 'dark',
        animation: Platform.select({ ios: 'default', android: 'fade_from_bottom' }),
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
