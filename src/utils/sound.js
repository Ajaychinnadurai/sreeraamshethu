/**
 * Notification sound utility using the Web Audio API.
 * Generates a pleasant two-tone chime — no external audio files needed.
 */

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (browsers require user gesture first)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a short, pleasant notification chime.
 * Two-tone ascending chime (E5 → A5) with gentle attack/decay.
 * ~400ms duration, low volume — professional and unobtrusive.
 */
export function playNotificationSound() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') return;

    const now = ctx.currentTime;

    // --- First tone (E5 ~ 659 Hz) ---
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.12, now + 0.04);   // quick fade in
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18); // fast decay
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.18);

    // --- Second tone (A5 ~ 880 Hz) — starts after first tone peaks ---
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.10, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.38);
  } catch (e) {
    // Fail silently — audio is non-critical
    console.debug('Notification sound unavailable:', e.message);
  }
}

/**
 * Play a soft "pop" sound for less important notifications.
 * ~100ms, very subtle.
 */
export function playPopSound() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.10);
  } catch (e) {
    // Fail silently
  }
}
