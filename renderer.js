document.getElementById('startBtn').addEventListener('click', async () => {
  const url = document.getElementById('youtubeUrl').value.trim();
  const startTime = document.getElementById('startTime').value.trim();
  const endTime = document.getElementById('endTime').value.trim();
  const button = document.getElementById('startBtn');
  const buttonText = document.getElementById('buttonText');
  const statusMessage = document.getElementById('statusMessage');

  statusMessage.classList.remove('show', 'success', 'error');

  if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
    showStatus("Please enter a valid YouTube link.", 'error');
    return;
  }

  if (!startTime || !endTime) {
    showStatus("Please enter both start and end times.", 'error');
    return;
  }

  button.disabled = true;
  button.classList.add('processing');
  buttonText.textContent = 'Processing...';

  try {
    const result = await window.clipper.clipVideo({ url, startTime, endTime });

    if (result.success) {
      showStatus("Clip saved successfully!", 'success');
    } else {
      throw new Error(result.error);
    }
  } catch (err) {
    console.error("Clip error:", err);
    showStatus("Error: " + err.message, 'error');
  }

  resetButton();
  
  function resetButton() {
    setTimeout(() => {
      button.disabled = false;
      button.classList.remove('processing');
      buttonText.textContent = 'Clip Video';
    }, 1000);
  }

  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.classList.add('show', type);
    setTimeout(() => {
      statusMessage.classList.remove('show');
    }, 4000);
  }
});
function extractVideoId(url){
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
// Add input validation and formatting
document.getElementById('startTime').addEventListener('input', formatTimeInput);
document.getElementById('endTime').addEventListener('input', formatTimeInput);

function formatTimeInput(event) {
  let value = event.target.value.replace(/[^\d:]/g, '');
  
  // Auto-format to mm:ss if user enters numbers only
  if (value.length === 3 && !value.includes(':')) {
    value = value.charAt(0) + ':' + value.slice(1);
  } else if (value.length === 4 && !value.includes(':')) {
    value = value.slice(0, 2) + ':' + value.slice(2);
  }
  
  event.target.value = value;
}

// Add URL validation styling
document.getElementById('youtubeUrl').addEventListener('input', function(event) {
  const url = event.target.value.trim();
  const input = event.target;
  
  if (url && !url.includes("youtube.com") && !url.includes("youtu.be")) {
    input.style.borderColor = 'rgba(231, 76, 60, 0.5)';
  } else {
    input.style.borderColor = 'rgba(255,255,255,0.2)';
  }
});

// Add smooth focus transitions
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('focus', function() {
    this.parentElement.style.transform = 'scale(1.02)';
  });
  
  input.addEventListener('blur', function() {
    this.parentElement.style.transform = 'scale(1)';
  });
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    document.getElementById('startBtn').click();
  }
});

document.getElementById('downloadThumbnailBtn').addEventListener('click', async () => {
  const url = document.getElementById('youtubeUrl').value.trim();
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
    showStatus("Please enter a valid YouTube link.", 'error');
    return;
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    showStatus("Invalid YouTube URL.", 'error');
    return;
  }
  const result = await window.clipper.getThumbnailUrl(videoId);
  if (!result.success || !result.path) {
    console.log("Thumbnail URL:", result.path);
  }
  const imageUrl = result.path;
  console.log("Thumbnail URL:", imageUrl);
  const img = new Image();
  img.crossOrigin = 'anonymous'; // important to avoid CORS issues

  img.onload = function () {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/jpeg');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `thumbnail-${videoId}.jpg`;
    a.click();
    // showStatus("Thumbnail downloaded successfully!", 'success');
  };

  // img.onerror = function () {
  //   // showStatus("Failed to load image due to CORS or invalid URL.", 'error');
  // };

  img.src = imageUrl;
});

