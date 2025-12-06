let currentTaskId = null;
let isStopped = false;
let buttonStates = {};
let activeConvertButtonId = null;

const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');

function attachLoadingState(id) {
  var button = document.getElementById(id);
  if (!button) return;
  buttonStates[id] = button.textContent;
}
attachLoadingState('convert-button');
attachLoadingState('convert-button-youtube');

function convertToStopButton(buttonId) {
  const button = document.getElementById(buttonId);
  if (!button) return;
  
  activeConvertButtonId = buttonId;
  
  function stopHandler(event) {
    event.preventDefault();
    if (!currentTaskId || isStopped) return;
    
    const btn = event.target;
    isStopped = true;
    btn.disabled = true;
    btn.textContent = 'Stopping...';
    
    fetch(`/api/stop/${currentTaskId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).then(response => {
      if (response.ok) {
        progressText.textContent = 'Cancelled';
        resetButtonStates();
        setTimeout(() => {
          progressText.style.display = 'none';
          progressBar.style.display = 'none';
          currentTaskId = null;
          activeConvertButtonId = null;
          setTimeout(() => { isStopped = false; }, 1000);
        }, 500);
      }
    }).catch(err => {
      console.error('Stop error:', err);
      resetButtonStates();
      progressText.textContent = 'Cancelling...';
      setTimeout(() => {
        progressText.style.display = 'none';
        progressBar.style.display = 'none';
        currentTaskId = null;
        activeConvertButtonId = null;
        setTimeout(() => { isStopped = false; }, 1000);
      }, 500);
    });
  }
  
  if (!button.classList.contains('stop-mode')) {
    button.classList.add('stop-mode');
    button.classList.remove('loading-dots');
    button.classList.remove('border-blue-700', 'bg-blue-600/20', 'text-blue-300', 'hover:bg-blue-600/30');
    button.classList.add('border-red-700', 'bg-red-600/20', 'text-red-300', 'hover:bg-red-600/30');
    button.textContent = 'Stop Conversion';
    button.onclick = stopHandler;
  }
}

function revertStopButtons() {
  const convertButton = document.getElementById('convert-button');
  const convertButtonYoutube = document.getElementById('convert-button-youtube');
  
  if (convertButton && convertButton.classList.contains('stop-mode')) {
    convertButton.classList.remove('stop-mode');
    convertButton.classList.remove('border-red-700', 'bg-red-600/20', 'text-red-300', 'hover:bg-red-600/30');
    convertButton.classList.add('border-blue-700', 'bg-blue-600/20', 'text-blue-300', 'hover:bg-blue-600/30');
    convertButton.textContent = buttonStates['convert-button'] || 'Convert MP3';
    convertButton.onclick = null;
  }
  
  if (convertButtonYoutube && convertButtonYoutube.classList.contains('stop-mode')) {
    convertButtonYoutube.classList.remove('stop-mode');
    convertButtonYoutube.classList.remove('border-red-700', 'bg-red-600/20', 'text-red-300', 'hover:bg-red-600/30');
    convertButtonYoutube.classList.add('border-blue-700', 'bg-blue-600/20', 'text-blue-300', 'hover:bg-blue-600/30');
    convertButtonYoutube.textContent = buttonStates['convert-button-youtube'] || 'Convert Link';
    convertButtonYoutube.onclick = null;
  }
}

function resetButtonStates() {
  revertStopButtons();
  Object.keys(buttonStates).forEach(id => {
    const button = document.getElementById(id);
    if (button) {
      button.classList.remove('loading-dots');
      button.textContent = buttonStates[id];
      button.disabled = false;
    }
  });
}

window.convertToSheets = function(event, midiFilename) {
  console.log('convertToSheets called with:', midiFilename);
  
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  let button = null;
  if (event && event.target) {
    button = event.target.closest('.download-sheets-btn');
  }
  
  if (!button) {
    console.error('Could not find button element');
    showAlert('Error: Could not find button element', 'Error');
    return;
  }
  
  const originalText = button.textContent || 'Download Sheets';
  button.disabled = true;
  button.textContent = 'Converting...';
  
  console.log('Sending request to convert:', midiFilename);
  
  const savedSettings = loadSheetsSettings();
  const currentTransposeMode = localStorage.getItem('transposeMode') || 'auto';
  savedSettings.multi_transpose = currentTransposeMode === 'multi';
  
  fetch('/api/convert-to-sheets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      midi_filename: midiFilename,
      settings: savedSettings
    })
  })
  .then(response => {
    console.log('Response status:', response.status);
    if (!response.ok) {
      return response.json().then(err => Promise.reject(new Error(err.error || `HTTP ${response.status}`)));
    }
    return response.json();
  })
  .then(data => {
    console.log('Conversion successful:', data);
    if (data.success && data.download_url) {
      const link = document.createElement('a');
      link.href = data.download_url;
      link.download = data.sheets_filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
      
      button.textContent = 'Downloaded!';
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
    } else {
      throw new Error(data.error || 'Conversion failed');
    }
  })
  .catch(error => {
    console.error('Convert to sheets error:', error);
    showAlert('Failed to convert MIDI to sheets: ' + (error.message || error.error || error), 'Error');
    button.disabled = false;
    button.textContent = originalText;
  });
};

function showConversionResult(resultData) {
  const videoPreview = document.getElementById('videoPreview');
  const videoPreviewContent = document.getElementById('videoPreviewContent');
  
  if (videoPreview && videoPreviewContent) {
    let html = '';
    
    if (resultData.type === 'youtube' && resultData.video_id) {
      const videoId = resultData.video_id;
      const youtubeUrl = resultData.youtube_url || `https://www.youtube.com/watch?v=${videoId}`;
      const thumbnailUrl = resultData.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      
      const embedUrlNoCookie = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&modestbranding=1&rel=0&controls=1&iv_load_policy=3&cc_load_policy=0&fs=1&playsinline=1&enablejsapi=1&origin=${window.location.origin}`;
      const embedUrlStandard = `https://www.youtube.com/embed/${videoId}?autoplay=0&modestbranding=1&rel=0&controls=1&iv_load_policy=3&cc_load_policy=0&fs=1&playsinline=1&enablejsapi=1&origin=${window.location.origin}`;
      
      html = `<div class="video-player-container" style="position:relative; width:100%; padding-bottom:56.25%; background:#000; border-radius:0.5rem; overflow:hidden; border:1px solid #374151;">`;
      html += `<iframe id="youtube-player-${videoId}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:none; opacity:0;" src="${embedUrlNoCookie}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
      
      html += `<div id="youtube-fallback-${videoId}" style="position:absolute; top:0; left:0; width:100%; height:100%; display:block; cursor:pointer; background:#000;" onclick="window.open('${youtubeUrl}', '_blank');">`;
      html += `<img src="${thumbnailUrl}" alt="Video thumbnail" style="width:100%; max-height:400px; height:auto; object-fit:cover;" onerror="this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg';" />`;
      html += `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:68px; height:48px; pointer-events:none;">`;
      html += `<svg width="68" height="48" viewBox="0 0 68 48"><path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.63-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path><path d="M 45,24 27,14 27,34" fill="#fff"></path></svg>`;
      html += `</div>`;
      html += `<div style="position:absolute; bottom:10px; left:50%; transform:translateX(-50%); color:#fff; font-size:12px; background:rgba(0,0,0,0.7); padding:4px 8px; border-radius:4px;">Click to watch on YouTube</div>`;
      html += `</div>`;
      html += `</div>`;
      
      if (resultData.video_title) {
        html += `<div class="mt-2 text-gray-300 text-sm">`;
        html += `<a href="${youtubeUrl}" target="_blank" rel="noopener" class="underline hover-effect">${resultData.video_title}</a>`;
        html += `</div>`;
      }
      
      (function(vidId, embedStd, ytUrl) {
        setTimeout(function() {
          const iframe = document.getElementById(`youtube-player-${vidId}`);
          const fallback = document.getElementById(`youtube-fallback-${vidId}`);
          if (!iframe) return;
          
          let hasError = false;
          let triedStandard = false;
          
          const showFallback = function() {
            if (hasError) return;
            hasError = true;
            iframe.style.display = 'none';
            if (fallback) fallback.style.display = 'block';
          };
          
          const tryStandardEmbed = function() {
            if (triedStandard || hasError) return;
            triedStandard = true;
            if (iframe.src.includes('youtube-nocookie.com')) {
              iframe.src = embedStd;
            } else {
              showFallback();
            }
          };
          
          const checkForError = function() {
            if (hasError) return true;
            
            const title = iframe.getAttribute('title') || '';
            if (title.toLowerCase().includes('error') || title.toLowerCase().includes('153') || title.toLowerCase().includes('configuration')) {
              tryStandardEmbed();
              return true;
            }
            
            const rect = iframe.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(iframe);
            
            if (rect.height === 0 || rect.width === 0 || 
                computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
              tryStandardEmbed();
              return true;
            }
            
            if (rect.height < 50 && rect.width < 50) {
              tryStandardEmbed();
              return true;
            }
            
            return false;
          };
          
          iframe.addEventListener('load', function() {
            setTimeout(function() {
              if (checkForError()) {
                setTimeout(function() {
                  if (!hasError && checkForError()) {
                    showFallback();
                  }
                }, 1000);
              }
            }, 1500);
          });
          
          iframe.addEventListener('error', function() {
            tryStandardEmbed();
          });
          
          const messageHandler = function(event) {
            if (event.origin !== 'https://www.youtube.com' && event.origin !== 'https://www.youtube-nocookie.com') {
              return;
            }
            try {
              const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
              if (data && (data.event === 'error' || data.errorCode === 153 || 
                  (data.info && data.info.videoData && data.info.videoData.errorCode === 153) ||
                  (data.error && (data.error === 153 || data.error.code === 153)))) {
                tryStandardEmbed();
                setTimeout(function() {
                  if (!hasError) showFallback();
                }, 500);
                window.removeEventListener('message', messageHandler);
              }
            } catch(e) {
            }
          };
          window.addEventListener('message', messageHandler);
          
          const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
              if (mutation.type === 'attributes' && mutation.attributeName === 'title') {
                const title = iframe.getAttribute('title') || '';
                if (title.toLowerCase().includes('error') || title.toLowerCase().includes('153') || title.toLowerCase().includes('configuration')) {
                  tryStandardEmbed();
                  setTimeout(function() {
                    if (!hasError) showFallback();
                  }, 500);
                }
              }
            });
          });
          observer.observe(iframe, { attributes: true, attributeFilter: ['title'] });
          
          setTimeout(function() {
            if (checkForError()) {
              setTimeout(function() {
                if (!hasError && checkForError()) {
                  showFallback();
                }
              }, 1000);
            } else {
              setTimeout(function() {
                if (!hasError) {
                  const title = iframe.getAttribute('title') || '';
                  if (title.toLowerCase().includes('error') || title.toLowerCase().includes('153') || title.toLowerCase().includes('configuration')) {
                    showFallback();
                  }
                }
              }, 2500);
            }
          }, 1500);
          
          let errorCheckCount = 0;
          const maxErrorChecks = 8;
          const errorCheckInterval = setInterval(function() {
            errorCheckCount++;
            if (errorCheckCount > maxErrorChecks || hasError) {
              clearInterval(errorCheckInterval);
              observer.disconnect();
              return;
            }
            
            if (checkForError()) {
              setTimeout(function() {
                if (!hasError) showFallback();
              }, 500);
            }
          }, 800);
        }, 100);
      })(videoId, embedUrlStandard, youtubeUrl);
    } 
    else if (resultData.type === 'tiktok') {
      if (resultData.thumbnail_url && resultData.thumbnail_url.trim()) {
      html = `<a href="${resultData.tiktok_url || '#'}" target="_blank" rel="noopener" class="block hover-effect">`;
        html += `<img src="${resultData.thumbnail_url}" alt="Video thumbnail" style="width:100%; max-height:400px; height:auto; object-fit:cover; border-radius:0.5rem; border:1px solid #374151;" onerror="this.onerror=null; this.src='/templates/notfound.jpg';" />`;
      html += `</a>`;
      } else {
        html = `<div class="block hover-effect">`;
        html += `<img src="/templates/notfound.jpg" alt="Video thumbnail" style="width:100%; max-height:400px; height:auto; object-fit:cover; border-radius:0.5rem; border:1px solid #374151;" />`;
        html += `</div>`;
      }
    }
    else if (resultData.type === 'discord') {
      if (resultData.thumbnail_url && resultData.thumbnail_url.trim()) {
      html = `<a href="${resultData.discord_url || '#'}" target="_blank" rel="noopener" class="block hover-effect">`;
        html += `<img src="${resultData.thumbnail_url}" alt="Video thumbnail" style="width:100%; max-height:400px; height:auto; object-fit:cover; border-radius:0.5rem; border:1px solid #374151;" onerror="this.onerror=null; this.src='/templates/notfound.jpg';" />`;
      html += `</a>`;
      } else {
        html = `<div class="block hover-effect">`;
        html += `<img src="/templates/notfound.jpg" alt="Video thumbnail" style="width:100%; max-height:400px; height:auto; object-fit:cover; border-radius:0.5rem; border:1px solid #374151;" />`;
        html += `</div>`;
      }
    }
    
    if (resultData.download_url && resultData.midi_name) {
      html += `<div style="margin-top: 12px; display: flex; flex-direction: column; gap: 8px;">`;
      html += `<a href="${resultData.download_url}" class="inline-flex items-center justify-center w-full text-center text-sm font-medium px-3 py-2 rounded-lg border border-emerald-700 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 hover-effect" download>`;
      html += `Download MIDI`;
      html += `</a>`;
      html += `<div style="display: flex; gap: 8px;">`;
      html += `<button data-midi-filename="${resultData.midi_name}" class="view-tempo-btn flex-1 inline-flex items-center justify-center text-center text-sm font-medium px-3 py-2 rounded-lg border border-blue-700 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 hover-effect">`;
      html += `Convert to QWERTY`;
      html += `</button>`;
      html += `<button data-midi-filename="${resultData.midi_name}" class="download-sheets-btn flex-1 inline-flex items-center justify-center text-center text-sm font-medium px-3 py-2 rounded-lg border border-purple-700 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover-effect">`;
      html += `Download Sheets`;
      html += `</button>`;
      html += `</div>`;
      html += `</div>`;
    }
    
    if (html) {
      videoPreviewContent.innerHTML = html;
      videoPreview.style.display = 'block';
    }
  }
  
  const conversionTimeDisplay = document.getElementById('conversionTimeDisplay');
  if (conversionTimeDisplay) {
    const timeText = document.getElementById('conversionTimeText');
    const downloadLink = document.getElementById('conversionDownloadLink');
    
    if (timeText && resultData.conversion_time) {
      timeText.textContent = `Done in: ${resultData.conversion_time} s. `;
    }
    
    if (downloadLink && resultData.download_url && resultData.midi_name) {
      downloadLink.href = resultData.download_url;
      downloadLink.textContent = 'Download MIDI';
    }
    
    conversionTimeDisplay.style.display = 'block';
    conversionTimeDisplay.style.opacity = '0';
    conversionTimeDisplay.style.transform = 'translateY(-10px)';
    conversionTimeDisplay.classList.add('show');
    
    requestAnimationFrame(() => {
      conversionTimeDisplay.style.opacity = '1';
      conversionTimeDisplay.style.transform = 'translateY(0)';
    });
  }
  
  if (videoPreview) {
    videoPreview.style.display = 'none';
  }
  
  addToHistory(resultData);
  
  if (typeof setupDeleteButtons === 'function') {
    setTimeout(() => {
      setupDeleteButtons();
    }, 100);
  }
}

