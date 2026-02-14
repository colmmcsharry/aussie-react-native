import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const WORD_MAX_WIDTH = Math.round(SCREEN_WIDTH * 1.22);
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DeviceMotion } from 'expo-sensors';
import * as Haptics from 'expo-haptics';

import {
  HEADSUP_TOPIC_META,
  HEADSUP_EASY_WORDS,
  HEADSUP_HARD_WORDS,
  HEADSUP_XXX_WORDS,
  type HeadsUpTopicId,
} from '@/data/headsup-topics';

const ACCENT_BLUE = '#194F89';
const CONTENT_BG = '#F0F4F8';
const GAME_BG = '#c9e4c7';
// Reserve space where tab bar would be so layout doesn't jump when it hides on this screen
const TAB_BAR_HEIGHT = 84;

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Actual device readings (phone on forehead, portrait locked):
//   Neutral:         gamma ≈ -90°
//   Tilt UP (skip):  gamma goes from -90 toward -2  → detect in (-50, -10)
//   Tilt DOWN (point): gamma goes from -90 toward -180 → trigger a bit further (-135ish) to avoid accidental lean
const SKIP_GAMMA_MIN = -58;
const SKIP_GAMMA_MAX = -15;
const POINT_GAMMA_MIN = -165;
const POINT_GAMMA_MAX = -125;
const DEBOUNCE_MS = 800;

