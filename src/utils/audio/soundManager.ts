/**
 * Sound Manager for Dart Score Manager
 * Handles audio context, sound loading, and playback
 */

export interface SoundConfig {
  volume: number;
  enabled: boolean;
}

export type SoundType = 'celebration' | 'bust' | 'lifeLost' | 'elimination';

class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundType, AudioBuffer> = new Map();
  private config: SoundConfig = {
    volume: 0.7,
    enabled: false, // Default off as requested
  };

  /**
   * Initialize the audio context and load sounds
   */
  async initialize(): Promise<void> {
    try {
      // Handle both standard AudioContext and WebKit AudioContext
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      await this.loadSounds();
    } catch (error) {
      console.warn('Audio context initialization failed:', error);
    }
  }

  /**
   * Generate sounds programmatically using Web Audio API
   */
  private async loadSounds(): Promise<void> {
    if (!this.audioContext) return;

    // Generate celebration sound (happy, ascending tones)
    this.sounds.set('celebration', this.generateCelebrationSound());
    
    // Generate bust sound (low, negative tone)
    this.sounds.set('bust', this.generateBustSound());
    
    // Generate life lost sound (same as bust for consistency)
    this.sounds.set('lifeLost', this.generateBustSound());
    
    // Generate elimination sound (sad, descending tone)
    this.sounds.set('elimination', this.generateEliminationSound());
  }

  /**
   * Generate a celebration sound (happy, ascending tones)
   */
  private generateCelebrationSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 1.0; // 1 second
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Create a happy, ascending melody
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const noteDuration = duration / frequencies.length;

    for (let i = 0; i < frequencies.length; i++) {
      const startSample = Math.floor(i * noteDuration * sampleRate);
      const endSample = Math.floor((i + 1) * noteDuration * sampleRate);
      const frequency = frequencies[i];

      for (let j = startSample; j < endSample && j < data.length; j++) {
        const time = (j - startSample) / sampleRate;
        const envelope = Math.exp(-time * 3); // Quick decay
        data[j] = Math.sin(2 * Math.PI * frequency * time) * envelope * 0.3;
      }
    }

    return buffer;
  }

  /**
   * Generate a bust sound (explosion-like)
   */
  private generateBustSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.8; // 0.8 seconds for explosion
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Create explosion sound with multiple components
    for (let i = 0; i < data.length; i++) {
      const time = i / sampleRate;
      let sample = 0;

      // 1. Initial sharp crack (high frequency burst)
      if (time < 0.1) {
        const crackFreq = 800 + Math.random() * 400; // Random high frequency
        const crackEnvelope = Math.exp(-time * 20); // Very quick decay
        sample += Math.sin(2 * Math.PI * crackFreq * time) * crackEnvelope * 0.3;
      }

      // 2. Low rumble (explosion body)
      const rumbleFreq = 60 + Math.sin(time * 10) * 20; // Vibrating low frequency
      const rumbleEnvelope = Math.exp(-time * 2); // Slower decay
      sample += Math.sin(2 * Math.PI * rumbleFreq * time) * rumbleEnvelope * 0.4;

      // 3. Mid-frequency boom
      const boomFreq = 120 + Math.sin(time * 5) * 30;
      const boomEnvelope = Math.exp(-time * 3);
      sample += Math.sin(2 * Math.PI * boomFreq * time) * boomEnvelope * 0.3;

      // 4. Add some noise for realism
      const noiseEnvelope = Math.exp(-time * 4);
      sample += (Math.random() * 2 - 1) * noiseEnvelope * 0.2;

      data[i] = Math.max(-1, Math.min(1, sample)); // Clamp to prevent distortion
    }

    return buffer;
  }

  /**
   * Generate an elimination sound (sad, descending tone)
   */
  private generateEliminationSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 1.2; // 1.2 seconds
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Create a sad, descending melody
    const frequencies = [392.00, 349.23, 293.66, 261.63]; // G4, F4, D4, C4
    const noteDuration = duration / frequencies.length;

    for (let i = 0; i < frequencies.length; i++) {
      const startSample = Math.floor(i * noteDuration * sampleRate);
      const endSample = Math.floor((i + 1) * noteDuration * sampleRate);
      const frequency = frequencies[i];

      for (let j = startSample; j < endSample && j < data.length; j++) {
        const time = (j - startSample) / sampleRate;
        const envelope = Math.exp(-time * 2); // Slower decay for sad effect
        data[j] = Math.sin(2 * Math.PI * frequency * time) * envelope * 0.25;
      }
    }

    return buffer;
  }

  /**
   * Play a sound effect
   */
  playSound(soundType: SoundType): void {
    if (!this.config.enabled || !this.audioContext || !this.sounds.has(soundType)) {
      return;
    }

    try {
      const audioBuffer = this.sounds.get(soundType);
      if (!audioBuffer) return;

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = audioBuffer;
      gainNode.gain.value = this.config.volume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start();
    } catch (error) {
      console.warn(`Failed to play sound ${soundType}:`, error);
    }
  }

  /**
   * Enable or disable sound effects
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    
    // Resume audio context if it was suspended (required for user interaction)
    if (enabled && this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  /**
   * Set volume level (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get current configuration
   */
  getConfig(): SoundConfig {
    return { ...this.config };
  }

  /**
   * Check if audio is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
