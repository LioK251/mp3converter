const defaultSheetsSettings = {
  resilience: 2,
  place_shifted_notes: 'start',
  place_out_of_range_notes: 'inorder',
  break_lines_how: 'manually',
  break_lines_every: 4,
  quantize: 35,
  classic_chord_order: true,
  sequential_quantizes: false,
  curly_braces_for_quantized_chords: false,
  include_out_of_range: true,
  show_tempo_timing_marks: true,
  show_out_of_range_text_marks: true,
  out_of_range_separator: ':',
  show_bpm_changes_as_comments: true,
  auto_transpose: true,
  center_sheet_text: false,
  background: 'none',
  background_opacity: 0.6,
  primary_button_bg: '#2563eb',
  primary_button_bg_opacity: 0.2,
  primary_button_border: '#1d4ed8',
  primary_button_text: '#93c5fd',
  primary_button_hover_bg: '#3b82f6',
  primary_button_hover_bg_opacity: 0.3,
  primary_button_hover_border: '#3b82f6',
  secondary_button_bg: '#9333ea',
  secondary_button_bg_opacity: 0.2,
  secondary_button_border: '#7e22ce',
  secondary_button_text: '#c084fc',
  secondary_button_hover_bg: '#a855f7',
  secondary_button_hover_bg_opacity: 0.3,
  secondary_button_hover_border: '#a855f7',
  success_button_bg: '#059669',
  success_button_bg_opacity: 0.2,
  success_button_border: '#047857',
  success_button_text: '#6ee7b7',
  success_button_hover_bg: '#10b981',
  success_button_hover_bg_opacity: 0.3,
  success_button_hover_border: '#10b981',
  text_color: '#e5e7eb',
  text_secondary: '#9ca3af',
  card_bg: '#1f2937',
  card_bg_opacity: 0.8,
  card_border: '#374151',
  card_hover_border: 'rgba(147, 51, 234, 0.4)',
  link_color: '#9333ea',
  link_hover: '#a855f7',
  modal_bg: '#1f2937',
  modal_bg_opacity: 1,
  modal_border: '#374151',
  modal_text: '#ffffff',
  modal_text_secondary: '#d1d5db',
  modal_text_tertiary: '#9ca3af',
  input_bg: '#374151',
  input_border: '#4b5563',
  input_text: '#ffffff',
  tab_active: '#9333ea',
  tab_inactive: '#9ca3af',
  history_item_bg: '#374151',
  history_item_bg_opacity: 0.4,
  history_item_border: '#374151',
  history_item_hover_bg: 'rgba(55, 65, 81, 0.6)',
  history_item_hover_bg_opacity: 0.6,
  history_item_hover_border: 'rgba(147, 51, 234, 0.3)',
  history_item_hover_border_opacity: 0.3,
  modal_backdrop: 'rgba(0, 0, 0, 0.5)',
  checkbox_bg: '#4b5563',
  checkbox_checked: '#9333ea',
  checkbox_border: '#6b7280',
  delete_button_bg: '#dc2626',
  delete_button_bg_opacity: 0.3,
  delete_button_border: '#b91c1c',
  delete_button_text: '#fca5a5',
  delete_button_hover_bg: '#ef4444',
  delete_button_hover_bg_opacity: 0.5,
  badge_youtube_bg: '#dc2626',
  badge_youtube_bg_opacity: 0.3,
  badge_youtube_border: '#b91c1c',
  badge_youtube_text: '#fca5a5',
  badge_tiktok_bg: '#9333ea',
  badge_tiktok_bg_opacity: 0.3,
  badge_tiktok_border: '#7e22ce',
  badge_tiktok_text: '#c084fc',
  badge_discord_bg: '#6366f1',
  badge_discord_bg_opacity: 0.3,
  badge_discord_border: '#4f46e5',
  badge_discord_text: '#a5b4fc',
  badge_mp3_bg: '#6366f1',
  badge_mp3_bg_opacity: 0.3,
  badge_mp3_border: '#4f46e5',
  badge_mp3_text: '#a5b4fc',
  tempo_modal_bg: '#1f2937',
  tempo_modal_bg_opacity: 1,
  tempo_modal_border: '#374151',
  tempo_modal_text: '#9ca3af',
  tempo_modal_backdrop: 'rgba(0, 0, 0, 0.5)',
  custom_modal_bg: '#1f2937',
  custom_modal_bg_opacity: 1,
  custom_modal_border: '#374151',
  custom_modal_backdrop: 'rgba(0, 0, 0, 0.5)',
  modal_close_bg: 'transparent',
  modal_close_text: '#9ca3af',
  modal_close_hover_text: '#ffffff',
  modal_action_primary_bg: '#9333ea',
  modal_action_primary_bg_opacity: 1,
  modal_action_primary_text: '#ffffff',
  modal_action_primary_hover_bg: '#7e22ce',
  modal_action_primary_hover_bg_opacity: 1,
  modal_action_secondary_bg: '#374151',
  modal_action_secondary_bg_opacity: 1,
  modal_action_secondary_text: '#ffffff',
  modal_action_secondary_hover_bg: '#4b5563',
  modal_action_secondary_hover_bg_opacity: 1,
  tempo_modal_button_text: '#9ca3af',
  tempo_modal_button_hover_text: '#ffffff',
};

let settingsCache = null;
let settingsCachePromise = null;

function loadSheetsSettingsSync() {
  if (settingsCache !== null) return settingsCache;
  let saved = null;
  try { saved = localStorage.getItem('sheetsSettings'); } catch (_) {}
  if (!saved && window.pywebview) {
    try { saved = window.pywebview.api.load_settings(); } catch (_) {}
  }
  if (saved) {
    try {
      const parsed = typeof saved === 'string' ? JSON.parse(saved) : saved;
      return { ...defaultSheetsSettings, ...parsed };
    } catch (_) {}
  }
  return defaultSheetsSettings;
}

async function loadSheetsSettings() {
  if (settingsCache !== null) return settingsCache;

  const syncSettings = loadSheetsSettingsSync();
  if (syncSettings && syncSettings !== defaultSheetsSettings) {
    settingsCache = syncSettings;
  }

  if (settingsCachePromise) {
    const result = await settingsCachePromise;
    settingsCache = result;
    return result;
  }

  settingsCachePromise = (async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const saved = await response.json();
        if (saved && Object.keys(saved).length > 0) {
          settingsCache = { ...defaultSheetsSettings, ...saved };
          return settingsCache;
        }
      }
    } catch (_) {}
    if (!settingsCache) settingsCache = syncSettings;
    return settingsCache || defaultSheetsSettings;
  })();

  const result = await settingsCachePromise;
  settingsCachePromise = null;
  if (!settingsCache) settingsCache = result;
  return settingsCache || result;
}

async function saveSheetsSettings(settings) {
  settingsCache = { ...defaultSheetsSettings, ...settings };
  try {
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error(`Failed to save settings: ${response.statusText}`);
  } catch (e) {
    console.error('Failed to save settings to API, trying localStorage:', e);
    try { localStorage.setItem('sheetsSettings', JSON.stringify(settings)); }
    catch (lsErr) { console.error('Failed to save to localStorage:', lsErr); }
  }
  if (window.pywebview) {
    try { window.pywebview.api.save_settings(JSON.stringify(settings)); }
    catch (err) { console.error('Failed to save settings via pywebview:', err); }
  }
}

let wallpaperList = [];
let wallpaperListPromise = null;

async function loadWallpapers() {
  if (wallpaperList.length > 0) return wallpaperList;
  if (wallpaperListPromise) return wallpaperListPromise;

  wallpaperListPromise = (async () => {
    try {
      const response = await fetch('/api/wallpapers');
      const data = await response.json();
      wallpaperList = data.wallpapers || [];
      return wallpaperList;
    } catch (error) {
      console.error('Failed to load wallpapers:', error);
      wallpaperList = [];
      return [];
    }
  })();

  const result = await wallpaperListPromise;
  wallpaperListPromise = null;
  return result;
}

// --- DOM helpers ---

function $id(id) { return document.getElementById(id); }

function setVal(id, value) {
  const el = $id(id);
  if (el) el.value = value;
}

function setChecked(id, value) {
  const el = $id(id);
  if (el) el.checked = value;
}

function setText(id, text) {
  const el = $id(id);
  if (el) el.textContent = text;
}

function getVal(id) {
  const el = $id(id);
  return el ? el.value : '';
}

function getChecked(id) {
  const el = $id(id);
  return el ? el.checked : false;
}

function opacityPct(val, fallback = 0.5) {
  const v = val !== undefined ? val : fallback;
  return Math.round(v * 100) + '%';
}

function parseRgbaOpacity(rgbaStr, fallback = 0.5) {
  if (rgbaStr && rgbaStr.includes('rgba')) {
    const match = rgbaStr.match(/[\d.]+/g);
    if (match && match.length >= 4) return parseFloat(match[3]);
  }
  return fallback;
}

