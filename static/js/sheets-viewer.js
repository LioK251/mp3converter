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
  
  requestAnimationFrame(() => {
    content.textContent = '';
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'text-center text-gray-400';
    loadingDiv.textContent = 'Loading sheet text...';
    content.appendChild(loadingDiv);
  });
  
  requestAnimationFrame(() => {
    modal.classList.remove('hidden');
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.15s ease-in';
  });
  
  try {
    const savedSettings = await loadSheetsSettings();
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
    
    if (data.success && data.sheet_text !== undefined && data.sheet_text !== null) {
      const coloredText = colorizeTempoText(data.sheet_text);
      const centerSettings = await loadSheetsSettings();
      
      requestAnimationFrame(() => {
        content.innerHTML = coloredText;
        
        if (centerSettings.center_sheet_text) {
          content.classList.add('text-center');
        } else {
          content.classList.remove('text-center');
        }
        
        if (typeof updateTransposeModeButton === 'function') {
          updateTransposeModeButton();
        }
        
        requestAnimationFrame(() => {
          modal.style.opacity = '1';
        });
      });
    } else {
      throw new Error(data.error || 'Failed to load sheet text');
    }
  } catch (error) {
    requestAnimationFrame(() => {
      content.textContent = '';
      const errorDiv = document.createElement('div');
      errorDiv.className = 'text-center text-red-400';
      errorDiv.textContent = `Error: ${error.message}`;
      content.appendChild(errorDiv);
      
      requestAnimationFrame(() => {
        modal.style.opacity = '1';
      });
    });
  }
}

const viewTempoModal = document.getElementById('view-tempo-modal');
const closeTempoModal = document.getElementById('close-tempo-modal');
const copyTempoTextBtn = document.getElementById('copy-tempo-text');

function clearSheetsContent() {
  requestAnimationFrame(() => {
    const content = document.getElementById('tempo-text-content');
    if (content) {
      content.textContent = '';
      content.className = 'flex-1 overflow-y-auto overflow-x-hidden small-scrollbar bg-gray-900 rounded p-1 font-mono text-sm text-gray-200 border border-gray-700 leading-relaxed pt-8 pr-2';
    }
    currentMidiFilename = null;
  });
}

if (closeTempoModal) {
  closeTempoModal.addEventListener('click', () => {
    if (viewTempoModal) {
      requestAnimationFrame(() => {
        viewTempoModal.style.opacity = '0';
        viewTempoModal.style.transition = 'opacity 0.15s ease-out';
        
        requestAnimationFrame(() => {
          setTimeout(() => {
            requestAnimationFrame(() => {
              viewTempoModal.classList.add('hidden');
              viewTempoModal.style.opacity = '';
              viewTempoModal.style.transition = '';
              clearSheetsContent();
            });
          }, 150);
        });
      });
    }
  });
}

if (viewTempoModal) {
  viewTempoModal.addEventListener('click', (e) => {
    if (e.target === viewTempoModal) {
      requestAnimationFrame(() => {
        viewTempoModal.style.opacity = '0';
        viewTempoModal.style.transition = 'opacity 0.15s ease-out';
        
        requestAnimationFrame(() => {
          setTimeout(() => {
            requestAnimationFrame(() => {
              viewTempoModal.classList.add('hidden');
              viewTempoModal.style.opacity = '';
              viewTempoModal.style.transition = '';
              clearSheetsContent();
            });
          }, 150);
        });
      });
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
      const rect = tempoModalContent.getBoundingClientRect();
      const headerContainer = document.getElementById('tempo-modal-header');
      
      tempoModalContent.style.position = 'fixed';
      tempoModalContent.style.left = `${rect.left}px`;
      tempoModalContent.style.top = `${rect.top}px`;
      tempoModalContent.style.width = `${rect.width}px`;
      tempoModalContent.style.height = `${rect.height}px`;
      tempoModalContent.style.margin = '0';
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          viewTempoModalContainer.classList.add('fullscreen-mode');
          tempoModalContent.classList.add('fullscreen-mode');
          if (headerContainer) {
            headerContainer.classList.add('fullscreen-mode');
          }
        });
      });
      
      fullscreenTempoBtn.textContent = '⛶';
      fullscreenTempoBtn.title = 'Exit Fullscreen';
      isFullscreen = true;
    } else {
      const headerContainer = document.getElementById('tempo-modal-header');
      
      viewTempoModalContainer.classList.add('items-center', 'justify-center');
      
      requestAnimationFrame(() => {
        viewTempoModalContainer.classList.remove('fullscreen-mode');
        tempoModalContent.classList.remove('fullscreen-mode');
        if (headerContainer) {
          headerContainer.classList.remove('fullscreen-mode');
        }
      });
      
      setTimeout(() => {
        tempoModalContent.style.position = '';
        tempoModalContent.style.left = '';
        tempoModalContent.style.top = '';
        tempoModalContent.style.width = '';
        tempoModalContent.style.height = '';
        tempoModalContent.style.margin = '';
        tempoModalContent.style.right = '';
        tempoModalContent.style.bottom = '';
      }, 300);
      
      fullscreenTempoBtn.textContent = '⛶';
      fullscreenTempoBtn.title = 'Fullscreen';
      isFullscreen = false;
    }
  });
}