import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { setHasSeenOnboarding, setUserLevel, type UserLevel } from '@/services/onboarding';
import { BodyFont, ButtonFont, Colors, FontSizes, HeadingFont, SlangDisplayFont } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Lottie assets (copied from slang-src/assets)
const LottieGroupHello = require('../assets/lottie/grouphello.json');
const FloralWreath = require('../assets/floral-wreath.png');
const LottieConfused = require('../assets/lottie/confused.json');
const LottieBrain = require('../assets/lottie/brain.json');

const STEP_DURATIONS: Record<string, number> = {
  grouphello: 5150, // end Lottie 300ms earlier
  confused: 2600,
  understanding: 4300,
  level: 999999,
  processing: 3560,
  final: 999999,
  reviews: 999999,
};

const TESTIMONIALS = [
  {
    id: 1,
    heading: 'Really fun app!',
    testi: 'This is a really fun app, and educational too! I learned lots of new slang words. Had some craic with the games and quizzes too.',
    author: 'Jen C, Beta Tester',
  },
  {
    id: 2,
    heading: 'Great, excellent value!',
    testi: "Excellent value! I speak just a little natively, and watch a lot of Aussie TV yet the slang always gets me when I visit. This is great! 👍🏼",
    author: 'Jack Malone, Beta Tester',
  },
  {
    id: 3,
    heading: "Really cool app!",
    testi: "I've lived in Perth for 5 years and was so confused by the way the locals spoke. I wish this app had been released years ago!",
    author: 'Carolina A, Beta Tester',
  },
];

// Vue slide1 colours for the three phrases
const SLANG_LEFT_COLOR = 'rgb(40, 40, 199)';   // blue
const SLANG_MIDDLE_COLOR = 'rgb(38, 114, 68)'; // green
const SLANG_RIGHT_COLOR = 'rgb(149, 63, 63)'; // red

// Vue level button backgrounds (soft yellow -> green)
const LEVEL_COLORS: Record<string, string> = {
  elementary: '#fdf1b4',
  intermediate: '#e4f5b5',
  advanced: '#d4f8b0',
  fluent: '#b0f0a8',
};

const ONBOARDING_BUTTON_BLUE = '#194F89'; // Match app tint
const TESTIMONIAL_SLIDE_WIDTH = 276; // card 260 + margin 8*2

type Step =
  | 'grouphello'
  | 'confused'
  | 'understanding'
  | 'level'
  | 'processing'
  | 'final'
  | 'reviews';

