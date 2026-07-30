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
      musescore_url: resultData.musescore_url,
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

function createHistoryItemHTML(rawItem) {
  // Escape everything that ends up in innerHTML — titles and URLs come from
  // external metadata (YouTube/TikTok titles) and must not inject markup.
  const item = Object.assign({}, rawItem, {
    video_id: escapeHtml(rawItem.video_id),
    video_title: escapeHtml(rawItem.video_title),
    youtube_url: escapeHtml(rawItem.youtube_url),
    tiktok_url: escapeHtml(rawItem.tiktok_url),
    discord_url: escapeHtml(rawItem.discord_url),
    musescore_url: escapeHtml(rawItem.musescore_url),
    thumbnail_url: escapeHtml(rawItem.thumbnail_url),
    mp3_name: escapeHtml(rawItem.mp3_name),
    midi_name: escapeHtml(rawItem.midi_name),
    download_url: escapeHtml(rawItem.download_url),
    library: escapeHtml(rawItem.library),
  });
  let html = '<div class="history-item p-3 rounded-xl bg-gray-700/40 border border-gray-700 hover-effect flex flex-col min-h-0">';
  html += '<div class="history-card-header flex items-start justify-between gap-3">';
  html += '<div class="history-badge-row flex items-start gap-2">';
  
  if (item.type === 'youtube') {
    html += '<span class="badge-youtube px-2 py-0.5 text-[10px] rounded-full bg-red-600/30 text-red-300 border border-red-700">YouTube</span>';
  } else if (item.type === 'tiktok') {
    html += '<span class="badge-tiktok px-2 py-0.5 text-[10px] rounded-full bg-purple-600/30 text-purple-200 border border-purple-700">TikTok</span>';
  } else if (item.type === 'discord') {
    html += '<span class="badge-discord px-2 py-0.5 text-[10px] rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-700">Discord</span>';
  } else if (item.type === 'musescore') {
    html += '<span class="badge-musescore px-2 py-0.5 text-[10px] rounded-full bg-sky-600/30 text-sky-300 border border-sky-700">MuseScore</span>';
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
  else if (item.type === 'musescore') {
    if (item.thumbnail_url && item.thumbnail_url.trim()) {
      html += `<a href="${item.musescore_url || '#'}" target="_blank" rel="noopener" class="history-thumb-link hover-effect">`;
      html += `<img src="${item.thumbnail_url}" alt="score" loading="lazy" class="history-thumb" onerror="this.onerror=null; this.src='/templates/notfound.jpg';" />`;
      html += '</a>';
    } else {
      html += '<div class="history-thumb-shell hover-effect">';
      html += '<img src="/templates/notfound.jpg" alt="score" loading="lazy" class="history-thumb w-full rounded-lg border border-gray-700" />';
      html += '</div>';
    }
    html += `<div class="history-item-title text-gray-300" title="${item.video_title || item.musescore_url || ''}">`;
    html += `<a class="underline hover-effect" href="${item.musescore_url || '#'}" target="_blank" rel="noopener">${item.video_title || item.musescore_url || ''}</a>`;
    html += '</div>';
  }
  else {
    html += '<div class="history-thumb-shell hover-effect">';
    html += '<img src="/templates/notfound.jpg" alt="thumb" loading="lazy" class="history-thumb w-full rounded-lg border border-gray-700" />';
    html += '</div>';
    html += '<div class="history-item-title text-gray-300">File: ';
    if (item.mp3_name) {
      // Plain text: the source MP3 is deleted after conversion, a link would 404
      html += `<span class="break-all">${item.mp3_name}</span>`;
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

// Full History is paginated: conversions and MIDI files from the converted
// folder are merged into one list, newest first, 100 cards per page.
const HISTORY_PAGE_SIZE = 100;
let historyCurrentPage = 1;
let historySearchQuery = '';

function matchesQuery(value, query) {
  return typeof value === 'string' && value.toLowerCase().includes(query);
}

// Merge history entries + converted-folder files into one time-sorted list.
function buildHistoryEntries(query) {
  const q = (query || '').toLowerCase().trim();
  const entries = [];

  const historyItems = q
    ? fullHistoryData.filter(item => (
        matchesQuery(item.video_title, q) ||
        matchesQuery(item.video_id, q) ||
        matchesQuery(item.youtube_url, q) ||
        matchesQuery(item.tiktok_url, q) ||
        matchesQuery(item.discord_url, q) ||
        matchesQuery(item.musescore_url, q) ||
        matchesQuery(item.midi_name, q) ||
        matchesQuery(item.mp3_name, q) ||
        matchesQuery(item.library, q) ||
        matchesQuery(item.type, q)
      ))
    : fullHistoryData;

  historyItems.forEach(item => {
    entries.push({ kind: 'history', ts: item.timestamp || 0, data: item });
  });

  // MIDI files already represented by a history card would be duplicates
  const historyMidiNames = new Set(fullHistoryData.map(h => h.midi_name).filter(Boolean));

  allMidiFilesData.forEach(mf => {
    if (historyMidiNames.has(mf.filename)) return;
    if (q && !(
      matchesQuery(mf.filename, q) ||
      matchesQuery(mf.video_title, q) ||
      matchesQuery(mf.source_type, q) ||
      matchesQuery(mf.source_url, q)
    )) return;
    entries.push({ kind: 'midi', ts: mf.modified_time || 0, data: mf });
  });

  entries.sort((a, b) => b.ts - a.ts);
  return entries;
}

function renderHistoryPagination(totalEntries, totalPages) {
  const container = document.getElementById('history-pagination');
  if (!container) return;

  if (totalEntries === 0) {
    container.innerHTML = '';
    return;
  }

  const first = (historyCurrentPage - 1) * HISTORY_PAGE_SIZE + 1;
  const last = Math.min(historyCurrentPage * HISTORY_PAGE_SIZE, totalEntries);

  // Window of page numbers around the current page
  const pages = [];
  const windowSize = 2;
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - historyCurrentPage) <= windowSize) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  let html = '<div class="history-pagination-info">Showing ' + first + '–' + last + ' of ' + totalEntries + '</div>';
  html += '<div class="history-pagination-controls">';
  html += '<button class="history-page-btn" data-page="' + (historyCurrentPage - 1) + '"' +
          (historyCurrentPage <= 1 ? ' disabled' : '') + '>Prev</button>';
  pages.forEach(p => {
    if (p === '…') {
      html += '<span class="history-page-gap">…</span>';
    } else {
      html += '<button class="history-page-btn' + (p === historyCurrentPage ? ' active' : '') +
              '" data-page="' + p + '">' + p + '</button>';
    }
  });
  html += '<button class="history-page-btn" data-page="' + (historyCurrentPage + 1) + '"' +
          (historyCurrentPage >= totalPages ? ' disabled' : '') + '>Next</button>';
  html += '</div>';

  container.innerHTML = html;
}

function renderHistoryPage() {
  const historyList = document.getElementById('full-history-list');
  if (!historyList) return;

  const entries = buildHistoryEntries(historySearchQuery);
  const totalPages = Math.max(1, Math.ceil(entries.length / HISTORY_PAGE_SIZE));
  if (historyCurrentPage > totalPages) historyCurrentPage = totalPages;
  if (historyCurrentPage < 1) historyCurrentPage = 1;

  const isCurrentlyHidden = historyList.style.opacity === '0';
  if (!isCurrentlyHidden) {
    historyList.style.opacity = '0';
    historyList.style.transition = 'opacity 0.2s ease-in-out';
  }

  const revealList = () => {
    if (!isCurrentlyHidden) {
      setTimeout(() => {
        requestAnimationFrame(() => { historyList.style.opacity = '1'; });
      }, 200);
    }
  };

  if (entries.length === 0) {
    historyList.innerHTML = '<div class="text-center text-gray-400 py-6 col-span-full text-sm">No results found.</div>';
    renderHistoryPagination(0, 1);
    revealList();
    return;
  }

  const start = (historyCurrentPage - 1) * HISTORY_PAGE_SIZE;
  const pageEntries = entries.slice(start, start + HISTORY_PAGE_SIZE);

  const fragment = document.createDocumentFragment();
  pageEntries.forEach(entry => {
    let html = '';
    if (entry.kind === 'history') {
      html = createHistoryItemHTML(entry.data);
    } else if (entry.kind === 'midi' && typeof createMidiFileItemHTML === 'function') {
      html = createMidiFileItemHTML(entry.data);
    }
    if (!html) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = html.trim();
    const el = tmp.firstElementChild;
    if (el) fragment.appendChild(el);
  });

  historyList.innerHTML = '';
  historyList.appendChild(fragment);
  renderHistoryPagination(entries.length, totalPages);
  revealList();
}

// Kept for callers elsewhere in the app
function displayHistoryItems() {
  renderHistoryPage();
}

function filterHistoryItems(searchQuery) {
  historySearchQuery = searchQuery || '';
  historyCurrentPage = 1;
  renderHistoryPage();
}

async function fetchHistorySources() {
  const [historyRes, midiRes] = await Promise.all([
    fetch('/api/history?limit=500'),
    fetch('/api/midi-files?_=' + Date.now()),
  ]);

  if (!historyRes.ok) throw new Error(`HTTP error! status: ${historyRes.status}`);

  fullHistoryData = (await historyRes.json()) || [];

  if (midiRes.ok) {
    const midiData = await midiRes.json();
    allMidiFilesData = midiData.midi_files || [];
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
    await fetchHistorySources();

    const searchInput = document.getElementById('history-search-input');
    historySearchQuery = searchInput ? searchInput.value : '';
    historyCurrentPage = 1;
    renderHistoryPage();

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

const historyPagination = document.getElementById('history-pagination');
if (historyPagination) {
  historyPagination.addEventListener('click', (e) => {
    const btn = e.target.closest('.history-page-btn');
    if (!btn || btn.disabled) return;
    const page = parseInt(btn.getAttribute('data-page'), 10);
    if (isNaN(page) || page === historyCurrentPage) return;
    historyCurrentPage = page;
    renderHistoryPage();
    const list = document.getElementById('full-history-list');
    if (list) list.scrollTop = 0;
  });
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
      await fetchHistorySources();

      const searchInput = document.getElementById('history-search-input');
      historySearchQuery = searchInput ? searchInput.value : '';
      renderHistoryPage();

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
