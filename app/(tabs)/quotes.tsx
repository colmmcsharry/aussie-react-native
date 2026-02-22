import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PremiumCrown } from "@/components/PremiumCrown";
import { PremiumHeaderBadge } from "@/components/PremiumHeaderBadge";
import {
  BodyFont,
  ButtonFont,
  CardBodyFont,
  Colors,
  FontSizes,
  HeadingFont,
  mainAussieBlue,
  MAX_CONTENT_WIDTH,
  SlangDisplayFont,
} from "@/constants/theme";
import { usePaywall } from "@/context/PaywallContext";
import { slangImageMap } from "@/data/image-map";
import {
  getCategories,
  getRegionalCounties,
  searchQuotes,
  SlangCategory,
  SlangEntry,
} from "@/data/slang";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { playAudio, playAudioSlow, stopAudio } from "@/services/audio";
import { loadFavourites, toggleFavourite } from "@/services/favourites";

const ACCENT_BLUE = "#194F89"; // Australian blue
const GRID_GAP = 12;
const GRID_HORIZ_PADDING = 32; // content padding 16*2 only – grid card has no horizontal padding
const GRID_MAX_WIDTH = 600; // cap icon grid width so it doesn't keep growing on large screens
const NUM_COLUMNS = 3;

// ---------- SlangCard (expanded by default when in category view) ----------

/** Lighter variants of palette colors – slang cards only */
const SLANG_CARD_COLORS = ["#fcf9ef", "#eefcf0", "#fceeef", "#eef6fc"] as const;