function extractHexFromRgba(rgbaStr, fallback = '#000000') {
  return (rgbaStr && rgbaStr.startsWith('#')) ? rgbaStr : fallback;
}

// --- Populate / Read modal ---

async function populateSettingsModal(settings) {
  setVal('setting-resilience', settings.resilience);
  setText('resilience-value', settings.resilience);
  setVal('setting-place-shifted', settings.place_shifted_notes);
  setVal('setting-place-out-of-range', settings.place_out_of_range_notes);
  setVal('setting-break-lines-how', settings.break_lines_how);
  setVal('setting-break-lines-every', settings.break_lines_every);
  setText('break-lines-value', settings.break_lines_every);
  setVal('setting-quantize', settings.quantize);
  setText('quantize-value', settings.quantize);
  setChecked('setting-classic-chord-order', settings.classic_chord_order);
  setChecked('setting-sequential-quantizes', settings.sequential_quantizes);
  setChecked('setting-curly-braces', settings.curly_braces_for_quantized_chords);
  setChecked('setting-include-out-of-range', settings.include_out_of_range);
  setChecked('setting-show-tempo-marks', settings.show_tempo_timing_marks);
  setChecked('setting-show-out-of-range-marks', settings.show_out_of_range_text_marks);
  setVal('setting-out-of-range-separator', settings.out_of_range_separator);
  setChecked('setting-show-bpm-changes', settings.show_bpm_changes_as_comments);
  setChecked('setting-auto-transpose', settings.auto_transpose);
  setChecked('setting-center-sheet-text', settings.center_sheet_text || false);

  const wallpapers = await loadWallpapers();
  const backgroundSelect = $id('setting-background');
  if (backgroundSelect) {
    const gradientOption = backgroundSelect.querySelector('option[value="gradient"]');
    const noneOption = backgroundSelect.querySelector('option[value="none"]');
    backgroundSelect.innerHTML = '';
    if (noneOption) backgroundSelect.appendChild(noneOption);
    if (gradientOption) backgroundSelect.appendChild(gradientOption);

    wallpapers.forEach(wp => {
      const option = document.createElement('option');
      option.value = wp.filename;
      const displayName = wp.filename.replace(/_/g, ' ').replace(/\.(jpg|jpeg|png|gif|webp|mp4|webm|mov)$/i, '');
      option.textContent = displayName + (wp.type === 'video' ? ' (Video)' : '');
      backgroundSelect.appendChild(option);
    });

    const bgVal = settings.background || 'gradient';
    if (bgVal === 'gradient' || bgVal === 'none') {
      backgroundSelect.value = bgVal;
    } else {
      backgroundSelect.value = wallpapers.some(wp => wp.filename === bgVal) ? bgVal : 'gradient';
    }
    updateBackgroundPreview();
  }

  const opacity = settings.background_opacity !== undefined ? settings.background_opacity : 0.6;
  setVal('setting-background-opacity', opacity);
  setText('background-opacity-value', opacityPct(opacity, 0.6));

  const colorFields = [
    ['setting-primary-button-bg', 'primary_button_bg', '#2563eb'],
    ['setting-primary-button-border', 'primary_button_border', '#1d4ed8'],
    ['setting-primary-button-text', 'primary_button_text', '#93c5fd'],
    ['setting-primary-button-hover-bg', 'primary_button_hover_bg', '#3b82f6'],
    ['setting-primary-button-hover-border', 'primary_button_hover_border', '#3b82f6'],
    ['setting-secondary-button-bg', 'secondary_button_bg', '#9333ea'],
    ['setting-secondary-button-border', 'secondary_button_border', '#7e22ce'],
    ['setting-secondary-button-text', 'secondary_button_text', '#c084fc'],
    ['setting-secondary-button-hover-bg', 'secondary_button_hover_bg', '#a855f7'],
    ['setting-secondary-button-hover-border', 'secondary_button_hover_border', '#a855f7'],
    ['setting-success-button-bg', 'success_button_bg', '#059669'],
    ['setting-success-button-border', 'success_button_border', '#047857'],
    ['setting-success-button-text', 'success_button_text', '#6ee7b7'],
    ['setting-success-button-hover-bg', 'success_button_hover_bg', '#10b981'],
    ['setting-success-button-hover-border', 'success_button_hover_border', '#10b981'],
    ['setting-text-color', 'text_color', '#e5e7eb'],
    ['setting-text-secondary', 'text_secondary', '#9ca3af'],
    ['setting-card-bg', 'card_bg', '#1f2937'],
    ['setting-card-border', 'card_border', '#374151'],
    ['setting-link-color', 'link_color', '#9333ea'],
    ['setting-link-hover', 'link_hover', '#a855f7'],
    ['setting-modal-bg', 'modal_bg', '#1f2937'],
    ['setting-modal-border', 'modal_border', '#374151'],
    ['setting-modal-text', 'modal_text', '#ffffff'],
    ['setting-modal-text-secondary', 'modal_text_secondary', '#d1d5db'],
    ['setting-modal-text-tertiary', 'modal_text_tertiary', '#9ca3af'],
    ['setting-input-bg', 'input_bg', '#374151'],
    ['setting-input-border', 'input_border', '#4b5563'],
    ['setting-input-text', 'input_text', '#ffffff'],
    ['setting-tab-active', 'tab_active', '#9333ea'],
    ['setting-tab-inactive', 'tab_inactive', '#9ca3af'],
    ['setting-history-item-bg', 'history_item_bg', '#374151'],
    ['setting-history-item-border', 'history_item_border', '#374151'],
    ['setting-checkbox-bg', 'checkbox_bg', '#4b5563'],
    ['setting-checkbox-checked', 'checkbox_checked', '#9333ea'],
    ['setting-checkbox-border', 'checkbox_border', '#6b7280'],
    ['setting-delete-button-bg', 'delete_button_bg', '#dc2626'],
    ['setting-delete-button-border', 'delete_button_border', '#b91c1c'],
    ['setting-delete-button-text', 'delete_button_text', '#fca5a5'],
    ['setting-delete-button-hover-bg', 'delete_button_hover_bg', '#ef4444'],
    ['setting-badge-youtube-bg', 'badge_youtube_bg', '#dc2626'],
    ['setting-badge-youtube-border', 'badge_youtube_border', '#b91c1c'],
    ['setting-badge-youtube-text', 'badge_youtube_text', '#fca5a5'],
    ['setting-badge-tiktok-bg', 'badge_tiktok_bg', '#9333ea'],
    ['setting-badge-tiktok-border', 'badge_tiktok_border', '#7e22ce'],
    ['setting-badge-tiktok-text', 'badge_tiktok_text', '#c084fc'],
    ['setting-badge-discord-bg', 'badge_discord_bg', '#6366f1'],
    ['setting-badge-discord-border', 'badge_discord_border', '#4f46e5'],
    ['setting-badge-discord-text', 'badge_discord_text', '#a5b4fc'],
    ['setting-badge-mp3-bg', 'badge_mp3_bg', '#6366f1'],
    ['setting-badge-mp3-border', 'badge_mp3_border', '#4f46e5'],
    ['setting-badge-mp3-text', 'badge_mp3_text', '#a5b4fc'],
    ['setting-tempo-modal-bg', 'tempo_modal_bg', '#1f2937'],
    ['setting-tempo-modal-border', 'tempo_modal_border', '#374151'],
    ['setting-tempo-modal-text', 'tempo_modal_text', '#9ca3af'],
    ['setting-custom-modal-bg', 'custom_modal_bg', '#1f2937'],
    ['setting-custom-modal-border', 'custom_modal_border', '#374151'],
    ['setting-modal-close-bg', 'modal_close_bg', 'transparent'],
    ['setting-modal-close-text', 'modal_close_text', '#9ca3af'],
    ['setting-modal-close-hover-text', 'modal_close_hover_text', '#ffffff'],
    ['setting-modal-action-primary-bg', 'modal_action_primary_bg', '#9333ea'],
    ['setting-modal-action-primary-text', 'modal_action_primary_text', '#ffffff'],
    ['setting-modal-action-primary-hover-bg', 'modal_action_primary_hover_bg', '#7e22ce'],
    ['setting-modal-action-secondary-bg', 'modal_action_secondary_bg', '#374151'],
    ['setting-modal-action-secondary-text', 'modal_action_secondary_text', '#ffffff'],
    ['setting-modal-action-secondary-hover-bg', 'modal_action_secondary_hover_bg', '#4b5563'],
    ['setting-tempo-modal-button-text', 'tempo_modal_button_text', '#9ca3af'],
    ['setting-tempo-modal-button-hover-text', 'tempo_modal_button_hover_text', '#ffffff'],
  ];

  colorFields.forEach(([elId, key, fallback]) => {
    setVal(elId, settings[key] || fallback);
  });

  const opacityFields = [
    ['setting-primary-button-bg-opacity', 'primary-button-bg-opacity-value', 'primary_button_bg_opacity', 0.2],
    ['setting-primary-button-hover-bg-opacity', 'primary-button-hover-bg-opacity-value', 'primary_button_hover_bg_opacity', 0.3],
    ['setting-secondary-button-bg-opacity', 'secondary-button-bg-opacity-value', 'secondary_button_bg_opacity', 0.2],
    ['setting-secondary-button-hover-bg-opacity', 'secondary-button-hover-bg-opacity-value', 'secondary_button_hover_bg_opacity', 0.3],
    ['setting-success-button-bg-opacity', 'success-button-bg-opacity-value', 'success_button_bg_opacity', 0.2],
    ['setting-success-button-hover-bg-opacity', 'success-button-hover-bg-opacity-value', 'success_button_hover_bg_opacity', 0.3],
    ['setting-card-bg-opacity', 'card-bg-opacity-value', 'card_bg_opacity', 0.8],
    ['setting-modal-bg-opacity', 'modal-bg-opacity-value', 'modal_bg_opacity', 1],
    ['setting-history-item-bg-opacity', 'history-item-bg-opacity-value', 'history_item_bg_opacity', 0.4],
    ['setting-history-item-hover-bg-opacity', 'history-item-hover-bg-opacity-value', 'history_item_hover_bg_opacity', 0.6],
    ['setting-delete-button-bg-opacity', 'delete-button-bg-opacity-value', 'delete_button_bg_opacity', 0.3],
    ['setting-delete-button-hover-bg-opacity', 'delete-button-hover-bg-opacity-value', 'delete_button_hover_bg_opacity', 0.5],
    ['setting-badge-youtube-bg-opacity', 'badge-youtube-bg-opacity-value', 'badge_youtube_bg_opacity', 0.3],
    ['setting-badge-tiktok-bg-opacity', 'badge-tiktok-bg-opacity-value', 'badge_tiktok_bg_opacity', 0.3],
    ['setting-badge-discord-bg-opacity', 'badge-discord-bg-opacity-value', 'badge_discord_bg_opacity', 0.3],
    ['setting-badge-mp3-bg-opacity', 'badge-mp3-bg-opacity-value', 'badge_mp3_bg_opacity', 0.3],
    ['setting-tempo-modal-bg-opacity', 'tempo-modal-bg-opacity-value', 'tempo_modal_bg_opacity', 1],
    ['setting-custom-modal-bg-opacity', 'custom-modal-bg-opacity-value', 'custom_modal_bg_opacity', 1],
    ['setting-modal-action-primary-bg-opacity', 'modal-action-primary-bg-opacity-value', 'modal_action_primary_bg_opacity', 1],
    ['setting-modal-action-primary-hover-bg-opacity', 'modal-action-primary-hover-bg-opacity-value', 'modal_action_primary_hover_bg_opacity', 1],
    ['setting-modal-action-secondary-bg-opacity', 'modal-action-secondary-bg-opacity-value', 'modal_action_secondary_bg_opacity', 1],
    ['setting-modal-action-secondary-hover-bg-opacity', 'modal-action-secondary-hover-bg-opacity-value', 'modal_action_secondary_hover_bg_opacity', 1],
  ];

  opacityFields.forEach(([inputId, labelId, key, fallback]) => {
    const v = settings[key] !== undefined ? settings[key] : fallback;
    setVal(inputId, v);
    setText(labelId, opacityPct(v, fallback));
  });

  // rgba-based fields with parsed opacity
  const rgbaFields = [
    ['setting-card-hover-border', 'setting-card-hover-border-opacity', 'card-hover-border-opacity-value', 'card_hover_border', '#9333ea', 0.4],
    ['setting-modal-backdrop', 'setting-modal-backdrop-opacity', 'modal-backdrop-opacity-value', 'modal_backdrop', '#000000', 0.5],
    ['setting-history-item-hover-bg', 'setting-history-item-hover-bg-opacity', null, 'history_item_hover_bg', '#374151', 0.6],
    ['setting-history-item-hover-border', 'setting-history-item-hover-border-opacity', 'history-item-hover-border-opacity-value', 'history_item_hover_border', '#9333ea', 0.3],
    ['setting-tempo-modal-backdrop', 'setting-tempo-modal-backdrop-opacity', 'tempo-modal-backdrop-opacity-value', 'tempo_modal_backdrop', '#000000', 0.5],
    ['setting-custom-modal-backdrop', 'setting-custom-modal-backdrop-opacity', 'custom-modal-backdrop-opacity-value', 'custom_modal_backdrop', '#000000', 0.5],
  ];

  rgbaFields.forEach(([colorId, opacityId, labelId, key, hexFallback, opFallback]) => {
    const raw = settings[key];
    setVal(colorId, extractHexFromRgba(raw, hexFallback));
    const op = parseRgbaOpacity(raw, opFallback);
    setVal(opacityId, op);
    if (labelId) setText(labelId, opacityPct(op, opFallback));
  });

  applyColors(settings);
}

