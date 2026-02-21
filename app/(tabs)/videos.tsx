import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { BodyFont, ButtonFont, ContentBg, HeadingFont, mainAussieBlue } from '@/constants/theme';
import { TabHeader } from '@/components/tab-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  fetchAussieYouTubeVideos,
  getTeacherProfileFromGistVideos,
  getYouTubeProxyEmbedUrl,
  getYouTubeThumbnail,
  type YouTubeVideoEntry,
} from '@/services/youtube-gist';
import {
  fetchProjectVideos,
  formatDuration,
  getEmbedUrl,
  getTeacherBioFromVideos,
  getTeacherKeyFromVideo,
  getTeacherSocialLinksFromVideos,
  getThumbnail,
  getVideoId,
  formatTeacherKeyAsName,
  groupVimeoVideosByTeacher,
  type VimeoVideo,
} from '@/services/vimeo';
import { PremiumCrown } from '@/components/PremiumCrown';
import { usePaywall } from '@/context/PaywallContext';
import { teachers, TEACHER_KEYS, PREMIUM_TEACHER_KEYS } from '@/data/teachers';
import { getSortableTimestamp } from '@/utils/date';

const LIST_THUMB_WIDTH = 160;
const LIST_THUMB_HEIGHT = 120;

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
  const skeletonOpacity = useRef(new Animated.Value(0.5)).current;

  const subtextColor = useThemeColor({ light: '#687076', dark: '#9BA1A6' }, 'icon');

  useEffect(() => {
    if (!loading) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(skeletonOpacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [loading, skeletonOpacity]);

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

  const { openPaywall, isPremium } = usePaywall();
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
      const teacherKey = getTeacherKeyFromVideo(video);
      const isPremiumVideo = teacherKey != null && PREMIUM_TEACHER_KEYS.includes(teacherKey);
      const showLock = isPremiumVideo && !isPremium;
      return (
        <View style={styles.videoCard}>
          <Pressable
            onPress={() => (showLock ? openPaywall() : handleVideoPress(video))}
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
              {showLock && (
                <View style={styles.premiumLockOverlay}>
                  <Ionicons name="lock-closed" size={72} color="rgba(0,0,0,0.6)" />
                </View>
              )}
            </View>
            <View style={styles.info}>
              <ThemedText style={styles.title} numberOfLines={2}>{video.name}</ThemedText>
              {formatUploadDate(video.created_time) ? (
                <ThemedText style={[styles.meta, { color: subtextColor }]}>
                  {formatUploadDate(video.created_time)}
                </ThemedText>
              ) : null}
              {showLock && (
                <View style={styles.premiumCrownBadge}>
                  <PremiumCrown size={22} />
                </View>
              )}
            </View>
          </Pressable>
        </View>
      );
    },
    [subtextColor, handleYouTubePress, handleVideoPress, openPaywall, isPremium]
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: ContentBg }]}>
        <TabHeader title="Videos" />
        <View style={styles.loadingContent}>
          {[1, 2, 3, 4].map((i) => (
            <Animated.View
              key={i}
              style={[styles.skeletonCard, { opacity: skeletonOpacity }]}
            >
              <View style={styles.skeletonThumb} />
              <View style={styles.skeletonInfo}>
                <View style={[styles.skeletonLine, styles.skeletonTitle]} />
                <View style={[styles.skeletonLine, styles.skeletonMeta]} />
              </View>
            </Animated.View>
          ))}
          <View style={styles.loadingFooter}>
            <ActivityIndicator size="small" color={mainAussieBlue} />
            <ThemedText style={styles.loadingText}>Loading videos...</ThemedText>
          </View>
        </View>
      </View>
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
    <View style={[styles.container, { backgroundColor: ContentBg }]}>
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
            { paddingTop: 12, paddingBottom: insets.bottom + 30 },
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
            { paddingTop: 12, paddingBottom: insets.bottom + 30 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {(() => {
            const staticKeys = TEACHER_KEYS.filter((k) => {
              const v = vimeoByTeacher[k] ?? [];
              const yt = teachers[k]?.youtubeVideos?.length ?? 0;
              const gistForTeacher = (youtubeVideos ?? []).filter((e) => e.teacher === k);
              return v.length > 0 || yt > 0 || gistForTeacher.length > 0;
            });
            const dynamicFromVimeo = Object.keys(vimeoByTeacher).filter(
              (k) => !TEACHER_KEYS.includes(k as (typeof TEACHER_KEYS)[number])
            );
            const dynamicFromGist = [
              ...new Set((youtubeVideos ?? []).map((v) => v.teacher).filter((t): t is string => !!t)),
            ].filter((k) => !TEACHER_KEYS.includes(k as (typeof TEACHER_KEYS)[number]) && !dynamicFromVimeo.includes(k));
            const allKeys = [...staticKeys, ...dynamicFromVimeo, ...dynamicFromGist];
            return allKeys.map((key) => {
              const teacherVideos = vimeoByTeacher[key] ?? [];
              const gistForTeacher = (youtubeVideos ?? []).filter((e) => e.teacher === key);
              const profile =
                teachers[key as (typeof TEACHER_KEYS)[number]] ??
                (teacherVideos.length > 0
                  ? {
                      name: formatTeacherKeyAsName(key),
                      bio: getTeacherBioFromVideos(teacherVideos) ?? '',
                      youtubeVideos: [],
                      ...getTeacherSocialLinksFromVideos(teacherVideos),
                    }
                  : getTeacherProfileFromGistVideos(youtubeVideos ?? [], key)
                    ? { ...getTeacherProfileFromGistVideos(youtubeVideos ?? [], key)!, youtubeVideos: [] }
                    : null);
              if (!profile) return null;
              const staticYtCount = profile.youtubeVideos?.length ?? 0;
              const hasVideos = teacherVideos.length > 0 || staticYtCount > 0 || gistForTeacher.length > 0;
              if (!hasVideos) return null;

              const thumbIndex = Math.min(
                profile.thumbnailFromVimeoIndex ?? 0,
                Math.max(0, teacherVideos.length - 1)
              );
              const thumbnailUri =
                teacherVideos.length > 0
                  ? getThumbnail(teacherVideos[thumbIndex], 400)
                  : gistForTeacher.length > 0
                    ? getYouTubeThumbnail(gistForTeacher[0].youtubeId)
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
                    {(profile.instagram || profile.youtube || profile.tiktok || profile.spotify) && (
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
                    )}
                    <ThemedText
                      style={[styles.teacherBio, { color: subtextColor }]}
                      numberOfLines={3}
                    >
                      {profile.bio}
                    </ThemedText>
                    <View style={styles.teacherVideosRow}>
                      <ThemedText style={styles.teacherVideosCount}>
                        {teacherVideos.length + (profile.youtubeVideos?.length ?? 0) + gistForTeacher.length} video{(teacherVideos.length + (profile.youtubeVideos?.length ?? 0) + gistForTeacher.length) === 1 ? '' : 's'}
                      </ThemedText>
                      <Ionicons name="chevron-forward" size={20} color="#194F89" />
                    </View>
                  </View>
                </View>
              </Pressable>
            );
            });
          })()}
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
  loadingContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },
  skeletonThumb: {
    width: LIST_THUMB_WIDTH,
    height: LIST_THUMB_HEIGHT,
    borderRadius: 10,
    backgroundColor: '#e8e8e8',
  },
  skeletonInfo: { flex: 1, marginLeft: 14, paddingTop: 2 },
  skeletonLine: {
    height: 14,
    borderRadius: 6,
    backgroundColor: '#e8e8e8',
  },
  skeletonTitle: { width: '85%', marginBottom: 8 },
  skeletonMeta: { width: '40%' },
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 24,
  },
  loadingText: { fontSize: 15, opacity: 0.7, fontFamily: BodyFont, color: '#687076' },
  errorTitle: { fontSize: 20, fontFamily: HeadingFont, marginBottom: 8 },
  errorDetail: { fontSize: 14, opacity: 0.6, textAlign: 'center', marginBottom: 24, fontFamily: BodyFont },
  retryButton: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#194F89', borderRadius: 8 },
  retryText: { color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: ButtonFont },
  toggleRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    gap: 8,
    backgroundColor: ContentBg,
  },
  toggleBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  toggleBtnActive: { backgroundColor: '#194F89' },
  toggleText: { fontSize: 15, fontWeight: '600', color: '#333', fontFamily: ButtonFont },
  toggleTextActive: { color: '#fff' },
  scroll: { flex: 1 },
  listContent: { paddingHorizontal: 16, backgroundColor: ContentBg },
  headerSubtitle: { fontSize: 15, marginBottom: 16, fontFamily: BodyFont },
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
  durationText: { color: '#fff', fontSize: 11, fontWeight: '600', fontFamily: BodyFont },
  premiumLockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { flex: 1, marginLeft: 14, paddingTop: 2 },
  title: { fontSize: 16, lineHeight: 22, fontFamily: ButtonFont },
  meta: { fontSize: 13, marginTop: 4, fontFamily: BodyFont },
  premiumCrownBadge: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#194F89',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

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
  teacherName: { fontSize: 18, fontFamily: HeadingFont, marginBottom: 6 },
  socialsRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  socialBtn: { padding: 2 },
  teacherBio: { fontSize: 14, lineHeight: 20, marginBottom: 8, fontFamily: BodyFont },
  teacherVideosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  teacherVideosCount: {
    fontSize: 14,
    color: '#11181C',
    fontFamily: ButtonFont,
  },
});
