import pretty_midi
import os
from typing import Dict, List, Tuple

VP_SCALE = (
    '1234567890qwert' +
    '1!2@34$5%6^78*9(0' +
    'qQwWeErtTyYuiIoOpP' +
    'asSdDfgGhHjJklL' +
    'zZxcCvVbBnm' +
    'yuiopasdfghj'
) 

FIRST_POSSIBLE_NOTE = 21
LAST_POSSIBLE_NOTE = 108

CAPITAL_NOTES = "!@#$%^&*()QWERTYUIOPASDFGHJKLZXCBVNM"


def note_to_char(midi_note: int) -> str:
    if FIRST_POSSIBLE_NOTE <= midi_note <= LAST_POSSIBLE_NOTE:
        index = midi_note - FIRST_POSSIBLE_NOTE
        if 0 <= index < len(VP_SCALE):
            return VP_SCALE[index]
    return None


def is_out_of_range(midi_note: int) -> bool:
    return midi_note <= 35 or midi_note >= 97


def is_capital(char: str) -> bool:
    return char in CAPITAL_NOTES


def get_separator(time_diff: float, beat_duration: float) -> str:
    if time_diff < beat_duration / 4:
        return '-'
    elif time_diff < beat_duration / 2:
        return ' '
    elif time_diff < beat_duration:
        return ' - '
    elif time_diff < beat_duration * 2:
        return ', '
    elif time_diff < beat_duration * 3:
        return '... '
    elif time_diff < beat_duration * 4:
        return '.... '
    else:
        return '...... '


