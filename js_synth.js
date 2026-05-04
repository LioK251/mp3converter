/*!
js-synthesizer version 1.8.5

@license

Copyright (C) 2023 jet
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  1. Redistributions of source code must retain the above copyright notice,
     this list of conditions and the following disclaimer.
  2. Redistributions in binary form must reproduce the above copyright notice,
     this list of conditions and the following disclaimer in the documentation
     and/or other materials provided with the distribution.
  3. The name of the author may not be used to endorse or promote products derived
     from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES,
INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
OF SUCH DAMAGE.
 */

(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["js-synthesizer"] = factory();
	else
		root["JSSynth"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!****************************************!*\
  !*** ./src/main/index.ts + 15 modules ***!
  \****************************************/
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "AudioWorkletNodeSynthesizer": () => (/* reexport */ AudioWorkletNodeSynthesizer),
  "Constants": () => (/* reexport */ Constants_namespaceObject),
  "MessageError": () => (/* reexport */ MessageError),
  "SequencerEventTypes": () => (/* reexport */ SequencerEvent_namespaceObject),
  "Synthesizer": () => (/* reexport */ Synthesizer),
  "rewriteEventData": () => (/* reexport */ rewriteEventData),
  "waitForReady": () => (/* reexport */ waitForReady)
});

// NAMESPACE OBJECT: ./src/main/Constants.ts
var Constants_namespaceObject = {};
__webpack_require__.r(Constants_namespaceObject);

// NAMESPACE OBJECT: ./src/main/SequencerEvent.ts
var SequencerEvent_namespaceObject = {};
__webpack_require__.r(SequencerEvent_namespaceObject);

;// CONCATENATED MODULE: ./src/main/Constants.ts


;// CONCATENATED MODULE: ./src/main/PointerType.ts
const INVALID_POINTER = 0;

;// CONCATENATED MODULE: ./src/main/SequencerEventData.ts

/** @internal */
class SequencerEventData {
    /** @internal */
    constructor(_ptr, _module) {
        this._ptr = _ptr;
        this._module = _module;
    }
    /** @internal */
    getRaw() {
        return this._ptr;
    }
    /** @internal */
    dispose() {
        this._ptr = INVALID_POINTER;
    }
    getType() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_type(this._ptr);
    }
    getSource() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_source(this._ptr);
    }
    getDest() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_dest(this._ptr);
    }
    getChannel() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_channel(this._ptr);
    }
    getKey() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_key(this._ptr);
    }
    getVelocity() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_velocity(this._ptr);
    }
    getControl() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_control(this._ptr);
    }
    getValue() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_value(this._ptr);
    }
    getProgram() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_program(this._ptr);
    }
    getData() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_data(this._ptr);
    }
    getDuration() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_duration(this._ptr);
    }
    getBank() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_bank(this._ptr);
    }
    getPitch() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_pitch(this._ptr);
    }
    getSFontId() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_sfont_id(this._ptr);
    }
}

;// CONCATENATED MODULE: ./src/main/ISequencerEventData.ts
/** @internal */

/** @internal */

const _module = typeof AudioWorkletGlobalScope !== 'undefined' ?
    AudioWorkletGlobalScope.wasmModule : Module;
/** @internal */
function rewriteEventDataImpl(ev, event) {
    switch (event.type) {
        case 0 /* Note */:
        case 'note':
            _module._fluid_event_note(ev, event.channel, event.key, event.vel, event.duration);
            break;
        case 1 /* NoteOn */:
        case 'noteon':
        case 'note-on':
            _module._fluid_event_noteon(ev, event.channel, event.key, event.vel);
            break;
        case 2 /* NoteOff */:
        case 'noteoff':
        case 'note-off':
            _module._fluid_event_noteoff(ev, event.channel, event.key);
            break;
        case 3 /* AllSoundsOff */:
        case 'allsoundsoff':
        case 'all-sounds-off':
            _module._fluid_event_all_sounds_off(ev, event.channel);
            break;
        case 4 /* AllNotesOff */:
        case 'allnotesoff':
        case 'all-notes-off':
            _module._fluid_event_all_notes_off(ev, event.channel);
            break;
        case 5 /* BankSelect */:
        case 'bankselect':
        case 'bank-select':
            _module._fluid_event_bank_select(ev, event.channel, event.bank);
            break;
        case 6 /* ProgramChange */:
        case 'programchange':
        case 'program-change':
            _module._fluid_event_program_change(ev, event.channel, event.preset);
            break;
        case 7 /* ProgramSelect */:
        case 'programselect':
        case 'program-select':
            _module._fluid_event_program_select(ev, event.channel, event.sfontId, event.bank, event.preset);
            break;
        case 12 /* ControlChange */:
        case 'controlchange':
        case 'control-change':
            _module._fluid_event_control_change(ev, event.channel, event.control, event.value);
            break;
        case 8 /* PitchBend */:
        case 'pitchbend':
        case 'pitch-bend':
            _module._fluid_event_pitch_bend(ev, event.channel, event.value);
            break;
        case 9 /* PitchWheelSensitivity */:
        case 'pitchwheelsens':
        case 'pitchwheelsensitivity':
        case 'pitch-wheel-sens':
        case 'pitch-wheel-sensitivity':
            _module._fluid_event_pitch_wheelsens(ev, event.channel, event.value);
            break;
        case 10 /* Modulation */:
        case 'modulation':
            _module._fluid_event_modulation(ev, event.channel, event.value);
            break;
        case 11 /* Sustain */:
        case 'sustain':
            _module._fluid_event_sustain(ev, event.channel, event.value);
            break;
        case 13 /* Pan */:
        case 'pan':
            _module._fluid_event_pan(ev, event.channel, event.value);
            break;
        case 14 /* Volume */:
        case 'volume':
            _module._fluid_event_volume(ev, event.channel, event.value);
            break;
        case 15 /* ReverbSend */:
        case 'reverb':
        case 'reverbsend':
        case 'reverb-send':
            _module._fluid_event_reverb_send(ev, event.channel, event.value);
            break;
        case 16 /* ChorusSend */:
        case 'chorus':
        case 'chorussend':
        case 'chorus-send':
            _module._fluid_event_chorus_send(ev, event.channel, event.value);
            break;
        case 20 /* KeyPressure */:
        case 'keypressure':
        case 'key-pressure':
        case 'aftertouch':
            _module._fluid_event_key_pressure(ev, event.channel, event.key, event.value);
            break;
        case 19 /* ChannelPressure */:
        case 'channelpressure':
        case 'channel-pressure':
        case 'channel-aftertouch':
            _module._fluid_event_channel_pressure(ev, event.channel, event.value);
            break;
        case 21 /* SystemReset */:
        case 'systemreset':
        case 'system-reset':
            _module._fluid_event_system_reset(ev);
            break;
        case 17 /* Timer */:
        case 'timer':
            _module._fluid_event_timer(ev, event.data);
            break;
        default:
            // 'typeof event' must be 'never' here
            return false;
    }
    return true;
}
/**
 * Rewrites event data with specified SequencerEvent object.
 * @param data destination instance
 * @param event source data
 * @return true if succeeded
 */
function rewriteEventData(data, event) {
    if (!data || !(data instanceof SequencerEventData)) {
        return false;
    }
    const ev = data.getRaw();
    if (ev === INVALID_POINTER) {
        return false;
    }
    return rewriteEventDataImpl(ev, event);
}

;// CONCATENATED MODULE: ./src/main/MessageError.ts
/** Error object used for errors occurred in the message receiver (e.g. Worklet) */
class MessageError extends Error {
    constructor(baseName, message, detail) {
        super(message);
        this.baseName = baseName;
        this.detail = detail;
        if (detail && detail.stack) {
            this.stack = detail.stack;
        }
    }
}

;// CONCATENATED MODULE: ./src/main/SequencerEvent.ts


