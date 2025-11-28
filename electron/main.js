const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Store current TTS process for stopping
let currentTTSProcess = null;

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load the app from development server
  const url = 'http://localhost:8081';
  console.log('Loading URL:', url);

  // Add error handling and retry logic
  const loadApp = async () => {
    try {
      await mainWindow.loadURL(url);
      console.log('App loaded successfully');
    } catch (error) {
      console.error('Failed to load app:', error);
      // Retry after a short delay
      setTimeout(() => {
        console.log('Retrying to load app...');
        mainWindow.loadURL(url);
      }, 2000);
    }
  };

  loadApp();
  mainWindow.webContents.openDevTools();

  // Wait for the page to load
  mainWindow.webContents.once('did-finish-load', () => {
    console.log('Page loaded successfully');
  });

  mainWindow.webContents.on(
    'did-fail-load',
    (event, errorCode, errorDescription, validatedURL) => {
      console.log('Failed to load:', errorDescription, 'at', validatedURL);
    }
  );

  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    console.log('Will navigate to:', navigationUrl);
    // Prevent navigation to wrong URLs
    if (
      navigationUrl.includes('electron/main') ||
      navigationUrl.includes('bundle')
    ) {
      console.log('Preventing navigation to:', navigationUrl);
      event.preventDefault();
      mainWindow.loadURL(url);
    }
  });

  mainWindow.webContents.on('did-navigate', (event, navigationUrl) => {
    console.log('Did navigate to:', navigationUrl);
  });

  mainWindow.webContents.on('did-navigate-in-page', (event, navigationUrl) => {
    console.log('Did navigate in page to:', navigationUrl);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle TTS requests from renderer
ipcMain.handle('tts-speak', async (event, text, options) => {
  // Stop any existing TTS process
  if (currentTTSProcess) {
    console.log('Stopping previous TTS process');
    currentTTSProcess.kill();
    currentTTSProcess = null;
  }

  // In Electron, we can use the system TTS directly
  // This will work with full parameters
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');

    if (process.platform === 'win32') {
      // Windows: Use PowerShell with SAPI
      // SAPI Rate: -10 to 10 (0 = normal, negative = slower, positive = faster)
      // SAPI Volume: 0 to 100
      const sapiRate = Math.round((options.rate - 1) * 10); // Convert 0.5-2.0 range to -10 to 10
      const sapiVolume = Math.round((options.volume || 1) * 100);

      const psScript = `
        Add-Type -AssemblyName System.Speech
        $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
        
        Write-Host "=== SAPI Configuration ==="
        Write-Host "Setting SAPI Rate to: ${sapiRate} (from rate: ${options.rate})"
        Write-Host "Setting SAPI Volume to: ${sapiVolume} (from volume: ${options.volume})"
        Write-Host "Target Voice: ${options.voice}"
        Write-Host "Target Language: ${options.language}"
        
        $synth.Rate = ${sapiRate}
        $synth.Volume = ${sapiVolume}
        
        # List all available voices first
        Write-Host "=== Available Voices ==="
        $voices = $synth.GetInstalledVoices()
        foreach ($voice in $voices) {
          Write-Host "Voice: $($voice.VoiceInfo.Name) - Language: $($voice.VoiceInfo.Culture.Name)"
        }
        
        # Try to select the specified voice
        if ("${options.voice}" -ne "default" -and "${options.voice}" -ne "") {
          $voiceSelected = $false
          
          # Try the exact voice name first
          try {
            Write-Host "Attempting to select voice: ${options.voice}"
            $synth.SelectVoice("${options.voice}")
            Write-Host "✅ Voice selected successfully: $($synth.Voice.Name)"
            Write-Host "✅ Voice language: $($synth.Voice.Culture.Name)"
            $voiceSelected = $true
          } catch {
            Write-Host "❌ Exact voice not found: ${options.voice}"
          }
          
          # If exact name failed, try to find by partial name match
          if (-not $voiceSelected) {
            Write-Host "Trying to find voice by partial name match..."
            $matchingVoices = $voices | Where-Object { $_.VoiceInfo.Name -like "*${options.voice}*" }
            if ($matchingVoices.Count -gt 0) {
              $matchingVoice = $matchingVoices[0].VoiceInfo.Name
              Write-Host "Found matching voice: $matchingVoice"
              try {
                $synth.SelectVoice($matchingVoice)
                Write-Host "✅ Matching voice selected: $($synth.Voice.Name)"
                Write-Host "✅ Voice language: $($synth.Voice.Culture.Name)"
                $voiceSelected = $true
              } catch {
                Write-Host "❌ Failed to select matching voice"
              }
            }
          }
          
          # If still no voice selected, try to find voice for target language
          if (-not $voiceSelected) {
            Write-Host "Trying to find voice for target language: ${options.language}..."
            $targetLanguageVoices = $voices | Where-Object { $_.VoiceInfo.Culture.Name -like "${options.language}*" }
            if ($targetLanguageVoices.Count -gt 0) {
              $targetVoice = $targetLanguageVoices[0].VoiceInfo.Name
              Write-Host "Found voice for target language: $targetVoice"
              try {
                $synth.SelectVoice($targetVoice)
                Write-Host "✅ Voice selected for target language: $($synth.Voice.Name)"
                Write-Host "✅ Voice language: $($synth.Voice.Culture.Name)"
                $voiceSelected = $true
              } catch {
                Write-Host "❌ Failed to select voice for target language"
              }
            } else {
              Write-Host "❌ No voices found for target language: ${options.language}"
            }
          }
        } else {
          Write-Host "No specific voice requested, using default voice"
        }
        
        Write-Host "=== Final Configuration ==="
        Write-Host "Current Voice: $($synth.Voice.Name)"
        Write-Host "Current Language: $($synth.Voice.Culture.Name)"
        Write-Host "Rate: $($synth.Rate)"
        Write-Host "Volume: $($synth.Volume)"
        
        # Small delay to ensure voice selection takes effect
        Start-Sleep -Milliseconds 100
        
        Write-Host "Speaking text with current settings"
        $synth.Speak("${text.replace(/"/g, '\\"')}")
        Write-Host "Speech completed"
      `;

      const ps = spawn('powershell', ['-Command', psScript]);
      currentTTSProcess = ps; // Store the process for potential stopping

      // Capture output for debugging
      ps.stdout.on('data', data => {
        console.log('PowerShell output:', data.toString());
      });

      ps.stderr.on('data', data => {
        console.log('PowerShell error:', data.toString());
      });

      // Also log to main process console
      console.log('=== TTS Request ===');
      console.log('Text:', text);
      console.log('Options:', options);
      console.log('PowerShell script:', psScript);

      ps.on('close', code => {
        console.log('PowerShell process exited with code:', code);
        currentTTSProcess = null; // Clear the process reference
        if (code === 0) resolve();
        else reject(new Error(`PowerShell exited with code ${code}`));
      });
    } else if (process.platform === 'darwin') {
      // macOS: Use say command
      const args = [
        '-r',
        (options.rate || 0) * 200,
        '-v',
        options.voice || 'Alex',
      ];
      if (options.volume) args.push('-a', (options.volume * 100).toString());
      // Note: macOS say command doesn't have direct pitch control
      args.push(text);

      const say = spawn('say', args);
      say.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`say exited with code ${code}`));
      });
    } else {
      // Linux: Use espeak
      const args = [
        '-s',
        (options.rate || 0) * 200,
        '-a',
        (options.volume || 1) * 100,
      ];
      if (options.pitch) args.push('-p', (options.pitch || 1) * 50); // espeak pitch (0-99)
      if (options.voice) args.push('-v', options.voice);
      args.push(text);

      const espeak = spawn('espeak', args);
      espeak.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`espeak exited with code ${code}`));
      });
    }
  });
});

// Handle TTS stop requests
ipcMain.handle('tts-stop', async () => {
  if (currentTTSProcess) {
    console.log('Stopping TTS process');
    currentTTSProcess.kill();
    currentTTSProcess = null;
    return true;
  }
  return false;
});
