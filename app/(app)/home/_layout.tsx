import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />

      <Stack.Screen
        name="meal/[id]"
        options={{
          presentation: 'modal',
          animation: 'slide_from_left',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="meal/new"
        options={{
          presentation: 'modal',
          animation: 'slide_from_left',
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