;// CONCATENATED MODULE: ./src/main/MIDIEvent.ts
/** @internal */
class MIDIEvent {
    /** @internal */
    constructor(_ptr, _module) {
        this._ptr = _ptr;
        this._module = _module;
    }
    getType() {
        return this._module._fluid_midi_event_get_type(this._ptr);
    }
    setType(value) {
        this._module._fluid_midi_event_set_type(this._ptr, value);
    }
    getChannel() {
        return this._module._fluid_midi_event_get_channel(this._ptr);
    }
    setChannel(value) {
        this._module._fluid_midi_event_set_channel(this._ptr, value);
    }
    getKey() {
        return this._module._fluid_midi_event_get_key(this._ptr);
    }
    setKey(value) {
        this._module._fluid_midi_event_set_key(this._ptr, value);
    }
    getVelocity() {
        return this._module._fluid_midi_event_get_velocity(this._ptr);
    }
    setVelocity(value) {
        this._module._fluid_midi_event_set_velocity(this._ptr, value);
    }
    getControl() {
        return this._module._fluid_midi_event_get_control(this._ptr);
    }
    setControl(value) {
        this._module._fluid_midi_event_set_control(this._ptr, value);
    }
    getValue() {
        return this._module._fluid_midi_event_get_value(this._ptr);
    }
    setValue(value) {
        this._module._fluid_midi_event_set_value(this._ptr, value);
    }
    getProgram() {
        return this._module._fluid_midi_event_get_program(this._ptr);
    }
    setProgram(value) {
        this._module._fluid_midi_event_set_program(this._ptr, value);
    }
    getPitch() {
        return this._module._fluid_midi_event_get_pitch(this._ptr);
    }
    setPitch(value) {
        this._module._fluid_midi_event_set_pitch(this._ptr, value);
    }
    setSysEx(data) {
        const size = data.byteLength;
        const ptr = this._module._malloc(size);
        const ptrView = new Uint8Array(this._module.HEAPU8.buffer, ptr, size);
        ptrView.set(data);
        this._module._fluid_midi_event_set_sysex(this._ptr, ptr, size, 1);
    }
    setText(data) {
        const size = data.byteLength;
        const ptr = this._module._malloc(size);
        const ptrView = new Uint8Array(this._module.HEAPU8.buffer, ptr, size);
        ptrView.set(data);
        this._module._fluid_midi_event_set_text(this._ptr, ptr, size, 1);
    }
    setLyrics(data) {
        const size = data.byteLength;
        const ptr = this._module._malloc(size);
        const ptrView = new Uint8Array(this._module.HEAPU8.buffer, ptr, size);
        ptrView.set(data);
        this._module._fluid_midi_event_set_lyrics(this._ptr, ptr, size, 1);
    }
}

;// CONCATENATED MODULE: ./src/main/Sequencer.ts




let Sequencer_module;
let _removeFunction;
let fluid_sequencer_get_client_name;
function bindFunctions() {
    if (Sequencer_module) {
        return;
    }
    if (typeof AudioWorkletGlobalScope !== 'undefined') {
        Sequencer_module = AudioWorkletGlobalScope.wasmModule;
        _removeFunction = AudioWorkletGlobalScope.wasmRemoveFunction;
    }
    else {
        Sequencer_module = Module;
        _removeFunction = removeFunction;
    }
    fluid_sequencer_get_client_name =
        Sequencer_module.cwrap('fluid_sequencer_get_client_name', 'string', ['number', 'number']);
}
function makeEvent(event) {
    const ev = Sequencer_module._new_fluid_event();
    if (!rewriteEventDataImpl(ev, event)) {
        Sequencer_module._delete_fluid_event(ev);
        return null;
    }
    return ev;
}
/** @internal */
class Sequencer {
    constructor() {
        bindFunctions();
        this._seq = INVALID_POINTER;
        this._seqId = -1;
        this._clientFuncMap = {};
    }
    /** @internal */
    _initialize() {
        this.close();
        this._seq = Sequencer_module._new_fluid_sequencer2(0);
        this._seqId = -1;
        return Promise.resolve();
    }
    /** @internal */
    getRaw() {
        return this._seq;
    }
    close() {
        if (this._seq !== INVALID_POINTER) {
            Object.keys(this._clientFuncMap).forEach((clientIdStr) => {
                this.unregisterClient(Number(clientIdStr));
            });
            this.unregisterClient(-1);
            Sequencer_module._delete_fluid_sequencer(this._seq);
            this._seq = INVALID_POINTER;
        }
    }
    registerSynthesizer(synth) {
        if (this._seqId !== -1) {
            Sequencer_module._fluid_sequencer_unregister_client(this._seq, this._seqId);
            this._seqId = -1;
        }
        let val;
        if (typeof synth === 'number') {
            val = synth;
        }
        else if (synth instanceof Synthesizer) {
            val = synth.getRawSynthesizer();
        }
        else {
            return Promise.reject(new TypeError('\'synth\' is not a compatible type instance'));
        }
        this._seqId = Sequencer_module._fluid_sequencer_register_fluidsynth(this._seq, val);
        return Promise.resolve(this._seqId);
    }
    unregisterClient(clientId) {
        if (clientId === -1) {
            clientId = this._seqId;
            if (clientId === -1) {
                return;
            }
        }
        // send 'unregistering' event
        const ev = Sequencer_module._new_fluid_event();
        Sequencer_module._fluid_event_set_source(ev, -1);
        Sequencer_module._fluid_event_set_dest(ev, clientId);
        Sequencer_module._fluid_event_unregistering(ev);
        Sequencer_module._fluid_sequencer_send_now(this._seq, ev);
        Sequencer_module._delete_fluid_event(ev);
        Sequencer_module._fluid_sequencer_unregister_client(this._seq, clientId);
        if (this._seqId === clientId) {
            this._seqId = -1;
        }
        else {
            const map = this._clientFuncMap;
            if (map[clientId]) {
                _removeFunction(map[clientId]);
                delete map[clientId];
            }
        }
    }
    getAllRegisteredClients() {
        const c = Sequencer_module._fluid_sequencer_count_clients(this._seq);
        const r = [];
        for (let i = 0; i < c; ++i) {
            const id = Sequencer_module._fluid_sequencer_get_client_id(this._seq, i);
            const name = fluid_sequencer_get_client_name(this._seq, id);
            r.push({ clientId: id, name: name });
        }
        return Promise.resolve(r);
    }
    getClientCount() {
        return Promise.resolve(Sequencer_module._fluid_sequencer_count_clients(this._seq));
    }
    getClientInfo(index) {
        const id = Sequencer_module._fluid_sequencer_get_client_id(this._seq, index);
        const name = fluid_sequencer_get_client_name(this._seq, id);
        return Promise.resolve({ clientId: id, name: name });
    }
    setTimeScale(scale) {
        Sequencer_module._fluid_sequencer_set_time_scale(this._seq, scale);
    }
    getTimeScale() {
        return Promise.resolve(Sequencer_module._fluid_sequencer_get_time_scale(this._seq));
    }
    getTick() {
        return Promise.resolve(Sequencer_module._fluid_sequencer_get_tick(this._seq));
    }
    sendEventAt(event, tick, isAbsolute) {
        const ev = makeEvent(event);
        if (ev !== null) {
            // send to all clients
            const count = Sequencer_module._fluid_sequencer_count_clients(this._seq);
            for (let i = 0; i < count; ++i) {
                const id = Sequencer_module._fluid_sequencer_get_client_id(this._seq, i);
                Sequencer_module._fluid_event_set_dest(ev, id);
                Sequencer_module._fluid_sequencer_send_at(this._seq, ev, tick, isAbsolute ? 1 : 0);
            }
            Sequencer_module._delete_fluid_event(ev);
        }
    }
    sendEventToClientAt(clientId, event, tick, isAbsolute) {
        const ev = makeEvent(event);
        if (ev !== null) {
            Sequencer_module._fluid_event_set_dest(ev, clientId === -1 ? this._seqId : clientId);
            Sequencer_module._fluid_sequencer_send_at(this._seq, ev, tick, isAbsolute ? 1 : 0);
            Sequencer_module._delete_fluid_event(ev);
        }
    }
    /** @internal */
    sendEventToClientNow(clientId, event) {
        const ev = makeEvent(event);
        if (ev !== null) {
            Sequencer_module._fluid_event_set_dest(ev, clientId === -1 ? this._seqId : clientId);
            Sequencer_module._fluid_sequencer_send_now(this._seq, ev);
            Sequencer_module._delete_fluid_event(ev);
        }
    }
    /** @internal */
    sendEventNow(clientId, eventData) {
        if (!(eventData instanceof SequencerEventData)) {
            return;
        }
        const ev = eventData.getRaw();
        if (ev !== INVALID_POINTER) {
            Sequencer_module._fluid_event_set_dest(ev, clientId === -1 ? this._seqId : clientId);
            Sequencer_module._fluid_sequencer_send_now(this._seq, ev);
        }
    }
    removeAllEvents() {
        Sequencer_module._fluid_sequencer_remove_events(this._seq, -1, -1, -1);
    }
    removeAllEventsFromClient(clientId) {
        Sequencer_module._fluid_sequencer_remove_events(this._seq, -1, clientId === -1 ? this._seqId : clientId, -1);
    }
    processSequencer(msecToProcess) {
        if (this._seq !== INVALID_POINTER) {
            Sequencer_module._fluid_sequencer_process(this._seq, msecToProcess);
        }
    }
    /** @internal */
    setIntervalForSequencer(msec) {
        return setInterval(() => this.processSequencer(msec), msec);
    }
}

;// CONCATENATED MODULE: ./src/main/Soundfont.ts

