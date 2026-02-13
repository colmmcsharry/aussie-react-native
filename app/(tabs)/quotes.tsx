import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Pressable,
  TextInput,
  Platform,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { getCategories, searchQuotes, SlangCategory, SlangEntry } from '@/data/slang';
import { slangImageMap } from '@/data/image-map';
import { playAudio, playAudioSlow, stopAudio } from '@/services/audio';
import { loadFavourites, toggleFavourite } from '@/services/favourites';

const ACCENT_BLUE = '#194F89'; // Australian blue
const GRID_GAP = 12;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTENT_PAD = 32; // 16*2
const CARD_PAD = 32;   // 16*2 inner card
const GRID_INNER = SCREEN_WIDTH - CONTENT_PAD - CARD_PAD;
const CELL_SIZE = (GRID_INNER - GRID_GAP * 2) / 3;

// ---------- SlangCard (expanded by default when in category view) ----------

function SlangCard({
  entry,
  isFav,
  onToggleFav,
  colors,
  defaultExpanded = false,
}: {
  entry: SlangEntry;
  isFav: boolean;
  onToggleFav: (id: string) => void;
  colors: typeof Colors.light;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [playing, setPlaying] = useState(false);
  const [playingSlow, setPlayingSlow] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

  const handleImageLoad = useCallback((e: { source: { width: number; height: number } }) => {
    const { width, height } = e.source;
    if (width && height) setImageAspectRatio(width / height);
  }, []);

  const toggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handlePlay = useCallback(() => {
    if (playing) {
      stopAudio();
      setPlaying(false);
    } else {
      setPlayingSlow(false);
      setPlaying(true);
      playAudio(entry.audioFile);
      setTimeout(() => setPlaying(false), 3000);
    }
  }, [entry.audioFile, playing]);

  const handlePlaySlow = useCallback(() => {
    if (playingSlow) {
      stopAudio();
      setPlayingSlow(false);
    } else {
      setPlayingSlow(true);
      stopAudio();
      playAudioSlow(entry.audioFile, () => setPlayingSlow(false));
    }
  }, [entry.audioFile, playingSlow]);

  const hasImage = entry.image && slangImageMap[entry.image];

  return (
    <View style={[styles.card, { backgroundColor: colors.background }]}>
      {/* Image at top when expanded (reference: G'day card) */}
      {expanded && hasImage && (
        <Image
          source={slangImageMap[entry.image!]}
          style={[
            styles.cardImageTop,
            imageAspectRatio != null && { aspectRatio: imageAspectRatio },
          ]}
          contentFit="cover"
          onLoad={handleImageLoad}
        />
      )}

      <View style={styles.cardInner}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {entry.buttonTitle}
        </Text>
        <Text style={[styles.cardExplanation, { color: colors.icon }]}>
          {entry.explanation}
        </Text>

        {/* Action row: 3 main buttons (heart, play, slow) + smaller separate expand/collapse */}
        <View style={styles.cardActionsRow}>
          <View style={styles.cardActionsMain}>
            <Pressable
              onPress={() => onToggleFav(entry.id)}
              style={({ pressed }) => [
                styles.actionBtn,
                pressed && styles.actionBtnPressed,
              ]}
            >
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={30}
              color={isFav ? '#FF3B57' : ACCENT_BLUE}
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
                name={playing ? 'stop' : 'volume-high'}
                size={28}
                color={playing ? '#fff' : ACCENT_BLUE}
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
                <Ionicons name="stop" size={28} color="#fff" />
              ) : (
                <MaterialCommunityIcons name="snail" size={28} color={ACCENT_BLUE} />
              )}
            </Pressable>
          </View>
          <Pressable
            onPress={toggleExpand}
            style={({ pressed }) => [
              styles.actionBtnExpand,
              pressed && styles.actionBtnPressed,
            ]}
          >
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={22}
              color={ACCENT_BLUE}
            />
          </Pressable>
        </View>

        {expanded && (
          <View style={styles.cardBody}>
            {entry.notes.length > 0 && (
              <View style={styles.notesSection}>
                <Text style={[styles.sectionLabel, { color: ACCENT_BLUE }]}>Notes</Text>
                {entry.notes.map((note, i) => (
                  <View key={i} style={styles.noteRow}>
                    <Text style={[styles.noteText, { color: colors.text }]}>{note}</Text>
                  </View>
                ))}
              </View>
            )}
            {entry.examples.length > 0 && (
              <View style={styles.examplesSection}>
                <Text style={[styles.sectionLabel, { color: ACCENT_BLUE }]}>Examples</Text>
                {entry.examples.map((ex, i) => (
                  <View key={i} style={styles.exampleRow}>
                    <Text style={[styles.exampleQuote, { color: colors.text }]}>"{ex}"</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// ---------- Category grid cell ----------

function CategoryCell({
  category,
  onPress,
  colors,
}: {
  category: SlangCategory;
  onPress: () => void;
  colors: typeof Colors.light;
}) {
  const iconSource = slangImageMap[category.icon];
  return (
    <TouchableOpacity
      style={[styles.gridCell, { backgroundColor: colors.background }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.gridCellInner} pointerEvents="none">
        {iconSource && (
          <Image source={iconSource} style={styles.gridCellIcon} contentFit="contain" />
        )}
        <Text style={[styles.gridCellLabel, { color: colors.text }]} numberOfLines={1}>
          {category.displayName}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ---------- Main Screen ----------

export default function QuotesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const categories = useMemo(() => getCategories(), []);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [showFavsOnly, setShowFavsOnly] = useState(false);

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

  const currentQuotes = useMemo(() => {
    if (searchQuery.trim()) return searchQuotes(searchQuery);
    if (showFavsOnly) {
      const all = categories.flatMap((c) => c.quotes);
      return all.filter((q) => favourites.has(q.id));
    }
    if (!selectedCategory) return [];
    const cat = categories.find((c) => c.name === selectedCategory);
    return cat?.quotes ?? [];
  }, [searchQuery, selectedCategory, categories, showFavsOnly, favourites]);

  const showGrid = selectedCategory === null && !showSearch && !showFavsOnly;

  const renderCard = useCallback(
    ({ item }: { item: SlangEntry }) => (
      <SlangCard
        entry={item}
        isFav={favourites.has(item.id)}
        onToggleFav={handleToggleFav}
        colors={colors}
        defaultExpanded={true}
      />
    ),
    [favourites, handleToggleFav, colors]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Green header — fixed height, left slot same width in all states */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: ACCENT_BLUE }]}>
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
                    setSearchQuery('');
                  }}
                  style={styles.headerBtn}
                >
                  <Ionicons
                    name={showFavsOnly ? 'heart' : 'heart-outline'}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowSearch((p) => !p);
                    if (showSearch) setSearchQuery('');
                  }}
                  style={styles.headerBtn}
                >
                  <Ionicons name="search" size={24} color="#fff" />
                </TouchableOpacity>
              </>
            )}
          </View>
          <View style={styles.headerRight}>
            <Ionicons name="trophy" size={24} color="#FFD700" />
          </View>
          <View style={styles.headerTitleWrap} pointerEvents="none">
            <Text style={styles.headerTitle} numberOfLines={1}>
              {showFavsOnly
                ? 'Favourites'
                : showSearch
                ? 'Search'
                : selectedCategory != null
                ? (categories.find((c) => c.name === selectedCategory)?.displayName ?? 'Slang')
                : 'Slang'}
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
          !showGrid && styles.contentListBackground,
          showGrid && styles.contentGridCentered,
        ]}
      >
        {showGrid ? (
          <View style={styles.gridCard}>
            <View style={styles.grid}>
              {categories.map((cat) => (
                <CategoryCell
                  key={cat.name}
                  category={cat}
                  onPress={() => setSelectedCategory(cat.name)}
                  colors={colors}
                />
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            data={currentQuotes}
            keyExtractor={(item) => item.id}
            renderItem={renderCard}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={colors.icon} />
                <Text style={[styles.emptyText, { color: colors.icon }]}>
                  {showFavsOnly
                    ? 'No favourites yet.'
                    : searchQuery
                    ? `No results for "${searchQuery}"`
                    : 'No quotes in this category.'}
                </Text>
              </View>
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
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  headerLeftSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 80,
    minWidth: 80,
  },
  headerRight: {
    width: 80,
    minWidth: 80,
    alignItems: 'flex-end',
  },
  headerTitleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  headerBtn: {
    padding: 6,
  },
  searchWrap: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 16,
    color: '#fff',
    paddingVertical: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  contentGridCentered: {
    justifyContent: 'center',
  },
  gridCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  gridCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  gridCellInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  gridCellIcon: {
    width: 44,
    height: 44,
    marginBottom: 6,
  },
  gridCellLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  contentListBackground: {
    backgroundColor: '#F0F4F8',
  },
  listContent: {
    paddingBottom: 24, // extra space; list view adds insets.bottom + 80 via inline style
  },
  card: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  cardImageTop: {
    width: '100%',
    minHeight: 200,
    backgroundColor: '#f0f0f0',
  },
  cardInner: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardExplanation: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardActionsMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: { elevation: 3 },
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 2 },
      android: { elevation: 2 },
    }),
  },
  cardBody: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  notesSection: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  noteRow: {
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  examplesSection: {
    gap: 6,
  },
  exampleRow: {
    marginBottom: 6,
  },
  exampleQuote: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
