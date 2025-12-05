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
  html += '<div class="flex items-start justify-between gap-3">';
  html += '<div class="flex items-start gap-3">';
  
  if (item.type === 'youtube') {
    html += '<span class="px-2 py-0.5 text-[10px] rounded-full bg-red-600/30 text-red-300 border border-red-700">YouTube</span>';
  } else if (item.type === 'tiktok') {
    html += '<span class="px-2 py-0.5 text-[10px] rounded-full bg-purple-600/30 text-purple-200 border border-purple-700">TikTok</span>';
  } else if (item.type === 'discord') {
    html += '<span class="px-2 py-0.5 text-[10px] rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-700">Discord</span>';
  } else {
    html += '<span class="px-2 py-0.5 text-[10px] rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-700">MP3</span>';
  }
  
  html += '</div>';
  html += '<button class="delete-history-btn px-2 py-0.5 text-[10px] rounded-full bg-red-600/30 text-red-300 border border-red-700 hover:bg-red-600/50 hover-effect" data-timestamp="' + (item.timestamp || '') + '" title="Delete">Delete</button>';
  html += '</div>';
  html += '<div class="mt-2 space-y-2 text-sm flex-1 flex flex-col min-h-0">';
  
  if (item.type === 'youtube') {
    if (item.video_id) {
      html += `<a href="https://www.youtube.com/watch?v=${item.video_id}" target="_blank" rel="noopener" class="block hover-effect">`;
      html += `<img class="w-full rounded-lg border border-gray-700 hover:opacity-90" src="https://img.youtube.com/vi/${item.video_id}/mqdefault.jpg" alt="thumb" loading="lazy" style="max-height: 180px; object-fit: cover;" onerror="this.onerror=null; this.src='/templates/notfound.jpg';" />`;
      html += '</a>';
    } else {
      html += '<div class="block hover-effect">';
      html += '<img src="/templates/notfound.jpg" alt="thumb" loading="lazy" class="w-full rounded-lg border border-gray-700" style="max-height: 180px; object-fit: cover;" />';
      html += '</div>';
    }
    
    if (item.video_title) {
      html += '<div class="text-gray-300">';
      const youtubeUrl = item.video_id ? `https://www.youtube.com/watch?v=${item.video_id}` : (item.youtube_url || '#');
      html += `<a class="underline hover-effect" href="${youtubeUrl}" target="_blank" rel="noopener">${item.video_title}</a>`;
      html += '</div>';
    } else if (item.youtube_url) {
      html += '<div class="text-gray-300">';
      html += `<a class="underline hover-effect" href="${item.youtube_url}" target="_blank" rel="noopener">${item.youtube_url}</a>`;
      html += '</div>';
    }
  }
  else if (item.type === 'tiktok') {
    if (item.thumbnail_url && item.thumbnail_url.trim()) {
      html += `<a href="${item.tiktok_url || '#'}" target="_blank" rel="noopener" class="block hover-effect">`;
      html += `<img src="${item.thumbnail_url}" alt="thumb" loading="lazy" style="width:100%; max-height: 180px; object-fit:cover; border-radius:0.5rem; border:1px solid #374151;" onerror="this.onerror=null; this.src='/templates/notfound.jpg'; this.style.borderRadius='0.5rem';" />`;
      html += '</a>';
    } else {
      html += '<div class="block hover-effect">';
      html += '<img src="/templates/notfound.jpg" alt="thumb" loading="lazy" class="w-full rounded-lg border border-gray-700" style="max-height: 180px; object-fit: cover;" />';
      html += '</div>';
    }
    html += `<div class="text-gray-300" title="${item.video_title || ''}">`;
    html += `<a class="underline hover-effect" href="${item.tiktok_url || '#'}" target="_blank" rel="noopener">${item.video_title || item.tiktok_url || ''}</a>`;
    html += '</div>';
  }
  else if (item.type === 'discord') {
    if (item.thumbnail_url && item.thumbnail_url.trim()) {
      html += `<a href="${item.discord_url || '#'}" target="_blank" rel="noopener" class="block hover-effect">`;
      html += `<img src="${item.thumbnail_url}" alt="thumb" loading="lazy" style="width:100%; max-height: 180px; object-fit:cover; border-radius:0.5rem; border:1px solid #374151;" onerror="this.onerror=null; this.src='/templates/notfound.jpg'; this.style.borderRadius='0.5rem';" />`;
      html += '</a>';
    } else {
      html += '<div class="block hover-effect">';
      html += '<img src="/templates/notfound.jpg" alt="thumb" loading="lazy" class="w-full rounded-lg border border-gray-700" style="max-height: 180px; object-fit: cover;" />';
      html += '</div>';
    }
    html += `<div class="text-gray-300" title="${item.video_title || ''}">`;
    html += `<a class="underline hover-effect" href="${item.discord_url || '#'}" target="_blank" rel="noopener">${item.video_title || item.discord_url || ''}</a>`;
    html += '</div>';
  }
  else {
    html += '<div class="block hover-effect">';
    html += '<img src="/templates/notfound.jpg" alt="thumb" loading="lazy" class="w-full rounded-lg border border-gray-700" style="max-height: 180px; object-fit: cover;" />';
    html += '</div>';
    html += '<div class="text-gray-300">File: ';
    if (item.mp3_name) {
      const mp3Url = item.mp3_url || `/uploads/${item.mp3_name}`;
      html += `<a class="underline hover-effect" href="${mp3Url}" target="_blank" rel="noopener">${item.mp3_name}</a>`;
    } else {
      html += '—';
    }
    html += '</div>';
  }
  
  html += '<div class="flex items-center justify-between text-xs text-gray-400">';
  html += `<span>Model: ${item.library || '—'}</span>`;
  html += `<span>Time: ${item.conversion_time || '—'}s</span>`;
  html += '</div>';
  
  html += '<div class="mt-auto pt-2">';
  if (item.midi_name) {
    const downloadUrl = item.download_url || `/converted/${item.midi_name}`;
    html += `<a class="inline-flex items-center justify-center w-full text-center text-sm font-medium px-3 py-2 rounded-lg border border-emerald-700 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 hover-effect" href="${downloadUrl}" download>`;
    html += 'Download MIDI';
    html += '</a>';
    html += '<div class="mt-1 flex gap-2">';
    html += `<button data-midi-filename="${item.midi_name}" class="view-tempo-btn flex-1 inline-flex items-center justify-center text-center text-sm font-medium px-3 py-2 rounded-lg border border-blue-700 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 hover-effect">`;
    html += 'Convert to QWERTY';
    html += '</button>';
    html += `<button data-midi-filename="${item.midi_name}" class="download-sheets-btn flex-1 inline-flex items-center justify-center text-center text-sm font-medium px-3 py-2 rounded-lg border border-purple-700 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover-effect">`;
    html += 'Download Sheets';
    html += '</button>';
    html += '</div>';
  }
  html += '</div>';
  
  html += '</div>';
  html += '</div>';
  
  return html;
}

