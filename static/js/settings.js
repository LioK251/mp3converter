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

async function loadSheetsSettings() {
  try {
    const response = await fetch('/api/settings');
    if (response.ok) {
      const saved = await response.json();
      if (saved && Object.keys(saved).length > 0) {
        return { ...defaultSheetsSettings, ...saved };
      }
    }
  } catch (e) {
    console.warn('Failed to load settings from API, trying localStorage:', e);
  }
  
  let saved = null;
  try {
    saved = localStorage.getItem('sheetsSettings');
  } catch (e) {
    console.warn('localStorage not available, trying pywebview:', e);
  }
  
  if (!saved && window.pywebview) {
    try {
      saved = window.pywebview.api.load_settings();
    } catch (e) {
      console.warn('Failed to load settings via pywebview:', e);
    }
  }
  
  if (saved) {
    try {
      const parsed = typeof saved === 'string' ? JSON.parse(saved) : saved;
      return { ...defaultSheetsSettings, ...parsed };
    } catch (e) {
      console.error('Failed to parse saved settings:', e);
    }
  }
  return defaultSheetsSettings;
}

async function saveSheetsSettings(settings) {
  try {
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save settings: ${response.statusText}`);
    }
    
    console.log('Settings saved to settings.json');
  } catch (e) {
    console.error('Failed to save settings to API, trying localStorage:', e);
  try {
    localStorage.setItem('sheetsSettings', JSON.stringify(settings));
    } catch (localStorageError) {
      console.error('Failed to save to localStorage:', localStorageError);
    }
    }
  
    if (window.pywebview) {
      try {
        window.pywebview.api.save_settings(JSON.stringify(settings));
      } catch (err) {
        console.error('Failed to save settings via pywebview:', err);
      }
    }
}

let wallpaperList = [];

async function loadWallpapers() {
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
}

async function populateSettingsModal(settings) {
  document.getElementById('setting-resilience').value = settings.resilience;
  document.getElementById('resilience-value').textContent = settings.resilience;
  document.getElementById('setting-place-shifted').value = settings.place_shifted_notes;
  document.getElementById('setting-place-out-of-range').value = settings.place_out_of_range_notes;
  document.getElementById('setting-break-lines-how').value = settings.break_lines_how;
  document.getElementById('setting-break-lines-every').value = settings.break_lines_every;
  document.getElementById('break-lines-value').textContent = settings.break_lines_every;
  document.getElementById('setting-quantize').value = settings.quantize;
  document.getElementById('quantize-value').textContent = settings.quantize;
  document.getElementById('setting-classic-chord-order').checked = settings.classic_chord_order;
  document.getElementById('setting-sequential-quantizes').checked = settings.sequential_quantizes;
  document.getElementById('setting-curly-braces').checked = settings.curly_braces_for_quantized_chords;
  document.getElementById('setting-include-out-of-range').checked = settings.include_out_of_range;
  document.getElementById('setting-show-tempo-marks').checked = settings.show_tempo_timing_marks;
  document.getElementById('setting-show-out-of-range-marks').checked = settings.show_out_of_range_text_marks;
  document.getElementById('setting-out-of-range-separator').value = settings.out_of_range_separator;
  document.getElementById('setting-show-bpm-changes').checked = settings.show_bpm_changes_as_comments;
  document.getElementById('setting-auto-transpose').checked = settings.auto_transpose;
  document.getElementById('setting-center-sheet-text').checked = settings.center_sheet_text || false;
  
  const wallpapers = await loadWallpapers();
  const backgroundSelect = document.getElementById('setting-background');
  if (backgroundSelect) {
    const gradientOption = backgroundSelect.querySelector('option[value="gradient"]');
    const noneOption = backgroundSelect.querySelector('option[value="none"]');
    backgroundSelect.innerHTML = '';
    if (gradientOption) backgroundSelect.appendChild(gradientOption);
    if (noneOption) backgroundSelect.appendChild(noneOption);
    
    wallpapers.forEach(wp => {
      const option = document.createElement('option');
      option.value = wp.filename;
      const displayName = wp.filename.replace(/_/g, ' ').replace(/\.(jpg|jpeg|png|gif|webp|mp4|webm|mov)$/i, '');
      option.textContent = displayName + (wp.type === 'video' ? ' (Video)' : '');
      backgroundSelect.appendChild(option);
    });
    
    const backgroundValue = settings.background || 'gradient';
    if (backgroundValue === 'gradient' || backgroundValue === 'none') {
      backgroundSelect.value = backgroundValue;
    } else {
      const wallpaperExists = wallpapers.some(wp => wp.filename === backgroundValue);
      backgroundSelect.value = wallpaperExists ? backgroundValue : 'gradient';
    }
    
    updateBackgroundPreview();
  }
  
  const opacity = settings.background_opacity !== undefined ? settings.background_opacity : 0.6;
  document.getElementById('setting-background-opacity').value = opacity;
  document.getElementById('background-opacity-value').textContent = Math.round(opacity * 100) + '%';
  
  document.getElementById('setting-primary-button-bg').value = settings.primary_button_bg || '#2563eb';
  document.getElementById('setting-primary-button-bg-opacity').value = settings.primary_button_bg_opacity !== undefined ? settings.primary_button_bg_opacity : 0.2;
  document.getElementById('primary-button-bg-opacity-value').textContent = Math.round((settings.primary_button_bg_opacity !== undefined ? settings.primary_button_bg_opacity : 0.2) * 100) + '%';
  document.getElementById('setting-primary-button-border').value = settings.primary_button_border || '#1d4ed8';
  document.getElementById('setting-primary-button-text').value = settings.primary_button_text || '#93c5fd';
  document.getElementById('setting-primary-button-hover-bg').value = settings.primary_button_hover_bg || '#3b82f6';
  document.getElementById('setting-primary-button-hover-bg-opacity').value = settings.primary_button_hover_bg_opacity !== undefined ? settings.primary_button_hover_bg_opacity : 0.3;
  document.getElementById('primary-button-hover-bg-opacity-value').textContent = Math.round((settings.primary_button_hover_bg_opacity !== undefined ? settings.primary_button_hover_bg_opacity : 0.3) * 100) + '%';
  document.getElementById('setting-primary-button-hover-border').value = settings.primary_button_hover_border || '#3b82f6';
  
  document.getElementById('setting-secondary-button-bg').value = settings.secondary_button_bg || '#9333ea';
  document.getElementById('setting-secondary-button-bg-opacity').value = settings.secondary_button_bg_opacity !== undefined ? settings.secondary_button_bg_opacity : 0.2;
  document.getElementById('secondary-button-bg-opacity-value').textContent = Math.round((settings.secondary_button_bg_opacity !== undefined ? settings.secondary_button_bg_opacity : 0.2) * 100) + '%';
  document.getElementById('setting-secondary-button-border').value = settings.secondary_button_border || '#7e22ce';
  document.getElementById('setting-secondary-button-text').value = settings.secondary_button_text || '#c084fc';
  document.getElementById('setting-secondary-button-hover-bg').value = settings.secondary_button_hover_bg || '#a855f7';
  document.getElementById('setting-secondary-button-hover-bg-opacity').value = settings.secondary_button_hover_bg_opacity !== undefined ? settings.secondary_button_hover_bg_opacity : 0.3;
  document.getElementById('secondary-button-hover-bg-opacity-value').textContent = Math.round((settings.secondary_button_hover_bg_opacity !== undefined ? settings.secondary_button_hover_bg_opacity : 0.3) * 100) + '%';
  document.getElementById('setting-secondary-button-hover-border').value = settings.secondary_button_hover_border || '#a855f7';
  
  document.getElementById('setting-success-button-bg').value = settings.success_button_bg || '#059669';
  document.getElementById('setting-success-button-bg-opacity').value = settings.success_button_bg_opacity !== undefined ? settings.success_button_bg_opacity : 0.2;
  document.getElementById('success-button-bg-opacity-value').textContent = Math.round((settings.success_button_bg_opacity !== undefined ? settings.success_button_bg_opacity : 0.2) * 100) + '%';
  document.getElementById('setting-success-button-border').value = settings.success_button_border || '#047857';
  document.getElementById('setting-success-button-text').value = settings.success_button_text || '#6ee7b7';
  document.getElementById('setting-success-button-hover-bg').value = settings.success_button_hover_bg || '#10b981';
  document.getElementById('setting-success-button-hover-bg-opacity').value = settings.success_button_hover_bg_opacity !== undefined ? settings.success_button_hover_bg_opacity : 0.3;
  document.getElementById('success-button-hover-bg-opacity-value').textContent = Math.round((settings.success_button_hover_bg_opacity !== undefined ? settings.success_button_hover_bg_opacity : 0.3) * 100) + '%';
  document.getElementById('setting-success-button-hover-border').value = settings.success_button_hover_border || '#10b981';
  
  document.getElementById('setting-text-color').value = settings.text_color || '#e5e7eb';
  document.getElementById('setting-text-secondary').value = settings.text_secondary || '#9ca3af';
  document.getElementById('setting-card-bg').value = settings.card_bg || '#1f2937';
  document.getElementById('setting-card-bg-opacity').value = settings.card_bg_opacity !== undefined ? settings.card_bg_opacity : 0.8;
  document.getElementById('card-bg-opacity-value').textContent = Math.round((settings.card_bg_opacity !== undefined ? settings.card_bg_opacity : 0.8) * 100) + '%';
  document.getElementById('setting-card-border').value = settings.card_border || '#374151';
  document.getElementById('setting-card-hover-border').value = settings.card_hover_border ? (settings.card_hover_border.startsWith('#') ? settings.card_hover_border : '#9333ea') : '#9333ea';
  const cardHoverBorderOpacity = settings.card_hover_border ? (settings.card_hover_border.includes('rgba') ? parseFloat(settings.card_hover_border.match(/[\d.]+/g)?.[3] || '0.4') : 0.4) : 0.4;
  document.getElementById('setting-card-hover-border-opacity').value = cardHoverBorderOpacity;
  document.getElementById('card-hover-border-opacity-value').textContent = Math.round(cardHoverBorderOpacity * 100) + '%';
  document.getElementById('setting-link-color').value = settings.link_color || '#9333ea';
  document.getElementById('setting-link-hover').value = settings.link_hover || '#a855f7';
  
  document.getElementById('setting-modal-bg').value = settings.modal_bg || '#1f2937';
  document.getElementById('setting-modal-bg-opacity').value = settings.modal_bg_opacity !== undefined ? settings.modal_bg_opacity : 1;
  document.getElementById('modal-bg-opacity-value').textContent = Math.round((settings.modal_bg_opacity !== undefined ? settings.modal_bg_opacity : 1) * 100) + '%';
  document.getElementById('setting-modal-border').value = settings.modal_border || '#374151';
  document.getElementById('setting-modal-text').value = settings.modal_text || '#ffffff';
  document.getElementById('setting-modal-text-secondary').value = settings.modal_text_secondary || '#d1d5db';
  document.getElementById('setting-modal-text-tertiary').value = settings.modal_text_tertiary || '#9ca3af';
  document.getElementById('setting-modal-backdrop').value = settings.modal_backdrop ? (settings.modal_backdrop.startsWith('#') ? settings.modal_backdrop : '#000000') : '#000000';
  const backdropOpacity = settings.modal_backdrop ? (settings.modal_backdrop.includes('rgba') ? parseFloat(settings.modal_backdrop.match(/[\d.]+/g)?.[3] || '0.5') : 0.5) : 0.5;
  document.getElementById('setting-modal-backdrop-opacity').value = backdropOpacity;
  document.getElementById('modal-backdrop-opacity-value').textContent = Math.round(backdropOpacity * 100) + '%';
  
  document.getElementById('setting-input-bg').value = settings.input_bg || '#374151';
  document.getElementById('setting-input-border').value = settings.input_border || '#4b5563';
  document.getElementById('setting-input-text').value = settings.input_text || '#ffffff';
  
  document.getElementById('setting-tab-active').value = settings.tab_active || '#9333ea';
  document.getElementById('setting-tab-inactive').value = settings.tab_inactive || '#9ca3af';
  
  document.getElementById('setting-history-item-bg').value = settings.history_item_bg || '#374151';
  document.getElementById('setting-history-item-bg-opacity').value = settings.history_item_bg_opacity !== undefined ? settings.history_item_bg_opacity : 0.4;
  document.getElementById('history-item-bg-opacity-value').textContent = Math.round((settings.history_item_bg_opacity !== undefined ? settings.history_item_bg_opacity : 0.4) * 100) + '%';
  document.getElementById('setting-history-item-border').value = settings.history_item_border || '#374151';
  document.getElementById('setting-history-item-hover-bg').value = settings.history_item_hover_bg ? (settings.history_item_hover_bg.startsWith('#') ? settings.history_item_hover_bg : '#374151') : '#374151';
  document.getElementById('setting-history-item-hover-bg-opacity').value = settings.history_item_hover_bg_opacity !== undefined ? settings.history_item_hover_bg_opacity : 0.6;
  document.getElementById('history-item-hover-bg-opacity-value').textContent = Math.round((settings.history_item_hover_bg_opacity !== undefined ? settings.history_item_hover_bg_opacity : 0.6) * 100) + '%';
  document.getElementById('setting-history-item-hover-border').value = settings.history_item_hover_border ? (settings.history_item_hover_border.startsWith('#') ? settings.history_item_hover_border : '#9333ea') : '#9333ea';
  const historyHoverBorderOpacity = settings.history_item_hover_border ? (settings.history_item_hover_border.includes('rgba') ? parseFloat(settings.history_item_hover_border.match(/[\d.]+/g)?.[3] || '0.3') : 0.3) : 0.3;
  document.getElementById('setting-history-item-hover-border-opacity').value = historyHoverBorderOpacity;
  document.getElementById('history-item-hover-border-opacity-value').textContent = Math.round(historyHoverBorderOpacity * 100) + '%';
  
  document.getElementById('setting-checkbox-bg').value = settings.checkbox_bg || '#4b5563';
  document.getElementById('setting-checkbox-checked').value = settings.checkbox_checked || '#9333ea';
  document.getElementById('setting-checkbox-border').value = settings.checkbox_border || '#6b7280';
  
  document.getElementById('setting-delete-button-bg').value = settings.delete_button_bg || '#dc2626';
  document.getElementById('setting-delete-button-bg-opacity').value = settings.delete_button_bg_opacity !== undefined ? settings.delete_button_bg_opacity : 0.3;
  document.getElementById('delete-button-bg-opacity-value').textContent = Math.round((settings.delete_button_bg_opacity !== undefined ? settings.delete_button_bg_opacity : 0.3) * 100) + '%';
  document.getElementById('setting-delete-button-border').value = settings.delete_button_border || '#b91c1c';
  document.getElementById('setting-delete-button-text').value = settings.delete_button_text || '#fca5a5';
  document.getElementById('setting-delete-button-hover-bg').value = settings.delete_button_hover_bg || '#ef4444';
  document.getElementById('setting-delete-button-hover-bg-opacity').value = settings.delete_button_hover_bg_opacity !== undefined ? settings.delete_button_hover_bg_opacity : 0.5;
  document.getElementById('delete-button-hover-bg-opacity-value').textContent = Math.round((settings.delete_button_hover_bg_opacity !== undefined ? settings.delete_button_hover_bg_opacity : 0.5) * 100) + '%';
  
  document.getElementById('setting-badge-youtube-bg').value = settings.badge_youtube_bg || '#dc2626';
  document.getElementById('setting-badge-youtube-bg-opacity').value = settings.badge_youtube_bg_opacity !== undefined ? settings.badge_youtube_bg_opacity : 0.3;
  document.getElementById('badge-youtube-bg-opacity-value').textContent = Math.round((settings.badge_youtube_bg_opacity !== undefined ? settings.badge_youtube_bg_opacity : 0.3) * 100) + '%';
  document.getElementById('setting-badge-youtube-border').value = settings.badge_youtube_border || '#b91c1c';
  document.getElementById('setting-badge-youtube-text').value = settings.badge_youtube_text || '#fca5a5';
  
  document.getElementById('setting-badge-tiktok-bg').value = settings.badge_tiktok_bg || '#9333ea';
  document.getElementById('setting-badge-tiktok-bg-opacity').value = settings.badge_tiktok_bg_opacity !== undefined ? settings.badge_tiktok_bg_opacity : 0.3;
  document.getElementById('badge-tiktok-bg-opacity-value').textContent = Math.round((settings.badge_tiktok_bg_opacity !== undefined ? settings.badge_tiktok_bg_opacity : 0.3) * 100) + '%';
  document.getElementById('setting-badge-tiktok-border').value = settings.badge_tiktok_border || '#7e22ce';
  document.getElementById('setting-badge-tiktok-text').value = settings.badge_tiktok_text || '#c084fc';
  
  document.getElementById('setting-badge-discord-bg').value = settings.badge_discord_bg || '#6366f1';
  document.getElementById('setting-badge-discord-bg-opacity').value = settings.badge_discord_bg_opacity !== undefined ? settings.badge_discord_bg_opacity : 0.3;
  document.getElementById('badge-discord-bg-opacity-value').textContent = Math.round((settings.badge_discord_bg_opacity !== undefined ? settings.badge_discord_bg_opacity : 0.3) * 100) + '%';
  document.getElementById('setting-badge-discord-border').value = settings.badge_discord_border || '#4f46e5';
  document.getElementById('setting-badge-discord-text').value = settings.badge_discord_text || '#a5b4fc';
  
  document.getElementById('setting-badge-mp3-bg').value = settings.badge_mp3_bg || '#6366f1';
  document.getElementById('setting-badge-mp3-bg-opacity').value = settings.badge_mp3_bg_opacity !== undefined ? settings.badge_mp3_bg_opacity : 0.3;
  document.getElementById('badge-mp3-bg-opacity-value').textContent = Math.round((settings.badge_mp3_bg_opacity !== undefined ? settings.badge_mp3_bg_opacity : 0.3) * 100) + '%';
  document.getElementById('setting-badge-mp3-border').value = settings.badge_mp3_border || '#4f46e5';
  document.getElementById('setting-badge-mp3-text').value = settings.badge_mp3_text || '#a5b4fc';
  
  document.getElementById('setting-tempo-modal-bg').value = settings.tempo_modal_bg || '#1f2937';
  document.getElementById('setting-tempo-modal-bg-opacity').value = settings.tempo_modal_bg_opacity !== undefined ? settings.tempo_modal_bg_opacity : 1;
  document.getElementById('tempo-modal-bg-opacity-value').textContent = Math.round((settings.tempo_modal_bg_opacity !== undefined ? settings.tempo_modal_bg_opacity : 1) * 100) + '%';
  document.getElementById('setting-tempo-modal-border').value = settings.tempo_modal_border || '#374151';
  document.getElementById('setting-tempo-modal-text').value = settings.tempo_modal_text || '#9ca3af';
  document.getElementById('setting-tempo-modal-backdrop').value = settings.tempo_modal_backdrop ? (settings.tempo_modal_backdrop.startsWith('#') ? settings.tempo_modal_backdrop : '#000000') : '#000000';
  const tempoBackdropOpacity = settings.tempo_modal_backdrop ? (settings.tempo_modal_backdrop.includes('rgba') ? parseFloat(settings.tempo_modal_backdrop.match(/[\d.]+/g)?.[3] || '0.5') : 0.5) : 0.5;
  document.getElementById('setting-tempo-modal-backdrop-opacity').value = tempoBackdropOpacity;
  document.getElementById('tempo-modal-backdrop-opacity-value').textContent = Math.round(tempoBackdropOpacity * 100) + '%';
  
  document.getElementById('setting-custom-modal-bg').value = settings.custom_modal_bg || '#1f2937';
  document.getElementById('setting-custom-modal-bg-opacity').value = settings.custom_modal_bg_opacity !== undefined ? settings.custom_modal_bg_opacity : 1;
  document.getElementById('custom-modal-bg-opacity-value').textContent = Math.round((settings.custom_modal_bg_opacity !== undefined ? settings.custom_modal_bg_opacity : 1) * 100) + '%';
  document.getElementById('setting-custom-modal-border').value = settings.custom_modal_border || '#374151';
  document.getElementById('setting-custom-modal-backdrop').value = settings.custom_modal_backdrop ? (settings.custom_modal_backdrop.startsWith('#') ? settings.custom_modal_backdrop : '#000000') : '#000000';
  const customBackdropOpacity = settings.custom_modal_backdrop ? (settings.custom_modal_backdrop.includes('rgba') ? parseFloat(settings.custom_modal_backdrop.match(/[\d.]+/g)?.[3] || '0.5') : 0.5) : 0.5;
  document.getElementById('setting-custom-modal-backdrop-opacity').value = customBackdropOpacity;
  document.getElementById('custom-modal-backdrop-opacity-value').textContent = Math.round(customBackdropOpacity * 100) + '%';
  
  document.getElementById('setting-modal-close-bg').value = settings.modal_close_bg || 'transparent';
  document.getElementById('setting-modal-close-text').value = settings.modal_close_text || '#9ca3af';
  document.getElementById('setting-modal-close-hover-text').value = settings.modal_close_hover_text || '#ffffff';
  
  document.getElementById('setting-modal-action-primary-bg').value = settings.modal_action_primary_bg || '#9333ea';
  document.getElementById('setting-modal-action-primary-bg-opacity').value = settings.modal_action_primary_bg_opacity !== undefined ? settings.modal_action_primary_bg_opacity : 1;
  document.getElementById('modal-action-primary-bg-opacity-value').textContent = Math.round((settings.modal_action_primary_bg_opacity !== undefined ? settings.modal_action_primary_bg_opacity : 1) * 100) + '%';
  document.getElementById('setting-modal-action-primary-text').value = settings.modal_action_primary_text || '#ffffff';
  document.getElementById('setting-modal-action-primary-hover-bg').value = settings.modal_action_primary_hover_bg || '#7e22ce';
  document.getElementById('setting-modal-action-primary-hover-bg-opacity').value = settings.modal_action_primary_hover_bg_opacity !== undefined ? settings.modal_action_primary_hover_bg_opacity : 1;
  document.getElementById('modal-action-primary-hover-bg-opacity-value').textContent = Math.round((settings.modal_action_primary_hover_bg_opacity !== undefined ? settings.modal_action_primary_hover_bg_opacity : 1) * 100) + '%';
  
  document.getElementById('setting-modal-action-secondary-bg').value = settings.modal_action_secondary_bg || '#374151';
  document.getElementById('setting-modal-action-secondary-bg-opacity').value = settings.modal_action_secondary_bg_opacity !== undefined ? settings.modal_action_secondary_bg_opacity : 1;
  document.getElementById('modal-action-secondary-bg-opacity-value').textContent = Math.round((settings.modal_action_secondary_bg_opacity !== undefined ? settings.modal_action_secondary_bg_opacity : 1) * 100) + '%';
  document.getElementById('setting-modal-action-secondary-text').value = settings.modal_action_secondary_text || '#ffffff';
  document.getElementById('setting-modal-action-secondary-hover-bg').value = settings.modal_action_secondary_hover_bg || '#4b5563';
  document.getElementById('setting-modal-action-secondary-hover-bg-opacity').value = settings.modal_action_secondary_hover_bg_opacity !== undefined ? settings.modal_action_secondary_hover_bg_opacity : 1;
  document.getElementById('modal-action-secondary-hover-bg-opacity-value').textContent = Math.round((settings.modal_action_secondary_hover_bg_opacity !== undefined ? settings.modal_action_secondary_hover_bg_opacity : 1) * 100) + '%';
  
  document.getElementById('setting-tempo-modal-button-text').value = settings.tempo_modal_button_text || '#9ca3af';
  document.getElementById('setting-tempo-modal-button-hover-text').value = settings.tempo_modal_button_hover_text || '#ffffff';
  
  applyColors(settings);
}

function getSettingsFromModal() {
  return {
    resilience: parseInt(document.getElementById('setting-resilience').value),
    place_shifted_notes: document.getElementById('setting-place-shifted').value,
    place_out_of_range_notes: document.getElementById('setting-place-out-of-range').value,
    break_lines_how: document.getElementById('setting-break-lines-how').value,
    break_lines_every: parseInt(document.getElementById('setting-break-lines-every').value),
    quantize: parseInt(document.getElementById('setting-quantize').value),
    classic_chord_order: document.getElementById('setting-classic-chord-order').checked,
    sequential_quantizes: document.getElementById('setting-sequential-quantizes').checked,
    curly_braces_for_quantized_chords: document.getElementById('setting-curly-braces').checked,
    include_out_of_range: document.getElementById('setting-include-out-of-range').checked,
    show_tempo_timing_marks: document.getElementById('setting-show-tempo-marks').checked,
    show_out_of_range_text_marks: document.getElementById('setting-show-out-of-range-marks').checked,
    out_of_range_separator: document.getElementById('setting-out-of-range-separator').value,
    show_bpm_changes_as_comments: document.getElementById('setting-show-bpm-changes').checked,
    auto_transpose: document.getElementById('setting-auto-transpose').checked,
    center_sheet_text: document.getElementById('setting-center-sheet-text').checked,
    background: document.getElementById('setting-background').value,
    background_opacity: parseFloat(document.getElementById('setting-background-opacity').value),
    primary_button_bg: document.getElementById('setting-primary-button-bg').value,
    primary_button_bg_opacity: parseFloat(document.getElementById('setting-primary-button-bg-opacity').value),
    primary_button_border: document.getElementById('setting-primary-button-border').value,
    primary_button_text: document.getElementById('setting-primary-button-text').value,
    primary_button_hover_bg: document.getElementById('setting-primary-button-hover-bg').value,
    primary_button_hover_bg_opacity: parseFloat(document.getElementById('setting-primary-button-hover-bg-opacity').value),
    primary_button_hover_border: document.getElementById('setting-primary-button-hover-border').value,
    secondary_button_bg: document.getElementById('setting-secondary-button-bg').value,
    secondary_button_bg_opacity: parseFloat(document.getElementById('setting-secondary-button-bg-opacity').value),
    secondary_button_border: document.getElementById('setting-secondary-button-border').value,
    secondary_button_text: document.getElementById('setting-secondary-button-text').value,
    secondary_button_hover_bg: document.getElementById('setting-secondary-button-hover-bg').value,
    secondary_button_hover_bg_opacity: parseFloat(document.getElementById('setting-secondary-button-hover-bg-opacity').value),
    secondary_button_hover_border: document.getElementById('setting-secondary-button-hover-border').value,
    success_button_bg: document.getElementById('setting-success-button-bg').value,
    success_button_bg_opacity: parseFloat(document.getElementById('setting-success-button-bg-opacity').value),
    success_button_border: document.getElementById('setting-success-button-border').value,
    success_button_text: document.getElementById('setting-success-button-text').value,
    success_button_hover_bg: document.getElementById('setting-success-button-hover-bg').value,
    success_button_hover_bg_opacity: parseFloat(document.getElementById('setting-success-button-hover-bg-opacity').value),
    success_button_hover_border: document.getElementById('setting-success-button-hover-border').value,
    text_color: document.getElementById('setting-text-color').value,
    text_secondary: document.getElementById('setting-text-secondary').value,
    card_bg: document.getElementById('setting-card-bg').value,
    card_bg_opacity: parseFloat(document.getElementById('setting-card-bg-opacity').value),
    card_border: document.getElementById('setting-card-border').value,
    card_hover_border: document.getElementById('setting-card-hover-border').value,
    link_color: document.getElementById('setting-link-color').value,
    link_hover: document.getElementById('setting-link-hover').value,
    modal_bg: document.getElementById('setting-modal-bg').value,
    modal_bg_opacity: parseFloat(document.getElementById('setting-modal-bg-opacity').value),
    modal_border: document.getElementById('setting-modal-border').value,
    modal_text: document.getElementById('setting-modal-text').value,
    modal_text_secondary: document.getElementById('setting-modal-text-secondary').value,
    modal_text_tertiary: document.getElementById('setting-modal-text-tertiary').value,
    modal_backdrop: document.getElementById('setting-modal-backdrop').value,
    input_bg: document.getElementById('setting-input-bg').value,
    input_border: document.getElementById('setting-input-border').value,
    input_text: document.getElementById('setting-input-text').value,
    tab_active: document.getElementById('setting-tab-active').value,
    tab_inactive: document.getElementById('setting-tab-inactive').value,
    history_item_bg: document.getElementById('setting-history-item-bg').value,
    history_item_bg_opacity: parseFloat(document.getElementById('setting-history-item-bg-opacity').value),
    history_item_border: document.getElementById('setting-history-item-border').value,
    history_item_hover_bg: document.getElementById('setting-history-item-hover-bg').value,
    history_item_hover_bg_opacity: parseFloat(document.getElementById('setting-history-item-hover-bg-opacity').value),
    history_item_hover_border: document.getElementById('setting-history-item-hover-border').value,
    checkbox_bg: document.getElementById('setting-checkbox-bg').value,
    checkbox_checked: document.getElementById('setting-checkbox-checked').value,
    checkbox_border: document.getElementById('setting-checkbox-border').value,
    delete_button_bg: document.getElementById('setting-delete-button-bg').value,
    delete_button_bg_opacity: parseFloat(document.getElementById('setting-delete-button-bg-opacity').value),
    delete_button_border: document.getElementById('setting-delete-button-border').value,
    delete_button_text: document.getElementById('setting-delete-button-text').value,
    delete_button_hover_bg: document.getElementById('setting-delete-button-hover-bg').value,
    delete_button_hover_bg_opacity: parseFloat(document.getElementById('setting-delete-button-hover-bg-opacity').value),
    badge_youtube_bg: document.getElementById('setting-badge-youtube-bg').value,
    badge_youtube_bg_opacity: parseFloat(document.getElementById('setting-badge-youtube-bg-opacity').value),
    badge_youtube_border: document.getElementById('setting-badge-youtube-border').value,
    badge_youtube_text: document.getElementById('setting-badge-youtube-text').value,
    badge_tiktok_bg: document.getElementById('setting-badge-tiktok-bg').value,
    badge_tiktok_bg_opacity: parseFloat(document.getElementById('setting-badge-tiktok-bg-opacity').value),
    badge_tiktok_border: document.getElementById('setting-badge-tiktok-border').value,
    badge_tiktok_text: document.getElementById('setting-badge-tiktok-text').value,
    badge_discord_bg: document.getElementById('setting-badge-discord-bg').value,
    badge_discord_bg_opacity: parseFloat(document.getElementById('setting-badge-discord-bg-opacity').value),
    badge_discord_border: document.getElementById('setting-badge-discord-border').value,
    badge_discord_text: document.getElementById('setting-badge-discord-text').value,
    badge_mp3_bg: document.getElementById('setting-badge-mp3-bg').value,
    badge_mp3_bg_opacity: parseFloat(document.getElementById('setting-badge-mp3-bg-opacity').value),
    badge_mp3_border: document.getElementById('setting-badge-mp3-border').value,
    badge_mp3_text: document.getElementById('setting-badge-mp3-text').value,
    tempo_modal_bg: document.getElementById('setting-tempo-modal-bg').value,
    tempo_modal_bg_opacity: parseFloat(document.getElementById('setting-tempo-modal-bg-opacity').value),
    tempo_modal_border: document.getElementById('setting-tempo-modal-border').value,
    tempo_modal_text: document.getElementById('setting-tempo-modal-text').value,
    tempo_modal_backdrop: document.getElementById('setting-tempo-modal-backdrop').value,
    custom_modal_bg: document.getElementById('setting-custom-modal-bg').value,
    custom_modal_bg_opacity: parseFloat(document.getElementById('setting-custom-modal-bg-opacity').value),
    custom_modal_border: document.getElementById('setting-custom-modal-border').value,
    custom_modal_backdrop: document.getElementById('setting-custom-modal-backdrop').value,
    modal_close_bg: document.getElementById('setting-modal-close-bg').value,
    modal_close_text: document.getElementById('setting-modal-close-text').value,
    modal_close_hover_text: document.getElementById('setting-modal-close-hover-text').value,
    modal_action_primary_bg: document.getElementById('setting-modal-action-primary-bg').value,
    modal_action_primary_bg_opacity: parseFloat(document.getElementById('setting-modal-action-primary-bg-opacity').value),
    modal_action_primary_text: document.getElementById('setting-modal-action-primary-text').value,
    modal_action_primary_hover_bg: document.getElementById('setting-modal-action-primary-hover-bg').value,
    modal_action_primary_hover_bg_opacity: parseFloat(document.getElementById('setting-modal-action-primary-hover-bg-opacity').value),
    modal_action_secondary_bg: document.getElementById('setting-modal-action-secondary-bg').value,
    modal_action_secondary_bg_opacity: parseFloat(document.getElementById('setting-modal-action-secondary-bg-opacity').value),
    modal_action_secondary_text: document.getElementById('setting-modal-action-secondary-text').value,
    modal_action_secondary_hover_bg: document.getElementById('setting-modal-action-secondary-hover-bg').value,
    modal_action_secondary_hover_bg_opacity: parseFloat(document.getElementById('setting-modal-action-secondary-hover-bg-opacity').value),
    tempo_modal_button_text: document.getElementById('setting-tempo-modal-button-text').value,
    tempo_modal_button_hover_text: document.getElementById('setting-tempo-modal-button-hover-text').value,
  };
}

function applyBackground(background, opacity) {
  const body = document.body;
  const root = document.documentElement;
  const videoElement = document.getElementById('background-video');
  
  if (background === 'gradient' || background === 'none') {
    body.classList.remove('has-wallpaper', 'has-wallpaper-video');
    root.style.setProperty('--wallpaper-image', 'none');
    if (videoElement) {
      videoElement.style.display = 'none';
      videoElement.src = '';
    }
  } else {
    const fileExt = background.toLowerCase().split('.').pop();
    const isVideo = ['mp4', 'webm', 'mov'].includes(fileExt);
    
    if (isVideo) {
      body.classList.remove('has-wallpaper');
      body.classList.add('has-wallpaper-video');
      root.style.setProperty('--wallpaper-image', 'none');
      if (videoElement) {
        videoElement.src = `/wallpapers/${background}`;
        videoElement.style.display = 'block';
        root.style.setProperty('--wallpaper-opacity', opacity);
      }
    } else {
      body.classList.remove('has-wallpaper-video');
      body.classList.add('has-wallpaper');
      root.style.setProperty('--wallpaper-image', `url('/wallpapers/${background}')`);
      root.style.setProperty('--wallpaper-opacity', opacity);
      if (videoElement) {
        videoElement.style.display = 'none';
        videoElement.src = '';
      }
    }
  }
}

function hexToRgba(hex, alpha = 0.2) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function applyColors(settings) {
  const root = document.documentElement;
  
  const primaryBgOpacity = settings.primary_button_bg_opacity !== undefined ? settings.primary_button_bg_opacity : 0.2;
  const primaryHoverOpacity = settings.primary_button_hover_bg_opacity !== undefined ? settings.primary_button_hover_bg_opacity : 0.3;
  root.style.setProperty('--primary-button-bg', hexToRgba(settings.primary_button_bg || '#2563eb', primaryBgOpacity));
  root.style.setProperty('--primary-button-border', settings.primary_button_border || '#1d4ed8');
  root.style.setProperty('--primary-button-text', settings.primary_button_text || '#93c5fd');
  root.style.setProperty('--primary-button-hover-bg', hexToRgba(settings.primary_button_hover_bg || '#3b82f6', primaryHoverOpacity));
  root.style.setProperty('--primary-button-hover-border', settings.primary_button_hover_border || '#3b82f6');
  
  const secondaryBgOpacity = settings.secondary_button_bg_opacity !== undefined ? settings.secondary_button_bg_opacity : 0.2;
  const secondaryHoverOpacity = settings.secondary_button_hover_bg_opacity !== undefined ? settings.secondary_button_hover_bg_opacity : 0.3;
  root.style.setProperty('--secondary-button-bg', hexToRgba(settings.secondary_button_bg || '#9333ea', secondaryBgOpacity));
  root.style.setProperty('--secondary-button-border', settings.secondary_button_border || '#7e22ce');
  root.style.setProperty('--secondary-button-text', settings.secondary_button_text || '#c084fc');
  root.style.setProperty('--secondary-button-hover-bg', hexToRgba(settings.secondary_button_hover_bg || '#a855f7', secondaryHoverOpacity));
  root.style.setProperty('--secondary-button-hover-border', settings.secondary_button_hover_border || '#a855f7');
  
  const successBgOpacity = settings.success_button_bg_opacity !== undefined ? settings.success_button_bg_opacity : 0.2;
  const successHoverOpacity = settings.success_button_hover_bg_opacity !== undefined ? settings.success_button_hover_bg_opacity : 0.3;
  root.style.setProperty('--success-button-bg', hexToRgba(settings.success_button_bg || '#059669', successBgOpacity));
  root.style.setProperty('--success-button-border', settings.success_button_border || '#047857');
  root.style.setProperty('--success-button-text', settings.success_button_text || '#6ee7b7');
  root.style.setProperty('--success-button-hover-bg', hexToRgba(settings.success_button_hover_bg || '#10b981', successHoverOpacity));
  root.style.setProperty('--success-button-hover-border', settings.success_button_hover_border || '#10b981');
  
  root.style.setProperty('--text-color', settings.text_color || '#e5e7eb');
  root.style.setProperty('--text-secondary', settings.text_secondary || '#9ca3af');
  
  const cardBg = settings.card_bg || '#1f2937';
  const cardBgOpacity = settings.card_bg_opacity !== undefined ? settings.card_bg_opacity : 0.8;
  const cardBgRgba = cardBg.startsWith('#') ? hexToRgba(cardBg, cardBgOpacity) : cardBg;
  root.style.setProperty('--card-bg', cardBgRgba);
  root.style.setProperty('--card-border', settings.card_border || '#374151');
  const cardHoverBorderColor = settings.card_hover_border || 'rgba(147, 51, 234, 0.4)';
  const cardHoverBorderOpacity = parseFloat(document.getElementById('setting-card-hover-border-opacity')?.value || '0.4');
  const cardHoverBorderRgba = cardHoverBorderColor.startsWith('#') ? hexToRgba(cardHoverBorderColor, cardHoverBorderOpacity) : (cardHoverBorderColor.includes('rgba') ? cardHoverBorderColor : hexToRgba('#9333ea', cardHoverBorderOpacity));
  root.style.setProperty('--card-hover-border', cardHoverBorderRgba);
  
  root.style.setProperty('--link-color', settings.link_color || '#9333ea');
  root.style.setProperty('--link-hover', settings.link_hover || '#a855f7');
  
  const modalBgOpacity = settings.modal_bg_opacity !== undefined ? settings.modal_bg_opacity : 1;
  const modalBgRgba = settings.modal_bg ? (settings.modal_bg.startsWith('#') ? hexToRgba(settings.modal_bg, modalBgOpacity) : settings.modal_bg) : 'rgba(31, 41, 55, 1)';
  root.style.setProperty('--modal-bg', modalBgRgba);
  root.style.setProperty('--modal-border', settings.modal_border || '#374151');
  root.style.setProperty('--modal-text', settings.modal_text || '#ffffff');
  root.style.setProperty('--modal-text-secondary', settings.modal_text_secondary || '#d1d5db');
  root.style.setProperty('--modal-text-tertiary', settings.modal_text_tertiary || '#9ca3af');
  
  const backdropColor = settings.modal_backdrop || '#000000';
  let backdropOpacity = 0.5;
  if (settings.modal_backdrop && settings.modal_backdrop.includes('rgba')) {
    const match = settings.modal_backdrop.match(/[\d.]+/g);
    if (match && match.length >= 4) {
      backdropOpacity = parseFloat(match[3]);
    }
  } else {
    backdropOpacity = parseFloat(document.getElementById('setting-modal-backdrop-opacity')?.value || '0.5');
  }
  const backdropRgba = backdropColor.startsWith('#') ? hexToRgba(backdropColor, backdropOpacity) : (backdropColor.includes('rgba') ? backdropColor : hexToRgba('#000000', backdropOpacity));
  root.style.setProperty('--modal-backdrop', backdropRgba);
  
  root.style.setProperty('--input-bg', settings.input_bg || '#374151');
  root.style.setProperty('--input-border', settings.input_border || '#4b5563');
  root.style.setProperty('--input-text', settings.input_text || '#ffffff');
  
  root.style.setProperty('--checkbox-bg', settings.checkbox_bg || '#4b5563');
  root.style.setProperty('--checkbox-checked', settings.checkbox_checked || '#9333ea');
  root.style.setProperty('--checkbox-border', settings.checkbox_border || '#6b7280');
  
  root.style.setProperty('--tab-active', settings.tab_active || '#9333ea');
  root.style.setProperty('--tab-inactive', settings.tab_inactive || '#9ca3af');
  
  const historyItemBgOpacity = settings.history_item_bg_opacity !== undefined ? settings.history_item_bg_opacity : 0.4;
  const historyItemBgRgba = settings.history_item_bg ? (settings.history_item_bg.startsWith('#') ? hexToRgba(settings.history_item_bg, historyItemBgOpacity) : settings.history_item_bg) : 'rgba(55, 65, 81, 0.4)';
  root.style.setProperty('--history-item-bg', historyItemBgRgba);
  root.style.setProperty('--history-item-border', settings.history_item_border || '#374151');
  const historyItemHoverBgOpacity = settings.history_item_hover_bg_opacity !== undefined ? settings.history_item_hover_bg_opacity : 0.6;
  const historyItemHoverBgRgba = settings.history_item_hover_bg ? (settings.history_item_hover_bg.startsWith('#') ? hexToRgba(settings.history_item_hover_bg, historyItemHoverBgOpacity) : settings.history_item_hover_bg) : 'rgba(55, 65, 81, 0.6)';
  root.style.setProperty('--history-item-hover-bg', historyItemHoverBgRgba);
  const historyItemHoverBorderColor = settings.history_item_hover_border || 'rgba(147, 51, 234, 0.3)';
  const historyItemHoverBorderOpacity = parseFloat(document.getElementById('setting-history-item-hover-border-opacity')?.value || '0.3');
  const historyItemHoverBorderRgba = historyItemHoverBorderColor.startsWith('#') ? hexToRgba(historyItemHoverBorderColor, historyItemHoverBorderOpacity) : (historyItemHoverBorderColor.includes('rgba') ? historyItemHoverBorderColor : hexToRgba('#9333ea', historyItemHoverBorderOpacity));
  root.style.setProperty('--history-item-hover-border', historyItemHoverBorderRgba);
  
  const tempoModalBgOpacity = settings.tempo_modal_bg_opacity !== undefined ? settings.tempo_modal_bg_opacity : 1;
  const tempoModalBgRgba = settings.tempo_modal_bg ? (settings.tempo_modal_bg.startsWith('#') ? hexToRgba(settings.tempo_modal_bg, tempoModalBgOpacity) : settings.tempo_modal_bg) : 'rgba(31, 41, 55, 1)';
  root.style.setProperty('--tempo-modal-bg', tempoModalBgRgba);
  root.style.setProperty('--tempo-modal-border', settings.tempo_modal_border || '#374151');
  root.style.setProperty('--tempo-modal-text', settings.tempo_modal_text || '#9ca3af');
  const tempoBackdropColor = settings.tempo_modal_backdrop || '#000000';
  const tempoBackdropOpacity = parseFloat(document.getElementById('setting-tempo-modal-backdrop-opacity')?.value || '0.5');
  const tempoBackdropRgba = tempoBackdropColor.startsWith('#') ? hexToRgba(tempoBackdropColor, tempoBackdropOpacity) : (tempoBackdropColor.includes('rgba') ? tempoBackdropColor : hexToRgba('#000000', tempoBackdropOpacity));
  root.style.setProperty('--tempo-modal-backdrop', tempoBackdropRgba);
  
  const customModalBgOpacity = settings.custom_modal_bg_opacity !== undefined ? settings.custom_modal_bg_opacity : 1;
  const customModalBgRgba = settings.custom_modal_bg ? (settings.custom_modal_bg.startsWith('#') ? hexToRgba(settings.custom_modal_bg, customModalBgOpacity) : settings.custom_modal_bg) : 'rgba(31, 41, 55, 1)';
  root.style.setProperty('--custom-modal-bg', customModalBgRgba);
  root.style.setProperty('--custom-modal-border', settings.custom_modal_border || '#374151');
  const customBackdropColor = settings.custom_modal_backdrop || '#000000';
  const customBackdropOpacity = parseFloat(document.getElementById('setting-custom-modal-backdrop-opacity')?.value || '0.5');
  const customBackdropRgba = customBackdropColor.startsWith('#') ? hexToRgba(customBackdropColor, customBackdropOpacity) : (customBackdropColor.includes('rgba') ? customBackdropColor : hexToRgba('#000000', customBackdropOpacity));
  root.style.setProperty('--custom-modal-backdrop', customBackdropRgba);
  
  root.style.setProperty('--modal-close-bg', settings.modal_close_bg || 'transparent');
  root.style.setProperty('--modal-close-text', settings.modal_close_text || '#9ca3af');
  root.style.setProperty('--modal-close-hover-text', settings.modal_close_hover_text || '#ffffff');
  
  const modalActionPrimaryBgOpacity = settings.modal_action_primary_bg_opacity !== undefined ? settings.modal_action_primary_bg_opacity : 1;
  const modalActionPrimaryHoverBgOpacity = settings.modal_action_primary_hover_bg_opacity !== undefined ? settings.modal_action_primary_hover_bg_opacity : 1;
  root.style.setProperty('--modal-action-primary-bg', hexToRgba(settings.modal_action_primary_bg || '#9333ea', modalActionPrimaryBgOpacity));
  root.style.setProperty('--modal-action-primary-text', settings.modal_action_primary_text || '#ffffff');
  root.style.setProperty('--modal-action-primary-hover-bg', hexToRgba(settings.modal_action_primary_hover_bg || '#7e22ce', modalActionPrimaryHoverBgOpacity));
  
  const modalActionSecondaryBgOpacity = settings.modal_action_secondary_bg_opacity !== undefined ? settings.modal_action_secondary_bg_opacity : 1;
  const modalActionSecondaryHoverBgOpacity = settings.modal_action_secondary_hover_bg_opacity !== undefined ? settings.modal_action_secondary_hover_bg_opacity : 1;
  root.style.setProperty('--modal-action-secondary-bg', hexToRgba(settings.modal_action_secondary_bg || '#374151', modalActionSecondaryBgOpacity));
  root.style.setProperty('--modal-action-secondary-text', settings.modal_action_secondary_text || '#ffffff');
  root.style.setProperty('--modal-action-secondary-hover-bg', hexToRgba(settings.modal_action_secondary_hover_bg || '#4b5563', modalActionSecondaryHoverBgOpacity));
  
  root.style.setProperty('--tempo-modal-button-text', settings.tempo_modal_button_text || '#9ca3af');
  root.style.setProperty('--tempo-modal-button-hover-text', settings.tempo_modal_button_hover_text || '#ffffff');
}

function updateBackgroundPreview() {
  const backgroundSelect = document.getElementById('setting-background');
  const previewContainer = document.getElementById('wallpaper-preview-container');
  const preview = document.getElementById('wallpaper-preview');
  const previewVideo = document.getElementById('wallpaper-preview-video');
  const opacity = parseFloat(document.getElementById('setting-background-opacity').value);
  
  if (!backgroundSelect || !previewContainer || !preview) return;
  
  const selectedValue = backgroundSelect.value;
  
  if (selectedValue === 'gradient' || selectedValue === 'none') {
    previewContainer.classList.add('hidden');
    preview.style.backgroundImage = 'none';
    if (previewVideo) {
      previewVideo.style.display = 'none';
      previewVideo.src = '';
    }
  } else {
    previewContainer.classList.remove('hidden');
    const wallpaper = wallpaperList.find(wp => wp.filename === selectedValue);
    const isVideo = wallpaper && wallpaper.type === 'video';
    
    if (isVideo) {
      preview.style.backgroundImage = 'none';
      if (previewVideo) {
        previewVideo.src = `/wallpapers/${selectedValue}`;
        previewVideo.style.display = 'block';
        previewVideo.style.opacity = opacity;
      }
    } else {
      preview.style.backgroundImage = `url('/wallpapers/${selectedValue}')`;
      preview.style.opacity = opacity;
      if (previewVideo) {
        previewVideo.style.display = 'none';
        previewVideo.src = '';
      }
    }
  }
}

const sheetsSettingsModal = document.getElementById('sheets-settings-modal');
const sheetsSettingsBtn = document.getElementById('sheets-settings-btn');
const closeSettingsModal = document.getElementById('close-settings-modal');
const saveSettingsBtn = document.getElementById('save-settings');
const resetSettingsBtn = document.getElementById('reset-settings');

if (sheetsSettingsBtn) {
  sheetsSettingsBtn.addEventListener('click', async () => {
    const settings = await loadSheetsSettings();
    await populateSettingsModal(settings);
    sheetsSettingsModal.style.opacity = '0';
    sheetsSettingsModal.querySelector('div').style.transform = 'scale(0.95)';
    sheetsSettingsModal.classList.remove('hidden');
    requestAnimationFrame(() => {
      sheetsSettingsModal.style.opacity = '1';
      sheetsSettingsModal.querySelector('div').style.transform = 'scale(1)';
    });
  });
}

if (closeSettingsModal) {
  closeSettingsModal.addEventListener('click', () => {
    sheetsSettingsModal.style.opacity = '0';
    sheetsSettingsModal.querySelector('div').style.transform = 'scale(0.95)';
    setTimeout(() => {
      sheetsSettingsModal.classList.add('hidden');
      sheetsSettingsModal.style.opacity = '';
      sheetsSettingsModal.querySelector('div').style.transform = '';
    }, 200);
  });
}

if (sheetsSettingsModal) {
  sheetsSettingsModal.addEventListener('click', (e) => {
    if (e.target === sheetsSettingsModal) {
      sheetsSettingsModal.style.opacity = '0';
      sheetsSettingsModal.querySelector('div').style.transform = 'scale(0.95)';
      setTimeout(() => {
        sheetsSettingsModal.classList.add('hidden');
        sheetsSettingsModal.style.opacity = '';
        sheetsSettingsModal.querySelector('div').style.transform = '';
      }, 200);
    }
  });
}

if (saveSettingsBtn) {
  saveSettingsBtn.addEventListener('click', () => {
    const settings = getSettingsFromModal();
    saveSheetsSettings(settings);
    applyBackground(settings.background, settings.background_opacity);
    applyColors(settings);
    sheetsSettingsModal.style.opacity = '0';
    sheetsSettingsModal.querySelector('div').style.transform = 'scale(0.95)';
    setTimeout(() => {
      sheetsSettingsModal.classList.add('hidden');
      sheetsSettingsModal.style.opacity = '';
      sheetsSettingsModal.querySelector('div').style.transform = '';
    }, 200);
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

document.getElementById('setting-resilience')?.addEventListener('input', (e) => {
  document.getElementById('resilience-value').textContent = e.target.value;
});
document.getElementById('setting-break-lines-every')?.addEventListener('input', (e) => {
  document.getElementById('break-lines-value').textContent = e.target.value;
});
document.getElementById('setting-quantize')?.addEventListener('input', (e) => {
  document.getElementById('quantize-value').textContent = e.target.value;
});

document.getElementById('setting-background')?.addEventListener('change', () => {
  updateBackgroundPreview();
});

document.getElementById('setting-background-opacity')?.addEventListener('input', (e) => {
  const opacity = parseFloat(e.target.value);
  document.getElementById('background-opacity-value').textContent = Math.round(opacity * 100) + '%';
  updateBackgroundPreview();
});

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

colorInputs.forEach(inputId => {
  document.getElementById(inputId)?.addEventListener('input', () => {
    const settings = getSettingsFromModal();
    applyColors(settings);
  });
});

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
  document.getElementById(id)?.addEventListener('input', (e) => {
    const opacity = parseFloat(e.target.value);
    document.getElementById(valueId).textContent = Math.round(opacity * 100) + '%';
    const settings = getSettingsFromModal();
    applyColors(settings);
  });
});

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function adjustBrightness(hex, percent) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = Math.min(255, Math.max(0, rgb.r + (rgb.r * percent / 100)));
  const g = Math.min(255, Math.max(0, rgb.g + (rgb.g * percent / 100)));
  const b = Math.min(255, Math.max(0, rgb.b + (rgb.b * percent / 100)));
  return rgbToHex(Math.round(r), Math.round(g), Math.round(b));
}

function getDominantColors(imageElement, count = 5) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 100;
  canvas.height = 100;
  
  ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const colorMap = {};
  
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    if (a < 128) continue;
    
    const brightness = (r + g + b) / 3;
    if (brightness < 30 || brightness > 225) continue;
    
    const key = `${Math.round(r / 10) * 10},${Math.round(g / 10) * 10},${Math.round(b / 10) * 10}`;
    colorMap[key] = (colorMap[key] || 0) + 1;
  }
  
  const sortedColors = Object.entries(colorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([rgb]) => {
      const [r, g, b] = rgb.split(',').map(Number);
      return { r, g, b, hex: rgbToHex(r, g, b) };
    });
  
  return sortedColors;
}

async function extractColorsFromBackground(background) {
  return new Promise((resolve) => {
    if (background === 'none' || background === 'gradient') {
      resolve(null);
      return;
    }
    
    const wallpaper = wallpaperList.find(wp => wp.filename === background);
    if (!wallpaper) {
      resolve(null);
      return;
    }
    
    if (wallpaper.type === 'video') {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = `/wallpapers/${background}`;
      video.muted = true;
      video.playsInline = true;
      
      const captureFrame = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth || 100;
        canvas.height = video.videoHeight || 100;
        
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const colors = getDominantColors(video, 5);
          resolve(colors);
        } catch (e) {
          resolve(null);
        }
      };
      
      video.addEventListener('loadeddata', () => {
        video.currentTime = 1;
      });
      
      video.addEventListener('seeked', captureFrame);
      video.addEventListener('error', () => resolve(null));
      
      video.load();
    } else {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = `/wallpapers/${background}`;
      
      img.onload = () => {
        const colors = getDominantColors(img, 5);
        resolve(colors);
      };
      
      img.onerror = () => resolve(null);
    }
  });
}

function generateColorScheme(colors) {
  if (!colors || colors.length === 0) {
    return null;
  }
  
  const primaryColor = colors[0];
  const secondaryColor = colors.length > 1 ? colors[1] : primaryColor;
  const accentColor = colors.length > 2 ? colors[2] : secondaryColor;
  
  const avgBrightness = (primaryColor.r + primaryColor.g + primaryColor.b) / 3;
  const isDark = avgBrightness < 128;
  
  const primary = primaryColor.hex;
  const secondary = secondaryColor.hex;
  const success = accentColor.hex;
  
  const textColor = isDark ? '#e5e7eb' : '#1f2937';
  const textSecondary = isDark ? '#9ca3af' : '#4b5563';
  const cardBg = isDark ? '#1f2937' : '#f9fafb';
  const cardBorder = isDark ? '#374151' : '#e5e7eb';
  
  return {
    primary_button_bg: primary,
    primary_button_border: adjustBrightness(primary, -20),
    primary_button_text: isDark ? adjustBrightness(primary, 50) : adjustBrightness(primary, -30),
    primary_button_hover_bg: adjustBrightness(primary, 10),
    
    secondary_button_bg: secondary,
    secondary_button_border: adjustBrightness(secondary, -20),
    secondary_button_text: isDark ? adjustBrightness(secondary, 50) : adjustBrightness(secondary, -30),
    secondary_button_hover_bg: adjustBrightness(secondary, 10),
    secondary_button_hover_border: adjustBrightness(secondary, 10),
    
    success_button_bg: success,
    success_button_border: adjustBrightness(success, -20),
    success_button_text: isDark ? adjustBrightness(success, 50) : adjustBrightness(success, -30),
    success_button_hover_bg: adjustBrightness(success, 10),
    success_button_hover_border: adjustBrightness(success, 10),
    
    text_color: textColor,
    text_secondary: textSecondary,
    card_bg: cardBg,
    card_border: cardBorder,
    link_color: secondary,
    link_hover: adjustBrightness(secondary, 10),
    modal_bg: cardBg,
    modal_border: cardBorder,
    modal_text: textColor,
    modal_text_secondary: textSecondary,
    modal_text_tertiary: isDark ? '#6b7280' : '#9ca3af',
    modal_backdrop: '#000000',
    input_bg: isDark ? '#374151' : '#f3f4f6',
    input_border: isDark ? '#4b5563' : '#d1d5db',
    input_text: textColor,
    tab_active: secondary,
    tab_inactive: textSecondary,
    history_item_bg: isDark ? '#374151' : '#f3f4f6',
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
    badge_tiktok_border: adjustBrightness(secondary, -20),
    badge_tiktok_text: isDark ? adjustBrightness(secondary, 50) : adjustBrightness(secondary, -30),
    badge_discord_bg: accentColor.hex,
    badge_discord_border: adjustBrightness(accentColor.hex, -20),
    badge_discord_text: isDark ? adjustBrightness(accentColor.hex, 50) : adjustBrightness(accentColor.hex, -30),
    badge_mp3_bg: accentColor.hex,
    badge_mp3_border: adjustBrightness(accentColor.hex, -20),
    badge_mp3_text: isDark ? adjustBrightness(accentColor.hex, 50) : adjustBrightness(accentColor.hex, -30),
    tempo_modal_bg: cardBg,
    tempo_modal_border: cardBorder,
    tempo_modal_text: textSecondary,
    custom_modal_bg: cardBg,
    custom_modal_border: cardBorder,
    custom_modal_backdrop: '#000000',
    input_bg: isDark ? '#374151' : '#f3f4f6',
    input_border: isDark ? '#4b5563' : '#d1d5db',
    input_text: textColor,
  };
}

async function matchColorsWithBackground() {
  const backgroundSelect = document.getElementById('setting-background');
  const currentBackground = backgroundSelect.value;
  
  if (currentBackground === 'none' || currentBackground === 'gradient') {
    showAlert('Please select a background image or video first', 'Info');
    return;
  }
  
  const matchBtn = document.getElementById('match-colors-btn');
  const originalText = matchBtn.textContent;
  matchBtn.textContent = 'Analyzing...';
  matchBtn.disabled = true;
  
  try {
    const colors = await extractColorsFromBackground(currentBackground);
    const colorScheme = generateColorScheme(colors);
    
    if (colorScheme) {
      document.getElementById('setting-primary-button-bg').value = colorScheme.primary_button_bg;
      document.getElementById('setting-primary-button-border').value = colorScheme.primary_button_border;
      document.getElementById('setting-primary-button-text').value = colorScheme.primary_button_text;
      document.getElementById('setting-primary-button-hover-bg').value = colorScheme.primary_button_hover_bg;
      document.getElementById('setting-primary-button-hover-border').value = colorScheme.primary_button_hover_border;
      
      document.getElementById('setting-secondary-button-bg').value = colorScheme.secondary_button_bg;
      document.getElementById('setting-secondary-button-border').value = colorScheme.secondary_button_border;
      document.getElementById('setting-secondary-button-text').value = colorScheme.secondary_button_text;
      document.getElementById('setting-secondary-button-hover-bg').value = colorScheme.secondary_button_hover_bg;
      document.getElementById('setting-secondary-button-hover-border').value = colorScheme.secondary_button_hover_border;
      
      document.getElementById('setting-success-button-bg').value = colorScheme.success_button_bg;
      document.getElementById('setting-success-button-border').value = colorScheme.success_button_border;
      document.getElementById('setting-success-button-text').value = colorScheme.success_button_text;
      document.getElementById('setting-success-button-hover-bg').value = colorScheme.success_button_hover_bg;
      document.getElementById('setting-success-button-hover-border').value = colorScheme.success_button_hover_border;
      
      document.getElementById('setting-text-color').value = colorScheme.text_color;
      document.getElementById('setting-text-secondary').value = colorScheme.text_secondary;
      document.getElementById('setting-card-bg').value = colorScheme.card_bg;
      document.getElementById('setting-card-border').value = colorScheme.card_border;
      document.getElementById('setting-link-color').value = colorScheme.link_color;
      document.getElementById('setting-link-hover').value = colorScheme.link_hover;
      
      document.getElementById('setting-modal-bg').value = colorScheme.modal_bg;
      document.getElementById('setting-modal-border').value = colorScheme.modal_border;
      document.getElementById('setting-modal-text').value = colorScheme.modal_text;
      document.getElementById('setting-modal-text-secondary').value = colorScheme.modal_text_secondary;
      document.getElementById('setting-modal-text-tertiary').value = colorScheme.modal_text_tertiary;
      document.getElementById('setting-modal-backdrop').value = colorScheme.modal_backdrop;
      
      document.getElementById('setting-input-bg').value = colorScheme.input_bg;
      document.getElementById('setting-input-border').value = colorScheme.input_border;
      document.getElementById('setting-input-text').value = colorScheme.input_text;
      
      document.getElementById('setting-tab-active').value = colorScheme.tab_active;
      document.getElementById('setting-tab-inactive').value = colorScheme.tab_inactive;
      
      document.getElementById('setting-history-item-bg').value = colorScheme.history_item_bg;
      document.getElementById('setting-history-item-border').value = colorScheme.history_item_border;
      
      document.getElementById('setting-checkbox-bg').value = colorScheme.checkbox_bg;
      document.getElementById('setting-checkbox-checked').value = colorScheme.checkbox_checked;
      document.getElementById('setting-checkbox-border').value = colorScheme.checkbox_border;
      
      document.getElementById('setting-delete-button-bg').value = colorScheme.delete_button_bg;
      document.getElementById('setting-delete-button-border').value = colorScheme.delete_button_border;
      document.getElementById('setting-delete-button-text').value = colorScheme.delete_button_text;
      document.getElementById('setting-delete-button-hover-bg').value = colorScheme.delete_button_hover_bg;
      
      document.getElementById('setting-badge-youtube-bg').value = colorScheme.badge_youtube_bg;
      document.getElementById('setting-badge-youtube-border').value = colorScheme.badge_youtube_border;
      document.getElementById('setting-badge-youtube-text').value = colorScheme.badge_youtube_text;
      
      document.getElementById('setting-badge-tiktok-bg').value = colorScheme.badge_tiktok_bg;
      document.getElementById('setting-badge-tiktok-border').value = colorScheme.badge_tiktok_border;
      document.getElementById('setting-badge-tiktok-text').value = colorScheme.badge_tiktok_text;
      
      document.getElementById('setting-badge-discord-bg').value = colorScheme.badge_discord_bg;
      document.getElementById('setting-badge-discord-border').value = colorScheme.badge_discord_border;
      document.getElementById('setting-badge-discord-text').value = colorScheme.badge_discord_text;
      
      document.getElementById('setting-badge-mp3-bg').value = colorScheme.badge_mp3_bg;
      document.getElementById('setting-badge-mp3-border').value = colorScheme.badge_mp3_border;
      document.getElementById('setting-badge-mp3-text').value = colorScheme.badge_mp3_text;
      
      document.getElementById('setting-tempo-modal-bg').value = colorScheme.tempo_modal_bg;
      document.getElementById('setting-tempo-modal-border').value = colorScheme.tempo_modal_border;
      document.getElementById('setting-tempo-modal-text').value = colorScheme.tempo_modal_text;
      
      document.getElementById('setting-custom-modal-bg').value = colorScheme.custom_modal_bg;
      document.getElementById('setting-custom-modal-border').value = colorScheme.custom_modal_border;
      
      document.getElementById('setting-input-bg').value = colorScheme.input_bg;
      document.getElementById('setting-input-border').value = colorScheme.input_border;
      document.getElementById('setting-input-text').value = colorScheme.input_text;
      
      const settings = getSettingsFromModal();
      applyColors(settings);
      
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

const matchColorsBtn = document.getElementById('match-colors-btn');
if (matchColorsBtn) {
  matchColorsBtn.addEventListener('click', matchColorsWithBackground);
}

document.addEventListener('DOMContentLoaded', async () => {
  const settings = await loadSheetsSettings();
  await populateSettingsModal(settings);
  applyBackground(settings.background || 'none', settings.background_opacity || 0.6);
  applyColors(settings);
});