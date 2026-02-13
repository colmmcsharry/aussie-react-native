import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import type { SlangEntry } from '@/data/slang';
import { slangImageMap } from '@/data/image-map';
import { playAudio, playAudioSlow, stopAudio } from '@/services/audio';

const ACCENT_BLUE = '#194F89'; // Australian blue

type SlangDetailModalProps = {
  visible: boolean;
  entry: SlangEntry | null;
  isFav: boolean;
  onToggleFav: (id: string) => void;
  onClose: () => void;
  colors: typeof Colors.light;
};

export function SlangDetailModal({
  visible,
  entry,
  isFav,
  onToggleFav,
  onClose,
  colors,
}: SlangDetailModalProps) {
  const [playing, setPlaying] = useState(false);
  const [playingSlow, setPlayingSlow] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

  const handleImageLoad = useCallback((e: { source: { width: number; height: number } }) => {
    const { width, height } = e.source;
    if (width && height) setImageAspectRatio(width / height);
  }, []);

  const handlePlay = useCallback(() => {
    if (!entry) return;
    if (playing) {
      stopAudio();
      setPlaying(false);
    } else {
      setPlayingSlow(false);
      setPlaying(true);
      playAudio(entry.audioFile);
      setTimeout(() => setPlaying(false), 3000);
    }
  }, [entry, playing]);

  const handlePlaySlow = useCallback(() => {
    if (!entry) return;
    if (playingSlow) {
      stopAudio();
      setPlayingSlow(false);
    } else {
      setPlaying(false);
      setPlayingSlow(true);
      playAudioSlow(entry.audioFile, () => setPlayingSlow(false));
    }
  }, [entry, playingSlow]);

  if (!entry) return null;

  const hasImage = entry.image && slangImageMap[entry.image];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.centered} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.card, { backgroundColor: colors.background }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={28} color={colors.icon} />
            </TouchableOpacity>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {hasImage && (
                <Image
                  source={slangImageMap[entry.image!]}
                  style={[
                    styles.cardImageTop,
                    imageAspectRatio != null && { aspectRatio: imageAspectRatio },
                  ]}
                  contentFit="cover"
                  onLoad={handleImageLoad}
                />
              )}

              <View style={styles.cardInner}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  {entry.buttonTitle}
                </Text>
                <Text style={[styles.cardExplanation, { color: colors.icon }]}>
                  {entry.explanation}
                </Text>

                <View style={styles.cardActionsRow}>
                  <Pressable
                    onPress={() => onToggleFav(entry.id)}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      pressed && styles.actionBtnPressed,
                    ]}
                  >
                    <Ionicons
                      name={isFav ? 'heart' : 'heart-outline'}
                      size={30}
                      color={isFav ? '#FF3B57' : ACCENT_BLUE}
                    />
                  </Pressable>
                  <Pressable
                    onPress={handlePlay}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      playing && styles.actionBtnActive,
                      pressed && styles.actionBtnPressed,
                    ]}
                  >
                    <Ionicons
                      name={playing ? 'stop' : 'volume-high'}
                      size={28}
                      color={playing ? '#fff' : ACCENT_BLUE}
                    />
                  </Pressable>
                  <Pressable
                    onPress={handlePlaySlow}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      playingSlow && styles.actionBtnActive,
                      pressed && styles.actionBtnPressed,
                    ]}
                  >
                    {playingSlow ? (
                      <Ionicons name="stop" size={28} color="#fff" />
                    ) : (
                      <MaterialCommunityIcons name="snail" size={28} color={ACCENT_BLUE} />
                    )}
                  </Pressable>
                </View>

                {entry.notes.length > 0 && (
                  <View style={styles.notesSection}>
                    <Text style={[styles.sectionLabel, { color: ACCENT_BLUE }]}>Notes</Text>
                    {entry.notes.map((note, i) => (
                      <View key={i} style={styles.noteRow}>
                        <Text style={[styles.noteText, { color: colors.text }]}>{note}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {entry.examples.length > 0 && (
                  <View style={styles.examplesSection}>
                    <Text style={[styles.sectionLabel, { color: ACCENT_BLUE }]}>Examples</Text>
                    {entry.examples.map((ex, i) => (
                      <View key={i} style={styles.exampleRow}>
                        <Text style={[styles.exampleQuote, { color: colors.text }]}>"{ex}"</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centered: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  scroll: {
    maxHeight: '100%',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  cardImageTop: {
    width: '100%',
    minHeight: 200,
    backgroundColor: '#f0f0f0',
  },
  cardInner: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  cardExplanation: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: { elevation: 3 },
    }),
  },
  actionBtnPressed: {
    transform: [{ scale: 0.92 }],
    ...Platform.select({
      ios: { shadowOpacity: 0.06, shadowRadius: 1 },
      android: { elevation: 1 },
    }),
  },
  actionBtnActive: {
    backgroundColor: ACCENT_BLUE,
  },
  notesSection: {
    marginTop: 16,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  noteRow: {
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  examplesSection: {
    marginBottom: 8,
  },
  exampleRow: {
    marginBottom: 6,
  },
  exampleQuote: {
    fontSize: 14,
    lineHeight: 20,
  },
});
