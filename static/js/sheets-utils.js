const tempoColors = {
  long: '#a3f0a3',
  quadruple: '#a3f0a3',
  whole: '#74da74',
  half: '#9ada5a',
  quarter: '#c0c05a',
  eighth: '#da7e5a',
  sixteenth: '#daa6a6',
  thirtysecond: '#ff1900',
  sixtyfourth: '#9c0f00'
};

function separator(beat, difference) {
  if (difference < beat / 4)
    return '-'
  if (difference < beat / 2)
    return ' '
  if (difference < beat)
    return ' - '
  if (difference < beat * 2)
    return ', '
  if (difference < beat * 3)
    return '... '
  if (difference < beat * 4)
    return '.... '
  else return '...... '
}

function color_for_chord(beat, difference) {
  difference -= 0.5;
  
  let color = tempoColors.long;
  
  if (difference < beat / 16) color = tempoColors.sixtyfourth;
  else if (difference < beat / 8) color = tempoColors.thirtysecond;
  else if (difference < beat / 4) color = tempoColors.sixteenth;
  else if (difference < beat / 2) color = tempoColors.eighth;
  else if (difference < beat) color = tempoColors.quarter;
  else if (difference < beat * 2)
    color = tempoColors.half;
  else if (difference < beat * 4) color = tempoColors.whole;
  else if (difference < beat * 8) color = tempoColors.quadruple;
  else if (difference < beat * 16) color = tempoColors.long;
  
  return color;
}

// Break markers used in hand-written sheets on top of the generated ones:
//   |        long break
//   – / —    break (en/em dash, often pasted instead of "-")
//   ....     section break, any run of 3+ dots
const LONG_BREAK_CHARS = '|¦';
const DASH_BREAK_CHARS = '–—‒―';

function getColorFromSeparator(separatorStr) {
  if (!separatorStr) return tempoColors.long;

  if (separatorStr[0] === '.') {
    const dots = (separatorStr.match(/\./g) || []).length;
    if (dots >= 5) return tempoColors.quadruple;
    if (dots >= 4) return tempoColors.whole;
    return tempoColors.whole;
  }

  if (LONG_BREAK_CHARS.includes(separatorStr[0])) return tempoColors.long;
  if (DASH_BREAK_CHARS.includes(separatorStr[0])) return tempoColors.quarter;

  if (separatorStr === ', ') return tempoColors.half;
  if (separatorStr === ' - ') return tempoColors.quarter;
  if (separatorStr === ' ') return tempoColors.eighth;
  if (separatorStr === '-') return tempoColors.sixteenth;

  return tempoColors.long;
}

