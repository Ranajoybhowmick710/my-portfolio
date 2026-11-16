import { readStorage, writeStorage } from '../state/storage.js';

const key = 'ranajoy-portfolio:guestbook:v1';

export function initGuestbook() {
  const form = document.querySelector('[data-guestbook-form]');
  const input = form?.querySelector('textarea');
  const notes = document.querySelector('[data-guestbook-notes]');
  const status = document.querySelector('[data-guestbook-status]');
  const count = document.querySelector('[data-character-count]');
  if (!form || !input || !notes || !status || !count) return;

  const getNotes = () => {
    const raw = readStorage(key, value => {
      try { return Array.isArray(JSON.parse(value)); } catch { return false; }
    }, '[]');
    try {
      const parsed = JSON.parse(raw);
      return parsed.filter(note => typeof note === 'string').slice(0, 6);
    } catch {
      return [];
    }
  };
  const render = items => {
    notes.replaceChildren(...items.map(text => {
      const note = document.createElement('p');
      note.className = 'guestbook-note';
      note.textContent = text;
      return note;
    }));
  };
  const current = getNotes();
  render(current);
  const updateCount = () => { count.textContent = `${input.value.length} / 160`; };
  input.addEventListener('input', updateCount);
  updateCount();
  form.addEventListener('submit', event => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) {
      status.textContent = 'Write a short note before adding it.';
      return;
    }
    const next = [text, ...getNotes()].slice(0, 6);
    writeStorage(key, JSON.stringify(next));
    render(next);
    input.value = '';
    updateCount();
    status.textContent = 'Your note was saved in this browser.';
  });
}