const STEPS: Step[] = [
  'grouphello',
  'confused',
  'understanding',
  'level',
  'processing',
  'final',
  'reviews',
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [step, setStep] = useState<Step>('grouphello');
  const [grouphelloPhrase, setGrouphelloPhrase] = useState(0); // 0 | 1 | 2 – one at a time
  const [levelPhase, setLevelPhase] = useState<'text' | 'buttons'>('text');
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // Opacity only – no entering/exiting so rotation never gets touched
  const groupOpacity0 = useSharedValue(1);
  const groupOpacity1 = useSharedValue(0);
  const groupOpacity2 = useSharedValue(0);

  const grouphelloAnimatedStyle0 = useAnimatedStyle(() => ({ opacity: groupOpacity0.value }));
  const grouphelloAnimatedStyle1 = useAnimatedStyle(() => ({ opacity: groupOpacity1.value }));
  const grouphelloAnimatedStyle2 = useAnimatedStyle(() => ({ opacity: groupOpacity2.value }));

  const [userLevel, setUserLevelState] = useState<UserLevel | null>(null);
  const stepIndexRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lottieGroupRef = useRef<LottieView>(null);
  const lottieConfusedRef = useRef<LottieView>(null);
  const lottieBrainRef = useRef<LottieView>(null);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    setHasSeenOnboarding();
  }, []);

  // Grouphello: Lottie first, then phrases – each phrase fades out fully before the next fades in (no overlap)
  const FADE_DURATION = 400;
  useEffect(() => {
    if (step !== 'grouphello') return;
    setGrouphelloPhrase(0);
    groupOpacity0.value = 0;
    groupOpacity1.value = 0;
    groupOpacity2.value = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const push = (t: ReturnType<typeof setTimeout>) => {
      timers.push(t);
      return t;
    };
    // 500ms: phrase 0 fades in
    push(setTimeout(() => {
      groupOpacity0.value = withTiming(1, { duration: FADE_DURATION });
    }, 500));
    // 1700ms: phrase 0 fades out
    push(setTimeout(() => {
      groupOpacity0.value = withTiming(0, { duration: FADE_DURATION });
    }, 1700));
    // 2100ms: phrase 0 done; phrase 1 fades in (1700 + 400)
    push(setTimeout(() => {
      setGrouphelloPhrase(1);
      groupOpacity1.value = withTiming(1, { duration: FADE_DURATION });
    }, 1700 + FADE_DURATION));
    // 2700ms: phrase 1 fades out
    push(setTimeout(() => {
      groupOpacity1.value = withTiming(0, { duration: FADE_DURATION });
    }, 2700));
    // 3100ms: phrase 1 done; phrase 2 fades in (2700 + 400)
    push(setTimeout(() => {
      setGrouphelloPhrase(2);
      groupOpacity2.value = withTiming(1, { duration: FADE_DURATION });
    }, 2700 + FADE_DURATION));
    // Last phrase fades out 600ms before step ends
    push(setTimeout(() => {
      groupOpacity2.value = withTiming(0, { duration: FADE_DURATION });
    }, 4150)); // 5150 - 600 - 400
    timersRef.current = timers;
    return () => timers.forEach((t) => clearTimeout(t));
  }, [step]);

  // Play Lottie when step mounts
  useEffect(() => {
    if (step === 'grouphello') {
      lottieGroupRef.current?.play();
    } else if (step === 'confused') {
      lottieConfusedRef.current?.play();
    } else if (step === 'processing') {
      lottieBrainRef.current?.play();
    }
  }, [step]);

  useEffect(() => {
    if (step === 'level' || step === 'final' || step === 'reviews') return;
    const duration = STEP_DURATIONS[step] ?? 3000;
    const t = setTimeout(() => {
      const next = STEPS[stepIndexRef.current + 1];
      if (next) {
        stepIndexRef.current += 1;
        setStep(next);
        if (next === 'level') setLevelPhase('text');
      }
    }, duration);
    timersRef.current.push(t);
    return clearTimers;
  }, [step, clearTimers]);

  useEffect(() => {
    if (step !== 'level') return;
    const t = setTimeout(() => setLevelPhase('buttons'), 3000);
    timersRef.current.push(t);
    return () => clearTimeout(t);
  }, [step]);

  const goToLevel = useCallback(
    (level: UserLevel) => {
      setUserLevelState(level);
      setUserLevel(level);
      setStep('processing');
      stepIndexRef.current = STEPS.indexOf('processing');
      const t = setTimeout(() => {
        stepIndexRef.current = STEPS.indexOf('final');
        setStep(level === 'fluent' ? 'reviews' : 'final');
      }, 2900);
      timersRef.current.push(t);
    },
    [],
  );

  const goToReviews = useCallback(() => {
    stepIndexRef.current = STEPS.indexOf('reviews');
    setStep('reviews');
  }, []);

  const handleBegin = useCallback(() => {
    clearTimers();
    onComplete();
  }, [onComplete, clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const isFluent = userLevel === 'fluent';

  return (
    <View style={[styles.outerWrapper, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, step === 'reviews' && styles.scrollContentReviews]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step: grouphello – all three mounted, only opacity animated so angle never changes */}
        {step === 'grouphello' && (
          <View style={styles.slide1} key="grouphello">
            <Animated.View style={[styles.slangLeft, grouphelloAnimatedStyle0]}>
              <Text style={[styles.slangText, { color: SLANG_LEFT_COLOR }]}>G'day mate!</Text>
            </Animated.View>
            <Animated.View style={[styles.slangMiddle, grouphelloAnimatedStyle1]}>
              <Text style={[styles.slangText, { color: SLANG_MIDDLE_COLOR }]}>How ya goin?</Text>
            </Animated.View>
            <Animated.View style={[styles.slangRight, grouphelloAnimatedStyle2]}>
              <Text style={[styles.slangText, { color: SLANG_RIGHT_COLOR }]}>I'll flamin' belt ya!</Text>
            </Animated.View>
            <View style={styles.lottieWrap}>
              <LottieView
                ref={lottieGroupRef}
                source={LottieGroupHello}
                style={styles.lottieGroupHello}
                loop
                autoPlay
              />
            </View>
          </View>
        )}

        {/* Step: confused – Vue slide2: just Lottie */}
        {step === 'confused' && (
          <View style={styles.slide2} key="confused">
            <LottieView
              ref={lottieConfusedRef}
              source={LottieConfused}
              style={styles.lottieConfused}
              loop
              autoPlay
            />
          </View>
        )}

        {/* Step: understanding – Vue slide3: paragraph-fade-in */}
        {step === 'understanding' && (
          <View style={styles.slide3} key="understanding">
            <Animated.Text entering={FadeIn.duration(600)} style={[styles.paragraphFadeIn, { color: colors.text }]}>
              Understanding Australian people is hard.
            </Animated.Text>
            <Animated.Text entering={FadeIn.delay(950).duration(600)} style={[styles.paragraphFadeIn, styles.paragraphSecond, { color: colors.text }]}>
              This app will help.
            </Animated.Text>
            <Animated.Text entering={FadeIn.delay(2100).duration(600)} style={[styles.paragraphFadeIn, styles.paragraphSecond, { color: colors.text }]}>
              (and it's good fun for locals too!)
            </Animated.Text>
          </View>
        )}

        {/* Step: level – Vue slide6: question then level buttons with colours */}
        {step === 'level' && (
          <View style={styles.slideLevel} key="level">
            {levelPhase === 'text' && (
              <>
                <Animated.Text entering={FadeIn.duration(600)} style={[styles.paragraphFadeIn, { color: colors.text }]}>
                  Before we start...
                </Animated.Text>
                <Animated.Text entering={FadeIn.delay(400).duration(600)} style={[styles.paragraphFadeIn, styles.paragraphSecond, { color: colors.text }]}>
                  What is your level of English?
                </Animated.Text>
              </>
            )}
            {levelPhase === 'buttons' && (
              <Animated.View entering={FadeIn.duration(600)} style={styles.levelContainer}>
                {(['elementary', 'intermediate', 'advanced', 'fluent'] as const).map((level) => (
                  <Pressable
                    key={level}
                    onPress={() => goToLevel(level)}
                    style={({ pressed }) => [
                      styles.levelButton,
                      { backgroundColor: LEVEL_COLORS[level], opacity: pressed ? 0.85 : 1 },
                    ]}
                  >
                    <Text style={styles.levelButtonText}>{level.charAt(0).toUpperCase() + level.slice(1)}</Text>
                  </Pressable>
                ))}
              </Animated.View>
            )}
          </View>
        )}

        {/* Step: processing – Vue slide7 braindiv: Optimising + brain Lottie */}
        {step === 'processing' && (
          <View style={styles.slide7} key="processing">
            <Animated.View entering={FadeIn.delay(200).duration(500)} style={styles.braindiv}>
              <Animated.Text entering={FadeIn.duration(400)} style={[styles.paragraphFadeIn, { color: colors.text }]}>
                Optimising...
              </Animated.Text>
              <LottieView
                ref={lottieBrainRef}
                source={LottieBrain}
                style={styles.lottieBrain}
                loop
                autoPlay
              />
            </Animated.View>
          </View>
        )}

        {/* Step: final – Vue slide8 learner/fluent */}
        {step === 'final' && (
          <View style={styles.slide8} key="final">
            {!isFluent ? (
              <View style={styles.learner}>
                <Animated.Text entering={FadeIn.duration(600)} style={[styles.paragraphFadeIn, { color: colors.text }]}>
                  {userLevel === 'advanced' ? 'Since you are not quite fluent, here are some tips' : 'Since you are still learning, here are some tips'}
                </Animated.Text>
                <Animated.Text entering={FadeIn.delay(950).duration(600)} style={[styles.tip, { color: colors.text }]}>
                  Video and Audio can be played in Slow-Motion 🐌
                </Animated.Text>
                <Animated.Text entering={FadeIn.delay(1600).duration(600)} style={[styles.tip, styles.tip, { color: colors.text }]}>
                  Focus on learning just ONE phrase a day, we can send you reminders! 
                </Animated.Text>
                <Animated.Text entering={FadeIn.delay(1600).duration(600)} style={[styles.tip, styles.tipThird, { color: colors.text }]}>
                  Test yourself with one quiz per day, re-take until you get 100% 
                </Animated.Text>
                <Pressable
                  onPress={goToReviews}
                  style={({ pressed }) => [styles.nextButton, { opacity: pressed ? 0.9 : 1 }]}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Animated.Text entering={FadeIn.duration(600)} style={[styles.paragraphFadeIn, styles.flumargin, { color: colors.text }]}>
                  Since you are fluent, let's crack on!
                </Animated.Text>
                <Pressable
                  onPress={goToReviews}
                  style={({ pressed }) => [styles.nextButton, { opacity: pressed ? 0.9 : 1 }]}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                </Pressable>
              </>
            )}
          </View>
        )}

        {/* Step: reviews – wreath rows, testimonial swiper with dots, blue Begin */}
        {step === 'reviews' && (
          <View style={styles.slide9} key="reviews">
            <Animated.Text entering={FadeIn.duration(400)} style={[styles.seeTitle, { color: colors.text }]}>
              Great, ready to get cracking.
            </Animated.Text>
            <Animated.Text entering={FadeIn.delay(200).duration(400)} style={[styles.seeSubtitle, { color: colors.text }]}>
              Here's what's in store
            </Animated.Text>
            <View style={styles.testimColumn}>
              <View style={styles.wreathRow}>
                <Image source={FloralWreath} style={[styles.wreathImg, styles.wreathLeft]} resizeMode="contain" />
                <View style={styles.wreathCenter}>
                  <Text style={[styles.featureHeading, { color: colors.text }]}>Over 500 Slang Words & Phrases</Text>
                </View>
                <Image source={FloralWreath} style={[styles.wreathImg, styles.wreathRight]} resizeMode="contain" />
              </View>
              <View style={styles.wreathRow}>
                <Image source={FloralWreath} style={[styles.wreathImg, styles.wreathLeft]} resizeMode="contain" />
                <View style={styles.wreathCenter}>
                  <Text style={[styles.featureHeading, { color: colors.text }]}>200 Quiz Questions & 50 Videos</Text>
                  <Text style={[styles.featureMore, { color: colors.icon }]}>+ much more!</Text>
                </View>
                <Image source={FloralWreath} style={[styles.wreathImg, styles.wreathRight]} resizeMode="contain" />
              </View>
            </View>
            <View style={styles.testimonialSwiperWrap}>
              <FlatList
                data={TESTIMONIALS}
                keyExtractor={(item) => String(item.id)}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={TESTIMONIAL_SLIDE_WIDTH}
                snapToAlignment="start"
                decelerationRate="fast"
                contentContainerStyle={styles.testimonialListContent}
                onMomentumScrollEnd={(e) => {
                  const i = Math.round(e.nativeEvent.contentOffset.x / TESTIMONIAL_SLIDE_WIDTH);
                  setTestimonialIndex(Math.min(Math.max(0, i), TESTIMONIALS.length - 1));
                }}
                renderItem={({ item: t }) => (
                <View style={[styles.testimonialCard, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                  <Text style={[styles.testimonialHeading, { color: colors.text }]}>{t.heading}</Text>
                  <Text style={[styles.testimonialBody, { color: colors.text }]}>{t.testi}</Text>
                  <Text style={[styles.testimonialAuthor, { color: colors.icon }]}>– {t.author}</Text>
                </View>
              )}
              />
            </View>
            <View style={styles.paginationDots}>
              {TESTIMONIALS.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === testimonialIndex ? [styles.dotActive, { backgroundColor: colors.tint }] : { backgroundColor: colors.icon },
                  ]}
                />
              ))}
            </View>
            <Animated.View entering={FadeIn.delay(3400).duration(1000)}>
              <Pressable
                onPress={handleBegin}
                style={({ pressed }) => [styles.beginButton, { opacity: pressed ? 0.9 : 1 }]}
              >
                <Text style={styles.beginButtonText}>Begin!</Text>
              </Pressable>
            </Animated.View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    paddingHorizontal: 7,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Dimensions.get('window').height - 120,
  },
  scrollContentReviews: {
    minHeight: undefined,
    paddingTop: 8,
  },
  // Vue .slide1 – original positions and rotations
  slide1: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
    minHeight: 320,
    paddingTop: 8,
  },
  slangLeft: {
    position: 'absolute',
    left: 43,
    top: Platform.OS === 'ios' ? 72 : 56,
    transform: [{ rotate: '-10deg' }],
    zIndex: 999,
  },
  slangMiddle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 36 : 28,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  slangRight: {
    position: 'absolute',
    right: 20,
    top: Platform.OS === 'ios' ? 68 : 54,
    transform: [{ rotate: '10deg' }],
    zIndex: 999,
  },
  slangText: {
    fontFamily: SlangDisplayFont,
    fontSize: 20,
    fontWeight: '600',
  },
  lottieWrap: {
    marginTop: 60,
    width: 280,
    height: 280,
  },
  lottieGroupHello: {
    width: '100%',
    height: '100%',
  },
  // Vue .slide2
  slide2: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 320,
  },
  lottieConfused: {
    width: 280,
    height: 280,
  },
  // Vue .slide3
  slide3: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
    paddingHorizontal: 16,
  },
  paragraphFadeIn: {
    fontFamily: BodyFont,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    width: '100%',
  },
  paragraphSecond: {
    marginTop: 8,
  },
  paragraphIrish: {
    marginTop: 16,
    fontStyle: 'italic',
  },
  // Vue .slide6 level
  slideLevel: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 320,
  },
  levelContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  levelButton: {
    marginVertical: 10,
    width: '100%',
    minWidth: 300,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  levelButtonText: {
    fontFamily: ButtonFont,
    fontSize: 20,
    color: '#333',
  },
  // Vue .slide7 .braindiv
  slide7: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 320,
  },
  braindiv: {
    alignItems: 'center',
  },
  lottieBrain: {
    width: 180,
    height: 180,
    marginTop: 8,
  },
  // Vue .slide8
  slide8: {
    minHeight: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  learner: {
    maxWidth: 290,
    alignItems: 'center',
  },
  tip: {
    fontFamily: BodyFont,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'left',
    marginTop: 16,
    marginBottom: 0,
    paddingLeft: 2,
    alignSelf: 'stretch',
  },
  tipThird: {
    marginTop: 24,
    marginBottom: 16,
  },
  flumargin: {
    marginBottom: 24,
  },
  nextButton: {
    width: '100%',
    minWidth: 270,
    maxWidth: '86%',
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: ONBOARDING_BUTTON_BLUE,
    alignItems: 'center',
  },
  nextButtonText: {
    fontFamily: ButtonFont,
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  // Vue .slide9
  slide9: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
  },
  seeTitle: {
    fontFamily: HeadingFont,
    fontSize: 20,
    marginBottom: 0,
    textAlign: 'center',
  },
  seeSubtitle: {
    fontFamily: BodyFont,
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  testimColumn: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  wreathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 280,
    minHeight: 56,
  },
  wreathCenter: {
    flex: 0,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  wreathImg: {
    width: 43,
    height: 44,
  },
  wreathLeft: {
    transform: [{ scaleX: -1 }],
  },
  wreathRight: {},
  featureHeading: {
    fontFamily: ButtonFont,
    fontSize: 16,
    textAlign: 'center',
  },
  featureMore: {
    fontFamily: BodyFont,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  testimonialSwiperWrap: {
    width: TESTIMONIAL_SLIDE_WIDTH,
    alignSelf: 'center',
  },
  testimonialListContent: {
    marginVertical: 12,
  },
  testimonialCard: {
    width: 260,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 12,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {},
  testimonialHeading: {
    fontFamily: ButtonFont,
    fontSize: FontSizes.body,
    marginBottom: 6,
  },
  testimonialBody: {
    fontFamily: BodyFont,
    fontSize: FontSizes.small,
    lineHeight: 20,
    marginBottom: 8,
  },
  testimonialAuthor: {
    fontFamily: BodyFont,
    fontSize: FontSizes.small,
    fontStyle: 'italic',
  },
  beginButton: {
    marginTop: 24,
    marginBottom: 20,
    minWidth: 270,
    width: '100%',
    maxWidth: '86%',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: ONBOARDING_BUTTON_BLUE,
    alignItems: 'center',
  },
  beginButtonText: {
    fontFamily: ButtonFont,
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
});