function getSettingsFromModal() {
  const s = {
    resilience: parseInt(getVal('setting-resilience')),
    place_shifted_notes: getVal('setting-place-shifted'),
    place_out_of_range_notes: getVal('setting-place-out-of-range'),
    break_lines_how: getVal('setting-break-lines-how'),
    break_lines_every: parseInt(getVal('setting-break-lines-every')),
    quantize: parseInt(getVal('setting-quantize')),
    classic_chord_order: getChecked('setting-classic-chord-order'),
    sequential_quantizes: getChecked('setting-sequential-quantizes'),
    curly_braces_for_quantized_chords: getChecked('setting-curly-braces'),
    include_out_of_range: getChecked('setting-include-out-of-range'),
    show_tempo_timing_marks: getChecked('setting-show-tempo-marks'),
    show_out_of_range_text_marks: getChecked('setting-show-out-of-range-marks'),
    out_of_range_separator: getVal('setting-out-of-range-separator'),
    show_bpm_changes_as_comments: getChecked('setting-show-bpm-changes'),
    auto_transpose: getChecked('setting-auto-transpose'),
    center_sheet_text: getChecked('setting-center-sheet-text'),
    background: getVal('setting-background'),
    background_opacity: parseFloat(getVal('setting-background-opacity')),
  };

  const colorPairs = [
    ['primary_button_bg', 'setting-primary-button-bg'],
    ['primary_button_bg_opacity', 'setting-primary-button-bg-opacity', true],
    ['primary_button_border', 'setting-primary-button-border'],
    ['primary_button_text', 'setting-primary-button-text'],
    ['primary_button_hover_bg', 'setting-primary-button-hover-bg'],
    ['primary_button_hover_bg_opacity', 'setting-primary-button-hover-bg-opacity', true],
    ['primary_button_hover_border', 'setting-primary-button-hover-border'],
    ['secondary_button_bg', 'setting-secondary-button-bg'],
    ['secondary_button_bg_opacity', 'setting-secondary-button-bg-opacity', true],
    ['secondary_button_border', 'setting-secondary-button-border'],
    ['secondary_button_text', 'setting-secondary-button-text'],
    ['secondary_button_hover_bg', 'setting-secondary-button-hover-bg'],
    ['secondary_button_hover_bg_opacity', 'setting-secondary-button-hover-bg-opacity', true],
    ['secondary_button_hover_border', 'setting-secondary-button-hover-border'],
    ['success_button_bg', 'setting-success-button-bg'],
    ['success_button_bg_opacity', 'setting-success-button-bg-opacity', true],
    ['success_button_border', 'setting-success-button-border'],
    ['success_button_text', 'setting-success-button-text'],
    ['success_button_hover_bg', 'setting-success-button-hover-bg'],
    ['success_button_hover_bg_opacity', 'setting-success-button-hover-bg-opacity', true],
    ['success_button_hover_border', 'setting-success-button-hover-border'],
    ['text_color', 'setting-text-color'],
    ['text_secondary', 'setting-text-secondary'],
    ['card_bg', 'setting-card-bg'],
    ['card_bg_opacity', 'setting-card-bg-opacity', true],
    ['card_border', 'setting-card-border'],
    ['card_hover_border', 'setting-card-hover-border'],
    ['link_color', 'setting-link-color'],
    ['link_hover', 'setting-link-hover'],
    ['modal_bg', 'setting-modal-bg'],
    ['modal_bg_opacity', 'setting-modal-bg-opacity', true],
    ['modal_border', 'setting-modal-border'],
    ['modal_text', 'setting-modal-text'],
    ['modal_text_secondary', 'setting-modal-text-secondary'],
    ['modal_text_tertiary', 'setting-modal-text-tertiary'],
    ['modal_backdrop', 'setting-modal-backdrop'],
    ['input_bg', 'setting-input-bg'],
    ['input_border', 'setting-input-border'],
    ['input_text', 'setting-input-text'],
    ['tab_active', 'setting-tab-active'],
    ['tab_inactive', 'setting-tab-inactive'],
    ['history_item_bg', 'setting-history-item-bg'],
    ['history_item_bg_opacity', 'setting-history-item-bg-opacity', true],
    ['history_item_border', 'setting-history-item-border'],
    ['history_item_hover_bg', 'setting-history-item-hover-bg'],
    ['history_item_hover_bg_opacity', 'setting-history-item-hover-bg-opacity', true],
    ['history_item_hover_border', 'setting-history-item-hover-border'],
    ['checkbox_bg', 'setting-checkbox-bg'],
    ['checkbox_checked', 'setting-checkbox-checked'],
    ['checkbox_border', 'setting-checkbox-border'],
    ['delete_button_bg', 'setting-delete-button-bg'],
    ['delete_button_bg_opacity', 'setting-delete-button-bg-opacity', true],
    ['delete_button_border', 'setting-delete-button-border'],
    ['delete_button_text', 'setting-delete-button-text'],
    ['delete_button_hover_bg', 'setting-delete-button-hover-bg'],
    ['delete_button_hover_bg_opacity', 'setting-delete-button-hover-bg-opacity', true],
    ['badge_youtube_bg', 'setting-badge-youtube-bg'],
    ['badge_youtube_bg_opacity', 'setting-badge-youtube-bg-opacity', true],
    ['badge_youtube_border', 'setting-badge-youtube-border'],
    ['badge_youtube_text', 'setting-badge-youtube-text'],
    ['badge_tiktok_bg', 'setting-badge-tiktok-bg'],
    ['badge_tiktok_bg_opacity', 'setting-badge-tiktok-bg-opacity', true],
    ['badge_tiktok_border', 'setting-badge-tiktok-border'],
    ['badge_tiktok_text', 'setting-badge-tiktok-text'],
    ['badge_discord_bg', 'setting-badge-discord-bg'],
    ['badge_discord_bg_opacity', 'setting-badge-discord-bg-opacity', true],
    ['badge_discord_border', 'setting-badge-discord-border'],
    ['badge_discord_text', 'setting-badge-discord-text'],
    ['badge_mp3_bg', 'setting-badge-mp3-bg'],
    ['badge_mp3_bg_opacity', 'setting-badge-mp3-bg-opacity', true],
    ['badge_mp3_border', 'setting-badge-mp3-border'],
    ['badge_mp3_text', 'setting-badge-mp3-text'],
    ['tempo_modal_bg', 'setting-tempo-modal-bg'],
    ['tempo_modal_bg_opacity', 'setting-tempo-modal-bg-opacity', true],
    ['tempo_modal_border', 'setting-tempo-modal-border'],
    ['tempo_modal_text', 'setting-tempo-modal-text'],
    ['tempo_modal_backdrop', 'setting-tempo-modal-backdrop'],
    ['custom_modal_bg', 'setting-custom-modal-bg'],
    ['custom_modal_bg_opacity', 'setting-custom-modal-bg-opacity', true],
    ['custom_modal_border', 'setting-custom-modal-border'],
    ['custom_modal_backdrop', 'setting-custom-modal-backdrop'],
    ['modal_close_bg', 'setting-modal-close-bg'],
    ['modal_close_text', 'setting-modal-close-text'],
    ['modal_close_hover_text', 'setting-modal-close-hover-text'],
    ['modal_action_primary_bg', 'setting-modal-action-primary-bg'],
    ['modal_action_primary_bg_opacity', 'setting-modal-action-primary-bg-opacity', true],
    ['modal_action_primary_text', 'setting-modal-action-primary-text'],
    ['modal_action_primary_hover_bg', 'setting-modal-action-primary-hover-bg'],
    ['modal_action_primary_hover_bg_opacity', 'setting-modal-action-primary-hover-bg-opacity', true],
    ['modal_action_secondary_bg', 'setting-modal-action-secondary-bg'],
    ['modal_action_secondary_bg_opacity', 'setting-modal-action-secondary-bg-opacity', true],
    ['modal_action_secondary_text', 'setting-modal-action-secondary-text'],
    ['modal_action_secondary_hover_bg', 'setting-modal-action-secondary-hover-bg'],
    ['modal_action_secondary_hover_bg_opacity', 'setting-modal-action-secondary-hover-bg-opacity', true],
    ['tempo_modal_button_text', 'setting-tempo-modal-button-text'],
    ['tempo_modal_button_hover_text', 'setting-tempo-modal-button-hover-text'],
  ];

  colorPairs.forEach(([key, elId, isFloat]) => {
    s[key] = isFloat ? parseFloat(getVal(elId)) : getVal(elId);
  });

  return s;
}

