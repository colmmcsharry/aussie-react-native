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
import { Ionicons } from '@expo/vector-icons';

import { TabHeader } from '@/components/tab-header';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { quizzes } from '@/data/quiz-data';
import { getAllScores, getScoreColor } from '@/services/quiz-scores';

const ANSWER_COLORS = [
  'rgba(0, 44, 128, 0.19)',
  'rgba(255, 0, 0, 0.27)',
  'rgba(111, 223, 141, 0.19)',
  'rgba(255, 128, 0, 0.23)',
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
            {completedCount}/20 completed
          </Text>
        </View>

        {/* Quiz buttons */}
        <View style={styles.quizGrid}>
          {quizzes.map((quiz, index) => {
            const score = scores[quiz.id];
            const hasScore = score !== undefined;
            const bgColor = ANSWER_COLORS[index % 4];

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

                {/* Score badge or spacer (left of "X questions" so that text stays in same spot) */}
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
  },
  quizGrid: {
    gap: 20,
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
  quizName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
  },
  quizCount: {
    fontSize: 12,
    marginRight: 18,
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