async function loadFullHistory() {
  const historyList = document.getElementById('full-history-list');
  if (!historyList) return;
  
  historyList.innerHTML = '<div class="text-center text-gray-400 py-6 col-span-full text-sm">Loading history...</div>';
  
  try {
    const response = await fetch('/api/history?limit=10000');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const history = await response.json();
    
    if (!history || history.length === 0) {
      historyList.innerHTML = '<div class="text-center text-gray-400 py-6 col-span-full text-sm">No conversion history found.</div>';
      return;
    }
    
    historyList.innerHTML = '';
    
    history.forEach(item => {
      const itemHTML = createHistoryItemHTML(item);
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = itemHTML.trim();
      const historyItemElement = tempDiv.firstElementChild;
      if (historyItemElement) {
        historyList.appendChild(historyItemElement);
      }
    });
  } catch (error) {
    console.error('Error loading history:', error);
    historyList.innerHTML = `<div class="text-center text-red-400 py-6 col-span-full text-sm">Error loading history: ${error.message}</div>`;
  }
}

const refreshHistoryBtn = document.getElementById('refresh-history-btn');
if (refreshHistoryBtn) {
  refreshHistoryBtn.addEventListener('click', () => {
    loadFullHistory();
  });
}

function setupDeleteButtons() {
  document.querySelectorAll('.delete-history-btn').forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.stopPropagation();
      const timestamp = this.getAttribute('data-timestamp');
      if (!timestamp) return;
      
      if (!confirm('Are you sure you want to delete this history item?')) {
        return;
      }
      
      try {
        const response = await fetch('/api/history/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ timestamp: parseFloat(timestamp) })
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete history item');
        }
        
        this.closest('.history-item').remove();
        
        const historyList = document.getElementById('history-list');
        const fullHistoryList = document.getElementById('full-history-list');
        
        if (historyList) {
          const items = historyList.querySelectorAll('.history-item');
          if (items.length === 0) {
            historyList.innerHTML = '<div class="text-gray-400 text-sm">Nothing here yet. Convert something first.</div>';
          }
        }
        
        if (fullHistoryList) {
          const items = fullHistoryList.querySelectorAll('.history-item');
          if (items.length === 0) {
            fullHistoryList.innerHTML = '<div class="text-center text-gray-400 py-6 col-span-full text-sm">No conversion history found.</div>';
          }
        }
      } catch (error) {
        console.error('Error deleting history item:', error);
        alert('Failed to delete history item: ' + error.message);
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

