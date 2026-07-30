// MuseScore → AudioConverter
//
// Runs on musescore.com score pages. The MIDI export is fetched here, inside
// the real browser session, so Cloudflare is already satisfied — the Flask
// server cannot do this itself. The bytes are handed to the service worker,
// which posts them to the local app.

(function () {
  'use strict';

  const BTN_ID = 'audioconverter-ms-btn';
  const FALLBACK_SUFFIX = '9654,4e';
  const IDLE_LABEL = '⬇ MIDI → AudioConverter';
  const HEALTH_INTERVAL = 3000;

  // A download in flight must survive a health-check blip
  let busy = false;
  let syncing = false;
  const BUILD_JS_RE =
    /link.+?href=["'](https:\/\/musescore\.com\/static\/public\/build\/musescore.*?(?:_es6)?\/20.+?\.js)["']/g;
  const SUFFIX_RE = /"([^"]+)"\)\.substr\(0,4\)/;

  function getScoreId() {
    const meta = document.querySelector("meta[property='al:ios:url']");
    if (meta && meta.content) {
      const m = meta.content.match(/(\d+)\s*$/);
      if (m) return Number(m[1]);
    }
    const m = location.pathname.match(/\/scores?\/(\d+)/);
    return m ? Number(m[1]) : null;
  }

  function getTitle() {
    const meta = document.querySelector("meta[property='og:title']");
    const raw = (meta && meta.content) || document.title || '';
    return raw.replace(/\s*\|\s*MuseScore\.com\s*$/i, '').trim();
  }

  function getThumbnail() {
    const meta = document.querySelector("meta[property='og:image']");
    return (meta && meta.content) || '';
  }

  // The auth token is md5(id + type + index + suffix), where the suffix is a
  // short string baked into MuseScore's own build bundle.
  async function findBuildSuffix() {
    const html = document.head.innerHTML;
    const urls = [...html.matchAll(BUILD_JS_RE)].map((m) => m[1]);
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const text = await res.text();
        const m = text.match(SUFFIX_RE);
        if (m) return m[1];
      } catch (err) {
        console.warn('AudioConverter: build bundle fetch failed', url, err);
      }
    }
    return null;
  }

  async function resolveMidiUrl(scoreId) {
    const suffixes = [];
    const buildSuffix = await findBuildSuffix();
    if (buildSuffix) suffixes.push(buildSuffix);
    suffixes.push(FALLBACK_SUFFIX);

    let lastStatus = null;
    for (const suffix of suffixes) {
      const auth = md5(`${scoreId}midi0${suffix}`).slice(0, 4);
      const res = await fetch(`/api/jmuse?id=${scoreId}&type=midi&index=0`, {
        headers: { Authorization: auth },
        credentials: 'include',
      });
      lastStatus = res.status;
      if (!res.ok) continue;
      const payload = await res.json().catch(() => null);
      const url = payload && payload.info && payload.info.url;
      if (url) return url;
    }
    throw new Error(`MuseScore rejected the MIDI request (HTTP ${lastStatus})`);
  }

  function bytesToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }

  // A dead service worker leaves sendMessage pending forever, so never wait
  // on it without a deadline.
  function sendToWorker(message, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error('No answer from the extension worker — reload it at chrome://extensions'));
      }, timeoutMs);

      let sending;
      try {
        sending = chrome.runtime.sendMessage(message);
      } catch (err) {
        clearTimeout(timer);
        settled = true;
        reject(err);
        return;
      }

      Promise.resolve(sending)
        .then((response) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(response);
        })
        .catch((err) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  function setState(btn, text, tone) {
    acSetGlassState(btn, text, tone);
  }

  async function isAppRunning() {
    try {
      const res = await sendToWorker({ action: 'ping' }, 6000);
      return !!(res && res.success && res.alive);
    } catch (err) {
      return false;
    }
  }

  function resetLater(btn, delay) {
    setTimeout(() => {
      setState(btn, IDLE_LABEL, '');
      btn.disabled = false;
      btn.title = '';
      busy = false;
      syncButton();
    }, delay);
  }

  async function importScore(btn) {
    const scoreId = getScoreId();
    if (!scoreId) {
      setState(btn, 'No score found', 'error');
      return;
    }

    btn.disabled = true;
    busy = true;
    setState(btn, 'Getting MIDI…', 'busy');

    try {
      const midiUrl = await resolveMidiUrl(scoreId);

      setState(btn, 'Downloading…', 'busy');
      const res = await fetch(midiUrl);
      if (!res.ok) throw new Error(`Download failed (HTTP ${res.status})`);
      const buffer = await res.arrayBuffer();

      const head = new Uint8Array(buffer.slice(0, 4));
      const isMidi =
        head[0] === 0x4d && head[1] === 0x54 && head[2] === 0x68 && head[3] === 0x64;
      if (!isMidi) throw new Error('MuseScore did not return a MIDI file');

      setState(btn, 'Sending to app…', 'busy');
      const title = getTitle();
      const response = await sendToWorker({
        action: 'importMidi',
        data: bytesToBase64(buffer),
        filename: (title || `musescore_${scoreId}`).slice(0, 120) + '.mid',
        title,
        sourceUrl: location.href.split('?')[0],
        thumbnailUrl: getThumbnail(),
      });

      if (!response || !response.success) {
        throw new Error((response && response.error) || 'No answer from the app');
      }

      setState(btn, '✓ Added to app', 'done');
      resetLater(btn, 4000);
    } catch (err) {
      console.error('AudioConverter:', err);
      setState(btn, '✕ ' + err.message, 'error');
      btn.title = err.message;
      resetLater(btn, 6000);
    }
  }

  function injectButton() {
    if (document.getElementById(BTN_ID)) return;
    if (!getScoreId()) return;

    const btn = acCreateGlassButton(BTN_ID, IDLE_LABEL);
    btn.addEventListener('click', () => importScore(btn));
    document.body.appendChild(btn);
  }

  // Show the button only on a score page while the app answers /api/health,
  // and take it away again when the app is closed.
  async function syncButton() {
    if (syncing || busy) return;
    syncing = true;

    try {
      const existing = document.getElementById(BTN_ID);

      if (!getScoreId()) {
        if (existing) existing.remove();
        return;
      }

      const alive = await isAppRunning();
      const current = document.getElementById(BTN_ID);

      if (alive && !current) {
        injectButton();
      } else if (!alive && current && !busy) {
        current.remove();
      }
    } finally {
      syncing = false;
    }
  }

  function boot() {
    syncButton();

    // MuseScore is a SPA: re-check after client-side navigation
    let lastPath = location.pathname;
    setInterval(() => {
      if (location.pathname !== lastPath) {
        lastPath = location.pathname;
        if (!busy) {
          const old = document.getElementById(BTN_ID);
          if (old) old.remove();
        }
        syncButton();
      }
    }, 1500);

    // Appear/disappear as the app is started or closed
    setInterval(syncButton, HEALTH_INTERVAL);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
