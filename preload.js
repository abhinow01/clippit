const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('clipper', {
  clipVideo: (data) => ipcRenderer.invoke('clip-video', data),
  downloadThumbnail : (videoUrl , savePath) => ipcRenderer.invoke('download-thumbnail', { videoUrl, savePath  })
});
