import { Stack } from 'expo-router';

export default function GamesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="conversation"
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}
