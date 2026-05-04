async function reloadConverterHistory() {
  const historyList = document.getElementById('history-list');
  if (!historyList) return;
  
  try {
    const response = await fetch('/api/history?limit=32&_=' + Date.now());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const history = await response.json();
    
    if (!history || history.length === 0) {
      requestAnimationFrame(() => {
        historyList.innerHTML = '<div class="text-gray-400 text-sm">Nothing here yet. Convert something first.</div>';
        setTimeout(() => {
          setupDeleteButtons();
        }, 50);
      });
      return;
    }
    
    requestAnimationFrame(() => {
      const fragment = document.createDocumentFragment();
      
      history.forEach(item => {
        const itemHTML = createHistoryItemHTML(item);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = itemHTML.trim();
        const historyItemElement = tempDiv.firstElementChild;
        if (historyItemElement) {
          fragment.appendChild(historyItemElement);
        }
      });
      
      historyList.innerHTML = '';
      historyList.appendChild(fragment);
      
      setTimeout(() => {
        setupDeleteButtons();
      }, 50);
    });
  } catch (error) {
    console.error('Error reloading converter history:', error);
  }
}

function addToHistory(resultData) {
  try {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    const historyItem = {
      type: resultData.type,
      video_id: resultData.video_id,
      video_title: resultData.video_title,
      thumbnail_url: resultData.thumbnail_url,
      youtube_url: resultData.youtube_url,
      tiktok_url: resultData.tiktok_url,
      discord_url: resultData.discord_url,
      midi_name: resultData.midi_name,
      download_url: resultData.download_url,
      conversion_time: resultData.conversion_time,
      library: resultData.library || 'Transkun',
      timestamp: resultData.timestamp || Date.now() / 1000,
    };
    
    const itemHTML = createHistoryItemHTML(historyItem);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = itemHTML.trim();
    const historyItemElement = tempDiv.firstElementChild;
    
    if (historyItemElement) {
      const emptyMessage = historyList.querySelector('.text-gray-400');
      if (emptyMessage && emptyMessage.textContent.includes('Nothing here yet')) {
        emptyMessage.remove();
      }
      
      historyList.insertBefore(historyItemElement, historyList.firstChild);
      
      const items = historyList.querySelectorAll('.history-item');
      for (let i = 32; i < items.length; i++) {
        items[i].remove();
      }
    }
  } catch (error) {
    console.error('Error adding to history:', error);
  }
}

