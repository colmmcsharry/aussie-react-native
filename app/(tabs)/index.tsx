import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
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
  fetchProjectVideos,
  formatDuration,
  getEmbedUrl,
  getThumbnail,
  getVideoId,
  type VimeoVideo,
} from '@/services/vimeo';

const THUMB_WIDTH = 108;
const THUMB_HEIGHT = 192; // 9:16 ratio, 20% larger

export default function VideosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [videos, setVideos] = useState<VimeoVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtextColor = useThemeColor({ light: '#687076', dark: '#9BA1A6' }, 'icon');
  const separatorColor = useThemeColor({ light: '#e8e8e8', dark: '#2a2a2a' }, 'icon');

  const loadVideos = useCallback(async () => {
    try {
      setError(null);
      const response = await fetchProjectVideos(1, 50);
      setVideos(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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

  const renderVideo = useCallback(
    ({ item, index }: { item: VimeoVideo; index: number }) => {
      const thumbnail = getThumbnail(item, 960);
      const duration = formatDuration(item.duration);
      const isLast = index === videos.length - 1;

      return (
        <Pressable
          onPress={() => handleVideoPress(item)}
          style={({ pressed }) => [
            styles.row,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          {/* Portrait thumbnail */}
          <View style={styles.thumbWrap}>
            <Image
              source={{ uri: thumbnail }}
              style={styles.thumb}
              contentFit="cover"
              transition={200}
            />
            {/* Duration badge */}
            <View style={styles.durationBadge}>
              <ThemedText style={styles.durationText}>{duration}</ThemedText>
            </View>
          </View>

          {/* Info */}
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

          {/* Separator */}
          {!isLast && (
            <View
              style={[styles.separator, { backgroundColor: separatorColor }]}
            />
          )}
        </Pressable>
      );
    },
    [subtextColor, separatorColor, handleVideoPress, videos.length]
  );

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>Loading videos...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.errorTitle}>Something went wrong</ThemedText>
        <ThemedText style={styles.errorDetail}>{error}</ThemedText>
        <Pressable style={styles.retryButton} onPress={loadVideos}>
          <ThemedText style={styles.retryText}>Try Again</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <TabHeader title="Videos" />
      <FlatList
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => getVideoId(item)}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: 16, paddingBottom: insets.bottom + 90 },
        ]}
        ListHeaderComponent={
          <ThemedText style={[styles.headerSubtitle, { color: subtextColor }]}>
            {videos.length} {videos.length === 1 ? 'video' : 'videos'}
          </ThemedText>
        }
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

  /* ---- Row ---- */
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },

  /* ---- Thumbnail ---- */
  thumbWrap: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  thumb: {
    width: '100%',
    height: '100%',
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
    left: THUMB_WIDTH + 14, // aligns with the text column
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
});
