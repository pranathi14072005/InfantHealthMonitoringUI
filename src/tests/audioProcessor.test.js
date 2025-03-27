
/**
 * @jest-environment jsdom
 */

import { audioProcessor } from '../js/audio-processor.js';

describe('AudioProcessor', () => {
  beforeAll(() => {
    // Mock Wavesurfer
    window.WaveSurfer = {
      create: jest.fn().mockReturnValue({
        load: jest.fn(),
        destroy: jest.fn(),
        registerPlugin: jest.fn()
      })
    };
  });

  describe('Feature Extraction', () => {
    it('should calculate ZCR correctly', () => {
      const samples = new Float32Array([0.1, -0.2, 0.3, -0.1, 0.05]);
      const zcr = audioProcessor.calculateZCR(samples);
      expect(zcr).toBeGreaterThan(0);
      expect(zcr).toBeLessThan(1000);
    });

    it('should estimate pitch within valid range', () => {
      const sampleRate = 44100;
      const samples = new Float32Array(1024).map((_, i) => 
        Math.sin(2 * Math.PI * 440 * i / sampleRate) // 440Hz sine wave
      );
      const pitch = audioProcessor.estimatePitch(samples, sampleRate);
      expect(pitch).toBeCloseTo(440, -1); // Within 10Hz of expected
    });

    it('should handle feature extraction errors gracefully', async () => {
      const mockUrl = 'blob:invalid';
      const features = await audioProcessor.extractFeatures(mockUrl);
      expect(features).toHaveProperty('mfcc');
      expect(features).toHaveProperty('zcr');
      expect(features).toHaveProperty('pitch');
    });
  });

  describe('Initialization', () => {
    it('should initialize wavesurfer with correct config', () => {
      audioProcessor.init('wave-container', 'spec-container');
      expect(window.WaveSurfer.create).toHaveBeenCalled();
    });
  });
});