function createHistoryItemHTML(item) {
  let html = '<div class="history-item p-3 rounded-xl bg-gray-700/40 border border-gray-700 hover-effect flex flex-col min-h-0">';
  html += '<div class="history-card-header flex items-start justify-between gap-3">';
  html += '<div class="history-badge-row flex items-start gap-2">';
  
  if (item.type === 'youtube') {
    html += '<span class="badge-youtube px-2 py-0.5 text-[10px] rounded-full bg-red-600/30 text-red-300 border border-red-700">YouTube</span>';
  } else if (item.type === 'tiktok') {
    html += '<span class="badge-tiktok px-2 py-0.5 text-[10px] rounded-full bg-purple-600/30 text-purple-200 border border-purple-700">TikTok</span>';
  } else if (item.type === 'discord') {
    html += '<span class="badge-discord px-2 py-0.5 text-[10px] rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-700">Discord</span>';
  } else {
    html += '<span class="badge-mp3 px-2 py-0.5 text-[10px] rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-700">MP3</span>';
  }
  
  html += '</div>';
  html += '<button class="delete-history-btn shrink-0 px-2 py-0.5 text-[10px] rounded-full bg-red-600/30 text-red-300 border border-red-700 hover:bg-red-600/50 hover-effect" data-timestamp="' + (item.timestamp || '') + '" title="Delete">Delete</button>';
  html += '</div>';
  html += '<div class="history-card-body mt-2 space-y-2 text-sm flex-1 flex flex-col min-h-0">';
  
  if (item.type === 'youtube') {
    if (item.video_id) {
      html += `<a href="https://www.youtube.com/watch?v=${item.video_id}" target="_blank" rel="noopener" class="history-thumb-link hover-effect">`;
      html += `<img class="history-thumb w-full rounded-lg border border-gray-700 hover:opacity-90" src="https://img.youtube.com/vi/${item.video_id}/mqdefault.jpg" alt="thumb" loading="lazy" onerror="this.onerror=null; this.src='/templates/notfound.jpg';" />`;
      html += '</a>';
    } else {
      html += '<div class="history-thumb-shell hover-effect">';
      html += '<img src="/templates/notfound.jpg" alt="thumb" loading="lazy" class="history-thumb w-full rounded-lg border border-gray-700" />';
      html += '</div>';
    }
    
    if (item.video_title) {
      html += `<div class="history-item-title text-gray-300" title="${item.video_title}">`;
      const youtubeUrl = item.video_id ? `https://www.youtube.com/watch?v=${item.video_id}` : (item.youtube_url || '#');
      html += `<a class="underline hover-effect" href="${youtubeUrl}" target="_blank" rel="noopener">${item.video_title}</a>`;
      html += '</div>';
    } else if (item.youtube_url) {
      html += `<div class="history-item-title text-gray-300" title="${item.youtube_url}">`;
      html += `<a class="underline hover-effect" href="${item.youtube_url}" target="_blank" rel="noopener">${item.youtube_url}</a>`;
      html += '</div>';
    }
  }
  else if (item.type === 'tiktok') {
    if (item.thumbnail_url && item.thumbnail_url.trim()) {
      html += `<a href="${item.tiktok_url || '#'}" target="_blank" rel="noopener" class="history-thumb-link hover-effect">`;
      html += `<img src="${item.thumbnail_url}" alt="thumb" loading="lazy" class="history-thumb" onerror="this.onerror=null; this.src='/templates/notfound.jpg';" />`;
      html += '</a>';
    } else {
      html += '<div class="history-thumb-shell hover-effect">';
      html += '<img src="/templates/notfound.jpg" alt="thumb" loading="lazy" class="history-thumb w-full rounded-lg border border-gray-700" />';
      html += '</div>';
    }
    html += `<div class="history-item-title text-gray-300" title="${item.video_title || item.tiktok_url || ''}">`;
    html += `<a class="underline hover-effect" href="${item.tiktok_url || '#'}" target="_blank" rel="noopener">${item.video_title || item.tiktok_url || ''}</a>`;
    html += '</div>';
  }
  else if (item.type === 'discord') {
    if (item.thumbnail_url && item.thumbnail_url.trim()) {
      html += `<a href="${item.discord_url || '#'}" target="_blank" rel="noopener" class="history-thumb-link hover-effect">`;
      html += `<img src="${item.thumbnail_url}" alt="thumb" loading="lazy" class="history-thumb" onerror="this.onerror=null; this.src='/templates/notfound.jpg';" />`;
      html += '</a>';
    } else {
      html += '<div class="history-thumb-shell hover-effect">';
      html += '<img src="/templates/notfound.jpg" alt="thumb" loading="lazy" class="history-thumb w-full rounded-lg border border-gray-700" />';
      html += '</div>';
    }
    html += `<div class="history-item-title text-gray-300" title="${item.video_title || item.discord_url || ''}">`;
    html += `<a class="underline hover-effect" href="${item.discord_url || '#'}" target="_blank" rel="noopener">${item.video_title || item.discord_url || ''}</a>`;
    html += '</div>';
  }
  else {
    html += '<div class="history-thumb-shell hover-effect">';
    html += '<img src="/templates/notfound.jpg" alt="thumb" loading="lazy" class="history-thumb w-full rounded-lg border border-gray-700" />';
    html += '</div>';
    html += '<div class="history-item-title text-gray-300">File: ';
    if (item.mp3_name) {
      const mp3Url = item.mp3_url || `/uploads/${item.mp3_name}`;
      html += `<a class="underline hover-effect" href="${mp3Url}" target="_blank" rel="noopener">${item.mp3_name}</a>`;
    } else {
      html += '—';
    }
    html += '</div>';
  }
  
  html += '<div class="history-card-footer mt-auto pt-2">';
  html += '<div class="history-item-meta flex items-center justify-between gap-2 text-xs text-gray-400 mb-2">';
  html += `<span class="min-w-0 truncate">Model: ${item.library || '—'}</span>`;
  html += `<span class="shrink-0">Time: ${item.conversion_time || '—'}s</span>`;
  html += '</div>';
  if (item.midi_name) {
    const downloadUrl = item.download_url || `/converted/${item.midi_name}`;
    html += '<div class="history-primary-actions">';
    html += `<a class="history-card-action download-midi-btn inline-flex items-center justify-center w-full text-center text-sm font-medium px-3 py-2 rounded-lg border border-emerald-700 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 hover-effect" href="${downloadUrl}" download>`;
    html += 'Download MIDI';
    html += '</a>';
    html += `<button data-midi-filename="${item.midi_name}" class="piano-visualizer-btn history-card-action inline-flex items-center justify-center w-full text-center text-sm font-medium px-3 py-2 rounded-lg border hover-effect">Visualize</button>`;
    html += '</div>';
    html += '<div class="history-secondary-actions mt-1">';
    html += `<button data-midi-filename="${item.midi_name}" class="history-card-action view-tempo-btn inline-flex items-center justify-center text-center text-sm font-medium px-3 py-2 rounded-lg border border-blue-700 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 hover-effect">`;
    html += 'Convert to QWERTY';
    html += '</button>';
    html += `<button data-midi-filename="${item.midi_name}" class="history-card-action download-sheets-btn inline-flex items-center justify-center text-center text-sm font-medium px-3 py-2 rounded-lg border border-purple-700 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover-effect">`;
    html += 'Download Sheets';
    html += '</button>';
    html += '</div>';
  }
  html += '</div>';
  
  html += '</div>';
  html += '</div>';
  
  return html;
}

