const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('clipper', {
  clipVideo: (data) => ipcRenderer.invoke('clip-video', data)
});
