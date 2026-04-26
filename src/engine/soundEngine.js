// Lightweight sound engine using Web Audio API
// No external dependencies needed

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone({ frequency = 440, type = 'sine', duration = 0.15, volume = 0.08, delay = 0 }) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);

    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  } catch {
    // Silently fail if audio is blocked
  }
}

export function playSelect() {
  playTone({ frequency: 520, type: 'sine', duration: 0.1, volume: 0.06 });
}

export function playTransition() {
  playTone({ frequency: 360, type: 'triangle', duration: 0.25, volume: 0.04 });
  playTone({ frequency: 480, type: 'triangle', duration: 0.3, volume: 0.03, delay: 0.08 });
}

export function playChime() {
  // Ascending major triad
  playTone({ frequency: 523.25, type: 'sine', duration: 0.4, volume: 0.08 });
  playTone({ frequency: 659.25, type: 'sine', duration: 0.4, volume: 0.07, delay: 0.1 });
  playTone({ frequency: 783.99, type: 'sine', duration: 0.5, volume: 0.06, delay: 0.2 });
  playTone({ frequency: 1046.5, type: 'sine', duration: 0.6, volume: 0.05, delay: 0.35 });
}

export function playBack() {
  playTone({ frequency: 400, type: 'sine', duration: 0.12, volume: 0.05 });
  playTone({ frequency: 320, type: 'sine', duration: 0.15, volume: 0.04, delay: 0.06 });
}