const youtubeForm = document.querySelector('form input[name="media_url"]')?.closest('form');
if (youtubeForm) {
  youtubeForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const urlInput = this.querySelector('input[name="media_url"]');
    const url = urlInput.value.trim();
    
    if (!url) {
      showAlert('Please enter a URL', 'Input Required');
      return;
    }
    
    const videoPreview = document.getElementById('videoPreview');
    const conversionTimeDisplay = document.getElementById('conversionTimeDisplay');
    if (videoPreview) videoPreview.style.display = 'none';
    if (conversionTimeDisplay) conversionTimeDisplay.style.display = 'none';
    progressText.style.display = 'block';
    progressBar.style.display = 'block';
    progressText.textContent = 'Starting conversion...';
    progressFill.style.width = '10%';
    convertToStopButton('convert-button-youtube');
    isStopped = false;
    
    try {
      const deviceToggleEl = document.getElementById('device-toggle');
      const device = deviceToggleEl ? (deviceToggleEl.checked ? 'cuda' : 'cpu') : 'cuda';
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          media_url: url,
          device: device,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to start conversion');
      }
      
      const data = await response.json();
      currentTaskId = data.task_id;
      
      let attempts = 0;
      const maxAttempts = 300;
      
      while (!isStopped && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (isStopped) {
          break;
        }
        
        try {
          const statusResponse = await fetch(`/api/status/${currentTaskId}`);
          const statusData = await statusResponse.json();
          
          if (statusData.status === 'completed') {
            if (!isStopped) {
              progressFill.style.width = '100%';
              progressText.textContent = 'Done!';
              
              setTimeout(function() {
                progressText.style.display = 'none';
                progressBar.style.display = 'none';
                showConversionResult(statusData);
                resetButtonStates();
              }, 500);
            }
            return;
          } else if (statusData.status === 'cancelled') {
            isStopped = true;
            progressText.textContent = 'Cancelled';
            break;
          } else if (statusData.status === 'error') {
            throw new Error(statusData.error || 'Conversion failed');
          } else {
            if (!isStopped) {
              progressText.textContent = statusData.progress || 'Processing...';
              progressFill.style.width = `${60 + (attempts / maxAttempts) * 30}%`;
            }
          }
        } catch (err) {
          console.error('Status check error:', err);
          if (isStopped) break;
        }
        
        attempts++;
      }
      
      if (isStopped) {
        resetButtonStates();
        progressText.style.display = 'none';
        progressBar.style.display = 'none';
        currentTaskId = null;
        return;
      }
      
      if (attempts >= maxAttempts) {
        throw new Error('Conversion timeout');
      }
    } catch (err) {
      showAlert('Error: ' + err.message, 'Error');
      progressText.style.display = 'none';
      progressBar.style.display = 'none';
    } finally {
      currentTaskId = null;
    }
  });
}