def convert_midi_to_sheets(midi_file_path: str, output_file_path: str, settings: Dict = None) -> tuple[str, str]:
    if settings is None:
        settings = {}
    
    defaults = {
        'resilience': 2,
        'place_shifted_notes': 'start',
        'place_out_of_range_notes': 'inorder',
        'break_lines_how': 'manually',
        'break_lines_every': 4,
        'quantize': 35,
        'classic_chord_order': True,
        'sequential_quantizes': False,
        'curly_braces_for_quantized_chords': False,
        'include_out_of_range': True,
        'show_tempo_timing_marks': True,
        'show_out_of_range_text_marks': True,
        'out_of_range_separator': ':',
        'show_bpm_changes_as_comments': True,
        'auto_transpose': True,
        'multi_transpose': False,
    }
    
    final_settings = {**defaults, **settings}
    
    try:
        midi_data = pretty_midi.PrettyMIDI(midi_file_path)
    except Exception as e:
        raise Exception(f"Failed to load MIDI file: {str(e)}")
    
    all_notes = []
    for instrument in midi_data.instruments:
        if instrument.is_drum:
            continue
        for note in instrument.notes:
            all_notes.append({
                'start': note.start,
                'end': note.end,
                'pitch': note.pitch,
                'velocity': note.velocity,
                'instrument': instrument.program
            })
    
    all_notes.sort(key=lambda x: (x['start'], x['pitch']))
    
    applied_transpose = 0
    region_transpositions = []
    
    def score_transposition(transpose_by, notes_to_score):
            valid_notes = 0
            lowercase_notes = 0
            uppercase_notes = 0
            
            for note in notes_to_score:
                transposed_pitch = note['pitch'] + transpose_by
                if 21 <= transposed_pitch <= 108:
                    valid_notes += 1
                    char = note_to_char(transposed_pitch)
                    if char and not is_out_of_range(transposed_pitch):
                        if is_capital(char):
                            uppercase_notes += 1
                        else:
                            lowercase_notes += 1
            
            return (valid_notes * 2) + lowercase_notes - uppercase_notes
    
    if final_settings.get('auto_transpose', False):
        if final_settings.get('multi_transpose', False):
            tempo_changes_temp = midi_data.get_tempo_changes()
            if len(tempo_changes_temp[1]) == 0:
                default_tempo_temp = 120.0
                tempo_map_temp = [(0.0, 120.0)]
            else:
                default_tempo_temp = tempo_changes_temp[1][0]
                tempo_map_temp = list(zip(tempo_changes_temp[0], tempo_changes_temp[1]))
            
            def get_tempo_at_time(time):
                current_tempo = default_tempo_temp
                for tempo_time, tempo in tempo_map_temp:
                    if tempo_time <= time:
                        current_tempo = tempo
                    else:
                        break
                return current_tempo
            
            quantize_seconds_temp = final_settings['quantize'] / 1000.0
            chords_temp = []
            current_chord_temp = []
            last_start_time_temp = None
            
            for note in all_notes:
                if last_start_time_temp is None:
                    last_start_time_temp = note['start']
                    current_chord_temp = [note]
                else:
                    time_diff = note['start'] - last_start_time_temp
                    if time_diff < quantize_seconds_temp:
                        current_chord_temp.append(note)
                    else:
                        if current_chord_temp:
                            chords_temp.append(current_chord_temp)
                        current_chord_temp = [note]
                        last_start_time_temp = note['start']
            
            if current_chord_temp:
                chords_temp.append(current_chord_temp)
            
            beats_per_line = final_settings['break_lines_every']
            regions = []
            current_region_start = 0
            beats_accumulated = 0.0
            
            for i, chord in enumerate(chords_temp):
                if i < len(chords_temp) - 1:
                    next_chord = chords_temp[i + 1]
                    if next_chord:
                        chord_start = chord[0]['start']
                        time_diff = next_chord[0]['start'] - chord_start
                        current_tempo = get_tempo_at_time(chord_start)
                        beats_per_second = current_tempo / 60.0
                        seconds_per_beat = 1.0 / beats_per_second
                        beats_passed = time_diff / seconds_per_beat
                        beats_accumulated += beats_passed
                        
                        if beats_accumulated >= beats_per_line:
                            regions.append((current_region_start, i + 1))
                            current_region_start = i + 1
                            beats_accumulated = 0.0
            
            if current_region_start < len(chords_temp):
                regions.append((current_region_start, len(chords_temp)))
            
            if not regions:
                regions = [(0, len(chords_temp))]
            
            previous_transpose = 0
            transpose_index = 1
            
            for region_start, region_end in regions:
                region_notes = []
                for i in range(region_start, region_end):
                    if i < len(chords_temp):
                        region_notes.extend(chords_temp[i])
                
                if not region_notes:
                    continue
                
                best_transpose = previous_transpose
                best_score = score_transposition(previous_transpose, region_notes)
                
                for transpose_by in range(-12, 13):
                    score = score_transposition(transpose_by, region_notes)
                    if score > best_score + final_settings.get('resilience', 2):
                        best_score = score
                        best_transpose = transpose_by
                
                for note in region_notes:
                    new_pitch = note['pitch'] + best_transpose
                    note['pitch'] = max(21, min(108, new_pitch))
                
                region_transpositions.append({
                    'transpose': best_transpose,
                    'index': transpose_index,
                    'start_chord': region_start
                })
                transpose_index += 1
                
                previous_transpose = best_transpose
        else:
            best_transpose = 0
            best_score = score_transposition(0, all_notes)
            
            for transpose_by in range(-12, 13):
                score = score_transposition(transpose_by, all_notes)
                if score > best_score + final_settings.get('resilience', 2):
                    best_score = score
                    best_transpose = transpose_by
            
            applied_transpose = best_transpose
            for note in all_notes:
                new_pitch = note['pitch'] + best_transpose
                note['pitch'] = max(21, min(108, new_pitch))
    
    tempo_changes = midi_data.get_tempo_changes()
    if len(tempo_changes[1]) == 0:
        default_tempo = 120.0
        tempo_map = [(0.0, 120.0)]
    else:
        default_tempo = tempo_changes[1][0]
        tempo_map = list(zip(tempo_changes[0], tempo_changes[1]))
    
    quantize_seconds = final_settings['quantize'] / 1000.0
    chords = []
    current_chord = []
    last_start_time = None
    
    for note in all_notes:
        if last_start_time is None:
            last_start_time = note['start']
            current_chord = [note]
        else:
            time_diff = note['start'] - last_start_time
            if time_diff < quantize_seconds:
                current_chord.append(note)
            else:
                if current_chord:
                    chords.append(current_chord)
                current_chord = [note]
                last_start_time = note['start']
    
    if current_chord:
        chords.append(current_chord)
    
    def get_tempo_at_time(time):
        current_tempo = default_tempo
        for tempo_time, tempo in tempo_map:
            if tempo_time <= time:
                current_tempo = tempo
            else:
                break
        return current_tempo
    
    sheet_lines = []
    current_line = []
    beats_accumulated = 0.0
    beats_per_line = final_settings['break_lines_every']
    
    last_tempo = None
    chord_index = 0
    
    for i, chord in enumerate(chords):
        if not chord:
            continue
        
        chord_start = chord[0]['start']
        chord_pitches = sorted(set([n['pitch'] for n in chord]))
        
        current_tempo = get_tempo_at_time(chord_start)
        beats_per_second = current_tempo / 60.0
        seconds_per_beat = 1.0 / beats_per_second
        
        if final_settings['show_bpm_changes_as_comments']:
            if last_tempo is not None and current_tempo != last_tempo:
                tempo_change_pct = abs((current_tempo - last_tempo) / last_tempo * 100)
                if tempo_change_pct >= 10:
                    faster = current_tempo > last_tempo
                    comment = f"<!-- {int(tempo_change_pct)}% {'faster' if faster else 'slower'} - BPM changed to {int(current_tempo)} -->"
                    if current_line:
                        sheet_lines.append(("".join(current_line).rstrip(), chord_index))
                        current_line = []
                    sheet_lines.append((comment, chord_index))
            if last_tempo is None:
                comment = f"<!-- Tempo: {int(current_tempo)} BPM -->"
                if current_line:
                    sheet_lines.append(("".join(current_line).rstrip(), chord_index))
                    current_line = []
                sheet_lines.append((comment, chord_index))
            last_tempo = current_tempo
        
        is_quantized = len(chord) > 1 and any(
            abs(n['start'] - chord[0]['start']) > 0.001 for n in chord
        )
        
        oors_start = []
        oors_end = []
        regular_notes = []
        shifted_notes = []
        
        for pitch in chord_pitches:
            char = note_to_char(pitch)
            if char is None:
                continue
            
            is_oor = is_out_of_range(pitch)
            is_shift = is_capital(char)
            
            if is_oor and final_settings['include_out_of_range']:
                place_oors = final_settings['place_out_of_range_notes'].lower()
                if place_oors == 'start':
                    oors_start.append((pitch, char))
                elif place_oors == 'end':
                    oors_end.append((pitch, char))
                else:
                    if pitch <= 35:
                        oors_start.append((pitch, char))
                    else:
                        oors_end.append((pitch, char))
            elif is_shift:
                if final_settings['place_shifted_notes'].lower() == 'start':
                    shifted_notes.insert(0, (pitch, char))
                else:
                    shifted_notes.append((pitch, char))
            else:
                regular_notes.append((pitch, char))
        
        if final_settings['classic_chord_order']:
            regular_notes.sort(key=lambda x: x[0])
            shifted_notes.sort(key=lambda x: x[0])
            oors_start.sort(key=lambda x: x[0])
            oors_end.sort(key=lambda x: x[0])
        else:
            regular_notes.sort(key=lambda x: x[0])
            shifted_notes.sort(key=lambda x: x[0])
            oors_start.sort(key=lambda x: x[0])
            oors_end.sort(key=lambda x: x[0])
        
        chord_str = ""
        use_brackets = len(chord_pitches) > 1
        
        if use_brackets:
            if is_quantized and final_settings['curly_braces_for_quantized_chords']:
                chord_str += "{"
            else:
                chord_str += "["
        
        if oors_start:
            for idx, (pitch, char) in enumerate(oors_start):
                is_first_start_oor = (idx == 0)
                is_last_start_oor = (idx == len(oors_start) - 1)
                has_non_oor_after = (len(regular_notes) > 0 or len(shifted_notes) > 0)
                
                if final_settings['show_out_of_range_text_marks']:
                    separator = final_settings['out_of_range_separator']
                    if is_first_start_oor:
                        chord_str += f"{separator}{char}"
                    else:
                        chord_str += char
                    
                    if is_last_start_oor and has_non_oor_after:
                        chord_str += "'"
                else:
                    chord_str += char
                    if is_last_start_oor and has_non_oor_after:
                        chord_str += "'"
        
        if final_settings['place_shifted_notes'].lower() == 'start':
            for pitch, char in shifted_notes:
                chord_str += char
        
        for pitch, char in regular_notes:
            chord_str += char
        
        if final_settings['place_shifted_notes'].lower() != 'start':
            for pitch, char in shifted_notes:
                chord_str += char
        
        if oors_end:
            for idx, (pitch, char) in enumerate(oors_end):
                is_first_end_oor = (idx == 0)
                is_first_end_oor_without_chord = (not use_brackets and idx == 0)
                is_chord_with_only_end_oors = (use_brackets and len(oors_start) == 0 and len(regular_notes) == 0 and len(shifted_notes) == 0 and idx == 0)
                is_chord_with_more_than_one_non_oor_and_first_end = (use_brackets and (len(regular_notes) > 0 or len(shifted_notes) > 0) and idx == 0)
                
                should_add_separator = (is_first_end_oor_without_chord or 
                                       is_chord_with_only_end_oors or 
                                       is_chord_with_more_than_one_non_oor_and_first_end)
                
                if final_settings['show_out_of_range_text_marks']:
                    separator = final_settings['out_of_range_separator']
                    if should_add_separator:
                        chord_str += f"{separator}{char}"
                    else:
                        chord_str += char
                else:
                    chord_str += char
        
        if use_brackets:
            if is_quantized and final_settings['curly_braces_for_quantized_chords']:
                chord_str += "}"
            else:
                chord_str += "]"
        
        if final_settings['show_tempo_timing_marks'] and i < len(chords) - 1:
            next_chord = chords[i + 1]
            if next_chord:
                time_diff = next_chord[0]['start'] - chord_start
                separator = get_separator(time_diff, seconds_per_beat)
                chord_str += separator
            else:
                chord_str += " "
        else:
            chord_str += " "
        
        current_line.append(chord_str)
        chord_index += 1
        
        line_break_occurred = False
        
        if final_settings['break_lines_how'] == 'manually':
            if i < len(chords) - 1:
                next_chord = chords[i + 1]
                if next_chord:
                    time_diff = next_chord[0]['start'] - chord_start
                    beats_passed = time_diff / seconds_per_beat
                    beats_accumulated += beats_passed
                    
                    if beats_accumulated >= beats_per_line:
                        sheet_lines.append(("".join(current_line).rstrip(), chord_index))
                        current_line = []
                        beats_accumulated = 0.0
                        line_break_occurred = True
            else:
                if current_line:
                    sheet_lines.append(("".join(current_line).rstrip(), chord_index))
                    current_line = []
                    line_break_occurred = True
        else:
            if i < len(chords) - 1:
                next_chord = chords[i + 1]
                if next_chord:
                    time_diff = next_chord[0]['start'] - chord_start
                    beats_passed = time_diff / seconds_per_beat
                    beats_accumulated += beats_passed
                    
                    if beats_accumulated >= 4.0:
                        sheet_lines.append(("".join(current_line).rstrip(), chord_index))
                        current_line = []
                        beats_accumulated = 0.0
                        line_break_occurred = True
    
    if current_line:
        sheet_lines.append(("".join(current_line).rstrip(), chord_index))
    
    output_lines = []
    
    if final_settings.get('multi_transpose', False) and region_transpositions:
        transpose_index_map = {}
        for rt in region_transpositions:
            transpose_index_map[rt['start_chord']] = rt
        
        final_output_lines = []
        previous_chord_index = 0
        last_transpose_value = None
        
        for line_data in sheet_lines:
            if isinstance(line_data, tuple):
                line, current_chord_idx = line_data
            else:
                line = line_data
                current_chord_idx = previous_chord_index + 1
            
            if line.strip().startswith('<!--'):
                final_output_lines.append(line)
                continue
            
            if previous_chord_index in transpose_index_map:
                rt = transpose_index_map[previous_chord_index]
                display_transpose = -rt['transpose']
                
                if last_transpose_value is None or display_transpose != last_transpose_value:
                    transpose_text = f"Transpose by: {display_transpose}"
                    
                    if last_transpose_value is not None:
                        distance = display_transpose - last_transpose_value
                        transpose_text += f" ({distance:+d})"
                    
                    final_output_lines.append(transpose_text)
                    last_transpose_value = display_transpose
            
            final_output_lines.append(line)
            previous_chord_index = current_chord_idx
        
        if 0 in transpose_index_map and not any(isinstance(line, str) and line.strip().startswith('Transpose by:') for line in final_output_lines[:5]):
            rt = transpose_index_map[0]
            display_transpose = -rt['transpose']
            transpose_text = f"Transpose by: {display_transpose}"
            output_lines.append(transpose_text)
            output_lines.append("")
        
        output_lines.extend(final_output_lines)
    else:
        display_transpose = -applied_transpose
        output_lines.append(f"Transpose by: {display_transpose}")
        output_lines.append("")
        
        for line_data in sheet_lines:
            if isinstance(line_data, tuple):
                output_lines.append(line_data[0])
            else:
                output_lines.append(line_data)
    
    output_text = "\n".join(output_lines)
    with open(output_file_path, 'w', encoding='utf-8') as f:
        f.write(output_text)
    
    return output_file_path, output_text
