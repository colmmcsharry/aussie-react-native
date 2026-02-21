/**
 * Teacher profiles: name, bio, social links.
 * Vimeo videos are assigned by tag `teacher-<key>` (e.g. teacher-amanda).
 * Thumbnail is taken from the teacher's first Vimeo video at runtime.
 */

export interface TeacherYouTubeVideo {
  id: string;
  type: 'youtube';
  youtubeId: string;
  name: string;
  /** Upload date for display (e.g. from Gist). */
  date?: string;
}

export interface TeacherProfile {
  key: string;
  name: string;
  bio: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  spotify?: string;
  /** Teacher-specific YouTube shorts (separate from main gist list). */
  youtubeVideos: TeacherYouTubeVideo[];
  /** Use this Vimeo video index (0-based) for the teacher card thumbnail. Default 0. */
  thumbnailFromVimeoIndex?: number;
}

export const TEACHER_KEYS = ['aussieslanggang', 'amanda', 'aussieenglish', 'ozziemcguire', 'anna', 'josh', 'leah', 'james'] as const;
export type TeacherKey = (typeof TEACHER_KEYS)[number];

/** AI / premium-only teachers: videos tagged with these show lock + crown. */
export const PREMIUM_TEACHER_KEYS: readonly string[] = ['anna', 'josh', 'leah', 'james'];

export const teachers: Record<TeacherKey, TeacherProfile> = {
  aussieslanggang: {
    key: 'aussieslanggang',
    name: 'Aussie Slang Gang',
    bio: 'Aussie Slang Gang post funny and educational videos about Australian slang. Follow on Instagram and Youtube for more!',
    instagram: 'https://www.instagram.com/aussie.slang.gang',
    youtube: 'https://www.youtube.com/@aussieslanggang',
    youtubeVideos: [
      { id: 'asg-youtube-1', type: 'youtube', youtubeId: 'SPyM7z0zC8s', name: 'Drinking Slang' },
      { id: 'asg-youtube-2', type: 'youtube', youtubeId: 'lTRZhfLigyE', name: 'Common Expressions' },
      { id: 'asg-youtube-3', type: 'youtube', youtubeId: 'wucumSO7aT8', name: 'Smash' },
      { id: 'asg-youtube-4', type: 'youtube', youtubeId: 'HDrwSGdHsN0', name: 'Chuck' },
      { id: 'asg-youtube-5', type: 'youtube', youtubeId: 'sX7JALqq2fU', name: 'Crack' },
    ],
  },
  amanda: {
    key: 'amanda',
    name: 'Amanda',
    bio: 'Amanda is a passionate and experienced teacher who makes videos and courses about Australian English. Follow on Instagram, Youtube, or TikTok for more!',
    instagram: 'https://www.instagram.com/aussie.english.with.amanda',
    youtube: 'https://www.youtube.com/@aussie.english.with.amanda',
    tiktok: 'https://www.tiktok.com/@aussieenglishwithamanda',
    thumbnailFromVimeoIndex: 1,
    youtubeVideos: [
      { id: 'amanda-youtube-1', type: 'youtube', youtubeId: 'Ml4o4l_SLZo', name: 'Pissed' },
      { id: 'amanda-youtube-2', type: 'youtube', youtubeId: 'NfEX2dz7mQ8', name: 'Bloody oath' },
      { id: 'amanda-youtube-3', type: 'youtube', youtubeId: 'lRMfUq672Cc', name: 'How ya goin?' },
      { id: 'amanda-youtube-4', type: 'youtube', youtubeId: 'te8CHz_4UFw', name: "She'll be right" },
    ],
  },
  aussieenglish: {
    key: 'aussieenglish',
    name: 'Aussie English',
    bio: 'Aussie English is a channel that makes videos and podcasts about Australian English. Follow on Instagram, Youtube, or Spotify for more!',
    instagram: 'https://www.instagram.com/aussieenglish',
    youtube: 'https://www.youtube.com/@aussieenglish',
    spotify: 'https://open.spotify.com/show/00000000000000000000000000000000?si=0000000000000000',
    youtubeVideos: [
      { id: 'ae-youtube-1', type: 'youtube', youtubeId: 'X-jSvn6Ltpc', name: 'Abbreviations' },
      { id: 'ae-youtube-2', type: 'youtube', youtubeId: 'yrLQikWvtOc', name: 'Howjehgo?' },
      { id: 'ae-youtube-3', type: 'youtube', youtubeId: 'wsJrTDtAVxI', name: '10 Aussie English words' },
      { id: 'ae-youtube-4', type: 'youtube', youtubeId: 'ZhC8sLJNJVY', name: 'Rude words' },
    ],
  },
  ozziemcguire: {
    key: 'ozziemcguire',
    name: 'Ozzie McGuire',
    bio: 'Ozzie McGuire is an Aussie creator who makes videos about Australian English. Follow on Instagram, Youtube or TikTok for more!',
    instagram: 'https://www.instagram.com/realozziemcguire',
    youtube: 'https://www.youtube.com/@ozziemcguire',
    tiktok: 'https://www.tiktok.com/@ozziemcguiree',
    thumbnailFromVimeoIndex: 1,
    youtubeVideos: [
      { id: 'om-youtube-1', type: 'youtube', youtubeId: 'd1OFaY2xUpE', name: 'Aussie Words Challenge' },
    ],
  },
  anna: {
    key: 'anna',
    name: 'Anna',
    bio: "Anna is an English Language teacher from Australia who helps people from all over the world with the slang and nuances of 'Aussie English'.",
    youtubeVideos: [],
  },
  josh: {
    key: 'josh',
    name: 'Josh',
    bio: "Josh is an Aussie creator who helps newcomers to Oz with the local lingo.",
    youtubeVideos: [],
  },
  leah: {
    key: 'leah',
    name: 'Leah',
    bio: "Leah is an Australian English teacher who creates videos to help learners around the world with Aussie slang and the nuances of Australian English.",
    youtubeVideos: [],
  },
  james: {
    key: 'james',
    name: 'James',
    bio: "James is an Australian English teacher who creates videos to help learners around the world with Aussie slang and the nuances of Australian English.",
    youtubeVideos: [],
  },
};

export function getTeacherByKey(key: string): TeacherProfile | undefined {
  return teachers[key as TeacherKey];
}

/** Extract teacher key from Vimeo tag e.g. "teacher-amanda" -> "amanda" */
export function getTeacherKeyFromTag(tagName: string): string | null {
  if (tagName.startsWith('teacher-')) {
    return tagName.replace('teacher-', '');
  }
  return null;
}
