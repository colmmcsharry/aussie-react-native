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
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import type { SlangEntry } from '@/data/slang';
import { slangImageMap } from '@/data/image-map';
import { playAudio, stopAudio } from '@/services/audio';

const HEADER_GREEN = '#0a7ea4';

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
      setPlaying(true);
      playAudio(entry.audioFile);
      setTimeout(() => setPlaying(false), 3000);
    }
  }, [entry, playing]);

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
                  <TouchableOpacity
                    onPress={() => onToggleFav(entry.id)}
                    style={[styles.actionBtn, { backgroundColor: '#FFF9E6', borderWidth: 1, borderColor: HEADER_GREEN }]}
                  >
                    <Ionicons
                      name={isFav ? 'heart' : 'heart-outline'}
                      size={24}
                      color={isFav ? '#FF3B57' : HEADER_GREEN}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnPlay, { backgroundColor: playing ? '#FF6B35' : HEADER_GREEN }]}
                    onPress={handlePlay}
                  >
                    <Ionicons name={playing ? 'stop' : 'volume-high'} size={22} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#FFF9E6', borderWidth: 1, borderColor: HEADER_GREEN }]}
                  >
                    <Ionicons name="play-circle-outline" size={24} color={HEADER_GREEN} />
                  </TouchableOpacity>
                </View>

                {entry.notes.length > 0 && (
                  <View style={styles.notesSection}>
                    <Text style={[styles.sectionLabel, { color: HEADER_GREEN }]}>Notes</Text>
                    {entry.notes.map((note, i) => (
                      <View key={i} style={styles.noteRow}>
                        <Text style={[styles.noteText, { color: colors.text }]}>{note}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {entry.examples.length > 0 && (
                  <View style={styles.examplesSection}>
                    <Text style={[styles.sectionLabel, { color: HEADER_GREEN }]}>Examples</Text>
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
    gap: 12,
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPlay: {},
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