// --- Background ---

let currentVideoSrc = null;
let isVideoLoading = false;
let videoLoadTimeout = null;
let isInitialLoad = true;
let currentBackground = null;
let currentBackgroundOpacity = null;

function applyBackground(background, opacity) {
  if (currentBackground === background && currentBackgroundOpacity === opacity) return;
  currentBackground = background;
  currentBackgroundOpacity = opacity;

  const body = document.body;
  const root = document.documentElement;
  const videoElement = $id('background-video');

  function stopVideo() {
    if (!videoElement) return;
    videoElement.pause();
    videoElement.style.display = 'none';
    videoElement.preload = 'none';
    videoElement.src = '';
    videoElement.load();
    currentVideoSrc = null;
    isVideoLoading = false;
    if (videoLoadTimeout) { clearTimeout(videoLoadTimeout); videoLoadTimeout = null; }
  }

  if (background === 'gradient' || background === 'none') {
    body.classList.remove('has-wallpaper', 'has-wallpaper-video');
    root.style.setProperty('--wallpaper-image', 'none');
    stopVideo();
  } else {
    const fileExt = background.toLowerCase().split('.').pop();
    const isVideo = ['mp4', 'webm', 'mov'].includes(fileExt);

    if (isVideo) {
      body.classList.remove('has-wallpaper');
      body.classList.add('has-wallpaper-video');
      root.style.setProperty('--wallpaper-image', 'none');
      root.style.setProperty('--wallpaper-opacity', opacity);

      if (videoElement) {
        const newVideoSrc = `/wallpapers/${background}`;
        videoElement.style.display = 'block';
        if (currentVideoSrc !== newVideoSrc && !isVideoLoading) {
          if (videoLoadTimeout) { clearTimeout(videoLoadTimeout); videoLoadTimeout = null; }
          isVideoLoading = true;
          currentVideoSrc = newVideoSrc;
          videoElement.pause();
          videoElement.src = '';
          videoElement.load();
          videoElement.preload = 'metadata';
          videoElement.src = newVideoSrc;
          setTimeout(() => { isVideoLoading = false; }, 200);
        }
      }
    } else {
      body.classList.remove('has-wallpaper-video');
      body.classList.add('has-wallpaper');
      root.style.setProperty('--wallpaper-image', `url('/wallpapers/${background}')`);
      root.style.setProperty('--wallpaper-opacity', opacity);
      stopVideo();
    }
  }
  if (isInitialLoad) isInitialLoad = false;
}

// --- Color Utilities ---

