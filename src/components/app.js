/**
 * Infant Health Monitoring System - Core Application Logic
 * @module app
 * @description Main application controller handling UI interactions,
 * data processing, and visualization updates.
 */

/**
 * DOM Elements
 * @type {NodeList} tabs - Tab navigation buttons
 * @type {NodeList} tabContents - Tab content containers
 * @type {HTMLElement} uploadButton - Audio file upload button
 * @type {HTMLElement} connectButton - ESP32 connection button
 * @type {HTMLElement} statusIndicator - Connection status indicator
 * @type {HTMLElement} healthStatus - Health status display element
 */
const tabs = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const uploadButton = document.querySelector('button.bg-blue-600');
const connectButton = document.querySelector('button.bg-green-600');
const statusIndicator = document.querySelector('.w-3.h-3');
const healthStatus = document.querySelector('.text-5xl');

/**
 * Initialize tab switching functionality
 * @function
 * @listens click
 */
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    // Remove active class from all tabs and contents
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.add('hidden'));
    
    // Add active class to clicked tab and show corresponding content
    tab.classList.add('active');
    tabContents[index].classList.remove('hidden');
  });
});

// File Upload Handler
uploadButton.addEventListener('click', () => {
  // TODO: Implement file selection dialog
  console.log('File upload clicked');
});

// ESP32 Connection Handler
connectButton.addEventListener('click', () => {
  // TODO: Implement WebSocket connection
  console.log('ESP32 connect clicked');
  
  // Simulate connection state change
  statusIndicator.classList.toggle('bg-red-500');
  statusIndicator.classList.toggle('bg-green-500');
  
  const statusText = statusIndicator.nextElementSibling;
  statusText.textContent = statusIndicator.classList.contains('bg-green-500') 
    ? 'Connected' 
    : 'Disconnected';
});

/**
 * Analyze health status based on extracted features
 * @function
 * @param {Object} features - Extracted audio features
 * @param {number[]} features.mfcc - MFCC coefficients
 * @param {number} features.zcr - Zero Crossing Rate
 * @param {number} features.pitch - Estimated pitch in Hz
 * @returns {Object} Analysis result
 * @returns {string} result.status - 'Normal' or 'Abnormal'
 * @returns {number} result.confidence - Confidence percentage
 * @returns {Object} result.features - Processed feature values
 */
const analyzeHealthStatus = (features) => {
  // Simple threshold-based prediction (will be replaced with actual model)
  const { mfcc, zcr, pitch } = features;
  
  // Calculate MFCC variance as simple health indicator
  const mfccVariance = mfcc.reduce((sum, val) => sum + val**2, 0) / mfcc.length;
  const isNormal = mfccVariance < 1.5 && zcr < 8 && pitch > 200 && pitch < 600;
  
  return {
    status: isNormal ? 'Normal' : 'Abnormal',
    confidence: isNormal ? 85 + Math.random()*15 : 70 + Math.random()*20,
    features: { mfccVariance, zcr, pitch }
  };
};

// UI Feedback Helpers
const showLoading = (element, message = 'Processing...') => {
  element.innerHTML = `
    <div class="flex flex-col items-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
      <span>${message}</span>
    </div>
  `;
};

const showError = (element, message) => {
  element.innerHTML = `
    <div class="text-red-500 text-center">
      <i class="fas fa-exclamation-triangle text-xl mb-1"></i>
      <p>${message}</p>
    </div>
  `;
};

// Update Health Display
const updateHealthStatus = (result) => {
  // Clear any existing confidence indicators
  const existingConfidence = healthStatus.parentNode.querySelector('.confidence');
  if (existingConfidence) {
    existingConfidence.remove();
  }

  healthStatus.textContent = result.status;
  healthStatus.classList.remove('text-gray-400');
  
  if (result.status === 'Normal') {
    healthStatus.classList.add('text-green-500');
    healthStatus.classList.remove('text-red-500');
  } else {
    healthStatus.classList.add('text-red-500');
    healthStatus.classList.remove('text-green-500');
  }
  
  // Update confidence indicator
  const confidenceElement = document.createElement('div');
  confidenceElement.className = 'confidence text-sm mt-2';
  confidenceElement.textContent = `Confidence: ${result.confidence.toFixed(1)}%`;
  healthStatus.parentNode.appendChild(confidenceElement);
  
  // Update feature charts
  updateFeatureCharts(result.features);
};

// Chart instances
let mfccChart, zcrChart, pitchChart;

/**
 * Initialize all feature visualization charts
 * @function
 * @description Creates Chart.js instances for:
 * - MFCC coefficients (bar chart)
 * - Zero Crossing Rate (gauge-style doughnut)
 * - Pitch tracking (line chart)
 */
const initFeatureCharts = () => {
  // MFCC Chart (Bar chart)
  mfccChart = new Chart(mfccChartCtx, {
    type: 'bar',
    data: {
      labels: Array.from({length: 13}, (_, i) => `MFCC ${i+1}`),
      datasets: [{
        label: 'MFCC Coefficients',
        backgroundColor: '#4a89dc',
        borderColor: '#2c3e50',
        borderWidth: 1,
        data: Array(13).fill(0)
      }]
    },
    options: {
      responsive: true,
      scales: { 
        y: { 
          beginAtZero: true,
          title: { display: true, text: 'Value' }
        }
      }
    }
  });

  // ZCR Chart (Gauge-style)
  zcrChart = new Chart(zcrChartCtx, {
    type: 'doughnut',
    data: {
      labels: ['ZCR', ''],
      datasets: [{
        data: [0, 10],
        backgroundColor: ['#4a89dc', '#f0f0f0']
      }]
    },
    options: {
      circumference: 180,
      rotation: -90,
      cutout: '70%',
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => `ZCR: ${context.raw.toFixed(2)}`
          }
        }
      }
    }
  });

  // Pitch Chart (Line chart)
  pitchChart = new Chart(pitchChartCtx, {
    type: 'line',
    data: {
      labels: Array.from({length: 10}, (_, i) => i+1),
      datasets: [{
        label: 'Pitch (Hz)',
        borderColor: '#4a89dc',
        backgroundColor: 'rgba(74, 137, 220, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        data: Array(10).fill(0)
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          title: { display: true, text: 'Frequency (Hz)' }
        }
      }
    }
  });
};

// Update Feature Charts
const updateFeatureCharts = (features) => {
  // Update MFCC chart
  mfccChart.data.datasets[0].data = features.mfcc;
  mfccChart.update();
  
  // Update ZCR chart (normalized to 0-10 scale)
  zcrChart.data.datasets[0].data = [features.zcr, 10-features.zcr];
  zcrChart.update();
  
  // Update Pitch chart (shift existing data left)
  const pitchData = pitchChart.data.datasets[0].data;
  pitchData.shift();
  pitchData.push(features.pitch);
  pitchChart.update();
};

// Mock analysis for demo purposes
setInterval(async () => {
  if (audioProcessor.wavesurfer?.isPlaying()) {
    const mockFeatures = {
      mfcc: audioProcessor.generateMockMFCC(),
      zcr: Math.random() * 10,
      pitch: 300 + Math.random() * 200
    };
    const result = analyzeHealthStatus(mockFeatures);
    updateHealthStatus(result);
  }
}, 3000);

// Initialize Visualization Containers
const initVisualizations = () => {
  initFeatureCharts();
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initVisualizations();
  
  // Set default tab to Audio
  document.querySelector('.tab-button').click();
});