function SlangCard({
  entry,
  isFav,
  onToggleFav,
  colors,
  defaultExpanded = false,
  cardColor,
}: {
  entry: SlangEntry;
  isFav: boolean;
  onToggleFav: (id: string) => void;
  colors: typeof Colors.light;
  defaultExpanded?: boolean;
  cardColor?: string;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [playing, setPlaying] = useState(false);
  const [playingSlow, setPlayingSlow] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);

  const handleImageLoad = useCallback(
    (e: { source: { width: number; height: number } }) => {
      const { width, height } = e.source;
      if (width && height) setImageAspectRatio(width / height);
    },
    [],
  );

  const toggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handlePlay = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlayingSlow(false);
    setPlaying(true);
    playAudio(entry.audioFile);
    setTimeout(() => setPlaying(false), 1000);
  }, [entry.audioFile]);

  const handlePlaySlow = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlaying(false);
    setPlayingSlow(true);
    playAudioSlow(entry.audioFile);
    setTimeout(() => setPlayingSlow(false), 1000);
  }, [entry.audioFile]);

  const handleFavPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleFav(entry.id);
  }, [entry.id, onToggleFav]);

  const hasImage = entry.image && slangImageMap[entry.image];

  const bgColor = cardColor ?? colors.background;
  return (
    <View style={styles.cardWrapper}>
      <View style={[styles.card, { backgroundColor: bgColor }]}>
        {/* Image at top when expanded (reference: G'day card) */}
        {expanded && hasImage && (
          <View style={styles.cardImageWrap}>
            <Image
              source={slangImageMap[entry.image!]}
              style={[
                styles.cardImageTop,
                imageAspectRatio != null && { aspectRatio: imageAspectRatio },
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

          {/* Action row: 3 main buttons (heart, play, slow) + smaller separate expand/collapse */}
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
            <Pressable
              onPress={toggleExpand}
              hitSlop={12}
              style={({ pressed }) => [
                styles.actionBtnExpand,
                pressed && { opacity: 0.6 },
              ]}
            >
              <Ionicons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={22}
                color={ACCENT_BLUE}
              />
            </Pressable>
          </View>

          {expanded && (
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
          )}
        </View>
      </View>
    </View>
  );
}

// ---------- Category grid cell ----------

function CategoryCell({
  category,
  onPress,
  colors,
  cellSize,
  iconSize,
  labelFontSize,
}: {
  category: SlangCategory;
  onPress: () => void;
  colors: typeof Colors.light;
  cellSize: number;
  iconSize: number;
  labelFontSize: number;
}) {
  const iconSource = slangImageMap[category.icon];
  return (
    <TouchableOpacity
      style={[
        styles.gridCell,
        {
          width: cellSize,
          height: cellSize,
          backgroundColor: colors.background,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.gridCellInner} pointerEvents="none">
        {iconSource && (
          <Image
            source={iconSource}
            style={{ width: iconSize, height: iconSize, marginBottom: 6 }}
            contentFit="contain"
          />
        )}
        <Text
          style={[
            styles.gridCellLabel,
            { color: colors.text, fontSize: labelFontSize },
          ]}
          numberOfLines={1}
        >
          {category.displayName}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ---------- Main Screen ----------

export default function QuotesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  const { openPaywall, isPremium } = usePaywall();
  const { width: screenWidth } = useWindowDimensions();

  const [gridContainerWidth, setGridContainerWidth] = useState(0);

  const { cellSize, iconSize, labelFontSize } = useMemo(() => {
    const isNarrowAndroid = Platform.OS === "android" && screenWidth < 400;
    const iconScale = isNarrowAndroid ? 0.36 : 0.42;
    const labelScale = isNarrowAndroid ? 0.12 : 0.14;
    // On Android use measured width so 3 columns always fit; on iOS use original formula so look is unchanged
    const rawWidth =
      Platform.OS === "android" && gridContainerWidth > 0
        ? gridContainerWidth
        : screenWidth - (isNarrowAndroid ? 64 : GRID_HORIZ_PADDING);
    const availableWidth = Math.min(rawWidth, GRID_MAX_WIDTH);
    const cell = Math.floor(
      (availableWidth - GRID_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS,
    );
    const icon = Math.round(cell * iconScale);
    const labelSize = Math.max(
      FontSizes.small,
      Math.min(FontSizes.body, Math.round(cell * labelScale)),
    );
    return { cellSize: cell, iconSize: icon, labelFontSize: labelSize };
  }, [screenWidth, gridContainerWidth]);

  const categories = useMemo(() => getCategories(), []);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [showFavsOnly, setShowFavsOnly] = useState(false);
  const [cardsExpandedByDefault, setCardsExpandedByDefault] = useState(true);
  const [selectedRegionalCounty, setSelectedRegionalCounty] = useState<
    string | null
  >(null);

  const regionalCounties = useMemo(() => getRegionalCounties(), []);

  // When user selects a category, show all cards expanded by default
  useEffect(() => {
    if (selectedCategory !== null) setCardsExpandedByDefault(true);
  }, [selectedCategory]);

  // When entering Regional, select first region; when leaving, clear
  useEffect(() => {
    if (selectedCategory === "Regional") {
      setSelectedRegionalCounty((prev) => prev ?? regionalCounties[0] ?? null);
    } else {
      setSelectedRegionalCounty(null);
    }
  }, [selectedCategory, regionalCounties]);

  // When user taps Slang tab, reset to main categories view and refresh favourites
  useFocusEffect(
    useCallback(() => {
      setSelectedCategory(null);
      setSearchQuery("");
      setShowSearch(false);
      setShowFavsOnly(false);
      loadFavourites().then(setFavourites);
    }, []),
  );

  const handleToggleFav = useCallback(async (id: string) => {
    const isFav = await toggleFavourite(id);
    setFavourites((prev) => {
      const next = new Set(prev);
      if (isFav) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleCategoryPress = useCallback(
    (categoryName: string) => {
      const isPremiumCategory =
        categoryName === "Rude" || categoryName === "sex";
      if (isPremiumCategory && !isPremium) {
        openPaywall();
        return;
      }
      setSelectedCategory(categoryName);
    },
    [openPaywall, isPremium],
  );

  const currentQuotes = useMemo(() => {
    if (searchQuery.trim()) return searchQuotes(searchQuery);
    if (showFavsOnly) {
      const all = categories.flatMap((c) => c.quotes);
      // Deduplicate by id so the same quote in multiple categories doesn't cause duplicate keys
      const byId = new Map<string, SlangEntry>();
      all.forEach((q) => {
        if (favourites.has(q.id)) byId.set(q.id, q);
      });
      return Array.from(byId.values());
    }
    if (!selectedCategory) return [];
    const cat = categories.find((c) => c.name === selectedCategory);
    const quotes = cat?.quotes ?? [];
    if (selectedCategory === "Regional" && selectedRegionalCounty != null) {
      return quotes.filter((q) => q.regionalCounty === selectedRegionalCounty);
    }
    return quotes;
  }, [
    searchQuery,
    selectedCategory,
    selectedRegionalCounty,
    categories,
    showFavsOnly,
    favourites,
  ]);

  const showGrid = selectedCategory === null && !showSearch && !showFavsOnly;

  const renderCard = useCallback(
    ({ item, index }: { item: SlangEntry; index: number }) => (
      <SlangCard
        entry={item}
        isFav={favourites.has(item.id)}
        onToggleFav={handleToggleFav}
        colors={colors}
        defaultExpanded={cardsExpandedByDefault}
        cardColor={SLANG_CARD_COLORS[index % SLANG_CARD_COLORS.length]}
      />
    ),
    [favourites, handleToggleFav, colors, cardsExpandedByDefault],
  );

  const containerBg = colors.background;
  return (
    <View style={[styles.container, { backgroundColor: containerBg }]}>
      {/* Blue header — fixed height, left slot same width in all states */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, backgroundColor: ACCENT_BLUE },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeftSlot}>
            {selectedCategory !== null || showSearch || showFavsOnly ? (
              <TouchableOpacity
                onPress={() => {
                  if (showSearch) setShowSearch(false);
                  else if (showFavsOnly) setShowFavsOnly(false);
                  else setSelectedCategory(null);
                }}
                style={styles.headerBtn}
              >
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => {
                    setShowFavsOnly((p) => !p);
                    setSearchQuery("");
                  }}
                  style={styles.headerBtn}
                >
                  <Ionicons
                    name={showFavsOnly ? "heart" : "heart-outline"}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowSearch((p) => !p);
                    if (showSearch) setSearchQuery("");
                  }}
                  style={styles.headerBtn}
                >
                  <Ionicons name="search" size={24} color="#fff" />
                </TouchableOpacity>
              </>
            )}
          </View>
          <View style={styles.headerRight}>
            <PremiumHeaderBadge size={26} />
          </View>
          <View style={styles.headerTitleWrap} pointerEvents="none">
            <Text style={styles.headerTitle} numberOfLines={1}>
              {showFavsOnly
                ? "Favourites"
                : showSearch
                  ? "Search"
                  : selectedCategory === "Regional"
                    ? "Regional Slang"
                    : selectedCategory != null
                      ? (categories.find((c) => c.name === selectedCategory)
                          ?.displayName ?? "Slang")
                      : "Slang"}
            </Text>
          </View>
        </View>

        {showSearch && (
          <View style={styles.searchWrap}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search slang..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
          </View>
        )}
      </View>

      {/* Content: grid or list */}
      <View
        style={[
          styles.content,
          !showGrid && { backgroundColor: "#fff" },
          showGrid && styles.contentGridCentered,
          showGrid && Platform.OS === "android" && styles.contentAndroidGrid,
        ]}
      >
        {showGrid ? (
          <View
            style={[
              styles.gridCard,
              Platform.OS === "android" && styles.gridCardAndroidTight,
            ]}
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width;
              if (w > 0) setGridContainerWidth(w);
            }}
          >
            <FlatList
              data={categories}
              keyExtractor={(c) => c.name}
              numColumns={NUM_COLUMNS}
              scrollEnabled={false}
              columnWrapperStyle={styles.gridRow}
              renderItem={({ item: cat }) => (
                <CategoryCell
                  category={cat}
                  onPress={() => handleCategoryPress(cat.name)}
                  colors={colors}
                  cellSize={cellSize}
                  iconSize={iconSize}
                  labelFontSize={labelFontSize}
                />
              )}
            />
          </View>
        ) : (
          <FlatList
            data={currentQuotes}
            keyExtractor={(item) => item.id}
            renderItem={renderCard}
            ListHeaderComponent={
              <View>
                {selectedCategory === "Regional" &&
                  regionalCounties.length > 0 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.regionPickerScroll}
                      contentContainerStyle={styles.regionPickerContent}
                    >
                      {regionalCounties.map((county) => (
                        <TouchableOpacity
                          key={county}
                          onPress={() => setSelectedRegionalCounty(county)}
                          style={[
                            styles.regionChip,
                            selectedRegionalCounty === county &&
                              styles.regionChipSelected,
                          ]}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.regionChipText,
                              selectedRegionalCounty === county &&
                                styles.regionChipTextSelected,
                            ]}
                            numberOfLines={1}
                          >
                            {county.replace(/\s+Slang$/, "")}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                <View style={styles.collapseAllRow}>
                  <TouchableOpacity
                    onPress={() => setCardsExpandedByDefault((prev) => !prev)}
                    style={styles.collapseAllBtn}
                    hitSlop={8}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        cardsExpandedByDefault ? "chevron-up" : "chevron-down"
                      }
                      size={22}
                      color={ACCENT_BLUE}
                    />
                    <Text style={styles.collapseAllLabel}>
                      {cardsExpandedByDefault ? "Collapse All" : "Expand All"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            }
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + 50 },
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={colors.icon} />
                <Text style={[styles.emptyText, { color: colors.icon }]}>
                  {showFavsOnly
                    ? "No favourites yet."
                    : searchQuery
                      ? `No results for "${searchQuery}"`
                      : "No quotes in this category."}
                </Text>
              </View>
            }
            ListFooterComponent={
              selectedCategory != null && !isPremium ? (
                <TouchableOpacity
                  style={styles.premiumCard}
                  onPress={openPaywall}
                  activeOpacity={0.8}
                >
                  <PremiumCrown size={28} style={styles.premiumCardIcon} />
                  <Text style={styles.premiumCardText}>
                    Get more with Premium
                  </Text>
                </TouchableOpacity>
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    minHeight: 52,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerRow: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },
  headerLeftSlot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: 80,
    minWidth: 80,
  },
  headerRight: {
    width: 80,
    minWidth: 80,
    alignItems: "flex-end",
  },
  headerTitleWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: HeadingFont,
    color: "#fff",
    textAlign: "center",
  },
  headerBtn: {
    padding: 6,
  },
  searchWrap: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 16,
    color: "#fff",
    paddingVertical: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: "center",
  },
  contentGridCentered: {
    justifyContent: "center",
  },
  gridCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 0,
    overflow: "hidden",
    width: "100%",
    maxWidth: GRID_MAX_WIDTH,
    alignSelf: "center",
  },
  gridCardAndroidTight: {
    marginHorizontal: 0,
  },
  contentAndroidGrid: {
    paddingHorizontal: 6,
  },
  gridRow: {
    flexDirection: "row",
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
    justifyContent: "flex-start",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },
  gridCell: {
    borderRadius: 14,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 0 },
    }),
  },
  gridCellInner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  gridCellLabel: {
    fontFamily: ButtonFont,
    textAlign: "center",
  },
  regionPickerScroll: {
    marginTop: 26,
    marginBottom: 8,
  },
  regionPickerContent: {
    paddingRight: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  regionChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  regionChipSelected: {
    backgroundColor: ACCENT_BLUE,
  },
  regionChipText: {
    fontFamily: ButtonFont,
    fontSize: 14,
    color: "#333",
  },
  regionChipTextSelected: {
    color: "#fff",
  },
  collapseAllRow: {
    marginTop: 20,
    marginBottom: 18,
  },
  collapseAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  collapseAllLabel: {
    fontFamily: ButtonFont,
    fontSize: 16,
    color: ACCENT_BLUE,
  },
  listContent: {
    paddingBottom: 24, // extra space; list view adds insets.bottom + 80 via inline style
  },
  cardWrapper: {
    borderRadius: 20,
    marginBottom: 48,
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
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
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
  actionBtnExpand: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
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
  exampleRow: {
    marginBottom: 2,
  },
  exampleQuote: {
    fontSize: 16,
    marginBottom: 6,
    fontFamily: CardBodyFont,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    fontFamily: BodyFont,
  },
  premiumCard: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: mainAussieBlue,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(25, 79, 137, 0.2)",
  },
  premiumCardIcon: {},
  premiumCardText: {
    fontFamily: ButtonFont,
    fontSize: 20,
    color: "white",
    fontWeight: "600",
  },
});