let Soundfont_module;
let fluid_sfont_get_name;
let fluid_preset_get_name;
function Soundfont_bindFunctions() {
    if (Soundfont_module) {
        return;
    }
    if (typeof AudioWorkletGlobalScope !== 'undefined') {
        Soundfont_module = AudioWorkletGlobalScope.wasmModule;
    }
    else {
        Soundfont_module = Module;
    }
    fluid_sfont_get_name =
        Soundfont_module.cwrap('fluid_sfont_get_name', 'string', ['number']);
    fluid_preset_get_name =
        Soundfont_module.cwrap('fluid_preset_get_name', 'string', ['number']);
}
class Soundfont {
    // @internal
    constructor(sfontPtr) {
        this._ptr = sfontPtr;
    }
    static getSoundfontById(synth, id) {
        Soundfont_bindFunctions();
        const sfont = Soundfont_module._fluid_synth_get_sfont_by_id(synth.getRawSynthesizer(), id);
        if (sfont === INVALID_POINTER) {
            return null;
        }
        return new Soundfont(sfont);
    }
    getName() {
        return fluid_sfont_get_name(this._ptr);
    }
    getPreset(bank, presetNum) {
        const presetPtr = Soundfont_module._fluid_sfont_get_preset(this._ptr, bank, presetNum);
        if (presetPtr === INVALID_POINTER) {
            return null;
        }
        const name = fluid_preset_get_name(presetPtr);
        const bankNum = Soundfont_module._fluid_preset_get_banknum(presetPtr);
        const num = Soundfont_module._fluid_preset_get_num(presetPtr);
        return {
            soundfont: this,
            name,
            bankNum,
            num
        };
    }
    getPresetIterable() {
        const reset = () => {
            Soundfont_module._fluid_sfont_iteration_start(this._ptr);
        };
        const next = () => {
            const presetPtr = Soundfont_module._fluid_sfont_iteration_next(this._ptr);
            if (presetPtr === 0) {
                return {
                    done: true,
                    value: undefined
                };
            }
            else {
                const name = fluid_preset_get_name(presetPtr);
                const bankNum = Soundfont_module._fluid_preset_get_banknum(presetPtr);
                const num = Soundfont_module._fluid_preset_get_num(presetPtr);
                return {
                    done: false,
                    value: {
                        soundfont: this,
                        name,
                        bankNum,
                        num
                    }
                };
            }
        };
        const iterator = () => {
            reset();
            return {
                next,
            };
        };
        return {
            [Symbol.iterator]: iterator,
        };
    }
}

;// CONCATENATED MODULE: ./src/main/Synthesizer.ts





