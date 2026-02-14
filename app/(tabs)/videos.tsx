import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const CONTENT_BG = '#F0F4F8';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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
  groupVimeoVideosByTeacher,
  type VimeoVideo,
} from '@/services/vimeo';
import { teachers, TEACHER_KEYS } from '@/data/teachers';

const LIST_THUMB_WIDTH = 160;
const LIST_THUMB_HEIGHT = 120;

const MONTH_NAMES: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5, july: 6,
  august: 7, september: 8, october: 9, november: 10, december: 11,
};

/** Returns timestamp for sorting (newest first). Handles ISO and "July 5, 2025" style. */
function getSortableTimestamp(dateStr: string | undefined): number {
  if (!dateStr || !dateStr.trim()) return 0;
  const d = new Date(dateStr);
  if (!Number.isNaN(d.getTime())) return d.getTime();
  // Hermes can't parse "Month DD, YYYY" – parse manually
  const match = dateStr.trim().match(/^(\w+)\s+(\d{1,2}),\s*(\d{4})$/i);
  if (match) {
    const month = MONTH_NAMES[match[1].toLowerCase()];
    const day = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    if (month !== undefined && !Number.isNaN(day) && !Number.isNaN(year)) {
      const parsed = new Date(year, month, day);
      if (!Number.isNaN(parsed.getTime())) return parsed.getTime();
    }
  }
  return 0;
}

function formatUploadDate(dateStr: string | undefined): string {
  if (!dateStr || !dateStr.trim()) return '';
  const d = new Date(dateStr);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  // Hermes often can't parse "July 5, 2025" etc.; show the string as-is if it looks like a date
  const trimmed = dateStr.trim();
  if (/\d/.test(trimmed) && trimmed.length >= 4) return trimmed;
  return '';
}

type LatestItem =
  | { type: 'youtube'; entry: YouTubeVideoEntry; sortKey: number }
  | { type: 'vimeo'; video: VimeoVideo; sortKey: number };

