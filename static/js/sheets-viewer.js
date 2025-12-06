let currentMidiFilename = null;
let transposeMode = localStorage.getItem('transposeMode') || 'auto';

const transposeModeToggle = document.getElementById('transpose-mode-toggle');
const copyTransposesBtn = document.getElementById('copy-transposes-btn');

if (copyTransposesBtn) {
  if (transposeMode === 'multi') {
    copyTransposesBtn.classList.remove('hidden');
    copyTransposesBtn.style.display = 'flex';
  } else {
    copyTransposesBtn.classList.add('hidden');
    copyTransposesBtn.style.display = 'none';
  }
}

function updateTransposeModeButton() {
  if (transposeModeToggle) {
    transposeModeToggle.textContent = `Transpose Mode: ${transposeMode === 'multi' ? 'Multi' : 'Auto'}`;
  }
  if (copyTransposesBtn) {
    if (transposeMode === 'multi') {
      copyTransposesBtn.classList.remove('hidden');
      copyTransposesBtn.style.display = 'flex';
    } else {
      copyTransposesBtn.classList.add('hidden');
      copyTransposesBtn.style.display = 'none';
    }
  }
}

if (transposeModeToggle) {
  updateTransposeModeButton();
  transposeModeToggle.addEventListener('click', () => {
    transposeMode = transposeMode === 'auto' ? 'multi' : 'auto';
    localStorage.setItem('transposeMode', transposeMode);
    updateTransposeModeButton();
    
    if (currentMidiFilename) {
      const modal = document.getElementById('view-tempo-modal');
      if (modal && !modal.classList.contains('hidden')) {
        viewTempoText(currentMidiFilename);
      }
    }
  });
}

if (copyTransposesBtn) {
  copyTransposesBtn.addEventListener('click', () => {
    const content = document.getElementById('tempo-text-content');
    if (content) {
      const text = content.textContent || content.innerText;
      const transposeRegex = /Transpose by:\s*([+-]?\d+)/g;
      const transposes = [];
      let match;
      
      while ((match = transposeRegex.exec(text)) !== null) {
        const value = parseInt(match[1], 10);
        transposes.push(value);
      }
      
      if (transposes.length > 0) {
        const transposeString = transposes.map(t => t >= 0 ? t.toString() : t.toString()).join(' ');
        navigator.clipboard.writeText(transposeString).then(() => {
        }).catch(err => {
          console.error('Failed to copy:', err);
          showAlert('Failed to copy transposes to clipboard', 'Error');
        });
      } else {
        showAlert('No transpose values found', 'Info');
      }
    }
  });
}

