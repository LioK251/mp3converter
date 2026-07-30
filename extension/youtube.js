// YouTube / TikTok → AudioConverter
//
// Floating button on video pages. Click hands the URL to the local app, which
// downloads the audio and runs the Transkun transcription; progress is polled
// through the service worker so the request never hits a CORS wall.

(function () {
  'use strict';

  const BTN_ID = 'audioconverter-convert-btn';
  const IDLE_LABEL = '⬇ MIDI → AudioConverter';
  const POLL_INTERVAL = 2000;
  const MAX_POLLS = 900; // 2s each — 30 min, same ceiling as the web UI
  const HEALTH_INTERVAL = 3000;

  // A conversion in flight must survive a health-check blip
  let busy = false;
  let syncing = false;

  function isVideoPage() {
    const { hostname, pathname, search } = location;

    if (hostname.endsWith('youtube.com')) {
      return (pathname === '/watch' && /[?&]v=/.test(search)) || pathname.startsWith('/shorts/');
    }
    if (hostname.endsWith('youtu.be')) {
      return pathname.length > 1;
    }
    if (hostname.endsWith('tiktok.com')) {
      // Short links carry the id in the path; full links are /@user/video/<id>
      if (hostname.startsWith('vm.') || hostname.startsWith('vt.')) {
        return pathname.length > 1;
      }
      return /\/video\/\d+/.test(pathname);
    }
    return false;
  }

  function getVideoUrl() {
    const { hostname, pathname, search } = location;

    if (hostname.endsWith('youtube.com') && pathname === '/watch') {
      const id = new URLSearchParams(search).get('v');
      return id ? `https://www.youtube.com/watch?v=${id}` : location.href.split('&')[0];
    }
    return location.href.split('?')[0];
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

  function resetLater(btn, delay) {
    setTimeout(() => {
      setState(btn, IDLE_LABEL, '');
      btn.disabled = false;
      btn.title = '';
      busy = false;
      syncButton();
    }, delay);
  }

  async function isAppRunning() {
    try {
      const res = await sendToWorker({ action: 'ping' }, 6000);
      return !!(res && res.success && res.alive);
    } catch (err) {
      return false;
    }
  }

  async function convert(btn) {
    btn.disabled = true;
    busy = true;
    setState(btn, 'Starting…', 'busy');

    try {
      const started = await sendToWorker({ action: 'startConvert', url: getVideoUrl() });
      if (!started || !started.success) {
        throw new Error((started && started.error) || 'Could not start the conversion');
      }

      const taskId = started.task_id;
      let polls = 0;

      while (polls < MAX_POLLS) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL));
        polls++;

        const status = await sendToWorker({ action: 'convertStatus', taskId });
        if (!status || !status.success) {
          throw new Error((status && status.error) || 'Lost contact with the app');
        }

        const state = status.data || {};

        if (state.status === 'completed') {
          setState(btn, '✓ Added to app', 'done');
          btn.title = state.midi_name || '';
          resetLater(btn, 5000);
          return;
        }
        if (state.status === 'error') {
          throw new Error(state.error || 'Conversion failed');
        }
        if (state.status === 'cancelled') {
          setState(btn, 'Cancelled', 'error');
          resetLater(btn, 4000);
          return;
        }

        setState(btn, state.progress || 'Processing…', 'busy');
      }

      throw new Error('Timed out after 30 minutes');
    } catch (err) {
      console.error('AudioConverter:', err);
      setState(btn, '✕ ' + err.message, 'error');
      btn.title = err.message;
      resetLater(btn, 8000);
    }
  }

  function injectButton() {
    if (document.getElementById(BTN_ID)) return;
    if (!isVideoPage()) return;

    const btn = acCreateGlassButton(BTN_ID, IDLE_LABEL);
    btn.addEventListener('click', () => convert(btn));
    document.body.appendChild(btn);
  }

  // Show the button only on a video page while the app answers /api/health,
  // and take it away again when the app is closed.
  async function syncButton() {
    if (syncing || busy) return;
    syncing = true;

    try {
      const existing = document.getElementById(BTN_ID);
      const onVideoPage = isVideoPage();

      if (!onVideoPage) {
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

    // YouTube and TikTok are SPAs: re-check after client-side navigation
    let lastUrl = location.href;
    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
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
