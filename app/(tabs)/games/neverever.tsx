import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  NEVEREVER_HIGHLIGHT_WORDS,
  NEVEREVER_TOPICS,
  NEVEREVER_TOPIC_META,
  type NeverEverTopicId,
} from "@/data/neverever-topics";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 32, 400);
const CARD_EXTRA_HEIGHT = 110;
const CARD_HEIGHT = CARD_WIDTH + CARD_EXTRA_HEIGHT;
const CARD_STACK_OFFSET = 10;
const SWIPE_THRESHOLD = 80;
const ROTATION_FACTOR = 0.12;

const ACCENT_BLUE = '#194F89';
const CONTENT_BG = '#F0F4F8';

function shuffleArray<T>(array: T[]): T[] {
  const out = [...array];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Splits "Question text (word = definition)" into main text and explanation for bottom of card */
function parseQuestion(question: string): { mainText: string; explanation: string | null } {
  const m = question.match(/\s*\(([^)]+)\)\s*$/);
  if (m) {
    return {
      mainText: question.slice(0, question.length - m[0].length).trim(),
      explanation: '(' + m[1] + ')',
    };
  }
  return { mainText: question, explanation: null };
}

function useHighlightedQuestion(question: string) {
  return useMemo(() => {
    const regex = new RegExp(
      `\\b(${NEVEREVER_HIGHLIGHT_WORDS.join('|')})\\b`,
      'gi'
    );
    const parts: { text: string; highlight: boolean }[] = [];
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    const re = new RegExp(regex.source, 'gi');
    while ((m = re.exec(question)) !== null) {
      if (m.index > lastIndex) {
        parts.push({ text: question.slice(lastIndex, m.index), highlight: false });
      }
      parts.push({ text: m[0], highlight: true });
      lastIndex = m.index + m[0].length;
    }
    if (lastIndex < question.length) {
      parts.push({ text: question.slice(lastIndex), highlight: false });
    }
    if (parts.length === 0) parts.push({ text: question, highlight: false });
    return parts;
  }, [question]);
}

const springConfig = { damping: 20, stiffness: 300 };
const THROW_DURATION_MS = 220;

