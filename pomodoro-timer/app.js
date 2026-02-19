/**
 * Neumorphic Glass Pomodoro Timer — app.js
 */

// ── Circumference for SVG circle r=100: 2π×100 ≈ 628.318
const CIRC = 2 * Math.PI * 100;

// ── State ──────────────────────────────────────────────
const S = {
  mode: 'pomodoro',
  running: false,
  timeLeft: 0,
  totalTime: 0,
  timer: null,
  sessions: 0,
  cfg: {
    pomodoroMin: 25,
    shortMin: 5,
    longMin: 15,
    autoBreak: false,
    soundAlert: true,
  }
};

const DURATIONS = {
  pomodoro: () => S.cfg.pomodoroMin * 60,
  short:    () => S.cfg.shortMin * 60,
  long:     () => S.cfg.longMin * 60,
};

const LABELS = {
  pomodoro: 'Time to Focus',
  short: 'Short Break',
  long: 'Long Break',
};

const DONE_MSG = {
  pomodoro: '🍅 Focus session complete!',
  short: '☕ Break over — back to work!',
  long: '✨ Long break done. Ready?',
};

// ── DOM Helpers ──────────────────────────────────────────
const el = id => document.getElementById(id);

// Cache DOM refs after page load
let timerTime, timerLabel, progressArc, ringOuter,
    startBtn, iconPlay, iconPause, dotsRow,
    taskInput, taskDisplay, overlay, toast;

function cacheDom() {
  timerTime   = el('timerTime');
  timerLabel  = el('timerLabel');
  progressArc = el('progressArc');
  ringOuter   = el('ringOuter');
  startBtn    = el('startBtn');
  iconPlay    = el('iconPlay');
  iconPause   = el('iconPause');
  dotsRow     = el('dotsRow');
  taskInput   = el('taskInput');
  taskDisplay = el('taskDisplay');
  overlay     = el('overlay');
  toast       = el('toast');
}

// ── Rendering ────────────────────────────────────────────
function fmt(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function updateArc() {
  const ratio = S.totalTime > 0 ? S.timeLeft / S.totalTime : 1;
  progressArc.style.strokeDasharray  = CIRC;
  progressArc.style.strokeDashoffset = CIRC * (1 - ratio);
}

function render() {
  timerTime.textContent = fmt(S.timeLeft);
  document.title = `${fmt(S.timeLeft)} — Pomodoro`;
  updateArc();
}

function refreshDots() {
  const dots = dotsRow.querySelectorAll('.dot');
  const count = S.sessions % 4;
  dots.forEach((d, i) => d.classList.toggle('done', i < count));
}

// ── Toast ────────────────────────────────────────────────
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._tid);
  toast._tid = setTimeout(() => toast.classList.remove('show'), 3200);
}

// ── Audio ────────────────────────────────────────────────
function chime() {
  if (!S.cfg.soundAlert) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [[523, 0], [659, 0.2], [784, 0.4]].forEach(([freq, when]) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + when);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + when + 0.7);
      osc.start(ctx.currentTime + when);
      osc.stop(ctx.currentTime + when + 0.7);
    });
  } catch (e) { /* audio unavailable */ }
}

