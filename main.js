const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { clipYouTubeVideo , getThumbnailUrl} = require('./clipper');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
    //   contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('renderer.html');
}
ipcMain.handle('clip-video', async (event, {url , startTime , endTime }) => {
  try {
    const filePath = await clipYouTubeVideo({url , startTime , endTime});
    const {filePath: savePath} = await dialog.showSaveDialog({
        title: 'Save Clipped Video',
        defaultPath : 'clip.mp4',
        filters: [{ name: 'Video', extensions: ['mp4'] }], 
    })
    if(savePath){
        const fs = require('fs');
        fs.copyFileSync(filePath , savePath);
        return { success: true, path: savePath };
    }else {
      return { success: false, error: 'Save canceled' };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-thumbnailurl',async (event , {videoId}) =>{
  console.log("video Id:", videoId);
  try{
    const thumbnailUrl = await getThumbnailUrl(videoId);
    console.log("Thumbnail saved at:", thumbnailUrl);
    return { success: true, path: thumbnailUrl };
  }catch (err) {
    return { success: false, error: err.message };
  }
})

app.whenReady().then(() => {
  createWindow();
});
