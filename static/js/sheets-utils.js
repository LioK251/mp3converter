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

function getColorFromSeparator(separatorStr) {
  if (!separatorStr) return tempoColors.long;
  
  if (separatorStr === '...... ') return tempoColors.quadruple;
  if (separatorStr === '.... ') return tempoColors.whole;
  if (separatorStr === '... ') return tempoColors.whole;
  if (separatorStr === '...') return tempoColors.whole;
  if (separatorStr === ', ') return tempoColors.half;
  if (separatorStr === ' - ') return tempoColors.quarter;
  if (separatorStr === ' ') return tempoColors.eighth;
  if (separatorStr === '-') return tempoColors.sixteenth;
  
  return tempoColors.long;
}

function isSeparatorAt(text, pos) {
  if (pos >= text.length) return null;
  
  if (pos + 8 <= text.length && text.substring(pos, pos + 8) === '...... ') {
    return { type: '...... ', len: 8 };
  }
  
  if (pos + 5 <= text.length && text.substring(pos, pos + 5) === '.... ') {
    return { type: '.... ', len: 5 };
  }
  
  if (pos + 4 <= text.length && text.substring(pos, pos + 4) === '... ') {
    return { type: '... ', len: 4 };
  }
  
  if (pos + 3 <= text.length && text.substring(pos, pos + 3) === '...') {
    if (pos + 4 > text.length || text[pos + 3] !== '.') {
      if (pos + 3 >= text.length || text[pos + 3] === ' ') {
        return { type: '...', len: 3 };
      }
    }
  }
  
  if (pos + 3 <= text.length && text.substring(pos, pos + 3) === ' - ') {
    return { type: ' - ', len: 3 };
  }
  
  if (pos + 2 <= text.length && text.substring(pos, pos + 2) === ', ') {
    return { type: ', ', len: 2 };
  }
  
  if (text[pos] === '-') {
    if (pos === 0 || text[pos - 1] !== ' ') {
      return { type: '-', len: 1 };
    }
  }
  
  if (text[pos] === ' ') {
    return { type: ' ', len: 1 };
  }
  
  return null;
}

function colorizeTempoText(text) {
  const lines = text.split('\n');
  let result = '';
  let skipNextEmpty = false;
  
  for (const line of lines) {
    if (line.trim().startsWith('Transpose by:')) {
      const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      result += escaped + '\n';
      skipNextEmpty = true;
      continue;
    }
    
    if (skipNextEmpty && !line.trim()) {
      skipNextEmpty = false;
      continue;
    }
    
    skipNextEmpty = false;
    
    if (!line.trim()) {
      result += '\n';
      continue;
    }
    
    if (line.trim().startsWith('<!--')) {
      const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      result += escaped + '\n';
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
    
    const charColors = new Array(line.length);
    for (let i = 0; i < line.length; i++) {
      charColors[i] = tempoColors.long;
    }
    
    let segmentStart = 0;
    
    for (let i = 0; i < separators.length; i++) {
      const sep = separators[i];
      
      for (let j = segmentStart; j < sep.end && j < line.length; j++) {
        charColors[j] = sep.color;
      }
      
      segmentStart = sep.end;
    }
    
    if (separators.length > 0) {
      const lastColor = separators[separators.length - 1].color;
      for (let i = segmentStart; i < line.length; i++) {
        charColors[i] = lastColor;
      }
    }
    
    const isOutOfRange = new Array(line.length).fill(false);
    for (let i = 0; i < line.length - 1; i++) {
      if (line[i] === ':' && /[a-zA-Z0-9!@#$%^&*()_+=\[\]{}|\\:";'<>?,./`~-]/.test(line[i + 1])) {
        isOutOfRange[i] = true;
        isOutOfRange[i + 1] = true;
      }
    }
    
    let chordStart = 0;
    
    for (let i = 0; i < separators.length; i++) {
      const sep = separators[i];
      const chordEnd = sep.end;
      
      result += '<span class="chord-block svelte-1l3km4k">';
      
      for (let j = chordStart; j < chordEnd && j < line.length; j++) {
        const char = line[j];
        const color = charColors[j] || tempoColors.long;
        const escaped = char.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        if (isOutOfRange[j]) {
          result += `<span style="color:${color}; font-weight: 900; border-bottom: 2px solid; display: inline-flex; justify-content: center; min-width: 0.6em; text-stroke: 0.5px ${color}; -webkit-text-stroke: 0.5px ${color};">${escaped}</span>`;
        } else {
          result += `<span style="color:${color}">${escaped}</span>`;
        }
      }
      
      result += '</span>';
      
      chordStart = chordEnd;
    }
    
    if (chordStart < line.length) {
      result += '<span class="chord-block svelte-1l3km4k">';
      for (let i = chordStart; i < line.length; i++) {
        const char = line[i];
        const color = charColors[i] || tempoColors.long;
        const escaped = char.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        if (isOutOfRange[i]) {
          result += `<span style="color:${color}; font-weight: 900; border-bottom: 2px solid; display: inline-flex; justify-content: center; min-width: 0.6em;">${escaped}</span>`;
        } else {
          result += `<span style="color:${color}">${escaped}</span>`;
        }
      }
      result += '</span>';
    }
    
    if (separators.length === 0) {
      result += '<span class="chord-block svelte-1l3km4k">';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const color = charColors[i] || tempoColors.long;
        const escaped = char.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        if (isOutOfRange[i]) {
          result += `<span style="color:${color}; font-weight: 900; border-bottom: 2px solid; display: inline-flex; justify-content: center; min-width: 0.6em;">${escaped}</span>`;
        } else {
          result += `<span style="color:${color}">${escaped}</span>`;
        }
      }
      result += '</span>';
    }
    
    result += '\n';
  }
  
  return result;
}