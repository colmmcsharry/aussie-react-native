import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import {
  Colors,
  ButtonFont,
  CardBodyFont,
  FontSizes,
  SlangDisplayFont,
} from "@/constants/theme";
import type { SlangEntry } from "@/data/slang";
import { slangImageMap } from "@/data/image-map";
import { playAudio, playAudioSlow } from "@/services/audio";

const ACCENT_BLUE = "#194F89";

/** Same light card background as first slang card on Quotes page */
const SLANG_CARD_BG = "#fcf9ef";

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

  const handleImageLoad = useCallback(
    (e: { source: { width: number; height: number } }) => {
      const { width, height } = e.source;
      if (width && height) setImageAspectRatio(width / height);
    },
    []
  );

  const handlePlay = useCallback(() => {
    if (!entry) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlayingSlow(false);
    setPlaying(true);
    playAudio(entry.audioFile);
    setTimeout(() => setPlaying(false), 1000);
  }, [entry]);

  const handlePlaySlow = useCallback(() => {
    if (!entry) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlaying(false);
    setPlayingSlow(true);
    playAudioSlow(entry.audioFile);
    setTimeout(() => setPlayingSlow(false), 1000);
  }, [entry]);

  const handleFavPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleFav(entry!.id);
  }, [entry, onToggleFav]);

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
          <View style={[styles.card, { backgroundColor: SLANG_CARD_BG }]}>
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
                <View style={styles.cardImageWrap}>
                  <Image
                    source={slangImageMap[entry.image!]}
                    style={[
                      styles.cardImageTop,
                      imageAspectRatio != null && {
                        aspectRatio: imageAspectRatio,
                      },
                    ]}
                    contentFit="cover"
                    onLoad={handleImageLoad}
                  />
                </View>
              )}

              <View style={styles.cardInner}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  {entry.buttonTitle}
                </Text>
                <Text style={[styles.cardExplanation, { color: colors.text }]}>
                  {entry.explanation}
                </Text>

                <View style={styles.cardActionsRow}>
                  <View style={styles.cardActionsMain}>
                    <Pressable
                      onPress={handleFavPress}
                      style={({ pressed }) => [
                        styles.actionBtn,
                        pressed && styles.actionBtnPressed,
                      ]}
                    >
                      <Ionicons
                        name={isFav ? "heart" : "heart-outline"}
                        size={38}
                        color={isFav ? "#d95b6e" : ACCENT_BLUE}
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
                        name={playing ? "stop" : "volume-high"}
                        size={40}
                        color={playing ? "#fff" : ACCENT_BLUE}
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
                        <Ionicons name="stop" size={38} color="#fff" />
                      ) : (
                        <MaterialCommunityIcons
                          name="snail"
                          size={38}
                          color={ACCENT_BLUE}
                        />
                      )}
                    </Pressable>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  {entry.notes.length > 0 && (
                    <View style={styles.notesSection}>
                      <Text style={[styles.sectionLabel, { color: ACCENT_BLUE }]}>
                        Notes
                      </Text>
                      {entry.notes.map((note, i) => (
                        <View key={i} style={styles.noteRow}>
                          <Text style={[styles.noteText, { color: colors.text }]}>
                            {note}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {entry.examples.length > 0 && (
                    <View style={styles.examplesSection}>
                      <Text style={[styles.sectionLabel, { color: ACCENT_BLUE }]}>
                        Examples
                      </Text>
                      {entry.examples.map((ex, i) => (
                        <View key={i} style={styles.exampleRow}>
                          <Text
                            style={[styles.exampleQuote, { color: colors.text }]}
                          >
                            "{ex}"
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  centered: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "85%",
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  scroll: {
    maxHeight: "100%",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  cardImageWrap: {
    overflow: "hidden",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardImageTop: {
    width: "100%",
    minHeight: 200,
    backgroundColor: "#f0f0f0",
  },
  cardInner: {
    padding: 16,
  },
  cardTitle: {
    fontSize: FontSizes.display,
    fontFamily: SlangDisplayFont,
    marginTop: 20,
    marginBottom: 16,
  },
  cardExplanation: {
    fontSize: 18,
    lineHeight: 22,
    marginBottom: 30,
    fontFamily: CardBodyFont,
  },
  cardActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardActionsMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionBtn: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        backgroundColor: "rgba(255, 255, 255, 0.58)",
        shadowColor: "#8a8782",
        shadowOffset: { width: 4, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        backgroundColor: "#f0f0f0",
        elevation: 6,
      },
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
  cardBody: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  notesSection: {
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: ButtonFont,
    marginBottom: 4,
  },
  noteRow: {
    marginBottom: 8,
  },
  noteText: {
    fontSize: 16,
    fontStyle: "italic",
    fontFamily: CardBodyFont,
  },
  examplesSection: {
    marginBottom: 8,
  },
  exampleRow: {
    marginBottom: 2,
  },
  exampleQuote: {
    fontSize: 16,
    marginBottom: 6,
    fontFamily: CardBodyFont,
  },
});