let Synthesizer_module;
let _addFunction;
let Synthesizer_removeFunction;
let _fs;
// wrapper to use String type
let fluid_settings_setint;
let fluid_settings_setnum;
let fluid_settings_setstr;
let fluid_synth_error;
let fluid_synth_sfload;
let fluid_sequencer_register_client;
let malloc;
let free;
let defaultMIDIEventCallback;
function Synthesizer_bindFunctions() {
    if (fluid_synth_error) {
        // (already bound)
        return;
    }
    if (typeof AudioWorkletGlobalScope !== 'undefined') {
        Synthesizer_module = AudioWorkletGlobalScope.wasmModule;
        _addFunction = AudioWorkletGlobalScope.wasmAddFunction;
        Synthesizer_removeFunction = AudioWorkletGlobalScope.wasmRemoveFunction;
    }
    else {
        Synthesizer_module = Module;
        _addFunction = addFunction;
        Synthesizer_removeFunction = removeFunction;
    }
    _fs = Synthesizer_module.FS;
    // wrapper to use String type
    fluid_settings_setint =
        Synthesizer_module.cwrap('fluid_settings_setint', 'number', ['number', 'string', 'number']);
    fluid_settings_setnum =
        Synthesizer_module.cwrap('fluid_settings_setnum', 'number', ['number', 'string', 'number']);
    fluid_settings_setstr =
        Synthesizer_module.cwrap('fluid_settings_setstr', 'number', ['number', 'string', 'string']);
    fluid_synth_error =
        Synthesizer_module.cwrap('fluid_synth_error', 'string', ['number']);
    fluid_synth_sfload =
        Synthesizer_module.cwrap('fluid_synth_sfload', 'number', ['number', 'string', 'number']);
    fluid_sequencer_register_client =
        Synthesizer_module.cwrap('fluid_sequencer_register_client', 'number', ['number', 'string', 'number', 'number']);
    malloc = Synthesizer_module._malloc.bind(Synthesizer_module);
    free = Synthesizer_module._free.bind(Synthesizer_module);
    defaultMIDIEventCallback = Synthesizer_module._fluid_synth_handle_midi_event.bind(Synthesizer_module);
}
let promiseWaitForInitialized;
function waitForInitialized() {
    if (promiseWaitForInitialized) {
        return promiseWaitForInitialized;
    }
    let mod;
    let addOnPostRunFn;
    if (typeof AudioWorkletGlobalScope !== 'undefined') {
        mod = AudioWorkletGlobalScope.wasmModule;
        addOnPostRunFn = AudioWorkletGlobalScope.addOnPostRun;
    }
    else {
        mod = Module;
        addOnPostRunFn = typeof addOnPostRun !== 'undefined' ? addOnPostRun : undefined;
    }
    if (mod.calledRun) {
        promiseWaitForInitialized = Promise.resolve();
        return promiseWaitForInitialized;
    }
    if (typeof addOnPostRunFn === 'undefined') {
        promiseWaitForInitialized = new Promise((resolve) => {
            const fn = Synthesizer_module.onRuntimeInitialized;
            Synthesizer_module.onRuntimeInitialized = () => {
                resolve();
                if (fn) {
                    fn();
                }
            };
        });
    }
    else {
        promiseWaitForInitialized = new Promise((resolve) => {
            addOnPostRunFn(resolve);
        });
    }
    return promiseWaitForInitialized;
}
function setBoolValueForSettings(settings, name, value) {
    if (typeof value !== 'undefined') {
        fluid_settings_setint(settings, name, value ? 1 : 0);
    }
}
function setIntValueForSettings(settings, name, value) {
    if (typeof value !== 'undefined') {
        fluid_settings_setint(settings, name, value);
    }
}
function setNumValueForSettings(settings, name, value) {
    if (typeof value !== 'undefined') {
        fluid_settings_setnum(settings, name, value);
    }
}
function setStrValueForSettings(settings, name, value) {
    if (typeof value !== 'undefined') {
        fluid_settings_setstr(settings, name, value);
    }
}
function getActiveVoiceCount(synth) {
    const actualCount = Synthesizer_module._fluid_synth_get_active_voice_count(synth);
    if (!actualCount) {
        return 0;
    }
    // FluidSynth may return incorrect value for active voice count,
    // so check internal data and correct it
    // check if the structure is not changed
    // for fluidsynth 2.0.x-2.1.x:
    //   140 === offset [synth->voice]
    //   144 === offset [synth->active_voice_count] for 
    // for fluidsynth 2.2.x:
    //   144 === offset [synth->voice]
    //   148 === offset [synth->active_voice_count]
    // first check 2.1.x structure
    let baseOffsetOfVoice = 140;
    let offsetOfActiveVoiceCount = (synth + baseOffsetOfVoice + 4) >> 2;
    let structActiveVoiceCount = Synthesizer_module.HEAPU32[offsetOfActiveVoiceCount];
    if (structActiveVoiceCount !== actualCount) {
        // add 4 for 2.2.x
        baseOffsetOfVoice += 4;
        offsetOfActiveVoiceCount = (synth + baseOffsetOfVoice + 4) >> 2;
        structActiveVoiceCount = Synthesizer_module.HEAPU32[offsetOfActiveVoiceCount];
        if (structActiveVoiceCount !== actualCount) {
            // unknown structure
            const c = console;
            c.warn('js-synthesizer: cannot check synthesizer internal data (may be changed)');
            return actualCount;
        }
    }
    const voiceList = Synthesizer_module.HEAPU32[(synth + baseOffsetOfVoice) >> 2];
    // (voice should not be NULL)
    if (!voiceList || voiceList >= Synthesizer_module.HEAPU32.byteLength) {
        // unknown structure
        const c = console;
        c.warn('js-synthesizer: cannot check synthesizer internal data (may be changed)');
        return actualCount;
    }
    // count of internal voice data is restricted to polyphony value
    const voiceCount = Synthesizer_module._fluid_synth_get_polyphony(synth);
    let isRunning = false;
    for (let i = 0; i < voiceCount; ++i) {
        // auto voice = voiceList[i]
        const voice = Synthesizer_module.HEAPU32[(voiceList >> 2) + i];
        if (!voice) {
            continue;
        }
        // offset [voice->status]
        const status = Synthesizer_module.HEAPU8[voice + 4];
        // 4: FLUID_VOICE_OFF
        if (status !== 4) {
            isRunning = true;
            break;
        }
    }
    if (!isRunning) {
        if (structActiveVoiceCount !== 0) {
            const c = console;
            c.warn('js-synthesizer: Active voice count is not zero, but all voices are off:', structActiveVoiceCount);
        }
        Synthesizer_module.HEAPU32[offsetOfActiveVoiceCount] = 0;
        return 0;
    }
    return actualCount;
}
function makeRandomFileName(type, ext) {
    return `/${type}-r${Math.random() * 65535}-${Math.random() * 65535}${ext}`;
}
function makeMIDIEventCallback(synth, cb, param) {
    return (data, event) => {
        const t = Synthesizer_module._fluid_midi_event_get_type(event);
        if (cb(synth, t, new MIDIEvent(event, Synthesizer_module), param)) {
            return 0;
        }
        return Synthesizer_module._fluid_synth_handle_midi_event(data, event);
    };
}
/** Default implementation of ISynthesizer */
class Synthesizer {
    constructor() {
        Synthesizer_bindFunctions();
        this._settings = INVALID_POINTER;
        this._synth = INVALID_POINTER;
        this._player = INVALID_POINTER;
        this._playerPlaying = false;
        this._playerCallbackPtr = null;
        this._fluidSynthCallback = null;
        this._buffer = INVALID_POINTER;
        this._bufferSize = 0;
        this._numPtr = INVALID_POINTER;
        this._gain = 0.5 /* Gain */;
    }
    /** Return the promise object that resolves when WebAssembly has been initialized */
    static waitForWasmInitialized() {
        return waitForInitialized();
    }
    isInitialized() {
        return this._synth !== INVALID_POINTER;
    }
    /** Return the raw synthesizer instance value (pointer for libfluidsynth). */
    getRawSynthesizer() {
        return this._synth;
    }
    createAudioNode(context, frameSize) {
        const node = context.createScriptProcessor(frameSize, 0, 2);
        node.addEventListener('audioprocess', (ev) => {
            this.render(ev.outputBuffer);
        });
        return node;
    }
    init(sampleRate, settings) {
        this.close();
        const set = this._settings = Synthesizer_module._new_fluid_settings();
        fluid_settings_setnum(set, 'synth.sample-rate', sampleRate);
        if (settings) {
            if (typeof settings.initialGain !== 'undefined') {
                this._gain = settings.initialGain;
            }
            setBoolValueForSettings(set, 'synth.chorus.active', settings.chorusActive);
            setNumValueForSettings(set, 'synth.chorus.depth', settings.chorusDepth);
            setNumValueForSettings(set, 'synth.chorus.level', settings.chorusLevel);
            setIntValueForSettings(set, 'synth.chorus.nr', settings.chorusNr);
            setNumValueForSettings(set, 'synth.chorus.speed', settings.chorusSpeed);
            setIntValueForSettings(set, 'synth.midi-channels', settings.midiChannelCount);
            setStrValueForSettings(set, 'synth.midi-bank-select', settings.midiBankSelect);
            setIntValueForSettings(set, 'synth.min-note-length', settings.minNoteLength);
            setNumValueForSettings(set, 'synth.overflow.age', settings.overflowAge);
            setNumValueForSettings(set, 'synth.overflow.important', settings.overflowImportantValue);
            if (typeof settings.overflowImportantChannels !== 'undefined') {
                fluid_settings_setstr(set, 'synth.overflow.important-channels', settings.overflowImportantChannels.join(','));
            }
            setNumValueForSettings(set, 'synth.overflow.percussion', settings.overflowPercussion);
            setNumValueForSettings(set, 'synth.overflow.released', settings.overflowReleased);
            setNumValueForSettings(set, 'synth.overflow.sustained', settings.overflowSustained);
            setNumValueForSettings(set, 'synth.overflow.volume', settings.overflowVolume);
            setIntValueForSettings(set, 'synth.polyphony', settings.polyphony);
            setBoolValueForSettings(set, 'synth.reverb.active', settings.reverbActive);
            setNumValueForSettings(set, 'synth.reverb.damp', settings.reverbDamp);
            setNumValueForSettings(set, 'synth.reverb.level', settings.reverbLevel);
            setNumValueForSettings(set, 'synth.reverb.room-size', settings.reverbRoomSize);
            setNumValueForSettings(set, 'synth.reverb.width', settings.reverbWidth);
        }
        fluid_settings_setnum(set, 'synth.gain', this._gain);
        this._synth = Synthesizer_module._new_fluid_synth(this._settings);
        this._numPtr = malloc(8);
    }
    close() {
        if (this._synth === INVALID_POINTER) {
            return;
        }
        this._closePlayer();
        Synthesizer_module._delete_fluid_synth(this._synth);
        this._synth = INVALID_POINTER;
        Synthesizer_module._delete_fluid_settings(this._settings);
        this._settings = INVALID_POINTER;
        free(this._numPtr);
        this._numPtr = INVALID_POINTER;
    }
    isPlaying() {
        return this._synth !== INVALID_POINTER &&
            getActiveVoiceCount(this._synth) > 0;
    }
    setInterpolation(value, channel) {
        this.ensureInitialized();
        if (typeof channel === 'undefined') {
            channel = -1;
        }
        Synthesizer_module._fluid_synth_set_interp_method(this._synth, channel, value);
    }
    getGain() {
        return this._gain;
    }
    setGain(gain) {
        this.ensureInitialized();
        Synthesizer_module._fluid_synth_set_gain(this._synth, gain);
        this._gain = Synthesizer_module._fluid_synth_get_gain(this._synth);
    }
    setChannelType(channel, isDrum) {
        this.ensureInitialized();
        // CHANNEL_TYPE_MELODIC = 0, CHANNEL_TYPE_DRUM = 1
        Synthesizer_module._fluid_synth_set_channel_type(this._synth, channel, isDrum ? 1 : 0);
    }
    waitForVoicesStopped() {
        return this.flushFramesAsync();
    }
    loadSFont(bin) {
        this.ensureInitialized();
        const name = makeRandomFileName('sfont', '.sf2');
        const ub = new Uint8Array(bin);
        _fs.writeFile(name, ub);
        const sfont = fluid_synth_sfload(this._synth, name, 1);
        _fs.unlink(name);
        return sfont === -1 ?
            Promise.reject(new Error(fluid_synth_error(this._synth))) :
            Promise.resolve(sfont);
    }
    unloadSFont(id) {
        this.ensureInitialized();
        this.stopPlayer();
        this.flushFramesSync();
        Synthesizer_module._fluid_synth_sfunload(this._synth, id, 1);
    }
    unloadSFontAsync(id) {
        // not throw with Promise.reject
        this.ensureInitialized();
        this.stopPlayer();
        return this.flushFramesAsync().then(() => {
            Synthesizer_module._fluid_synth_sfunload(this._synth, id, 1);
        });
    }
    /**
     * Returns the `Soundfont` instance for specified SoundFont.
     * @param sfontId loaded SoundFont id ({@link loadSFont} returns this)
     * @return `Soundfont` instance or `null` if `sfontId` is not valid or loaded
     */
    getSFontObject(sfontId) {
        return Soundfont.getSoundfontById(this, sfontId);
    }
    getSFontBankOffset(id) {
        this.ensureInitialized();
        return Promise.resolve(Synthesizer_module._fluid_synth_get_bank_offset(this._synth, id));
    }
    setSFontBankOffset(id, offset) {
        this.ensureInitialized();
        Synthesizer_module._fluid_synth_set_bank_offset(this._synth, id, offset);
    }
    render(outBuffer) {
        const frameCount = 'numberOfChannels' in outBuffer ? outBuffer.length : outBuffer[0].length;
        const channels = 'numberOfChannels' in outBuffer ? outBuffer.numberOfChannels : outBuffer.length;
        const sizePerChannel = 4 * frameCount;
        const totalSize = sizePerChannel * 2;
        if (this._bufferSize < totalSize) {
            if (this._buffer !== INVALID_POINTER) {
                free(this._buffer);
            }
            this._buffer = malloc(totalSize);
            this._bufferSize = totalSize;
        }
        const memLeft = this._buffer;
        const memRight = (this._buffer + sizePerChannel);
        this.renderRaw(memLeft, memRight, frameCount);
        const aLeft = new Float32Array(Synthesizer_module.HEAPU8.buffer, memLeft, frameCount);
        const aRight = channels >= 2 ? new Float32Array(Synthesizer_module.HEAPU8.buffer, memRight, frameCount) : null;
        if ('numberOfChannels' in outBuffer) {
            if (outBuffer.copyToChannel) {
                outBuffer.copyToChannel(aLeft, 0, 0);
                if (aRight) {
                    outBuffer.copyToChannel(aRight, 1, 0);
                }
            }
            else { // copyToChannel API not exist in Safari AudioBuffer
                const leftData = outBuffer.getChannelData(0);
                aLeft.forEach((val, i) => leftData[i] = val);
                if (aRight) {
                    const rightData = outBuffer.getChannelData(1);
                    aRight.forEach((val, i) => rightData[i] = val);
                }
            }
        }
        else {
            outBuffer[0].set(aLeft);
            if (aRight) {
                outBuffer[1].set(aRight);
            }
        }
        // check and update player status
        this.isPlayerPlaying();
    }
    midiNoteOn(chan, key, vel) {
        Synthesizer_module._fluid_synth_noteon(this._synth, chan, key, vel);
    }
    midiNoteOff(chan, key) {
        Synthesizer_module._fluid_synth_noteoff(this._synth, chan, key);
    }
    midiKeyPressure(chan, key, val) {
        Synthesizer_module._fluid_synth_key_pressure(this._synth, chan, key, val);
    }
    midiControl(chan, ctrl, val) {
        Synthesizer_module._fluid_synth_cc(this._synth, chan, ctrl, val);
    }
    midiProgramChange(chan, prognum) {
        Synthesizer_module._fluid_synth_program_change(this._synth, chan, prognum);
    }
    midiChannelPressure(chan, val) {
        Synthesizer_module._fluid_synth_channel_pressure(this._synth, chan, val);
    }
    midiPitchBend(chan, val) {
        Synthesizer_module._fluid_synth_pitch_bend(this._synth, chan, val);
    }
    midiSysEx(data) {
        const len = data.byteLength;
        const mem = malloc(len);
        Synthesizer_module.HEAPU8.set(data, mem);
        Synthesizer_module._fluid_synth_sysex(this._synth, mem, len, INVALID_POINTER, INVALID_POINTER, INVALID_POINTER, 0);
        free(mem);
    }
    midiPitchWheelSensitivity(chan, val) {
        Synthesizer_module._fluid_synth_pitch_wheel_sens(this._synth, chan, val);
    }
    midiBankSelect(chan, bank) {
        Synthesizer_module._fluid_synth_bank_select(this._synth, chan, bank);
    }
    midiSFontSelect(chan, sfontId) {
        Synthesizer_module._fluid_synth_sfont_select(this._synth, chan, sfontId);
    }
    midiProgramSelect(chan, sfontId, bank, presetNum) {
        Synthesizer_module._fluid_synth_program_select(this._synth, chan, sfontId, bank, presetNum);
    }
    midiUnsetProgram(chan) {
        Synthesizer_module._fluid_synth_unset_program(this._synth, chan);
    }
    midiProgramReset() {
        Synthesizer_module._fluid_synth_program_reset(this._synth);
    }
    midiSystemReset() {
        Synthesizer_module._fluid_synth_system_reset(this._synth);
    }
    midiAllNotesOff(chan) {
        Synthesizer_module._fluid_synth_all_notes_off(this._synth, typeof chan === 'undefined' ? -1 : chan);
    }
    midiAllSoundsOff(chan) {
        Synthesizer_module._fluid_synth_all_sounds_off(this._synth, typeof chan === 'undefined' ? -1 : chan);
    }
    midiSetChannelType(chan, isDrum) {
        // CHANNEL_TYPE_MELODIC = 0
        // CHANNEL_TYPE_DRUM = 1
        Synthesizer_module._fluid_synth_set_channel_type(this._synth, chan, isDrum ? 1 : 0);
    }
    /**
     * Set reverb parameters to the synthesizer.
     */
    setReverb(roomsize, damping, width, level) {
        Synthesizer_module._fluid_synth_set_reverb(this._synth, roomsize, damping, width, level);
    }
    /**
     * Set reverb roomsize parameter to the synthesizer.
     */
    setReverbRoomsize(roomsize) {
        Synthesizer_module._fluid_synth_set_reverb_roomsize(this._synth, roomsize);
    }
    /**
     * Set reverb damping parameter to the synthesizer.
     */
    setReverbDamp(damping) {
        Synthesizer_module._fluid_synth_set_reverb_damp(this._synth, damping);
    }
    /**
     * Set reverb width parameter to the synthesizer.
     */
    setReverbWidth(width) {
        Synthesizer_module._fluid_synth_set_reverb_width(this._synth, width);
    }
    /**
     * Set reverb level to the synthesizer.
     */
    setReverbLevel(level) {
        Synthesizer_module._fluid_synth_set_reverb_level(this._synth, level);
    }
    /**
     * Enable or disable reverb effect of the synthesizer.
     */
    setReverbOn(on) {
        Synthesizer_module._fluid_synth_set_reverb_on(this._synth, on ? 1 : 0);
    }
    /**
     * Get reverb roomsize parameter of the synthesizer.
     */
    getReverbRoomsize() {
        return Synthesizer_module._fluid_synth_get_reverb_roomsize(this._synth);
    }
    /**
     * Get reverb damping parameter of the synthesizer.
     */
    getReverbDamp() {
        return Synthesizer_module._fluid_synth_get_reverb_damp(this._synth);
    }
    /**
     * Get reverb level of the synthesizer.
     */
    getReverbLevel() {
        return Synthesizer_module._fluid_synth_get_reverb_level(this._synth);
    }
    /**
     * Get reverb width parameter of the synthesizer.
     */
    getReverbWidth() {
        return Synthesizer_module._fluid_synth_get_reverb_width(this._synth);
    }
    /**
     * Set chorus parameters to the synthesizer.
     */
    setChorus(voiceCount, level, speed, depthMillisec, type) {
        Synthesizer_module._fluid_synth_set_chorus(this._synth, voiceCount, level, speed, depthMillisec, type);
    }
    /**
     * Set chorus voice count parameter to the synthesizer.
     */
    setChorusVoiceCount(voiceCount) {
        Synthesizer_module._fluid_synth_set_chorus_nr(this._synth, voiceCount);
    }
    /**
     * Set chorus level parameter to the synthesizer.
     */
    setChorusLevel(level) {
        Synthesizer_module._fluid_synth_set_chorus_level(this._synth, level);
    }
    /**
     * Set chorus speed parameter to the synthesizer.
     */
    setChorusSpeed(speed) {
        Synthesizer_module._fluid_synth_set_chorus_speed(this._synth, speed);
    }
    /**
     * Set chorus depth parameter to the synthesizer.
     */
    setChorusDepth(depthMillisec) {
        Synthesizer_module._fluid_synth_set_chorus_depth(this._synth, depthMillisec);
    }
    /**
     * Set chorus modulation type to the synthesizer.
     */
    setChorusType(type) {
        Synthesizer_module._fluid_synth_set_chorus_type(this._synth, type);
    }
    /**
     * Enable or disable chorus effect of the synthesizer.
     */
    setChorusOn(on) {
        Synthesizer_module._fluid_synth_set_chorus_on(this._synth, on ? 1 : 0);
    }
    /**
     * Get chorus voice count of the synthesizer.
     */
    getChorusVoiceCount() {
        return Synthesizer_module._fluid_synth_get_chorus_nr(this._synth);
    }
    /**
     * Get chorus level of the synthesizer.
     */
    getChorusLevel() {
        return Synthesizer_module._fluid_synth_get_chorus_level(this._synth);
    }
    /**
     * Get chorus speed of the synthesizer.
     */
    getChorusSpeed() {
        return Synthesizer_module._fluid_synth_get_chorus_speed(this._synth);
    }
    /**
     * Get chorus depth (in milliseconds) of the synthesizer.
     */
    getChorusDepth() {
        return Synthesizer_module._fluid_synth_get_chorus_depth(this._synth);
    }
    /**
     * Get chorus modulation type of the synthesizer.
     */
    getChorusType() {
        return Synthesizer_module._fluid_synth_get_chorus_type(this._synth);
    }
    /**
     * Get generator value assigned to the MIDI channel.
     * @param channel MIDI channel number
     * @param param generator ID
     * @return a value related to the generator
     */
    getGenerator(channel, param) {
        return Synthesizer_module._fluid_synth_get_gen(this._synth, channel, param);
    }
    /**
     * Set generator value assigned to the MIDI channel.
     * @param channel MIDI channel number
     * @param param generator ID
     * @param value a value related to the generator
     */
    setGenerator(channel, param, value) {
        Synthesizer_module._fluid_synth_set_gen(this._synth, channel, param, value);
    }
    /**
     * Return the current legato mode of the channel.
     * @param channel MIDI channel number
     * @return legato mode
     */
    getLegatoMode(channel) {
        Synthesizer_module._fluid_synth_get_legato_mode(this._synth, channel, this._numPtr);
        return Synthesizer_module.HEAP32[this._numPtr >> 2];
    }
    /**
     * Set the current legato mode of the channel.
     * @param channel MIDI channel number
     * @param mode legato mode
     */
    setLegatoMode(channel, mode) {
        Synthesizer_module._fluid_synth_set_legato_mode(this._synth, channel, mode);
    }
    /**
     * Return the current portamento mode of the channel.
     * @param channel MIDI channel number
     * @return portamento mode
     */
    getPortamentoMode(channel) {
        Synthesizer_module._fluid_synth_get_portamento_mode(this._synth, channel, this._numPtr);
        return Synthesizer_module.HEAP32[this._numPtr >> 2];
    }
    /**
     * Set the current portamento mode of the channel.
     * @param channel MIDI channel number
     * @param mode portamento mode
     */
    setPortamentoMode(channel, mode) {
        Synthesizer_module._fluid_synth_set_portamento_mode(this._synth, channel, mode);
    }
    /**
     * Return the current breath mode of the channel.
     * @param channel MIDI channel number
     * @return breath mode (BreathFlags)
     */
    getBreathMode(channel) {
        Synthesizer_module._fluid_synth_get_breath_mode(this._synth, channel, this._numPtr);
        return Synthesizer_module.HEAP32[this._numPtr >> 2];
    }
    /**
     * Set the current breath mode of the channel.
     * @param channel MIDI channel number
     * @param flags breath mode flags (BreathFlags)
     */
    setBreathMode(channel, flags) {
        Synthesizer_module._fluid_synth_set_breath_mode(this._synth, channel, flags);
    }
    ////////////////////////////////////////////////////////////////////////////
    resetPlayer() {
        return new Promise((resolve) => {
            this._initPlayer();
            resolve();
        });
    }
    closePlayer() {
        this._closePlayer();
    }
    /** @internal */
    _initPlayer() {
        this._closePlayer();
        const player = Synthesizer_module._new_fluid_player(this._synth);
        this._player = player;
        if (player !== INVALID_POINTER) {
            if (this._fluidSynthCallback === null) {
                // hacky retrieve 'fluid_synth_handle_midi_event' callback pointer
                // * 'playback_callback' is filled with 'fluid_synth_handle_midi_event' by default.
                // * 'playback_userdata' is filled with the synthesizer pointer by default
                const funcPtr = Synthesizer_module.HEAPU32[(player + 588) >> 2]; // _fluid_player_t::playback_callback
                const synthPtr = Synthesizer_module.HEAPU32[(player + 592) >> 2]; // _fluid_player_t::playback_userdata
                if (synthPtr === this._synth) {
                    this._fluidSynthCallback = funcPtr;
                }
            }
        }
        else {
            throw new Error('Out of memory');
        }
    }
    /** @internal */
    _closePlayer() {
        const p = this._player;
        if (p === INVALID_POINTER) {
            return;
        }
        this.stopPlayer();
        Synthesizer_module._delete_fluid_player(p);
        this._player = INVALID_POINTER;
        this._playerCallbackPtr = null;
    }
    isPlayerPlaying() {
        if (this._playerPlaying) {
            const status = Synthesizer_module._fluid_player_get_status(this._player);
            if (status === 1 /*FLUID_PLAYER_PLAYING*/) {
                return true;
            }
            this.stopPlayer();
        }
        return false;
    }
    addSMFDataToPlayer(bin) {
        this.ensurePlayerInitialized();
        const len = bin.byteLength;
        const mem = malloc(len);
        Synthesizer_module.HEAPU8.set(new Uint8Array(bin), mem);
        const r = Synthesizer_module._fluid_player_add_mem(this._player, mem, len);
        free(mem);
        return r !== -1 ? Promise.resolve() : Promise.reject(new Error(fluid_synth_error(this._synth)));
    }
    playPlayer() {
        this.ensurePlayerInitialized();
        if (this._playerPlaying) {
            this.stopPlayer();
        }
        if (Synthesizer_module._fluid_player_play(this._player) === -1) {
            return Promise.reject(new Error(fluid_synth_error(this._synth)));
        }
        this._playerPlaying = true;
        let resolver = () => { };
        const p = new Promise((resolve) => {
            resolver = resolve;
        });
        this._playerDefer = {
            promise: p,
            resolve: resolver
        };
        return Promise.resolve();
    }
    stopPlayer() {
        const p = this._player;
        if (p === INVALID_POINTER || !this._playerPlaying) {
            return;
        }
        Synthesizer_module._fluid_player_stop(p);
        Synthesizer_module._fluid_player_join(p);
        Synthesizer_module._fluid_synth_all_sounds_off(this._synth, -1);
        if (this._playerDefer) {
            this._playerDefer.resolve();
            this._playerDefer = void (0);
        }
        this._playerPlaying = false;
    }
    retrievePlayerCurrentTick() {
        this.ensurePlayerInitialized();
        return Promise.resolve(Synthesizer_module._fluid_player_get_current_tick(this._player));
    }
    retrievePlayerTotalTicks() {
        this.ensurePlayerInitialized();
        return Promise.resolve(Synthesizer_module._fluid_player_get_total_ticks(this._player));
    }
    retrievePlayerBpm() {
        this.ensurePlayerInitialized();
        return Promise.resolve(Synthesizer_module._fluid_player_get_bpm(this._player));
    }
    retrievePlayerMIDITempo() {
        this.ensurePlayerInitialized();
        return Promise.resolve(Synthesizer_module._fluid_player_get_midi_tempo(this._player));
    }
    seekPlayer(ticks) {
        this.ensurePlayerInitialized();
        Synthesizer_module._fluid_player_seek(this._player, ticks);
    }
    /**
     * Hooks MIDI events sent by the player.
     * initPlayer() must be called before calling this method.
     * @param callback hook callback function, or null to unhook
     * @param param any additional data passed to the callback
     */
    hookPlayerMIDIEvents(callback, param) {
        this.ensurePlayerInitialized();
        const oldPtr = this._playerCallbackPtr;
        if (oldPtr === null && callback === null) {
            return;
        }
        const newPtr = (
        // if callback is specified, add function
        callback !== null ? _addFunction(makeMIDIEventCallback(this, callback, param), 'iii') : (
        // if _fluidSynthCallback is filled, set null to use it for reset callback
        // if not, add function defaultMIDIEventCallback for reset
        this._fluidSynthCallback !== null ? null : _addFunction(defaultMIDIEventCallback, 'iii')));
        // the third parameter of 'fluid_player_set_playback_callback' should be 'fluid_synth_t*'
        if (oldPtr !== null && newPtr !== null) {
            // (using defaultMIDIEventCallback also comes here)
            Synthesizer_module._fluid_player_set_playback_callback(this._player, newPtr, this._synth);
            Synthesizer_removeFunction(oldPtr);
        }
        else {
            if (newPtr === null) {
                // newPtr === null --> use _fluidSynthCallback
                Synthesizer_module._fluid_player_set_playback_callback(this._player, this._fluidSynthCallback, this._synth);
                Synthesizer_removeFunction(oldPtr);
            }
            else {
                Synthesizer_module._fluid_player_set_playback_callback(this._player, newPtr, this._synth);
            }
        }
        this._playerCallbackPtr = newPtr;
    }
    /** @internal */
    ensureInitialized() {
        if (this._synth === INVALID_POINTER) {
            throw new Error('Synthesizer is not initialized');
        }
    }
    /** @internal */
    ensurePlayerInitialized() {
        this.ensureInitialized();
        if (this._player === INVALID_POINTER) {
            this._initPlayer();
        }
    }
    /** @internal */
    renderRaw(memLeft, memRight, frameCount) {
        Synthesizer_module._fluid_synth_write_float(this._synth, frameCount, memLeft, 0, 1, memRight, 0, 1);
    }
    /** @internal */
    flushFramesSync() {
        const frameCount = 65536;
        const size = 4 * frameCount;
        const mem = malloc(size * 2);
        const memLeft = mem;
        const memRight = (mem + size);
        while (this.isPlaying()) {
            this.renderRaw(memLeft, memRight, frameCount);
        }
        free(mem);
    }
    /** @internal */
    flushFramesAsync() {
        if (!this.isPlaying()) {
            return Promise.resolve();
        }
        const frameCount = 65536;
        const size = 4 * frameCount;
        const mem = malloc(size * 2);
        const memLeft = mem;
        const memRight = (mem + size);
        const nextFrame = (typeof setTimeout !== 'undefined' ?
            () => {
                return new Promise((resolve) => setTimeout(resolve, 0));
            } :
            () => {
                return Promise.resolve();
            });
        function head() {
            return nextFrame().then(tail);
        }
        const self = this;
        function tail() {
            if (!self.isPlaying()) {
                free(mem);
                return Promise.resolve();
            }
            self.renderRaw(memLeft, memRight, frameCount);
            return head();
        }
        return head();
    }
    waitForPlayerStopped() {
        return this._playerDefer ? this._playerDefer.promise : Promise.resolve();
    }
    /**
     * Create the sequencer object for this class.
     */
    static createSequencer() {
        Synthesizer_bindFunctions();
        const seq = new Sequencer();
        return seq._initialize().then(() => seq);
    }
    /**
     * Registers the user-defined client to the sequencer.
     * The client can receive events in the time from sequencer process.
     * @param seq the sequencer instance created by Synthesizer.createSequencer
     * @param name the client name
     * @param callback the client callback function that processes event data
     * @param param additional parameter passed to the callback
     * @return registered sequencer client id (can be passed to seq.unregisterClient())
     */
    static registerSequencerClient(seq, name, callback, param) {
        if (!(seq instanceof Sequencer)) {
            throw new TypeError('Invalid sequencer instance');
        }
        const ptr = _addFunction((time, ev, _seq, data) => {
            const e = new SequencerEventData(ev, Synthesizer_module);
            const type = Synthesizer_module._fluid_event_get_type(ev);
            callback(time, type, e, seq, data);
        }, 'viiii');
        const r = fluid_sequencer_register_client(seq.getRaw(), name, ptr, param);
        if (r !== -1) {
            seq._clientFuncMap[r] = ptr;
        }
        return r;
    }
    /**
     * Send sequencer event immediately to the specific client.
     * @param seq the sequencer instance created by Synthesizer.createSequencer
     * @param clientId registered client id (-1 for registered synthesizer)
     * @param event event data
     */
    static sendEventToClientNow(seq, clientId, event) {
        if (!(seq instanceof Sequencer)) {
            throw new TypeError('Invalid sequencer instance');
        }
        seq.sendEventToClientNow(clientId, event);
    }
    /**
     * (Re-)send event data immediately.
     * @param seq the sequencer instance created by Synthesizer.createSequencer
     * @param clientId registered client id (-1 for registered synthesizer)
     * @param eventData event data which can be retrieved in SequencerClientCallback
     */
    static sendEventNow(seq, clientId, eventData) {
        if (!(seq instanceof Sequencer)) {
            throw new TypeError('Invalid sequencer instance');
        }
        seq.sendEventNow(clientId, eventData);
    }
    /**
     * Set interval timer process to call processSequencer for this sequencer.
     * This method uses 'setInterval' global method to register timer.
     * @param seq the sequencer instance created by Synthesizer.createSequencer
     * @param msec time in milliseconds passed to both setInterval and processSequencer
     * @return return value of 'setInterval' (usually passing to 'clearInterval' will reset event)
     */
    static setIntervalForSequencer(seq, msec) {
        if (!(seq instanceof Sequencer)) {
            throw new TypeError('Invalid sequencer instance');
        }
        return seq.setIntervalForSequencer(msec);
    }
}