function hexToRgba(hex, alpha = 0.2) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function hslToHex(h, s, l) {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

function relativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function adjustHsl(hex, { hShift = 0, sMult = 1, lShift = 0 }) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.h = (hsl.h + hShift + 360) % 360;
  hsl.s = Math.min(100, Math.max(0, hsl.s * sMult));
  hsl.l = Math.min(100, Math.max(0, hsl.l + lShift));
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

function adjustBrightness(hex, percent) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.l = Math.min(100, Math.max(0, hsl.l + percent * 0.5));
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

// --- Apply Colors ---

function resolveRgba(hex, opacityVal, fallbackHex, fallbackOp) {
  const color = hex || fallbackHex;
  const op = opacityVal !== undefined ? opacityVal : fallbackOp;
  return color.startsWith('#') ? hexToRgba(color, op) : color;
}

function resolveRgbaFromEl(hex, opElId, fallbackHex, fallbackOp) {
  const color = hex || fallbackHex;
  const op = parseFloat($id(opElId)?.value || String(fallbackOp));
  if (color.startsWith('#')) return hexToRgba(color, op);
  if (color.includes('rgba')) return color;
  return hexToRgba(fallbackHex, op);
}

function applyColors(settings) {
  const root = document.documentElement;

  function setBtn(prefix, bgKey, borderKey, textKey, hoverBgKey, hoverBorderKey, bgOpKey, hoverOpKey, defBgOp, defHoverOp) {
    root.style.setProperty(`--${prefix}-bg`, hexToRgba(settings[bgKey] || '#000', settings[bgOpKey] !== undefined ? settings[bgOpKey] : defBgOp));
    root.style.setProperty(`--${prefix}-border`, settings[borderKey] || '#000');
    root.style.setProperty(`--${prefix}-text`, settings[textKey] || '#fff');
    root.style.setProperty(`--${prefix}-hover-bg`, hexToRgba(settings[hoverBgKey] || '#000', settings[hoverOpKey] !== undefined ? settings[hoverOpKey] : defHoverOp));
    root.style.setProperty(`--${prefix}-hover-border`, settings[hoverBorderKey] || '#000');
  }

  setBtn('primary-button', 'primary_button_bg', 'primary_button_border', 'primary_button_text', 'primary_button_hover_bg', 'primary_button_hover_border', 'primary_button_bg_opacity', 'primary_button_hover_bg_opacity', 0.2, 0.3);
  setBtn('secondary-button', 'secondary_button_bg', 'secondary_button_border', 'secondary_button_text', 'secondary_button_hover_bg', 'secondary_button_hover_border', 'secondary_button_bg_opacity', 'secondary_button_hover_bg_opacity', 0.2, 0.3);
  setBtn('success-button', 'success_button_bg', 'success_button_border', 'success_button_text', 'success_button_hover_bg', 'success_button_hover_border', 'success_button_bg_opacity', 'success_button_hover_bg_opacity', 0.2, 0.3);

  root.style.setProperty('--text-color', settings.text_color || '#e5e7eb');
  root.style.setProperty('--text-secondary', settings.text_secondary || '#9ca3af');

  root.style.setProperty('--card-bg', resolveRgba(settings.card_bg, settings.card_bg_opacity, '#1f2937', 0.8));
  root.style.setProperty('--card-border', settings.card_border || '#374151');
  root.style.setProperty('--card-hover-border', resolveRgbaFromEl(settings.card_hover_border || '#9333ea', 'setting-card-hover-border-opacity', '#9333ea', 0.4));

  root.style.setProperty('--link-color', settings.link_color || '#9333ea');
  root.style.setProperty('--link-hover', settings.link_hover || '#a855f7');

  root.style.setProperty('--modal-bg', resolveRgba(settings.modal_bg, settings.modal_bg_opacity, '#1f2937', 1));
  root.style.setProperty('--modal-border', settings.modal_border || '#374151');
  root.style.setProperty('--modal-text', settings.modal_text || '#ffffff');
  root.style.setProperty('--modal-text-secondary', settings.modal_text_secondary || '#d1d5db');
  root.style.setProperty('--modal-text-tertiary', settings.modal_text_tertiary || '#9ca3af');
  root.style.setProperty('--modal-backdrop', resolveRgbaFromEl(settings.modal_backdrop || '#000000', 'setting-modal-backdrop-opacity', '#000000', 0.5));

  root.style.setProperty('--input-bg', settings.input_bg || '#374151');
  root.style.setProperty('--input-border', settings.input_border || '#4b5563');
  root.style.setProperty('--input-text', settings.input_text || '#ffffff');

  root.style.setProperty('--checkbox-bg', settings.checkbox_bg || '#4b5563');
  root.style.setProperty('--checkbox-checked', settings.checkbox_checked || '#9333ea');
  root.style.setProperty('--checkbox-border', settings.checkbox_border || '#6b7280');

  root.style.setProperty('--tab-active', settings.tab_active || '#9333ea');
  root.style.setProperty('--tab-inactive', settings.tab_inactive || '#9ca3af');

  root.style.setProperty('--history-item-bg', resolveRgba(settings.history_item_bg, settings.history_item_bg_opacity, '#374151', 0.4));
  root.style.setProperty('--history-item-border', settings.history_item_border || '#374151');
  root.style.setProperty('--history-item-hover-bg', resolveRgba(settings.history_item_hover_bg, settings.history_item_hover_bg_opacity, '#374151', 0.6));
  root.style.setProperty('--history-item-hover-border', resolveRgbaFromEl(settings.history_item_hover_border || '#9333ea', 'setting-history-item-hover-border-opacity', '#9333ea', 0.3));

  root.style.setProperty('--tempo-modal-bg', resolveRgba(settings.tempo_modal_bg, settings.tempo_modal_bg_opacity, '#1f2937', 1));
  root.style.setProperty('--tempo-modal-border', settings.tempo_modal_border || '#374151');
  root.style.setProperty('--tempo-modal-text', settings.tempo_modal_text || '#9ca3af');
  root.style.setProperty('--tempo-modal-backdrop', resolveRgbaFromEl(settings.tempo_modal_backdrop || '#000000', 'setting-tempo-modal-backdrop-opacity', '#000000', 0.5));

  root.style.setProperty('--custom-modal-bg', resolveRgba(settings.custom_modal_bg, settings.custom_modal_bg_opacity, '#1f2937', 1));
  root.style.setProperty('--custom-modal-border', settings.custom_modal_border || '#374151');
  root.style.setProperty('--custom-modal-backdrop', resolveRgbaFromEl(settings.custom_modal_backdrop || '#000000', 'setting-custom-modal-backdrop-opacity', '#000000', 0.5));

  root.style.setProperty('--modal-close-bg', settings.modal_close_bg || 'transparent');
  root.style.setProperty('--modal-close-text', settings.modal_close_text || '#9ca3af');
  root.style.setProperty('--modal-close-hover-text', settings.modal_close_hover_text || '#ffffff');

  root.style.setProperty('--modal-action-primary-bg', hexToRgba(settings.modal_action_primary_bg || '#9333ea', settings.modal_action_primary_bg_opacity !== undefined ? settings.modal_action_primary_bg_opacity : 1));
  root.style.setProperty('--modal-action-primary-text', settings.modal_action_primary_text || '#ffffff');
  root.style.setProperty('--modal-action-primary-hover-bg', hexToRgba(settings.modal_action_primary_hover_bg || '#7e22ce', settings.modal_action_primary_hover_bg_opacity !== undefined ? settings.modal_action_primary_hover_bg_opacity : 1));

  root.style.setProperty('--modal-action-secondary-bg', hexToRgba(settings.modal_action_secondary_bg || '#374151', settings.modal_action_secondary_bg_opacity !== undefined ? settings.modal_action_secondary_bg_opacity : 1));
  root.style.setProperty('--modal-action-secondary-text', settings.modal_action_secondary_text || '#ffffff');
  root.style.setProperty('--modal-action-secondary-hover-bg', hexToRgba(settings.modal_action_secondary_hover_bg || '#4b5563', settings.modal_action_secondary_hover_bg_opacity !== undefined ? settings.modal_action_secondary_hover_bg_opacity : 1));

  root.style.setProperty('--tempo-modal-button-text', settings.tempo_modal_button_text || '#9ca3af');
  root.style.setProperty('--tempo-modal-button-hover-text', settings.tempo_modal_button_hover_text || '#ffffff');
}

// --- Wallpaper preview ---

let currentPreviewVideoSrc = null;

function updateBackgroundPreview() {
  const backgroundSelect = $id('setting-background');
  const previewContainer = $id('wallpaper-preview-container');
  const preview = $id('wallpaper-preview');
  const previewVideo = $id('wallpaper-preview-video');
  const opacity = parseFloat($id('setting-background-opacity')?.value || '0.6');

  if (!backgroundSelect || !previewContainer || !preview) return;
  const selectedValue = backgroundSelect.value;

  function stopPreviewVideo() {
    if (!previewVideo) return;
    previewVideo.pause();
    previewVideo.style.display = 'none';
    previewVideo.preload = 'none';
    previewVideo.src = '';
    previewVideo.load();
    currentPreviewVideoSrc = null;
  }

  if (selectedValue === 'gradient' || selectedValue === 'none') {
    previewContainer.classList.add('hidden');
    preview.style.backgroundImage = 'none';
    stopPreviewVideo();
  } else {
    previewContainer.classList.remove('hidden');
    const wallpaper = wallpaperList.find(wp => wp.filename === selectedValue);
    const isVideo = wallpaper && wallpaper.type === 'video';

    if (isVideo) {
      preview.style.backgroundImage = 'none';
      if (previewVideo) {
        const newSrc = `/wallpapers/${selectedValue}`;
        if (currentPreviewVideoSrc !== newSrc) {
          previewVideo.pause();
          previewVideo.preload = 'metadata';
          previewVideo.src = newSrc;
          currentPreviewVideoSrc = newSrc;
        }
        previewVideo.style.display = 'block';
        previewVideo.style.opacity = opacity;
      }
    } else {
      preview.style.backgroundImage = `url('/wallpapers/${selectedValue}')`;
      preview.style.opacity = opacity;
      stopPreviewVideo();
    }
  }
}

// --- Modal open/close ---

const sheetsSettingsModal = $id('sheets-settings-modal');
const sheetsSettingsBtn = $id('sheets-settings-btn');
const closeSettingsModal = $id('close-settings-modal');
const saveSettingsBtn = $id('save-settings');
const resetSettingsBtn = $id('reset-settings');

function closeSettingsModalAnim() {
  if (!sheetsSettingsModal) return;
  sheetsSettingsModal.style.opacity = '0';
  const modalDiv = sheetsSettingsModal.querySelector('div');
  if (modalDiv) modalDiv.style.transform = 'scale(0.98)';
  setTimeout(() => {
    sheetsSettingsModal.classList.add('hidden');
    sheetsSettingsModal.style.opacity = '';
    if (modalDiv) modalDiv.style.transform = '';
  }, 150);
}

if (sheetsSettingsBtn) {
  sheetsSettingsBtn.addEventListener('click', async () => {
    const settings = await loadSheetsSettings();
    await populateSettingsModal(settings);
    sheetsSettingsModal.classList.remove('hidden');
    sheetsSettingsModal.style.opacity = '0';
    const modalDiv = sheetsSettingsModal.querySelector('div');
    if (modalDiv) modalDiv.style.transform = 'scale(0.98)';
    requestAnimationFrame(() => {
      sheetsSettingsModal.style.opacity = '1';
      if (modalDiv) modalDiv.style.transform = 'scale(1)';
    });
  });
}

if (closeSettingsModal) closeSettingsModal.addEventListener('click', closeSettingsModalAnim);

if (sheetsSettingsModal) {
  sheetsSettingsModal.addEventListener('click', (e) => {
    if (e.target === sheetsSettingsModal) closeSettingsModalAnim();
  });
}

if (saveSettingsBtn) {
  saveSettingsBtn.addEventListener('click', () => {
    const settings = getSettingsFromModal();
    saveSheetsSettings(settings);
    applyBackground(settings.background, settings.background_opacity);
    applyColors(settings);
    closeSettingsModalAnim();
  });
}

if (resetSettingsBtn) {
  resetSettingsBtn.addEventListener('click', async () => {
    const confirmed = await showConfirm('Reset all settings to defaults?', 'Reset Settings');
    if (confirmed) {
      await populateSettingsModal(defaultSheetsSettings);
      saveSheetsSettings(defaultSheetsSettings);
      applyBackground(defaultSheetsSettings.background, defaultSheetsSettings.background_opacity);
      applyColors(defaultSheetsSettings);
    }
  });
}

// --- Slider labels ---

$id('setting-resilience')?.addEventListener('input', (e) => setText('resilience-value', e.target.value));
$id('setting-break-lines-every')?.addEventListener('input', (e) => setText('break-lines-value', e.target.value));
$id('setting-quantize')?.addEventListener('input', (e) => setText('quantize-value', e.target.value));

$id('setting-background')?.addEventListener('change', () => {
  updateBackgroundPreview();
  applyBackground($id('setting-background').value, parseFloat($id('setting-background-opacity').value));
});

$id('setting-background-opacity')?.addEventListener('input', (e) => {
  const opacity = parseFloat(e.target.value);
  setText('background-opacity-value', Math.round(opacity * 100) + '%');
  updateBackgroundPreview();
  applyBackground($id('setting-background').value, opacity);
});

// --- Live color preview ---

const colorInputs = [
  'setting-primary-button-bg', 'setting-primary-button-border', 'setting-primary-button-text', 'setting-primary-button-hover-bg', 'setting-primary-button-hover-border',
  'setting-secondary-button-bg', 'setting-secondary-button-border', 'setting-secondary-button-text', 'setting-secondary-button-hover-bg', 'setting-secondary-button-hover-border',
  'setting-success-button-bg', 'setting-success-button-border', 'setting-success-button-text', 'setting-success-button-hover-bg', 'setting-success-button-hover-border',
  'setting-text-color', 'setting-text-secondary', 'setting-card-bg', 'setting-card-border',
  'setting-link-color', 'setting-link-hover',
  'setting-modal-bg', 'setting-modal-border', 'setting-modal-text', 'setting-modal-text-secondary', 'setting-modal-text-tertiary', 'setting-modal-backdrop',
  'setting-input-bg', 'setting-input-border', 'setting-input-text',
  'setting-tab-active', 'setting-tab-inactive',
  'setting-history-item-bg', 'setting-history-item-border', 'setting-history-item-hover-bg', 'setting-history-item-hover-border',
  'setting-checkbox-bg', 'setting-checkbox-checked', 'setting-checkbox-border',
  'setting-delete-button-bg', 'setting-delete-button-border', 'setting-delete-button-text', 'setting-delete-button-hover-bg',
  'setting-badge-youtube-bg', 'setting-badge-youtube-border', 'setting-badge-youtube-text',
  'setting-badge-tiktok-bg', 'setting-badge-tiktok-border', 'setting-badge-tiktok-text',
  'setting-badge-discord-bg', 'setting-badge-discord-border', 'setting-badge-discord-text',
  'setting-badge-mp3-bg', 'setting-badge-mp3-border', 'setting-badge-mp3-text',
  'setting-tempo-modal-bg', 'setting-tempo-modal-border', 'setting-tempo-modal-text', 'setting-tempo-modal-backdrop',
  'setting-custom-modal-bg', 'setting-custom-modal-border', 'setting-custom-modal-backdrop',
  'setting-modal-close-bg', 'setting-modal-close-text', 'setting-modal-close-hover-text',
  'setting-modal-action-primary-bg', 'setting-modal-action-primary-text', 'setting-modal-action-primary-hover-bg',
  'setting-modal-action-secondary-bg', 'setting-modal-action-secondary-text', 'setting-modal-action-secondary-hover-bg',
  'setting-tempo-modal-button-text', 'setting-tempo-modal-button-hover-text'
];

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const debouncedApplyColors = debounce(() => applyColors(getSettingsFromModal()), 150);

colorInputs.forEach(id => $id(id)?.addEventListener('input', debouncedApplyColors));

const opacityInputs = [
  { id: 'setting-primary-button-bg-opacity', valueId: 'primary-button-bg-opacity-value' },
  { id: 'setting-primary-button-hover-bg-opacity', valueId: 'primary-button-hover-bg-opacity-value' },
  { id: 'setting-secondary-button-bg-opacity', valueId: 'secondary-button-bg-opacity-value' },
  { id: 'setting-secondary-button-hover-bg-opacity', valueId: 'secondary-button-hover-bg-opacity-value' },
  { id: 'setting-success-button-bg-opacity', valueId: 'success-button-bg-opacity-value' },
  { id: 'setting-success-button-hover-bg-opacity', valueId: 'success-button-hover-bg-opacity-value' },
  { id: 'setting-card-bg-opacity', valueId: 'card-bg-opacity-value' },
  { id: 'setting-card-hover-border-opacity', valueId: 'card-hover-border-opacity-value' },
  { id: 'setting-modal-bg-opacity', valueId: 'modal-bg-opacity-value' },
  { id: 'setting-modal-backdrop-opacity', valueId: 'modal-backdrop-opacity-value' },
  { id: 'setting-history-item-bg-opacity', valueId: 'history-item-bg-opacity-value' },
  { id: 'setting-history-item-hover-bg-opacity', valueId: 'history-item-hover-bg-opacity-value' },
  { id: 'setting-history-item-hover-border-opacity', valueId: 'history-item-hover-border-opacity-value' },
  { id: 'setting-delete-button-bg-opacity', valueId: 'delete-button-bg-opacity-value' },
  { id: 'setting-delete-button-hover-bg-opacity', valueId: 'delete-button-hover-bg-opacity-value' },
  { id: 'setting-badge-youtube-bg-opacity', valueId: 'badge-youtube-bg-opacity-value' },
  { id: 'setting-badge-tiktok-bg-opacity', valueId: 'badge-tiktok-bg-opacity-value' },
  { id: 'setting-badge-discord-bg-opacity', valueId: 'badge-discord-bg-opacity-value' },
  { id: 'setting-badge-mp3-bg-opacity', valueId: 'badge-mp3-bg-opacity-value' },
  { id: 'setting-tempo-modal-bg-opacity', valueId: 'tempo-modal-bg-opacity-value' },
  { id: 'setting-tempo-modal-backdrop-opacity', valueId: 'tempo-modal-backdrop-opacity-value' },
  { id: 'setting-custom-modal-bg-opacity', valueId: 'custom-modal-bg-opacity-value' },
  { id: 'setting-custom-modal-backdrop-opacity', valueId: 'custom-modal-backdrop-opacity-value' },
  { id: 'setting-modal-action-primary-bg-opacity', valueId: 'modal-action-primary-bg-opacity-value' },
  { id: 'setting-modal-action-primary-hover-bg-opacity', valueId: 'modal-action-primary-hover-bg-opacity-value' },
  { id: 'setting-modal-action-secondary-bg-opacity', valueId: 'modal-action-secondary-bg-opacity-value' },
  { id: 'setting-modal-action-secondary-hover-bg-opacity', valueId: 'modal-action-secondary-hover-bg-opacity-value' }
];

opacityInputs.forEach(({ id, valueId }) => {
  $id(id)?.addEventListener('input', (e) => {
    setText(valueId, Math.round(parseFloat(e.target.value) * 100) + '%');
    applyColors(getSettingsFromModal());
  });
});

// --- Collapsible sections ---

document.querySelectorAll('.color-section-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.closest('.color-section');
    section.classList.toggle('open');
  });
});

