import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SlangDetailModal } from "@/components/slang-detail-modal";
import { TabHeader } from "@/components/tab-header";
import { Colors, CardPalette } from "@/constants/theme";
import { quizImageMap } from "@/data/quiz-assets";
import { quizzes, type QuizQuestion } from "@/data/quiz-data";
import { getCategories } from "@/data/slang";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { loadFavourites, toggleFavourite } from "@/services/favourites";
import {
  fetchAussieYouTubeVideos,
  getYouTubeProxyEmbedUrl,
  getYouTubeThumbnail,
  type YouTubeVideoEntry,
} from "@/services/youtube-gist";
import { getSortableTimestamp } from "@/utils/date";

const ACCENT_BLUE = "#194F89"; // Australian blue

// Matches slang-src/pages/feed.vue aussieQuotes (full text, no abbreviations)
const AUSSIE_QUOTES: { text: string; author: string }[] = [
  { text: "She'll be right, mate.", author: "Australian Proverb" },
  {
    text: "We're not here for a long time, we're here for a good time.",
    author: "Australian Saying",
  },
  { text: "You can't keep a good bloke down.", author: "Australian Saying" },
  {
    text: "Don't worry about the world ending today. It's already tomorrow in Australia.",
    author: "Charles M. Schulz",
  },
  {
    text: "I spend my time improving the things I can change, not worrying about the things I can't.",
    author: "Melanie Perkins",
  },
  {
    text: "The world is changing very fast. Big will not beat small anymore. It will be the fast beating the slow.",
    author: "Rupert Murdoch",
  },
  {
    text: "God Bless America. God Save The Queen. God defend New Zealand and thank Christ for Australia.",
    author: "Russell Crowe",
  },
  {
    text: "There's an expression in Australia that's called 'Go Bush,' which means to get out of the city and relax. I try and 'go bush' to places where there's no cell reception. But, I don't get to do that often, so for the most part, it's just a state of mind.",
    author: "Cate Blanchett",
  },
  {
    text: "You know what happens when you don't take a risk? Nothing.",
    author: "Mel Gibson",
  },
  {
    text: "People who say, 'There's nothing to fear from spiders' have clearly never been to Australia.",
    author: "Cate Blanchett",
  },
  {
    text: "Even the Australians don't know how beautiful their own country is.",
    author: "Brian Cox",
  },
  {
    text: "Australia is an outdoor country. People only go inside to use the toilet. And that's only a recent development.",
    author: "Barry Humphries",
  },
  {
    text: "If you're an Australian, you're born with the knowledge that everything is trying to kill you. The snakes, the spiders, the sharks... even the plants have a go.",
    author: "Anonymous",
  },
  {
    text: "I'm a bit like a shark. I just keep moving. If I stop, I'll die.",
    author: "Crocodile Dundee",
  },
  {
    text: "Australia is a nation of 23 million people, mostly of whom live in a narrow strip of land along the coast and spend their time trying to convince the rest of the world that they live in the Outback.",
    author: "Bill Bryson",
  },
  { text: "Tall poppies get cut down.", author: "Australian Proverb" },
  {
    text: "If you're not having fun, you're doing it wrong.",
    author: "Australian Saying",
  },
];

