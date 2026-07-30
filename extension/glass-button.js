// Shared "liquid glass" button, matching the cards in the AudioConverter UI:
// translucent dark pane, blurred backdrop, thin light rim and a 2px lift on
// hover. Loaded before the page scripts, which share this isolated world.

const AC_GLASS_STYLE_ID = 'audioconverter-glass-style';

const AC_GLASS_CSS = `
@property --ac-sheen {
  syntax: '<percentage>';
  inherits: false;
  initial-value: -30%;
}

.ac-glass-btn {
  position: fixed !important;
  right: 18px !important;
  bottom: 18px !important;
  z-index: 2147483647 !important;

  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  box-sizing: border-box !important;
  margin: 0 !important;
  padding: 11px 18px !important;
  max-width: 280px !important;

  font: 600 13px/1.25 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif !important;
  letter-spacing: 0.01em !important;
  text-align: center !important;
  color: #e9edf5 !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45) !important;

  cursor: pointer !important;
  overflow: hidden !important;
  isolation: isolate !important;
  border-radius: 14px !important;

  /* Frosted pane: light gradient over the site's card tint */
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.04) 46%, rgba(255, 255, 255, 0.09)),
    rgba(31, 41, 55, 0.72) !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  -webkit-backdrop-filter: blur(18px) saturate(180%) !important;
  backdrop-filter: blur(18px) saturate(180%) !important;

  /* Outer depth + inner rim that reads as thick glass */
  box-shadow:
    0 8px 28px rgba(0, 0, 0, 0.42),
    0 2px 6px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.32),
    inset 0 -1px 0 rgba(0, 0, 0, 0.22),
    inset 0 0 22px rgba(255, 255, 255, 0.06) !important;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease !important;
}

/* Specular streak that sweeps across on hover */
.ac-glass-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(
    105deg,
    transparent var(--ac-sheen),
    rgba(255, 255, 255, 0.22) calc(var(--ac-sheen) + 14%),
    transparent calc(var(--ac-sheen) + 30%)
  );
  opacity: 0;
  transition: opacity 0.25s ease;
}

.ac-glass-btn:hover:not(:disabled) {
  transform: translateY(-2px) !important;
  border-color: rgba(168, 85, 247, 0.45) !important;
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.06) 46%, rgba(255, 255, 255, 0.12)),
    rgba(41, 52, 70, 0.76) !important;
  box-shadow:
    0 14px 36px rgba(0, 0, 0, 0.5),
    0 3px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(0, 0, 0, 0.24),
    inset 0 0 26px rgba(255, 255, 255, 0.09) !important;
}

.ac-glass-btn:hover:not(:disabled)::after {
  opacity: 1;
  animation: ac-glass-sweep 1.6s ease-out;
}

.ac-glass-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.985) !important;
  box-shadow:
    0 4px 14px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    inset 0 2px 10px rgba(0, 0, 0, 0.3) !important;
}

.ac-glass-btn:disabled {
  cursor: default !important;
}

/* Tints: the glass stays, only the colour behind it shifts */
.ac-glass-btn[data-tone='busy'] {
  border-color: rgba(96, 165, 250, 0.4) !important;
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.04) 46%, rgba(255, 255, 255, 0.09)),
    rgba(30, 58, 110, 0.68) !important;
}

.ac-glass-btn[data-tone='done'] {
  border-color: rgba(52, 211, 153, 0.45) !important;
  color: #d6ffee !important;
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.05) 46%, rgba(255, 255, 255, 0.1)),
    rgba(6, 78, 59, 0.7) !important;
}

.ac-glass-btn[data-tone='error'] {
  border-color: rgba(248, 113, 113, 0.45) !important;
  color: #ffe1e1 !important;
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.05) 46%, rgba(255, 255, 255, 0.1)),
    rgba(127, 29, 29, 0.7) !important;
}

/* Slow breathing glow while work is in progress */
.ac-glass-btn[data-tone='busy']::after {
  opacity: 1;
  animation: ac-glass-sweep 2.4s ease-in-out infinite;
}

@keyframes ac-glass-sweep {
  from { --ac-sheen: -30%; }
  to   { --ac-sheen: 110%; }
}

@media (prefers-reduced-motion: reduce) {
  .ac-glass-btn,
  .ac-glass-btn::after {
    transition: none !important;
    animation: none !important;
  }
}
`;

function acEnsureGlassStyles() {
  if (document.getElementById(AC_GLASS_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = AC_GLASS_STYLE_ID;
  style.textContent = AC_GLASS_CSS;
  // documentElement, not head: survives pages that rewrite <head>
  (document.head || document.documentElement).appendChild(style);
}

function acCreateGlassButton(id, label) {
  acEnsureGlassStyles();

  const btn = document.createElement('button');
  btn.id = id;
  btn.type = 'button';
  btn.className = 'ac-glass-btn';
  btn.dataset.tone = 'idle';
  btn.textContent = label;
  return btn;
}

// tone: '' | 'busy' | 'done' | 'error'
function acSetGlassState(btn, text, tone) {
  btn.textContent = text;
  btn.dataset.tone = tone || 'idle';
}