// =====================================================================
// Match Colors - Improved algorithm with k-means clustering in HSL space
// =====================================================================

function colorDistance(c1, c2) {
  const dr = c1.r - c2.r, dg = c1.g - c2.g, db = c1.b - c2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function kMeansCluster(pixels, k, maxIter = 15) {
  if (pixels.length < k) return pixels.map(p => ({ ...p }));

  let centroids = [];
  centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);
  for (let i = 1; i < k; i++) {
    let maxDist = -1, bestPx = pixels[0];
    for (const px of pixels) {
      const minDist = Math.min(...centroids.map(c => colorDistance(px, c)));
      if (minDist > maxDist) { maxDist = minDist; bestPx = px; }
    }
    centroids.push(bestPx);
  }

  for (let iter = 0; iter < maxIter; iter++) {
    const clusters = Array.from({ length: k }, () => []);
    for (const px of pixels) {
      let minDist = Infinity, minIdx = 0;
      for (let i = 0; i < k; i++) {
        const d = colorDistance(px, centroids[i]);
        if (d < minDist) { minDist = d; minIdx = i; }
      }
      clusters[minIdx].push(px);
    }

    let converged = true;
    for (let i = 0; i < k; i++) {
      if (clusters[i].length === 0) continue;
      const avg = {
        r: Math.round(clusters[i].reduce((s, p) => s + p.r, 0) / clusters[i].length),
        g: Math.round(clusters[i].reduce((s, p) => s + p.g, 0) / clusters[i].length),
        b: Math.round(clusters[i].reduce((s, p) => s + p.b, 0) / clusters[i].length),
      };
      if (colorDistance(avg, centroids[i]) > 2) converged = false;
      centroids[i] = avg;
    }
    if (converged) break;
  }

  return centroids.map(c => ({ r: c.r, g: c.g, b: c.b, hex: rgbToHex(c.r, c.g, c.b) }));
}