;// CONCATENATED MODULE: ./src/main/waitForReady.ts

/**
 * Returns the Promise object which resolves when the synthesizer engine is ready.
 */
function waitForReady() {
    return Synthesizer.waitForWasmInitialized();
}

;// CONCATENATED MODULE: ./src/main/MethodMessaging.ts

/** @internal */
function initializeCallPort(port, hookMessage) {
    const instance = {
        port: port,
        defers: {},
        deferId: 0
    };
    port.addEventListener('message', (e) => processReturnMessage(instance.defers, hookMessage, e));
    port.start();
    return instance;
}
function convertErrorTransferable(err) {
    const result = {};
    const objList = [];
    let obj = err;
    while (obj && obj !== Object.prototype) {
        objList.unshift(obj);
        obj = Object.getPrototypeOf(obj);
    }
    objList.forEach((o) => {
        Object.getOwnPropertyNames(o).forEach((key) => {
            try {
                const data = err[key];
                if (typeof data !== 'function' && typeof data !== 'symbol') {
                    result[key] = data;
                }
            }
            catch (_e) { }
        });
    });
    return {
        baseName: err.name,
        message: err.message,
        detail: result
    };
}
function convertAnyErrorTransferable(err) {
    return convertErrorTransferable((err && err instanceof Error) ? err : new Error(`${err}`));
}
function makeMessageError(error) {
    return new MessageError(error.baseName, error.message, error.detail);
}
function processReturnMessage(defers, hook, e) {
    const data = e.data;
    if (!data) {
        return;
    }
    if (hook && hook(data)) {
        return;
    }
    const defer = defers[data.id];
    if (defer) {
        delete defers[data.id];
        if (data.error) {
            defer.reject(makeMessageError(data.error));
        }
        else {
            defer.resolve(data.val);
        }
    }
    else {
        if (data.error) {
            throw makeMessageError(data.error);
        }
    }
}
/** @internal */
function postCall({ port }, method, args) {
    port.postMessage({
        id: -1, method, args
    });
}
/** @internal */
function postCallWithPromise(instance, method, args) {
    const id = instance.deferId++;
    if (instance.deferId === Infinity || instance.deferId < 0) {
        instance.deferId = 0;
    }
    const promise = new Promise((resolve, reject) => {
        instance.defers[id] = { resolve, reject };
    });
    const transfers = [];
    if (args[0] instanceof MessagePort) {
        transfers.push(args[0]);
    }
    instance.port.postMessage({
        id, method, args
    }, transfers);
    return promise;
}
/** @internal */
function initializeReturnPort(port, promiseInitialized, targetObjectHolder, hookMessage) {
    const instance = {
        port: port
    };
    if (promiseInitialized) {
        port.addEventListener('message', (e) => {
            const data = e.data;
            if (!data) {
                return;
            }
            promiseInitialized.then(() => processCallMessage(instance.port, data, targetObjectHolder, hookMessage));
        });
    }
    else {
        port.addEventListener('message', (e) => {
            const data = e.data;
            if (!data) {
                return;
            }
            processCallMessage(instance.port, data, targetObjectHolder, hookMessage);
        });
    }
    port.start();
    return instance;
}
function processCallMessage(port, data, targetObjectHolder, hook) {
    if (hook && hook(data)) {
        return;
    }
    const target = targetObjectHolder();
    if (!target[data.method]) {
        postReturnErrorImpl(port, data.id, data.method, new Error('Not implemented'));
    }
    else {
        try {
            postReturnImpl(port, data.id, data.method, target[data.method].apply(target, data.args));
        }
        catch (e) {
            postReturnErrorImpl(port, data.id, data.method, e);
        }
    }
}
/** @internal */
function postReturn(instance, id, method, value) {
    postReturnImpl(instance.port, id, method, value);
}
function postReturnImpl(port, id, method, value) {
    if (value instanceof Promise) {
        value.then((v) => {
            if (id >= 0) {
                port.postMessage({
                    id,
                    method,
                    val: v
                });
            }
        }, (error) => {
            port.postMessage({
                id,
                method,
                error: convertAnyErrorTransferable(error)
            });
        });
    }
    else {
        port.postMessage({
            id,
            method,
            val: value
        });
    }
}
/** @internal */
function postReturnError(instance, id, method, error) {
    postReturnErrorImpl(instance.port, id, method, error);
}
function postReturnErrorImpl(port, id, method, error) {
    port.postMessage({
        id,
        method,
        error: convertAnyErrorTransferable(error)
    });
}

