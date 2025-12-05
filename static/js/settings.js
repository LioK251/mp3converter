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
};

function loadSheetsSettings() {
  const saved = localStorage.getItem('sheetsSettings');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved settings:', e);
    }
  }
  return defaultSheetsSettings;
}

function saveSheetsSettings(settings) {
  localStorage.setItem('sheetsSettings', JSON.stringify(settings));
}

function populateSettingsModal(settings) {
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
  };
}

const sheetsSettingsModal = document.getElementById('sheets-settings-modal');
const sheetsSettingsBtn = document.getElementById('sheets-settings-btn');
const closeSettingsModal = document.getElementById('close-settings-modal');
const saveSettingsBtn = document.getElementById('save-settings');
const resetSettingsBtn = document.getElementById('reset-settings');

if (sheetsSettingsBtn) {
  sheetsSettingsBtn.addEventListener('click', () => {
    const settings = loadSheetsSettings();
    populateSettingsModal(settings);
    sheetsSettingsModal.classList.remove('hidden');
  });
}

if (closeSettingsModal) {
  closeSettingsModal.addEventListener('click', () => {
    sheetsSettingsModal.classList.add('hidden');
  });
}

if (sheetsSettingsModal) {
  sheetsSettingsModal.addEventListener('click', (e) => {
    if (e.target === sheetsSettingsModal) {
      sheetsSettingsModal.classList.add('hidden');
    }
  });
}

if (saveSettingsBtn) {
  saveSettingsBtn.addEventListener('click', () => {
    const settings = getSettingsFromModal();
    saveSheetsSettings(settings);
    sheetsSettingsModal.classList.add('hidden');
  });
}

if (resetSettingsBtn) {
  resetSettingsBtn.addEventListener('click', () => {
    if (confirm('Reset all settings to defaults?')) {
      populateSettingsModal(defaultSheetsSettings);
      saveSheetsSettings(defaultSheetsSettings);
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

