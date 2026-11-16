import { readStorage, writeStorage } from '../state/storage.js';

const highScoreKey = 'ranajoy-portfolio:game-high-score:v1';
const gameDuration = 20;
const objectGlyphs = ['✦', '✿', '❋', '✧'];

export function initSecretGarden() {
  const trigger = document.querySelector('[data-garden-trigger]');
  const modal = document.querySelector('[data-garden-modal]');
  const backdrop = document.querySelector('[data-garden-backdrop]');
  const closeButton = document.querySelector('[data-garden-close]');
  const startButton = document.querySelector('[data-garden-start]');
  const restartButton = document.querySelector('[data-garden-restart]');
  const soundButton = document.querySelector('[data-garden-sound]');
  const intro = document.querySelector('[data-garden-intro]');
  const game = document.querySelector('[data-garden-game]');
  const field = document.querySelector('[data-garden-field]');
  const complete = document.querySelector('[data-garden-complete]');
  const scoreElement = document.querySelector('[data-garden-score]');
  const timeElement = document.querySelector('[data-garden-time]');
  const bestElement = document.querySelector('[data-garden-best]');
  const resultElement = document.querySelector('[data-garden-result]');
  const resultCopy = document.querySelector('[data-garden-result-copy]');
  if (!trigger || !modal || !backdrop || !closeButton || !startButton || !restartButton || !soundButton ||
    !intro || !game || !field || !complete || !scoreElement || !timeElement || !bestElement || !resultElement || !resultCopy) return;

  let score = 0;
  let bestScore;
  let secondsLeft = gameDuration;
  let isPlaying = false;
  let spawnTimer;
  let tickTimer;
  const removalTimers = new Set();
  let lastFocus;
  let soundEnabled = false;
  let audioContext;

  const setText = (element, value) => { element.textContent = String(value); };
  const getBestScore = () => {
    const raw = readStorage(highScoreKey, value => /^\d+$/.test(value), '0');
    return Number.parseInt(raw, 10) || 0;
  };
  const updateHud = () => {
    setText(scoreElement, score);
    setText(timeElement, secondsLeft);
    setText(bestElement, bestScore);
  };
  const clearGame = () => {
    window.clearInterval(spawnTimer);
    window.clearInterval(tickTimer);
    spawnTimer = undefined;
    tickTimer = undefined;
    removalTimers.forEach(timer => window.clearTimeout(timer));
    removalTimers.clear();
    field.replaceChildren();
    isPlaying = false;
  };
  const playTone = (frequency, duration = .1) => {
    if (!soundEnabled || !('AudioContext' in window || 'webkitAudioContext' in window)) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContext ||= new AudioContext();
      if (audioContext.state === 'suspended') audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.08, audioContext.currentTime + .02);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch {
      soundEnabled = false;
      soundButton.setAttribute('aria-pressed', 'false');
      soundButton.textContent = 'Sound off';
    }
  };
  const collect = object => {
    if (!isPlaying) return;
    score += 1;
    object.classList.add('is-collected');
    object.disabled = true;
    const removalTimer = window.setTimeout(() => {
      removalTimers.delete(removalTimer);
      object.remove();
    }, 180);
    removalTimers.add(removalTimer);
    updateHud();
    playTone(520 + score * 18, .08);
  };
  const spawnObject = () => {
    if (!isPlaying) return;
    const object = document.createElement('button');
    const maxX = Math.max(0, field.clientWidth - 64);
    const maxY = Math.max(0, field.clientHeight - 64);
    object.className = 'garden-object';
    object.type = 'button';
    object.textContent = objectGlyphs[Math.floor(Math.random() * objectGlyphs.length)];
    object.setAttribute('aria-label', 'Collect glowing garden petal');
    object.style.left = `${Math.round(Math.random() * maxX)}px`;
    object.style.top = `${Math.round(Math.random() * maxY)}px`;
    object.addEventListener('click', () => collect(object), { once: true });
    field.append(object);
  };
  const finishGame = () => {
    if (!isPlaying) return;
    clearGame();
    const isNewBest = score > bestScore;
    if (isNewBest) {
      bestScore = score;
      writeStorage(highScoreKey, String(bestScore));
    }
    updateHud();
    setText(resultElement, isNewBest ? 'A new garden record' : 'The garden is resting');
    setText(resultCopy, `You found ${score} glowing ${score === 1 ? 'petal' : 'petals'}. Your best is ${bestScore}.`);
    complete.hidden = false;
    playTone(740, .25);
  };
  const startGame = () => {
    clearGame();
    score = 0;
    secondsLeft = gameDuration;
    updateHud();
    intro.hidden = true;
    game.hidden = false;
    complete.hidden = true;
    isPlaying = true;
    field.focus();
    spawnObject();
    spawnTimer = window.setInterval(() => {
      if (field.children.length < 7) spawnObject();
    }, 850);
    const startedAt = Date.now();
    tickTimer = window.setInterval(() => {
      secondsLeft = Math.max(0, gameDuration - Math.floor((Date.now() - startedAt) / 1000));
      updateHud();
      if (secondsLeft === 0) finishGame();
    }, 100);
  };
  const closeGarden = () => {
    clearGame();
    modal.hidden = true;
    document.body.classList.remove('garden-open');
    intro.hidden = false;
    game.hidden = true;
    complete.hidden = true;
    if (lastFocus instanceof HTMLElement && document.contains(lastFocus)) lastFocus.focus();
  };
  const openGarden = () => {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('garden-open');
    updateHud();
    closeButton.focus();
    playTone(320, .18);
  };

  bestScore = getBestScore();
  updateHud();
  trigger.addEventListener('click', openGarden);
  closeButton.addEventListener('click', closeGarden);
  backdrop.addEventListener('click', closeGarden);
  startButton.addEventListener('click', startGame);
  restartButton.addEventListener('click', startGame);
  soundButton.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
    soundButton.textContent = soundEnabled ? 'Sound on' : 'Sound off';
    if (soundEnabled) playTone(420, .1);
  });
  document.addEventListener('keydown', event => {
    if (modal.hidden) return;
    if (event.key === 'Escape') {
      closeGarden();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...modal.querySelectorAll('button:not([disabled]), [tabindex="0"]')].filter(element => !element.closest('[hidden]'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}