let fullHistoryData = [];
let allMidiFilesData = [];

function filterHistoryItems(searchQuery) {
  const historyList = document.getElementById('full-history-list');
  if (!historyList) return;
  
  if (!searchQuery || searchQuery.trim() === '') {
    displayHistoryItems(fullHistoryData, []);
    return;
  }
  
  const query = searchQuery.toLowerCase().trim();
  const filtered = fullHistoryData.filter(item => {
    if (item.video_title && item.video_title.toLowerCase().includes(query)) return true;
    if (item.video_id && item.video_id.toLowerCase().includes(query)) return true;
    if (item.youtube_url && item.youtube_url.toLowerCase().includes(query)) return true;
    if (item.tiktok_url && item.tiktok_url.toLowerCase().includes(query)) return true;
    if (item.discord_url && item.discord_url.toLowerCase().includes(query)) return true;
    if (item.midi_name && item.midi_name.toLowerCase().includes(query)) return true;
    if (item.mp3_name && item.mp3_name.toLowerCase().includes(query)) return true;
    if (item.library && item.library.toLowerCase().includes(query)) return true;
    if (item.type && item.type.toLowerCase().includes(query)) return true;
    return false;
  });
  
  // Also search MIDI files and exclude ones already shown in history results
  const historyMidiNames = new Set(filtered.map(h => h.midi_name).filter(Boolean));
  const filteredMidis = allMidiFilesData.filter(mf => {
    if (historyMidiNames.has(mf.filename)) return false;
    if (mf.filename && mf.filename.toLowerCase().includes(query)) return true;
    if (mf.video_title && mf.video_title.toLowerCase().includes(query)) return true;
    if (mf.source_type && mf.source_type.toLowerCase().includes(query)) return true;
    if (mf.source_url && mf.source_url.toLowerCase().includes(query)) return true;
    return false;
  });
  
  displayHistoryItems(filtered, filteredMidis);
}

function displayHistoryItems(items, midiFiles) {
  const historyList = document.getElementById('full-history-list');
  if (!historyList) return;
  
  const isCurrentlyHidden = historyList.style.opacity === '0';
  
  if (!isCurrentlyHidden) {
    historyList.style.opacity = '0';
    historyList.style.transition = 'opacity 0.2s ease-in-out';
  }
  
  const hasMidis = midiFiles && midiFiles.length > 0;
  const hasItems = items && items.length > 0;
  
  if (!hasItems && !hasMidis) {
    historyList.innerHTML = '<div class="text-center text-gray-400 py-6 col-span-full text-sm">No results found.</div>';
    if (!isCurrentlyHidden) {
      setTimeout(() => {
        requestAnimationFrame(() => { historyList.style.opacity = '1'; });
      }, 200);
    }
    return;
  }
  
  const fragment = document.createDocumentFragment();
  
  if (hasItems) {
    items.forEach(item => {
      const itemHTML = createHistoryItemHTML(item);
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = itemHTML.trim();
      const el = tempDiv.firstElementChild;
      if (el) fragment.appendChild(el);
    });
  }
  
  // Append MIDI file results (from converted folder, not in history)
  if (hasMidis && typeof createMidiFileItemHTML === 'function') {
    // Separator
    const sep = document.createElement('div');
    sep.className = 'col-span-full flex items-center gap-3 py-2';
    sep.innerHTML = '<div class="flex-1 h-px bg-gray-600"></div><span class="text-xs text-gray-400 shrink-0">MIDI Files (' + midiFiles.length + ')</span><div class="flex-1 h-px bg-gray-600"></div>';
    fragment.appendChild(sep);
    
    midiFiles.forEach(mf => {
      const html = createMidiFileItemHTML(mf);
      const tmp = document.createElement('div');
      tmp.innerHTML = html.trim();
      const el = tmp.firstElementChild;
      if (el) fragment.appendChild(el);
    });
  }
  
  historyList.innerHTML = '';
  historyList.appendChild(fragment);
  
  if (!isCurrentlyHidden) {
    setTimeout(() => {
      requestAnimationFrame(() => { historyList.style.opacity = '1'; });
    }, 200);
  }
}

