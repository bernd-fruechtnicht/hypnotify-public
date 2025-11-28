const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  ttsSpeak: (text, options) => ipcRenderer.invoke('tts-speak', text, options),
  ttsStop: () => ipcRenderer.invoke('tts-stop'),
});