function getDominantColors(imageElement, count = 6) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const SIZE = 200;
  canvas.width = SIZE;
  canvas.height = SIZE;

  ctx.drawImage(imageElement, 0, 0, SIZE, SIZE);
  const imageData = ctx.getImageData(0, 0, SIZE, SIZE);
  const data = imageData.data;
  const pixels = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 128) continue;
    const lum = relativeLuminance(r, g, b);
    if (lum < 0.01 || lum > 0.95) continue;
    pixels.push({ r, g, b });
  }

  if (pixels.length < count) return pixels.map(p => ({ ...p, hex: rgbToHex(p.r, p.g, p.b) }));

  const sampled = pixels.length > 5000
    ? pixels.filter((_, i) => i % Math.ceil(pixels.length / 5000) === 0)
    : pixels;

  let clusters = kMeansCluster(sampled, Math.min(count + 2, 10));

  clusters.sort((a, b) => {
    const hslA = rgbToHsl(a.r, a.g, a.b);
    const hslB = rgbToHsl(b.r, b.g, b.b);
    return (hslB.s + hslB.l * 0.3) - (hslA.s + hslA.l * 0.3);
  });

  const diverse = [clusters[0]];
  for (let i = 1; i < clusters.length && diverse.length < count; i++) {
    const tooClose = diverse.some(d => colorDistance(d, clusters[i]) < 40);
    if (!tooClose) diverse.push(clusters[i]);
  }

  while (diverse.length < count && clusters.length > diverse.length) {
    for (const c of clusters) {
      if (!diverse.includes(c)) { diverse.push(c); break; }
    }
  }

  return diverse.slice(0, count);
}

async function extractColorsFromBackground(background) {
  return new Promise((resolve) => {
    if (background === 'none' || background === 'gradient') { resolve(null); return; }
    const wallpaper = wallpaperList.find(wp => wp.filename === background);
    if (!wallpaper) { resolve(null); return; }

    if (wallpaper.type === 'video') {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = `/wallpapers/${background}`;
      video.muted = true;
      video.playsInline = true;

      const captureFrames = () => {
        const colors1 = getDominantColors(video, 6);
        if (video.duration > 3) {
          video.currentTime = Math.min(video.duration * 0.4, 10);
          video.addEventListener('seeked', function secondCapture() {
            video.removeEventListener('seeked', secondCapture);
            const colors2 = getDominantColors(video, 6);
            resolve([...colors1, ...colors2]);
          });
        } else {
          resolve(colors1);
        }
      };

      video.addEventListener('loadeddata', () => { video.currentTime = 1; });
      video.addEventListener('seeked', function firstCapture() {
        video.removeEventListener('seeked', firstCapture);
        captureFrames();
      });
      video.addEventListener('error', () => resolve(null));
      video.load();
    } else {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = `/wallpapers/${background}`;
      img.onload = () => resolve(getDominantColors(img, 6));
      img.onerror = () => resolve(null);
    }
  });
}

function generateColorScheme(colors) {
  if (!colors || colors.length === 0) return null;

  const diverse = [];
  const sorted = [...colors].sort((a, b) => {
    const hslA = rgbToHsl(a.r, a.g, a.b);
    const hslB = rgbToHsl(b.r, b.g, b.b);
    return (hslB.s * 1.5 + hslB.l * 0.5) - (hslA.s * 1.5 + hslA.l * 0.5);
  });

  for (const c of sorted) {
    if (diverse.length >= 3) break;
    const tooClose = diverse.some(d => colorDistance(d, c) < 50);
    if (!tooClose) diverse.push(c);
  }
  while (diverse.length < 3 && sorted.length > diverse.length) {
    diverse.push(sorted[diverse.length]);
  }

  const [primaryRaw, secondaryRaw, accentRaw] = diverse;

  const avgLum = colors.reduce((s, c) => s + relativeLuminance(c.r, c.g, c.b), 0) / colors.length;
  const isDark = avgLum < 0.2;

  const pHsl = rgbToHsl(primaryRaw.r, primaryRaw.g, primaryRaw.b);
  const sHsl = rgbToHsl(secondaryRaw.r, secondaryRaw.g, secondaryRaw.b);
  const aHsl = rgbToHsl(accentRaw.r, accentRaw.g, accentRaw.b);

  const primary = hslToHex(pHsl.h, Math.min(80, Math.max(30, pHsl.s)), isDark ? Math.min(55, Math.max(35, pHsl.l)) : Math.min(50, Math.max(30, pHsl.l)));
  const secondary = hslToHex(sHsl.h, Math.min(80, Math.max(30, sHsl.s)), isDark ? Math.min(55, Math.max(35, sHsl.l)) : Math.min(50, Math.max(30, sHsl.l)));
  const accent = hslToHex(aHsl.h, Math.min(80, Math.max(30, aHsl.s)), isDark ? Math.min(55, Math.max(35, aHsl.l)) : Math.min(50, Math.max(30, aHsl.l)));

  const textColor = isDark ? '#e5e7eb' : '#1f2937';
  const textSecondary = isDark ? '#9ca3af' : '#4b5563';
  const cardBg = isDark ? '#1f2937' : '#f9fafb';
  const cardBorder = isDark ? '#374151' : '#e5e7eb';
  const inputBg = isDark ? '#374151' : '#f3f4f6';
  const inputBorder = isDark ? '#4b5563' : '#d1d5db';

  function btnText(hex) {
    return isDark ? adjustHsl(hex, { lShift: 30, sMult: 0.7 }) : adjustHsl(hex, { lShift: -25, sMult: 0.8 });
  }

  return {
    primary_button_bg: primary,
    primary_button_border: adjustHsl(primary, { lShift: -10 }),
    primary_button_text: btnText(primary),
    primary_button_hover_bg: adjustHsl(primary, { lShift: 8 }),
    primary_button_hover_border: adjustHsl(primary, { lShift: 5 }),

    secondary_button_bg: secondary,
    secondary_button_border: adjustHsl(secondary, { lShift: -10 }),
    secondary_button_text: btnText(secondary),
    secondary_button_hover_bg: adjustHsl(secondary, { lShift: 8 }),
    secondary_button_hover_border: adjustHsl(secondary, { lShift: 5 }),

    success_button_bg: accent,
    success_button_border: adjustHsl(accent, { lShift: -10 }),
    success_button_text: btnText(accent),
    success_button_hover_bg: adjustHsl(accent, { lShift: 8 }),
    success_button_hover_border: adjustHsl(accent, { lShift: 5 }),

    text_color: textColor,
    text_secondary: textSecondary,
    card_bg: cardBg,
    card_border: cardBorder,
    link_color: secondary,
    link_hover: adjustHsl(secondary, { lShift: 10 }),
    modal_bg: cardBg,
    modal_border: cardBorder,
    modal_text: textColor,
    modal_text_secondary: textSecondary,
    modal_text_tertiary: isDark ? '#6b7280' : '#9ca3af',
    modal_backdrop: '#000000',
    input_bg: inputBg,
    input_border: inputBorder,
    input_text: textColor,
    tab_active: secondary,
    tab_inactive: textSecondary,
    history_item_bg: inputBg,
    history_item_border: cardBorder,
    checkbox_bg: isDark ? '#4b5563' : '#d1d5db',
    checkbox_checked: secondary,
    checkbox_border: isDark ? '#6b7280' : '#9ca3af',
    delete_button_bg: '#dc2626',
    delete_button_border: '#b91c1c',
    delete_button_text: '#fca5a5',
    delete_button_hover_bg: '#ef4444',
    badge_youtube_bg: '#dc2626',
    badge_youtube_border: '#b91c1c',
    badge_youtube_text: '#fca5a5',
    badge_tiktok_bg: secondary,
    badge_tiktok_border: adjustHsl(secondary, { lShift: -10 }),
    badge_tiktok_text: btnText(secondary),
    badge_discord_bg: accent,
    badge_discord_border: adjustHsl(accent, { lShift: -10 }),
    badge_discord_text: btnText(accent),
    badge_mp3_bg: accent,
    badge_mp3_border: adjustHsl(accent, { lShift: -10 }),
    badge_mp3_text: btnText(accent),
    tempo_modal_bg: cardBg,
    tempo_modal_border: cardBorder,
    tempo_modal_text: textSecondary,
    custom_modal_bg: cardBg,
    custom_modal_border: cardBorder,
    custom_modal_backdrop: '#000000',
    modal_close_bg: 'transparent',
    modal_close_text: textSecondary,
    modal_close_hover_text: textColor,
    modal_action_primary_bg: primary,
    modal_action_primary_text: '#ffffff',
    modal_action_primary_hover_bg: adjustHsl(primary, { lShift: -8 }),
    modal_action_secondary_bg: isDark ? '#374151' : '#e5e7eb',
    modal_action_secondary_text: textColor,
    modal_action_secondary_hover_bg: isDark ? '#4b5563' : '#d1d5db',
    tempo_modal_button_text: textSecondary,
    tempo_modal_button_hover_text: textColor,
  };
}

