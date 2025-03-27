<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Infant Health Monitoring System</title>
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="bg-gray-50">
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-blue-800">Infant Health Monitoring</h1>
      <p class="text-gray-600">Real-time audio & EEG analysis</p>
    </header>

  <!-- Main Dashboard -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Left Panel -->
    <div class="lg:col-span-1 space-y-4">
      <!-- File Upload -->
      <div class="bg-white p-4 rounded-lg shadow transition-all hover:shadow-md">
          <h2 class="text-xl font-semibold mb-3">Upload Data</h2>
          <div class="border-2 border-dashed border-gray-300 rounded p-4 text-center">
            <i class="fas fa-file-upload text-4xl text-blue-500 mb-2"></i>
            <p class="mb-2">Drag & drop .wav or EEG files</p>
            <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              <i class="fas fa-folder-open mr-2"></i>Browse Files
            </button>
          </div>
        </div>

        <!-- ESP32 Connection -->
        <div class="bg-white p-4 rounded-lg shadow transition-all hover:shadow-md">
          <h2 class="text-xl font-semibold mb-3">ESP32 Connection</h2>
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span>Disconnected</span>
          </div>
          <button class="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            <i class="fas fa-plug mr-2"></i>Connect
          </button>
        </div>

        <!-- Health Status -->
        <div class="bg-white p-4 rounded-lg shadow transition-all hover:shadow-md">
          <h2 class="text-xl font-semibold mb-3">Health Status</h2>
          <div class="text-center py-6">
            <div class="text-5xl font-bold text-gray-400">--</div>
            <p class="text-gray-500 mt-2">Awaiting analysis</p>
          </div>
        </div>
      </div>

      <!-- Right Panel -->
      <div class="lg:col-span-2">
        <!-- Tabs -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <div class="flex border-b">
            <button class="tab-button active px-4 py-2 font-medium">Audio</button>
            <button class="tab-button px-4 py-2 font-medium">EEG</button>
            <button class="tab-button px-4 py-2 font-medium">Features</button>
          </div>

          <!-- Tab Content -->
          <div class="p-4">
            <!-- Audio Tab -->
            <div class="tab-content active">
              <h3 class="text-lg font-semibold mb-3">Waveform</h3>
            <div class="bg-gray-50 border border-gray-200 h-48 rounded-lg" id="waveform-container"></div>
            <h3 class="text-lg font-semibold mt-4 mb-3">Spectrogram</h3>
            <div class="bg-gray-50 border border-gray-200 h-48 rounded-lg" id="spectrogram-container"></div>
            </div>

            <!-- EEG Tab (Hidden by default) -->
            <div class="tab-content hidden">
              <h3 class="text-lg font-semibold mb-3">EEG Signals</h3>
              <div class="bg-gray-50 border border-gray-200 h-96 rounded-lg" id="eeg-chart"></div>
            </div>

            <!-- Features Tab (Hidden by default) -->
            <div class="tab-content hidden">
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                  <h4 class="font-medium">MFCCs</h4>
                  <div class="h-32" id="mfcc-chart"></div>
                </div>
                <div class="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                  <h4 class="font-medium">Zero Crossing Rate</h4>
                  <div class="h-32" id="zcr-chart"></div>
                </div>
                <div class="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                  <h4 class="font-medium">Pitch</h4>
                  <div class="h-32" id="pitch-chart"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Audio Visualization Libraries -->
  <script type="module">
    import { audioProcessor } from './js/audio-processor.js';

    // Initialize audio processor when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
      audioProcessor.init('waveform-container', 'spectrogram-container');
      
      // Connect file upload button
      document.querySelector('button.bg-blue-600').addEventListener('click', async () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.wav,audio/*';
        
        fileInput.onchange = async (e) => {
          const file = e.target.files[0];
          if (file) {
            const success = await audioProcessor.loadFile(file);
            if (success) {
              document.querySelector('.text-5xl').textContent = 'Analyzing...';
            }
          }
        };
        
        fileInput.click();
      });
    });
  </script>

  <!-- EEG Visualization Setup -->
  <script type="module">
    import { eegProcessor } from './js/eeg-processor.js';

    document.addEventListener('DOMContentLoaded', () => {
      // Initialize EEG chart
      eegProcessor.init('eeg-chart');
      
      // Connect ESP32 WebSocket button
      document.querySelector('button.bg-green-600').addEventListener('click', () => {
        const wsUrl = prompt('Enter ESP32 WebSocket URL:', 'ws://localhost:8080');
        if (wsUrl) {
          eegProcessor.connectWebSocket(wsUrl);
          document.querySelector('.w-3').classList.replace('bg-red-500', 'bg-green-500');
          document.querySelector('.w-3').nextElementSibling.textContent = 'Connected';
        }
      });
    });
  </script>

  <!-- Main App Script -->
  <script src="js/app.js"></script>
</body>
</html>