document.addEventListener('click', function(event) {
  const button = event.target.closest('.download-sheets-btn');
  if (button) {
    event.preventDefault();
    event.stopPropagation();
    const midiFilename = button.getAttribute('data-midi-filename');
    if (midiFilename) {
      window.convertToSheets(event, midiFilename);
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  let dragCounter = 0;
  
  document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter++;
    
    const files = Array.from(e.dataTransfer.files || []);
    const hasMidiFiles = files.some(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ext === 'mid' || ext === 'midi';
    });
    
    if (hasMidiFiles) {
      document.body.style.border = '3px dashed #9333ea';
      document.body.style.backgroundColor = 'rgba(147, 51, 234, 0.1)';
    }
  });
  
  document.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter--;
    
    if (dragCounter === 0) {
      document.body.style.border = '';
      document.body.style.backgroundColor = '';
    }
  });
  
  document.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter = 0;
    document.body.style.border = '';
    document.body.style.backgroundColor = '';
    
    const files = Array.from(e.dataTransfer.files);
    const midiFiles = files.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ext === 'mid' || ext === 'midi';
    });
    
    if (midiFiles.length === 0) {
      return;
    }
    
    for (const file of midiFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadResponse = await fetch('/api/upload-midi', {
          method: 'POST',
          body: formData
        });
        
        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.error || 'Upload failed');
        }
        
        const uploadData = await uploadResponse.json();
        
        if (typeof viewTempoText === 'function') {
          const fileName = file.name.replace(/\.(mid|midi)$/i, '');
          viewTempoText(uploadData.midi_filename, fileName);
        }
        
      } catch (error) {
        console.error('Error processing MIDI file:', error);
        showAlert(`Failed to process ${file.name}: ${error.message}`, 'Error');
      }
    }
  });
});