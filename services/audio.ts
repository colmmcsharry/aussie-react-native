/**
 * Audio playback service for slang pronunciations.
 * Uses expo-audio (the modern replacement for expo-av).
 */
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { audioMap } from '@/data/audio-map';

let currentPlayer: AudioPlayer | null = null;

/**
 * Play an audio file by filename (e.g. 'gday.m4a').
 * Automatically stops any currently playing audio.
 */
export function playAudio(filename: string): void {
  try {
    // Stop and release any currently playing sound
    if (currentPlayer) {
      currentPlayer.remove();
      currentPlayer = null;
    }

    const source = audioMap[filename];
    if (!source) {
      console.warn(`Audio file not found in map: ${filename}`);
      return;
    }

    currentPlayer = createAudioPlayer(source);
    currentPlayer.play();
  } catch (error) {
    console.error('Error playing audio:', error);
  }
}

/**
 * Stop any currently playing audio.
 */
export function stopAudio(): void {
  if (currentPlayer) {
    try {
      currentPlayer.pause();
      currentPlayer.remove();
    } catch (e) {
      // ignore cleanup errors
    }
    currentPlayer = null;
  }
}
