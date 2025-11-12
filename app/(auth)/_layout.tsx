import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from 'react-native-paper';

export default function AuthLayout() {
  const theme = useTheme();
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
      </Stack>
    </>
  );
}