;// CONCATENATED MODULE: ./src/main/WorkletSoundfont.ts

class WorkletSoundfont {
    // @internal
    constructor(port, name) {
        this.name = name;
        this._messaging = initializeCallPort(port);
    }
    getName() {
        return this.name;
    }
    getPreset(bank, presetNum) {
        return postCallWithPromise(this._messaging, 'getPreset', [bank, presetNum]);
    }
    getPresetIterable() {
        return postCallWithPromise(this._messaging, 'getPresetIterable', []);
    }
}

;// CONCATENATED MODULE: ./src/main/WorkletSequencer.ts


/** @internal */
class WorkletSequencer {
    constructor(port) {
        this._messaging = initializeCallPort(port);
    }
    /** @internal */
    getRaw() {
        return postCallWithPromise(this._messaging, 'getRaw', []);
    }
    /** @internal */
    registerSequencerClientByName(clientName, callbackName, param) {
        return this.getRaw().then((seqPtr) => postCallWithPromise(this._messaging, 'registerSequencerClientByName', [seqPtr, clientName, callbackName, param]));
    }
    close() {
        postCall(this._messaging, 'close', []);
    }
    registerSynthesizer(synth) {
        let val;
        if (synth instanceof AudioWorkletNodeSynthesizer) {
            val = synth._getRawSynthesizer();
        }
        else {
            return Promise.reject(new TypeError('\'synth\' is not a compatible type instance'));
        }
        return val.then((v) => postCallWithPromise(this._messaging, 'registerSynthesizer', [v]));
    }
    unregisterClient(clientId) {
        postCall(this._messaging, 'unregisterClient', [clientId]);
    }
    getAllRegisteredClients() {
        return postCallWithPromise(this._messaging, 'getAllRegisteredClients', []);
    }
    getClientCount() {
        return postCallWithPromise(this._messaging, 'getClientCount', []);
    }
    getClientInfo(index) {
        return postCallWithPromise(this._messaging, 'getClientInfo', [index]);
    }
    setTimeScale(scale) {
        postCall(this._messaging, 'setTimeScale', [scale]);
    }
    getTimeScale() {
        return postCallWithPromise(this._messaging, 'getTimeScale', []);
    }
    getTick() {
        return postCallWithPromise(this._messaging, 'getTick', []);
    }
    sendEventAt(event, tick, isAbsolute) {
        postCall(this._messaging, 'sendEventAt', [event, tick, isAbsolute]);
    }
    sendEventToClientAt(clientId, event, tick, isAbsolute) {
        postCall(this._messaging, 'sendEventToClientAt', [clientId, event, tick, isAbsolute]);
    }
    removeAllEvents() {
        postCall(this._messaging, 'removeAllEvents', []);
    }
    removeAllEventsFromClient(clientId) {
        postCall(this._messaging, 'removeAllEventsFromClient', [clientId]);
    }
    processSequencer(msecToProcess) {
        postCall(this._messaging, 'processSequencer', [msecToProcess]);
    }
}

