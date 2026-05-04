/**
 * Piano Visualizer — MIDI playback with SoundFont synthesis and Canvas visualization.
 *
 * Dependencies (CDN):
 *   - @tonejs/midi  — MIDI file parsing
 *   - js-synthesizer — FluidSynth WASM for SF2 playback
 *
 * Public API:
 *   window.openPianoVisualizer(midiFilename)
 */
(function () {
  'use strict';

  // ─── State ───────────────────────────────────────────────────────────
  let midi = null;
  let synth = null;
  let audioCtx = null;
  let gainNode = null;
  let isPlaying = false;
  let isPaused = false;
  let pauseOffset = 0;
  let totalDuration = 0;
  let animFrameId = null;
  let currentSfUrl = '';
  let currentSfId = -1;
  let synthReady = false;
  let currentFilename = '';
  let midiArrayBuffer = null;
  let playbackToken = 0;

  // AudioContext-based master clock
  let audioStartCtxTime = 0;  // audioCtx.currentTime when play started
  let audioStartMidiTime = 0; // MIDI-file seconds at that moment (= fromTime)
  let startTimeFallback = 0;  // performance.now()/1000 fallback

  // Extracted MIDI data
  let allNotes = [];          // [{start, end, releaseEnd, midi, velocity, channel, track}] sorted by start
  let allCCEvents = [];       // [{time, ch, cc, value}]                         sorted by time
  let pitchBendEvents = [];   // [{time, ch, value}]                             sorted by time
  const PIANO_MIN_NOTE = 21;  // A0
  const PIANO_MAX_NOTE = 108; // C8
  let minNote = PIANO_MIN_NOTE;
  let maxNote = PIANO_MAX_NOTE;

  // Piano key layout
  let pianoKeyLayout = [];
  let whiteKeyCount  = 0;
  let canvasCssWidth = 0;
  let canvasCssHeight = 0;
  let resizeRafId = null;

  // ─── DOM refs ────────────────────────────────────────────────────────
  const modal         = document.getElementById('piano-visualizer-modal');
  const content       = document.getElementById('piano-visualizer-content');
  const canvas        = document.getElementById('pv-canvas');
  const ctx           = canvas ? canvas.getContext('2d') : null;
  const titleEl       = document.getElementById('pv-title');
  const loadingEl     = document.getElementById('pv-loading');
  const loadingText   = document.getElementById('pv-loading-text');
  const loadingBar    = document.getElementById('pv-loading-bar');
  const btnPlay       = document.getElementById('pv-play');
  const btnStop       = document.getElementById('pv-stop');
  const btnClose      = document.getElementById('pv-close');
  const timeDisplay   = document.getElementById('pv-time-display');
  const volumeSlider  = document.getElementById('pv-volume');
  const volumeIcon    = document.getElementById('pv-volume-icon');
  const seekBar       = document.getElementById('pv-seek');
  const sfSelect      = document.getElementById('pv-soundfont-select');

  if (!modal || !canvas) return;

  // ─── Helpers ─────────────────────────────────────────────────────────
  function formatTime(s) {
    if (!isFinite(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function showLoading(text, pct) {
    if (loadingEl)   loadingEl.classList.remove('hidden');
    if (loadingText) loadingText.textContent = text || 'Loading...';
    if (loadingBar)  loadingBar.style.width = (pct || 0) + '%';
  }

  function hideLoading() {
    if (loadingEl) loadingEl.classList.add('hidden');
  }

  function updateTransportUI() {
    if (btnPlay) {
      const shouldPause = isPlaying && !isPaused;
      btnPlay.classList.toggle('active', shouldPause);
      btnPlay.innerHTML = shouldPause ? '&#10074;&#10074;' : '&#9654;';
      btnPlay.title = shouldPause ? 'Pause' : 'Play';
      btnPlay.setAttribute('aria-label', shouldPause ? 'Pause' : 'Play');
    }
  }

  function isBlackKey(n) {
    const m = n % 12;
    return m === 1 || m === 3 || m === 6 || m === 8 || m === 10;
  }

  function finiteNumber(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function clamp01(value) {
    return clamp(finiteNumber(value, 0), 0, 1);
  }

  function clampMidi7(value) {
    return Math.round(clamp(finiteNumber(value, 0), 0, 127));
  }

  function cloneMidiBuffer() {
    return midiArrayBuffer ? midiArrayBuffer.slice(0) : null;
  }

  function secondsToTicks(seconds) {
    if (!midi || !midi.header || typeof midi.header.secondsToTicks !== 'function') return 0;
    return Math.max(0, midi.header.secondsToTicks(clamp(finiteNumber(seconds, 0), 0, totalDuration || 0)));
  }

  function applySustainPedalToNotes(fallbackEnd) {
    const EPS = 0.0001;
    const rangesByChannel = new Map();
    const cc64ByChannel = new Map();

    allCCEvents.forEach(ev => {
      if (ev.cc !== 64) return;
      if (!cc64ByChannel.has(ev.ch)) cc64ByChannel.set(ev.ch, []);
      cc64ByChannel.get(ev.ch).push(ev);
    });

    cc64ByChannel.forEach((events, ch) => {
      events.sort((a, b) => a.time - b.time);
      const ranges = [];
      let isDown = false;
      let downStart = 0;

      events.forEach(ev => {
        const nextDown = ev.value >= 64;
        if (nextDown && !isDown) {
          downStart = ev.time;
          isDown = true;
        } else if (!nextDown && isDown) {
          if (ev.time > downStart + EPS) ranges.push({ start: downStart, end: ev.time });
          isDown = false;
        }
      });

      if (isDown && fallbackEnd > downStart + EPS) {
        ranges.push({ start: downStart, end: fallbackEnd });
      }
      rangesByChannel.set(ch, ranges);
    });

    const notesByChannel = new Map();
    allNotes.forEach(note => {
      note.releaseEnd = note.end;
      note.sustained = false;
      if (!notesByChannel.has(note.channel)) notesByChannel.set(note.channel, []);
      notesByChannel.get(note.channel).push(note);
    });

    notesByChannel.forEach((notes, ch) => {
      const ranges = rangesByChannel.get(ch);
      if (!ranges || ranges.length === 0) return;

      notes.sort((a, b) => a.end - b.end);
      let ri = 0;
      notes.forEach(note => {
        while (ri < ranges.length && ranges[ri].end <= note.end + EPS) ri++;
        const range = ranges[ri];
        if (range && range.start <= note.end + EPS && note.end < range.end - EPS) {
          note.releaseEnd = Math.max(note.releaseEnd, range.end);
          note.sustained = true;
        }
      });
    });
  }

  // ─── Volume ──────────────────────────────────────────────────────────
  function setVolume(v) {
    if (gainNode) gainNode.gain.value = v;
    if (volumeSlider) volumeSlider.style.setProperty('--volume-pct', (v * 100) + '%');
    if (volumeIcon) volumeIcon.textContent = v === 0 ? '🔇' : v < 0.4 ? '🔉' : '🔊';
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', () => setVolume(parseFloat(volumeSlider.value)));
  }
  if (volumeIcon) {
    let prevVol = 0.8;
    volumeIcon.addEventListener('click', () => {
      if (parseFloat(volumeSlider.value) > 0) {
        prevVol = parseFloat(volumeSlider.value);
        volumeSlider.value = 0;
      } else {
        volumeSlider.value = prevVol;
      }
      setVolume(parseFloat(volumeSlider.value));
    });
  }

  // ─── SoundFont list ──────────────────────────────────────────────────
  async function loadSoundFontList() {
    try {
      const res = await fetch('/api/soundfonts');
      const data = await res.json();
      if (!sfSelect || !data.soundfonts) return;
      sfSelect.innerHTML = '';
      data.soundfonts.forEach(sf => {
        const opt = document.createElement('option');
        opt.value = sf.url;
        opt.textContent = sf.filename.replace(/\.sf2$/i, '');
        sfSelect.appendChild(opt);
      });
      if (data.soundfonts.length > 0) sfSelect.value = data.soundfonts[0].url;
    } catch (e) {
      console.error('Failed to load soundfont list:', e);
    }
  }

  if (sfSelect) {
    sfSelect.addEventListener('change', async () => {
      if (synthReady && sfSelect.value !== currentSfUrl) {
        const resumeAt = currentPlayTime();
        const shouldResume = isPlaying && !isPaused;
        const shouldStayPaused = isPaused;
        if (isPlaying) stopPlayback(false);

        await loadSoundFont(sfSelect.value);

        if (shouldResume) {
          startPlayback(resumeAt);
        } else if (shouldStayPaused) {
          pauseOffset = resumeAt;
          isPlaying = true;
          isPaused = true;
          updateTransportUI();
          renderFrame();
        }
      }
    });
  }

  // ─── Audio setup ─────────────────────────────────────────────────────
  async function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.connect(audioCtx.destination);
    setVolume(volumeSlider ? parseFloat(volumeSlider.value) : 0.8);
  }

  async function initSynth() {
    if (synth) return;
    showLoading('Init Audio Context...', 10);
    await initAudio();

    if (typeof JSSynth === 'undefined') throw new Error('js-synthesizer not loaded');

    showLoading('Waiting for JSSynth WASM...', 11);
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('WASM init timeout')), 10000));
    await Promise.race([JSSynth.waitForReady(), timeout]);

    showLoading('Creating Synth...', 12);
    synth = new JSSynth.Synthesizer();
    synth.init(audioCtx.sampleRate);

    showLoading('Creating Audio Node...', 13);
    const node = synth.createAudioNode(audioCtx, 8192);
    node.connect(gainNode);
  }

  async function loadSoundFont(url) {
    showLoading('Loading SoundFont...', 10);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('SoundFont fetch failed: ' + response.status);

      const reader = response.body.getReader();
      const contentLength = parseInt(response.headers.get('Content-Length') || '0', 10);
      let received = 0;
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (contentLength > 0) {
          const pct = Math.round((received / contentLength) * 80) + 10;
          showLoading('Loading SoundFont... ' + Math.round(received / 1048576) + ' MB', pct);
        }
      }

      const sfData = new Uint8Array(received);
      let offset = 0;
      for (const chunk of chunks) { sfData.set(chunk, offset); offset += chunk.length; }

      showLoading('Initializing synthesizer...', 92);
      if (currentSfId >= 0) {
        try { synth.unloadSFont(currentSfId); } catch(e) {}
        currentSfId = -1;
      }
      currentSfId = await synth.loadSFont(sfData.buffer);
      currentSfUrl = url;
      synthReady = true;
      showLoading('Ready', 100);
      setTimeout(hideLoading, 400);
    } catch (e) {
      console.error('SoundFont load error:', e);
      showLoading('Error loading SoundFont: ' + e.message, 0);
      synthReady = false;
    }
  }

  // ─── MIDI parsing ────────────────────────────────────────────────────
  async function loadMidi(filename) {
    showLoading('Fetching MIDI...', 5);
    if (typeof Midi === 'undefined') throw new Error('@tonejs/midi not loaded');

    const url = '/api/midi/' + encodeURIComponent(filename);
    const res = await fetch(url);
    if (!res.ok) throw new Error('MIDI fetch failed: ' + res.status);
    midiArrayBuffer = await res.arrayBuffer();
    const midiObj = new Midi(cloneMidiBuffer());

    midi = midiObj;
    totalDuration = finiteNumber(midi.duration, 0);
    showLoading('Extracting notes...', 9);

    allNotes        = [];
    allCCEvents     = [];
    pitchBendEvents = [];
    let eventEnd = totalDuration;

    midi.tracks.forEach((track, ti) => {
      // Use the track's real MIDI channel (falls back to track index if unavailable)
      const ch = (track.channel !== undefined && track.channel !== null)
        ? track.channel : ti % 16;

      // Notes — velocity stored as 0..1 by @tonejs/midi (original / 127)
      track.notes.forEach(n => {
        const start = finiteNumber(n.time, 0);
        const duration = Math.max(0, finiteNumber(n.duration, 0));
        const end = start + duration;
        eventEnd = Math.max(eventEnd, end);
        allNotes.push({
          start,
          end,
          releaseEnd: end,
          midi:     n.midi,
          velocity: clamp01(n.velocity),
          channel:  ch,
          track:    ti,
          sustained: false,
        });
      });

      // All control changes (sustain CC64, mod CC1, vol CC7, pan CC10, expr CC11, …)
      if (track.controlChanges) {
        Object.entries(track.controlChanges).forEach(([ccStr, events]) => {
          const cc = parseInt(ccStr, 10);
          events.forEach(ev => {
            const time = finiteNumber(ev.time, 0);
            eventEnd = Math.max(eventEnd, time);
            allCCEvents.push({
              time,
              ch,
              cc,
              value: clampMidi7(clamp01(ev.value) * 127),
            });
          });
        });
      }

      // Pitch bend — @tonejs/midi normalizes by /8192
      if (track.pitchBends) {
        track.pitchBends.forEach(pb => {
          const time = finiteNumber(pb.time, 0);
          eventEnd = Math.max(eventEnd, time);
          pitchBendEvents.push({
            time,
            ch,
            value: Math.round(pb.value * 8192),
          });
        });
      }
    });

    totalDuration = Math.max(totalDuration, eventEnd);
    applySustainPedalToNotes(totalDuration);

    allNotes.sort((a, b) => a.start - b.start);
    allCCEvents.sort((a, b) => a.time - b.time);
    pitchBendEvents.sort((a, b) => a.time - b.time);
    allNotes.forEach(note => { totalDuration = Math.max(totalDuration, note.releaseEnd); });

    // Always render a full 88-key piano, from A0 to C8.
    minNote = PIANO_MIN_NOTE;
    maxNote = PIANO_MAX_NOTE;

    console.log(`[PianoViz] notes=${allNotes.length} CC=${allCCEvents.length} PB=${pitchBendEvents.length} dur=${totalDuration.toFixed(1)}s`);
  }

  // ─── Piano key layout ────────────────────────────────────────────────
  function computeKeyLayout(canvasW) {
    pianoKeyLayout = [];
    whiteKeyCount  = 0;
    for (let n = minNote; n <= maxNote; n++) {
      if (!isBlackKey(n)) whiteKeyCount++;
    }
    if (whiteKeyCount === 0) whiteKeyCount = 1;

    const wkw = canvasW / whiteKeyCount;
    const bkw = wkw * 0.58;

    // First pass: white keys
    let wi = 0;
    for (let n = minNote; n <= maxNote; n++) {
      if (!isBlackKey(n)) {
        pianoKeyLayout[n] = { x: wi * wkw, width: wkw, isBlack: false };
        wi++;
      }
    }

    // Second pass: black keys centered between neighboring whites
    for (let n = minNote; n <= maxNote; n++) {
      if (!isBlackKey(n)) continue;
      let lw = n - 1; while (lw >= minNote && isBlackKey(lw)) lw--;
      let rw = n + 1; while (rw <= maxNote && isBlackKey(rw)) rw++;

      if (pianoKeyLayout[lw] && pianoKeyLayout[rw]) {
        const cx = ((pianoKeyLayout[lw].x + pianoKeyLayout[lw].width / 2) +
                    (pianoKeyLayout[rw].x + pianoKeyLayout[rw].width / 2)) / 2;
        pianoKeyLayout[n] = { x: cx - bkw / 2, width: bkw, isBlack: true };
      } else if (pianoKeyLayout[lw]) {
        pianoKeyLayout[n] = { x: pianoKeyLayout[lw].x + pianoKeyLayout[lw].width - bkw / 2, width: bkw, isBlack: true };
      } else if (pianoKeyLayout[rw]) {
        pianoKeyLayout[n] = { x: pianoKeyLayout[rw].x - bkw / 2, width: bkw, isBlack: true };
      }
    }
  }

  // ─── Master clock ────────────────────────────────────────────────────
  function currentPlayTime() {
    if (!isPlaying || isPaused) return pauseOffset;
    const t = audioCtx
      ? audioCtx.currentTime - audioStartCtxTime + audioStartMidiTime
      : performance.now() / 1000 - startTimeFallback;
    return clamp(t, 0, totalDuration || t);
  }

  // ─── Transport ───────────────────────────────────────────────────────
  function stopFluidPlayer() {
    playbackToken++;
    if (!synth) return;
    try { synth.stopPlayer(); } catch(e) {}
    try { synth.midiAllSoundsOff(-1); } catch(e) {}
  }

  async function startPlayback(fromTime) {
    if (!synthReady || !synth || !midiArrayBuffer) return;

    stopFluidPlayer();
    const token = ++playbackToken;
    pauseOffset = clamp(finiteNumber(fromTime, 0), 0, totalDuration || 0);
    isPlaying = true;
    isPaused = false;
    updateTransportUI();

    try {
      if (audioCtx && audioCtx.state === 'suspended') await audioCtx.resume();
      if (token !== playbackToken) return;

      await synth.resetPlayer();
      if (token !== playbackToken) return;

      // Let FluidSynth play the original SMF so tempo changes, velocity,
      // sustain, pitch bend, and program/bank events come from the MIDI file.
      await synth.addSMFDataToPlayer(cloneMidiBuffer());
      if (token !== playbackToken) return;

      const seekTicks = secondsToTicks(pauseOffset);
      if (seekTicks > 0) synth.seekPlayer(seekTicks);

      audioStartCtxTime = audioCtx ? audioCtx.currentTime : 0;
      audioStartMidiTime = pauseOffset;
      startTimeFallback = performance.now() / 1000 - pauseOffset;

      await synth.playPlayer();
      if (token !== playbackToken) return;

      if (typeof synth.waitForPlayerStopped === 'function') {
        synth.waitForPlayerStopped().then(() => {
          if (token === playbackToken && isPlaying && !isPaused) stopPlayback();
        });
      }

      updateTransportUI();
      startRenderLoop();
    } catch (e) {
      if (token === playbackToken) {
        console.error('Piano visualizer playback error:', e);
        isPlaying = false;
        isPaused = false;
        pauseOffset = 0;
        stopFluidPlayer();
        updateTransportUI();
        showLoading('Playback error: ' + (e.message || e), 0);
      }
    }
  }

  function pausePlayback() {
    if (!isPlaying) return;
    pauseOffset = currentPlayTime();
    isPaused = true;
    stopFluidPlayer();
    updateTransportUI();
    renderFrame();
  }

  function resumePlayback() {
    if (!isPaused) return;
    startPlayback(pauseOffset);
  }

  function stopPlayback(resetOffset = true) {
    isPlaying = false;
    isPaused = false;
    if (resetOffset) pauseOffset = 0;
    stopFluidPlayer();
    updateTransportUI();
    renderFrame();
  }

  // ─── Transport buttons ───────────────────────────────────────────────
  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      if (isPlaying && !isPaused) pausePlayback();
      else if (isPaused) resumePlayback();
      else startPlayback(0);
    });
  }
  if (btnStop)  btnStop.addEventListener('click', () => stopPlayback());

  if (seekBar) {
    seekBar.addEventListener('input', () => {
      const t = parseFloat(seekBar.value);
      if (isPlaying && !isPaused) {
        stopPlayback(false);
        startPlayback(t);
      } else {
        pauseOffset = clamp(finiteNumber(t, 0), 0, totalDuration || 0);
        renderFrame();
      }
    });
  }

  function closeModal() {
    stopPlayback();
    if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    modal.classList.add('hidden');
  }
  if (btnClose) btnClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => {
    if (modal.classList.contains('hidden')) return;
    if (e.key === 'Escape') {
      closeModal();
    }
    if (e.key === ' ') {
      e.preventDefault();
      if (isPlaying && !isPaused) pausePlayback();
      else if (isPaused) resumePlayback();
      else startPlayback(0);
    }
  });

  // ─── Canvas resize ───────────────────────────────────────────────────
  function getStageSize() {
    const stage = canvas ? canvas.parentElement : null;
    if (!stage) return { width: 0, height: 0 };
    const rect = stage.getBoundingClientRect();
    return {
      width: Math.max(0, Math.round(rect.width)),
      height: Math.max(0, Math.round(rect.height)),
    };
  }

  function resizeCanvas() {
    if (!canvas || !ctx) return false;

    const size = getStageSize();
    if (size.width <= 0 || size.height <= 0) return false;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const bitmapW = Math.max(1, Math.round(size.width * dpr));
    const bitmapH = Math.max(1, Math.round(size.height * dpr));

    if (
      canvas.width === bitmapW &&
      canvas.height === bitmapH &&
      canvasCssWidth === size.width &&
      canvasCssHeight === size.height
    ) {
      return false;
    }

    canvasCssWidth = size.width;
    canvasCssHeight = size.height;
    canvas.width = bitmapW;
    canvas.height = bitmapH;
    canvas.style.width = size.width + 'px';
    canvas.style.height = size.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    computeKeyLayout(size.width);
    return true;
  }

  function scheduleCanvasResize() {
    if (modal.classList.contains('hidden')) return;
    if (resizeRafId) cancelAnimationFrame(resizeRafId);
    resizeRafId = requestAnimationFrame(() => {
      resizeRafId = null;
      resizeCanvas();
      renderFrame();
    });
  }
  window.addEventListener('resize', scheduleCanvasResize);

  if (window.ResizeObserver && canvas.parentElement) {
    const stageResizeObserver = new ResizeObserver(scheduleCanvasResize);
    stageResizeObserver.observe(canvas.parentElement);
  }

  // ─── Render loop ─────────────────────────────────────────────────────
  const TRACK_COLORS = [
    [168, 85, 247],  // purple
    [59, 130, 246],  // blue
    [16, 185, 129],  // emerald
    [245, 158, 11],  // amber
    [239, 68, 68],   // red
    [236, 72, 153],  // pink
    [34, 211, 238],  // cyan
    [132, 204, 22],  // lime
  ];

  function startRenderLoop() {
    if (animFrameId) return;
    function frame() { animFrameId = requestAnimationFrame(frame); renderFrame(); }
    frame();
  }

  function renderFrame() {
    if (!ctx || !canvas) return;
    resizeCanvas();
    const W = canvasCssWidth;
    const H = canvasCssHeight;
    if (W <= 0 || H <= 0) return;

    const PPS          = 200;   // pixels per second (vertical scroll speed)
    const CORNER       = 3;
    const BG           = '#0a0e17';
    const PIANO_HEIGHT = Math.min(120, Math.max(60, H * 0.18));
    const BK_RATIO     = 0.63;
    const playheadY    = H - PIANO_HEIGHT;
    const noteAreaH    = playheadY;

    const t = currentPlayTime();

    // ── Clear ──
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // ── Vertical octave grid lines ──
    ctx.strokeStyle = 'rgba(75,85,99,0.2)';
    ctx.lineWidth = 0.5;
    for (let n = minNote; n <= maxNote; n++) {
      if (n % 12 === 0 && pianoKeyLayout[n]) {
        ctx.beginPath();
        ctx.moveTo(pianoKeyLayout[n].x, 0);
        ctx.lineTo(pianoKeyLayout[n].x, playheadY);
        ctx.stroke();
      }
    }

    // ── Collect active notes this frame ──
    const activeKeys = {};
    for (let i = 0; i < allNotes.length; i++) {
      const n = allNotes[i];
      if (t >= n.start && t <= n.end) {
        const col = TRACK_COLORS[n.track % TRACK_COLORS.length];
        const prev = activeKeys[n.midi];
        if (!prev || n.velocity > prev.velocity) {
          activeKeys[n.midi] = { col, velocity: n.velocity };
        }
      }
    }

    // ── Falling notes ──
    // Show the full note area ahead so notes are visible before they play
    const viewStart = t - (noteAreaH / PPS);      // past notes (just scrolled off)
    const viewEnd   = t + (noteAreaH / PPS) + 0.2; // future notes filling canvas top

    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, playheadY); ctx.clip();

    for (let i = 0; i < allNotes.length; i++) {
      const note = allNotes[i];
      // Draw the physical MIDI note only. Sustain is shown on the keyboard
      // highlight below; stretching every note rectangle creates stacked tails.
      if (note.end < viewStart || note.start > viewEnd) continue;
      const kl = pianoKeyLayout[note.midi];
      if (!kl) continue;

      const botY = playheadY - (note.start - t) * PPS;
      const topY = playheadY - (note.end   - t) * PPS;
      const nh   = Math.max(3, botY - topY);
      const nx   = kl.x + 1;
      const nw   = Math.max(2, kl.width - 2);

      const col      = TRACK_COLORS[note.track % TRACK_COLORS.length];
      const alpha    = 0.4 + note.velocity * 0.6;
      const isActive = t >= note.start && t <= note.end;

      if (isActive) { ctx.shadowColor = `rgba(${col},0.6)`; ctx.shadowBlur = 12; }
      ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${alpha})`;
      if (CORNER > 0 && nw > CORNER * 2 && nh > CORNER * 2) {
        ctx.beginPath(); ctx.roundRect(nx, topY, nw, nh, CORNER); ctx.fill();
      } else {
        ctx.fillRect(nx, topY, nw, nh);
      }
      if (isActive) {
        ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},0.9)`;
        ctx.lineWidth = 1.5;
        if (CORNER > 0 && nw > CORNER * 2 && nh > CORNER * 2) {
          ctx.beginPath(); ctx.roundRect(nx, topY, nw, nh, CORNER); ctx.stroke();
        } else {
          ctx.strokeRect(nx, topY, nw, nh);
        }
      }
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
    }
    ctx.restore();

    // ── Horizontal playhead ──
    ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 2;
    ctx.shadowColor = '#a855f7'; ctx.shadowBlur  = 8;
    ctx.beginPath(); ctx.moveTo(0, playheadY); ctx.lineTo(W, playheadY); ctx.stroke();
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;

    // ── Piano keyboard — white keys ──
    for (let n = minNote; n <= maxNote; n++) {
      const kl = pianoKeyLayout[n];
      if (!kl || kl.isBlack) continue;
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(kl.x, playheadY, kl.width, PIANO_HEIGHT);
      ctx.strokeStyle = '#b0b0b0'; ctx.lineWidth = 1;
      ctx.strokeRect(kl.x, playheadY, kl.width, PIANO_HEIGHT);
      if (activeKeys[n]) {
        const ak = activeKeys[n];
        ctx.fillStyle = `rgba(${ak.col[0]},${ak.col[1]},${ak.col[2]},${0.45 + ak.velocity * 0.45})`;
        ctx.fillRect(kl.x + 1, playheadY + 1, kl.width - 2, PIANO_HEIGHT - 2);
      }
      if (n % 12 === 0) {
        const octave = Math.floor(n / 12) - 1;
        ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillStyle = activeKeys[n] ? '#ffffff' : '#888888';
        ctx.fillText('C' + octave, kl.x + kl.width / 2, playheadY + PIANO_HEIGHT - 3);
      }
    }

    // ── Piano keyboard — black keys ──
    for (let n = minNote; n <= maxNote; n++) {
      const kl = pianoKeyLayout[n];
      if (!kl || !kl.isBlack) continue;
      const bkh = PIANO_HEIGHT * BK_RATIO;
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(kl.x, playheadY, kl.width, bkh);
      // subtle top highlight
      const g = ctx.createLinearGradient(kl.x, playheadY, kl.x, playheadY + bkh);
      g.addColorStop(0, 'rgba(80,80,80,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(kl.x, playheadY, kl.width, bkh);
      ctx.strokeStyle = '#080808'; ctx.lineWidth = 1;
      ctx.strokeRect(kl.x, playheadY, kl.width, bkh);
      if (activeKeys[n]) {
        const ak = activeKeys[n];
        ctx.fillStyle = `rgba(${ak.col[0]},${ak.col[1]},${ak.col[2]},${0.55 + ak.velocity * 0.35})`;
        ctx.fillRect(kl.x + 1, playheadY + 1, kl.width - 2, bkh - 2);
      }
    }

    // ── Update controls ──
    if (timeDisplay) timeDisplay.textContent = formatTime(t) + ' / ' + formatTime(totalDuration);
    if (seekBar) {
      seekBar.max   = totalDuration || 1;
      seekBar.value = t;
      seekBar.style.setProperty('--seek-pct', ((t / (totalDuration || 1)) * 100) + '%');
    }
    if (isPlaying && !isPaused && t >= totalDuration) stopPlayback();
  }

  // ─── Public API ──────────────────────────────────────────────────────
  window.openPianoVisualizer = async function (midiFilename) {
    if (!modal || !canvas) { console.error('Piano visualizer DOM not found'); return; }

    currentFilename = midiFilename;
    if (titleEl) titleEl.textContent = midiFilename.replace(/\.(mid|midi)$/i, '');

    stopPlayback();
    if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    allNotes = []; allCCEvents = []; pitchBendEvents = []; midiArrayBuffer = null; midi = null;
    minNote = PIANO_MIN_NOTE;
    maxNote = PIANO_MAX_NOTE;

    modal.classList.remove('hidden');
    resizeCanvas();
    showLoading('Initializing...', 0);

    try {
      if (sfSelect && !sfSelect.value) await loadSoundFontList();

      await loadMidi(midiFilename);
      resizeCanvas();

      await initSynth();

      const sf = sfSelect ? sfSelect.value : '/soundfonts/soundfont.sf2';
      if (!synthReady || sf !== currentSfUrl) await loadSoundFont(sf);
      else hideLoading();

      if (seekBar) { seekBar.max = totalDuration; seekBar.value = 0; }
      pauseOffset = 0;
      startRenderLoop(); // show notes before play is pressed
    } catch (e) {
      console.error('Piano visualizer error:', e, e.stack);
      showLoading('Error: ' + (e.message || e), 0);
    }
  };

})();
