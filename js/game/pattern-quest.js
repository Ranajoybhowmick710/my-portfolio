import { getAudioContext, playTone } from '../audio/procedural-audio.js';
import { readStorage, writeStorage } from '../state/storage.js';

const highScoreKey = 'ranajoy-portfolio:pattern-quest-best:v1';
const gameDuration = 30;
const finalLevel = 8;
const sequencePause = 620;
const symbolNames = ['leaf', 'star', 'ocean', 'sun'];
const symbolFrequencies = { leaf: 392, star: 523, ocean: 330, sun: 659 };

export function initPatternQuest() {
  const openButton = document.querySelector('[data-quest-open]');
  const modal = document.querySelector('[data-quest-modal]');
  const backdrop = document.querySelector('[data-quest-backdrop]');
  const closeButton = document.querySelector('[data-quest-close]');
  const startButton = document.querySelector('[data-quest-start]');
  const restartButton = document.querySelector('[data-quest-restart]');
  const pauseButton = document.querySelector('[data-quest-pause]');
  const soundButton = document.querySelector('[data-quest-sound]');
  const intro = document.querySelector('[data-quest-intro]');
  const game = document.querySelector('[data-quest-game]');
  const symbols = [...document.querySelectorAll('[data-quest-symbol]')];
  const result = document.querySelector('[data-quest-result]');
  const message = document.querySelector('[data-quest-message]');
  const scoreElement = document.querySelector('[data-quest-score]');
  const levelElement = document.querySelector('[data-quest-level]');
  const bestElement = document.querySelector('[data-quest-best]');
  const timeElement = document.querySelector('[data-quest-time]');
  const resultKicker = document.querySelector('[data-quest-result-kicker]');
  const resultTitle = document.querySelector('[data-quest-result-title]');
  const resultCopy = document.querySelector('[data-quest-result-copy]');
  if (!openButton || !modal || !backdrop || !closeButton || !startButton || !restartButton || !pauseButton ||
    !soundButton || !intro || !game || !result || !message || !scoreElement || !levelElement ||
    !bestElement || !timeElement || !resultKicker || !resultTitle || !resultCopy || symbols.length !== 4) return;

  let sequence = [];
  let inputIndex = 0;
  let score = 0;
  let level = 1;
  let bestScore = getBestScore();
  let secondsLeft = gameDuration;
  let isPlaying = false;
  let isPaused = false;
  let isShowingSequence = false;
  let soundEnabled = false;
  let lastFocus;
  let tickTimer;
  let sequenceTimer;
  let sequenceStep = 0;
  let lastTickAt;
  let audioContext;

  function getBestScore() {
    const raw = readStorage(highScoreKey, value => /^\d+$/.test(value), '0');
    return Number.parseInt(raw, 10) || 0;
  }

  function setText(element, value) {
    element.textContent = String(value);
  }

  function updateHud() {
    setText(scoreElement, score);
    setText(levelElement, level);
    setText(bestElement, bestScore);
    setText(timeElement, secondsLeft);
  }

  function setMessage(text) {
    setText(message, text);
  }

  function playGameTone(symbol, duration = .12) {
    if (!soundEnabled) return;
    audioContext ||= getAudioContext();
    if (!audioContext) {
      soundEnabled = false;
      soundButton.setAttribute('aria-pressed', 'false');
      soundButton.textContent = 'Sound off';
      return;
    }
    if (audioContext.state === 'suspended') audioContext.resume();
    playTone(audioContext, symbolFrequencies[symbol] || 440, duration, .055, 'sine');
  }

  function clearSequenceTimer() {
    window.clearTimeout(sequenceTimer);
    sequenceTimer = undefined;
  }

  function clearTimers() {
    window.clearInterval(tickTimer);
    clearSequenceTimer();
    tickTimer = undefined;
  }

  function setSymbolsDisabled(disabled) {
    symbols.forEach(symbol => { symbol.disabled = disabled; });
  }

  function highlightSymbol(symbolName) {
    const symbol = symbols.find(item => item.dataset.questSymbol === symbolName);
    if (!symbol) return;
    symbol.classList.add('is-highlighted');
    playGameTone(symbolName, .16);
    window.setTimeout(() => symbol.classList.remove('is-highlighted'), 300);
  }

  function showNextSequenceSymbol() {
    if (!isPlaying || isPaused) return;
    if (sequenceStep >= sequence.length) {
      isShowingSequence = false;
      inputIndex = 0;
      setSymbolsDisabled(false);
      setMessage(`Repeat the ${sequence.length}-symbol pattern.`);
      pauseButton.disabled = false;
      return;
    }
    isShowingSequence = true;
    setSymbolsDisabled(true);
    highlightSymbol(sequence[sequenceStep]);
    sequenceStep += 1;
    sequenceTimer = window.setTimeout(showNextSequenceSymbol, sequencePause);
  }

  function showSequence() {
    clearSequenceTimer();
    sequenceStep = 0;
    setSymbolsDisabled(true);
    pauseButton.disabled = true;
    setMessage('Watch the pattern.');
    sequenceTimer = window.setTimeout(showNextSequenceSymbol, 360);
  }

  function randomSymbol() {
    return symbolNames[Math.floor(Math.random() * symbolNames.length)];
  }

  function startRound() {
    sequence.push(randomSymbol());
    showSequence();
  }

  function finishGame(reason) {
    if (!isPlaying) return;
    clearTimers();
    isPlaying = false;
    isPaused = false;
    lastTickAt = Date.now();
    isShowingSequence = false;
    setSymbolsDisabled(true);
    pauseButton.disabled = true;
    const isNewBest = score > bestScore;
    if (isNewBest) {
      bestScore = score;
      writeStorage(highScoreKey, String(bestScore));
    }
    updateHud();
    setText(resultKicker, reason === 'victory' ? 'The pattern master' : 'The spell fades');
    setText(resultTitle, reason === 'victory' ? 'Quest complete' : 'Game over');
    setText(resultCopy, `${reason === 'timeout' ? 'Time ran out' : 'The sequence broke'} at level ${level}. You scored ${score} point${score === 1 ? '' : 's'}${isNewBest ? ' — a new best!' : '.'}`);
    result.hidden = false;
    setMessage('The quest has ended.');
    playGameTone(reason === 'victory' ? 'sun' : 'ocean', .24);
  }

  function beginGame() {
    clearTimers();
    sequence = [];
    inputIndex = 0;
    score = 0;
    level = 1;
    secondsLeft = gameDuration;
    isPlaying = true;
    isPaused = false;
    result.hidden = true;
    intro.hidden = true;
    game.hidden = false;
    updateHud();
    setSymbolsDisabled(true);
    pauseButton.disabled = true;
    pauseButton.textContent = 'Pause';
    startRound();
    lastTickAt = Date.now();
    tickTimer = window.setInterval(() => {
      if (!isPlaying || isPaused) return;
      const now = Date.now();
      if (now - lastTickAt < 1000) return;
      secondsLeft = Math.max(0, secondsLeft - Math.floor((now - lastTickAt) / 1000));
      lastTickAt = now;
      updateHud();
      if (secondsLeft === 0) finishGame('timeout');
    }, 250);
  }

  function pauseGame() {
    if (!isPlaying || isShowingSequence) return;
    isPaused = true;
    clearSequenceTimer();
    lastTickAt = Date.now();
    setSymbolsDisabled(true);
    pauseButton.textContent = 'Resume';
    setMessage('Quest paused.');
  }

  function resumeGame() {
    if (!isPlaying || !isPaused) return;
    isPaused = false;
    pauseButton.textContent = 'Pause';
    setSymbolsDisabled(false);
    setMessage(`Repeat the ${sequence.length}-symbol pattern.`);
  }

  function handleSymbol(symbol) {
    if (!isPlaying || isPaused || isShowingSequence) return;
    const expected = sequence[inputIndex];
    if (symbol.dataset.questSymbol !== expected) {
      playGameTone('ocean', .18);
      finishGame('mistake');
      return;
    }
    symbol.classList.add('is-correct');
    window.setTimeout(() => symbol.classList.remove('is-correct'), 260);
    playGameTone(symbol.dataset.questSymbol);
    inputIndex += 1;
    if (inputIndex < sequence.length) return;
    score += level * 10;
    level += 1;
    updateHud();
    if (level > finalLevel) {
      finishGame('victory');
      return;
    }
    setMessage('Pattern remembered. The next one grows.');
    playGameTone('sun', .2);
    setSymbolsDisabled(true);
    pauseButton.disabled = true;
    sequenceTimer = window.setTimeout(startRound, 700);
  }

  function closeQuest() {
    clearTimers();
    isPlaying = false;
    isPaused = false;
    isShowingSequence = false;
    modal.hidden = true;
    document.body.classList.remove('quest-open');
    intro.hidden = false;
    game.hidden = true;
    result.hidden = true;
    setSymbolsDisabled(true);
    if (lastFocus instanceof HTMLElement && document.contains(lastFocus)) lastFocus.focus();
  }

  function openQuest() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('quest-open');
    updateHud();
    closeButton.focus();
  }

  openButton.addEventListener('click', openQuest);
  closeButton.addEventListener('click', closeQuest);
  backdrop.addEventListener('click', closeQuest);
  startButton.addEventListener('click', beginGame);
  restartButton.addEventListener('click', beginGame);
  pauseButton.addEventListener('click', () => (isPaused ? resumeGame() : pauseGame()));
  symbols.forEach(symbol => symbol.addEventListener('click', () => handleSymbol(symbol)));
  soundButton.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
    soundButton.textContent = soundEnabled ? 'Sound on' : 'Sound off';
    if (soundEnabled) playGameTone('star');
  });
  document.addEventListener('keydown', event => {
    if (modal.hidden) return;
    if (event.key === 'Escape') {
      closeQuest();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...modal.querySelectorAll('button:not([disabled]), [tabindex="0"], input:not([disabled])')]
      .filter(element => !element.closest('[hidden]'));
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
