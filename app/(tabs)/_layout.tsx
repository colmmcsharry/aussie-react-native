import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BodyFont, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function createTabButton(path: string) {
  return function TabButton(
    props: React.ComponentProps<typeof HapticTab>,
  ) {
    const router = useRouter();
    return (
      <HapticTab
        {...props}
        onPress={() => {
          router.replace(path as any);
          props.onPress?.();
        }}
      />
    );
  };
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarLabelStyle: { fontFamily: BodyFont },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="newspaper.fill" color={color} />,
          tabBarButton: createTabButton('/'),
        }}
      />
      <Tabs.Screen
        name="quotes"
        options={{
          title: 'Slang',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="text.book.closed.fill" color={color} />,
          tabBarButton: createTabButton('/quotes'),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: 'Quiz',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="questionmark.circle.fill" color={color} />,
          tabBarButton: createTabButton('/quiz'),
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: 'Videos',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="play.rectangle.fill" color={color} />,
          tabBarButton: createTabButton('/videos'),
        }}
      />
      <Tabs.Screen
        name="games"
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'index';
          return {
            title: 'Games',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="dice-multiple" size={32} color={color} />,
            tabBarButton: createTabButton('/games'),
            tabBarStyle: routeName === 'headsup' ? { display: 'none' } : undefined,
          };
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{ href: null }}
      />
    </Tabs>
  );
}
