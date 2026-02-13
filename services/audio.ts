/**
 * Audio playback service for slang pronunciations.
 * Normal speed: expo-audio. Slow motion: expo-av (for playback rate).
 */
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { Audio } from 'expo-av';
import type { Sound } from 'expo-av/build/Audio/Sound';
import { audioMap } from '@/data/audio-map';

const SLOW_RATE = 0.6; // slow-motion playback (0.5–0.6 is typical)

let currentPlayer: AudioPlayer | null = null;
let slowSound: Sound | null = null;

function stopSlowSound(): void {
  if (slowSound) {
    slowSound.unloadAsync().catch(() => {});
    slowSound = null;
  }
}

/**
 * Play an audio file by filename (e.g. 'gday.m4a').
 * Automatically stops any currently playing audio.
 */
export function playAudio(filename: string): void {
  try {
    stopSlowSound();
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
 * Play the same audio file at slow speed (e.g. 0.6x) for easier listening.
 * Uses expo-av for rate control.
 * Calls onComplete when playback finishes.
 */
export async function playAudioSlow(
  filename: string,
  onComplete?: () => void
): Promise<void> {
  try {
    if (currentPlayer) {
      currentPlayer.remove();
      currentPlayer = null;
    }
    if (slowSound) {
      await slowSound.unloadAsync();
      slowSound = null;
    }

    const source = audioMap[filename];
    if (!source) {
      console.warn(`Audio file not found in map: ${filename}`);
      return;
    }

    const { sound } = await Audio.Sound.createAsync(source, {
      shouldPlay: true,
      rate: SLOW_RATE,
      shouldCorrectPitch: true,
    });
    slowSound = sound;
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        stopSlowSound();
        onComplete?.();
      }
    });
  } catch (error) {
    console.error('Error playing slow audio:', error);
    onComplete?.();
  }
}

/**
 * Stop any currently playing audio (normal or slow).
 */
export function stopAudio(): void {
  if (currentPlayer) {
    try {
      currentPlayer.pause();
      currentPlayer.remove();
    } catch (e) {
      // ignore
    }
    currentPlayer = null;
  }
  stopSlowSound();
}
