# Ranajoy Portfolio

Static, framework-free portfolio foundation built with HTML5, CSS3, and JavaScript ES modules.

## Run locally

From this directory, serve the files over HTTP so ES modules and local assets work:

```powershell
python -m http.server 8765
```

Then open `http://127.0.0.1:8765/`.

## Current foundation

- Shared professional content in `js/content.js`
- Auto Theme plus six manual CSS themes
- Starry Night theme with a restrained star field; persisted Starry Sky background state remains compatible
- Four independent layout modes
- Versioned localStorage preferences for theme, background, layout, and music mute state
- Responsive semantic page shell and mobile navigation
- Enchanted Pattern Quest memory game with local high score and independent sound effects
- Procedural Web Audio music player with six original theme/background profiles
- Resume download/view actions
- Accessible Web3Forms contact validation with explicit unconfigured-key and network-error states
- Local-only guestbook using safe DOM text rendering
- Reduced-motion reveal behavior

The SECRET GARDEN is available as a subtle leaf discovery beside the hero portrait. It is a local-only, optional mini-game with a 20-second round, local high score, and sound disabled by default.

Enchanted Pattern Quest is available as a visible portfolio challenge. Players repeat progressively longer sequences of four glowing symbols, with score, timer, pause/resume, restart, game-over, victory, and locally persisted best-score behavior.

Starry Sky is an additional persisted background mode.

The header music controls generate original instrumental profiles with the Web Audio API for all six manual themes, including Starry Night. There is no standalone soundtrack panel. Music never autoplays, requires explicit activation, supports play/pause, mute, and volume controls, and safely reports unsupported audio environments. The new-user volume default is 78%, while saved visitor volume preferences are preserved.

Auto Theme resolves six periods using Asia/Kolkata time: Botanical Morning (05:00–09:00), Tropical Paradise (09:00–12:00), Ocean Breeze (12:00–15:00), Dusk Forest (15:00–18:00 using the Midnight Forest palette), Sunset Horizon (18:00–21:00), and Starry Night (21:00–05:00). The active automatic name is shown beside the selector, the schedule advances without a refresh, and manual theme choices remain active until Auto Theme is selected again.

## Contact configuration

This is a no-build static site, so it does not read `.env` files directly. The safe reference is `.env.example`, containing `VITE_WEB3FORMS_ACCESS_KEY=YOUR_ACCESS_KEY_HERE`. For local preview, put the actual value only in the ignored `config.local.js` file:

```js
window.__PORTFOLIO_CONFIG__ = Object.freeze({
  VITE_WEB3FORMS_ACCESS_KEY: 'paste-your-key-here'
});
```

The form submits to `https://api.web3forms.com/submit` with the access key, name, email, subject, and message. Never copy the exposed key from the legacy files. Restart the static preview server after changing `config.local.js`, then submit a real test message. The frontend key is an intentionally public integration key; do not treat it as a server secret.

## Content verification

`resume.pdf` is the source of truth for resume-backed facts. AcademiQ and Chromify are included because they were approved for this phase, but their cards are visibly marked for confirmation because their details are present in the legacy portfolio and not in the supplied resume.