function isSeparatorAt(text, pos) {
  if (pos >= text.length) return null;

  const ch = text[pos];

  // Run of 3+ dots (with an optional trailing space) = section break
  if (ch === '.') {
    let dots = 0;
    while (pos + dots < text.length && text[pos + dots] === '.') dots++;
    if (dots >= 3) {
      const trailingSpace = text[pos + dots] === ' ' ? 1 : 0;
      return {
        type: '.'.repeat(dots) + (trailingSpace ? ' ' : ''),
        len: dots + trailingSpace,
      };
    }
    return null;
  }

  if (LONG_BREAK_CHARS.includes(ch)) {
    const trailingSpace = text[pos + 1] === ' ' ? 1 : 0;
    return { type: ch + (trailingSpace ? ' ' : ''), len: 1 + trailingSpace };
  }

  if (DASH_BREAK_CHARS.includes(ch)) {
    const trailingSpace = text[pos + 1] === ' ' ? 1 : 0;
    return { type: ch + (trailingSpace ? ' ' : ''), len: 1 + trailingSpace };
  }

  if (pos + 3 <= text.length && text.substring(pos, pos + 3) === ' - ') {
    return { type: ' - ', len: 3 };
  }

  if (pos + 2 <= text.length && text.substring(pos, pos + 2) === ', ') {
    return { type: ', ', len: 2 };
  }

  if (ch === '-') {
    if (pos === 0 || text[pos - 1] !== ' ') {
      return { type: '-', len: 1 };
    }
  }

  if (ch === ' ') {
    return { type: ' ', len: 1 };
  }

  return null;
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function processChordSegment(segment, color, isOutOfRangeSegment) {
  if (!segment) return '';
  
  const escaped = escapeHtml(segment);
  
  if (isOutOfRangeSegment) {
    return `<span style="color:${color}; font-weight: 900; border-bottom: 2px solid; display: inline-flex; justify-content: center; min-width: 0.6em; text-stroke: 0.5px ${color}; -webkit-text-stroke: 0.5px ${color};">${escaped}</span>`;
  } else {
    return `<span style="color:${color}">${escaped}</span>`;
  }
}

function colorizeTempoText(text) {
  const lines = text.split('\n');
  const result = [];
  let skipNextEmpty = false;
  
  for (const line of lines) {
    const trimmed = line.trim();

    if (/^transpose by\b/i.test(trimmed)) {
      result.push(escapeHtml(line) + '\n');
      skipNextEmpty = true;
      continue;
    }

    if (skipNextEmpty && !line.trim()) {
      skipNextEmpty = false;
      continue;
    }

    skipNextEmpty = false;

    if (!line.trim()) {
      result.push('\n');
      continue;
    }

    if (trimmed.startsWith('<!--')) {
      result.push(escapeHtml(line) + '\n');
      continue;
    }

    // Legend lines such as "| = long break" are prose, not notes
    if (/\s=\s/.test(line)) {
      result.push(escapeHtml(line) + '\n');
      continue;
    }

    const separators = [];
    let pos = 0;
    
    while (pos < line.length) {
      const sepInfo = isSeparatorAt(line, pos);
      
      if (sepInfo) {
        separators.push({
          start: pos,
          end: pos + sepInfo.len,
          text: sepInfo.type,
          color: getColorFromSeparator(sepInfo.type)
        });
        pos += sepInfo.len;
      } else {
        pos++;
      }
    }
    
    const segments = [];
    let currentStart = 0;
    let currentColor = tempoColors.long;
    
    for (const sep of separators) {
      if (sep.start > currentStart) {
        segments.push({
          text: line.substring(currentStart, sep.start),
          color: currentColor,
          isOutOfRange: false
        });
      }
      currentStart = sep.end;
      currentColor = sep.color;
    }
    
    if (currentStart < line.length) {
      segments.push({
        text: line.substring(currentStart),
        color: currentColor,
        isOutOfRange: false
      });
    }
    
    if (separators.length === 0) {
      segments.push({
        text: line,
        color: tempoColors.long,
        isOutOfRange: false
      });
    }
    
    for (const segment of segments) {
      const outOfRangeIndices = new Set();
      for (let i = 0; i < segment.text.length - 1; i++) {
        if (segment.text[i] === ':' && /[a-zA-Z0-9!@#$%^&*()_+=\[\]{}|\\:";'<>?,./`~-]/.test(segment.text[i + 1])) {
          outOfRangeIndices.add(i);
          outOfRangeIndices.add(i + 1);
        }
      }
      segment.outOfRangeIndices = outOfRangeIndices;
    }
    
    const lineParts = [];
    for (let i = 0; i < separators.length; i++) {
      const sep = separators[i];
      const chordStart = i === 0 ? 0 : separators[i - 1].end;
      const chordText = line.substring(chordStart, sep.end);
      const chordColor = sep.color;
      
      lineParts.push('<span class="chord-block svelte-1l3km4k">');
      
      let chunk = '';
      for (let j = 0; j < chordText.length; j++) {
        const char = chordText[j];
        const isOutOfRange = (chordStart + j >= 0 && line[chordStart + j] === ':' && 
                              j + 1 < chordText.length && 
                              /[a-zA-Z0-9!@#$%^&*()_+=\[\]{}|\\:";'<>?,./`~-]/.test(chordText[j + 1])) ||
                             (j > 0 && line[chordStart + j - 1] === ':');
        
        if (isOutOfRange) {
          chunk += `<span style="color:${chordColor}; font-weight: 900; border-bottom: 2px solid; display: inline-flex; justify-content: center; min-width: 0.6em; text-stroke: 0.5px ${chordColor}; -webkit-text-stroke: 0.5px ${chordColor};">${escapeHtml(char)}</span>`;
        } else {
          chunk += `<span style="color:${chordColor}">${escapeHtml(char)}</span>`;
        }
      }
      
      lineParts.push(chunk);
      lineParts.push('</span>');
    }
    
    if (separators.length === 0) {
      lineParts.push('<span class="chord-block svelte-1l3km4k">');
      let chunk = '';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const color = tempoColors.long;
        const isOutOfRange = i < line.length - 1 && line[i] === ':' && 
                            /[a-zA-Z0-9!@#$%^&*()_+=\[\]{}|\\:";'<>?,./`~-]/.test(line[i + 1]);
        
        if (isOutOfRange || (i > 0 && line[i - 1] === ':')) {
          chunk += `<span style="color:${color}; font-weight: 900; border-bottom: 2px solid; display: inline-flex; justify-content: center; min-width: 0.6em;">${escapeHtml(char)}</span>`;
        } else {
          chunk += `<span style="color:${color}">${escapeHtml(char)}</span>`;
        }
      }
      lineParts.push(chunk);
      lineParts.push('</span>');
    } else if (separators.length > 0 && separators[separators.length - 1].end < line.length) {
      const remainingStart = separators[separators.length - 1].end;
      const remainingText = line.substring(remainingStart);
      const remainingColor = separators[separators.length - 1].color;
      
      lineParts.push('<span class="chord-block svelte-1l3km4k">');
      let chunk = '';
      for (let i = 0; i < remainingText.length; i++) {
        const char = remainingText[i];
        const isOutOfRange = (remainingStart + i < line.length - 1 && line[remainingStart + i] === ':' && 
                              /[a-zA-Z0-9!@#$%^&*()_+=\[\]{}|\\:";'<>?,./`~-]/.test(line[remainingStart + i + 1])) ||
                             (i > 0 && remainingText[i - 1] === ':');
        
        if (isOutOfRange) {
          chunk += `<span style="color:${remainingColor}; font-weight: 900; border-bottom: 2px solid; display: inline-flex; justify-content: center; min-width: 0.6em;">${escapeHtml(char)}</span>`;
        } else {
          chunk += `<span style="color:${remainingColor}">${escapeHtml(char)}</span>`;
        }
      }
      lineParts.push(chunk);
      lineParts.push('</span>');
    }
    
    result.push(lineParts.join('') + '\n');
  }
  
  return result.join('');
}