export default function VideosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState<'latest' | 'teachers'>('latest');
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideoEntry[]>([]);
  const [videos, setVideos] = useState<VimeoVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList<LatestItem> | null>(null);

  useFocusEffect(
    useCallback(() => {
      setViewMode('latest');
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, [])
  );

  const subtextColor = useThemeColor({ light: '#687076', dark: '#9BA1A6' }, 'icon');

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

  const vimeoByTeacher = useMemo(
    () => groupVimeoVideosByTeacher(videos),
    [videos]
  );

  const latestList = useMemo((): LatestItem[] => {
    const list: LatestItem[] = [];
    youtubeVideos.forEach((entry) => {
      list.push({ type: 'youtube', entry, sortKey: getSortableTimestamp(entry.date) });
    });
    videos.forEach((video) => {
      list.push({
        type: 'vimeo',
        video,
        sortKey: getSortableTimestamp(video.created_time),
      });
    });
    list.sort((a, b) => b.sortKey - a.sortKey);
    return list;
  }, [youtubeVideos, videos]);

  const handleVideoPress = useCallback(
    (video: VimeoVideo) => {
      router.push({
        pathname: '/video/[id]',
        params: {
          id: getVideoId(video),
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

  const openLink = useCallback((url: string) => {
    Linking.openURL(url);
  }, []);

  const renderLatestItem = useCallback(
    ({ item }: { item: LatestItem }) => {
      if (item.type === 'youtube') {
        const { entry } = item;
        return (
          <View style={styles.videoCard}>
            <Pressable
              onPress={() => handleYouTubePress(entry)}
              style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
            >
              <View style={styles.listThumbWrap}>
                <Image
                  source={{ uri: getYouTubeThumbnail(entry.youtubeId) }}
                  style={styles.listThumb}
                  contentFit="cover"
                  transition={200}
                />
              </View>
              <View style={styles.info}>
                <ThemedText style={styles.title} numberOfLines={2}>{entry.title}</ThemedText>
                {formatUploadDate(entry.date) ? (
                  <ThemedText style={[styles.meta, { color: subtextColor }]}>
                    {formatUploadDate(entry.date)}
                  </ThemedText>
                ) : null}
              </View>
            </Pressable>
          </View>
        );
      }
      const { video } = item;
      const thumbnail = getThumbnail(video, 960);
      const duration = formatDuration(video.duration);
      return (
        <View style={styles.videoCard}>
          <Pressable
            onPress={() => handleVideoPress(video)}
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
              <ThemedText style={styles.title} numberOfLines={2}>{video.name}</ThemedText>
              {formatUploadDate(video.created_time) ? (
                <ThemedText style={[styles.meta, { color: subtextColor }]}>
                  {formatUploadDate(video.created_time)}
                </ThemedText>
              ) : null}
            </View>
          </Pressable>
        </View>
      );
    },
    [subtextColor, handleYouTubePress, handleVideoPress]
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
    <View style={[styles.container, { backgroundColor: CONTENT_BG }]}>
      <TabHeader title="Videos" />
      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggleBtn, viewMode === 'latest' && styles.toggleBtnActive]}
          onPress={() => setViewMode('latest')}
        >
          <ThemedText style={[styles.toggleText, viewMode === 'latest' && styles.toggleTextActive]}>
            Latest
          </ThemedText>
        </Pressable>
        <Pressable
          style={[styles.toggleBtn, viewMode === 'teachers' && styles.toggleBtnActive]}
          onPress={() => setViewMode('teachers')}
        >
          <ThemedText style={[styles.toggleText, viewMode === 'teachers' && styles.toggleTextActive]}>
            Teachers
          </ThemedText>
        </Pressable>
      </View>

      {viewMode === 'latest' ? (
        <FlatList
          ref={listRef}
          data={latestList}
          keyExtractor={(item) =>
            item.type === 'youtube' ? item.entry.youtubeId : getVideoId(item.video)
          }
          renderItem={renderLatestItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: 12, paddingBottom: insets.bottom + 90 },
          ]}
          ListEmptyComponent={
            <ThemedText style={[styles.headerSubtitle, { color: subtextColor }]}>
              No videos yet.
            </ThemedText>
          }
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: 12, paddingBottom: insets.bottom + 90 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {TEACHER_KEYS.map((key) => {
            const profile = teachers[key];
            const teacherVideos = vimeoByTeacher[key] ?? [];
            const thumbIndex = Math.min(
              profile.thumbnailFromVimeoIndex ?? 0,
              Math.max(0, teacherVideos.length - 1)
            );
            const thumbnailUri =
              teacherVideos.length > 0
                ? getThumbnail(teacherVideos[thumbIndex], 400)
                : null;
            return (
              <Pressable
                key={key}
                style={({ pressed }) => [styles.teacherCard, pressed && { opacity: 0.9 }]}
                onPress={() => router.push(`/videos/teacher/${key}`)}
              >
                <View style={styles.teacherRow}>
                  <View style={styles.teacherThumbWrap}>
                    {thumbnailUri ? (
                      <Image
                        source={{ uri: thumbnailUri }}
                        style={[styles.teacherThumb, styles.teacherThumbZoom]}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={[styles.teacherThumb, styles.teacherThumbPlaceholder]}>
                        <Ionicons name="person" size={40} color="#999" />
                      </View>
                    )}
                  </View>
                  <View style={styles.teacherInfo}>
                    <ThemedText style={styles.teacherName}>{profile.name}</ThemedText>
                    <View style={styles.socialsRow}>
                      {profile.instagram && (
                        <Pressable
                          style={styles.socialBtn}
                          onPress={(e) => { e.stopPropagation(); openLink(profile.instagram!); }}
                        >
                          <Ionicons name="logo-instagram" size={22} color="#E4405F" />
                        </Pressable>
                      )}
                      {profile.youtube && (
                        <Pressable
                          style={styles.socialBtn}
                          onPress={(e) => { e.stopPropagation(); openLink(profile.youtube!); }}
                        >
                          <Ionicons name="logo-youtube" size={22} color="#FF0000" />
                        </Pressable>
                      )}
                      {profile.tiktok && (
                        <Pressable
                          style={styles.socialBtn}
                          onPress={(e) => { e.stopPropagation(); openLink(profile.tiktok!); }}
                        >
                          <Ionicons name="logo-tiktok" size={22} color="#000" />
                        </Pressable>
                      )}
                      {profile.spotify && (
                        <Pressable
                          style={styles.socialBtn}
                          onPress={(e) => { e.stopPropagation(); openLink(profile.spotify!); }}
                        >
                          <Ionicons name="musical-notes" size={22} color="#1DB954" />
                        </Pressable>
                      )}
                    </View>
                    <ThemedText
                      style={[styles.teacherBio, { color: subtextColor }]}
                      numberOfLines={3}
                    >
                      {profile.bio}
                    </ThemedText>
                    <View style={styles.teacherVideosRow}>
                      <ThemedText style={styles.teacherVideosCount}>
                        {teacherVideos.length + (profile.youtubeVideos?.length ?? 0)} video{(teacherVideos.length + (profile.youtubeVideos?.length ?? 0)) === 1 ? '' : 's'}
                      </ThemedText>
                      <Ionicons name="chevron-forward" size={20} color="#194F89" />
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: { marginTop: 16, fontSize: 16, opacity: 0.7 },
  errorTitle: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  errorDetail: { fontSize: 14, opacity: 0.6, textAlign: 'center', marginBottom: 24 },
  retryButton: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#194F89', borderRadius: 8 },
  retryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  toggleRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    gap: 8,
    backgroundColor: '#F0F4F8',
  },
  toggleBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  toggleBtnActive: { backgroundColor: '#194F89' },
  toggleText: { fontSize: 15, fontWeight: '600', color: '#333' },
  toggleTextActive: { color: '#fff' },
  scroll: { flex: 1 },
  listContent: { paddingHorizontal: 16, backgroundColor: '#F0F4F8' },
  headerSubtitle: { fontSize: 15, marginBottom: 16 },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 0,
  },
  listThumbWrap: {
    width: LIST_THUMB_WIDTH,
    height: LIST_THUMB_HEIGHT,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  listThumb: { width: '100%', height: '100%' },
  vimeoThumbZoom: {
    position: 'absolute',
    width: LIST_THUMB_WIDTH * 2.4,
    height: LIST_THUMB_HEIGHT * 2.4,
    left: (LIST_THUMB_WIDTH - LIST_THUMB_WIDTH * 2.4) / 2,
    top: (LIST_THUMB_HEIGHT - LIST_THUMB_HEIGHT * 2.4) / 2,
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
  durationText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  info: { flex: 1, marginLeft: 14, paddingTop: 2 },
  title: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
  meta: { fontSize: 13, marginTop: 4 },

  teacherCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  teacherRow: { flexDirection: 'row', alignItems: 'flex-start' },
  teacherThumbWrap: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  teacherThumb: { width: '100%', height: '100%' },
  /** Zoom so Vimeo letterboxing is cropped (same idea as list thumbnails) */
  teacherThumbZoom: {
    position: 'absolute',
    width: 80 * 2.4,
    height: 80 * 2.4,
    left: (80 - 80 * 2.4) / 2,
    top: (80 - 80 * 2.4) / 2,
  },
  teacherThumbPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  teacherInfo: { flex: 1, marginLeft: 14 },
  teacherName: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  socialsRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  socialBtn: { padding: 2 },
  teacherBio: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  teacherVideosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  teacherVideosCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#194F89',
  },
});
