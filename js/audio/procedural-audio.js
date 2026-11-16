let sharedContext;

export function getAudioContext() {
  if (!('AudioContext' in window || 'webkitAudioContext' in window)) return null;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    sharedContext ||= new AudioContext();
    return sharedContext;
  } catch {
    return null;
  }
}

export function playTone(context, frequency, duration = .1, volume = .06, type = 'sine', offset = 0) {
  if (!context) return false;
  try {
    const start = context.currentTime + offset;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + .015);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + .02);
    return true;
  } catch {
    return false;
  }
}
