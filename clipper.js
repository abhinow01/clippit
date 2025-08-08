// clipper.js
const ytdl = require('@distube/ytdl-core');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

function toSeconds(timeStr) {
  const parts = timeStr.split(':').map(Number).reverse();
  return parts.reduce((acc, val, i) => acc + val * Math.pow(60, i), 0);
}

/**
 * Downloads and clips a YouTube video
 * @param {string} url - YouTube video URL
 * @param {string} startTime - Start time in hh:mm:ss or mm:ss
 * @param {string} endTime - End time in hh:mm:ss or mm:ss
 * @returns {Promise<string>} - Path to the clipped video file
 */
async function clipYouTubeVideo({ url, startTime, endTime }) {
    console.log("~cliper function called ")
  if (!url || !startTime || !endTime) {
    throw new Error('Missing URL, startTime, or endTime');
  }

  const startSeconds = toSeconds(startTime);
  const endSeconds = toSeconds(endTime);
  const duration = endSeconds - startSeconds;

  if (isNaN(startSeconds) || isNaN(endSeconds)) {
    throw new Error('Invalid time format. Use mm:ss or hh:mm:ss.');
  }

  if (duration <= 0 ) {
    throw new Error('Invalid duration (must be >0 )');
  }

  const info = await ytdl.getInfo(url);
  const format = ytdl.chooseFormat(info.formats, {
    quality: 'highestvideo',
    filter: 'videoonly'
  });

  if (!format?.url) {
    throw new Error('Could not extract video stream');
  }

  const tempPath = path.join(os.tmpdir(), `clip-${Date.now()}.mp4`);

  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-ss', `${startTime}`,
      '-i', format.url,
      '-t', `${duration}`,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-an',
      tempPath
    ]);

    let ffmpegError = '';

    ffmpeg.stderr.on('data', (data) => {
     const output = data.toString();
        ffmpegError += output;
        console.log("[ffmpeg]", output);
    });

    ffmpeg.on('close', (code) => {
      if (code === 0 && fs.existsSync(tempPath)) {
        resolve(tempPath);
      } else {
        reject(new Error(`FFmpeg failed with code ${code}\n${ffmpegError}`));
      }
    });
  });
}
const getThumbnailUrl = async (videoId) => {
  const info = await ytdl.getInfo(videoId);
  const thumbnails = info.videoDetails.thumbnails;
  const jpegThumb = thumbnails.find(t => t.url.endsWith('.jpg')) || thumbnails.at(-1);
  return jpegThumb?.url || null;
};

async function downloadThumbnail(videoId , savePath ='./thumbnails'){
  console.log("~function hit for downloading thumbnail")
  const url = await getThumbnailUrl(videoId);
  console.log("Thumbnail URL:", url);
  const response = await axios.get(url , {responseType : 'arraybuffer'});
  console.log("Thumbnail downloaded from:", url , "response" , response);
  const fileName = `thumbnail-${Date.now()}.jpg`;
  const fullPath = path.join(savePath , fileName);
  fs.mkdirSync(savePath , {recursive: true});
  fs.writeFileSync(fullPath , response.data);
  return fullPath ;
}
module.exports = {
  clipYouTubeVideo,
  getThumbnailUrl,
  downloadThumbnail
};
