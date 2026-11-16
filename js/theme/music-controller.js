import { getAudioContext } from '../audio/procedural-audio.js';
import { readStorage, writeStorage } from '../state/storage.js';

const musicMutedKey = 'ranajoy-portfolio:music-muted:v1';
const musicVolumeKey = 'ranajoy-portfolio:music-volume:v1';
const defaultMusicVolume = '.78';
const profiles = {
  'botanical-morning': { name: 'Botanical Morning', tempo: 76, wave: 'sine', notes: [60, 64, 67, 69, 67, 64, 62, 64] },
  'tropical-paradise': { name: 'Tropical Paradise', tempo: 92, wave: 'triangle', notes: [60, 64, 67, 72, 67, 64, 62, 64] },
  'ocean-breeze': { name: 'Ocean Breeze', tempo: 66, wave: 'sine', notes: [57, 60, 64, 67, 64, 60, 59, 60] },
  'sunset-horizon': { name: 'Sunset Horizon', tempo: 70, wave: 'triangle', notes: [55, 59, 62, 67, 62, 59, 57, 59] },
  'midnight-forest': { name: 'Midnight Forest', tempo: 58, wave: 'sine', notes: [52, 55, 59, 62, 59, 55, 50, 55] },
  'starry-sky': { name: 'Starry Sky', tempo: 62, wave: 'sine', notes: [60, 63, 67, 74, 67, 63, 62, 67] },
  'starry-night': { name: 'Starry Night', tempo: 60, wave: 'sine', notes: [55, 58, 62, 69, 62, 58, 57, 62] }
};

const isBoolean = value => value === 'true' || value === 'false';
const isVolume = value => Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 1;
const midiToFrequency = midi => 440 * (2 ** ((midi - 69) / 12));

export function initMusicController(initialTheme) {
  const toggleButtons = [...document.querySelectorAll('[data-music-toggle]')];
  const muteButtons = [...document.querySelectorAll('[data-music-mute]')];
  const volumeInputs = [...document.querySelectorAll('[data-music-volume]')];
  const toggleLabels = [...document.querySelectorAll('[data-music-toggle-label]')];
  const playingIndicators = [...document.querySelectorAll('[data-music-playing-indicator]')];
  const statusElements = [...document.querySelectorAll('[data-music-status]')];
  let currentTheme = initialTheme;
  let currentBackground = 'theme';
  let currentProfile = profiles[initialTheme] || profiles['botanical-morning'];
  let isPlaying = false;
  let isMuted = readStorage(musicMutedKey, isBoolean, 'true') === 'true';
  let volume = Number(readStorage(musicVolumeKey, isVolume, defaultMusicVolume));
  let context;
  let musicGain;
  let schedulerTimer;
  let nextNoteTime = 0;
  let noteIndex = 0;
  const activeNodes = new Set();

  const setStatus = message => statusElements.forEach(element => { element.textContent = message; });
  const setMusicGain = value => {
    if (!musicGain || !context) return;
    musicGain.gain.cancelScheduledValues(context.currentTime);
    musicGain.gain.setTargetAtTime(value, context.currentTime, .04);
  };
  const updateControls = () => {
    toggleButtons.forEach(button => {
      button.setAttribute('aria-label', isPlaying ? 'Pause theme music' : 'Play theme music');
      button.setAttribute('aria-pressed', String(isPlaying));
    });
    toggleLabels.forEach(label => { label.textContent = isPlaying ? 'Pause' : 'Play'; });
    playingIndicators.forEach(indicator => { indicator.hidden = !isPlaying; });
    muteButtons.forEach(button => {
      button.textContent = isMuted ? 'Muted' : 'Unmuted';
      button.setAttribute('aria-label', isMuted ? 'Unmute theme music' : 'Mute theme music');
      button.setAttribute('aria-pressed', String(isMuted));
    });
    volumeInputs.forEach(input => { input.value = String(volume); });
  };
  const createGraph = () => {
    context = getAudioContext();
    if (!context) return false;
    musicGain = context.createGain();
    musicGain.gain.value = 0;
    musicGain.connect(context.destination);
    return true;
  };
  const scheduleNote = (profile, time) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const frequency = midiToFrequency(profile.notes[noteIndex % profile.notes.length]);
    oscillator.type = profile.wave;
    oscillator.frequency.setValueAtTime(frequency, time);
    gain.gain.setValueAtTime(.0001, time);
    gain.gain.exponentialRampToValueAtTime(.045, time + .08);
    gain.gain.exponentialRampToValueAtTime(.0001, time + 1.8);
    oscillator.connect(gain).connect(musicGain);
    oscillator.start(time);
    oscillator.stop(time + 1.9);
    activeNodes.add(oscillator);
    oscillator.addEventListener('ended', () => activeNodes.delete(oscillator), { once: true });
    noteIndex += 1;
  };
  const schedule = () => {
    if (!isPlaying || !context) return;
    while (nextNoteTime < context.currentTime + .28) {
      scheduleNote(currentProfile, nextNoteTime);
      nextNoteTime += 60 / currentProfile.tempo;
    }
    schedulerTimer = window.setTimeout(schedule, 80);
  };
  const stop = () => {
    window.clearTimeout(schedulerTimer);
    schedulerTimer = undefined;
    isPlaying = false;
    activeNodes.forEach(node => {
      try { node.stop(); } catch { /* Nodes may already have ended. */ }
    });
    activeNodes.clear();
    setMusicGain(0);
    updateControls();
    setStatus('Music off');
  };
  const play = () => {
    if (isPlaying) return;
    if (!context && !createGraph()) {
      setStatus('Audio is unavailable in this browser.');
      return;
    }
    if (context.state === 'suspended') context.resume();
    isPlaying = true;
    nextNoteTime = context.currentTime + .08;
    setMusicGain(isMuted ? 0 : volume);
    updateControls();
    setStatus(`Playing ${currentProfile.name}`);
    schedule();
  };
  const pause = () => {
    if (!isPlaying) return;
    window.clearTimeout(schedulerTimer);
    schedulerTimer = undefined;
    isPlaying = false;
    setMusicGain(0);
    updateControls();
    setStatus('Music paused');
  };
  const setProfile = key => {
    currentProfile = profiles[key] || profiles['botanical-morning'];
    updateControls();
    setStatus(isPlaying ? `Playing ${currentProfile.name}` : 'Music off');
  };
  const setTheme = theme => {
    currentTheme = theme;
    if (currentBackground === 'theme') setProfile(theme);
  };
  const setBackground = background => {
    currentBackground = background;
    setProfile(background === 'starry-sky' ? 'starry-sky' : currentTheme);
  };

  toggleButtons.forEach(button => button.addEventListener('click', () => (isPlaying ? pause() : play())));
  muteButtons.forEach(button => button.addEventListener('click', () => {
    isMuted = !isMuted;
    writeStorage(musicMutedKey, String(isMuted));
    setMusicGain(isMuted ? 0 : volume);
    updateControls();
    setStatus(isMuted ? 'Music muted' : (isPlaying ? `Playing ${currentProfile.name}` : 'Music unmuted'));
  }));
  volumeInputs.forEach(input => input.addEventListener('input', event => {
    volume = Number(event.target.value);
    writeStorage(musicVolumeKey, String(volume));
    if (!isMuted) setMusicGain(volume);
  }));

  updateControls();
  setStatus('Music off');

  return { setTheme, setBackground, stop };
}
