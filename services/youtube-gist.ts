/**
 * Fetches Aussie Slang YouTube video list from the GitHub Gist.
 * @see https://gist.github.com/colmmcsharry/1aef7754495a1c64e31a16e50ebc6e5d
 */

const GIST_RAW_URL =
  'https://gist.githubusercontent.com/colmmcsharry/1aef7754495a1c64e31a16e50ebc6e5d/raw/aussie-youtube.json';

export interface YouTubeVideoEntry {
  title: string;
  description?: string;
  youtubeId: string;
  channelName?: string;
  channelLink?: string;
  category: string;
  cc_load_policy?: number;
  isNew?: boolean;
  date?: string;
  /** Teacher key (e.g. "amanda") to show in that teacher's video section. */
  teacher?: string;
}

export interface YouTubeGistResponse {
  videos: YouTubeVideoEntry[];
}

export async function fetchAussieYouTubeVideos(): Promise<YouTubeVideoEntry[]> {
  const res = await fetch(GIST_RAW_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch YouTube list: ${res.status}`);
  }
  const data: YouTubeGistResponse = await res.json();
  return data.videos ?? [];
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
 * Use this for in-app playback instead of getYouTubeEmbedUrl.
 */
const YT_PROXY_BASE = 'https://irishslang.ie/yt.html';
export function getYouTubeProxyEmbedUrl(youtubeId: string, params?: { cc_load_policy?: number }): string {
  const search = new URLSearchParams({ v: youtubeId });
  if (params?.cc_load_policy) search.set('cc_load_policy', String(params.cc_load_policy));
  return `${YT_PROXY_BASE}?${search.toString()}`;
}
