import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PROGRESS_LAYOUT_ANIM = {
  duration: 400,
  update: { type: LayoutAnimation.Types.easeInEaseOut },
};
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';

import { PremiumCrown } from '@/components/PremiumCrown';
import { useConfetti } from '@/context/ConfettiContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BodyFont, ButtonFont, Colors, HeadingFont } from '@/constants/theme';
import { getQuiz, QuizQuestion } from '@/data/quiz-data';
import {
  quizImageMap,
  quizAudioMap,
  resultSounds,
  resultCharacterImages,
  resultStampImages,
} from '@/data/quiz-assets';
import { saveQuizScore, getScoreColor } from '@/services/quiz-scores';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PROGRESS_BAR_WIDTH = 200;

const ANSWER_COLORS = [
  'rgba(0, 44, 128, 0.19)',
  'rgba(255, 0, 0, 0.19)',
  'rgba(0, 21, 255, 0.19)',
  'rgba(251, 255, 0, 0.19)',
];

// ---------- Results Screen ----------

function ResultsView({
  quiz,
  score,
  userAnswers,
  totalQuestions,
  onBack,
  colors,
}: {
  quiz: { id: number; name: string };
  score: number;
  userAnswers: string[];
  totalQuestions: number;
  onBack: () => void;
  colors: typeof Colors.light;
  questions: QuizQuestion[];
}) {
  const questions = getQuiz(quiz.id)?.questions ?? [];
  const bounceAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { triggerConfetti } = useConfetti();

  useEffect(() => {
    // Animate score reveal
    Animated.parallel([
      Animated.spring(bounceAnim, {
        toValue: 0,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
        delay: 200,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Play result sound
    let player: AudioPlayer | null = null;
    try {
      if (score < 5) {
        player = createAudioPlayer(resultSounds.fail);
      } else if (score < 10) {
        player = createAudioPlayer(resultSounds.decent);
      } else {
        player = createAudioPlayer(resultSounds.perfect);
      }
      player.play();
    } catch (e) {
      // Audio playback is optional
    }

    // Perfect score: confetti burst (slight delay so it lands after score reveal)
    if (score === totalQuestions) {
      const t = setTimeout(() => triggerConfetti(), 500);
      return () => {
        clearTimeout(t);
        if (player) {
          try { player.remove(); } catch {}
        }
      };
    }

    return () => {
      if (player) {
        try { player.remove(); } catch {}
      }
    };
  }, [score, totalQuestions, triggerConfetti]);

  const getRatingTier = (): 'sad' | 'meh' | 'good' | 'legend' => {
    if (score < 5) return 'sad';
    if (score < 8) return 'meh';
    if (score < 10) return 'good';
    return 'legend';
  };

  const getStampKey = (): keyof typeof resultStampImages => {
    if (score < 5) return 'DRONGO';
    if (score < 8) return 'NOTBAD';
    if (score < 10) return 'FAIR';
    return 'legend';
  };

  const tier = getRatingTier();
  const stampKey = getStampKey();

  return (
    <Animated.View style={[styles.resultsContainer, { opacity: fadeAnim }]}>
      {/* Score summary */}
      <View style={[styles.scoreSummary, { backgroundColor: colors.background }]}>
        <Animated.Text
          style={[
            styles.bigScore,
            { color: colors.text, transform: [{ translateY: bounceAnim }] },
          ]}
        >
          {score} / {totalQuestions}
        </Animated.Text>
        {tier === 'meh' ? (
          <Text style={styles.ratingEmoji}>😐</Text>
        ) : (
          <Image
            source={resultCharacterImages[tier]}
            style={styles.ratingCharacter}
            contentFit="contain"
          />
        )}
        <Image
          source={resultStampImages[stampKey]}
          style={styles.ratingStamp}
          contentFit="contain"
        />
      </View>

      {/* Review answers */}
      <View style={styles.reviewSection}>
        {questions.map((q, i) => {
          const userAnswer = userAnswers[i];
          const isCorrect = userAnswer === q.correctAnswer;

          return (
            <View
              key={i}
              style={[styles.reviewCard, { backgroundColor: colors.background }]}
            >
              <View style={styles.reviewHeader}>
                <Text style={[styles.reviewNumber, { color: colors.icon }]}>
                  {i + 1}.
                </Text>
                <Text
                  style={[styles.reviewQuestion, { color: colors.text }]}
                  numberOfLines={3}
                >
                  {q.text}
                </Text>
              </View>

              <View style={styles.reviewAnswers}>
                {/* User's answer */}
                <View
                  style={[
                    styles.answerPill,
                    isCorrect ? styles.correctPill : styles.incorrectPill,
                  ]}
                >
                  <Text
                    style={[
                      styles.answerPillText,
                      { color: isCorrect ? '#1a7a1a' : '#cf5050' },
                    ]}
                  >
                    {userAnswer}
                  </Text>
                  <Ionicons
                    name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                    size={18}
                    color={isCorrect ? '#1a7a1a' : '#cf5050'}
                  />
                </View>

                {/* Show correct answer if wrong */}
                {!isCorrect && (
                  <View style={[styles.answerPill, styles.correctPill]}>
                    <Text style={[styles.answerPillText, { color: '#1a7a1a' }]}>
                      {q.correctAnswer}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Back button */}
      <TouchableOpacity
        style={[styles.backToQuizzesBtn, { backgroundColor: colors.tint }]}
        onPress={onBack}
        activeOpacity={0.7}
      >
        <Text style={styles.backToQuizzesBtnText}>Back to Quizzes</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ---------- Main Quiz Gameplay ----------

export default function QuizGameplay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const quizId = Number(id);
  const quiz = getQuiz(quizId);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const audioPlayerRef = useRef<AudioPlayer | null>(null);

  if (!quiz) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text
          style={[
            styles.quizNotFound,
            { color: colors.text },
          ]}
        >
          Quiz not found
        </Text>
      </View>
    );
  }

  const totalQuestions = quiz.questions.length;
  const currentQuestion = quiz.questions[currentIndex];

  const playQuestionAudio = useCallback((audioFile: string) => {
    try {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.remove();
        audioPlayerRef.current = null;
      }
      const source = quizAudioMap[audioFile];
      if (!source) return;
      audioPlayerRef.current = createAudioPlayer(source);
      audioPlayerRef.current.play();
      setPlayingAudio(true);
      setTimeout(() => setPlayingAudio(false), 3000);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }, []);

  const stopQuestionAudio = useCallback(() => {
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.remove();
      } catch {}
      audioPlayerRef.current = null;
      setPlayingAudio(false);
    }
  }, []);

  const submitAnswer = useCallback(
    (answer: string) => {
      if (transitioning) return; // prevent double-taps during animation

      stopQuestionAudio();
      const newAnswers = [...userAnswers, answer];
      setUserAnswers(newAnswers);

      let newScore = score;
      if (answer === currentQuestion.correctAnswer) {
        newScore = score + 1;
        setScore(newScore);
      }

      if (currentIndex < totalQuestions - 1) {
        setTransitioning(true);

        // 1. Fade out the question content
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }).start(() => {
          // 2. Once faded out, animate progress then swap the question (LayoutAnimation animates the bar)
          LayoutAnimation.configureNext(PROGRESS_LAYOUT_ANIM);
          setCurrentIndex(currentIndex + 1);

          // 3. Fade the new question in
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 280,
            useNativeDriver: true,
          }).start(() => {
            setTransitioning(false);
          });
        });
      } else {
        LayoutAnimation.configureNext(PROGRESS_LAYOUT_ANIM);
        setShowResults(true);
        saveQuizScore(quizId, newScore);
      }
    },
    [currentIndex, currentQuestion, score, totalQuestions, userAnswers, quizId, fadeAnim, stopQuestionAudio, transitioning]
  );

  const handleBack = useCallback(() => {
    stopQuestionAudio();
    router.back();
  }, [router, stopQuestionAudio]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        try { audioPlayerRef.current.remove(); } catch {}
      }
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header bar */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {quiz.name}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {showResults ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
        >
          <ResultsView
            quiz={quiz}
            score={score}
            userAnswers={userAnswers}
            totalQuestions={totalQuestions}
            onBack={handleBack}
            colors={colors}
            questions={quiz.questions}
          />
        </ScrollView>
      ) : (
        <View style={styles.gameplayContainer}>
          {/* Progress bar - pinned to top, never moves */}
          <View style={styles.progressSection}>
            <View style={[styles.progressBarTrack, { backgroundColor: colors.icon + '20' }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: (showResults ? 1 : currentIndex / totalQuestions) * PROGRESS_BAR_WIDTH,
                    backgroundColor: 'rgb(106, 155, 115)',
                  },
                ]}
              />
            </View>
            <Text style={[styles.questionCounter, { color: colors.icon }]}>
              {currentIndex + 1} / {totalQuestions}
            </Text>
          </View>

          {/* Question content - fills remaining space, centered vertically */}
          <View style={styles.questionContentArea}>
            <Animated.View style={[styles.questionArea, { opacity: fadeAnim }]}>
              {/* Question text */}
              <Text style={[styles.questionText, { color: colors.text }]}>
                {currentQuestion.text}
              </Text>

              {/* Question image */}
              {currentQuestion.image && quizImageMap[currentQuestion.image] && (
                <Image
                  source={quizImageMap[currentQuestion.image]}
                  style={styles.questionImage}
                  contentFit="cover"
                />
              )}

              {/* Question audio */}
              {currentQuestion.audio && (
                <TouchableOpacity
                  style={[
                    styles.audioBtn,
                    playingAudio && styles.audioBtnActive,
                  ]}
                  onPress={() => playQuestionAudio(currentQuestion.audio!)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={playingAudio ? 'volume-high' : 'volume-medium'}
                    size={28}
                    color={playingAudio ? '#28a428' : colors.icon}
                  />
                </TouchableOpacity>
              )}

              {/* Answer buttons - 2x2 grid */}
              <View style={styles.answersGrid}>
                {currentQuestion.answers.map((answer, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.answerButton,
                      { backgroundColor: ANSWER_COLORS[i] },
                      currentQuestion.image && styles.answerButtonCompact,
                    ]}
                    onPress={() => submitAnswer(answer)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.answerText, { color: colors.text }]}>
                      {answer}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  quizNotFound: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    fontFamily: BodyFont,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backBtn: {
    padding: 4,
  },
  headerSpacer: {
    width: 32,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: HeadingFont,
    textAlign: 'center',
  },
  gameplayContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  progressSection: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  progressBarTrack: {
    width: PROGRESS_BAR_WIDTH,
    height: 10,
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  questionCounter: {
    fontSize: 13,
    fontFamily: BodyFont,
    textAlign: 'center',
  },
  questionContentArea: {
    flex: 1,
    justifyContent: 'center',
  },
  questionArea: {
    alignItems: 'center',
  },
  questionText: {
    fontSize: 20,
    fontFamily: HeadingFont,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 28,
    paddingHorizontal: 8,
  },
  questionImage: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.45,
    borderRadius: 12,
    marginBottom: 16,
  },
  audioBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(128,128,128,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  audioBtnActive: {
    backgroundColor: 'rgba(40,164,40,0.15)',
  },
  answersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    width: '100%',
    justifyContent: 'center',
  },
  answerButton: {
    width: (SCREEN_WIDTH - 52) / 2,
    height: 90,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(200,200,200,0.3)',
  },
  answerButtonCompact: {
    height: 60,
  },
  answerText: {
    fontSize: 16,
    fontFamily: ButtonFont,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Results
  resultsContainer: {
    padding: 16,
  },
  scoreSummary: {
    alignItems: 'center',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  bigScore: {
    fontSize: 48,
    fontFamily: HeadingFont,
    marginBottom: 4,
  },
  ratingEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  ratingCharacter: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  ratingStamp: {
    width: 160,
    height: 56,
  },
  reviewSection: {
    gap: 8,
  },
  reviewCard: {
    borderRadius: 14,
    padding: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },
  reviewHeader: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  reviewNumber: {
    fontSize: 14,
    fontFamily: ButtonFont,
    width: 22,
  },
  reviewQuestion: {
    flex: 1,
    fontSize: 16,
    fontFamily: BodyFont,
    lineHeight: 20,
  },
  reviewAnswers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingLeft: 22,
  },
  answerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 50,
    gap: 6,
  },
  correctPill: {
    backgroundColor: '#dcfadc',
  },
  incorrectPill: {
    backgroundColor: '#feeeee',
  },
  answerPillText: {
    fontSize: 16,
    fontFamily: ButtonFont,
  },
  backToQuizzesBtn: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  backToQuizzesBtnText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: ButtonFont,
  },
});
