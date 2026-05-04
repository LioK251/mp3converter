// ──────────────────────────────────────────────────
// MIDI file card renderer – used by History search
// ──────────────────────────────────────────────────

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function createMidiFileItemHTML(item) {
  let html = '<div class="history-item p-3 rounded-xl bg-gray-700/40 border border-gray-700 hover-effect flex flex-col min-h-0">';

  // Header row with badge
  html += '<div class="history-card-header flex items-start justify-between gap-3">';
  html += '<div class="history-badge-row flex items-start gap-2">';
  html += '<span class="badge-midi px-2 py-0.5 text-[10px] rounded-full bg-cyan-600/30 text-cyan-300 border border-cyan-700">MIDI</span>';
  if (item.source_type) {
    const badgeMap = {
      youtube: { cls: 'badge-youtube', bg: 'bg-red-600/30', text: 'text-red-300', border: 'border-red-700', label: 'YouTube' },
      tiktok: { cls: 'badge-tiktok', bg: 'bg-purple-600/30', text: 'text-purple-200', border: 'border-purple-700', label: 'TikTok' },
      discord: { cls: 'badge-discord', bg: 'bg-indigo-600/30', text: 'text-indigo-300', border: 'border-indigo-700', label: 'Discord' },
      upload: { cls: 'badge-mp3', bg: 'bg-indigo-600/30', text: 'text-indigo-300', border: 'border-indigo-700', label: 'Upload' },
    };
    const badge = badgeMap[item.source_type] || badgeMap.upload;
    html += `<span class="${badge.cls} px-2 py-0.5 text-[10px] rounded-full ${badge.bg} ${badge.text} ${badge.border}">${badge.label}</span>`;
  }
  html += '</div>';
  html += `<span class="text-[10px] text-gray-500 shrink-0">${formatFileSize(item.file_size)}</span>`;
  html += '</div>';

  // Content area
  html += '<div class="history-card-body mt-2 space-y-2 text-sm flex-1 flex flex-col min-h-0">';

  // Thumbnail
  if (item.thumbnail_url && item.thumbnail_url.trim()) {
    const linkHref = item.source_url || '#';
    if (item.source_url) {
      html += `<a href="${linkHref}" target="_blank" rel="noopener" class="history-thumb-link hover-effect">`;
    } else {
      html += '<div class="history-thumb-shell hover-effect">';
    }
    html += `<img src="${item.thumbnail_url}" alt="preview" loading="lazy" class="history-thumb w-full rounded-lg border border-gray-700 hover:opacity-90" onerror="this.onerror=null; this.src='/templates/notfound.jpg';" />`;
    if (item.source_url) {
      html += '</a>';
    } else {
      html += '</div>';
    }
  } else {
    html += '<div class="history-thumb-shell hover-effect">';
    html += '<img src="/templates/notfound.jpg" alt="no preview" loading="lazy" class="history-thumb w-full rounded-lg border border-gray-700" />';
    html += '</div>';
  }

  // Title / filename
  if (item.video_title) {
    html += `<div class="history-item-title text-gray-300" title="${item.video_title}">`;
    if (item.source_url) {
      html += `<a class="underline hover-effect" href="${item.source_url}" target="_blank" rel="noopener">${item.video_title}</a>`;
    } else {
      html += item.video_title;
    }
    html += '</div>';
  }

  // Filename
  const filenameClass = item.video_title ? 'text-gray-500 text-xs' : 'text-gray-300';
  html += `<div class="history-file-name ${filenameClass}" title="${item.filename}">${item.filename}</div>`;

  // Footer with buttons
  html += '<div class="history-card-footer mt-auto pt-2">';

  // Date
  html += '<div class="history-item-meta flex items-center justify-between gap-2 text-xs text-gray-400 mb-2">';
  html += `<span class="min-w-0 truncate">${item.time_str}</span>`;
  html += '</div>';

  // Download + visualizer buttons
  html += '<div class="history-primary-actions">';
  html += `<a class="history-card-action download-midi-btn inline-flex items-center justify-center w-full text-center text-sm font-medium px-3 py-2 rounded-lg border border-emerald-700 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 hover-effect" href="${item.download_url}" download>`;
  html += 'Download MIDI';
  html += '</a>';
  html += `<button data-midi-filename="${item.filename}" class="piano-visualizer-btn history-card-action inline-flex items-center justify-center w-full text-center text-sm font-medium px-3 py-2 rounded-lg border hover-effect">Visualize</button>`;
  html += '</div>';

  // QWERTY + sheets buttons
  html += '<div class="history-secondary-actions mt-1">';
  html += `<button data-midi-filename="${item.filename}" class="history-card-action view-tempo-btn inline-flex items-center justify-center text-center text-sm font-medium px-3 py-2 rounded-lg border border-blue-700 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 hover-effect">`;
  html += 'Convert to QWERTY';
  html += '</button>';
  html += `<button data-midi-filename="${item.filename}" class="history-card-action download-sheets-btn inline-flex items-center justify-center text-center text-sm font-medium px-3 py-2 rounded-lg border border-purple-700 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover-effect">`;
  html += 'Download Sheets';
  html += '</button>';
  html += '</div>';

  html += '</div>'; // mt-auto
  html += '</div>'; // content area
  html += '</div>'; // history-item

  return html;
}
