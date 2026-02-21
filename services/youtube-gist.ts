/**
 * Fetches Aussie Slang YouTube video list.
 * Primary: data/youtube-videos.json via raw GitHub (edit locally, push to update).
 * Fallback: Gist (when repo file not yet pushed).
 * @see https://github.com/colmmcsharry/aussie-react-native/blob/main/data/youtube-videos.json
 */

const REPO_RAW_URL =
  'https://raw.githubusercontent.com/colmmcsharry/aussie-react-native/main/data/youtube-videos.json';
const GIST_RAW_URL =
  'https://gist.githubusercontent.com/colmmcsharry/1aef7754495a1c64e31a16e50ebc6e5d/raw/aussie-youtube.json';

export interface YouTubeVideoEntry {
  title: string;
  description?: string;
  youtubeId: string;
  channelName?: string;
  channelLink?: string;
  category: string;
  date?: string;
  /** Teacher key (e.g. "amanda") to show in that teacher's video section. */
  teacher?: string;
}

export interface YouTubeGistResponse {
  videos: YouTubeVideoEntry[];
}

interface TeacherVideoItem {
  youtubeId: string;
  title: string;
  date?: string;
  /** Override computed release date when drip-feeding. */
  releaseDate?: string;
}

interface TeacherConfig {
  channelName?: string;
  channelLink?: string;
  description?: string;
  /** First video releases on this date. Used with intervalDays for drip-feed. */
  startDate?: string;
  /** Days between releases. Videos get releaseDate = startDate + (index * intervalDays). */
  intervalDays?: number;
  videos: TeacherVideoItem[];
}

interface StandaloneVideoItem {
  youtubeId: string;
  title: string;
  date?: string;
  releaseDate?: string;
  channelName?: string;
  channelLink?: string;
  description?: string;
}

interface TeachersFormatResponse {
  teachers: Record<string, TeacherConfig>;
  /** Standalone videos (no teacher card). Only appear in Latest. */
  standaloneVideos?: StandaloneVideoItem[];
  /** Global drip-feed: first video in list = newest date, last = oldest. New videos (appended) appear at top of Latest. */
  startDate?: string;
  intervalDays?: number;
}

function flattenTeachersFormat(data: TeachersFormatResponse): YouTubeVideoEntry[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  const startDate = data.startDate ?? '2026-01-01';
  const intervalDays = data.intervalDays ?? 2;

  type Pending = {
    item: TeacherVideoItem | StandaloneVideoItem;
    teacherKey?: string;
    channelName?: string;
    channelLink?: string;
    description?: string;
  };

  const pending: Pending[] = [];
  for (const [teacherKey, config] of Object.entries(data.teachers ?? {})) {
    for (const item of config?.videos ?? []) {
      pending.push({
        item,
        teacherKey,
        channelName: config.channelName,
        channelLink: config.channelLink,
        description: config.description,
      });
    }
  }
  for (const item of data.standaloneVideos ?? []) {
    pending.push({ item, channelName: item.channelName, channelLink: item.channelLink, description: item.description });
  }

  const total = pending.length;
  const result: YouTubeVideoEntry[] = [];

  pending.forEach((p, globalIndex) => {
    const item = p.item;
    const releaseDateStr = item.releaseDate ?? item.date ?? (() => {
      const dateIndex = total - 1 - globalIndex;
      const d = new Date(startDate);
      if (Number.isNaN(d.getTime())) return undefined;
      d.setDate(d.getDate() + dateIndex * intervalDays);
      return d.toISOString().slice(0, 10);
    })();

    if (releaseDateStr) {
      const d = new Date(releaseDateStr);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() > todayTime) return;
    }

    result.push({
      title: item.title,
      youtubeId: item.youtubeId,
      date: item.date ?? releaseDateStr,
      channelName: p.channelName,
      channelLink: p.channelLink,
      description: p.description,
      category: 'aussieslang',
      teacher: p.teacherKey,
    });
  });

  return result;
}

export async function fetchAussieYouTubeVideos(): Promise<YouTubeVideoEntry[]> {
  try {
    const res = await fetch(REPO_RAW_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.teachers != null) {
      return flattenTeachersFormat(data as TeachersFormatResponse);
    }
    if (Array.isArray(data.videos)) {
      return data.videos as YouTubeVideoEntry[];
    }
    return [];
  } catch {
    const res = await fetch(GIST_RAW_URL);
    if (!res.ok) {
      throw new Error(`Failed to fetch YouTube list: ${res.status}`);
    }
    const data: YouTubeGistResponse = await res.json();
    return data.videos ?? [];
  }
}

/** Get teacher profile from Gist videos (for teachers with only YouTube, no Vimeo). */
export function getTeacherProfileFromGistVideos(
  videos: YouTubeVideoEntry[],
  teacherKey: string
): { name: string; bio: string; instagram?: string; youtube?: string; tiktok?: string } | null {
  const forTeacher = videos.filter((v) => v.teacher === teacherKey);
  if (forTeacher.length === 0) return null;
  const first = forTeacher.find((v) => v.description?.trim()) ?? forTeacher[0];
  const name = first.channelName?.trim() || teacherKey.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
  const desc = first.description?.trim() ?? '';
  const urlRegex = /^https?:\/\//i;
  const bioLines = desc.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !urlRegex.test(l));
  const bio = bioLines.length > 0 ? bioLines.join('\n') : '';
  const urlMatches = desc.match(/https?:\/\/[^\s]+/g) ?? [];
  const socials: { instagram?: string; youtube?: string; tiktok?: string } = {};
  for (const url of urlMatches) {
    const lower = url.toLowerCase();
    if (lower.includes('instagram.com') && !socials.instagram) socials.instagram = url;
    else if ((lower.includes('youtube.com') || lower.includes('youtu.be')) && !socials.youtube) socials.youtube = url;
    else if (lower.includes('tiktok.com') && !socials.tiktok) socials.tiktok = url;
  }
  if (!socials.youtube && first.channelLink?.trim()) {
    socials.youtube = first.channelLink.trim();
  }
  return { name, bio, ...socials };
}

/** YouTube thumbnail URL (medium quality). For Shorts use maxresdefault or hqdefault. */
export function getYouTubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
}

/** Direct YouTube embed URL (can trigger Error 153 in WebView on iOS). */
export function getYouTubeEmbedUrl(youtubeId: string): string {
  return `https://www.youtube.com/embed/${youtubeId}?playsinline=1`;
}

/**
 * Proxy embed URL to avoid YouTube Error 153 in WebView/Capacitor.
 * Loads a page on your domain that embeds YouTube (e.g. irishslang.ie/yt.html).
 * Use this in-app playback instead of getYouTubeEmbedUrl.
 */
const YT_PROXY_BASE = 'https://irishslang.ie/yt.html';
export function getYouTubeProxyEmbedUrl(youtubeId: string): string {
  const search = new URLSearchParams({ v: youtubeId });
  return `${YT_PROXY_BASE}?${search.toString()}`;
}