async function loadFullHistory() {
  const historyList = document.getElementById('full-history-list');
  if (!historyList) return;
  
  const wasAlreadyFading = historyList.style.opacity === '0';
  
  if (!wasAlreadyFading) {
    historyList.style.opacity = '0';
    historyList.style.transition = 'opacity 0.2s ease-in-out';
  }
  
  if (!wasAlreadyFading) {
    requestAnimationFrame(() => {
      historyList.innerHTML = '<div class="text-center text-gray-400 py-6 col-span-full text-sm">Loading history...</div>';
    });
  }
  
  try {
    const [historyRes, midiRes] = await Promise.all([
      fetch('/api/history?limit=500'),
      fetch('/api/midi-files?_=' + Date.now()),
    ]);
    
    if (!historyRes.ok) throw new Error(`HTTP error! status: ${historyRes.status}`);
    
    const history = await historyRes.json();
    fullHistoryData = history || [];
    
    if (midiRes.ok) {
      const midiData = await midiRes.json();
      allMidiFilesData = midiData.midi_files || [];
    }
    
    const searchInput = document.getElementById('history-search-input');
    if (searchInput && searchInput.value.trim()) {
      filterHistoryItems(searchInput.value);
    } else {
      displayHistoryItems(fullHistoryData, []);
    }
    
    if (wasAlreadyFading) {
      setTimeout(() => {
        requestAnimationFrame(() => { historyList.style.opacity = '1'; });
      }, 200);
    } else {
      requestAnimationFrame(() => { historyList.style.opacity = '1'; });
    }
  } catch (error) {
    console.error('Error loading history:', error);
    historyList.innerHTML = `<div class="text-center text-red-400 py-6 col-span-full text-sm">Error loading history: ${error.message}</div>`;
    
    if (wasAlreadyFading) {
      setTimeout(() => {
        requestAnimationFrame(() => { historyList.style.opacity = '1'; });
      }, 200);
    } else {
      requestAnimationFrame(() => { historyList.style.opacity = '1'; });
    }
  }
}

const refreshHistoryBtn = document.getElementById('refresh-history-btn');
if (refreshHistoryBtn) {
  refreshHistoryBtn.addEventListener('click', async () => {
    const historyList = document.getElementById('full-history-list');
    if (!historyList) {
      loadFullHistory();
      return;
    }
    
    historyList.style.opacity = '0';
    historyList.style.transition = 'opacity 0.2s ease-in-out';
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      const [historyRes, midiRes] = await Promise.all([
        fetch('/api/history?limit=500'),
        fetch('/api/midi-files?_=' + Date.now()),
      ]);
      
      if (!historyRes.ok) throw new Error(`HTTP error! status: ${historyRes.status}`);
      
      const history = await historyRes.json();
      fullHistoryData = history || [];
      
      if (midiRes.ok) {
        const midiData = await midiRes.json();
        allMidiFilesData = midiData.midi_files || [];
      }
      
      const searchInput = document.getElementById('history-search-input');
      if (searchInput && searchInput.value.trim()) {
        filterHistoryItems(searchInput.value);
      } else {
        displayHistoryItems(fullHistoryData, []);
      }
      
      requestAnimationFrame(() => { historyList.style.opacity = '1'; });
    } catch (error) {
      console.error('Error loading history:', error);
      historyList.innerHTML = `<div class="text-center text-red-400 py-6 col-span-full text-sm">Error loading history: ${error.message}</div>`;
      requestAnimationFrame(() => { historyList.style.opacity = '1'; });
    }
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const historySearchInput = document.getElementById('history-search-input');
if (historySearchInput) {
  const debouncedFilter = debounce((value) => {
    filterHistoryItems(value);
  }, 300);
  
  historySearchInput.addEventListener('input', (e) => {
    debouncedFilter(e.target.value);
  });
  
  historySearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      filterHistoryItems(e.target.value);
    }
  });
}