// ── Mode ─────────────────────────────────────────────────
function switchMode(mode) {
  stopTimer();
  S.mode      = mode;
  S.timeLeft  = DURATIONS[mode]();
  S.totalTime = S.timeLeft;
  timerLabel.textContent = LABELS[mode];
  document.body.className = `mode-${mode}`;
  document.querySelectorAll('.mode-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.mode === mode));
  timerTime.classList.remove('time-pulsing');
  render();
}

// ── Timer ────────────────────────────────────────────────
function startTimer() {
  if (S.timeLeft <= 0) {
    S.timeLeft  = DURATIONS[S.mode]();
    S.totalTime = S.timeLeft;
  }
  S.running = true;
  iconPlay.style.display  = 'none';
  iconPause.style.display = 'block';
  startBtn.setAttribute('aria-label', 'Pause');
  ringOuter.classList.add('running');
  timerTime.classList.add('time-pulsing');

  S.timer = setInterval(() => {
    S.timeLeft--;
    render();
    if (S.timeLeft <= 0) {
      clearInterval(S.timer);
      S.running = false;
      onDone();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(S.timer);
  S.running = false;
  if (!iconPlay) return; // called before DOM cached
  iconPlay.style.display  = 'block';
  iconPause.style.display = 'none';
  startBtn.setAttribute('aria-label', 'Start');
  ringOuter.classList.remove('running');
  timerTime.classList.remove('time-pulsing');
}

function resetTimer() {
  stopTimer();
  S.timeLeft  = DURATIONS[S.mode]();
  S.totalTime = S.timeLeft;
  render();
}

function onDone() {
  stopTimer();
  chime();
  showToast(DONE_MSG[S.mode]);

  if (S.mode === 'pomodoro') {
    S.sessions++;
    refreshDots();
    const next = S.sessions % 4 === 0 ? 'long' : 'short';
    if (S.cfg.autoBreak) {
      setTimeout(() => { switchMode(next); startTimer(); }, 1200);
    } else {
      setTimeout(() => switchMode(next), 900);
    }
  } else {
    if (S.cfg.autoBreak) {
      setTimeout(() => { switchMode('pomodoro'); startTimer(); }, 1200);
    } else {
      setTimeout(() => switchMode('pomodoro'), 900);
    }
  }
}

// ── Task ─────────────────────────────────────────────────
function syncTask() {
  const v = taskInput.value.trim();
  taskDisplay.textContent = v ? `📌 ${v}` : '';
  taskDisplay.classList.toggle('visible', !!v);
}

// ── Settings ─────────────────────────────────────────────
function openSettings() {
  el('pomodoroMin').value  = S.cfg.pomodoroMin;
  el('shortMin').value     = S.cfg.shortMin;
  el('longMin').value      = S.cfg.longMin;
  el('autoBreak').checked  = S.cfg.autoBreak;
  el('soundAlert').checked = S.cfg.soundAlert;
  overlay.classList.add('open');
}

function closeOverlay() { overlay.classList.remove('open'); }

function applySettings() {
  const p = parseInt(el('pomodoroMin').value, 10);
  const s = parseInt(el('shortMin').value, 10);
  const l = parseInt(el('longMin').value, 10);
  if ([p, s, l].some(n => isNaN(n) || n < 1)) {
    showToast('⚠️ Values must be at least 1');
    return;
  }
  S.cfg.pomodoroMin = p;
  S.cfg.shortMin    = s;
  S.cfg.longMin     = l;
  S.cfg.autoBreak   = el('autoBreak').checked;
  S.cfg.soundAlert  = el('soundAlert').checked;
  try { localStorage.setItem('pomo_cfg', JSON.stringify(S.cfg)); } catch(e) {}
  closeOverlay();
  resetTimer();
  showToast('Settings saved ✓');
}

// ── Persistence ───────────────────────────────────────────
function loadConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem('pomo_cfg') || 'null');
    if (saved && typeof saved === 'object') Object.assign(S.cfg, saved);
  } catch(e) {}
}

// ── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  cacheDom();
  loadConfig();
  switchMode('pomodoro');

  // Button events
  startBtn.addEventListener('click', () => S.running ? stopTimer() : startTimer());
  el('resetBtn').addEventListener('click', resetTimer);
  el('skipBtn').addEventListener('click', () => {
    stopTimer();
    const next = S.mode === 'pomodoro'
      ? (S.sessions % 4 === 0 ? 'long' : 'short')
      : 'pomodoro';
    switchMode(next);
  });

  // Mode tabs
  document.querySelectorAll('.mode-btn').forEach(b =>
    b.addEventListener('click', () => switchMode(b.dataset.mode)));

  // Task
  taskInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { taskInput.blur(); syncTask(); }
  });
  taskInput.addEventListener('blur', syncTask);

  // Settings
  el('settingsBtn').addEventListener('click', openSettings);
  el('closeBtn').addEventListener('click', closeOverlay);
  el('applyBtn').addEventListener('click', applySettings);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeOverlay(); });

  // Spinners
  document.querySelectorAll('.spin-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const inp = el(btn.dataset.field);
      let v = parseInt(inp.value, 10) || 1;
      v += parseInt(btn.dataset.dir, 10);
      inp.value = Math.max(1, Math.min(99, v));
    });
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (document.activeElement === taskInput) return;
    if (overlay.classList.contains('open')) return;
    if (e.code === 'Space') { e.preventDefault(); startBtn.click(); }
    if (e.code === 'KeyR')  { e.preventDefault(); resetTimer(); }
    if (e.code === 'Digit1') switchMode('pomodoro');
    if (e.code === 'Digit2') switchMode('short');
    if (e.code === 'Digit3') switchMode('long');
  });
});
