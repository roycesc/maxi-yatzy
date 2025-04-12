/**
 * Audio utilities for game sound effects
 */

type AudioEffect = 'diceRoll' | 'success' | 'error';

// Cache audio instances to prevent recreating them on each play
const audioCache: Record<string, HTMLAudioElement> = {};

/**
 * Play a sound effect with optional volume control
 * @param effect The name of the effect to play
 * @param volume Volume level between 0 and 1
 * @returns Promise that resolves when audio finishes playing
 */
export const playSound = (effect: AudioEffect, volume = 0.5): Promise<void> => {
  return new Promise((resolve) => {
    try {
      // Only create new audio element if not in cache
      if (!audioCache[effect]) {
        const audio = new Audio(`/audio/${effect}.mp3`);
        audioCache[effect] = audio;
      }
      
      const audio = audioCache[effect];
      
      // Set volume and play
      audio.volume = volume;
      audio.currentTime = 0; // Reset to start
      
      // Handle completion
      const onEnded = () => {
        audio.removeEventListener('ended', onEnded);
        resolve();
      };
      
      audio.addEventListener('ended', onEnded);
      
      // Handle errors
      const onError = () => {
        console.error(`Error playing audio: ${effect}`);
        audio.removeEventListener('error', onError);
        resolve();
      };
      
      audio.addEventListener('error', onError);
      
      // Play the sound
      audio.play().catch(error => {
        console.warn(`Could not play audio: ${error.message}`);
        resolve();
      });
    } catch (error) {
      console.error('Audio playback error:', error);
      resolve(); // Resolve anyway to prevent blocking
    }
  });
};

/**
 * Preload audio files to minimize latency when playing
 * @param effects Array of effect names to preload
 */
export const preloadAudio = (effects: AudioEffect[]): void => {
  effects.forEach(effect => {
    if (!audioCache[effect]) {
      const audio = new Audio();
      audio.src = `/audio/${effect}.mp3`;
      audio.preload = 'auto';
      audioCache[effect] = audio;
    }
  });
}; 