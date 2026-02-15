import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { BodyFont, ButtonFont, HeadingFont } from '@/constants/theme';
import { TabHeader } from '@/components/tab-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { teachers, getTeacherByKey, type TeacherKey, type TeacherYouTubeVideo } from '@/data/teachers';
import { getYouTubeProxyEmbedUrl, getYouTubeThumbnail } from '@/services/youtube-gist';
import {
  fetchProjectVideos,
  formatDuration,
  getEmbedUrl,
  getThumbnail,
  getVideoId,
  groupVimeoVideosByTeacher,
  type VimeoVideo,
} from '@/services/vimeo';

const LIST_THUMB_WIDTH = 160;
const LIST_THUMB_HEIGHT = 120;

type TeacherVideoItem = { type: 'vimeo'; video: VimeoVideo } | { type: 'youtube'; entry: TeacherYouTubeVideo };

export default function TeacherDetailScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const subtextColor = useThemeColor({ light: '#687076', dark: '#9BA1A6' }, 'icon');

  const profile = useMemo(() => getTeacherByKey(key ?? ''), [key]);
  const [vimeoVideos, setVimeoVideos] = useState<VimeoVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    fetchProjectVideos(1, 100).then((res) => {
      if (cancelled) return;
      const byTeacher = groupVimeoVideosByTeacher(res.data);
      setVimeoVideos(byTeacher[key] ?? []);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [key]);

  const videoList = useMemo((): TeacherVideoItem[] => {
    const list: TeacherVideoItem[] = [];
    vimeoVideos.forEach((video) => list.push({ type: 'vimeo', video }));
    (profile?.youtubeVideos ?? []).forEach((entry) => list.push({ type: 'youtube', entry }));
    return list;
  }, [vimeoVideos, profile?.youtubeVideos]);

  const openLink = useCallback((url: string) => {
    Linking.openURL(url);
  }, []);

  const handlePressVimeo = useCallback(
    (video: VimeoVideo) => {
      router.push({
        pathname: '/video/[id]',
        params: {
          id: getVideoId(video),
          title: video.name,
          embedUrl: getEmbedUrl(video),
          isPortrait: video.height > video.width ? '1' : '0',
        },
      });
    },
    [router]
  );

  const handlePressYouTube = useCallback(
    (entry: TeacherYouTubeVideo) => {
      router.push({
        pathname: '/video/[id]',
        params: {
          id: entry.youtubeId,
          title: entry.name,
          embedUrl: getYouTubeProxyEmbedUrl(entry.youtubeId),
          isPortrait: '0',
          source: 'youtube',
        },
      });
    },
    [router]
  );

  if (!profile) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.errorTitle}>Teacher not found</ThemedText>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ThemedText style={styles.backBtnText}>Go back</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <TabHeader
        title={profile.name}
        left={
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </Pressable>
        }
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <ThemedText style={styles.profileName}>{profile.name}</ThemedText>
          <View style={styles.socialsRow}>
            {profile.instagram && (
              <Pressable style={styles.socialBtn} onPress={() => openLink(profile.instagram!)}>
                <Ionicons name="logo-instagram" size={26} color="#E4405F" />
              </Pressable>
            )}
            {profile.youtube && (
              <Pressable style={styles.socialBtn} onPress={() => openLink(profile.youtube!)}>
                <Ionicons name="logo-youtube" size={26} color="#FF0000" />
              </Pressable>
            )}
            {profile.tiktok && (
              <Pressable style={styles.socialBtn} onPress={() => openLink(profile.tiktok!)}>
                <Ionicons name="logo-tiktok" size={26} color="#000" />
              </Pressable>
            )}
            {profile.spotify && (
              <Pressable style={styles.socialBtn} onPress={() => openLink(profile.spotify!)}>
                <Ionicons name="musical-notes" size={26} color="#1DB954" />
              </Pressable>
            )}
          </View>
          <ThemedText style={[styles.bio, { color: subtextColor }]}>{profile.bio}</ThemedText>
        </View>

        <ThemedText style={[styles.sectionTitle, { color: subtextColor }]}>Videos</ThemedText>
        {loading ? (
          <ActivityIndicator size="small" style={styles.loader} />
        ) : videoList.length === 0 ? (
          <ThemedText style={[styles.empty, { color: subtextColor }]}>No videos yet.</ThemedText>
        ) : (
          videoList.map((item) => {
            if (item.type === 'vimeo') {
              const video = item.video;
              const thumb = getThumbnail(video, 960);
              const duration = formatDuration(video.duration);
              return (
                <Pressable
                  key={video.uri}
                  style={({ pressed }) => [styles.videoCard, pressed && { opacity: 0.7 }]}
                  onPress={() => handlePressVimeo(video)}
                >
                  <View style={styles.listThumbWrap}>
                    <Image
                      source={{ uri: thumb }}
                      style={[styles.listThumb, styles.vimeoThumbZoom]}
                      contentFit="cover"
                    />
                    <View style={styles.durationBadge}>
                      <ThemedText style={styles.durationText}>{duration}</ThemedText>
                    </View>
                  </View>
                  <View style={styles.info}>
                    <ThemedText style={styles.title} numberOfLines={2}>{video.name}</ThemedText>
                    <ThemedText style={[styles.meta, { color: subtextColor }]}>
                      {video.stats.plays} {video.stats.plays === 1 ? 'view' : 'views'}
                    </ThemedText>
                  </View>
                </Pressable>
              );
            }
            const entry = item.entry;
            return (
              <Pressable
                key={entry.id}
                style={({ pressed }) => [styles.videoCard, pressed && { opacity: 0.7 }]}
                onPress={() => handlePressYouTube(entry)}
              >
                <View style={styles.listThumbWrap}>
                  <Image
                    source={{ uri: getYouTubeThumbnail(entry.youtubeId) }}
                    style={styles.listThumb}
                    contentFit="cover"
                  />
                </View>
                <View style={styles.info}>
                  <ThemedText style={styles.title} numberOfLines={2}>{entry.name}</ThemedText>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  errorTitle: { fontSize: 18, fontFamily: HeadingFont, marginBottom: 16 },
  backBtn: { paddingVertical: 12, paddingHorizontal: 24, backgroundColor: '#194F89', borderRadius: 8 },
  backBtnText: { color: '#fff', fontWeight: '600', fontFamily: ButtonFont },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  profileName: { fontSize: 22, fontFamily: HeadingFont, marginBottom: 10 },
  socialsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  socialBtn: { padding: 4 },
  bio: { fontSize: 15, lineHeight: 22, fontFamily: BodyFont },
  sectionTitle: { fontSize: 17, fontFamily: HeadingFont, marginBottom: 12 },
  loader: { marginVertical: 24 },
  empty: { fontSize: 15, marginBottom: 16, fontFamily: BodyFont },
  videoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
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
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  durationText: { color: '#fff', fontSize: 11, fontWeight: '600', fontFamily: BodyFont },
  info: { flex: 1, marginLeft: 14 },
  title: { fontSize: 16, lineHeight: 22, fontFamily: ButtonFont },
  meta: { fontSize: 13, marginTop: 4, fontFamily: BodyFont },
});
