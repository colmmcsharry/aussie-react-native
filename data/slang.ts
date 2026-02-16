/**
 * Slang dictionary data and types.
 * Generated from the original Vuex store, cleaned for React Native.
 */
import slangData from './slang-data.json';

export interface SlangEntry {
  id: string;
  buttonTitle: string;
  audioFile: string;
  explanation: string;
  examples: string[];
  notes: string[];
  image?: string;
  isPremium?: boolean;
  /** Region label for Regional category (e.g. "Sydney Slang"). */
  regionalCounty?: string;
}

export interface SlangCategory {
  name: string;
  displayName: string;
  icon: string; // filename for category icon
  quotes: SlangEntry[];
}

const CATEGORY_DISPLAY: Record<string, { displayName: string; icon: string }> = {
  Greetings: { displayName: 'Greetings', icon: 'Greetings.png' },
  General: { displayName: 'General', icon: 'General.png' },
  Drinking: { displayName: 'Drinking', icon: 'Drinking.png' },
  Food: { displayName: 'Food', icon: 'Food.png' },
  Compliments: { displayName: 'Compliments', icon: 'Compliments.png' },
  Regional: { displayName: 'Regional', icon: 'Regional.png' },
  People: { displayName: 'People', icon: 'People.png' },
  Homonyms: { displayName: 'Homonyms', icon: 'Homonyms.png' },
  Fighting: { displayName: 'Fighting', icon: 'Fighting.png' },
  Sports: { displayName: 'Sports', icon: 'Sports.png' },
  Rude: { displayName: 'Rude', icon: 'Rude.png' },
  sex: { displayName: '18+', icon: 'Rude.png' }, // Uses same icon as Rude
};

export function getCategories(): SlangCategory[] {
  return (slangData.categories as string[]).map((name) => {
    const display = CATEGORY_DISPLAY[name] || { displayName: name, icon: '' };
    const quotes = (slangData.quotes as Record<string, SlangEntry[]>)[name] || [];
    return {
      name,
      displayName: display.displayName,
      icon: display.icon,
      quotes,
    };
  });
}

export function getAllQuotes(): SlangEntry[] {
  const categories = getCategories();
  return categories.flatMap((c) => c.quotes);
}

export function searchQuotes(query: string): SlangEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const all = getAllQuotes();
  return all.filter(
    (entry) =>
      entry.buttonTitle.toLowerCase().includes(q) ||
      entry.explanation.toLowerCase().includes(q)
  );
}

/** Unique region labels for the Regional category, sorted. */
export function getRegionalCounties(): string[] {
  const cat = getCategories().find((c) => c.name === "Regional");
  if (!cat) return [];
  const set = new Set<string>();
  cat.quotes.forEach((q) => {
    if (q.regionalCounty) set.add(q.regionalCounty);
  });
  return Array.from(set).sort();
}