async function setupDeleteButtons() {
  document.querySelectorAll('.delete-history-btn').forEach(btn => {
    if (btn.hasAttribute('data-listener-attached')) {
      return;
    }
    btn.setAttribute('data-listener-attached', 'true');
    
    btn.addEventListener('click', async function(e) {
      e.stopPropagation();
      const timestamp = this.getAttribute('data-timestamp');
      if (!timestamp || timestamp === '') {
        showAlert('Cannot delete: missing timestamp', 'Error');
        return;
      }
      
      const confirmed = await showConfirm('Are you sure you want to delete this history item?', 'Delete History Item');
      if (!confirmed) {
        return;
      }
      
      const timestampFloat = parseFloat(timestamp);
      
      try {
        const response = await fetch('/api/history/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ timestamp: timestampFloat })
        });
        
        const responseData = await response.json();
        
        if (!response.ok && response.status !== 404) {
          throw new Error(responseData.error || 'Failed to delete history item');
        }
        
        const historyList = document.getElementById('history-list');
        const fullHistoryList = document.getElementById('full-history-list');
        
        let removedFromHistoryList = false;
        let removedFromFullHistoryList = false;
        
        if (historyList) {
          const items = Array.from(historyList.querySelectorAll('.history-item'));
          items.forEach(item => {
            const deleteBtn = item.querySelector('.delete-history-btn');
            if (deleteBtn) {
              const itemTimestamp = deleteBtn.getAttribute('data-timestamp');
              if (itemTimestamp) {
                const itemTimestampFloat = parseFloat(itemTimestamp);
                if (!isNaN(itemTimestampFloat) && Math.abs(itemTimestampFloat - timestampFloat) < 0.001) {
                  item.remove();
                  removedFromHistoryList = true;
                }
              }
            }
          });
          
          const remainingItems = historyList.querySelectorAll('.history-item');
          if (remainingItems.length === 0) {
            historyList.innerHTML = '<div class="text-gray-400 text-sm">Nothing here yet. Convert something first.</div>';
          }
        }
        
        if (fullHistoryList) {
          const items = Array.from(fullHistoryList.querySelectorAll('.history-item'));
          items.forEach(item => {
            const deleteBtn = item.querySelector('.delete-history-btn');
            if (deleteBtn) {
              const itemTimestamp = deleteBtn.getAttribute('data-timestamp');
              if (itemTimestamp) {
                const itemTimestampFloat = parseFloat(itemTimestamp);
                if (!isNaN(itemTimestampFloat) && Math.abs(itemTimestampFloat - timestampFloat) < 0.001) {
                  item.remove();
                  removedFromFullHistoryList = true;
                }
              }
            }
          });
          
          const remainingItems = fullHistoryList.querySelectorAll('.history-item');
          if (remainingItems.length === 0) {
            fullHistoryList.innerHTML = '<div class="text-center text-gray-400 py-6 col-span-full text-sm">No conversion history found.</div>';
          }
        }
        
        if (typeof fullHistoryData !== 'undefined' && Array.isArray(fullHistoryData)) {
          fullHistoryData = fullHistoryData.filter(item => {
            const itemTimestamp = item.timestamp || 0;
            return Math.abs(itemTimestamp - timestampFloat) >= 0.001;
          });
        }
        
        if (removedFromHistoryList || removedFromFullHistoryList) {
          if (historyList) {
            await reloadConverterHistory();
          }
          
          if (fullHistoryList) {
            const searchInput = document.getElementById('history-search-input');
            if (searchInput && searchInput.value.trim() !== '') {
              filterHistoryItems(searchInput.value);
            } else {
              displayHistoryItems(fullHistoryData);
            }
            setTimeout(() => {
              setupDeleteButtons();
            }, 50);
          } else {
            setTimeout(() => {
              setupDeleteButtons();
            }, 50);
          }
        }
      } catch (error) {
        console.error('Error deleting history item:', error);
        showAlert('Failed to delete history item: ' + error.message, 'Error');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupDeleteButtons();
});

const observer = new MutationObserver(() => {
  setupDeleteButtons();
});

const historyList = document.getElementById('history-list');
const fullHistoryList = document.getElementById('full-history-list');
if (historyList) {
  observer.observe(historyList, { childList: true, subtree: true });
}
if (fullHistoryList) {
  observer.observe(fullHistoryList, { childList: true, subtree: true });
}

(function capHistoryTo32(){
  var list = document.getElementById('history-list');
  if (!list) return;
  var items = list.querySelectorAll('.history-item');
  for (var i = 32; i < items.length; i++) { items[i].remove(); }
})();
