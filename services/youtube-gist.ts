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