function pickRandom<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function FeedScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const allSlang = useMemo(() => getCategories().flatMap((c) => c.quotes), []);
  const allQuizQuestions = useMemo(
    () => quizzes.flatMap((q) => q.questions),
    [],
  );

  const [slangOfTheDay] = useState(() => pickRandom(allSlang));
  const [showSlangModal, setShowSlangModal] = useState(false);
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion | null>(() =>
    pickRandom(allQuizQuestions),
  );
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [aussieQuote] = useState(
    () => pickRandom(AUSSIE_QUOTES) ?? AUSSIE_QUOTES[0],
  );
  const [videoOfTheDay, setVideoOfTheDay] = useState<YouTubeVideoEntry | null>(
    null,
  );
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchAussieYouTubeVideos()
      .then((list) => {
        if (list.length === 0) return;
        const sorted = [...list].sort(
          (a, b) => getSortableTimestamp(b.date) - getSortableTimestamp(a.date),
        );
        setVideoOfTheDay(sorted[0]);
      })
      .catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  useEffect(() => {
    loadFavourites().then(setFavourites);
  }, []);

  const handleToggleFav = useCallback(async (id: string) => {
    const isFav = await toggleFavourite(id);
    setFavourites((prev) => {
      const next = new Set(prev);
      if (isFav) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const isCorrect = useMemo(() => {
    if (!quizQuestion || selectedAnswer === null) return false;
    return quizQuestion.answers[selectedAnswer] === quizQuestion.correctAnswer;
  }, [quizQuestion, selectedAnswer]);

  const selectAnswer = useCallback(
    (index: number) => {
      if (hasAnswered || !quizQuestion) return;
      setSelectedAnswer(index);
      setHasAnswered(true);
    },
    [hasAnswered, quizQuestion],
  );

  const getAnswerStyle = useCallback(
    (index: number) => {
      if (!hasAnswered) {
        return selectedAnswer === index ? styles.optionSelected : null;
      }
      const answer = quizQuestion!.answers[index];
      if (answer === quizQuestion!.correctAnswer) return styles.optionCorrect;
      if (selectedAnswer === index) return styles.optionIncorrect;
      return null;
    },
    [hasAnswered, selectedAnswer, quizQuestion],
  );

  const goToSlang = useCallback(() => {
    router.push("/(tabs)/quotes");
  }, [router]);

  const goToQuiz = useCallback(() => {
    router.push("/(tabs)/quiz");
  }, [router]);

  const playVideoOfTheDay = useCallback(() => {
    if (!videoOfTheDay) return;
    router.push({
      pathname: "/video/[id]",
      params: {
        id: videoOfTheDay.youtubeId,
        title: videoOfTheDay.title,
        embedUrl: getYouTubeProxyEmbedUrl(videoOfTheDay.youtubeId, {
          cc_load_policy: videoOfTheDay.cc_load_policy,
        }),
        isPortrait: "0",
        source: "youtube",
      },
    });
  }, [router, videoOfTheDay]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TabHeader title="Feed" />
      <SlangDetailModal
        visible={showSlangModal}
        entry={slangOfTheDay}
        isFav={slangOfTheDay ? favourites.has(slangOfTheDay.id) : false}
        onToggleFav={handleToggleFav}
        onClose={() => setShowSlangModal(false)}
        colors={colors}
      />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Slang of the Day */}
        <View style={styles.cardWrapper}>
          <View style={[styles.card, styles.slangCard]}>
          <Pressable
            style={({ pressed }) => [pressed && styles.cardPressed]}
            onPress={() => slangOfTheDay && setShowSlangModal(true)}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="book-outline" size={28} color="#333" />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Slang of the Day
              </Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.slangTerm, { color: ACCENT_BLUE }]}>
                {slangOfTheDay?.buttonTitle ?? "Loading..."}
              </Text>
              <Text style={[styles.slangHint, { color: colors.icon }]}>
                Tap to see full explanation →
              </Text>
            </View>
          </Pressable>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={goToSlang}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>See All Aussie Slang →</Text>
          </TouchableOpacity>
          </View>
        </View>

        {/* Video of the Day */}
        {videoOfTheDay && (
          <View style={styles.cardWrapper}>
          <View style={[styles.card, styles.videoCard]}>
            <Pressable
              style={({ pressed }) => [pressed && styles.cardPressed]}
              onPress={playVideoOfTheDay}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="play-circle-outline" size={28} color="#333" />
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Video of the Day
                </Text>
              </View>
              <View style={styles.videoCardContent}>
                <Image
                  source={{ uri: getYouTubeThumbnail(videoOfTheDay.youtubeId) }}
                  style={styles.videoThumb}
                  contentFit="cover"
                />
                <Text
                  style={[styles.videoTitle, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {videoOfTheDay.title}
                </Text>
                <Text style={[styles.videoHint, { color: colors.icon }]}>
                  Tap to watch →
                </Text>
              </View>
            </Pressable>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/(tabs)/videos")}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>See All Videos →</Text>
            </TouchableOpacity>
          </View>
          </View>
        )}

        {/* Question of the Day */}
        <View style={styles.cardWrapper}>
        <View style={[styles.card, styles.quizCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="help-circle-outline" size={28} color="#333" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Question of the Day
            </Text>
          </View>
          {quizQuestion && (
            <View style={styles.cardContent}>
              <Text style={[styles.quizQuestionText, { color: colors.text }]}>
                {quizQuestion.text}
              </Text>
              {quizQuestion.image && quizImageMap[quizQuestion.image] && (
                <Image
                  source={quizImageMap[quizQuestion.image]}
                  style={styles.quizImage}
                  contentFit="cover"
                />
              )}
              <View style={styles.optionsWrap}>
                {quizQuestion.answers.map((answer, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      {
                        borderColor: colors.icon + "40",
                        backgroundColor: colors.background,
                      },
                      getAnswerStyle(index),
                    ]}
                    onPress={() => selectAnswer(index)}
                    disabled={hasAnswered}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: colors.text },
                        getAnswerStyle(index) === styles.optionCorrect &&
                          styles.optionTextCorrect,
                        getAnswerStyle(index) === styles.optionIncorrect &&
                          styles.optionTextIncorrect,
                      ]}
                    >
                      {["A", "B", "C", "D"][index]}. {answer}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {hasAnswered && (
                <View style={styles.resultWrap}>
                  <Text
                    style={[
                      styles.resultText,
                      isCorrect ? styles.correctMsg : styles.incorrectMsg,
                    ]}
                  >
                    {isCorrect
                      ? "✓ Correct!"
                      : `✗ Wrong! The answer was: ${quizQuestion.correctAnswer}`}
                  </Text>
                </View>
              )}
            </View>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={goToQuiz}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>See All Quizzes →</Text>
          </TouchableOpacity>
        </View>
        </View>

        {/* Aussie Quote of the Day */}
        <View style={styles.cardWrapper}>
        <View style={[styles.card, styles.quoteCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="chatbox-ellipses-outline" size={28} color="#333" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Aussie Quote of the Day
            </Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.quoteText, { color: colors.text }]}>
              {`"${aussieQuote.text}"`}
            </Text>
            <Text style={[styles.quoteAuthor, { color: colors.icon }]}>
              — {aussieQuote.author}
            </Text>
          </View>
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 20,
  },
  cardWrapper: {
    borderRadius: 20,
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
  card: {
    borderRadius: 20,
    padding: 20,
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.95,
  },
  slangCard: {
    backgroundColor: CardPalette.slang,
  },
  quizCard: {
    backgroundColor: CardPalette.quiz,
  },
  videoCard: {
    backgroundColor: CardPalette.video,
  },
  quoteCard: {
    backgroundColor: CardPalette.quote,
  },
  videoCardContent: {
    marginBottom: 4,
  },
  videoThumb: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  videoHint: {
    fontSize: 14,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  cardContent: {
    marginBottom: 4,
  },
  slangTerm: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  slangHint: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 14,
  },
  quizQuestionText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    lineHeight: 22,
  },
  quizImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#f0f0f0",
  },
  optionsWrap: {
    gap: 10,
    marginBottom: 8,
  },
  optionButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  optionSelected: {
    borderColor: ACCENT_BLUE,
    backgroundColor: "rgba(10, 126, 164, 0.12)",
  },
  optionCorrect: {
    borderColor: "#4CAF50",
    backgroundColor: "#e8f5e9",
  },
  optionIncorrect: {
    borderColor: "#f44336",
    backgroundColor: "#ffebee",
  },
  optionText: {
    fontSize: 15,
  },
  optionTextCorrect: {
    fontWeight: "600",
    color: "#2e7d32",
  },
  optionTextIncorrect: {
    fontWeight: "600",
    color: "#c62828",
  },
  resultWrap: {
    marginTop: 8,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 16,
    fontWeight: "700",
  },
  correctMsg: {
    color: "#4CAF50",
  },
  incorrectMsg: {
    color: "#f44336",
  },
  quoteText: {
    fontSize: 17,
    fontStyle: "italic",
    lineHeight: 24,
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "right",
  },
  actionButton: {
    backgroundColor: ACCENT_BLUE,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
