import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { TabHeader } from '@/components/tab-header';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BodyFont, CardPalette, HeadingFont } from '@/constants/theme';
import { quizzes } from '@/data/quiz-data';
import { getAllScores, getScoreColor } from '@/services/quiz-scores';

/** Quiz IDs that are free; all others are premium and shown as locked */
const FREE_QUIZ_IDS = new Set([1, 5]); // Quiz 1, Alcohol

/** Card background colors for free quiz cards (first two: green, orange) */
const FREE_QUIZ_COLORS = [CardPalette.slang, CardPalette.quiz];

/** Faded background colors for locked premium quiz cards */
const LOCKED_QUIZ_COLORS = [
  '#E9F5DF', // very light green
  '#FDF2DE', // very light orange
  '#E5EDF8', // very light blue
  '#F0E9F5', // very light purple
];

export default function QuizMenuScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [scores, setScores] = useState<Record<number, number>>({});
  const scrollRef = useRef<ScrollView>(null);

  // When tab is focused: refresh scores and scroll to top
  useFocusEffect(
    useCallback(() => {
      getAllScores().then(setScores);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const completedCount = Object.keys(scores).length;
  const progressPct = (completedCount / 20) * 100;

  const freeQuizzes = quizzes.filter((q) => FREE_QUIZ_IDS.has(q.id));
  const premiumQuizzes = quizzes.filter((q) => !FREE_QUIZ_IDS.has(q.id));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TabHeader title="Quiz" />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 28, paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={[styles.progressBar, { backgroundColor: colors.icon + '20' }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPct}%`, backgroundColor: 'rgb(106, 155, 115)' },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.icon }]}>
            Quizzes taken: {completedCount}/20
          </Text>
        </View>

        {/* Free quizzes: Quiz 1, Alcohol */}
        <View style={styles.quizGrid}>
          {freeQuizzes.map((quiz, index) => {
            const score = scores[quiz.id];
            const hasScore = score !== undefined;
            const bgColor = FREE_QUIZ_COLORS[index % FREE_QUIZ_COLORS.length];

            return (
              <TouchableOpacity
                key={quiz.id}
                style={[styles.quizButton, { backgroundColor: bgColor }]}
                onPress={() => router.push(`/quiz/${quiz.id}` as any)}
                activeOpacity={0.7}
              >
                <Text style={[styles.quizName, { color: colors.text }]}>
                  {quiz.name}
                </Text>

                {hasScore ? (
                  <View
                    style={[
                      styles.scoreBadge,
                      { backgroundColor: getScoreColor(score) },
                    ]}
                  >
                    <Text style={styles.scoreText}>
                      {score}/{quiz.questions.length}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.scoreBadgePlaceholder} />
                )}

                <Text style={[styles.quizCount, { color: colors.icon }]}>
                  {quiz.questions.length} questions
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.icon}
                  style={styles.chevron}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Premium Only section */}
        <View style={styles.premiumSection}>
          <MaterialCommunityIcons name="crown" size={36} color="#F4B744" />
          <Text style={[styles.premiumLabel, { color: colors.text }]}>
            Premium Only
          </Text>
        </View>

        {/* Locked premium quizzes */}
        <View style={styles.quizGrid}>
          {premiumQuizzes.map((quiz, index) => {
            const score = scores[quiz.id];
            const hasScore = score !== undefined;
            const bgColor = LOCKED_QUIZ_COLORS[index % LOCKED_QUIZ_COLORS.length];

            return (
              <View
                key={quiz.id}
                style={[styles.quizButton, styles.quizButtonLocked, { backgroundColor: bgColor }]}
              >
                <Text style={[styles.quizName, styles.quizNameLocked, { color: colors.icon }]}>
                  {quiz.name}
                </Text>

                {hasScore ? (
                  <View
                    style={[
                      styles.scoreBadge,
                      { backgroundColor: getScoreColor(score) },
                    ]}
                  >
                    <Text style={styles.scoreText}>
                      {score}/{quiz.questions.length}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.scoreBadgePlaceholder} />
                )}

                <Text style={[styles.quizCount, styles.quizCountLocked, { color: colors.icon }]}>
                  {quiz.questions.length} questions
                </Text>

                <Ionicons name="lock-closed" size={20} color={colors.icon} style={styles.lockIcon} />
              </View>
            );
          })}
        </View>
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
  progressSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 28,
  },
  progressBar: {
    width: 200,
    height: 12,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
  progressText: {
    fontSize: 14,
    fontFamily: BodyFont,
  },
  quizGrid: {
    gap: 20,
  },
  premiumSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    gap: 8,
  },
  premiumLabel: {
    fontSize: 17,
    fontFamily: HeadingFont,
    fontWeight: '700',
  },
  quizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    minHeight: 86,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: {
        elevation: 0,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
      },
    }),
  },
  quizButtonLocked: {
    opacity: 0.95,
  },
  quizName: {
    flex: 1,
    fontSize: 17,
    fontFamily: HeadingFont,
  },
  quizNameLocked: {
    fontWeight: '500',
  },
  quizCount: {
    fontSize: 12,
    fontFamily: BodyFont,
    marginRight: 18,
  },
  quizCountLocked: {
    opacity: 0.9,
  },
  lockIcon: {
    marginLeft: 10,
  },
  scoreBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  scoreBadgePlaceholder: {
    width: 50,
    height: 50,
    marginRight: 14,
  },
  scoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  chevron: {
    marginLeft: 10,
  },
});
