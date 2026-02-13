/**
 * Favourites persistence using AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVOURITES_KEY = 'slang_favourites';

let cachedFavourites: Set<string> | null = null;

export async function loadFavourites(): Promise<Set<string>> {
  if (cachedFavourites) return cachedFavourites;
  try {
    const json = await AsyncStorage.getItem(FAVOURITES_KEY);
    cachedFavourites = json ? new Set(JSON.parse(json)) : new Set();
  } catch {
    cachedFavourites = new Set();
  }
  return cachedFavourites;
}

export async function toggleFavourite(id: string): Promise<boolean> {
  const favs = await loadFavourites();
  const isFav = favs.has(id);
  if (isFav) {
    favs.delete(id);
  } else {
    favs.add(id);
  }
  cachedFavourites = favs;
  await AsyncStorage.setItem(FAVOURITES_KEY, JSON.stringify([...favs]));
  return !isFav;
}

export async function isFavourite(id: string): Promise<boolean> {
  const favs = await loadFavourites();
  return favs.has(id);
}