window.viewTempoText = async function(midiFilename, title = null) {
  const modal = document.getElementById('view-tempo-modal');
  const content = document.getElementById('tempo-text-content');
  const titleElement = document.getElementById('tempo-modal-title');
  
  if (!modal) {
    console.error('Modal element not found');
    return;
  }
  if (!content) {
    console.error('Content element not found');
    return;
  }
  
  console.log('Opening sheet viewer for:', midiFilename);
  currentMidiFilename = midiFilename;
  modal.classList.remove('hidden');
  
  if (titleElement) {
    let displayTitle = '';
    if (title) {
      displayTitle = title;
    } else {
      displayTitle = midiFilename.replace(/_/g, ' ').replace(/\.mid$/i, '');
    }
    displayTitle = displayTitle.replace(/\btranskun\b/gi, '').replace(/\s+/g, ' ').trim();
    titleElement.textContent = displayTitle;
  }
  
  content.innerHTML = '<div class="text-center text-gray-400">Loading sheet text...</div>';
  
  try {
    const savedSettings = loadSheetsSettings();
    const currentTransposeMode = localStorage.getItem('transposeMode') || 'auto';
    savedSettings.multi_transpose = currentTransposeMode === 'multi';
    
    const response = await fetch('/api/convert-to-sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        midi_filename: midiFilename,
        settings: savedSettings
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    console.log('sheet_text exists:', 'sheet_text' in data);
    console.log('sheet_text value:', data.sheet_text);
    console.log('sheet_text type:', typeof data.sheet_text);
    console.log('sheet_text length:', data.sheet_text ? data.sheet_text.length : 'N/A');
    
    if (data.success && data.sheet_text !== undefined && data.sheet_text !== null) {
      const coloredText = colorizeTempoText(data.sheet_text);
      content.innerHTML = coloredText;
      
      const settings = loadSheetsSettings();
      if (settings.center_sheet_text) {
        content.classList.add('text-center');
      } else {
        content.classList.remove('text-center');
      }
      
      if (typeof updateTransposeModeButton === 'function') {
        updateTransposeModeButton();
      }
    } else {
      console.error('Missing sheet_text or success flag. Response:', data);
      throw new Error(data.error || 'Failed to load sheet text');
    }
  } catch (error) {
    console.error('Convert to QWERTY error:', error);
    content.innerHTML = `<div class="text-center text-red-400">Error: ${error.message}</div>`;
  }
}

const viewTempoModal = document.getElementById('view-tempo-modal');
const closeTempoModal = document.getElementById('close-tempo-modal');
const copyTempoTextBtn = document.getElementById('copy-tempo-text');

if (closeTempoModal) {
  closeTempoModal.addEventListener('click', () => {
    if (viewTempoModal) viewTempoModal.classList.add('hidden');
  });
}

if (viewTempoModal) {
  viewTempoModal.addEventListener('click', (e) => {
    if (e.target === viewTempoModal) {
      viewTempoModal.classList.add('hidden');
    }
  });
}

if (copyTempoTextBtn) {
  copyTempoTextBtn.addEventListener('click', () => {
    const content = document.getElementById('tempo-text-content');
    if (content) {
      const text = content.textContent;
      navigator.clipboard.writeText(text).then(() => {
      }).catch(err => {
        console.error('Failed to copy:', err);
        showAlert('Failed to copy text to clipboard', 'Error');
      });
    }
  });
}

const fullscreenTempoBtn = document.getElementById('fullscreen-tempo-modal');
const tempoModalContent = document.getElementById('tempo-modal-content');
const viewTempoModalContainer = document.getElementById('view-tempo-modal');
let isFullscreen = false;

if (fullscreenTempoBtn && tempoModalContent && viewTempoModalContainer) {
  fullscreenTempoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isFullscreen) {
      viewTempoModalContainer.style.backgroundColor = 'transparent';
      viewTempoModalContainer.style.backdropFilter = 'none';
      viewTempoModalContainer.classList.remove('items-center', 'justify-center');
      
      tempoModalContent.style.position = 'fixed';
      tempoModalContent.style.top = '0';
      tempoModalContent.style.left = '0';
      tempoModalContent.style.right = '0';
      tempoModalContent.style.bottom = '0';
      tempoModalContent.style.width = '100vw';
      tempoModalContent.style.height = '100vh';
      tempoModalContent.style.maxWidth = '100vw';
      tempoModalContent.style.maxHeight = '100vh';
      tempoModalContent.style.margin = '0';
      tempoModalContent.style.borderRadius = '0';
      tempoModalContent.classList.remove('overflow-hidden');
      tempoModalContent.style.setProperty('overflow', 'visible', 'important');
      
      const headerContainer = document.getElementById('tempo-modal-header');
      if (headerContainer) {
        headerContainer.style.position = 'fixed';
        headerContainer.style.top = '0';
        headerContainer.style.left = '0';
        headerContainer.style.right = '0';
        headerContainer.style.zIndex = '100';
      }
      
      fullscreenTempoBtn.textContent = '⛶';
      fullscreenTempoBtn.title = 'Exit Fullscreen';
      isFullscreen = true;
    } else {
      viewTempoModalContainer.style.backgroundColor = '';
      viewTempoModalContainer.style.backdropFilter = '';
      viewTempoModalContainer.classList.add('items-center', 'justify-center');
      
      tempoModalContent.style.position = '';
      tempoModalContent.style.top = '';
      tempoModalContent.style.left = '';
      tempoModalContent.style.right = '';
      tempoModalContent.style.bottom = '';
      tempoModalContent.style.width = '';
      tempoModalContent.style.height = '';
      tempoModalContent.style.maxWidth = '95vw';
      tempoModalContent.style.maxHeight = '95vh';
      tempoModalContent.style.margin = '';
      tempoModalContent.style.borderRadius = '';
      tempoModalContent.style.overflow = '';
      tempoModalContent.classList.add('overflow-hidden');
      
      const headerContainer = document.getElementById('tempo-modal-header');
      if (headerContainer) {
        headerContainer.style.position = '';
        headerContainer.style.top = '';
        headerContainer.style.left = '';
        headerContainer.style.right = '';
        headerContainer.style.zIndex = '';
      }
      
      fullscreenTempoBtn.textContent = '⛶';
      fullscreenTempoBtn.title = 'Fullscreen';
      isFullscreen = false;
    }
  });
}

document.addEventListener('click', function(event) {
  const button = event.target.closest('.view-tempo-btn');
  if (button) {
    event.preventDefault();
    event.stopPropagation();
    const midiFilename = button.getAttribute('data-midi-filename');
    if (midiFilename) {
      viewTempoText(midiFilename);
    }
  }
});