console.log("Electron preload process starting...")
const { contextBridge, ipcRenderer } = require('electron');

console.log("preload2.js loaded");

contextBridge.exposeInMainWorld('api', {
  ping: () => {
    console.log("ping called from renderer");
    return ipcRenderer.invoke('ping');
  }
});