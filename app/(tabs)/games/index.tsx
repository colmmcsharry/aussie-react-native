import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { TabHeader } from '@/components/tab-header';

const CONTENT_BG = '#F0F4F8';
const ACCENT_BLUE = '#194F89';

const GAMES = [
  {
    id: 'conversation',
    title: 'Conversations',
    description: 'Choose from a list of topics and discuss',
    icon: 'chatbubbles' as const,
  },
  {
    id: 'neverever',
    title: 'Never Have I Ever…',
    description: 'Read the card aloud — whoever has done it, drinks!',
    icon: 'beer' as const,
  },
  {
    id: 'headsup',
    title: 'Heads Up',
    description: 'Guess the word from your mates — tilt down for correct, up to skip',
    icon: 'phone-portrait-outline' as const,
  },
];

export default function GamesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: CONTENT_BG }]}>
      <TabHeader title="Games" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 24, paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {GAMES.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={styles.gameCard}
            onPress={() => router.push(`/games/${game.id}` as any)}
            activeOpacity={0.8}
          >
            <View style={styles.gameIconWrap}>
              <Ionicons name={game.icon} size={44} color={ACCENT_BLUE} />
            </View>
            <View style={styles.gameTextWrap}>
              <Text style={styles.gameTitle}>{game.title}</Text>
              <Text style={styles.gameDescription}>{game.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#687076" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  gameIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(25, 79, 137, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  gameTextWrap: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 14,
    color: '#687076',
    lineHeight: 20,
  },
});
