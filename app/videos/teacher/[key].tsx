import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PremiumCrown } from "@/components/PremiumCrown";
import { TabHeader } from "@/components/tab-header";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { usePaywall } from "@/context/PaywallContext";
import { BodyFont, ButtonFont, ContentBg, HeadingFont } from "@/constants/theme";
import {
  getTeacherByKey,
  PREMIUM_TEACHER_KEYS,
  type TeacherYouTubeVideo
} from "@/data/teachers";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  fetchProjectVideos,
  formatDuration,
  getEmbedUrl,
  getTeacherBioFromVideos,
  getTeacherSocialLinksFromVideos,
  getThumbnail,
  getVideoId,
  formatTeacherKeyAsName,
  groupVimeoVideosByTeacher,
  type VimeoVideo,
} from "@/services/vimeo";
import {
  fetchAussieYouTubeVideos,
  getTeacherProfileFromGistVideos,
  getYouTubeProxyEmbedUrl,
  getYouTubeThumbnail,
} from "@/services/youtube-gist";
import { getSortableTimestamp, isDateToday } from "@/utils/date";

function formatUploadDate(dateStr: string | undefined): string {
  if (!dateStr || !dateStr.trim()) return "";
  const d = new Date(dateStr);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  }
  const trimmed = dateStr.trim();
  if (/\d/.test(trimmed) && trimmed.length >= 4) return trimmed;
  return "";
}

const LIST_THUMB_WIDTH = 160;
const LIST_THUMB_HEIGHT = 120;

type TeacherVideoItem =
  | { type: "vimeo"; video: VimeoVideo; sortKey: number }
  | { type: "youtube"; entry: TeacherYouTubeVideo; sortKey: number };

