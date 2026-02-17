import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { usePaywall } from '@/context/PaywallContext';
import { BodyFont, ContentBg, HeadingFont } from '@/constants/theme';
import { TabHeader } from '@/components/tab-header';
import { getPremiumState } from '@/services/revenuecat';

const GAME_IMAGES = {
  conversation: require('@/assets/games/conversations.png'),
  neverever: require('@/assets/games/neverever.png'),
  headsup: require('@/assets/games/headsup.png'),
} as const;

const GAMES = [
  {
    id: 'headsup' as const,
    title: 'Heads Up',
    description: 'Guess the word from your mates clues — tilt down for correct, up to skip',
  },
  {
    id: 'neverever' as const,
    title: 'Never Have I Ever…',
    description: 'Read the card aloud — whoever has done it, drinks!',
  },
  {
    id: 'conversation' as const,
    title: 'Conversations',
    description: 'Choose from a list of topics and discuss',
  },
];

export default function GamesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { openPaywall } = usePaywall();

  const handleGamePress = async (gameId: string) => {
    const { isPremium } = await getPremiumState();
    if (!isPremium) {
      openPaywall();
      return;
    }
    router.push(`/games/${gameId}` as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: ContentBg }]}>
      <TabHeader title="Games" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 40, paddingBottom: insets.bottom + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {GAMES.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={styles.gameCard}
            onPress={() => handleGamePress(game.id)}
            activeOpacity={0.8}
          >
            <View style={styles.gameImageWrap}>
              <Image source={GAME_IMAGES[game.id]} style={styles.gameImage} contentFit="cover" />
            </View>
            <View style={styles.gameTextWrap}>
              <MaterialCommunityIcons
                name="crown"
                size={24}
                color="#F4B744"
                style={styles.gameCrown}
              />
              <Text style={styles.gameTitle}>{game.title}</Text>
              <Text style={styles.gameDescription}>{game.description}</Text>
            </View>
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
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 32,
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
  gameImageWrap: {
    width: '100%',
    aspectRatio: 1.6,
    paddingTop: 1,
    overflow: 'hidden',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  gameImage: {
    width: '100%',
    height: '100%',
  },
  gameTextWrap: {
    padding: 18,
  },
  gameCrown: {
    marginBottom: 0,
    alignSelf: 'flex-start',
  },
  gameTitle: {
    fontSize: 18,
    fontFamily: HeadingFont,
    color: '#11181C',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 14,
    fontFamily: BodyFont,
    color: '#687076',
    lineHeight: 20,
  },
});
