import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  CONVERSATION_TOPICS,
  CONVERSATION_TOPIC_META,
  CONVERSATION_HIGHLIGHT_WORDS,
  type ConversationTopicId,
} from '@/data/conversation-topics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 32, 400);
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

function useHighlightedQuestion(question: string) {
  return useMemo(() => {
    const regex = new RegExp(
      `\\b(${CONVERSATION_HIGHLIGHT_WORDS.join('|')})\\b`,
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
}: {
  currentQuestion: string;
  nextQuestion: string | null;
  onSwipe: () => void;
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
            { width: CARD_WIDTH, height: CARD_WIDTH, transform: [{ scale: 0.96 }] },
          ]}
        >
          <ScrollView
            style={styles.cardScroll}
            contentContainerStyle={styles.cardScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <QuestionText question={nextQuestion} />
          </ScrollView>
        </View>
      )}
      {/* Top card - swipeable */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.card,
            styles.cardTop,
            { width: CARD_WIDTH, height: CARD_WIDTH },
            topCardAnimatedStyle,
          ]}
        >
          <ScrollView
            style={styles.cardScroll}
            contentContainerStyle={styles.cardScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <QuestionText question={currentQuestion} />
          </ScrollView>
          <View style={styles.swipeHint}>
            <Ionicons name="swap-horizontal" size={28} color="#9ca3af" />
            <Text style={styles.swipeHintText}>Swipe any direction</Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export default function ConversationGameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTopics, setActiveTopics] = useState<ConversationTopicId[]>([
    'australia',
    'australianSlang',
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const shuffledPool = useMemo(() => {
    const all = activeTopics.flatMap((id) => CONVERSATION_TOPICS[id]);
    return shuffleArray(all);
  }, [activeTopics]);

  const currentQuestion = shuffledPool[currentIndex] ?? null;
  const usedCount = currentIndex;
  const remainingCount = shuffledPool.length - currentIndex - (currentQuestion ? 1 : 0);

  const toggleTopic = useCallback((topic: ConversationTopicId) => {
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

  const topicIds = Object.keys(CONVERSATION_TOPIC_META) as ConversationTopicId[];

  return (
    <View style={[styles.container, { backgroundColor: CONTENT_BG }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conversations</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Choose some topics, then swipe</Text>

        <View style={styles.topicWrap}>
          {topicIds.map((id) => {
            const meta = CONVERSATION_TOPIC_META[id];
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
              Select a topic, you drongo!
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
            />
          ) : null}
        </View>

        {shuffledPool.length > 0 && (
          <View style={styles.statsRow}>
            <Text style={styles.statsText}>
              cards used: <Text style={styles.statsUsed}>{usedCount}</Text>
              {' '}| remaining:{' '}
              <Text style={styles.statsLeft}>{remainingCount}</Text>
            </Text>
          </View>
        )}

        {currentQuestion && (
          <Pressable
            style={styles.nextBtn}
            onPress={goNext}
            android_ripple={undefined}
          >
            <Text style={styles.nextBtnText}>🎲 Next</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

function QuestionText({ question }: { question: string }) {
  const parts = useHighlightedQuestion(question);
  return (
    <Text style={styles.cardQuestion}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: ACCENT_BLUE,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerRight: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 15,
    color: '#687076',
    textAlign: 'center',
    marginBottom: 20,
  },
  topicWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 28,
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
    minHeight: CARD_WIDTH + 24,
    alignItems: 'center',
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_WIDTH,
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
  },
  cardScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  cardBehind: {
    top: CARD_STACK_OFFSET * 2,
  },
  cardTop: {
    top: 0,
  },
  swipeHint: {
    alignItems: 'center',
    paddingTop: 8,
    gap: 6,
  },
  swipeHintText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  cardQuestion: {
    fontSize: 18,
    fontWeight: '700',
    color: '#11181C',
    lineHeight: 26,
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
    marginTop: 16,
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
    marginTop: 24,
    backgroundColor: ACCENT_BLUE,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