;// CONCATENATED MODULE: ./src/main/AudioWorkletNodeSynthesizer.ts



/** An synthesizer object with AudioWorkletNode */
class AudioWorkletNodeSynthesizer {
    constructor() {
        this._status = {
            playing: false,
            playerPlaying: false
        };
        this._messaging = null;
        this._node = null;
        this._gain = 0.5 /* Gain */;
    }
    /** Audio node for this synthesizer */
    get node() {
        return this._node;
    }
    /**
     * Create AudiWorkletNode instance
     */
    createAudioNode(context, settings) {
        const node = new AudioWorkletNode(context, "fluid-js" /* ProcessorName */, {
            numberOfInputs: 0,
            numberOfOutputs: 1,
            channelCount: 2,
            outputChannelCount: [2],
            processorOptions: {
                settings: settings
            }
        });
        this._node = node;
        this._messaging = initializeCallPort(node.port, (data) => {
            if (data.method === "updateStatus" /* UpdateStatus */) {
                this._status = data.val;
                return true;
            }
            return false;
        });
        return node;
    }
    isInitialized() {
        return this._messaging !== null;
    }
    init(_sampleRate, _settings) {
    }
    close() {
        // call init instead of close
        postCall(this._messaging, 'init', [0]);
    }
    isPlaying() {
        return this._status.playing;
    }
    setInterpolation(value, channel) {
        postCall(this._messaging, 'setInterpolation', [value, channel]);
    }
    getGain() {
        return this._gain;
    }
    setGain(gain) {
        this._gain = gain;
        postCallWithPromise(this._messaging, 'setGain', [gain]).then(() => {
            return postCallWithPromise(this._messaging, 'getGain', []);
        }).then((value) => {
            this._gain = value;
        });
    }
    setChannelType(channel, isDrum) {
        postCall(this._messaging, 'setChannelType', [channel, isDrum]);
    }
    waitForVoicesStopped() {
        return postCallWithPromise(this._messaging, 'waitForVoicesStopped', []);
    }
    loadSFont(bin) {
        return postCallWithPromise(this._messaging, 'loadSFont', [bin]);
    }
    unloadSFont(id) {
        postCall(this._messaging, 'unloadSFont', [id]);
    }
    unloadSFontAsync(id) {
        return postCallWithPromise(this._messaging, 'unloadSFont', [id]);
    }
    /**
     * Returns the `Soundfont` instance for specified SoundFont.
     * @param sfontId loaded SoundFont id ({@link loadSFont} returns this)
     * @return resolve with `Soundfont` instance (rejected if `sfontId` is not valid or loaded)
     */
    getSFontObject(sfontId) {
        const channel = new MessageChannel();
        return postCallWithPromise(this._messaging, 'getSFontObject', [channel.port2, sfontId]).then((name) => {
            return new WorkletSoundfont(channel.port1, name);
        });
    }
    getSFontBankOffset(id) {
        return postCallWithPromise(this._messaging, 'getSFontBankOffset', [id]);
    }
    setSFontBankOffset(id, offset) {
        postCall(this._messaging, 'setSFontBankOffset', [id, offset]);
    }
    render() {
        throw new Error('Unexpected call');
    }
    midiNoteOn(chan, key, vel) {
        postCall(this._messaging, 'midiNoteOn', [chan, key, vel]);
    }
    midiNoteOff(chan, key) {
        postCall(this._messaging, 'midiNoteOff', [chan, key]);
    }
    midiKeyPressure(chan, key, val) {
        postCall(this._messaging, 'midiKeyPressure', [chan, key, val]);
    }
    midiControl(chan, ctrl, val) {
        postCall(this._messaging, 'midiControl', [chan, ctrl, val]);
    }
    midiProgramChange(chan, prognum) {
        postCall(this._messaging, 'midiProgramChange', [chan, prognum]);
    }
    midiChannelPressure(chan, val) {
        postCall(this._messaging, 'midiChannelPressure', [chan, val]);
    }
    midiPitchBend(chan, val) {
        postCall(this._messaging, 'midiPitchBend', [chan, val]);
    }
    midiSysEx(data) {
        postCall(this._messaging, 'midiSysEx', [data]);
    }
    midiPitchWheelSensitivity(chan, val) {
        postCall(this._messaging, 'midiPitchWheelSensitivity', [chan, val]);
    }
    midiBankSelect(chan, bank) {
        postCall(this._messaging, 'midiBankSelect', [chan, bank]);
    }
    midiSFontSelect(chan, sfontId) {
        postCall(this._messaging, 'midiSFontSelect', [chan, sfontId]);
    }
    midiProgramSelect(chan, sfontId, bank, presetNum) {
        postCall(this._messaging, 'midiProgramSelect', [chan, sfontId, bank, presetNum]);
    }
    midiUnsetProgram(chan) {
        postCall(this._messaging, 'midiUnsetProgram', [chan]);
    }
    midiProgramReset() {
        postCall(this._messaging, 'midiProgramReset', []);
    }
    midiSystemReset() {
        postCall(this._messaging, 'midiSystemReset', []);
    }
    midiAllNotesOff(chan) {
        postCall(this._messaging, 'midiAllNotesOff', [chan]);
    }
    midiAllSoundsOff(chan) {
        postCall(this._messaging, 'midiAllSoundsOff', [chan]);
    }
    midiSetChannelType(chan, isDrum) {
        postCall(this._messaging, 'midiSetChannelType', [chan, isDrum]);
    }
    resetPlayer() {
        return postCallWithPromise(this._messaging, 'resetPlayer', []);
    }
    closePlayer() {
        postCall(this._messaging, 'closePlayer', []);
    }
    isPlayerPlaying() {
        return this._status.playerPlaying;
    }
    addSMFDataToPlayer(bin) {
        return postCallWithPromise(this._messaging, 'addSMFDataToPlayer', [bin]);
    }
    playPlayer() {
        return postCallWithPromise(this._messaging, 'playPlayer', []);
    }
    stopPlayer() {
        postCall(this._messaging, 'stopPlayer', []);
    }
    retrievePlayerCurrentTick() {
        return postCallWithPromise(this._messaging, 'retrievePlayerCurrentTick', []);
    }
    retrievePlayerTotalTicks() {
        return postCallWithPromise(this._messaging, 'retrievePlayerTotalTicks', []);
    }
    retrievePlayerBpm() {
        return postCallWithPromise(this._messaging, 'retrievePlayerBpm', []);
    }
    retrievePlayerMIDITempo() {
        return postCallWithPromise(this._messaging, 'retrievePlayerMIDITempo', []);
    }
    seekPlayer(ticks) {
        postCall(this._messaging, 'seekPlayer', [ticks]);
    }
    waitForPlayerStopped() {
        return postCallWithPromise(this._messaging, 'waitForPlayerStopped', []);
    }
    /**
     * Creates a sequencer instance associated with this worklet node.
     */
    createSequencer() {
        const channel = new MessageChannel();
        return postCallWithPromise(this._messaging, 'createSequencer', [channel.port2]).then(() => {
            return new WorkletSequencer(channel.port1);
        });
    }
    /**
     * Hooks MIDI events sent by the player. The hook callback function defined on
     * AudioWorkletGlobalScope object available in the worklet is used.
     * @param callbackName hook callback function name available as 'AudioWorkletGlobalScope[callbackName]',
     *     or falsy value ('', null, or undefined) to unhook.
     *     The type of 'AudioWorkletGlobalScope[callbackName]' must be HookMIDIEventCallback.
     * @param param any additional data passed to the callback.
     *     This data must be 'Transferable' data.
     * @return Promise object that resolves when succeeded, or rejects when failed
     */
    hookPlayerMIDIEventsByName(callbackName, param) {
        return postCallWithPromise(this._messaging, 'hookPlayerMIDIEventsByName', [callbackName, param]);
    }
    /**
     * Registers the user-defined client to the sequencer.
     * The client callback function defined on AudioWorkletGlobalScope
     * object available in the worklet is used.
     * The client can receive events in the time from sequencer process.
     * @param seq the sequencer instance created by AudioWorkletNodeSynthesizer.createSequencer
     * @param clientName the client name
     * @param callbackName callback function name available as 'AudioWorkletGlobalScope[callbackName]',
     *     or falsy value ('', null, or undefined) to unhook.
     *     The type of 'AudioWorkletGlobalScope[callbackName]' must be SequencerClientCallback.
     * @param param additional parameter passed to the callback
     * @return Promise object that resolves with registered client id when succeeded, or rejects when failed
     */
    registerSequencerClientByName(seq, clientName, callbackName, param) {
        if (!(seq instanceof WorkletSequencer)) {
            return Promise.reject(new TypeError('Invalid sequencer object'));
        }
        return seq.registerSequencerClientByName(clientName, callbackName, param);
    }
    /**
     * Call a function defined in the AudioWorklet.
     *
     * The function will receive two parameters; the first parameter is a Synthesizer instance
     * (not AudioWorkletNodeSynthesizer instance), and the second is the data passed to 'param'.
     * This method is useful when the script loaded in AudioWorklet wants to
     * retrieve Synthesizer instance.
     *
     * @param name a function name (must be retrieved from AudioWorkletGlobalScope[name])
     * @param param any parameter (must be Transferable)
     * @return Promise object that resolves when the function process has done, or rejects when failed
     */
    callFunction(name, param) {
        return postCallWithPromise(this._messaging, 'callFunction', [name, param]);
    }
    /** @internal */
    _getRawSynthesizer() {
        return postCallWithPromise(this._messaging, 'getRawSynthesizer', []);
    }
}

;// CONCATENATED MODULE: ./src/main/index.ts









/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=js-synthesizer.js.map