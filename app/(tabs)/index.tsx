import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabHeader } from '@/components/tab-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  fetchAussieYouTubeVideos,
  getYouTubeProxyEmbedUrl,
  getYouTubeThumbnail,
  type YouTubeVideoEntry,
} from '@/services/youtube-gist';
import {
  fetchProjectVideos,
  formatDuration,
  getEmbedUrl,
  getThumbnail,
  getVideoId,
  type VimeoVideo,
} from '@/services/vimeo';

const LIST_THUMB_WIDTH = 160;
const LIST_THUMB_HEIGHT = 120; // landscape, same as YouTube so Vimeo thumbnails fill without black bars

type VideoSection = { title: string; data: (YouTubeVideoEntry | VimeoVideo)[]; isYouTube: boolean };

export default function VideosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideoEntry[]>([]);
  const [videos, setVideos] = useState<VimeoVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtextColor = useThemeColor({ light: '#687076', dark: '#9BA1A6' }, 'icon');
  const separatorColor = useThemeColor({ light: '#e8e8e8', dark: '#2a2a2a' }, 'icon');

  const loadVideos = useCallback(async () => {
    setError(null);
    const [ytResult, vimeoResult] = await Promise.allSettled([
      fetchAussieYouTubeVideos(),
      fetchProjectVideos(1, 50),
    ]);
    if (ytResult.status === 'fulfilled') setYoutubeVideos(ytResult.value);
    if (vimeoResult.status === 'fulfilled') setVideos(vimeoResult.value.data);
    if (ytResult.status === 'rejected' && vimeoResult.status === 'rejected') {
      setError(vimeoResult.reason?.message ?? 'Failed to load videos');
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadVideos();
  }, [loadVideos]);

  const handleVideoPress = useCallback(
    (video: VimeoVideo) => {
      const id = getVideoId(video);
      router.push({
        pathname: '/video/[id]',
        params: {
          id,
          title: video.name,
          embedUrl: getEmbedUrl(video),
          duration: String(video.duration),
          isPortrait: video.height > video.width ? '1' : '0',
        },
      });
    },
    [router]
  );

  const handleYouTubePress = useCallback(
    (entry: YouTubeVideoEntry) => {
      router.push({
        pathname: '/video/[id]',
        params: {
          id: entry.youtubeId,
          title: entry.title,
          embedUrl: getYouTubeProxyEmbedUrl(entry.youtubeId, {
            cc_load_policy: entry.cc_load_policy,
          }),
          isPortrait: '0',
          source: 'youtube',
        },
      });
    },
    [router]
  );

  const sections = useMemo((): VideoSection[] => {
    const s: VideoSection[] = [];
    if (youtubeVideos.length > 0) {
      s.push({ title: 'Aussie Slang (YouTube)', data: youtubeVideos, isYouTube: true });
    }
    if (videos.length > 0) {
      s.push({ title: 'Videos', data: videos, isYouTube: false });
    }
    return s;
  }, [youtubeVideos, videos]);

  const renderYouTubeItem = useCallback(
    ({ item }: { item: YouTubeVideoEntry }) => (
      <Pressable
        onPress={() => handleYouTubePress(item)}
        style={({ pressed }) => [styles.row, styles.youtubeRow, { opacity: pressed ? 0.6 : 1 }]}
      >
        <View style={styles.listThumbWrap}>
          <Image
            source={{ uri: getYouTubeThumbnail(item.youtubeId) }}
            style={styles.listThumb}
            contentFit="cover"
            transition={200}
          />
        </View>
        <View style={styles.info}>
          <ThemedText style={styles.title} numberOfLines={2}>
            {item.title}
          </ThemedText>
          {item.description ? (
            <ThemedText
              style={[styles.description, { color: subtextColor }]}
              numberOfLines={2}
            >
              {item.description}
            </ThemedText>
          ) : null}
          {item.channelName ? (
            <ThemedText style={[styles.meta, { color: subtextColor }]}>
              {item.channelName}
            </ThemedText>
          ) : null}
        </View>
      </Pressable>
    ),
    [subtextColor, handleYouTubePress]
  );

  const renderVimeoItem = useCallback(
    ({ item, index, section }: { item: VimeoVideo; index: number; section: VideoSection }) => {
      const isLast = index === section.data.length - 1;
      const thumbnail = getThumbnail(item, 960);
      const duration = formatDuration(item.duration);

      return (
        <Pressable
          onPress={() => handleVideoPress(item)}
          style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
        >
          <View style={styles.listThumbWrap}>
            <Image
              source={{ uri: thumbnail }}
              style={[styles.listThumb, styles.vimeoThumbZoom]}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.durationBadge}>
              <ThemedText style={styles.durationText}>{duration}</ThemedText>
            </View>
          </View>
          <View style={styles.info}>
            <ThemedText style={styles.title} numberOfLines={2}>
              {item.name}
            </ThemedText>
            {item.description ? (
              <ThemedText
                style={[styles.description, { color: subtextColor }]}
                numberOfLines={2}
              >
                {item.description}
              </ThemedText>
            ) : null}
            <ThemedText style={[styles.meta, { color: subtextColor }]}>
              {item.stats.plays} {item.stats.plays === 1 ? 'view' : 'views'}
            </ThemedText>
          </View>
          {!isLast && (
            <View
              style={[styles.separator, { backgroundColor: separatorColor }]}
            />
          )}
        </Pressable>
      );
    },
    [subtextColor, separatorColor, handleVideoPress]
  );

  const renderItem = useCallback(
    ({ item, index, section }: { item: YouTubeVideoEntry | VimeoVideo; index: number; section: VideoSection }) => {
      if (section.isYouTube) {
        return renderYouTubeItem({ item: item as YouTubeVideoEntry });
      }
      return renderVimeoItem({ item: item as VimeoVideo, index, section });
    },
    [renderYouTubeItem, renderVimeoItem]
  );

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>Loading videos...</ThemedText>
      </ThemedView>
    );
  }

  if (error && youtubeVideos.length === 0 && videos.length === 0) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.errorTitle}>Something went wrong</ThemedText>
        <ThemedText style={styles.errorDetail}>{error}</ThemedText>
        <Pressable style={styles.retryButton} onPress={() => { setLoading(true); loadVideos(); }}>
          <ThemedText style={styles.retryText}>Try Again</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <TabHeader title="Videos" />
      <SectionList
        sections={sections}
        keyExtractor={(item) =>
          'youtubeId' in item
            ? (item as YouTubeVideoEntry).youtubeId
            : getVideoId(item as VimeoVideo)
        }
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <View
            style={[
              styles.sectionHeader,
              sections[0] === section && styles.sectionHeaderFirst,
            ]}
          >
            <ThemedText style={[styles.sectionTitle, { color: subtextColor }]}>
              {section.title}
            </ThemedText>
            <ThemedText style={[styles.sectionCount, { color: subtextColor }]}>
              {section.data.length} {section.data.length === 1 ? 'video' : 'videos'}
            </ThemedText>
          </View>
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: 16, paddingBottom: insets.bottom + 90 },
        ]}
        ListEmptyComponent={
          !loading ? (
            <ThemedText style={[styles.headerSubtitle, { color: subtextColor }]}>
              No videos yet.
            </ThemedText>
          ) : null
        }
        stickySectionHeadersEnabled={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#194F89',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  headerSubtitle: {
    fontSize: 15,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
    marginTop: 16,
  },
  sectionHeaderFirst: {
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sectionCount: {
    fontSize: 13,
  },

  /* ---- Row ---- */
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },

  /* ---- Thumbnail ---- */
  listThumbWrap: {
    width: LIST_THUMB_WIDTH,
    height: LIST_THUMB_HEIGHT,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  listThumb: {
    width: '100%',
    height: '100%',
  },
  /** Zoom Vimeo thumbnails so baked-in black bars are cropped; container clips with overflow: hidden */
  vimeoThumbZoom: {
    position: 'absolute',
    width: LIST_THUMB_WIDTH * 2.4,
    height: LIST_THUMB_HEIGHT * 2.4,
    left: (LIST_THUMB_WIDTH - LIST_THUMB_WIDTH * 2.4) / 2,
    top: (LIST_THUMB_HEIGHT - LIST_THUMB_HEIGHT * 2.4) / 2,
  },
  youtubeRow: {
    marginBottom: 4,
  },
  durationBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  durationText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },

  /* ---- Info ---- */
  info: {
    flex: 1,
    marginLeft: 14,
    paddingTop: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    lineHeight: 19,
    marginTop: 4,
  },
  meta: {
    fontSize: 13,
    marginTop: 6,
  },

  /* ---- Separator ---- */
  separator: {
    position: 'absolute',
    bottom: 0,
    left: LIST_THUMB_WIDTH + 14,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
});