export default function HeadsUpGameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTopics, setActiveTopics] = useState<HeadsUpTopicId[]>(['easy', 'hard']);
  const [gameDuration, setGameDuration] = useState<60 | 90>(60);
  const [rulesVisible, setRulesVisible] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [correctWords, setCorrectWords] = useState<string[]>([]);
  const [skippedWords, setSkippedWords] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(60);

  const [showFeedback, setShowFeedback] = useState<'correct' | 'skip' | null>(null);
  const [motionPermissionGranted, setMotionPermissionGranted] = useState<boolean | null>(null);
  const [motionPermissionError, setMotionPermissionError] = useState<string | null>(null);

  const wordPool = useRef<string[]>([]);
  const hasTiltedDown = useRef(false);
  const hasTiltedUp = useRef(false);
  const lastScoreTime = useRef(0);
  const lastWordTime = useRef(0);
  const gameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pickNextWord = useCallback(() => {
    if (wordPool.current.length === 0) return null;
    const idx = Math.floor(Math.random() * wordPool.current.length);
    const word = wordPool.current[idx];
    wordPool.current = wordPool.current.filter((_, i) => i !== idx);
    return word;
  }, []);

  const nextWord = useCallback(() => {
    const next = pickNextWord();
    setCurrentWord(next ?? '— No more words! —');
    hasTiltedDown.current = false;
    hasTiltedUp.current = false;
  }, [pickNextWord]);

  const handleCorrect = useCallback(() => {
    if (!currentWord) return;
    setScore((s) => s + 1);
    setCorrectWords((prev) => [...prev, currentWord]);
    setShowFeedback('correct');
    setTimeout(() => setShowFeedback(null), 300);
    if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    nextWord();
  }, [currentWord, nextWord]);

  const handleSkip = useCallback(() => {
    if (!currentWord) return;
    setSkippedWords((prev) => [...prev, currentWord]);
    setShowFeedback('skip');
    setTimeout(() => setShowFeedback(null), 300);
    if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    nextWord();
  }, [currentWord, nextWord]);

  // Request motion permission then start game (matches old app: permission in user gesture)
  const startGame = useCallback(async () => {
    setMotionPermissionError(null);
    try {
      const available = await DeviceMotion.isAvailableAsync();
      if (!available) {
        setMotionPermissionError('Motion sensor not available on this device.');
        return;
      }
      const { granted } = await DeviceMotion.requestPermissionsAsync();
      if (!granted) {
        setMotionPermissionGranted(false);
        setMotionPermissionError('Motion permission is needed to detect tilts. Enable it in Settings.');
        return;
      }
      setMotionPermissionGranted(true);
    } catch (e) {
      setMotionPermissionError(e instanceof Error ? e.message : 'Could not access motion.');
      return;
    }

    let words: string[] = [];
    if (activeTopics.includes('easy')) words = [...words, ...HEADSUP_EASY_WORDS];
    if (activeTopics.includes('hard')) words = [...words, ...HEADSUP_HARD_WORDS];
    if (activeTopics.includes('xxx')) words = [...words, ...HEADSUP_XXX_WORDS];
    words = shuffleArray(words);
    wordPool.current = words;

    lastScoreTime.current = 0;
    lastWordTime.current = 0;
    setShowCountdown(true);
    setCountdown(5);
    setScore(0);
    setCorrectWords([]);
    setSkippedWords([]);
    setTimeRemaining(gameDuration);
    setGameOver(false);
  }, [activeTopics, gameDuration]);

  // Countdown
  useEffect(() => {
    if (!showCountdown) return;
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          setShowCountdown(false);
          setGameStarted(true);
          const first = pickNextWord();
          setCurrentWord(first);
          hasTiltedDown.current = false;
          hasTiltedUp.current = false;
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [showCountdown, pickNextWord]);

  // Game timer
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    gameTimerRef.current = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          if (gameTimerRef.current) clearInterval(gameTimerRef.current);
          setGameOver(true);
          setGameStarted(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, [gameStarted, gameOver]);

  // Tilt detection: neutral -90°, tilt up (skip) → -2°, tilt down (point) → -180° (trigger ~-120)
  useEffect(() => {
    if (!gameStarted || gameOver || !currentWord) return;

    const toDeg = (r: number) => (Math.abs(r) <= Math.PI + 0.5 ? (r * 180) / Math.PI : r);

    DeviceMotion.setUpdateInterval(50);
    const sub = DeviceMotion.addListener(({ rotation }) => {
      const gamma = toDeg(rotation?.gamma ?? 0);
      const now = Date.now();

      // Skip (tilt up toward ceiling): gamma from -90 toward -2, detect in (-50, -10)
      if (gamma > SKIP_GAMMA_MIN && gamma < SKIP_GAMMA_MAX) {
        if (!hasTiltedUp.current && now - lastWordTime.current > DEBOUNCE_MS) {
          lastWordTime.current = now;
          hasTiltedUp.current = true;
          hasTiltedDown.current = false;
          handleSkip();
        }
      } else {
        hasTiltedUp.current = false;
      }

      // Point (tilt down toward floor): gamma from -90 past ±180 toward +170, detect in (120, 180)
      if (gamma > POINT_GAMMA_MIN && gamma < POINT_GAMMA_MAX) {
        if (!hasTiltedDown.current && now - lastScoreTime.current > DEBOUNCE_MS) {
          lastScoreTime.current = now;
          hasTiltedDown.current = true;
          hasTiltedUp.current = false;
          handleCorrect();
        }
      } else {
        hasTiltedDown.current = false;
      }
    });

    return () => sub.remove();
  }, [gameStarted, gameOver, currentWord, handleCorrect, handleSkip]);

  const toggleTopic = useCallback((id: HeadsUpTopicId) => {
    setActiveTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }, []);

  const endAndReset = useCallback(() => {
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setGameStarted(false);
    setGameOver(false);
    setShowCountdown(false);
    setCountdown(5);
    setCurrentWord(null);
    router.replace('/games');
  }, [router]);

  const topicIds: HeadsUpTopicId[] = ['easy', 'hard', 'xxx'];

  const scorePhrase = useMemo(() => {
    if (score === 0) return 'RUBBISH! 💩';
    if (score < 5) return 'NOT BAD 🙂';
    if (score < 10) return 'GOOD ON YA! 🦘';
    return 'LEGEND! 🇦🇺';
  }, [score]);

  const showMenu = !gameStarted && !showCountdown && !gameOver;
  const showRotatedView = showCountdown || (gameStarted && !gameOver && currentWord);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: showMenu ? CONTENT_BG : GAME_BG },
      ]}
    >
      {showMenu && (
        <TouchableOpacity
          onPress={endAndReset}
          style={[styles.backBtnFloating, { top: insets.top + 40 }]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="#11181C" />
        </TouchableOpacity>
      )}

      {showMenu && (
        <View style={[styles.menuWrapper, { height: SCREEN_HEIGHT - TAB_BAR_HEIGHT }]}>
          <View style={[styles.menuContainer, { paddingTop: insets.top + 100, paddingBottom: TAB_BAR_HEIGHT + 24 }]}>
          <Pressable onPress={() => setRulesVisible(!rulesVisible)} style={styles.rulesHeader}>
            <Text style={styles.rulesTitle}>How to Play</Text>
            <Ionicons
              name={rulesVisible ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#687076"
            />
          </Pressable>
          {rulesVisible && (
            <View style={styles.rulesList}>
              <Text style={styles.ruleItem}>• Requires 2+ people</Text>
              <Text style={styles.ruleItem}>• Hold phone sideways on your forehead</Text>
              <Text style={styles.ruleItem}>• Friends describe the word (no spelling!)</Text>
              <Text style={styles.ruleItem}>• If you guess correctly, Tilt DOWN then back up</Text>
              <Text style={styles.ruleItem}>• Tilt UP = skip to next word</Text>
            </View>
          )}

          <View style={styles.timerRow}>
            <View style={styles.timerLabelWrap}>
              <Ionicons name="time-outline" size={24} color="#11181C" style={styles.timerIcon} />
            </View>
            <View style={styles.timerOptions}>
              <Pressable
                onPress={() => setGameDuration(60)}
                style={[styles.timerBtn, gameDuration === 60 && styles.timerBtnActive]}
              >
                <Text style={[styles.timerBtnText, gameDuration === 60 && styles.timerBtnTextActive]}>
                  60s
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setGameDuration(90)}
                style={[styles.timerBtn, gameDuration === 90 && styles.timerBtnActive]}
              >
                <Text style={[styles.timerBtnText, gameDuration === 90 && styles.timerBtnTextActive]}>
                  90s
                </Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.includeLabel}>Words to include</Text>
          <View style={styles.topicWrap}>
            {topicIds.map((id) => {
              const meta = HEADSUP_TOPIC_META[id];
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
                    {meta.emoji}  {meta.label}
                  </Text>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={26} color="#fff" style={styles.topicTick} />
                  )}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.menuSpacer} />

          <TouchableOpacity
            onPress={() => startGame()}
            style={styles.startBtn}
            disabled={activeTopics.length === 0}
          >
            <Text style={styles.startBtnText}>Start</Text>
          </TouchableOpacity>
          {motionPermissionError != null && (
            <Text style={styles.permissionError}>{motionPermissionError}</Text>
          )}
          </View>
        </View>
      )}

      {/* Rotated view: countdown and in-game word always in forehead orientation */}
      {showRotatedView && (
        <View style={styles.rotatedWrapper}>
          <View
            style={[
              styles.rotatedInner,
              {
                width: SCREEN_HEIGHT,
                height: SCREEN_WIDTH,
              },
            ]}
            >
            {!showCountdown && (
              <TouchableOpacity
                onPress={endAndReset}
                style={[styles.backBtnInRotated, { left: 16 + insets.top + 40, top: 12 }]}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="arrow-back" size={24} color="#11181C" />
              </TouchableOpacity>
            )}

            {showFeedback === 'correct' && (
              <View style={styles.feedbackOverlay}>
                <Ionicons name="checkmark-circle" size={120} color="#4CAF50" />
              </View>
            )}
            {showFeedback === 'skip' && (
              <View style={[styles.feedbackOverlay, styles.feedbackSkip]}>
                <Ionicons name="close-circle" size={120} color="#c64a4a" />
              </View>
            )}

            {showCountdown && (
              <View style={styles.countdownContainer}>
                <Text style={styles.countdownTitle}>PLACE ON FOREHEAD</Text>
                <Text style={styles.countdownNumber}>{countdown}</Text>
              </View>
            )}

            {gameStarted && !gameOver && currentWord && (
              <View style={styles.gameContainer}>
                <Text style={styles.gameTimer}>{timeRemaining}</Text>
                <Text style={styles.wordDisplay}>{currentWord}</Text>
                <Text style={styles.scoreDisplay}>{score}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {gameOver && (
        <View style={styles.gameOverContainer}>
          <Text style={styles.scorePhrase}>{scorePhrase}</Text>
          <Text style={styles.finalScore}>{score}</Text>
          <View style={styles.resultsRow}>
            <View style={styles.resultColumn}>
              <Text style={styles.resultTitle}>Correct ✓</Text>
              {correctWords.slice(0, 8).map((w, i) => (
                <Text key={i} style={styles.resultItem}>{i + 1}. {w}</Text>
              ))}
              {correctWords.length > 8 && (
                <Text style={styles.resultMore}>+{correctWords.length - 8} more</Text>
              )}
            </View>
            <View style={styles.resultColumn}>
              <Text style={[styles.resultTitle, styles.resultTitleSkipped]}>Skipped ✗</Text>
              {skippedWords.slice(0, 8).map((w, i) => (
                <Text key={i} style={styles.resultItem}>{i + 1}. {w}</Text>
              ))}
              {skippedWords.length > 8 && (
                <Text style={styles.resultMore}>+{skippedWords.length - 8} more</Text>
              )}
            </View>
          </View>
          <TouchableOpacity onPress={endAndReset} style={styles.backToGamesBtn}>
            <Text style={styles.backToGamesText}>Back to Games</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
  rotatedWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  rotatedInner: {
    transform: [{ rotate: '90deg' }],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GAME_BG,
  },
  backBtnInRotated: {
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
  feedbackOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(76, 175, 80, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  feedbackSkip: {
    backgroundColor: 'rgba(198, 74, 74, 0.4)',
  },
  menuWrapper: {
    width: '100%',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  rulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dce0e5',
    marginBottom: 24,
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#687076',
  },
  rulesList: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  ruleItem: {
    fontSize: 15,
    color: '#687076',
    marginBottom: 8,
    lineHeight: 22,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  timerLabelWrap: {
    justifyContent: 'center',
  },
  timerIcon: {
    marginRight: 4,
  },
  timerOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  timerBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dce0e5',
  },
  timerBtnActive: {
    backgroundColor: ACCENT_BLUE,
    borderColor: ACCENT_BLUE,
  },
  timerBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCENT_BLUE,
  },
  timerBtnTextActive: {
    color: '#fff',
  },
  includeLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 14,
  },
  topicWrap: {
    flexDirection: 'column',
    gap: 14,
    marginBottom: 32,
  },
  topicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
    minHeight: 72,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dce0e5',
  },
  topicBtnActive: {
    backgroundColor: ACCENT_BLUE,
    borderColor: ACCENT_BLUE,
  },
  topicBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: ACCENT_BLUE,
  },
  topicBtnTextActive: {
    color: '#fff',
  },
  topicTick: {
    marginLeft: 8,
  },
  menuSpacer: {
    flex: 1,
    minHeight: 24,
  },
  startBtn: {
    backgroundColor: ACCENT_BLUE,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
  },
  startBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  permissionError: {
    marginTop: 12,
    fontSize: 14,
    color: '#c64a4a',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  countdownContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  countdownTitle: {
    fontSize: 44,
    fontWeight: '800',
    color: '#11181C',
    textAlign: 'center',
  },
  countdownNumber: {
    fontSize: 108,
    fontWeight: '800',
    color: '#c64a4a',
  },
  gameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  gameTimer: {
    fontSize: 48,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 16,
  },
  wordDisplay: {
    fontSize: 64,
    fontWeight: '800',
    color: '#11181C',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
    alignSelf: 'center',
    maxWidth: WORD_MAX_WIDTH,
  },
  scoreDisplay: {
    fontSize: 48,
    fontWeight: '700',
    color: 'rgb(28, 149, 83)',
  },
  gameOverContainer: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  scorePhrase: {
    fontSize: 20,
    fontWeight: '700',
    color: '#11181C',
    textAlign: 'center',
    marginBottom: 8,
  },
  finalScore: {
    fontSize: 56,
    fontWeight: '800',
    color: '#11181C',
    textAlign: 'center',
    marginBottom: 24,
  },
  resultsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
    flex: 1,
  },
  resultColumn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    maxHeight: 200,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgb(28, 149, 83)',
    marginBottom: 8,
  },
  resultTitleSkipped: {
    color: '#c64a4a',
  },
  resultItem: {
    fontSize: 13,
    color: '#11181C',
    marginBottom: 4,
  },
  resultMore: {
    fontSize: 12,
    color: '#687076',
    fontStyle: 'italic',
  },
  backToGamesBtn: {
    backgroundColor: ACCENT_BLUE,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  backToGamesText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
