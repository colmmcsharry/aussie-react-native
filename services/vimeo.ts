const VIMEO_API_BASE = 'https://api.vimeo.com';
const ACCESS_TOKEN = process.env.EXPO_PUBLIC_VIMEO_ACCESS_TOKEN;
const PROJECT_ID = process.env.EXPO_PUBLIC_VIMEO_PROJECT_ID;

// ---------- Types ----------

export interface VimeoThumbnail {
  width: number;
  height: number;
  link: string;
  link_with_play_button: string;
}

export interface VimeoVideo {
  uri: string;
  name: string;
  description: string | null;
  duration: number;
  width: number;
  height: number;
  link: string;
  player_embed_url: string;
  created_time: string;
  modified_time: string;
  pictures: {
    sizes: VimeoThumbnail[];
  };
  tags: Array<{
    name: string;
    tag: string;
  }>;
  stats: {
    plays: number;
  };
}

export interface VimeoApiResponse {
  total: number;
  page: number;
  per_page: number;
  paging: {
    next: string | null;
    previous: string | null;
  };
  data: VimeoVideo[];
}

// ---------- API ----------

export async function fetchProjectVideos(
  page = 1,
  perPage = 50
): Promise<VimeoApiResponse> {
  const url = `${VIMEO_API_BASE}/me/projects/${PROJECT_ID}/videos?page=${page}&per_page=${perPage}&sort=date&direction=desc&fields=uri,name,description,duration,width,height,link,player_embed_url,created_time,modified_time,pictures,tags,stats`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.vimeo.*+json;version=3.4',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Vimeo API error ${response.status}: ${text}`);
  }

  return response.json();
}

// ---------- Helpers ----------

/** Extract the numeric video ID from a Vimeo URI like "/videos/123456" */
export function getVideoId(video: VimeoVideo): string {
  return video.uri.split('/').pop() || '';
}

/** Get the best thumbnail for a given target width */
export function getThumbnail(video: VimeoVideo, targetWidth = 640): string {
  const sizes = video.pictures.sizes;
  // Find the smallest thumbnail that's >= targetWidth, or fall back to the largest
  const match =
    sizes.find((s) => s.width >= targetWidth) || sizes[sizes.length - 1];
  return match?.link || '';
}

/** Format seconds into m:ss or h:mm:ss */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** Build the embed URL with playback-friendly params */
export function getEmbedUrl(video: VimeoVideo): string {
  const base = video.player_embed_url;
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}autoplay=1&playsinline=1&title=0&byline=0&portrait=0&transparent=0`;
}

/** Check if a video is portrait orientation */
export function isPortrait(video: VimeoVideo): boolean {
  return video.height > video.width;
}

/** Get teacher key from video tags (e.g. tag "teacher-amanda" -> "amanda"). Returns null if none. */
export function getTeacherKeyFromVideo(video: VimeoVideo): string | null {
  const tags = video.tags ?? [];
  const tag = tags.find((t) => t.name.startsWith('teacher-'));
  return tag ? tag.name.replace('teacher-', '') : null;
}

/**
 * Parse social links from text. Looks for Instagram, YouTube, TikTok URLs.
 * Paste URLs anywhere in the description (e.g. "Bio text... https://instagram.com/... https://youtube.com/@...").
 */
export function parseSocialLinksFromText(text: string | null | undefined): {
  instagram?: string;
  youtube?: string;
  tiktok?: string;
} {
  if (!text || !text.trim()) return {};
  const urlRegex = /https?:\/\/[^\s]+/g;
  const matches = text.match(urlRegex) ?? [];
  const result: { instagram?: string; youtube?: string; tiktok?: string } = {};
  for (const url of matches) {
    const lower = url.toLowerCase();
    if (lower.includes('instagram.com') && !result.instagram) result.instagram = url;
    else if ((lower.includes('youtube.com') || lower.includes('youtu.be')) && !result.youtube) result.youtube = url;
    else if (lower.includes('tiktok.com') && !result.tiktok) result.tiktok = url;
  }
  return result;
}

/**
 * Get teacher bio from the first video with a description.
 * Strips lines that are only URLs (so the bio text stays clean; URLs become social buttons).
 */
export function getTeacherBioFromVideos(videos: VimeoVideo[]): string | null {
  const first = videos.find((v) => v.description && v.description.trim().length > 0);
  if (!first?.description?.trim()) return null;
  const lines = first.description.trim().split(/\r?\n/);
  const bioLines = lines
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^https?:\/\//i.test(l));
  return bioLines.length > 0 ? bioLines.join('\n') : null;
}

/** Get social links from the first video with a description (for dynamic teachers). */
export function getTeacherSocialLinksFromVideos(videos: VimeoVideo[]): {
  instagram?: string;
  youtube?: string;
  tiktok?: string;
} {
  const first = videos.find((v) => v.description && v.description.trim().length > 0);
  return parseSocialLinksFromText(first?.description ?? null);
}

/** Format teacher key as display name (e.g. "jem" -> "Jem", "ozzie-mcguire" -> "Ozzie Mcguire"). */
export function formatTeacherKeyAsName(key: string): string {
  return key
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

/** Group Vimeo videos by teacher key. Videos without a teacher tag are omitted. */
export function groupVimeoVideosByTeacher(videos: VimeoVideo[]): Record<string, VimeoVideo[]> {
  const byTeacher: Record<string, VimeoVideo[]> = {};
  for (const video of videos) {
    const key = getTeacherKeyFromVideo(video);
    if (key) {
      if (!byTeacher[key]) byTeacher[key] = [];
      byTeacher[key].push(video);
    }
  }
  // Sort each teacher's videos by created_time desc (newest first)
  for (const key of Object.keys(byTeacher)) {
    byTeacher[key].sort(
      (a, b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime()
    );
  }
  return byTeacher;
}