export default function TeacherDetailScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const subtextColor = useThemeColor(
    { light: "#687076", dark: "#9BA1A6" },
    "icon",
  );

  const [vimeoVideos, setVimeoVideos] = useState<VimeoVideo[]>([]);
  const [gistYouTubeVideos, setGistYouTubeVideos] = useState<
    Awaited<ReturnType<typeof fetchAussieYouTubeVideos>>
  >([]);
  const [loading, setLoading] = useState(true);

  const profile = useMemo(() => {
    const staticProfile = getTeacherByKey(key ?? "");
    if (staticProfile) return staticProfile;
    if (vimeoVideos.length > 0) {
      const socials = getTeacherSocialLinksFromVideos(vimeoVideos);
      return {
        key: key ?? "",
        name: formatTeacherKeyAsName(key ?? ""),
        bio: getTeacherBioFromVideos(vimeoVideos) ?? "",
        youtubeVideos: [] as TeacherYouTubeVideo[],
        ...socials,
      };
    }
    const gistProfile = getTeacherProfileFromGistVideos(gistYouTubeVideos ?? [], key ?? "");
    if (gistProfile) {
      return {
        key: key ?? "",
        ...gistProfile,
        youtubeVideos: [] as TeacherYouTubeVideo[],
      };
    }
    return undefined;
  }, [key, vimeoVideos, gistYouTubeVideos]);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    Promise.all([
      fetchProjectVideos(1, 100),
      fetchAussieYouTubeVideos(),
    ])
      .then(([vimeoRes, gistVideos]) => {
        if (cancelled) return;
        const byTeacher = groupVimeoVideosByTeacher(vimeoRes.data);
        setVimeoVideos(byTeacher[key] ?? []);
        setGistYouTubeVideos(gistVideos);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const videoList = useMemo((): TeacherVideoItem[] => {
    const list: TeacherVideoItem[] = [];
    vimeoVideos.forEach((video) =>
      list.push({ type: "vimeo", video, sortKey: getSortableTimestamp(video.created_time) })
    );
    (profile?.youtubeVideos ?? []).forEach((entry) =>
      list.push({ type: "youtube", entry, sortKey: 0 })
    );
    (gistYouTubeVideos ?? [])
      .filter((e) => e.teacher === key)
      .forEach((e) =>
        list.push({
          type: "youtube",
          entry: {
            id: `gist-${e.youtubeId}`,
            type: "youtube",
            youtubeId: e.youtubeId,
            name: e.title,
            date: e.date,
          },
          sortKey: getSortableTimestamp(e.date),
        })
      );
    list.sort((a, b) => b.sortKey - a.sortKey);
    return list;
  }, [vimeoVideos, profile?.youtubeVideos, gistYouTubeVideos, key]);

  const { openPaywall, isPremium } = usePaywall();
  const openLink = useCallback((url: string) => {
    Linking.openURL(url);
  }, []);

  const handlePressVimeo = useCallback(
    (video: VimeoVideo) => {
      router.push({
        pathname: "/video/[id]",
        params: {
          id: getVideoId(video),
          title: video.name,
          embedUrl: getEmbedUrl(video),
          isPortrait: video.height > video.width ? "1" : "0",
        },
      });
    },
    [router],
  );

  const handlePressYouTube = useCallback(
    (entry: TeacherYouTubeVideo) => {
      router.push({
        pathname: "/video/[id]",
        params: {
          id: entry.youtubeId,
          title: entry.name,
          embedUrl: getYouTubeProxyEmbedUrl(entry.youtubeId),
          isPortrait: "0",
          source: "youtube",
        },
      });
    },
    [router],
  );

  if (!profile && !loading) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.errorTitle}>Teacher not found</ThemedText>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ThemedText style={styles.backBtnText}>Go back</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (!profile && loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color="#194F89" />
      </ThemedView>
    );
  }

  if (!profile) return null;

  return (
    <ThemedView style={[styles.container, { backgroundColor: ContentBg }]}>
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
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <ThemedText style={styles.profileName}>{profile.name}</ThemedText>
          {(profile.instagram || profile.youtube || profile.tiktok || profile.spotify) && (
          <View style={styles.socialsRow}>
            {profile.instagram && (
              <Pressable
                style={styles.socialBtn}
                onPress={() => openLink(profile.instagram!)}
              >
                <Ionicons name="logo-instagram" size={26} color="#E4405F" />
              </Pressable>
            )}
            {profile.youtube && (
              <Pressable
                style={styles.socialBtn}
                onPress={() => openLink(profile.youtube!)}
              >
                <Ionicons name="logo-youtube" size={26} color="#FF0000" />
              </Pressable>
            )}
            {profile.tiktok && (
              <Pressable
                style={styles.socialBtn}
                onPress={() => openLink(profile.tiktok!)}
              >
                <Ionicons name="logo-tiktok" size={26} color="#000" />
              </Pressable>
            )}
            {profile.spotify && (
              <Pressable
                style={styles.socialBtn}
                onPress={() => openLink(profile.spotify!)}
              >
                <Ionicons name="musical-notes" size={26} color="#1DB954" />
              </Pressable>
            )}
          </View>
          )}
          <ThemedText style={[styles.bio, { color: subtextColor }]}>
            {profile.bio}
          </ThemedText>
        </View>

        <ThemedText style={[styles.sectionTitle, { color: subtextColor }]}>
          Videos
        </ThemedText>
        {loading ? (
          <ActivityIndicator size="small" style={styles.loader} />
        ) : videoList.length === 0 ? (
          <ThemedText style={[styles.empty, { color: subtextColor }]}>
            No videos yet.
          </ThemedText>
        ) : (
          videoList.map((item) => {
            if (item.type === "vimeo") {
              const video = item.video;
              const thumb = getThumbnail(video, 960);
              const duration = formatDuration(video.duration);
              const isPremiumTeacher =
                key != null && PREMIUM_TEACHER_KEYS.includes(key);
              const showLock = isPremiumTeacher && !isPremium;
              return (
                <Pressable
                  key={video.uri}
                  style={({ pressed }) => [
                    styles.videoCard,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() =>
                    showLock ? openPaywall() : handlePressVimeo(video)
                  }
                >
                  <View style={styles.listThumbWrap}>
                    <Image
                      source={{ uri: thumb }}
                      style={[styles.listThumb, styles.vimeoThumbZoom]}
                      contentFit="cover"
                    />
                    <View style={styles.durationBadge}>
                      <ThemedText style={styles.durationText}>
                        {duration}
                      </ThemedText>
                    </View>
                    {showLock && (
                      <View style={styles.premiumLockOverlay}>
                        <Ionicons
                          name="lock-closed"
                          size={72}
                          color="rgba(0,0,0,0.6)"
                        />
                      </View>
                    )}
                  </View>
                  <View style={styles.info}>
                    <View style={styles.titleRow}>
                      <ThemedText style={styles.title} numberOfLines={2}>
                        {video.name}
                      </ThemedText>
                      {isDateToday(video.created_time) && (
                        <View style={styles.addedTodayBadge}>
                          <ThemedText style={styles.addedTodayText}>Added today!</ThemedText>
                        </View>
                      )}
                    </View>
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
              );
            }
            const entry = item.entry;
            return (
              <Pressable
                key={entry.id}
                style={({ pressed }) => [
                  styles.videoCard,
                  pressed && { opacity: 0.7 },
                ]}
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
                  <View style={styles.titleRow}>
                    <ThemedText style={styles.title} numberOfLines={2}>
                      {entry.name}
                    </ThemedText>
                    {isDateToday(entry.date) && (
                      <View style={styles.addedTodayBadge}>
                        <ThemedText style={styles.addedTodayText}>Added today!</ThemedText>
                      </View>
                    )}
                  </View>
                  {formatUploadDate(entry.date) ? (
                    <ThemedText style={[styles.meta, { color: subtextColor }]}>
                      {formatUploadDate(entry.date)}
                    </ThemedText>
                  ) : null}
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  scroll: { flex: 1, backgroundColor: ContentBg },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, backgroundColor: ContentBg },
  errorTitle: { fontSize: 18, fontFamily: HeadingFont, marginBottom: 16 },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#194F89",
    borderRadius: 8,
  },
  backBtnText: { color: "#fff", fontWeight: "600", fontFamily: ButtonFont },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  profileName: { fontSize: 22, fontFamily: HeadingFont, marginBottom: 10 },
  socialsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  socialBtn: { padding: 4 },
  bio: { fontSize: 15, lineHeight: 22, fontFamily: BodyFont },
  sectionTitle: { fontSize: 17, fontFamily: HeadingFont, marginBottom: 12 },
  loader: { marginVertical: 24 },
  empty: { fontSize: 15, marginBottom: 16, fontFamily: BodyFont },
  videoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  listThumbWrap: {
    width: LIST_THUMB_WIDTH,
    height: LIST_THUMB_HEIGHT,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },
  listThumb: { width: "100%", height: "100%" },
  vimeoThumbZoom: {
    position: "absolute",
    width: LIST_THUMB_WIDTH * 2.4,
    height: LIST_THUMB_HEIGHT * 2.4,
    left: (LIST_THUMB_WIDTH - LIST_THUMB_WIDTH * 2.4) / 2,
    top: (LIST_THUMB_HEIGHT - LIST_THUMB_HEIGHT * 2.4) / 2,
  },
  durationBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  durationText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    fontFamily: BodyFont,
  },
  premiumLockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  info: { flex: 1, marginLeft: 14 },
  titleRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  title: { fontSize: 16, lineHeight: 22, fontFamily: ButtonFont, flex: 1, minWidth: 0 },
  addedTodayBadge: {
    backgroundColor: "#194F89",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  addedTodayText: { color: "#fff", fontSize: 11, fontWeight: "600", fontFamily: ButtonFont },
  meta: { fontSize: 13, marginTop: 4, fontFamily: BodyFont },
  premiumCrownBadge: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#194F89",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
});