function SwipeableCardStack({
  currentQuestion,
  nextQuestion,
  onSwipe,
  usedCount,
  remainingCount,
}: {
  currentQuestion: string;
  nextQuestion: string | null;
  onSwipe: () => void;
  usedCount: number;
  remainingCount: number;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((e) => {
          translateX.value = e.translationX;
          translateY.value = e.translationY;
        })
        .onEnd((e) => {
          const dist = Math.sqrt(
            translateX.value * translateX.value + translateY.value * translateY.value
          );
          const velocity = Math.sqrt(
            e.velocityX * e.velocityX + e.velocityY * e.velocityY
          );
          const shouldSwipe =
            dist > SWIPE_THRESHOLD || velocity > 400;
          if (shouldSwipe) {
            const dirX = translateX.value >= 0 ? 1 : -1;
            const dirY = translateY.value >= 0 ? 1 : -1;
            translateX.value = withTiming(
              dirX * (SCREEN_WIDTH + 100),
              { duration: THROW_DURATION_MS, easing: Easing.out(Easing.cubic) }
            );
            translateY.value = withTiming(
              dirY * 200,
              { duration: THROW_DURATION_MS, easing: Easing.out(Easing.cubic) },
              (finished) => {
                if (finished) {
                  translateX.value = 0;
                  translateY.value = 0;
                  runOnJS(onSwipe)();
                }
              }
            );
          } else {
            translateX.value = withSpring(0, springConfig);
            translateY.value = withSpring(0, springConfig);
          }
        }),
    [onSwipe, translateX, translateY]
  );

  const topCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        rotate: `${translateX.value * ROTATION_FACTOR}deg`,
      },
    ],
  }));

  return (
    <View style={[styles.cardStackContainer, { width: CARD_WIDTH }]}>
      {/* Back card(s) - next question visible behind */}
      {nextQuestion && (
        <View
          style={[
            styles.card,
            styles.cardBehind,
            { width: CARD_WIDTH, height: CARD_HEIGHT, transform: [{ scale: 0.96 }] },
          ]}
        >
          <View style={styles.cardScroll} pointerEvents="none">
            <NeverEverCardContent question={nextQuestion} />
          </View>
        </View>
      )}
      {/* Top card - swipeable */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.card,
            styles.cardTop,
            { width: CARD_WIDTH, height: CARD_HEIGHT },
            topCardAnimatedStyle,
          ]}
        >
          <View style={styles.cardScroll} pointerEvents="none">
            <NeverEverCardContent question={currentQuestion} />
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.statsRow}>
              <Text style={styles.statsText}>
                cards used: <Text style={styles.statsUsed}>{usedCount}</Text>
                {' '}| remaining:{' '}
                <Text style={styles.statsLeft}>{remainingCount}</Text>
              </Text>
            </View>
            <Pressable
              style={styles.nextBtn}
              onPress={onSwipe}
              android_ripple={undefined}
            >
              <Text style={styles.nextBtnText}>🎲 Next</Text>
            </Pressable>
          </View>
          <View style={styles.swipeHint}>
            <Image
              source={require('@/assets/swipe.png')}
              style={styles.swipeImage}
              contentFit="contain"
            />
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export default function NeverEverGameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTopics, setActiveTopics] = useState<NeverEverTopicId[]>([
    'australia',
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const shuffledPool = useMemo(() => {
    const all = activeTopics.flatMap((id) => NEVEREVER_TOPICS[id]);
    return shuffleArray(all);
  }, [activeTopics]);

  const currentQuestion = shuffledPool[currentIndex] ?? null;
  const usedCount = currentIndex;
  const remainingCount = shuffledPool.length - currentIndex - (currentQuestion ? 1 : 0);

  const toggleTopic = useCallback((topic: NeverEverTopicId) => {
    setActiveTopics((prev) => {
      if (prev.includes(topic)) return prev.filter((t) => t !== topic);
      return [...prev, topic];
    });
    setCurrentIndex(0);
  }, []);

  const goNext = useCallback(() => {
    if (currentQuestion && currentIndex < shuffledPool.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else if (currentQuestion && shuffledPool.length > 1) {
      setCurrentIndex(0);
    }
  }, [currentQuestion, currentIndex, shuffledPool.length]);

  const topicIds = Object.keys(NEVEREVER_TOPIC_META) as NeverEverTopicId[];

  return (
    <View style={[styles.container, { backgroundColor: CONTENT_BG }]}>
      <TouchableOpacity
        onPress={() => router.replace('/games')}
        style={[styles.backBtnFloating, { top: insets.top + 12 }]}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="arrow-back" size={24} color="#11181C" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Read aloud what is on the card. Whoever has done the thing, drinks!</Text>

        <View style={styles.topicWrap}>
          {topicIds.map((id) => {
            const meta = NEVEREVER_TOPIC_META[id];
            const isActive = activeTopics.includes(id);
            return (
              <Pressable
                key={id}
                onPress={() => toggleTopic(id)}
                style={[styles.topicBtn, isActive && styles.topicBtnActive]}
              >
                <Text
                  style={[
                    styles.topicBtnText,
                    isActive && styles.topicBtnTextActive,
                  ]}
                >
                  {meta.emoji} {meta.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.cardArea}>
          {activeTopics.length === 0 ? (
            <Text style={styles.emptyMessage}>
              Select a topic, you eejit!
            </Text>
          ) : shuffledPool.length === 0 ? (
            <Text style={styles.emptyMessage}>
              All questions have been used. Please select more topics.
            </Text>
          ) : shuffledPool.length > 0 ? (
            <SwipeableCardStack
              currentQuestion={currentQuestion!}
              nextQuestion={shuffledPool[currentIndex + 1] ?? null}
              onSwipe={goNext}
              usedCount={usedCount}
              remainingCount={remainingCount}
            />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function QuestionText({
  question,
  numberOfLines,
}: {
  question: string;
  numberOfLines?: number;
}) {
  const parts = useHighlightedQuestion(question);
  return (
    <Text
      style={styles.cardQuestion}
      numberOfLines={numberOfLines}
      ellipsizeMode="tail"
    >
      {parts.map((p, i) =>
        p.highlight ? (
          <Text key={i} style={styles.cardQuestionHighlight}>
            {p.text}
          </Text>
        ) : (
          p.text
        )
      )}
    </Text>
  );
}

function NeverEverCardContent({ question }: { question: string }) {
  const { mainText, explanation } = parseQuestion(question);
  return (
    <>
      <View style={styles.cardMainTextWrap}>
        <Text style={styles.neverPrefix}>Never have I ever...</Text>
        <QuestionText question={mainText} numberOfLines={6} />
      </View>
      {explanation != null && (
        <Text style={styles.cardExplanation} numberOfLines={1} ellipsizeMode="tail">
          {explanation}
        </Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backBtnFloating: {
    position: 'absolute',
    left: 16,
    zIndex: 20,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 22,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  subtitle: {
    marginTop: 40,
    fontSize: 15,
    color: '#687076',
    textAlign: 'center',
    marginBottom: 24,
  },
  topicWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 18,
  },
  topicBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#e8ecf0',
  },
  topicBtnActive: {
    backgroundColor: ACCENT_BLUE,
  },
  topicBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#11181C',
  },
  topicBtnTextActive: {
    color: '#fff',
  },
  cardArea: {
    minHeight: 380,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardStackContainer: {
    position: 'relative',
    minHeight: CARD_HEIGHT + 24,
    alignItems: 'center',
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  cardScroll: {
    flex: 1,
    overflow: 'hidden',
    marginTop: 16,
  },
  cardMainTextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  neverPrefix: {
    fontSize: 18,
    fontWeight: '700',
    color: '#11181C',
    textAlign: 'center',
    marginBottom: 40,
  },
  cardExplanation: {
    fontSize: 14,
    color: '#6b8fd4',
    textAlign: 'center',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  cardBehind: {
    top: CARD_STACK_OFFSET * 2,
  },
  cardTop: {
    top: 0,
  },
  cardFooter: {
    paddingTop: 24,
    gap: 18,
  },
  swipeHint: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
    paddingBottom: 12,
  },
  swipeImage: {
    width: 80,
    height: 40,
  },
  cardQuestion: {
    fontSize: 21,
    fontWeight: '700',
    color: '#11181C',
    lineHeight: 30,
    textAlign: 'center',
  },
  cardQuestionHighlight: {
    color: '#305aa0',
  },
  emptyMessage: {
    fontSize: 17,
    fontWeight: '700',
    color: '#c64a4a',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  statsText: {
    fontSize: 14,
    color: '#687076',
  },
  statsUsed: {
    fontWeight: '700',
    color: 'rgb(208, 54, 54)',
  },
  statsLeft: {
    fontWeight: '700',
    color: 'rgb(19, 122, 19)',
  },
  nextBtn: {
    alignSelf: 'center',
    backgroundColor: ACCENT_BLUE,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
