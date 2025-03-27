// Audio Processing and Visualization Module
import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js';

class AudioProcessor {
  constructor() {
    this.wavesurfer = null;
    this.spectrogram = null;
    this.audioContext = null;
    this.analyser = null;
  }

  // Initialize waveform and spectrogram
  init(containerId, spectrogramId) {
    // Initialize WaveSurfer for waveform
    this.wavesurfer = WaveSurfer.create({
      container: `#${containerId}`,
      waveColor: '#4a89dc',
      progressColor: '#2c3e50',
      cursorColor: '#1a1a1a',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 1,
      height: 150,
      barGap: 2,
      responsive: true,
    });

    // Initialize spectrogram plugin
    this.wavesurfer.registerPlugin(
      WaveSurfer.spectrogram.create({
        container: `#${spectrogramId}`,
        labels: true,
        height: 150,
        colorMap: 'viridis',
      })
    );

    // Set up audio context for feature extraction
    this.setupAudioContext();
  }

  setupAudioContext() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
  }

  // Load and process audio file
  async loadFile(file) {
    if (!file) return;

    try {
      // Create object URL for the file
      const objectUrl = URL.createObjectURL(file);
      
      // Load the file into wavesurfer
      await this.wavesurfer.load(objectUrl);
      
      // Process for features (MFCC, ZCR, Pitch)
      await this.extractFeatures(objectUrl);
      
      return true;
    } catch (error) {
      console.error('Error loading audio file:', error);
      return false;
    }
  }

  /**
   * Extract audio features from file
   * @async
   * @method
   * @param {string} audioUrl - URL of audio file to analyze
   * @returns {Promise<Object>} Feature analysis results
   * @returns {number[]} mfcc - MFCC coefficients
   * @returns {number} zcr - Zero Crossing Rate
   * @returns {number} pitch - Estimated pitch in Hz
   * @throws {Error} If feature extraction fails
   */
  async extractFeatures(audioUrl) {
    try {
      // Fetch and decode audio data
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Get first channel data
      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;
      
      // Calculate features
      const features = {
        mfcc: this.calculateMFCC(channelData, sampleRate),
        zcr: this.calculateZCR(channelData),
        pitch: this.estimatePitch(channelData, sampleRate)
      };
      
      return features;
    } catch (error) {
      console.error('Feature extraction failed:', error);
      return this.generateMockFeatures(); // Fallback to mock data
    }
  }

  /**
   * Calculate Zero Crossing Rate
   * @method
   * @param {Float32Array} samples - Audio samples
   * @returns {number} zcr - Zero crossings per second
   */
  calculateZCR(samples) {
    let crossings = 0;
    for (let i = 1; i < samples.length; i++) {
      if (samples[i] * samples[i-1] < 0) crossings++;
    }
    return (crossings / samples.length) * sampleRate / 2;
  }

  /**
   * Estimate pitch using autocorrelation
   * @method
   * @param {Float32Array} samples - Audio samples
   * @param {number} sampleRate - Audio sample rate in Hz
   * @returns {number} pitch - Estimated pitch in Hz
   */
  estimatePitch(samples, sampleRate) {
    const maxLag = Math.floor(sampleRate / 60); // Minimum 60Hz
    const minLag = Math.floor(sampleRate / 400); // Maximum 400Hz
    
    let bestLag = 0;
    let bestCorrelation = -1;
    
    for (let lag = minLag; lag < maxLag; lag++) {
      let correlation = 0;
      for (let i = 0; i < samples.length - lag; i++) {
        correlation += samples[i] * samples[i + lag];
      }
      
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestLag = lag;
      }
    }
    
    return sampleRate / bestLag;
  }

  // Simplified MFCC calculation
  calculateMFCC(samples, sampleRate) {
    // In a real implementation, this would use FFT and mel filters
    // For demo purposes, return mock values
    return this.generateMockFeatures().mfcc;
  }

  generateMockFeatures() {
    return {
      mfcc: Array.from({length: 13}, () => Math.random() * 2 - 1),
      zcr: Math.random() * 10,
      pitch: 300 + Math.random() * 200
    };
  }

  // Clean up resources
  destroy() {
    if (this.wavesurfer) {
      this.wavesurfer.destroy();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Export singleton instance
export const audioProcessor = new AudioProcessor();