function applySchemeToInputs(scheme) {
  const idMap = {
    'setting-primary-button-bg': 'primary_button_bg',
    'setting-primary-button-border': 'primary_button_border',
    'setting-primary-button-text': 'primary_button_text',
    'setting-primary-button-hover-bg': 'primary_button_hover_bg',
    'setting-primary-button-hover-border': 'primary_button_hover_border',
    'setting-secondary-button-bg': 'secondary_button_bg',
    'setting-secondary-button-border': 'secondary_button_border',
    'setting-secondary-button-text': 'secondary_button_text',
    'setting-secondary-button-hover-bg': 'secondary_button_hover_bg',
    'setting-secondary-button-hover-border': 'secondary_button_hover_border',
    'setting-success-button-bg': 'success_button_bg',
    'setting-success-button-border': 'success_button_border',
    'setting-success-button-text': 'success_button_text',
    'setting-success-button-hover-bg': 'success_button_hover_bg',
    'setting-success-button-hover-border': 'success_button_hover_border',
    'setting-text-color': 'text_color',
    'setting-text-secondary': 'text_secondary',
    'setting-card-bg': 'card_bg',
    'setting-card-border': 'card_border',
    'setting-link-color': 'link_color',
    'setting-link-hover': 'link_hover',
    'setting-modal-bg': 'modal_bg',
    'setting-modal-border': 'modal_border',
    'setting-modal-text': 'modal_text',
    'setting-modal-text-secondary': 'modal_text_secondary',
    'setting-modal-text-tertiary': 'modal_text_tertiary',
    'setting-modal-backdrop': 'modal_backdrop',
    'setting-input-bg': 'input_bg',
    'setting-input-border': 'input_border',
    'setting-input-text': 'input_text',
    'setting-tab-active': 'tab_active',
    'setting-tab-inactive': 'tab_inactive',
    'setting-history-item-bg': 'history_item_bg',
    'setting-history-item-border': 'history_item_border',
    'setting-checkbox-bg': 'checkbox_bg',
    'setting-checkbox-checked': 'checkbox_checked',
    'setting-checkbox-border': 'checkbox_border',
    'setting-delete-button-bg': 'delete_button_bg',
    'setting-delete-button-border': 'delete_button_border',
    'setting-delete-button-text': 'delete_button_text',
    'setting-delete-button-hover-bg': 'delete_button_hover_bg',
    'setting-badge-youtube-bg': 'badge_youtube_bg',
    'setting-badge-youtube-border': 'badge_youtube_border',
    'setting-badge-youtube-text': 'badge_youtube_text',
    'setting-badge-tiktok-bg': 'badge_tiktok_bg',
    'setting-badge-tiktok-border': 'badge_tiktok_border',
    'setting-badge-tiktok-text': 'badge_tiktok_text',
    'setting-badge-discord-bg': 'badge_discord_bg',
    'setting-badge-discord-border': 'badge_discord_border',
    'setting-badge-discord-text': 'badge_discord_text',
    'setting-badge-mp3-bg': 'badge_mp3_bg',
    'setting-badge-mp3-border': 'badge_mp3_border',
    'setting-badge-mp3-text': 'badge_mp3_text',
    'setting-tempo-modal-bg': 'tempo_modal_bg',
    'setting-tempo-modal-border': 'tempo_modal_border',
    'setting-tempo-modal-text': 'tempo_modal_text',
    'setting-custom-modal-bg': 'custom_modal_bg',
    'setting-custom-modal-border': 'custom_modal_border',
    'setting-modal-close-bg': 'modal_close_bg',
    'setting-modal-close-text': 'modal_close_text',
    'setting-modal-close-hover-text': 'modal_close_hover_text',
    'setting-modal-action-primary-bg': 'modal_action_primary_bg',
    'setting-modal-action-primary-text': 'modal_action_primary_text',
    'setting-modal-action-primary-hover-bg': 'modal_action_primary_hover_bg',
    'setting-modal-action-secondary-bg': 'modal_action_secondary_bg',
    'setting-modal-action-secondary-text': 'modal_action_secondary_text',
    'setting-modal-action-secondary-hover-bg': 'modal_action_secondary_hover_bg',
    'setting-tempo-modal-button-text': 'tempo_modal_button_text',
    'setting-tempo-modal-button-hover-text': 'tempo_modal_button_hover_text',
  };

  for (const [elId, key] of Object.entries(idMap)) {
    if (scheme[key] !== undefined) setVal(elId, scheme[key]);
  }
}

async function matchColorsWithBackground() {
  const backgroundSelect = $id('setting-background');
  const bg = backgroundSelect.value;

  if (bg === 'none' || bg === 'gradient') {
    showAlert('Please select a background image or video first', 'Info');
    return;
  }

  const matchBtn = $id('match-colors-btn');
  const originalText = matchBtn.textContent;
  matchBtn.textContent = 'Analyzing...';
  matchBtn.disabled = true;

  try {
    const colors = await extractColorsFromBackground(bg);
    const scheme = generateColorScheme(colors);

    if (scheme) {
      applySchemeToInputs(scheme);
      applyColors(getSettingsFromModal());
      showAlert('Colors matched with background!', 'Success');
    } else {
      showAlert('Could not extract colors from background', 'Error');
    }
  } catch (error) {
    console.error('Error matching colors:', error);
    showAlert('Failed to match colors', 'Error');
  } finally {
    matchBtn.textContent = originalText;
    matchBtn.disabled = false;
  }
}

const matchColorsBtn = $id('match-colors-btn');
if (matchColorsBtn) matchColorsBtn.addEventListener('click', matchColorsWithBackground);

// --- Init ---

document.addEventListener('DOMContentLoaded', async () => {
  const syncSettings = loadSheetsSettingsSync();
  applyBackground(syncSettings.background || 'none', syncSettings.background_opacity || 0.6);
  applyColors(syncSettings);

  loadSheetsSettings().then(async settings => {
    const newBg = settings.background || 'none';
    const newOp = settings.background_opacity || 0.6;
    if (currentBackground !== newBg || currentBackgroundOpacity !== newOp) {
      applyBackground(newBg, newOp);
    }
    applyColors(settings);
    try { await populateSettingsModal(settings); }
    catch (err) { console.error('Failed to populate settings modal:', err); }
  }).catch(err => {
    console.error('Failed to load settings:', err);
  });
});
